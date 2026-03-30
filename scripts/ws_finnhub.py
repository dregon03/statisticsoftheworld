#!/usr/bin/env python3
"""
Finnhub WebSocket real-time quotes — stocks, crypto, forex, commodities.

Subscribes to 50 symbols (Finnhub free tier limit) via WebSocket.
Receives every trade in real-time and batch-writes to Supabase every 2 seconds.
Runs continuously during market hours via cron.

Requirements: pip install websocket-client psycopg2-binary
"""

import argparse
import datetime
import json
import os
import threading
import time
import psycopg2

try:
    import websocket
except ImportError:
    print("ERROR: pip install websocket-client")
    exit(1)

FINNHUB_KEY = os.environ.get("FINNHUB_API_KEY", "d758ef1r01qk56kbqo5gd758ef1r01qk56kbqo60")

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "db.seyrycaldytfjvvkqopu.supabase.co")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")
DB = dict(
    host=DB_HOST, port=int(os.environ.get("SUPABASE_DB_PORT", "5432")), dbname="postgres",
    user=os.environ.get("SUPABASE_DB_USER", "postgres"), password=DB_PASS, sslmode="require",
)

QUOTES_TABLE = "sotw_live_quotes"

# ═══════════════════════════════════════════════════════════
# 50 SYMBOLS — optimized across all asset classes
# Finnhub symbol -> (SOTW DB id, display label)
# ═══════════════════════════════════════════════════════════

SYMBOLS = {
    # ── Top 25 US Stocks ──────────────────────────────────
    "AAPL":  ("YF.STOCK.AAPL",  "Apple"),
    "MSFT":  ("YF.STOCK.MSFT",  "Microsoft"),
    "NVDA":  ("YF.STOCK.NVDA",  "NVIDIA"),
    "AMZN":  ("YF.STOCK.AMZN",  "Amazon"),
    "GOOGL": ("YF.STOCK.GOOGL", "Alphabet"),
    "META":  ("YF.STOCK.META",  "Meta"),
    "TSLA":  ("YF.STOCK.TSLA",  "Tesla"),
    "AVGO":  ("YF.STOCK.AVGO",  "Broadcom"),
    "JPM":   ("YF.STOCK.JPM",   "JPMorgan"),
    "V":     ("YF.STOCK.V",     "Visa"),
    "UNH":   ("YF.STOCK.UNH",   "UnitedHealth"),
    "MA":    ("YF.STOCK.MA",    "Mastercard"),
    "XOM":   ("YF.STOCK.XOM",   "ExxonMobil"),
    "COST":  ("YF.STOCK.COST",  "Costco"),
    "HD":    ("YF.STOCK.HD",    "Home Depot"),
    "BAC":   ("YF.STOCK.BAC",   "Bank of America"),
    "NFLX":  ("YF.STOCK.NFLX",  "Netflix"),
    "AMD":   ("YF.STOCK.AMD",   "AMD"),
    "CRM":   ("YF.STOCK.CRM",   "Salesforce"),
    "KO":    ("YF.STOCK.KO",    "Coca-Cola"),
    "ADBE":  ("YF.STOCK.ADBE",  "Adobe"),
    "WMT":   ("YF.STOCK.WMT",   "Walmart"),
    "GS":    ("YF.STOCK.GS",    "Goldman Sachs"),
    "NOW":   ("YF.STOCK.NOW",   "ServiceNow"),
    "CAT":   ("YF.STOCK.CAT",   "Caterpillar"),

    # ── Index ETFs (proxy for major indices) ──────────────
    "SPY":  ("FH.IDX.SP500",   "S&P 500 (SPY)"),
    "QQQ":  ("FH.IDX.NASDAQ",  "Nasdaq 100 (QQQ)"),
    "DIA":  ("FH.IDX.DOW",     "Dow Jones (DIA)"),
    "IWM":  ("FH.IDX.RUSSELL", "Russell 2000 (IWM)"),

    # ── Commodity ETFs ────────────────────────────────────
    "GLD":  ("FH.CMD.GOLD",    "Gold (GLD)"),
    "USO":  ("FH.CMD.OIL",     "WTI Crude (USO)"),
    "SLV":  ("FH.CMD.SILVER",  "Silver (SLV)"),
    "UNG":  ("FH.CMD.NATGAS",  "Natural Gas (UNG)"),
    "WEAT": ("FH.CMD.WHEAT",   "Wheat (WEAT)"),
    "CORN": ("FH.CMD.CORN",    "Corn (CORN)"),
    "DBA":  ("FH.CMD.AGRI",    "Agriculture (DBA)"),

    # ── Forex (OANDA) ─────────────────────────────────────
    "OANDA:EUR_USD": ("FH.FX.EUR", "EUR/USD"),
    "OANDA:GBP_USD": ("FH.FX.GBP", "GBP/USD"),
    "OANDA:USD_JPY": ("FH.FX.JPY", "USD/JPY"),
    "OANDA:USD_CAD": ("FH.FX.CAD", "USD/CAD"),
    "OANDA:AUD_USD": ("FH.FX.AUD", "AUD/USD"),
    "OANDA:USD_CHF": ("FH.FX.CHF", "USD/CHF"),

    # ── Crypto (Binance + Coinbase) ───────────────────────
    "BINANCE:BTCUSDT":  ("FH.CRYPTO.BTC",  "Bitcoin"),
    "BINANCE:ETHUSDT":  ("FH.CRYPTO.ETH",  "Ethereum"),
    "BINANCE:SOLUSDT":  ("FH.CRYPTO.SOL",  "Solana"),
    "BINANCE:XRPUSDT":  ("FH.CRYPTO.XRP",  "XRP"),
    "BINANCE:DOGEUSDT": ("FH.CRYPTO.DOGE", "Dogecoin"),
    "BINANCE:ADAUSDT":  ("FH.CRYPTO.ADA",  "Cardano"),

    # ── Extra high-volume stocks ──────────────────────────
    "INTC":  ("YF.STOCK.INTC",  "Intel"),
    "PEP":   ("YF.STOCK.PEP",   "PepsiCo"),
}

assert len(SYMBOLS) == 50, f"Expected 50 symbols, got {len(SYMBOLS)}"

# Latest prices from WebSocket (thread-safe via GIL for simple dict ops)
latest_prices = {}  # finnhub_symbol -> {price, volume, timestamp}


def on_message(ws, message):
    """Handle incoming WebSocket messages."""
    data = json.loads(message)
    if data.get("type") == "trade":
        for trade in data.get("data", []):
            symbol = trade["s"]
            latest_prices[symbol] = {
                "price": trade["p"],
                "volume": trade.get("v", 0),
                "timestamp": trade["t"] / 1000,  # ms -> seconds
            }


def on_error(ws, error):
    print(f"WebSocket error: {error}", flush=True)


def on_close(ws, close_status_code, close_msg):
    print(f"WebSocket closed: {close_status_code} {close_msg}", flush=True)


def on_open(ws):
    """Subscribe to all symbols."""
    print(f"WebSocket connected. Subscribing to {len(SYMBOLS)} symbols...", flush=True)
    for symbol in SYMBOLS:
        ws.send(json.dumps({"type": "subscribe", "symbol": symbol}))
    print("Subscribed.", flush=True)


def get_previous_closes(conn):
    """Fetch previous close prices from DB for symbols that already exist."""
    cur = conn.cursor()
    all_ids = [sotw_id for sotw_id, _ in SYMBOLS.values()]
    placeholders = ",".join(["%s"] * len(all_ids))
    cur.execute(f"""
        SELECT id, previous_close FROM {QUOTES_TABLE}
        WHERE id IN ({placeholders})
    """, all_ids)
    result = {}
    for row in cur.fetchall():
        result[row[0]] = row[1]  # sotw_id -> previous_close
    return result


def flush_to_db(conn, prev_closes):
    """Write latest prices to Supabase."""
    if not latest_prices:
        return 0

    cur = conn.cursor()
    count = 0
    # Snapshot current prices (avoid mutation during iteration)
    snapshot = dict(latest_prices)

    for fh_symbol, data in snapshot.items():
        if fh_symbol not in SYMBOLS:
            continue
        price = data["price"]
        if price <= 0:
            continue

        sotw_id, label = SYMBOLS[fh_symbol]
        prev = prev_closes.get(sotw_id, price)
        change = price - prev
        change_pct = ((price / prev) - 1) * 100 if prev > 0 else 0

        cur.execute(f"""
            INSERT INTO {QUOTES_TABLE} (id, label, price, previous_close, change, change_pct, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
            ON CONFLICT (id) DO UPDATE SET
                price = EXCLUDED.price,
                change = EXCLUDED.change,
                change_pct = EXCLUDED.change_pct,
                updated_at = NOW()
        """, (sotw_id, label, round(price, 4), round(prev, 4), round(change, 4), round(change_pct, 4)))
        count += 1

    conn.commit()
    return count


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--duration", type=int, default=23400, help="Max runtime in seconds (default 6.5h)")
    parser.add_argument("--flush-interval", type=int, default=2, help="Seconds between DB writes (default 2)")
    parser.add_argument("--dry-run", action="store_true", help="Print prices without writing to DB")
    args = parser.parse_args()

    categories = {
        "Stocks": [s for s in SYMBOLS if not s.startswith(("OANDA:", "BINANCE:")) and not SYMBOLS[s][0].startswith(("FH.IDX", "FH.CMD"))],
        "Index ETFs": [s for s in SYMBOLS if SYMBOLS[s][0].startswith("FH.IDX")],
        "Commodity ETFs": [s for s in SYMBOLS if SYMBOLS[s][0].startswith("FH.CMD")],
        "Forex": [s for s in SYMBOLS if s.startswith("OANDA:")],
        "Crypto": [s for s in SYMBOLS if s.startswith("BINANCE:")],
    }

    print(f"=== Finnhub WebSocket ({len(SYMBOLS)} symbols, flush every {args.flush_interval}s) ===", flush=True)
    for cat, syms in categories.items():
        print(f"  {cat}: {len(syms)} — {', '.join(syms[:5])}{'...' if len(syms) > 5 else ''}", flush=True)

    if args.dry_run:
        print("\n--- DRY RUN: no DB writes ---", flush=True)
        ws_url = f"wss://ws.finnhub.io?token={FINNHUB_KEY}"
        ws = websocket.WebSocketApp(ws_url, on_message=on_message, on_error=on_error, on_close=on_close, on_open=on_open)
        ws_thread = threading.Thread(target=ws.run_forever, daemon=True)
        ws_thread.start()

        start = time.time()
        while time.time() - start < args.duration:
            time.sleep(5)
            now = datetime.datetime.now(datetime.UTC)
            active = len(latest_prices)
            total_trades = sum(1 for _ in latest_prices.values())
            print(f"  [{now.strftime('%H:%M:%S')}] {active}/{len(SYMBOLS)} symbols active", flush=True)
            for fh_sym in sorted(latest_prices, key=lambda s: -latest_prices[s].get("price", 0)):
                sotw_id, label = SYMBOLS.get(fh_sym, (fh_sym, fh_sym))
                p = latest_prices[fh_sym]
                print(f"    {label:20s}  ${p['price']:>12,.4f}", flush=True)
        ws.close()
        return

    conn = psycopg2.connect(**DB)
    prev_closes = get_previous_closes(conn)
    print(f"Loaded {len(prev_closes)} previous closes from DB", flush=True)

    # Start WebSocket in a background thread
    ws_url = f"wss://ws.finnhub.io?token={FINNHUB_KEY}"
    ws = websocket.WebSocketApp(ws_url, on_message=on_message, on_error=on_error, on_close=on_close, on_open=on_open)
    ws_thread = threading.Thread(target=ws.run_forever, daemon=True)
    ws_thread.start()

    # Main loop: flush prices to DB every N seconds
    start_time = time.time()
    iteration = 0

    while True:
        elapsed = time.time() - start_time
        if elapsed >= args.duration:
            print(f"\nMax runtime reached ({elapsed/3600:.1f}h). Stopping.", flush=True)
            break

        time.sleep(args.flush_interval)

        try:
            count = flush_to_db(conn, prev_closes)
            iteration += 1
            if iteration % 30 == 1:  # Log every ~60s (at 2s intervals)
                now = datetime.datetime.now(datetime.UTC)
                print(f"  [{now.strftime('%H:%M:%S')}] #{iteration}: flushed {count} prices, {len(latest_prices)} symbols active", flush=True)
        except psycopg2.errors.DeadlockDetected:
            # yfinance batch job is writing to same table — just rollback and retry next cycle
            conn.rollback()
        except Exception as e:
            print(f"  DB error: {e}", flush=True)
            try:
                conn.rollback()
            except Exception:
                pass
            try:
                conn.close()
            except Exception:
                pass
            time.sleep(5)
            try:
                conn = psycopg2.connect(**DB)
                prev_closes = get_previous_closes(conn)
            except Exception as e2:
                print(f"  Reconnect failed: {e2}", flush=True)

    ws.close()
    conn.close()
    print(f"=== Done: {iteration} flushes ===", flush=True)


if __name__ == "__main__":
    main()

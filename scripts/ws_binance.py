#!/usr/bin/env python3
"""
Binance WebSocket real-time crypto quotes — direct connection, no API key.

Subscribes to 24h ticker streams for major cryptocurrencies via Binance's
combined stream WebSocket. Receives real-time price updates and batch-writes
to Supabase every 2 seconds.

Runs 24/7 — crypto never sleeps.

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

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "db.seyrycaldytfjvvkqopu.supabase.co")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")
DB = dict(
    host=DB_HOST, port=int(os.environ.get("SUPABASE_DB_PORT", "5432")), dbname="postgres",
    user=os.environ.get("SUPABASE_DB_USER", "postgres"), password=DB_PASS, sslmode="require",
)

QUOTES_TABLE = "sotw_live_quotes"

# Binance stream symbol -> (SOTW DB id, display label)
# Using @ticker stream: 24h rolling window stats including price, volume, change
SYMBOLS = {
    "btcusdt":  ("BN.CRYPTO.BTC",   "Bitcoin"),
    "ethusdt":  ("BN.CRYPTO.ETH",   "Ethereum"),
    "solusdt":  ("BN.CRYPTO.SOL",   "Solana"),
    "xrpusdt":  ("BN.CRYPTO.XRP",   "XRP"),
    "dogeusdt": ("BN.CRYPTO.DOGE",  "Dogecoin"),
    "adausdt":  ("BN.CRYPTO.ADA",   "Cardano"),
    "bnbusdt":  ("BN.CRYPTO.BNB",   "BNB"),
    "avaxusdt": ("BN.CRYPTO.AVAX",  "Avalanche"),
    "dotusdt":  ("BN.CRYPTO.DOT",   "Polkadot"),
    "linkusdt": ("BN.CRYPTO.LINK",  "Chainlink"),
    "maticusdt":("BN.CRYPTO.MATIC", "Polygon"),
    "ltcusdt":  ("BN.CRYPTO.LTC",   "Litecoin"),
    "uniusdt":  ("BN.CRYPTO.UNI",   "Uniswap"),
    "atomusdt": ("BN.CRYPTO.ATOM",  "Cosmos"),
    "nearusdt": ("BN.CRYPTO.NEAR",  "NEAR Protocol"),
    "aptusdt":  ("BN.CRYPTO.APT",   "Aptos"),
    "suiusdt":  ("BN.CRYPTO.SUI",   "Sui"),
    "arbusdt":  ("BN.CRYPTO.ARB",   "Arbitrum"),
    "opusdt":   ("BN.CRYPTO.OP",    "Optimism"),
    "shibusdt": ("BN.CRYPTO.SHIB",  "Shiba Inu"),
}

# Latest prices from WebSocket
latest_prices = {}  # stream_symbol -> {price, prev_close, change, change_pct, volume}


def on_message(ws, message):
    """Handle incoming Binance 24h ticker messages."""
    data = json.loads(message)

    # Combined stream format: {"stream": "btcusdt@ticker", "data": {...}}
    if "stream" in data:
        data = data["data"]

    if data.get("e") != "24hrTicker":
        return

    symbol = data["s"].lower()  # e.g. "btcusdt"
    if symbol not in SYMBOLS:
        return

    price = float(data["c"])       # Current price (last trade)
    prev_close = float(data["x"])  # Previous 24h close
    change = float(data["p"])      # Price change (24h)
    change_pct = float(data["P"])  # Price change % (24h)
    volume = float(data["v"])      # 24h volume in base asset
    quote_volume = float(data["q"])  # 24h volume in USDT

    latest_prices[symbol] = {
        "price": price,
        "prev_close": prev_close,
        "change": change,
        "change_pct": change_pct,
        "volume": volume,
        "quote_volume": quote_volume,
    }


def on_error(ws, error):
    print(f"WebSocket error: {error}", flush=True)


def on_close(ws, close_status_code, close_msg):
    print(f"WebSocket closed: {close_status_code} {close_msg}", flush=True)


def on_open(ws):
    print(f"Binance WebSocket connected. Streaming {len(SYMBOLS)} pairs.", flush=True)


def flush_to_db(conn):
    """Write latest prices to Supabase."""
    if not latest_prices:
        return 0

    cur = conn.cursor()
    count = 0
    snapshot = dict(latest_prices)

    for symbol, data in snapshot.items():
        if symbol not in SYMBOLS:
            continue
        price = data["price"]
        if price <= 0:
            continue

        sotw_id, label = SYMBOLS[symbol]
        prev = data["prev_close"]
        change = data["change"]
        change_pct = data["change_pct"]

        cur.execute(f"""
            INSERT INTO {QUOTES_TABLE} (id, label, price, previous_close, change, change_pct, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
            ON CONFLICT (id) DO UPDATE SET
                price = EXCLUDED.price,
                previous_close = EXCLUDED.previous_close,
                change = EXCLUDED.change,
                change_pct = EXCLUDED.change_pct,
                updated_at = NOW()
        """, (sotw_id, label, round(price, 6), round(prev, 6), round(change, 6), round(change_pct, 4)))
        count += 1

    conn.commit()
    return count


def build_ws_url():
    """Build Binance combined stream URL."""
    streams = "/".join(f"{s}@ticker" for s in SYMBOLS)
    return f"wss://stream.binance.com:9443/stream?streams={streams}"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--duration", type=int, default=86400, help="Max runtime in seconds (default 24h)")
    parser.add_argument("--flush-interval", type=int, default=2, help="Seconds between DB writes (default 2)")
    parser.add_argument("--dry-run", action="store_true", help="Print prices without writing to DB")
    args = parser.parse_args()

    print(f"=== Binance WebSocket ({len(SYMBOLS)} crypto pairs, flush every {args.flush_interval}s) ===", flush=True)
    for sym, (sotw_id, label) in SYMBOLS.items():
        print(f"  {sym:15s} -> {sotw_id:20s} ({label})", flush=True)

    ws_url = build_ws_url()

    if args.dry_run:
        print(f"\n--- DRY RUN: no DB writes ---", flush=True)
        ws = websocket.WebSocketApp(ws_url, on_message=on_message, on_error=on_error, on_close=on_close, on_open=on_open)
        ws_thread = threading.Thread(target=ws.run_forever, daemon=True)
        ws_thread.start()

        start = time.time()
        while time.time() - start < args.duration:
            time.sleep(5)
            now = datetime.datetime.now(datetime.UTC)
            print(f"  [{now.strftime('%H:%M:%S')}] {len(latest_prices)}/{len(SYMBOLS)} pairs active", flush=True)
            for sym in sorted(latest_prices, key=lambda s: -latest_prices[s].get("quote_volume", 0)):
                sotw_id, label = SYMBOLS.get(sym, (sym, sym))
                p = latest_prices[sym]
                print(f"    {label:20s}  ${p['price']:>12,.2f}  {p['change_pct']:>+7.2f}%  vol=${p['quote_volume']/1e6:>8,.1f}M", flush=True)
        ws.close()
        return

    conn = psycopg2.connect(**DB)
    print(f"Connected to Supabase.", flush=True)

    # Start WebSocket in a background thread
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
            count = flush_to_db(conn)
            iteration += 1
            if iteration % 30 == 1:  # Log every ~60s
                now = datetime.datetime.now(datetime.UTC)
                print(f"  [{now.strftime('%H:%M:%S')}] #{iteration}: flushed {count} prices, {len(latest_prices)} pairs active", flush=True)
        except psycopg2.errors.DeadlockDetected:
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
            except Exception as e2:
                print(f"  Reconnect failed: {e2}", flush=True)

    ws.close()
    conn.close()
    print(f"=== Done: {iteration} flushes ===", flush=True)


if __name__ == "__main__":
    main()

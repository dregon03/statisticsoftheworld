#!/usr/bin/env bash
# End-to-end test of the paid-API flow in Stripe TEST MODE.
#
# Flow:
#  1. Create a free-tier API key for a test email.
#  2. Hit /api/stripe/checkout to create a real Stripe Checkout Session.
#  3. Simulate Stripe firing checkout.session.completed by POSTing a signed
#     webhook payload to /api/stripe/webhook.
#  4. Verify the sotw_api_keys row has been upgraded to tier=pro.
#  5. Call /api/v1/countries with the key and confirm X-RateLimit-Tier=pro.
#  6. Clean up the test key.

set -eu
cd "$(dirname "$0")/.."
set -a
source <(sudo cat /opt/sotw-app/src/.env.local)
set +a

TEST_EMAIL="e2e-$(date +%s)@sotw-test.local"
BASE=https://statisticsoftheworld.com

say() { echo; echo "=== $* ==="; }

say "1. Create free-tier API key"
KEY_RESP=$(curl -s -X POST "$BASE/api/keys" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"name\": \"e2e-test\"}")
echo "$KEY_RESP"
TEST_KEY=$(echo "$KEY_RESP" | python3 -c 'import json,sys;print(json.load(sys.stdin)["apiKey"])')
echo "key: $TEST_KEY"

say "2. Create Stripe Checkout Session"
CHECKOUT=$(curl -s -X POST "$BASE/api/stripe/checkout" \
  -H "Content-Type: application/json" \
  -d "{\"tier\": \"pro\", \"email\": \"$TEST_EMAIL\", \"apiKey\": \"$TEST_KEY\"}")
echo "$CHECKOUT"
CHECKOUT_URL=$(echo "$CHECKOUT" | python3 -c 'import json,sys;print(json.load(sys.stdin)["url"])')
# Extract session id from URL (format: .../pay/cs_test_xxx#fid...)
SESSION_ID=$(echo "$CHECKOUT_URL" | grep -oE 'cs_test_[A-Za-z0-9]+' | head -1)
echo "session: $SESSION_ID"

say "3. Fetch session to confirm it exists in Stripe"
curl -s -u "$STRIPE_SECRET_KEY:" "https://api.stripe.com/v1/checkout/sessions/$SESSION_ID" \
  | python3 -c 'import json,sys;d=json.load(sys.stdin);print("payment_status:",d.get("payment_status"),"status:",d.get("status"),"metadata:",d.get("metadata"))'

say "4. Simulate checkout.session.completed webhook (sign with STRIPE_WEBHOOK_SECRET)"
python3 <<PY
import hmac, hashlib, json, time, os, urllib.request

secret = os.environ["STRIPE_WEBHOOK_SECRET"]
email  = "$TEST_EMAIL"
sid    = "$SESSION_ID"

payload = {
    "id": "evt_test_e2e_" + str(int(time.time())),
    "object": "event",
    "type": "checkout.session.completed",
    "api_version": "2026-02-25.clover",
    "created": int(time.time()),
    "livemode": False,
    "data": {
        "object": {
            "id": sid,
            "object": "checkout.session",
            "customer": "cus_test_e2e",
            "customer_email": email,
            "subscription": "sub_test_e2e_" + str(int(time.time())),
            "payment_status": "paid",
            "status": "complete",
            "mode": "subscription",
            "metadata": {
                "tier": "pro",
                "email": email,
                "api_key": "",
            },
        }
    },
    "request": {"id": None, "idempotency_key": None},
}
body_str = json.dumps(payload, separators=(",", ":"))
ts = str(int(time.time()))
signed = f"{ts}.{body_str}".encode()
sig = hmac.new(secret.encode(), signed, hashlib.sha256).hexdigest()
header = f"t={ts},v1={sig}"

req = urllib.request.Request(
    "$BASE/api/stripe/webhook",
    data=body_str.encode(),
    headers={"Content-Type": "application/json", "Stripe-Signature": header},
    method="POST",
)
try:
    with urllib.request.urlopen(req, timeout=10) as r:
        print("status:", r.status, "body:", r.read().decode()[:200])
except urllib.error.HTTPError as e:
    print("HTTP error", e.code, e.read().decode()[:300])
PY

say "5. Check sotw_api_keys row in Supabase"
sudo docker exec supabase-db psql -U postgres -d postgres -c \
  "SELECT email, tier, rate_limit, stripe_subscription_id, active FROM sotw_api_keys WHERE email='$TEST_EMAIL';"

say "6. Test upgraded key hits /api/v1/countries and reports correct tier"
curl -s -D - -o /dev/null "$BASE/api/v1/countries" -H "X-API-Key: $TEST_KEY" | grep -iE "^(http|x-ratelimit)"

say "7. Cleanup: remove test key row"
sudo docker exec supabase-db psql -U postgres -d postgres -c \
  "DELETE FROM sotw_api_keys WHERE email='$TEST_EMAIL';"

say "DONE"

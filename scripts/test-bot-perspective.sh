#!/usr/bin/env bash
# Simulates what various scraper personas see when hitting the API.
# Run against the deployed site to confirm rate-limiting behavior.

set -eu
BASE=https://statisticsoftheworld.com

say() { echo; echo "═══ $* ═══"; }
hr() { echo "────────────────────────────"; }

say "PERSONA 1: Anonymous scraper hitting /api/v1/countries (no key)"
say "  (expect: 200 OK, x-ratelimit-tier=anonymous)"
curl -s -D - -o /dev/null "$BASE/api/v1/countries" | grep -iE "^(http|x-ratelimit|retry)"

say "PERSONA 2: Scraper with a bogus API key"
say "  (expect: 401 Invalid or inactive API key)"
curl -s "$BASE/api/v1/countries" -H "X-API-Key: sotw_fake_key_for_test" \
  | python3 -m json.tool

say "PERSONA 3: Scraper hitting /api/v2/country/USA (NO gating today)"
say "  (expect CURRENT: 200 — v2 is ungated in the deployed build)"
say "  (expect AFTER DEPLOY: 401 or anonymous rate-limit headers)"
curl -s -D - -o /tmp/v2body "$BASE/api/v2/country/USA" | grep -iE "^(http|x-ratelimit)"
hr
echo "body preview:"
head -c 300 /tmp/v2body; echo

say "PERSONA 4: Scraper hitting /api/predictions?limit=500 (the Airtel India pattern)"
say "  (expect CURRENT: 200 — ungated in the deployed build)"
say "  (expect AFTER DEPLOY: 200 first time, but rate-limited after 1000/day anon quota)"
curl -s -D - -o /tmp/predbody "$BASE/api/predictions?limit=500" | grep -iE "^(http|x-ratelimit)"
hr
echo "body first 200 chars:"
head -c 200 /tmp/predbody; echo

say "PERSONA 5: Free-tier customer who exhausts their daily quota"
say "  (we create a test key, force requests_today past the limit, then call)"
BOT_EMAIL="bot-test-$(date +%s)@sotw-test.local"

# Create a free-tier key
KEY_JSON=$(curl -s -X POST "$BASE/api/keys" -H "Content-Type: application/json" \
  -d "{\"email\":\"$BOT_EMAIL\",\"name\":\"bot-e2e\"}")
BOT_KEY=$(echo "$KEY_JSON" | python3 -c 'import json,sys;print(json.load(sys.stdin)["apiKey"])')
echo "  free key: ${BOT_KEY:0:14}…"

# Force the counter to the limit (1000). SSH into OVH and update Supabase.
ssh -i C:/Users/Tom/.ssh/hetzner -o StrictHostKeyChecking=no ubuntu@144.217.14.51 \
  "sudo docker exec -i supabase-db psql -U postgres -d postgres" \
  <<SQL
UPDATE sotw_api_keys SET requests_today=1000, reset_at=now()+interval '24 hours' WHERE api_key='$BOT_KEY';
SELECT tier, rate_limit, requests_today FROM sotw_api_keys WHERE api_key='$BOT_KEY';
SQL

say "  Now call /api/v1/countries with exhausted key"
echo "  (expect: 429, upgrade path in body)"
RESP=$(curl -s -D - "$BASE/api/v1/countries" -H "X-API-Key: $BOT_KEY")
echo "$RESP" | grep -iE "^(http|x-ratelimit|retry)"
hr
echo "429 body:"
echo "$RESP" | awk 'found{print} /^\r?$/{found=1}' | python3 -m json.tool
hr

say "  CLEANUP: remove test key"
ssh -i C:/Users/Tom/.ssh/hetzner -o StrictHostKeyChecking=no ubuntu@144.217.14.51 \
  "sudo docker exec -i supabase-db psql -U postgres -d postgres" \
  <<SQL
DELETE FROM sotw_api_keys WHERE api_key='$BOT_KEY';
SQL

say "DONE"

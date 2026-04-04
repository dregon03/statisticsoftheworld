#!/bin/bash
# ETL runner script — runs on Hetzner VPS at /opt/sotw-etl/
# Usage: /opt/sotw-etl/run-etl.sh <script_name.py> [args...]
#
# Features:
#   - Loads .env for API keys / DB creds
#   - Auto-pulls latest code from master
#   - flock prevents overlapping runs of the same script
#   - Sends email alert on failure via Gmail SMTP (uses GMAIL_USER + GMAIL_APP_PASSWORD from .env)

set -a; source /opt/sotw-etl/.env; set +a
cd /opt/sotw-etl

SCRIPT="$1"
LOCK_FILE="/tmp/sotw-etl-${SCRIPT}.lock"
ALERT_EMAIL="${ETL_ALERT_EMAIL:-statisticsoftheworldcontact@gmail.com}"

# Pull latest code (quiet, non-blocking)
git pull -q origin master 2>/dev/null

# Use flock to prevent overlapping runs of the same script
exec 200>"$LOCK_FILE"
if ! flock -n 200; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $SCRIPT SKIPPED: already running (locked)" >&2
  exit 0
fi

# Run the ETL script
OUTPUT=$(python3 scripts/$SCRIPT ${@:2} 2>&1 | tail -100)
EXIT_CODE=$?

echo "$OUTPUT"

# Alert on failure via email
if [ $EXIT_CODE -ne 0 ]; then
  TRUNCATED=$(echo "$OUTPUT" | tail -30)
  python3 -c "
import smtplib, os
from email.mime.text import MIMEText
body = '''ETL script failed: $SCRIPT
Exit code: $EXIT_CODE
Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)

Last 30 lines of output:
$TRUNCATED
'''
msg = MIMEText(body)
msg['Subject'] = 'SOTW ETL Failed: $SCRIPT'
msg['From'] = os.environ.get('GMAIL_USER', '')
msg['To'] = '$ALERT_EMAIL'
try:
    s = smtplib.SMTP_SSL('smtp.gmail.com', 465)
    s.login(os.environ.get('GMAIL_USER',''), os.environ.get('GMAIL_APP_PASSWORD',''))
    s.sendmail(msg['From'], ['$ALERT_EMAIL'], msg.as_string())
    s.quit()
except Exception as e:
    print(f'Alert email failed: {e}')
" 2>&1
fi

exit $EXIT_CODE

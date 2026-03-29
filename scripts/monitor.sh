#!/bin/bash
# SOTW Monitor — checks site health + ETL status, sends email on failure
# Install: Add to crontab: */15 * * * * /opt/sotw-etl/scripts/monitor.sh
# Requires: curl, mail (or use Python smtp fallback below)

HEALTH_URL="https://statisticsoftheworld.com/api/health"
ALERT_EMAIL="tomhwang20@gmail.com"
LOG_FILE="/var/log/sotw-monitor.log"
STATE_FILE="/tmp/sotw-monitor-state"

check_health() {
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$HEALTH_URL")
  if [ "$RESPONSE" != "200" ]; then
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) ALERT: Health check failed (HTTP $RESPONSE)" >> "$LOG_FILE"
    # Only alert if we haven't alerted in the last hour
    if [ ! -f "$STATE_FILE" ] || [ $(( $(date +%s) - $(stat -c %Y "$STATE_FILE" 2>/dev/null || echo 0) )) -gt 3600 ]; then
      python3 -c "
import smtplib, os
from email.mime.text import MIMEText
msg = MIMEText('SOTW health check returned HTTP $RESPONSE.\n\nURL: $HEALTH_URL\nTime: $(date -u)')
msg['Subject'] = 'SOTW Alert: Site health check failed'
msg['From'] = os.environ.get('GMAIL_USER', 'alert@sotw.com')
msg['To'] = '$ALERT_EMAIL'
try:
    s = smtplib.SMTP_SSL('smtp.gmail.com', 465)
    s.login(os.environ.get('GMAIL_USER',''), os.environ.get('GMAIL_APP_PASSWORD',''))
    s.sendmail(msg['From'], ['$ALERT_EMAIL'], msg.as_string())
    s.quit()
    print('Alert email sent')
except Exception as e:
    print(f'Email failed: {e}')
" 2>&1 >> "$LOG_FILE"
      touch "$STATE_FILE"
    fi
    return 1
  fi
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) OK: Health check passed" >> "$LOG_FILE"
  return 0
}

# Check ETL log for recent errors (last 30 min)
check_etl() {
  if [ -f /var/log/sotw-etl.log ]; then
    RECENT_ERRORS=$(tail -100 /var/log/sotw-etl.log | grep -i "error\|traceback\|exception" | wc -l)
    if [ "$RECENT_ERRORS" -gt 5 ]; then
      echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) WARNING: $RECENT_ERRORS recent ETL errors" >> "$LOG_FILE"
    fi
  fi
}

check_health
check_etl

# Keep log file small (last 1000 lines)
if [ -f "$LOG_FILE" ] && [ $(wc -l < "$LOG_FILE") -gt 1000 ]; then
  tail -500 "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"
fi

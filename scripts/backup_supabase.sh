#!/bin/bash
# SOTW Supabase Backup — dumps critical tables daily
# Install: Add to crontab: 0 5 * * * /opt/sotw-etl/scripts/backup_supabase.sh
# Requires: pg_dump, SUPABASE_DB_* env vars in /opt/sotw-etl/.env

set -a; source /opt/sotw-etl/.env; set +a

BACKUP_DIR="/opt/sotw-etl/backups"
DATE=$(date +%Y-%m-%d)
BACKUP_FILE="$BACKUP_DIR/sotw-backup-$DATE.sql.gz"

mkdir -p "$BACKUP_DIR"

# Dump all sotw_ tables
PGPASSWORD="$SUPABASE_DB_PASSWORD" pg_dump \
  -h "$SUPABASE_DB_HOST" \
  -p "${SUPABASE_DB_PORT:-6543}" \
  -U "$SUPABASE_DB_USER" \
  -d postgres \
  --no-owner \
  --no-privileges \
  -t 'sotw_*' \
  2>/dev/null | gzip > "$BACKUP_FILE"

if [ -s "$BACKUP_FILE" ]; then
  SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) Backup OK: $BACKUP_FILE ($SIZE)" >> /var/log/sotw-etl.log
else
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) ERROR: Backup failed or empty" >> /var/log/sotw-etl.log
  rm -f "$BACKUP_FILE"
fi

# Keep only last 14 days of backups
find "$BACKUP_DIR" -name "sotw-backup-*.sql.gz" -mtime +14 -delete 2>/dev/null

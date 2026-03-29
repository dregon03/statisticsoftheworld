#!/bin/bash
# ETL runner script — runs on Hetzner VPS at /opt/sotw-etl/
# Usage: /opt/sotw-etl/run-etl.sh <script_name.py> [args...]
set -a; source /opt/sotw-etl/.env; set +a
cd /opt/sotw-etl
git pull -q origin master 2>/dev/null
python3 scripts/$1 ${@:2} 2>&1 | tail -50

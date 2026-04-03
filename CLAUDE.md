@AGENTS.md

# Deployment

- **Website (Next.js)**: Docker container on Hetzner VPS (5.161.56.146) via Coolify. NOT on Vercel.
- **ETL/cron scripts**: Same Hetzner VPS, installed at /opt/sotw-etl/. See scripts/crontab.txt.
- **Database**: Supabase (PostgreSQL)
- **Domain**: statisticsoftheworld.com → DNS points to Hetzner
- **Do NOT use or reference Vercel** — the project has been fully migrated off Vercel.
- **Auto-deploy**: Pushes to `master` auto-trigger Coolify builds via GitHub webhook.

@AGENTS.md

# Backlink System

An automated backlink-building system lives in `backlinks/`. Read `backlinks/BACKLINK-AGENT.md` for full instructions.
- **Tracker**: `backlinks/tracker.json` — tracks all posts, rate limits, and progress
- **Templates**: `backlinks/content-templates.json` — humanized content templates per platform
- **Agent instructions**: `backlinks/BACKLINK-AGENT.md` — complete autonomous agent playbook
- **Goal**: 1,000,000 backlinks. Current progress tracked in tracker.json metadata.
- **Key rule**: ALWAYS search each platform for existing SOTW mentions before posting. Never duplicate.
- **CRITICAL**: After ANY backlink session, update BOTH `backlinks/tracker.json` (commit it) AND `memory/project_sotw_backlinks.md` in the Claude memory system. Prior sessions lost state by not doing this.

# Deployment

- **Website (Next.js)**: Docker container on Hetzner VPS (5.161.56.146) via Coolify. NOT on Vercel.
- **ETL/cron scripts**: Same Hetzner VPS, installed at /opt/sotw-etl/. See scripts/crontab.txt.
- **Database**: Supabase (PostgreSQL)
- **Domain**: statisticsoftheworld.com → DNS points to Hetzner
- **Do NOT use or reference Vercel** — the project has been fully migrated off Vercel.
- **Auto-deploy**: Pushes to `master` auto-trigger Coolify builds via GitHub webhook.

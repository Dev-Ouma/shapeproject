#!/usr/bin/env bash
# Nightly backup (cron as shape): consistent SQLite snapshot + uploads, 30-day retention.
#   15 2 * * * /srv/shape/current/deploy/backup.sh >> /srv/shape/shared/backup.log 2>&1
set -euo pipefail
DEST=/srv/shape/backups/$(date -u +%Y%m%d)
mkdir -p "$DEST"
node -e "const {DatabaseSync}=require('node:sqlite');new DatabaseSync('/srv/shape/shared/shape.db').exec(\"VACUUM INTO '$DEST/shape.db'\")"
tar -czf "$DEST/uploads.tgz" -C /srv/shape/shared uploads
find /srv/shape/backups -maxdepth 1 -type d -mtime +30 -exec rm -rf {} +
echo "Backup $DEST ok"

#!/usr/bin/env bash
# Nightly backup: consistent SQLite snapshot + uploads, kept 30 days.
set -euo pipefail
APP=${APP:-/var/www/shapeproject}
DEST=$APP/backups/$(date -u +%Y%m%d)
mkdir -p "$DEST"
node -e "const {DatabaseSync}=require('node:sqlite');new DatabaseSync(process.argv[1]).exec(\"VACUUM INTO '\"+process.argv[2]+\"'\")" "$APP/shared/shape.db" "$DEST/shape.db"
tar -czf "$DEST/uploads.tgz" -C "$APP/shared" uploads
find "$APP/backups" -mindepth 1 -maxdepth 1 -mtime +30 -exec rm -rf {} +
echo "$(date -u) backup ok: $DEST"

#!/usr/bin/env bash
# Deploy the latest commit from GitHub (run on the server as the app user, no root needed).
#   ~/shapeproject/current/deploy/server-deploy.sh            # deploys origin/main
# Layout: ~/shapeproject/{repo,releases/<sha>,current -> releases/<sha>,shared/{.env,shape.db,uploads}}
set -euo pipefail
APP=$HOME/shapeproject
REPO_URL=https://github.com/Dev-Ouma/shapeproject.git
BRANCH=${BRANCH:-main}
mkdir -p "$APP/releases" "$APP/shared/uploads" "$APP/backups"

if [ ! -d "$APP/repo/.git" ]; then git clone --quiet "$REPO_URL" "$APP/repo"; fi
git -C "$APP/repo" fetch --quiet origin "$BRANCH"
SHA=$(git -C "$APP/repo" rev-parse --short "origin/$BRANCH")
REL="$APP/releases/$SHA"

if [ ! -d "$REL" ]; then
  git -C "$APP/repo" worktree prune
  git -C "$APP/repo" archive "origin/$BRANCH" | (mkdir -p "$REL" && tar -x -C "$REL")
  cd "$REL"
  set -a; . "$APP/shared/.env"; set +a
  PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci --no-audit --no-fund --loglevel=error
  npm run build --silent
  npm prune --omit=dev --no-audit --no-fund --loglevel=error
fi

# Back up the database before switching (consistent snapshot).
if [ -f "$APP/shared/shape.db" ]; then
  node -e "const {DatabaseSync}=require('node:sqlite');new DatabaseSync(process.argv[1]).exec(\"VACUUM INTO '\"+process.argv[2]+\"'\")" "$APP/shared/shape.db" "$APP/backups/pre-$SHA-$(date -u +%Y%m%d%H%M%S).db"
fi

PREV=$(readlink -f "$APP/current" 2>/dev/null || true)
ln -sfn "$REL" "$APP/current"

if systemctl list-unit-files shape.service >/dev/null 2>&1 && systemctl list-unit-files | grep -q '^shape.service'; then
  sudo -n systemctl restart shape 2>/dev/null || { echo "Run: sudo systemctl restart shape"; }
else
  # Before the systemd unit exists: run in the background as this user.
  pkill -f "$APP/.*/dist/server/entry.mjs" 2>/dev/null || true
  (set -a; . "$APP/shared/.env"; set +a; cd "$APP/current" && nohup node dist/server/entry.mjs >> "$APP/shared/app.log" 2>&1 &)
fi

for i in $(seq 1 30); do curl -fsS -o /dev/null "http://127.0.0.1:${PORT:-4321}/" && break; sleep 1; done
if curl -fsS -o /dev/null "http://127.0.0.1:${PORT:-4321}/"; then
  echo "Release $SHA is live."
  ls -1dt "$APP"/releases/* | tail -n +6 | xargs -r rm -rf
else
  echo "Health check failed; rolling back to $PREV" >&2
  [ -n "$PREV" ] && ln -sfn "$PREV" "$APP/current"
  exit 1
fi

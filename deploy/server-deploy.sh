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
  # Older CPUs (no x86-64-v2) cannot run sharp's native build: add its WebAssembly build.
  if ! node -e "require('sharp')" 2>/dev/null; then
    npm install --no-save --no-audit --no-fund --loglevel=error --cpu=wasm32 @img/sharp-wasm32@0.35.5
    node -e "require('sharp')" && echo "sharp: using WebAssembly build"
  fi
fi

# Back up the database before switching (consistent snapshot).
if [ -f "$APP/shared/shape.db" ]; then
  node -e "const {DatabaseSync}=require('node:sqlite');new DatabaseSync(process.argv[1]).exec(\"VACUUM INTO '\"+process.argv[2]+\"'\")" "$APP/shared/shape.db" "$APP/backups/pre-$SHA-$(date -u +%Y%m%d%H%M%S).db"
fi

PREV=$(readlink -f "$APP/current" 2>/dev/null || true)
ln -sfn "$REL" "$APP/current"

# (Not `list-unit-files | grep -q`: with pipefail, grep closing early fails the pipe.)
if [ -f /etc/systemd/system/shape.service ]; then
  # Stop any pre-systemd copy so it does not hold the port.
  if [ -f "$APP/shared/app.pid" ]; then kill "$(cat "$APP/shared/app.pid")" 2>/dev/null || true; rm -f "$APP/shared/app.pid"; fi
  sudo -n systemctl restart shape 2>/dev/null || { echo "Run: sudo systemctl restart shape"; }
else
  # Before the systemd unit exists: run in the background as this user (tracked by pid file).
  if [ -f "$APP/shared/app.pid" ]; then kill "$(cat "$APP/shared/app.pid")" 2>/dev/null || true; fi
  for pid in $(pgrep -u "$(id -u)" -f 'dist/server/entry.mjs'); do
    case "$(readlink -f /proc/$pid/cwd)" in "$APP"/*) kill "$pid" 2>/dev/null || true ;; esac
  done
  sleep 1
  (set -a; . "$APP/shared/.env"; set +a; cd "$APP/current" && setsid nohup node dist/server/entry.mjs >> "$APP/shared/app.log" 2>&1 < /dev/null & echo $! > "$APP/shared/app.pid")
fi

for i in $(seq 1 30); do curl -fsS -o /dev/null "http://127.0.0.1:${PORT:-4321}/" && break; sleep 1; done
LIVE=$(pgrep -u "$(id -u)" -f 'dist/server/entry.mjs' | while read -r p; do readlink -f /proc/$p/cwd; done | sort -u)
if curl -fsS -o /dev/null "http://127.0.0.1:${PORT:-4321}/" && [ "$LIVE" = "$REL" ]; then
  echo "Release $SHA is live."
  ls -1dt "$APP"/releases/* | tail -n +6 | xargs -r rm -rf
else
  echo "Health check failed; rolling back to $PREV" >&2
  [ -n "$PREV" ] && ln -sfn "$PREV" "$APP/current"
  exit 1
fi

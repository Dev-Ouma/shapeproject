#!/usr/bin/env bash
# Build locally, upload a release, switch the symlink, restart. Usage:
#   SSH="ssh -p PORT -i KEY deploy@IP" HOST_ALIAS=deploy@IP PORT=22 KEY=~/.ssh/id_ed25519 SUBDOMAIN=shape.example.org ./deploy/deploy.sh
set -euo pipefail
: "${HOST_ALIAS:?set HOST_ALIAS=user@ip}"; : "${SUBDOMAIN:?set SUBDOMAIN}"
PORT="${PORT:-22}"; KEY="${KEY:-$HOME/.ssh/id_ed25519}"
SSH=(ssh -p "$PORT" -i "$KEY" "$HOST_ALIAS")
REL="$(date -u +%Y%m%d%H%M%S)"

ALLOWED_HOSTS="$SUBDOMAIN" SITE_URL="https://$SUBDOMAIN" npm run build
tar -czf "/tmp/shape-$REL.tgz" dist package.json package-lock.json scripts
scp -P "$PORT" -i "$KEY" "/tmp/shape-$REL.tgz" "$HOST_ALIAS:/tmp/"
"${SSH[@]}" bash -s <<REMOTE
set -euo pipefail
sudo -u shape mkdir -p /srv/shape/releases/$REL
sudo -u shape tar -xzf /tmp/shape-$REL.tgz -C /srv/shape/releases/$REL
cd /srv/shape/releases/$REL && sudo -u shape npm ci --omit=dev --no-audit --no-fund
sudo -u shape ln -sfn /srv/shape/releases/$REL /srv/shape/current
sudo systemctl restart shape
sleep 2 && curl -fsS -o /dev/null http://127.0.0.1:4321/ && echo "Release $REL is live"
ls -1dt /srv/shape/releases/* | tail -n +6 | xargs -r sudo rm -rf
rm -f /tmp/shape-$REL.tgz
REMOTE
rm -f "/tmp/shape-$REL.tgz"

#!/usr/bin/env bash
# One-time root setup for shapeproject.ouk.ac.ke (systemd service, Nginx site, TLS, backups).
# Run on the server:  sudo bash ~/shapeproject/current/deploy/root-setup.sh
set -euo pipefail
DOMAIN=shapeproject.ouk.ac.ke
APP_USER=wabwire
APP=/home/$APP_USER/shapeproject

# 0. Image tools (this VM's CPU cannot run sharp; the CMS falls back to ImageMagick)
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq imagemagick >/dev/null

# 1. systemd service (runs as the app user, restarts on failure, starts at boot)
cat > /etc/systemd/system/shape.service <<UNIT
[Unit]
Description=SHAPE website + CMS ($DOMAIN)
After=network.target

[Service]
Type=simple
User=$APP_USER
Group=$APP_USER
WorkingDirectory=$APP/current
EnvironmentFile=$APP/shared/.env
ExecStart=/usr/bin/env node $APP/current/dist/server/entry.mjs
Restart=always
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ReadWritePaths=$APP/shared
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
UNIT
[ -f $APP/shared/app.pid ] && kill "$(cat $APP/shared/app.pid)" 2>/dev/null || true
pkill -u $APP_USER -f "dist/server/entry.mjs" || true
sleep 1
systemctl daemon-reload
systemctl enable --now shape
# Let the app user restart its own service during deploys (nothing else).
echo "$APP_USER ALL=(root) NOPASSWD: /usr/bin/systemctl restart shape, /bin/systemctl restart shape" > /etc/sudoers.d/shape-deploy
chmod 440 /etc/sudoers.d/shape-deploy
visudo -cf /etc/sudoers.d/shape-deploy

# 2. Nginx (HTTP first so certbot can validate; certbot then adds HTTPS + redirect)
echo 'limit_req_zone $binary_remote_addr zone=shape_login:10m rate=10r/m;' > /etc/nginx/conf.d/shape-ratelimit.conf
cat > /etc/nginx/snippets/shape-proxy.conf <<'SNIP'
proxy_http_version 1.1;
proxy_set_header Host $host;
proxy_set_header X-Forwarded-Host $host;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header Connection "";
proxy_read_timeout 120s;
SNIP
cat > /etc/nginx/sites-available/shapeproject <<SITE
upstream shape_app { server 127.0.0.1:4321; keepalive 16; }
server {
  listen 80;
  listen [::]:80;
  server_name $DOMAIN;
  client_max_body_size 25m;
  server_tokens off;

  location /uploads/ {
    alias $APP/shared/uploads/;
    add_header Cache-Control "public, max-age=31536000, immutable";
    add_header X-Content-Type-Options nosniff always;
    try_files \$uri =404;
  }
  location /_astro/ {
    proxy_pass http://shape_app;
    include /etc/nginx/snippets/shape-proxy.conf;
    add_header Cache-Control "public, max-age=31536000, immutable";
    add_header X-Content-Type-Options nosniff always;
  }
  location = /admin/login {
    limit_req zone=shape_login burst=5 nodelay;
    proxy_pass http://shape_app;
    include /etc/nginx/snippets/shape-proxy.conf;
  }
  location / {
    proxy_pass http://shape_app;
    include /etc/nginx/snippets/shape-proxy.conf;
    add_header X-Content-Type-Options nosniff always;
  }
}
SITE
ln -sfn /etc/nginx/sites-available/shapeproject /etc/nginx/sites-enabled/shapeproject
# Nginx (www-data) must be able to read uploads.
chmod o+x /home/$APP_USER $APP $APP/shared
chmod -R o+rX $APP/shared/uploads
nginx -t
systemctl reload nginx

# 3. TLS certificate + HTTPS redirect + HSTS
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --redirect -m shape@ouk.ac.ke
grep -q Strict-Transport-Security /etc/nginx/sites-available/shapeproject || \
  sed -i "0,/listen 443 ssl/s//listen 443 ssl;\n    add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always/" /etc/nginx/sites-available/shapeproject
nginx -t && systemctl reload nginx

# 4. Nightly backups (DB snapshot + uploads, 30 days) in the app user's crontab
( crontab -u $APP_USER -l 2>/dev/null | grep -v shape-backup ; echo "15 2 * * * $APP/current/deploy/backup.sh >> $APP/shared/backup.log 2>&1 # shape-backup" ) | crontab -u $APP_USER -
echo "Done: https://$DOMAIN"

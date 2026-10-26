#!/usr/bin/env bash
# Share port 443 with the SOMAS DR stream passthrough: route by SNI (no TLS termination).
# shapeproject.ouk.ac.ke -> local http server on 127.0.0.1:8443; everything else -> 10.0.0.2:443 as before.
set -euo pipefail
TS=$(date +%Y%m%d%H%M%S)
sudo cp /etc/nginx/somas-dr-stream.conf /root/somas-dr-stream.conf.$TS
sudo cp /etc/nginx/sites-available/shapeproject /root/shapeproject.nginx.$TS
sudo tee /etc/nginx/somas-dr-stream.conf >/dev/null <<'EOF'
# Port 443 is shared: TLS for shapeproject.ouk.ac.ke goes to the local http server,
# everything else passes through to the SOMAS DR host as before (SNI routing, no TLS termination).
stream {
  map_hash_bucket_size 64;
  map $ssl_preread_server_name $tls_upstream {
    shapeproject.ouk.ac.ke 127.0.0.1:8443;
    default                10.0.0.2:443;
  }
  server { listen 443; ssl_preread on; proxy_pass $tls_upstream; }
}
EOF
sudo sed -i 's|^\s*listen 443 ssl;|    listen 127.0.0.1:8443 ssl;|' /etc/nginx/sites-available/shapeproject
sudo ln -sf /etc/nginx/sites-available/shapeproject /etc/nginx/sites-enabled/shapeproject
if sudo nginx -t; then
  sudo systemctl reload-or-restart nginx
else
  echo "Config test failed; restoring backups and starting nginx without SHAPE changes."
  sudo cp /root/somas-dr-stream.conf.$TS /etc/nginx/somas-dr-stream.conf
  sudo cp /root/shapeproject.nginx.$TS /etc/nginx/sites-available/shapeproject
  sudo rm -f /etc/nginx/sites-enabled/shapeproject
  sudo systemctl reload-or-restart nginx
fi
systemctl is-active nginx
sudo ss -ltnp | grep -E ':443 |:8443 |:80 '

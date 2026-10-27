#!/usr/bin/env bash
# One-off server hardening after handover. Run from your Mac:
#   ssh -t -i ~/.ssh/id_ed25519 wabwire@197.136.12.54 'bash -s' < deploy/harden-server.sh
# 1. fail2ban against SSH brute force (the auth log shows hundreds of thousands of failed attempts).
# 2. Automatic security updates (no automatic reboot).
# 3. SSH: no password login for wabwire and root (key only). Other users (wanyoike, benito) log in with
#    passwords and are left unchanged so they are not locked out.
# 4. Replace "sudo for everything without a password" with password-free sudo for SHAPE tasks only.
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive NEEDRESTART_MODE=l

echo "== 1. fail2ban"
sudo apt-get install -y -qq fail2ban unattended-upgrades >/dev/null
sudo tee /etc/fail2ban/jail.d/shape-ssh.local >/dev/null <<'J'
# SSH brute-force protection: 5 failures in 10 minutes -> 1 hour ban; repeat offenders -> 1 week.
[sshd]
enabled  = true
backend  = systemd
maxretry = 5
findtime = 10m
bantime  = 1h

[recidive]
enabled  = true
logpath  = /var/log/fail2ban.log
bantime  = 1w
findtime = 1d
maxretry = 3
J
sudo systemctl enable fail2ban >/dev/null 2>&1
sudo systemctl restart fail2ban
sleep 3
sudo fail2ban-client status sshd | grep -E "Currently|Total" || true

echo "== 2. automatic security updates"
sudo tee /etc/apt/apt.conf.d/20auto-upgrades >/dev/null <<'U'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
U
sudo systemctl enable --now unattended-upgrades >/dev/null 2>&1
systemctl is-active unattended-upgrades

echo "== 3. SSH: key-only for wabwire and root"
sudo tee /etc/ssh/sshd_config.d/60-shape-hardening.conf >/dev/null <<'S'
# Key-only login for the server admin and root. Other accounts keep passwords (see deploy/harden-server.sh).
MaxAuthTries 3
LoginGraceTime 30
Match User wabwire,root
    PasswordAuthentication no
    KbdInteractiveAuthentication no
S
sudo sshd -t
sudo systemctl reload ssh
sudo sshd -T -C user=wabwire,host=x,addr=1.1.1.1 | grep -E "^passwordauthentication"
sudo sshd -T -C user=wanyoike,host=x,addr=1.1.1.1 | grep -E "^passwordauthentication"

echo "== 4. sudo limited to SHAPE tasks"
sudo tee /etc/sudoers.d/91-wabwire-shape >/dev/null <<'D'
# Password-free sudo for SHAPE website operations only. Anything else asks for the password.
wabwire ALL=(root) NOPASSWD: /usr/bin/systemctl restart shape, /usr/bin/systemctl status shape, /usr/bin/systemctl start shape, /usr/bin/systemctl stop shape, \
  /usr/bin/journalctl -u shape *, /usr/sbin/nginx -t, /usr/bin/systemctl reload nginx, /usr/bin/certbot renew *, \
  /usr/bin/fail2ban-client status *, /usr/bin/readlink /proc/*/cwd, /usr/bin/tail -n * /var/log/nginx/*
D
sudo chmod 440 /etc/sudoers.d/91-wabwire-shape
sudo visudo -cf /etc/sudoers.d/91-wabwire-shape
sudo rm -f /etc/sudoers.d/90-wabwire-nopasswd
sudo -k
sudo -n systemctl status shape >/dev/null 2>&1 && echo "shape restart/status: allowed without password"
sudo -n true 2>/dev/null && echo "WARNING: broad sudo still active" || echo "other sudo commands now ask for the password"
echo "== done"

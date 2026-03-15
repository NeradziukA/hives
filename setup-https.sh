#!/bin/bash
set -e

DOMAIN="incuby.duckdns.org"
NGINX_CONF="/etc/nginx/sites-available/hives"
NGINX_LINK="/etc/nginx/sites-enabled/hives"

echo "=== 1. Installing nginx and certbot ==="
apt update
apt install -y nginx certbot python3-certbot-nginx

echo "=== 2. Copying nginx config ==="
cp /home/hives/projects/hives/nginx.conf "$NGINX_CONF"

echo "=== 3. Enabling site ==="
ln -sf "$NGINX_CONF" "$NGINX_LINK"
nginx -t
systemctl reload nginx

echo "=== 4. Firewall ==="
ufw allow 80/tcp
ufw allow 443/tcp
ufw delete allow 3000/tcp || true

echo "=== 5. Obtaining SSL certificate ==="
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --redirect -m admin@duckdns.org

echo "=== 6. Verify auto-renewal ==="
certbot renew --dry-run

echo ""
echo "Done! Open https://$DOMAIN"

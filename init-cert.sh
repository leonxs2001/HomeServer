#!/bin/sh

certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email "$CERTBOT_EMAIL" \
  --agree-tos \
  --no-eff-email \
  $(echo "$CERTBOT_DOMAINS" | xargs -n1 echo -d | tr '\n' ' ')

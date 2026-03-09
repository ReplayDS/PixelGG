#!/bin/bash

# Script para configurar SSL com Let's Encrypt na VPS
# Uso: sudo bash setup-ssl.sh dominio.com.br

set -e

DOMAIN=${1:-"pixelgg.com.br"}
EMAIL="admin@${DOMAIN}"

echo "🔒 Iniciando configuração de SSL para $DOMAIN..."

# 1. Instalar Certbot
echo "📦 Instalando Certbot..."
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# 2. Obter certificado SSL
echo "🔐 Obtendo certificado SSL..."
sudo certbot certonly --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL

# 3. Configurar NGINX para SSL
echo "⚙️ Configurando NGINX para SSL..."

NGINX_CONFIG="/etc/nginx/sites-available/pixelgg"

# Backup do arquivo original
sudo cp $NGINX_CONFIG ${NGINX_CONFIG}.bak

# Criar nova configuração com SSL
sudo tee $NGINX_CONFIG > /dev/null <<EOF
# Redirect HTTP para HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

# Configuração HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # Configurações de segurança SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de segurança
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Root do frontend
    root /var/www/PixelGG/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1024;

    # Cache de assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|avif)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Arquivos estáticos
    location ~* \.(html|json|xml|txt|webmanifest|woff|woff2|ttf|eot|otf)$ {
        expires 1d;
        add_header Cache-Control "public";
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Proxy para backend API
    location /api/ {
        proxy_pass http://127.0.0.1:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_request_buffering off;
        client_max_body_size 50m;
    }

    # Todas as outras requisições vão para o index.html (SPA)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    error_page 404 /index.html;
}
EOF

# 4. Testar configuração NGINX
echo "✅ Testando configuração do NGINX..."
sudo nginx -t

# 5. Recarregar NGINX
echo "🔄 Recarregando NGINX..."
sudo systemctl reload nginx

# 6. Configurar renovação automática
echo "🔄 Configurando renovação automática de certificados..."
sudo certbot renew --dry-run

# 7. Adicionar cronjob para renovação
(sudo crontab -l 2>/dev/null | grep -q "certbot renew") || \
  echo "0 3 * * * /usr/bin/certbot renew --quiet && /usr/sbin/service nginx reload" | sudo crontab -

echo ""
echo "✨ SSL configurado com sucesso!"
echo "🌍 Seu site está disponível em: https://$DOMAIN"
echo ""
echo "📋 Proximas etapas:"
echo "1. Atualizar variáveis de ambiente para usar HTTPS"
echo "2. Testar site em: https://$DOMAIN"
echo "3. Verificar certificado: https://www.ssllabs.com/ssltest/"

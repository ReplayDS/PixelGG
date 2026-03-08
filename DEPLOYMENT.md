# 🚀 Deploy PixelGG - Resumo de Produção

## Data do Deploy
**8 de março de 2026**

---

## ✅ Componentes Implantados

### 1. **PostgreSQL Local**
- **Host**: 127.0.0.1
- **Porta**: 5432
- **Banco**: `pixelgg_prod`
- **Usuário**: `pixelgg_prod`
- **Versão**: PostgreSQL 14.22

**Credenciais**:
```
DATABASE_URL="postgresql://pixelgg_prod:SecurePass2026PixelGG@127.0.0.1:5432/pixelgg_prod?schema=public"
```

**Status**: ✅ Online e com tabelas migradas
```
Migrations aplicadas:
- 20260307190000_init
- 20260307203000_auth
```

---

### 2. **Backend Node.js + Express (PM2)**
- **Script**: `npm start` (node server/index.js)
- **Modo**: Cluster (múltiplas instâncias)
- **Porta**: 4000 (localhost)
- **Nome do processo**: `pixelgg-api`
- **Auto-restart**: ✅ Habilitado no systemd (pm2 startup)

**Configuração PM2**:
```
Arquivo: /var/www/PixelGG/ecosystem.config.cjs
- Instances: max (auto detecta núcleos)
- Max memory: 500MB
- Logs: /var/log/pixelgg/
```

**Comandos PM2**:
```bash
pm2 status                    # Ver status
pm2 logs pixelgg-api          # Ver logs
pm2 restart pixelgg-api       # Reiniciar
pm2 delete pixelgg-api        # Parar
```

**Status**: ✅ Rodando em cluster mode

---

### 3. **Frontend React + Vite**
- **Localização**: `/var/www/PixelGG/dist`
- **Arquivo de entrada**: `dist/index.html`
- **Assets**: JS minificado + CSS com gzip
- **Cache**: 30 dias para arquivos estáticos

**Build realizado**:
```
✓ Vite production build
- dist/index.html: 0.45 kB
- dist/assets/index-L03tG98B.css: 35.59 kB (gzip: 7.58 kB)
- dist/assets/index-B3AT75cr.js: 285.75 kB (gzip: 81.04 kB)
```

**Status**: ✅ Compilado e pronto

---

### 4. **Nginx como Reverse Proxy**
- **Arquivo de config**: `/etc/nginx/sites-available/pixelgg`
- **Porta**: 80 (HTTP)
- **Server name**: `151.243.219.69` e `alonco`

**Funcionalidades**:
- ✅ Servir frontend estático de `/var/www/PixelGG/dist`
- ✅ Proxy reverso para `/api/*` → `http://127.0.0.1:4000/api/`
- ✅ Compressão gzip habilitada
- ✅ Cache headers para assets
- ✅ Health check em `/api/health`
- ✅ X-Forwarded-* headers para logging

**Status**: ✅ Ativo e recarregado

---

## 🌐 Acessos Finais

### URLs de Acesso
```
Frontend:  http://151.243.219.69/
API:       http://151.243.219.69/api/
Health:    http://151.243.219.69/api/health
```

### Teste de Saúde
```bash
# API
curl http://151.243.219.69/api/health
# Resposta: {"ok":true,"db":"up"}

# Frontend
curl http://151.243.219.69/
# Resposta: HTML da aplicação React
```

---

## 📁 Estrutura de Pastas

```
/var/www/PixelGG/
├── .env                       # Configurações de produção
├── ecosystem.config.cjs       # PM2 configuration
├── dist/                      # Build do frontend
├── server/                    # API Node.js
├── src/                       # Frontend React (source)
├── prisma/                    # Schema + migrations
│   └── migrations/            # SQL migrations aplicadas
└── node_modules/              # Dependencies

/etc/nginx/sites-available/
└── pixelgg                    # Configuração Nginx

/var/log/pixelgg/
├── error.log                  # Erros do PM2
├── out.log                    # Output do PM2
└── combined.log               # Todos os logs
```

---

## 🔧 Variáveis de Ambiente (.env)

```env
PORT=4000
NODE_ENV="production"
DATABASE_URL="postgresql://pixelgg_prod:SecurePass2026PixelGG@127.0.0.1:5432/pixelgg_prod?schema=public"
CORS_ORIGIN="http://151.243.219.69"
JWT_SECRET="pixelgg_prod_super_secret_march2026_vps_secure_key_change_in_production"
ADMIN_NAME="Administrador PixelGG"
ADMIN_USERNAME="admin"
ADMIN_EMAIL="admin@pixelgg.gg"
ADMIN_PASSWORD="Admin@123456"
```

---

## 📊 Monitoramento

### Ver status dos serviços
```bash
# PM2
pm2 status
pm2 monit                     # Dashboard em tempo real

# Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/access.log

# PostgreSQL
sudo systemctl status postgresql

# Database
psql -U pixelgg_prod -d pixelgg_prod -c "SELECT version();"
```

### Ver logs
```bash
# PM2 logs
pm2 logs pixelgg-api --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u pm2-root -n 50
```

---

## 🔒 Segurança Implementada

✅ PostgreSQL rodando em localhost apenas (não exposto externamente)
✅ JWT_SECRET em .env (mudar em produção!)
✅ Gzip compression habilitada no Nginx
✅ Cache headers configurados
✅ CORS configurado para IP específico
✅ X-Forwarded-* headers para logs corretos
✅ Max upload size: 50MB

---

## 🚀 Como Fazer Deploy de Atualizações

### 1. Atualizar código
```bash
cd /var/www/PixelGG
git pull origin main
```

### 2. Instalar dependências (se necessário)
```bash
npm install
```

### 3. Build do frontend
```bash
npm run build:all
```

### 4. Executar migrations (se necessário)
```bash
npm run prisma:migrate
```

### 5. Reiniciar backend
```bash
pm2 restart pixelgg-api
pm2 save
```

### 6. Recarregar Nginx (se mudar config)
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📋 Checklist de Manutenção

- [ ] Verificar logs diariamente: `pm2 logs pixelgg-api`
- [ ] Backup de database: `pg_dump pixelgg_prod > backup.sql`
- [ ] Monitorar uso de memória: `pm2 monit`
- [ ] Atualizar dependências npm mensalmente
- [ ] Revisar JWT_SECRET em "Segurança Implementada"
- [ ] Certificado HTTPS (usar Let's Encrypt)

---

## ⚠️ Notas Importantes

1. **JWT_SECRET**: Mudar em produção real! Valor atual é apenas exemplo.
2. **CORS_ORIGIN**: Configurado para IP da VPS. Mudar para domínio quando tiver SSL.
3. **Backup**: Implementar rotina de backup de database
4. **SSL/HTTPS**: Usar certbot + Let's Encrypt para HTTPS
5. **Firewall**: Abrir apenas portas 80/443 no firewall externo

---

## 🎯 Status Final

| Componente | Status | Porta | Host |
|-----------|--------|-------|------|
| PostgreSQL | ✅ Online | 5432 | 127.0.0.1 (local) |
| Node.js API | ✅ Online | 4000 | 127.0.0.1 (PM2) |
| Nginx Proxy | ✅ Online | 80 | 151.243.219.69 |
| Frontend | ✅ Online | 80 | Nginx |

**Deploy realizado com sucesso!** 🎉

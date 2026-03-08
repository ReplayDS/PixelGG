<<<<<<< HEAD
# PixelGG

Projeto React (Vite) com API Node/Express e persistência em PostgreSQL via Prisma.

## Stack

- Frontend: React + Vite
- API: Express
- ORM: Prisma
- Banco: PostgreSQL (`pixelgg`)

## Variáveis de ambiente

1. Copie `.env.example` para `.env` e ajuste:

```env
PORT=4000
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:5432/pixelgg?schema=public"
CORS_ORIGIN="http://localhost:5173"
JWT_SECRET="troque_por_uma_chave_forte"
ADMIN_NAME="Administrador PixelGG"
ADMIN_USERNAME="admin"
ADMIN_EMAIL="admin@pixelgg.gg"
ADMIN_PASSWORD="Admin@123456"
```

2. (Opcional no dev) Copie `.env.frontend.example` para `.env.local`:

```env
VITE_API_URL="http://localhost:4000"
```

## Banco de dados

```bash
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
```

Tabelas criadas pelo Prisma:
- `SiteConfig`
- `User`
- `Favorite`
- `Order`

## Desenvolvimento

- Frontend: `npm run dev:web`
- API: `npm run dev:api`
- Ambos juntos: `npm run dev:all`

## Build e Deploy

```bash
npm run build:all
npm run prisma:migrate
npm run db:seed
npm run start
```

Em produção, a API serve `dist/` automaticamente (single-service deploy).

## Endpoints

- `GET /api/health`
- `GET /api/site-data`
- `PUT /api/site-data`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/admin/login`
- `GET /api/auth/me`
- `PUT /api/auth/me/profile`
- `PUT /api/auth/me/password`
- `GET /api/auth/me/favorites`
- `POST /api/auth/me/favorites`
- `DELETE /api/auth/me/favorites/:productId`
- `GET /api/auth/me/orders`
- `POST /api/orders/checkout`
- `GET /api/admin/profile`
- `PUT /api/admin/profile`
- `PUT /api/admin/password`

O frontend agora sincroniza automaticamente todos os dados do site com `site-data` no banco.
=======
# PixelGG
>>>>>>> e3de8ad2d87a47910e870c6e683200988d3022ad

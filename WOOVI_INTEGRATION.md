# Integração Woovi - Checkout com Pix

## Setup

1. **Variáveis de Ambiente (.env)**
   ```
   WOOVI_APP_ID=Q2xpZW50X0lkXzIwZWI3MWRkLTZiNWEtNGI3Ny05YjA4LWU4YTFlYzkwZTkyMjpDbGllbnRfU2VjcmV0X3F1UG15T3RUeGtvU21PMFV5OGl4aFhKV0tzS3V4UWswR2o5Zis3TGNHbEE9
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
   ```

2. **Executar Migração**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

## Endpoints

### POST `/api/checkout/woovi`
Inicia um novo pagamento Pix via Woovi.

**Request:**
```json
{
  "items": [
    {
      "productId": 1,
      "qty": 2,
      "title": "Produto A",
      "price": 50.00,
      "image": "url..."
    }
  ]
}
```

**Response:**
```json
{
  "ok": true,
  "order": { "id": 42, "total": 100.00, "status": "PENDING_PAYMENT", ... },
  "charge": {
    "id": "...",
    "brCode": "00020...",
    "qrCodeUrl": "data:image/..."
  },
  "qrCode": "00020..."
}
```

### GET `/api/checkout/woovi/:chargeId`
Verifica o status de uma cobrança Woovi.

**Response:**
```json
{
  "charge": {
    "id": "...",
    "status": "PENDING|COMPLETED|FAILED|EXPIRED",
    "value": 10000,
    "...": "..."
  }
}
```

## Fluxo de Checkout

1. Usuário clica "Comprar" no carrinho → Navega para `#checkout`
2. Página CheckoutPage exibe resumo do pedido
3. Usuário clica "Pagar com Pix" → Chama `/api/checkout/woovi`
4. Resposta contém QR Code e BR Code (Pix cópia e cola)
5. CheckoutPage faz polling a cada 3 segundos em `/api/checkout/woovi/:chargeId`
6. Quando status = COMPLETED/PAID → Sucesso ✓
7. Webhook Discord é acionado automaticamente

## Modelos de Dados

### Order (atualizado)
```prisma
model Order {
  id              Int
  userId          Int
  total           Float
  status          String      // PENDING, PENDING_PAYMENT, PAID, CANCELLED, REFUNDED
  items           Json
  paymentMethod   String?     // "woovi", "card", etc
  wooviChargeId   String?     // External ID from Woovi
  createdAt       DateTime
  updatedAt       DateTime
}
```

### Chat & Message (novo)
Suporta conversa privada loja ↔ cliente por pedido
- Acesso via `#chat/:orderId`
- Endpoints: GET/POST `/api/orders/:orderId/chat`

## Webhooks Woovi

A API Woovi pode notificar seu servidor quando um pagamento é confirmado. Configure um novo webhook em https://developers.woovi.com:

**URL do Webhook (nosso servidor):**
```
https://seu-dominio.com/api/webhook/woovi
```

**Eventos a escutar:**
- `CHARGE_COMPLETED`
- `CHARGE_FAILED`
- `CHARGE_EXPIRED`

Você precisará implementar:
```javascript
app.post("/api/webhook/woovi", async (req, res) => {
  const event = req.body.event;
  const charge = req.body.data;
  
  if (event === "CHARGE_COMPLETED") {
    // Atualizar Order.status = "PAID"
    // Disparar webhook Discord com confirmação
  }
  
  res.json({ ok: true });
});
```

## Status do Pix

- **PENDING** → Aguardando scaneamento
- **COMPLETED** → Pagamento recebido ✓
- **FAILED** → Transação recusada ✗
- **EXPIRED** → QR Code expirou (1 hora)

## Fluxo Completo (Visão Técnica)

```
[Usuário] → #checkout
    ↓
[CheckoutPage] → POST /api/checkout/woovi
    ↓
[API] → POST https://api.woovi.com/api/v1/charge
    ↓
[Woovi] ← Retorna chargeId, QR Code, BR Code
    ↓
[CheckoutPage] ← Exibe QR Code
    ↓
[Usuário] → Escaneia QR ou copia BR Code
    ↓
[Usuário] → Confirma no app do banco
    ↓
[Woovi] → Recebe pagamento
    ↓
[Woovi] → POST /api/webhook/woovi (opcional)
    ↓
[CheckoutPage] → Poll GET /api/checkout/woovi/:chargeId
    ↓
[Woovi] ← Status COMPLETED
    ↓
[CheckoutPage] → Sucesso + Redireciona para #pedidos
    ↓
[API] → POST DISCORD_WEBHOOK_URL (notificação automática)
```

## Próximas Etapas

- [ ] Implementar webhook recebedor em `/api/webhook/woovi`
- [ ] Transações refund via `/api/refund/woovi/:chargeId`
- [ ] Dashboard admin com estatísticas de vendas Woovi
- [ ] Suporte a múltiplos métodos de pagamento (cartão, transferência)
- [ ] Recovery de pedidos não pagos após 24h

import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "./db.js";

const app = express();
const port = Number(process.env.PORT || 4000);
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
const jwtSecret = process.env.JWT_SECRET || "pixelgg-dev-secret";

// --- woovi integration helpers ---
const WOOVI_APP_ID = process.env.WOOVI_APP_ID || ""; // create API key in Woovi dashboard
const WOOVI_API_BASE = "https://api.woovi.com/api/v1";

async function wooviRequest(path, { method = "GET", body } = {}) {
  if (!WOOVI_APP_ID) throw new Error("WOOVI_APP_ID not configured");
  const res = await fetch(`${WOOVI_API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: WOOVI_APP_ID,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function createWooviCharge(payload) {
  return wooviRequest("/charge", { method: "POST", body: payload });
}


if (!process.env.DATABASE_URL) {
  // eslint-disable-next-line no-console
  console.error("DATABASE_URL nao configurada. Crie o arquivo .env antes de iniciar a API.");
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../dist");

app.use(cors({ origin: corsOrigin === "*" ? true : corsOrigin, credentials: true }));
app.use(express.json({ limit: "10mb" }));

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar || "",
    role: user.role,
    loggedIn: true,
  };
}

function createToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, jwtSecret, { expiresIn: "7d" });
}

function getToken(req) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return null;
  return auth.slice(7).trim();
}

async function authRequired(req, res, next) {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ message: "Nao autenticado." });

    const payload = jwt.verify(token, jwtSecret);
    const user = await prisma.user.findUnique({ where: { id: Number(payload.userId) } });

    if (!user) return res.status(401).json({ message: "Usuario invalido." });

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: "Sessao invalida ou expirada." });
  }
}

function adminRequired(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Acesso restrito ao admin." });
  }
  return next();
}

async function ensureDefaultAdmin() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const email = process.env.ADMIN_EMAIL || "admin@pixelgg.gg";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Administrador PixelGG";

  const existing = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name,
      username,
      email,
      passwordHash,
      role: "ADMIN",
      avatar: "/img/user.png",
    },
  });
}

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: "up" });
  } catch (error) {
    res.status(500).json({ ok: false, db: "down", message: error.message });
  }
});

app.get("/api/site-data", async (_req, res) => {
  try {
    const record = await prisma.siteConfig.findUnique({ where: { id: 1 } });
    res.json({ data: record?.data ?? null, updatedAt: record?.updatedAt ?? null });
  } catch (error) {
    res.status(500).json({ message: "Erro ao carregar dados do site.", detail: error.message });
  }
});

app.put("/api/site-data", async (req, res) => {
  try {
    const payload = req.body;

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return res.status(400).json({ message: "Payload invalido." });
    }

    const saved = await prisma.siteConfig.upsert({
      where: { id: 1 },
      update: { data: payload },
      create: { id: 1, data: payload },
      select: { updatedAt: true },
    });

    return res.json({ ok: true, updatedAt: saved.updatedAt });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao salvar dados do site.", detail: error.message });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body || {};
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "Preencha nome, usuario, email e senha." });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres." });
    }

    const exists = await prisma.user.findFirst({
      where: {
        OR: [{ email: String(email).toLowerCase() }, { username: String(username).toLowerCase() }],
      },
    });

    if (exists) return res.status(409).json({ message: "Email ou usuario ja cadastrado." });

    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        username: String(username).toLowerCase().trim(),
        email: String(email).toLowerCase().trim(),
        passwordHash,
        role: "USER",
        avatar: "/img/user.png",
      },
    });

    const token = createToken(user);
    return res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao registrar usuario.", detail: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { login, password } = req.body || {};
    if (!login || !password) return res.status(400).json({ message: "Informe login e senha." });

    const key = String(login).toLowerCase().trim();
    const user = await prisma.user.findFirst({ where: { OR: [{ email: key }, { username: key }] } });
    if (!user) return res.status(401).json({ message: "Credenciais invalidas." });

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Credenciais invalidas." });

    const token = createToken(user);
    return res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao autenticar.", detail: error.message });
  }
});

app.get("/api/auth/me", authRequired, async (req, res) => {
  return res.json({ user: sanitizeUser(req.user) });
});

app.put("/api/auth/me/profile", authRequired, async (req, res) => {
  try {
    const { name, username, email, avatar } = req.body || {};
    const updates = {};

    if (name) updates.name = String(name).trim();
    if (avatar !== undefined) updates.avatar = String(avatar || "").trim();

    if (username) {
      const value = String(username).toLowerCase().trim();
      const exists = await prisma.user.findFirst({ where: { username: value, NOT: { id: req.user.id } } });
      if (exists) return res.status(409).json({ message: "Usuario ja em uso." });
      updates.username = value;
    }

    if (email) {
      const value = String(email).toLowerCase().trim();
      const exists = await prisma.user.findFirst({ where: { email: value, NOT: { id: req.user.id } } });
      if (exists) return res.status(409).json({ message: "Email ja em uso." });
      updates.email = value;
    }

    const user = await prisma.user.update({ where: { id: req.user.id }, data: updates });
    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao atualizar perfil.", detail: error.message });
  }
});

app.put("/api/auth/me/password", authRequired, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Informe senha atual e nova senha." });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: "A nova senha deve ter ao menos 6 caracteres." });
    }

    const ok = await bcrypt.compare(String(currentPassword), req.user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Senha atual incorreta." });

    const passwordHash = await bcrypt.hash(String(newPassword), 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao atualizar senha.", detail: error.message });
  }
});

app.get("/api/auth/me/favorites", authRequired, async (req, res) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ favorites: favorites.map((f) => f.productId) });
});

app.post("/api/auth/me/favorites", authRequired, async (req, res) => {
  try {
    const { productId } = req.body || {};
    const id = Number(productId);
    if (!id) return res.status(400).json({ message: "Produto invalido." });

    await prisma.favorite.upsert({
      where: { userId_productId: { userId: req.user.id, productId: id } },
      update: {},
      create: { userId: req.user.id, productId: id },
    });

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao favoritar produto.", detail: error.message });
  }
});

app.delete("/api/auth/me/favorites/:productId", authRequired, async (req, res) => {
  try {
    const id = Number(req.params.productId);
    await prisma.favorite.deleteMany({ where: { userId: req.user.id, productId: id } });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao desfavoritar produto.", detail: error.message });
  }
});

app.get("/api/auth/me/orders", authRequired, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ orders });
});


// helper for sending a simple notification to the configured webhook (Discord in our case)
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL ||
  "https://discord.com/api/webhooks/1479296645043589373/i57L5erXha84_lfZlyYyMtXDQ2MzF5TDn5oWoBu0Zoy4pabF1AqC2MYu8nSdu1y3f_xa";

async function notifySale(order) {
  if (!DISCORD_WEBHOOK) return;
  try {
    const content = `Venda confirmada 💸\nPedido #${order.id}\nUsuário: ${order.userId}\nValor: R$ ${order.total.toFixed(2)}\nProdutos: ${order.items
      .map((i) => `${i.title} x${i.qty}`)
      .join(", ")}`;
    await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Failed to send webhook", e);
  }
}

app.post("/api/orders/checkout", authRequired, async (req, res) => {
  try {
    const { items } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Carrinho vazio." });
    }

    const cleanItems = items
      .map((item) => ({
        productId: Number(item.productId),
        qty: Number(item.qty) || 1,
        title: String(item.title || ""),
        price: Number(item.price || 0),
        image: String(item.image || ""),
      }))
      .filter((item) => item.productId && item.qty > 0);

    const total = cleanItems.reduce((sum, item) => sum + item.price * item.qty, 0);

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        total,
        status: "PAID",
        items: cleanItems,
      },
    });

    // trigger webhook notification (fire and forget)
    notifySale(order);

    return res.json({ ok: true, order });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao concluir compra.", detail: error.message });
  }
});


// --- additional endpoints ---

// send a dummy notification to the webhook for manual testing
app.post("/api/orders/test-webhook", authRequired, async (req, res) => {
  try {
    const dummy = {
      id: 0,
      userId: req.user.id,
      total: 123.45,
      items: [
        { productId: 999, title: "Test product", qty: 1, price: 123.45 },
      ],
    };
    await notifySale(dummy);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao enviar webhook de teste.", detail: err.message });
  }
});

// --- WOOVI INTEGRATION ---
app.post("/api/checkout/woovi", authRequired, async (req, res) => {
  try {
    const { items } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Carrinho vazio." });
    }

    const cleanItems = items
      .map((item) => ({
        productId: Number(item.productId),
        qty: Number(item.qty) || 1,
        title: String(item.title || ""),
        price: Number(item.price || 0),
        image: String(item.image || ""),
      }))
      .filter((item) => item.productId && item.qty > 0);

    const total = cleanItems.reduce((sum, item) => sum + item.price * item.qty, 0);

    // create order in PENDING status
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        total,
        status: "PENDING",
        items: cleanItems,
      },
    });

    // call Woovi API to create charge
    const chargeData = await createWooviCharge({
      value: Math.round(total * 100), // in cents
      description: `Pedido #${order.id} - PixelGG`,
      orderId: String(order.id),
      correlationID: crypto.randomUUID(), // unique transaction ID required by Woovi
      customer: {
        name: req.user.name,
        email: req.user.email,
      },
      expiresIn: 3600, // 1 hour
    });

    // Log raw response for debugging
    console.log(`[Woovi] Raw response: ${JSON.stringify(chargeData)}`);

    // Woovi can return different shapes: { data: {...} } or { charge: {...} }
    const actualCharge = (chargeData && (chargeData.data || chargeData.charge)) || chargeData;

    if (!actualCharge || (typeof actualCharge !== "object")) {
      const detail = typeof chargeData === "object" ? JSON.stringify(chargeData) : String(chargeData);
      throw new Error(detail || "Erro ao criar cobrança Woovi");
    }

    // normalize possible fields
    const normalized = {
      ...actualCharge,
      id: actualCharge.id || actualCharge.paymentLinkID || actualCharge.transactionID || actualCharge.identifier,
      qrCodeUrl: actualCharge.qrCodeUrl || actualCharge.qrCodeImage || actualCharge.paymentLinkUrl || null,
      brCode: actualCharge.brCode || null,
      identifier: actualCharge.identifier || actualCharge.transactionID || actualCharge.paymentLinkID || null,
    };

    // Log para debug
    console.log(`[Woovi] Normalized: ${JSON.stringify(normalized)}`);
    console.log(`[Woovi] Order #${order.id}: chargeId=${normalized.id}, identifier=${normalized.identifier}`);

    // store woovi charge ID in order metadata and mark as pending payment
    await prisma.order.update({
      where: { id: order.id },
      data: {
        wooviChargeId: normalized.identifier,
        status: "PENDING_PAYMENT",
      },
    });

    return res.json({
      ok: true,
      order,
      charge: normalized,
      qrCode: normalized.brCode || normalized.qrCodeUrl,
    });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao iniciar pagamento Woovi.", detail: err.message });
  }
});

// check charge status
app.get("/api/checkout/woovi/:chargeId", authRequired, async (req, res) => {
  try {
    const chargeId = req.params.chargeId;
    console.log(`[Woovi] Checking charge: ${chargeId}`);
    
    const chargeData = await wooviRequest(`/charge/${chargeId}`);

    const actualCharge = (chargeData && (chargeData.data || chargeData.charge)) || chargeData;
    if (!actualCharge) return res.status(404).json({ message: "Cobrança não encontrada." });

    // determine payment status from possible fields
    const status = actualCharge.status || actualCharge.paymentMethods?.pix?.status || null;
    console.log(`[Woovi] Charge ${chargeId} status: ${status}`);

    // try to find related order: prefer Woovi orderId, then woovi identifier
    let order = null;
    try {
      if (actualCharge.orderId) {
        const oid = Number(actualCharge.orderId);
        if (Number.isFinite(oid)) {
          order = await prisma.order.findUnique({ where: { id: oid } });
        }
      }
      if (!order && (actualCharge.identifier || actualCharge.transactionID || actualCharge.paymentLinkID)) {
        const ident = actualCharge.identifier || actualCharge.transactionID || actualCharge.paymentLinkID;
        order = await prisma.order.findFirst({ where: { wooviChargeId: ident } });
      }
    } catch (e) {
      // ignore DB lookup errors here
    }

    // if charge is completed/paid and we found an order, mark it paid and notify
    const paidStates = ["COMPLETED", "PAID", "SETTLED", "CONFIRMED"];
    const isPaid = status && paidStates.includes(String(status).toUpperCase());
    if (isPaid && order && order.status !== "PAID") {
      console.log(`[Woovi] Marking order #${order.id} as PAID`);
      const updated = await prisma.order.update({ where: { id: order.id }, data: { status: "PAID" } });
      try { await notifySale(updated); } catch (e) { console.error("[Woovi] Notify error:", e.message); }
      order = updated;
    }

    return res.json({ charge: actualCharge, order: order ?? null });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao verificar cobrança.", detail: err.message });
  }
});

// --- CHECKOUT SESSIONS (persistent, secure, expires in 30 min) ---

// Create a new checkout session (protect with auth; only owner can access)
app.post("/api/checkout", authRequired, async (req, res) => {
  try {
    const { items, customerData } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Carrinho vazio." });
    }

    // clean and validate items
    const cleanItems = items
      .map((item) => ({
        productId: Number(item.productId),
        qty: Number(item.qty) || 1,
        title: String(item.title || ""),
        price: Number(item.price || 0),
        image: String(item.image || ""),
      }))
      .filter((item) => item.productId && item.qty > 0);

    const total = cleanItems.reduce((sum, item) => sum + item.price * item.qty, 0);

    // clean customer data
    const cleanCustomer = {
      firstName: String(customerData?.firstName || "").trim(),
      lastName: String(customerData?.lastName || "").trim(),
      birthDate: String(customerData?.birthDate || "").trim(),
      cpf: String(customerData?.cpf || "").trim(),
      email: req.user.email,
      name: req.user.name,
    };

    // create checkout session with 30-minute expiration
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const checkout = await prisma.checkout.create({
      data: {
        userId: req.user.id,
        items: cleanItems,
        total,
        customerData: cleanCustomer,
        expiresAt,
      },
    });

    return res.json({
      ok: true,
      checkoutId: checkout.id,
      expiresAt: checkout.expiresAt,
    });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao criar sessão de checkout.", detail: err.message });
  }
});

// Get checkout session (only owner can access)
app.get("/api/checkout/:checkoutId", authRequired, async (req, res) => {
  try {
    const checkout = await prisma.checkout.findUnique({
      where: { id: req.params.checkoutId },
    });

    if (!checkout) {
      return res.status(404).json({ message: "Sessão de checkout não encontrada." });
    }

    // security: only owner or admin can access
    if (checkout.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Acesso negado." });
    }

    // check if expired
    if (new Date() > new Date(checkout.expiresAt)) {
      return res.status(410).json({ message: "Sessão de checkout expirou." });
    }

    return res.json({ ok: true, checkout });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao recuperar checkout.", detail: err.message });
  }
});

// Update checkout status (after payment)
app.put("/api/checkout/:checkoutId", authRequired, async (req, res) => {
  try {
    const { status, orderId } = req.body || {};
    const checkout = await prisma.checkout.findUnique({
      where: { id: req.params.checkoutId },
    });

    if (!checkout) {
      return res.status(404).json({ message: "Sessão de checkout não encontrada." });
    }

    // security: only owner or admin
    if (checkout.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Acesso negado." });
    }

    const updated = await prisma.checkout.update({
      where: { id: req.params.checkoutId },
      data: {
        status: status || checkout.status,
        orderId: orderId || checkout.orderId,
      },
    });

    return res.json({ ok: true, checkout: updated });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao atualizar checkout.", detail: err.message });
  }
});

// simple chat infrastructure tied to an order; new models must be added to Prisma schema
app.get("/api/orders/:orderId/chat", authRequired, async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);
    const chat = await prisma.chat.findFirst({
      where: { orderId, userId: req.user.id },
    });
    if (!chat) return res.json({ messages: [] });
    const messages = await prisma.message.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: "asc" },
    });
    return res.json({ messages });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao ler conversas.", detail: err.message });
  }
});

app.post("/api/orders/:orderId/chat", authRequired, async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ message: "Mensagem vazia." });
    let chat = await prisma.chat.findFirst({ where: { orderId, userId: req.user.id } });
    if (!chat) {
      chat = await prisma.chat.create({ data: { orderId, userId: req.user.id } });
    }
    const msg = await prisma.message.create({ data: { chatId: chat.id, senderId: req.user.id, text } });
    return res.json({ message: msg });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao enviar mensagem.", detail: err.message });
  }
});


app.post("/api/auth/admin/login", async (req, res) => {
  try {
    const { login, password } = req.body || {};
    const key = String(login || "").toLowerCase().trim();
    if (!key || !password) return res.status(400).json({ message: "Informe login e senha." });

    const user = await prisma.user.findFirst({ where: { OR: [{ email: key }, { username: key }] } });
    if (!user || user.role !== "ADMIN") {
      return res.status(401).json({ message: "Credenciais de admin invalidas." });
    }

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Credenciais de admin invalidas." });

    const token = createToken(user);
    return res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao autenticar admin.", detail: error.message });
  }
});

app.get("/api/admin/profile", authRequired, adminRequired, async (req, res) => {
  return res.json({ user: sanitizeUser(req.user) });
});

app.put("/api/admin/profile", authRequired, adminRequired, async (req, res) => {
  try {
    const { name, username, email, avatar } = req.body || {};
    const updates = {};

    if (name) updates.name = String(name).trim();
    if (avatar !== undefined) updates.avatar = String(avatar || "").trim();

    if (username) {
      const value = String(username).toLowerCase().trim();
      const exists = await prisma.user.findFirst({ where: { username: value, NOT: { id: req.user.id } } });
      if (exists) return res.status(409).json({ message: "Usuario ja em uso." });
      updates.username = value;
    }

    if (email) {
      const value = String(email).toLowerCase().trim();
      const exists = await prisma.user.findFirst({ where: { email: value, NOT: { id: req.user.id } } });
      if (exists) return res.status(409).json({ message: "Email ja em uso." });
      updates.email = value;
    }

    const user = await prisma.user.update({ where: { id: req.user.id }, data: updates });
    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao atualizar perfil admin.", detail: error.message });
  }
});

app.put("/api/admin/password", authRequired, adminRequired, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Informe senha atual e nova senha." });
    }

    const ok = await bcrypt.compare(String(currentPassword), req.user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Senha atual incorreta." });

    const passwordHash = await bcrypt.hash(String(newPassword), 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao atualizar senha admin.", detail: error.message });
  }
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(distPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }
    return res.sendFile(path.join(distPath, "index.html"));
  });
}

ensureDefaultAdmin()
  .then(() => {
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`[pixelgg-api] running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Falha ao preparar API:", error);
    process.exit(1);
  });

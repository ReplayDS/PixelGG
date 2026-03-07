import React, { useState, useMemo, useEffect } from "react";
import { useSiteData } from "../SiteDataContext";
import "./admin.css";

// ===== SVG ICONS =====
const Ico = {
  Dashboard: ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Content: ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  Hero: ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  Percent: ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  ),
  Image: ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" />
    </svg>
  ),
  Trophy: ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  ),
  Settings: ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Plus: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Pencil: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  ),
  Trash: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  ),
  Search: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  ),
  X: ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  ),
  ArrowLeft: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
    </svg>
  ),
  Organize: ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Grip: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
      <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
    </svg>
  ),
  Package: ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 2 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  ),
  Tag: ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  TrendingUp: ({ s = 20 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Dollar: ({ s = 20 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Eye: ({ s = 20 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

// ===== MOCK METRICS (simulado Ã¢â‚¬â€ sem backend) =====
const MOCK_SALES = 47;
const MOCK_REVENUE = "R$ 3.847,30";
const MOCK_VISITS = "1.203";

// Visitas simuladas por produto (seed estÃƒÂ¡vel)
const MOCK_PRODUCT_VISITS = [342, 287, 241, 198, 176, 154];

function toCurrencyNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value) return 0;
  const normalized = String(value).replace(/\s/g, "").replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatPriceBRL(value) {
  const amount = toCurrencyNumber(value);
  return `R$ ${amount.toFixed(2).replace(".", ",")}`;
}

function calcDiscountText(oldPrice, newPrice) {
  const oldValue = toCurrencyNumber(oldPrice);
  const newValue = toCurrencyNumber(newPrice);
  if (oldValue <= 0 || newValue < 0 || newValue >= oldValue) return "-0%";
  const discount = Math.round(((oldValue - newValue) / oldValue) * 100);
  return `-${discount}%`;
}

// ===== SWITCH =====
function Switch({ checked, onChange }) {
  return (
    <label className="adm-switch">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="adm-switch-slider" />
    </label>
  );
}

// ===== STATUS BADGE (clicÃƒÂ¡vel p/ toggle) =====
function StatusBadge({ active, onClick }) {
  return (
    <span
      className={`adm-badge ${active ? "adm-badge-active" : "adm-badge-inactive"}`}
      onClick={onClick}
      title="Clique para alternar"
    >
      {active ? "Ativo" : "Inativo"}
    </span>
  );
}

// ===== DEFAULTS POR SEÃƒâ€¡ÃƒÆ’O =====
function getDefault(section) {
  if (section === "hero") return { title: "", tag: "", price: "", desc: "", img: "", thumb: "", productId: "", active: true };
  if (section === "spotlight") return { title: "", type: "BASE GAME", discount: "", oldPrice: "", newPrice: "", platforms: [], image: "", active: true };
  if (section === "banners") return { title: "", desc: "", image: "", cta: "Ver promoÃƒÂ§ÃƒÂ£o", active: true };
  if (section === "ranking") return { title: "", subtitle: "", tag: "", discount: "", oldPrice: "", newPrice: "", image: "", active: true };
  if (section === "category") return { name: "", displayType: "grid", showOnIndex: true, active: true };
  if (section === "product") return { categoryId: "", title: "", image: "", youtubeUrl: "", oldPrice: "", newPrice: "", active: true };
  if (section === "rechargeGame") return { title: "", image: "", active: true };
  if (section === "rechargeOption") return { gameId: "", gems: 100, value: 4.9, active: true };
  return {};
}

// ===== FORMULÃƒÂRIOS POR SEÃƒâ€¡ÃƒÆ’O =====
function HeroForm({ form, onChange, products }) {
  return (
    <div className="adm-form">
      <div className="adm-form-row">
        <div className="adm-form-group">
          <label className="adm-label">TÃƒÂ­tulo</label>
          <input className="adm-input" value={form.title} onChange={e => onChange("title", e.target.value)} placeholder="Ex: Hogwarts Legacy" />
        </div>
        <div className="adm-form-group">
          <label className="adm-label">Tag</label>
          <input className="adm-input" value={form.tag} onChange={e => onChange("tag", e.target.value)} placeholder="Ex: DESTAQUE" />
        </div>
      </div>
      <div className="adm-form-row">
        <div className="adm-form-group">
          <label className="adm-label">PreÃƒÂ§o</label>
          <input className="adm-input" value={form.price} onChange={e => onChange("price", e.target.value)} placeholder="Ex: A partir de R$ 49,90" />
        </div>
        <div className="adm-form-group">
          <label className="adm-label">Ordem</label>
          <input className="adm-input" type="number" min="1" value={form.order || ""} onChange={e => onChange("order", Number(e.target.value))} placeholder="1" />
        </div>
      </div>
      <div className="adm-form-group full">
        <label className="adm-label">DescriÃƒÂ§ÃƒÂ£o</label>
        <textarea className="adm-textarea" value={form.desc} onChange={e => onChange("desc", e.target.value)} placeholder="Breve descriÃƒÂ§ÃƒÂ£o do jogo..." />
      </div>
      <div className="adm-form-group full">
        <label className="adm-label">URL da Imagem Principal (banner)</label>
        <input className="adm-input" value={form.img} onChange={e => onChange("img", e.target.value)} placeholder="https://... ou public/img/..." />
      </div>
      <div className="adm-form-group full">
        <label className="adm-label">URL da Miniatura (thumbnail)</label>
        <input className="adm-input" value={form.thumb} onChange={e => onChange("thumb", e.target.value)} placeholder="https://... ou public/img/..." />
      </div>
      <div className="adm-form-group full">
        <label className="adm-label">Linkar com produto existente</label>
        <select
          className="adm-select"
          value={form.productId || ""}
          onChange={e => onChange("productId", Number(e.target.value) || "")}
        >
          <option value="">Nenhum</option>
          {products.map(product => (
            <option key={product.id} value={product.id}>{product.title}</option>
          ))}
        </select>
      </div>
      <div className="adm-toggle-row">
        <div>
          <div className="adm-toggle-label">Ativo no site</div>
          <div className="adm-toggle-sub">Slide visÃƒÂ­vel na home</div>
        </div>
        <Switch checked={form.active} onChange={v => onChange("active", v)} />
      </div>
    </div>
  );
}

function SpotlightForm({ form, onChange }) {
  const PLATFORMS = ["pc", "ps", "xbox"];
  function togglePlatform(p) {
    const current = form.platforms || [];
    onChange("platforms", current.includes(p) ? current.filter(x => x !== p) : [...current, p]);
  }
  return (
    <div className="adm-form">
      <div className="adm-form-group full">
        <label className="adm-label">TÃƒÂ­tulo do produto</label>
        <input className="adm-input" value={form.title} onChange={e => onChange("title", e.target.value)} placeholder="Ex: God of War" />
      </div>
      <div className="adm-form-row">
        <div className="adm-form-group">
          <label className="adm-label">Tipo</label>
          <input className="adm-input" value={form.type} onChange={e => onChange("type", e.target.value)} placeholder="BASE GAME" />
        </div>
        <div className="adm-form-group">
          <label className="adm-label">Desconto</label>
          <input className="adm-input" value={form.discount} onChange={e => onChange("discount", e.target.value)} placeholder="-50%" />
        </div>
      </div>
      <div className="adm-form-row">
        <div className="adm-form-group">
          <label className="adm-label">PreÃƒÂ§o original</label>
          <input className="adm-input" value={form.oldPrice} onChange={e => onChange("oldPrice", e.target.value)} placeholder="R$ 199,90" />
        </div>
        <div className="adm-form-group">
          <label className="adm-label">PreÃƒÂ§o com desconto</label>
          <input className="adm-input" value={form.newPrice} onChange={e => onChange("newPrice", e.target.value)} placeholder="R$ 99,90" />
        </div>
      </div>
      <div className="adm-form-group full">
        <label className="adm-label">Plataformas</label>
        <div className="adm-checkbox-group">
          {PLATFORMS.map(p => (
            <label key={p} className="adm-checkbox-item">
              <input type="checkbox" checked={(form.platforms || []).includes(p)} onChange={() => togglePlatform(p)} />
              {p.toUpperCase()}
            </label>
          ))}
        </div>
      </div>
      <div className="adm-form-group full">
        <label className="adm-label">URL da imagem</label>
        <input className="adm-input" value={form.image} onChange={e => onChange("image", e.target.value)} placeholder="https://..." />
      </div>
      <div className="adm-toggle-row">
        <div>
          <div className="adm-toggle-label">Ativo no site</div>
          <div className="adm-toggle-sub">Card visÃƒÂ­vel na seÃƒÂ§ÃƒÂ£o de ofertas</div>
        </div>
        <Switch checked={form.active} onChange={v => onChange("active", v)} />
      </div>
    </div>
  );
}

function BannersForm({ form, onChange }) {
  return (
    <div className="adm-form">
      <div className="adm-form-group full">
        <label className="adm-label">TÃƒÂ­tulo do banner</label>
        <input className="adm-input" value={form.title} onChange={e => onChange("title", e.target.value)} placeholder="Ex: PromoÃƒÂ§ÃƒÂ£o de Inverno" />
      </div>
      <div className="adm-form-group full">
        <label className="adm-label">DescriÃƒÂ§ÃƒÂ£o</label>
        <textarea className="adm-textarea" value={form.desc} onChange={e => onChange("desc", e.target.value)} placeholder="Texto exibido abaixo do tÃƒÂ­tulo..." />
      </div>
      <div className="adm-form-group full">
        <label className="adm-label">URL da imagem</label>
        <input className="adm-input" value={form.image} onChange={e => onChange("image", e.target.value)} placeholder="https://..." />
      </div>
      <div className="adm-form-group full">
        <label className="adm-label">Texto do botÃƒÂ£o (CTA)</label>
        <input className="adm-input" value={form.cta} onChange={e => onChange("cta", e.target.value)} placeholder="Ver promoÃƒÂ§ÃƒÂ£o" />
      </div>
      <div className="adm-toggle-row">
        <div>
          <div className="adm-toggle-label">Ativo no site</div>
          <div className="adm-toggle-sub">Banner visÃƒÂ­vel na seÃƒÂ§ÃƒÂ£o de promoÃƒÂ§ÃƒÂµes</div>
        </div>
        <Switch checked={form.active} onChange={v => onChange("active", v)} />
      </div>
    </div>
  );
}

function RankingForm({ form, onChange }) {
  return (
    <div className="adm-form">
      <div className="adm-form-row">
        <div className="adm-form-group">
          <label className="adm-label">TÃƒÂ­tulo</label>
          <input className="adm-input" value={form.title} onChange={e => onChange("title", e.target.value)} placeholder="Ex: Elden Ring" />
        </div>
        <div className="adm-form-group">
          <label className="adm-label">Badge/Tag</label>
          <input className="adm-input" value={form.tag} onChange={e => onChange("tag", e.target.value)} placeholder="TOP SELLER" />
        </div>
      </div>
      <div className="adm-form-group full">
        <label className="adm-label">SubtÃƒÂ­tulo</label>
        <input className="adm-input" value={form.subtitle} onChange={e => onChange("subtitle", e.target.value)} placeholder="Ex: Muito procurado" />
      </div>
      <div className="adm-form-row">
        <div className="adm-form-group">
          <label className="adm-label">Desconto</label>
          <input className="adm-input" value={form.discount} onChange={e => onChange("discount", e.target.value)} placeholder="-30%" />
        </div>
        <div className="adm-form-group">
          <label className="adm-label">PreÃƒÂ§o original</label>
          <input className="adm-input" value={form.oldPrice} onChange={e => onChange("oldPrice", e.target.value)} placeholder="R$ 199,90" />
        </div>
      </div>
      <div className="adm-form-row">
        <div className="adm-form-group">
          <label className="adm-label">PreÃƒÂ§o com desconto</label>
          <input className="adm-input" value={form.newPrice} onChange={e => onChange("newPrice", e.target.value)} placeholder="R$ 139,90" />
        </div>
        <div className="adm-form-group">
          <label className="adm-label">URL da imagem</label>
          <input className="adm-input" value={form.image} onChange={e => onChange("image", e.target.value)} placeholder="https://..." />
        </div>
      </div>
      <div className="adm-toggle-row">
        <div>
          <div className="adm-toggle-label">Ativo no site</div>
          <div className="adm-toggle-sub">Item visÃƒÂ­vel no Top 10</div>
        </div>
        <Switch checked={form.active} onChange={v => onChange("active", v)} />
      </div>
    </div>
  );
}

function CategoryForm({ form, onChange }) {
  return (
    <div className="adm-form">
      <div className="adm-form-group full">
        <label className="adm-label">Nome da categoria</label>
        <input
          className="adm-input"
          value={form.name}
          onChange={e => onChange("name", e.target.value)}
          placeholder="Ex: Jogos de acao"
        />
      </div>
      <div className="adm-form-group full">
        <label className="adm-label">Tipo de exibicao</label>
        <select
          className="adm-select"
          value={form.displayType}
          onChange={e => onChange("displayType", e.target.value)}
        >
          <option value="grid">GRID</option>
          <option value="carousel">CARROCEL</option>
          <option value="top10">TOP10</option>
        </select>
      </div>
      <div className="adm-toggle-row">
        <div>
          <div className="adm-toggle-label">Aparecer no index</div>
          <div className="adm-toggle-sub">Mostra esta categoria na home da loja</div>
        </div>
        <Switch checked={!!form.showOnIndex} onChange={v => onChange("showOnIndex", v)} />
      </div>
      <div className="adm-toggle-row">
        <div>
          <div className="adm-toggle-label">Categoria ativa</div>
          <div className="adm-toggle-sub">Permite usar a categoria para vincular produtos</div>
        </div>
        <Switch checked={!!form.active} onChange={v => onChange("active", v)} />
      </div>
    </div>
  );
}

function ProductForm({ form, onChange, categories }) {
  const oldValue = toCurrencyNumber(form.oldPrice);
  const newValue = toCurrencyNumber(form.newPrice);
  const discount = calcDiscountText(oldValue, newValue);

  return (
    <div className="adm-form">
      <div className="adm-form-row">
        <div className="adm-form-group">
          <label className="adm-label">Categoria</label>
          <select
            className="adm-select"
            value={form.categoryId}
            onChange={e => onChange("categoryId", Number(e.target.value))}
          >
            <option value="">Selecione...</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="adm-form-group">
          <label className="adm-label">Desconto calculado</label>
          <input className="adm-input" value={discount} readOnly />
        </div>
      </div>
      <div className="adm-form-group full">
        <label className="adm-label">Titulo do produto</label>
        <input
          className="adm-input"
          value={form.title}
          onChange={e => onChange("title", e.target.value)}
          placeholder="Ex: Elden Ring"
        />
      </div>
      <div className="adm-form-row">
        <div className="adm-form-group">
          <label className="adm-label">Preco original</label>
          <input
            className="adm-input"
            value={form.oldPrice}
            onChange={e => onChange("oldPrice", e.target.value)}
            placeholder="229,90"
          />
        </div>
        <div className="adm-form-group">
          <label className="adm-label">Preco promocional</label>
          <input
            className="adm-input"
            value={form.newPrice}
            onChange={e => onChange("newPrice", e.target.value)}
            placeholder="183,90"
          />
        </div>
      </div>
      <div className="adm-form-group full">
        <label className="adm-label">URL da imagem</label>
        <input
          className="adm-input"
          value={form.image}
          onChange={e => onChange("image", e.target.value)}
          placeholder="https://..."
        />
      </div>
      <div className="adm-form-group full">
        <label className="adm-label">URL do trailer (YouTube)</label>
        <input
          className="adm-input"
          value={form.youtubeUrl || ""}
          onChange={e => onChange("youtubeUrl", e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </div>
      <div className="adm-toggle-row">
        <div>
          <div className="adm-toggle-label">Produto ativo</div>
          <div className="adm-toggle-sub">Se ativo, pode aparecer nas categorias do index</div>
        </div>
        <Switch checked={!!form.active} onChange={v => onChange("active", v)} />
      </div>
    </div>
  );
}

function RechargeGameForm({ form, onChange }) {
  return (
    <div className="adm-form">
      <div className="adm-form-group full">
        <label className="adm-label">Nome do jogo</label>
        <input className="adm-input" value={form.title} onChange={e => onChange("title", e.target.value)} placeholder="Ex: Free Fire" />
      </div>
      <div className="adm-form-group full">
        <label className="adm-label">Imagem do jogo</label>
        <input className="adm-input" value={form.image} onChange={e => onChange("image", e.target.value)} placeholder="https://..." />
      </div>
      <div className="adm-toggle-row">
        <div>
          <div className="adm-toggle-label">Ativo</div>
          <div className="adm-toggle-sub">Exibir jogo na section Recargas</div>
        </div>
        <Switch checked={!!form.active} onChange={v => onChange("active", v)} />
      </div>
    </div>
  );
}

function RechargeOptionForm({ form, onChange, rechargeGames }) {
  return (
    <div className="adm-form">
      <div className="adm-form-group full">
        <label className="adm-label">Jogo da recarga</label>
        <select
          className="adm-select"
          value={form.gameId}
          onChange={e => onChange("gameId", Number(e.target.value))}
        >
          <option value="">Selecione...</option>
          {rechargeGames.map(game => (
            <option key={game.id} value={game.id}>{game.title}</option>
          ))}
        </select>
      </div>
      <div className="adm-form-row">
        <div className="adm-form-group">
          <label className="adm-label">Qtd. de gemas</label>
          <input className="adm-input" type="number" min="1" step="1" value={form.gems} onChange={e => onChange("gems", Number(e.target.value))} />
        </div>
        <div className="adm-form-group">
          <label className="adm-label">Valor (R$)</label>
          <input className="adm-input" type="number" min="0" step="0.1" value={form.value} onChange={e => onChange("value", Number(e.target.value))} />
        </div>
      </div>
      <div className="adm-toggle-row">
        <div>
          <div className="adm-toggle-label">Ativo</div>
          <div className="adm-toggle-sub">DisponÃƒÂ­vel para o slider do usuÃƒÂ¡rio</div>
        </div>
        <Switch checked={!!form.active} onChange={v => onChange("active", v)} />
      </div>
    </div>
  );
}

// ===== MODAL DE EDIÃƒâ€¡ÃƒÆ’O / CRIAÃƒâ€¡ÃƒÆ’O =====
function EditModal({ item, section, onSave, onClose, categories = [], products = [], rechargeGames = [] }) {
  const isNew = !item;
  const [form, setForm] = useState(item ? { ...item } : getDefault(section));

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  const sectionLabels = {
    hero: "Slide do Hero",
    spotlight: "Oferta em Destaque",
    banners: "Banner Promocional",
    ranking: "Item do Top 10",
    category: "Categoria de Produtos",
    product: "Produto",
    rechargeGame: "Jogo de Recarga",
    rechargeOption: "Pacote de Recarga",
  };

  return (
    <div className="adm-modal-backdrop" onClick={onClose}>
      <div className="adm-modal-card" onClick={e => e.stopPropagation()}>
        <div className="adm-modal-head">
          <h3 className="adm-modal-title">{isNew ? "Novo" : "Editar"} {sectionLabels[section]}</h3>
          <button className="adm-btn-icon" onClick={onClose}><Ico.X /></button>
        </div>
        <p className="adm-modal-sub">
          {isNew ? "Preencha os dados para adicionar ao site." : "Edite as informaÃ§Ãµes e salve para atualizar o site."}
        </p>

        {section === "hero" && <HeroForm form={form} onChange={handleChange} products={products} />}
        {section === "spotlight" && <SpotlightForm form={form} onChange={handleChange} />}
        {section === "banners" && <BannersForm form={form} onChange={handleChange} />}
        {section === "ranking" && <RankingForm form={form} onChange={handleChange} />}
        {section === "category" && <CategoryForm form={form} onChange={handleChange} />}
        {section === "product" && <ProductForm form={form} onChange={handleChange} categories={categories} />}
        {section === "rechargeGame" && <RechargeGameForm form={form} onChange={handleChange} />}
        {section === "rechargeOption" && <RechargeOptionForm form={form} onChange={handleChange} rechargeGames={rechargeGames} />}

        <div className="adm-modal-actions">
          <button className="adm-btn adm-btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="adm-btn adm-btn-primary" onClick={() => onSave(form)}>
            {isNew ? "Adicionar" : "Salvar alteraÃ§Ãµes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== DRAG AND DROP LIST =====
function DraggableList({ items, onReorder, renderItem }) {
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);

  function onDragStart(e, i) {
    setDragIdx(i);
    e.dataTransfer.effectAllowed = "move";
  }

  function onDragOver(e, i) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (i !== dragIdx) setOverIdx(i);
  }

  function onDrop(e, i) {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== i) onReorder(dragIdx, i);
    setDragIdx(null);
    setOverIdx(null);
  }

  function onDragEnd() {
    setDragIdx(null);
    setOverIdx(null);
  }

  return (
    <div className="adm-drag-list">
      {items.map((item, i) => (
        <div
          key={item.id ?? i}
          draggable
          className={[
            "adm-drag-item",
            dragIdx === i ? "is-dragging" : "",
            overIdx === i && dragIdx !== i ? "is-over" : "",
          ].filter(Boolean).join(" ")}
          onDragStart={e => onDragStart(e, i)}
          onDragOver={e => onDragOver(e, i)}
          onDrop={e => onDrop(e, i)}
          onDragEnd={onDragEnd}
          onDragLeave={() => setOverIdx(null)}
        >
          <div className="adm-drag-grip"><Ico.Grip /></div>
          <div className="adm-drag-num">{i + 1}</div>
          {renderItem(item, i)}
        </div>
      ))}
    </div>
  );
}

// ===== ORGANIZE SECTION CARD =====
function OrganizeCard({ title, icon: Icon, children }) {
  return (
    <div className="adm-card">
      <div className="adm-card-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="adm-stat-icon" style={{ padding: 8 }}><Icon s={14} /></span>
          <div>
            <div className="adm-card-title">{title}</div>
            <div className="adm-card-desc">Arraste para reordenar</div>
          </div>
        </div>
      </div>
      <div style={{ padding: "0 16px 16px" }}>
        <div className="adm-drag-hint">
          <Ico.Grip s={12} /> Segure e arraste um item para mudar sua posiÃƒÂ§ÃƒÂ£o
        </div>
        {children}
      </div>
    </div>
  );
}

// ===== TABELA GENÃƒâ€°RICA =====
function SectionTable({ title, description, rows, columns, onAdd, onEdit, onDelete }) {
  return (
    <div className="adm-card">
      <div className="adm-card-header">
        <div>
          <div className="adm-card-title">{title}</div>
          <div className="adm-card-desc">{description}</div>
        </div>
        <div className="adm-card-actions">
          <button className="adm-btn adm-btn-secondary" onClick={onAdd}>
            <Ico.Plus /> Novo
          </button>
        </div>
      </div>
      <div className="adm-table-wrap">
        {rows.length === 0 ? (
          <div className="adm-empty">Nenhum item cadastrado. Clique em "Novo" para adicionar.</div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                {columns.map(col => <th key={col.key}>{col.label}</th>)}
                <th>AÃƒÂ§ÃƒÂµes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id}>
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  <td>
                    <div className="adm-table-actions">
                      <button className="adm-btn-icon" title="Editar" onClick={() => onEdit(row)}>
                        <Ico.Pencil />
                      </button>
                      <button className="adm-btn-danger" title="Excluir" onClick={() => onDelete(row.id)}>
                        <Ico.Trash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ===== METRIC CARD =====
function MetricCard({ title, value, hint, icon: Icon, accent }) {
  return (
    <div className="adm-metric-card" style={{ "--accent": accent }}>
      <div className="adm-metric-icon"><Icon s={22} /></div>
      <div className="adm-metric-body">
        <div className="adm-metric-value">{value}</div>
        <div className="adm-metric-title">{title}</div>
        {hint && <div className="adm-metric-hint">{hint}</div>}
      </div>
    </div>
  );
}

// ===== VISITED PRODUCT CARD =====
function VisitedCard({ title, image, price, visits }) {
  return (
    <div className="adm-visited-card">
      <div className="adm-visited-img-wrap">
        <img
          src={image}
          alt={title}
          onError={e => { e.target.style.background = "rgba(255,255,255,0.05)"; e.target.style.opacity = "0"; }}
        />
        <span className="adm-visit-badge">{visits}</span>
      </div>
      <div className="adm-visited-info">
        <div className="adm-visited-title">{title}</div>
        <div className="adm-visited-price">{price}</div>
      </div>
    </div>
  );
}

// ===== MAIN COMPONENT =====
export default function PixelGGAdminPanel() {
  const {
    heroSlides, addHeroSlide, updateHeroSlide, deleteHeroSlide,
    spotlightGames, addSpotlightGame, updateSpotlightGame, deleteSpotlightGame,
    promoBanners, addPromoBanner, updatePromoBanner, deletePromoBanner,
    topGames, addTopGame, updateTopGame, deleteTopGame,
    heroSettings, setHeroSettings,
    reorderHeroSlides, reorderSpotlightGames, reorderPromoBanners, reorderTopGames,
    categories, addCategory, updateCategory, deleteCategory, reorderCategories,
    products, addProduct, updateProduct, deleteProduct,
    topPixelProductIds, toggleTopPixelProduct, reorderTopPixelProducts,
    rechargeGames, addRechargeGame, updateRechargeGame, deleteRechargeGame, reorderRechargeGames,
    rechargeOptions, addRechargeOption, updateRechargeOption, deleteRechargeOption, reorderRechargeOptions,
    userAccount, authLoading, loginAdmin, logoutUser, updateUserProfile, changeUserPassword,
    resetAllData,
  } = useSiteData();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [contentTab, setContentTab] = useState("hero");
  const [productTab, setProductTab] = useState("categorias");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [adminLoginForm, setAdminLoginForm] = useState({ login: "", password: "" });
  const [adminProfileForm, setAdminProfileForm] = useState({ name: "", username: "", email: "", avatar: "" });
  const [adminPasswordForm, setAdminPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [adminMsg, setAdminMsg] = useState("");
  const [adminError, setAdminError] = useState("");

  useEffect(() => {
    setAdminProfileForm({
      name: userAccount.name || "",
      username: userAccount.username || "",
      email: userAccount.email || "",
      avatar: userAccount.avatar || "/img/user.png",
    });
  }, [userAccount]);

  const navItems = [
    { key: "dashboard", label: "VisÃ£o geral", Icon: Ico.Dashboard },
    { key: "conteudo", label: "Conteudo", Icon: Ico.Content },
    { key: "produtos", label: "Produtos", Icon: Ico.Package },
    { key: "organize", label: "Organizar", Icon: Ico.Organize },
    { key: "settings", label: "ConfiguraÃ§Ãµes", Icon: Ico.Settings },
  ];

  const contentTabs = [
    { key: "hero", label: "Hero", Icon: Ico.Hero },
    { key: "banners", label: "Banners", Icon: Ico.Image },
    { key: "ranking", label: "Top 10", Icon: Ico.Trophy },
  ];

  // === Filtered data ===
  const filteredHero = useMemo(() =>
    heroSlides.filter(s => s.title.toLowerCase().includes(search.toLowerCase())),
    [heroSlides, search]);

  const filteredBanners = useMemo(() =>
    promoBanners.filter(b => b.title.toLowerCase().includes(search.toLowerCase())),
    [promoBanners, search]);

  const filteredRanking = useMemo(() =>
    topGames.filter(g => g.title.toLowerCase().includes(search.toLowerCase())),
    [topGames, search]);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories]
  );

  const filteredCategories = useMemo(() =>
    sortedCategories.filter(c => c.name.toLowerCase().includes(search.toLowerCase())),
    [sortedCategories, search]
  );

  const filteredProducts = useMemo(() =>
    products.filter(p => p.title.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );
  const sortedRechargeGames = useMemo(
    () => [...rechargeGames].sort((a, b) => a.order - b.order),
    [rechargeGames]
  );
  const filteredRechargeGames = useMemo(() =>
    sortedRechargeGames.filter(game => game.title.toLowerCase().includes(search.toLowerCase())),
    [sortedRechargeGames, search]
  );
  const filteredRechargeOptions = useMemo(() =>
    rechargeOptions.filter(option => {
      const gameTitle = rechargeGames.find(game => game.id === option.gameId)?.title || "";
      return gameTitle.toLowerCase().includes(search.toLowerCase()) || String(option.gems).includes(search);
    }),
    [rechargeOptions, rechargeGames, search]
  );

  const selectedTopPixelProducts = useMemo(() =>
    (topPixelProductIds || [])
      .map(id => products.find(p => p.id === id))
      .filter(Boolean),
    [topPixelProductIds, products]
  );

  // === Most visited Ã¢â‚¬â€ top 6 spotlight games with mock visit counts ===
  const mostVisited = useMemo(() => {
    const pool = [...spotlightGames.filter(g => g.active), ...topGames.filter(g => g.active)];
    return pool.slice(0, 6).map((g, i) => ({
      ...g,
      visits: MOCK_PRODUCT_VISITS[i] ?? 0,
      price: g.newPrice || g.price || "",
    }));
  }, [spotlightGames, topGames]);

  // === CRUD handlers ===
  function handleSave(form) {
    const { section, item } = modal;
    if (section === "hero") item ? updateHeroSlide(item.id, form) : addHeroSlide(form);
    if (section === "spotlight") item ? updateSpotlightGame(item.id, form) : addSpotlightGame(form);
    if (section === "banners") item ? updatePromoBanner(item.id, form) : addPromoBanner(form);
    if (section === "ranking") item ? updateTopGame(item.id, form) : addTopGame(form);
    if (section === "category") item ? updateCategory(item.id, form) : addCategory(form);
    if (section === "product") {
      const payload = {
        ...form,
        categoryId: Number(form.categoryId),
        oldPrice: toCurrencyNumber(form.oldPrice),
        newPrice: toCurrencyNumber(form.newPrice),
        youtubeUrl: form.youtubeUrl || "",
      };
      item ? updateProduct(item.id, payload) : addProduct(payload);
    }
    if (section === "rechargeGame") item ? updateRechargeGame(item.id, form) : addRechargeGame(form);
    if (section === "rechargeOption") {
      const payload = { ...form, gameId: Number(form.gameId), gems: Number(form.gems), value: Number(form.value) };
      item ? updateRechargeOption(item.id, payload) : addRechargeOption(payload);
    }
    setModal(null);
  }

  function handleDelete(section, id) {
    if (!window.confirm("Excluir este item?")) return;
    if (section === "hero") deleteHeroSlide(id);
    if (section === "spotlight") deleteSpotlightGame(id);
    if (section === "banners") deletePromoBanner(id);
    if (section === "ranking") deleteTopGame(id);
    if (section === "category") deleteCategory(id);
    if (section === "product") deleteProduct(id);
    if (section === "rechargeGame") deleteRechargeGame(id);
    if (section === "rechargeOption") deleteRechargeOption(id);
  }

  function handleToggle(section, id, current) {
    if (section === "hero") updateHeroSlide(id, { active: !current });
    if (section === "spotlight") updateSpotlightGame(id, { active: !current });
    if (section === "banners") updatePromoBanner(id, { active: !current });
    if (section === "ranking") updateTopGame(id, { active: !current });
    if (section === "category") updateCategory(id, { active: !current });
    if (section === "product") updateProduct(id, { active: !current });
    if (section === "rechargeGame") updateRechargeGame(id, { active: !current });
    if (section === "rechargeOption") updateRechargeOption(id, { active: !current });
  }

  async function handleAdminLogin(event) {
    event.preventDefault();
    setAdminError("");
    try {
      await loginAdmin(adminLoginForm);
      setAdminLoginForm({ login: "", password: "" });
    } catch (error) {
      setAdminError(error.message);
    }
  }

  async function handleAdminProfileSave(event) {
    event.preventDefault();
    setAdminMsg("");
    try {
      await updateUserProfile(adminProfileForm);
      setAdminMsg("Perfil do admin atualizado.");
    } catch (error) {
      setAdminMsg(error.message);
    }
  }

  async function handleAdminPasswordSave(event) {
    event.preventDefault();
    setAdminMsg("");
    try {
      await changeUserPassword(adminPasswordForm.currentPassword, adminPasswordForm.newPassword);
      setAdminPasswordForm({ currentPassword: "", newPassword: "" });
      setAdminMsg("Senha do admin atualizada.");
    } catch (error) {
      setAdminMsg(error.message);
    }
  }

  if (authLoading) {
    return (
      <div className="adm-root" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div className="adm-card" style={{ padding: 20 }}>Carregando painel admin...</div>
      </div>
    );
  }

  if (!userAccount.loggedIn || userAccount.role !== "ADMIN") {
    return (
      <div className="adm-root" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div className="adm-card" style={{ width: "100%", maxWidth: 420, padding: 24 }}>
          <div className="adm-card-title" style={{ marginBottom: 8 }}>Login Admin</div>
          <div className="adm-card-desc" style={{ marginBottom: 16 }}>Entre com usuario ou email de administrador.</div>
          <form className="adm-form" onSubmit={handleAdminLogin}>
            <div className="adm-form-group full">
              <label className="adm-label">Usuario ou email</label>
              <input
                className="adm-input"
                value={adminLoginForm.login}
                onChange={(e) => setAdminLoginForm((s) => ({ ...s, login: e.target.value }))}
                placeholder="admin"
              />
            </div>
            <div className="adm-form-group full">
              <label className="adm-label">Senha</label>
              <input
                type="password"
                className="adm-input"
                value={adminLoginForm.password}
                onChange={(e) => setAdminLoginForm((s) => ({ ...s, password: e.target.value }))}
                placeholder="******"
              />
            </div>
            {adminError && <div className="adm-card-desc" style={{ color: "#fca5a5" }}>{adminError}</div>}
            <button className="adm-btn adm-btn-primary" type="submit">Entrar no painel</button>
            <button type="button" className="adm-btn adm-btn-secondary" onClick={() => { window.location.hash = ""; }}>
              Voltar a loja
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="adm-root">
      {/* ===== SIDEBAR ===== */}
      <aside className="adm-sidebar">
        <div className="adm-logo">
          <div className="adm-logo-badge">PX</div>
          <div>
            <div className="adm-logo-sub">Admin Panel</div>
            <div className="adm-logo-title">PIXELGG</div>
          </div>
        </div>

        <nav className="adm-nav">
          {navItems.map(({ key, label, Icon }) => (
            <button
              key={key}
              className={`adm-nav-item${activeSection === key ? " active" : ""}`}
              onClick={() => setActiveSection(key)}
            >
              <span className="adm-nav-icon"><Icon /></span>
              {label}
            </button>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <button className="adm-back-btn" onClick={() => { window.location.hash = ""; }}>
            <span className="adm-nav-icon"><Ico.ArrowLeft /></span>
            Voltar ÃƒÂ  loja
          </button>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="adm-main">
        {/* Top bar */}
        <div className="adm-topbar">
          <div className="adm-topbar-info">
            <p>Painel Admin PixelGG</p>
            <h2>Gerencie as seÃ§Ãµes da PixelGG</h2>
          </div>
          <div className="adm-topbar-actions">
            <div className="adm-search-wrap">
              <span className="adm-search-ico"><Ico.Search /></span>
              <input
                className="adm-search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por titulo..."
              />
            </div>
          </div>
        </div>

        {/* ===== VISÃƒÆ’O GERAL ===== */}
        {activeSection === "dashboard" && (
          <>
            {/* MÃƒÂ©tricas do dia */}
            <div className="adm-metrics-row">
              <MetricCard
                title="Vendas do dia"
                value={MOCK_SALES}
                hint="Pedidos concluÃƒÂ­dos hoje"
                icon={Ico.TrendingUp}
                accent="#6366f1"
              />
              <MetricCard
                title="Total vendido"
                value={MOCK_REVENUE}
                hint="Receita bruta do dia"
                icon={Ico.Dollar}
                accent="#10b981"
              />
              <MetricCard
                title="Visitas no dia"
                value={MOCK_VISITS}
                hint="SessÃƒÂµes ÃƒÂºnicas hoje"
                icon={Ico.Eye}
                accent="#f59e0b"
              />
            </div>

            {/* Produtos mais acessados */}
            <div className="adm-card" style={{ padding: "20px 22px" }}>
              <div className="adm-card-title" style={{ marginBottom: 4 }}>Produtos mais acessados hoje</div>
              <div className="adm-card-desc" style={{ marginBottom: 18 }}>
                NÃƒÂºmero de visitas exibido no canto de cada card
              </div>
              <div className="adm-visited-grid">
                {mostVisited.map((product, i) => (
                  <VisitedCard
                    key={product.id ?? i}
                    title={product.title}
                    image={product.image}
                    price={product.price}
                    visits={product.visits}
                  />
                ))}
                {mostVisited.length === 0 && (
                  <div className="adm-empty">Nenhum produto ativo para exibir.</div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ===== CONTEUDO (Hero + Banners + Top 10) ===== */}
        {activeSection === "conteudo" && (
          <>
            {/* Sub-tabs */}
            <div className="adm-tabs-bar">
              {contentTabs.map(({ key, label }) => (
                <button
                  key={key}
                  className={`adm-tab-btn${contentTab === key ? " active" : ""}`}
                  onClick={() => setContentTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {contentTab === "hero" && (
              <SectionTable
                title="GestÃƒÂ£o do Hero"
                description="Edite os slides do banner principal do topo."
                rows={filteredHero}
                onAdd={() => setModal({ section: "hero", item: null })}
                onEdit={item => setModal({ section: "hero", item })}
                onDelete={id => handleDelete("hero", id)}
                columns={[
                  { key: "order", label: "#" },
                  { key: "title", label: "TÃƒÂ­tulo" },
                  { key: "tag", label: "Tag" },
                  { key: "price", label: "PreÃƒÂ§o" },
                  {
                    key: "active", label: "Status",
                    render: (val, row) => <StatusBadge active={val} onClick={() => handleToggle("hero", row.id, val)} />,
                  },
                ]}
              />
            )}

            {contentTab === "banners" && (
              <SectionTable
                title="Banners promocionais"
                description="Controle os banners da seÃƒÂ§ÃƒÂ£o de promoÃƒÂ§ÃƒÂµes."
                rows={filteredBanners}
                onAdd={() => setModal({ section: "banners", item: null })}
                onEdit={item => setModal({ section: "banners", item })}
                onDelete={id => handleDelete("banners", id)}
                columns={[
                  { key: "title", label: "TÃƒÂ­tulo" },
                  { key: "desc", label: "DescriÃƒÂ§ÃƒÂ£o", render: val => <span title={val}>{val?.substring(0, 40)}{val?.length > 40 ? "Ã¢â‚¬Â¦" : ""}</span> },
                  { key: "cta", label: "CTA" },
                  {
                    key: "active", label: "Status",
                    render: (val, row) => <StatusBadge active={val} onClick={() => handleToggle("banners", row.id, val)} />,
                  },
                ]}
              />
            )}

            {contentTab === "ranking" && (
              <SectionTable
                title="Ranking Top 10"
                description="Organize o ranking semanal da PixelGG."
                rows={filteredRanking}
                onAdd={() => setModal({ section: "ranking", item: null })}
                onEdit={item => setModal({ section: "ranking", item })}
                onDelete={id => handleDelete("ranking", id)}
                columns={[
                  { key: "rank", label: "#" },
                  { key: "title", label: "TÃƒÂ­tulo" },
                  { key: "tag", label: "Badge" },
                  { key: "newPrice", label: "PreÃƒÂ§o" },
                  {
                    key: "active", label: "Status",
                    render: (val, row) => <StatusBadge active={val} onClick={() => handleToggle("ranking", row.id, val)} />,
                  },
                ]}
              />
            )}
          </>
        )}

        {/* ===== PRODUTOS ===== */}
        {activeSection === "produtos" && (
          <>
            <div className="adm-tabs-bar">
              <button
                className={`adm-tab-btn${productTab === "categorias" ? " active" : ""}`}
                onClick={() => setProductTab("categorias")}
              >
                Categorias
              </button>
              <button
                className={`adm-tab-btn${productTab === "produtos" ? " active" : ""}`}
                onClick={() => setProductTab("produtos")}
              >
                Produtos
              </button>
              <button
                className={`adm-tab-btn${productTab === "topPixel" ? " active" : ""}`}
                onClick={() => setProductTab("topPixel")}
              >
                Top Pixel
              </button>
              <button
                className={`adm-tab-btn${productTab === "recargas" ? " active" : ""}`}
                onClick={() => setProductTab("recargas")}
              >
                Recargas
              </button>
            </div>

            {productTab === "categorias" && (
              <div className="adm-organize-grid" style={{ gridTemplateColumns: "1.15fr 0.85fr" }}>
                <SectionTable
                  title="Categorias de produtos"
                  description="Crie categorias e configure exibicao no index."
                  rows={filteredCategories}
                  onAdd={() => setModal({ section: "category", item: null })}
                  onEdit={item => setModal({ section: "category", item })}
                  onDelete={id => handleDelete("category", id)}
                  columns={[
                    { key: "order", label: "#" },
                    { key: "name", label: "Categoria" },
                    { key: "displayType", label: "Layout" },
                    {
                      key: "showOnIndex",
                      label: "Index",
                      render: val => (
                        <span className={`adm-badge ${val ? "adm-badge-active" : "adm-badge-inactive"}`}>
                          {val ? "Sim" : "Nao"}
                        </span>
                      ),
                    },
                    {
                      key: "active",
                      label: "Status",
                      render: (val, row) => <StatusBadge active={val} onClick={() => handleToggle("category", row.id, val)} />,
                    },
                  ]}
                />

                <OrganizeCard title="Sequencia no Index" icon={Ico.Tag}>
                  <DraggableList
                    items={sortedCategories}
                    onReorder={reorderCategories}
                    renderItem={category => (
                      <>
                        <div className="adm-drag-info">
                          <div className="adm-drag-title">{category.name}</div>
                          <div className="adm-drag-sub">
                            {category.displayType?.toUpperCase()} - {category.showOnIndex ? "Index: sim" : "Index: nao"}
                          </div>
                        </div>
                        <StatusBadge active={category.active} onClick={() => handleToggle("category", category.id, category.active)} />
                      </>
                    )}
                  />
                </OrganizeCard>
              </div>
            )}

            {productTab === "produtos" && (
              <SectionTable
                title="Produtos"
                description="Cadastro de produtos com calculo automatico de desconto."
                rows={filteredProducts}
                onAdd={() => setModal({ section: "product", item: null })}
                onEdit={item => setModal({ section: "product", item })}
                onDelete={id => handleDelete("product", id)}
                columns={[
                  { key: "title", label: "Produto" },
                  {
                    key: "categoryId",
                    label: "Categoria",
                    render: value => categories.find(c => c.id === value)?.name || "-",
                  },
                  {
                    key: "discount",
                    label: "Desconto",
                    render: (_, row) => calcDiscountText(row.oldPrice, row.newPrice),
                  },
                  { key: "oldPrice", label: "Preco original", render: value => formatPriceBRL(value) },
                  { key: "newPrice", label: "Preco promo", render: value => formatPriceBRL(value) },
                  {
                    key: "active",
                    label: "Status",
                    render: (val, row) => <StatusBadge active={val} onClick={() => handleToggle("product", row.id, val)} />,
                  },
                ]}
              />
            )}

            {productTab === "topPixel" && (
              <div className="adm-organize-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <OrganizeCard title="Sequencia do Top Pixel" icon={Ico.Trophy}>
                  <DraggableList
                    items={selectedTopPixelProducts}
                    onReorder={reorderTopPixelProducts}
                    renderItem={product => (
                      <>
                        <img
                          className="adm-drag-thumb"
                          src={product.image}
                          alt={product.title}
                          onError={e => { e.target.style.display = "none"; }}
                        />
                        <div className="adm-drag-info">
                          <div className="adm-drag-title">{product.title}</div>
                          <div className="adm-drag-sub">
                            {formatPriceBRL(product.newPrice)} - {calcDiscountText(product.oldPrice, product.newPrice)}
                          </div>
                        </div>
                        <button
                          className="adm-btn adm-btn-secondary"
                          style={{ padding: "6px 10px" }}
                          onMouseDown={e => e.stopPropagation()}
                          onClick={e => {
                            e.stopPropagation();
                            toggleTopPixelProduct(product.id);
                          }}
                        >
                          Remover
                        </button>
                      </>
                    )}
                  />
                  {selectedTopPixelProducts.length === 0 && (
                    <div className="adm-empty">Nenhum produto selecionado para o Top Pixel.</div>
                  )}
                </OrganizeCard>

                <div className="adm-card">
                  <div className="adm-card-header">
                    <div>
                      <div className="adm-card-title">Selecionar produtos</div>
                      <div className="adm-card-desc">Escolha produtos existentes para exibir no Top Pixel.</div>
                    </div>
                  </div>
                  <div className="adm-table-wrap">
                    {filteredProducts.length === 0 ? (
                      <div className="adm-empty">Nenhum produto encontrado.</div>
                    ) : (
                      <table className="adm-table">
                        <thead>
                          <tr>
                            <th>Produto</th>
                            <th>Categoria</th>
                            <th>Preco</th>
                            <th>Acoes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map(product => {
                            const selected = (topPixelProductIds || []).includes(product.id);
                            return (
                              <tr key={product.id}>
                                <td>{product.title}</td>
                                <td>{categories.find(c => c.id === product.categoryId)?.name || "-"}</td>
                                <td>{formatPriceBRL(product.newPrice)}</td>
                                <td>
                                  <button
                                    className={`adm-btn ${selected ? "adm-btn-secondary" : "adm-btn-primary"}`}
                                    style={{ padding: "6px 12px" }}
                                    onClick={() => toggleTopPixelProduct(product.id)}
                                  >
                                    {selected ? "Remover" : "Selecionar"}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            {productTab === "recargas" && (
              <div className="adm-organize-grid">
                <SectionTable
                  title="Jogos de recarga"
                  description="Selecione os jogos exibidos na section de recargas."
                  rows={filteredRechargeGames}
                  onAdd={() => setModal({ section: "rechargeGame", item: null })}
                  onEdit={item => setModal({ section: "rechargeGame", item })}
                  onDelete={id => handleDelete("rechargeGame", id)}
                  columns={[
                    { key: "order", label: "#" },
                    { key: "title", label: "Jogo" },
                    {
                      key: "active",
                      label: "Status",
                      render: (val, row) => <StatusBadge active={val} onClick={() => handleToggle("rechargeGame", row.id, val)} />,
                    },
                  ]}
                />

                <SectionTable
                  title="Pacotes de recarga"
                  description="Defina os valores e quantidade de gemas por jogo."
                  rows={filteredRechargeOptions}
                  onAdd={() => setModal({ section: "rechargeOption", item: null })}
                  onEdit={item => setModal({ section: "rechargeOption", item })}
                  onDelete={id => handleDelete("rechargeOption", id)}
                  columns={[
                    {
                      key: "gameId",
                      label: "Jogo",
                      render: value => rechargeGames.find(game => game.id === value)?.title || "-",
                    },
                    { key: "gems", label: "Gemas" },
                    { key: "value", label: "Valor", render: value => formatPriceBRL(value) },
                    {
                      key: "active",
                      label: "Status",
                      render: (val, row) => <StatusBadge active={val} onClick={() => handleToggle("rechargeOption", row.id, val)} />,
                    },
                  ]}
                />
              </div>
            )}
          </>
        )}

        {/* ===== ORGANIZE TAB ===== */}
        {activeSection === "organize" && (
          <div className="adm-organize-grid">
            <OrganizeCard title="Slides do Hero" icon={Ico.Hero}>
              <DraggableList
                items={[...heroSlides].sort((a, b) => a.order - b.order)}
                onReorder={reorderHeroSlides}
                renderItem={(slide) => (
                  <>
                    <img
                      className="adm-drag-thumb"
                      src={slide.thumb || slide.img}
                      alt={slide.title}
                      onError={e => { e.target.style.display = "none"; }}
                    />
                    <div className="adm-drag-info">
                      <div className="adm-drag-title">{slide.title}</div>
                      <div className="adm-drag-sub">{slide.tag} Ã‚Â· {slide.price}</div>
                    </div>
                    <StatusBadge active={slide.active} onClick={() => handleToggle("hero", slide.id, slide.active)} />
                  </>
                )}
              />
            </OrganizeCard>

            <OrganizeCard title="Ofertas em Destaque" icon={Ico.Percent}>
              <DraggableList
                items={spotlightGames}
                onReorder={reorderSpotlightGames}
                renderItem={(game) => (
                  <>
                    <img
                      className="adm-drag-thumb"
                      src={game.image}
                      alt={game.title}
                      onError={e => { e.target.style.display = "none"; }}
                    />
                    <div className="adm-drag-info">
                      <div className="adm-drag-title">{game.title}</div>
                      <div className="adm-drag-sub">{game.discount} Ã‚Â· {game.newPrice}</div>
                    </div>
                    <StatusBadge active={game.active} onClick={() => handleToggle("spotlight", game.id, game.active)} />
                  </>
                )}
              />
            </OrganizeCard>

            <OrganizeCard title="Banners Promocionais" icon={Ico.Image}>
              <DraggableList
                items={promoBanners}
                onReorder={reorderPromoBanners}
                renderItem={(banner) => (
                  <>
                    <img
                      className="adm-drag-thumb"
                      src={banner.image}
                      alt={banner.title}
                      onError={e => { e.target.style.display = "none"; }}
                    />
                    <div className="adm-drag-info">
                      <div className="adm-drag-title">{banner.title}</div>
                      <div className="adm-drag-sub">{banner.cta}</div>
                    </div>
                    <StatusBadge active={banner.active} onClick={() => handleToggle("banners", banner.id, banner.active)} />
                  </>
                )}
              />
            </OrganizeCard>

            <OrganizeCard title="Top 10 da Semana" icon={Ico.Trophy}>
              <DraggableList
                items={[...topGames].sort((a, b) => a.rank - b.rank)}
                onReorder={reorderTopGames}
                renderItem={(game, i) => (
                  <>
                    <img
                      className="adm-drag-thumb"
                      src={game.image}
                      alt={game.title}
                      onError={e => { e.target.style.display = "none"; }}
                    />
                    <div className="adm-drag-info">
                      <div className="adm-drag-title">{game.title}</div>
                      <div className="adm-drag-sub">#{i + 1} Ã‚Â· {game.newPrice}</div>
                    </div>
                    <StatusBadge active={game.active} onClick={() => handleToggle("ranking", game.id, game.active)} />
                  </>
                )}
              />
            </OrganizeCard>
          </div>
        )}

        {/* ===== SETTINGS TAB ===== */}
        {activeSection === "settings" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div className="adm-card" style={{ padding: "22px" }}>
              <div className="adm-card-title" style={{ marginBottom: 6 }}>Perfil do Admin</div>
              <div className="adm-card-desc" style={{ marginBottom: 20 }}>Editar avatar, usuario, email e senha.</div>
              <form className="adm-form" onSubmit={handleAdminProfileSave} style={{ maxWidth: 600 }}>
                <div className="adm-form-row">
                  <div className="adm-form-group">
                    <label className="adm-label">Nome</label>
                    <input className="adm-input" value={adminProfileForm.name} onChange={(e) => setAdminProfileForm((s) => ({ ...s, name: e.target.value }))} />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">Usuario</label>
                    <input className="adm-input" value={adminProfileForm.username} onChange={(e) => setAdminProfileForm((s) => ({ ...s, username: e.target.value }))} />
                  </div>
                </div>
                <div className="adm-form-row">
                  <div className="adm-form-group">
                    <label className="adm-label">Email</label>
                    <input className="adm-input" value={adminProfileForm.email} onChange={(e) => setAdminProfileForm((s) => ({ ...s, email: e.target.value }))} />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">Avatar URL</label>
                    <input className="adm-input" value={adminProfileForm.avatar} onChange={(e) => setAdminProfileForm((s) => ({ ...s, avatar: e.target.value }))} />
                  </div>
                </div>
                <button className="adm-btn adm-btn-primary" type="submit">Salvar perfil</button>
              </form>

              <form className="adm-form" onSubmit={handleAdminPasswordSave} style={{ maxWidth: 420, marginTop: 14 }}>
                <div className="adm-form-row">
                  <div className="adm-form-group">
                    <label className="adm-label">Senha atual</label>
                    <input type="password" className="adm-input" value={adminPasswordForm.currentPassword} onChange={(e) => setAdminPasswordForm((s) => ({ ...s, currentPassword: e.target.value }))} />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">Nova senha</label>
                    <input type="password" className="adm-input" value={adminPasswordForm.newPassword} onChange={(e) => setAdminPasswordForm((s) => ({ ...s, newPassword: e.target.value }))} />
                  </div>
                </div>
                <button className="adm-btn adm-btn-secondary" type="submit">Alterar senha</button>
              </form>

              {adminMsg && <div className="adm-card-desc" style={{ marginTop: 10 }}>{adminMsg}</div>}
              <button className="adm-btn adm-btn-secondary" style={{ marginTop: 12 }} onClick={logoutUser}>Sair do admin</button>
            </div>

            <div className="adm-card" style={{ padding: "22px" }}>
              <div className="adm-card-title" style={{ marginBottom: 6 }}>Configuracoes do Hero</div>
              <div className="adm-card-desc" style={{ marginBottom: 20 }}>Controles de autoplay e tempo de transicao.</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 480 }}>
                <div className="adm-toggle-row">
                  <div>
                    <div className="adm-toggle-label">Autoplay do hero</div>
                    <div className="adm-toggle-sub">Troca automatica de slides.</div>
                  </div>
                  <Switch checked={heroSettings.autoplay} onChange={v => setHeroSettings(s => ({ ...s, autoplay: v }))} />
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 16px" }}>
                  <div className="adm-toggle-label" style={{ marginBottom: 8 }}>Tempo de transicao</div>
                  <select className="adm-select" value={heroSettings.intervalSeconds} onChange={e => setHeroSettings(s => ({ ...s, intervalSeconds: Number(e.target.value) }))}>
                    <option value={5}>5 segundos</option>
                    <option value={10}>10 segundos</option>
                    <option value={15}>15 segundos</option>
                    <option value={20}>20 segundos</option>
                    <option value={30}>30 segundos</option>
                  </select>
                </div>

                <div style={{ marginTop: 8, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="adm-toggle-label" style={{ marginBottom: 4 }}>Restaurar dados padrao</div>
                  <div className="adm-toggle-sub" style={{ marginBottom: 12 }}>Apaga todas as personalizacoes e volta para o conteudo original.</div>
                  <button
                    className="adm-btn"
                    style={{ background: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.25)" }}
                    onClick={() => {
                      if (window.confirm("Restaurar todos os dados para o padrao? Esta acao nao pode ser desfeita.")) {
                        resetAllData();
                      }
                    }}
                  >
                    Restaurar padrao
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===== MODAL ===== */}
      {modal && (
        <EditModal
          section={modal.section}
          item={modal.item}
          categories={sortedCategories.filter(c => c.active)}
          products={products.filter(product => product.active)}
          rechargeGames={sortedRechargeGames}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}




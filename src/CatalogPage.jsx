import { useMemo, useState } from "react";
import { useSiteData } from "./SiteDataContext";
import SiteHeader from "./SiteHeader";
import "./catalog-page.css";

function formatBRL(value) {
  const numeric = Number(value || 0);
  return `R$ ${numeric.toFixed(2).replace(".", ",")}`;
}

function discountOf(product) {
  const oldValue = Number(product.oldPrice || 0);
  const newValue = Number(product.newPrice || 0);
  if (oldValue <= 0 || newValue >= oldValue) return 0;
  return Math.round(((oldValue - newValue) / oldValue) * 100);
}

export default function CatalogPage({ categoryId }) {
  const { categories, products, addToCart } = useSiteData();
  const [activeCategoryId, setActiveCategoryId] = useState(Number(categoryId) || categories[0]?.id);
  const [onlyDiscount, setOnlyDiscount] = useState(false);
  const [maxPrice, setMaxPrice] = useState(9999);

  const activeCategories = categories.filter(category => category.active);
  const visibleProducts = useMemo(() => {
    return products
      .filter(product => product.active && product.categoryId === activeCategoryId)
      .filter(product => !onlyDiscount || discountOf(product) > 0)
      .filter(product => Number(product.newPrice || 0) <= maxPrice);
  }, [products, activeCategoryId, onlyDiscount, maxPrice]);

  const activeCategoryName = categories.find(category => category.id === activeCategoryId)?.name || "Catalogo";

  return (
    <div className="catalog-wrap">
      <SiteHeader />
      <main className="catalog-main">
        <aside className="catalog-side">
          <div className="catalog-box">
            <h4>Categorias</h4>
            <div className="catalog-cats">
              {activeCategories.map(category => (
                <button
                  key={category.id}
                  className={activeCategoryId === category.id ? "active" : ""}
                  onClick={() => setActiveCategoryId(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="catalog-box">
            <h4>Filtros</h4>
            <label className="catalog-check">
              <input type="checkbox" checked={onlyDiscount} onChange={e => setOnlyDiscount(e.target.checked)} />
              Apenas com desconto
            </label>
            <label className="catalog-label">Preco maximo: {formatBRL(maxPrice)}</label>
            <input type="range" min="10" max="2000" step="10" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} />
          </div>
        </aside>

        <section className="catalog-content">
          <div className="catalog-head">
            <button onClick={() => { window.location.hash = ""; }}>← Voltar</button>
            <h2>{activeCategoryName}</h2>
          </div>

          <div className="catalog-grid">
            {visibleProducts.map(product => (
              <article
                key={product.id}
                className="catalog-card"
                onClick={() => { window.location.hash = `#produto/${product.id}`; }}
              >
                <img src={product.image} alt={product.title} />
                <h3>{product.title}</h3>
                <div className="catalog-prices">
                  <span className="discount">-{discountOf(product)}%</span>
                  <span className="old">{formatBRL(product.oldPrice)}</span>
                  <span className="new">{formatBRL(product.newPrice)}</span>
                </div>
                <button
                  className="catalog-buy"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product.id, 1);
                  }}
                >
                  Comprar
                </button>
              </article>
            ))}
            {visibleProducts.length === 0 && <div className="catalog-empty">Nenhum jogo encontrado para esse filtro.</div>}
          </div>
        </section>
      </main>
    </div>
  );
}

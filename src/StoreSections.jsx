import "./store-sections.css";
import { useSiteData } from "./SiteDataContext";

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value ?? "").replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatBRL(value) {
  return `R$ ${toNumber(value).toFixed(2).replace(".", ",")}`;
}

function getDiscount(oldPrice, newPrice) {
  const oldValue = toNumber(oldPrice);
  const newValue = toNumber(newPrice);
  if (oldValue <= 0 || newValue >= oldValue) return "-0%";
  return `-${Math.round(((oldValue - newValue) / oldValue) * 100)}%`;
}

function ProductCard({ product, onAddToCart }) {
  const discount = getDiscount(product.oldPrice, product.newPrice);

  return (
    <article className="game-card" onClick={() => { window.location.hash = `#produto/${product.id}`; }}>
      <div className="game-thumb">
        <img src={product.image} alt={product.title} />
      </div>
      <h3>{product.title}</h3>
      <div className="game-prices">
        <span className="discount">{discount}</span>
        <span className="old-price">{formatBRL(product.oldPrice)}</span>
        <span className="new-price">{formatBRL(product.newPrice)}</span>
      </div>
      <button
        className="game-add-btn"
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart(product.id);
        }}
      >
        Adicionar
      </button>
    </article>
  );
}

export default function StoreSections() {
  const { categories, products, addToCart } = useSiteData();

  const visibleCategories = [...categories]
    .filter(category => category.active && category.showOnIndex)
    .sort((a, b) => a.order - b.order);

  if (visibleCategories.length === 0) return null;

  return (
    <div className="store-sections">
      {visibleCategories.map(category => {
        const categoryProducts = products.filter(
          product => product.active && product.categoryId === category.id
        );

        if (categoryProducts.length === 0) return null;

        return (
          <section className="catalog-section" key={category.id}>
            <div className="section-header">
              <h2>{category.name}</h2>
              <a href={`#catalogo/${category.id}`}>Ver mais</a>
            </div>

            {category.displayType === "carousel" && (
              <div className="carousel-row">
                {categoryProducts.map(product => (
                  <div className="carousel-item" key={product.id}>
                    <ProductCard product={product} onAddToCart={addToCart} />
                  </div>
                ))}
              </div>
            )}

            {category.displayType === "top10" && (
              <div className="top10-list">
                {categoryProducts.slice(0, 10).map((product, index) => (
                  <article className="top10-item" key={product.id} onClick={() => { window.location.hash = `#produto/${product.id}`; }}>
                    <span className="top10-rank">#{String(index + 1).padStart(2, "0")}</span>
                    <img src={product.image} alt={product.title} />
                    <div className="top10-meta">
                      <h3>{product.title}</h3>
                      <div className="game-prices">
                        <span className="discount">{getDiscount(product.oldPrice, product.newPrice)}</span>
                        <span className="old-price">{formatBRL(product.oldPrice)}</span>
                        <span className="new-price">{formatBRL(product.newPrice)}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {category.displayType === "grid" && (
              <div className="spotlight-grid">
                {categoryProducts.map(product => (
                  <ProductCard product={product} key={product.id} onAddToCart={addToCart} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

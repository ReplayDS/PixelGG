import { useEffect, useState } from "react";
import { useSiteData } from "./SiteDataContext";
import "./top-pixelgg.css";

export default function TopPixelGG() {
  const { products, topPixelProductIds } = useSiteData();
  const selectedProducts = (topPixelProductIds || [])
    .map(id => products.find(product => product.id === id))
    .filter(product => product && product.active);
  const fallbackProducts = products.filter(product => product.active).slice(0, 5);
  const games = selectedProducts.length > 0 ? selectedProducts : fallbackProducts;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (games.length === 0) return;
    const timer = window.setInterval(() => {
      setActiveIndex(prev => ((prev + 1) % games.length + games.length) % games.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [games.length]);

  if (games.length === 0) return null;

  const index = Math.min(activeIndex, games.length - 1);
  const offsets = [-2, -1, 0, 1, 2];
  const visible = offsets.map(offset => {
    const itemIndex = ((index + offset) % games.length + games.length) % games.length;
    return { game: games[itemIndex], offset, itemIndex };
  });

  function openProduct(productId) {
    // eslint-disable-next-line react-hooks/immutability
    window.location.hash = `#produto/${productId}`;
  }

  function navigate(step) {
    setActiveIndex(prev => ((prev + step) % games.length + games.length) % games.length);
  }

  return (
    <section className="topdeck-wrap">
      <div className="topdeck-stage">
        <div className="topdeck-cards">
          {visible.map(({ game, offset, itemIndex }) => (
            <article
              key={game.id}
              className={`topdeck-card${offset === 0 ? " is-center" : ""}`}
              style={{
                "--offset": offset,
                "--distance": Math.abs(offset),
                backgroundImage: `linear-gradient(180deg, rgba(8, 14, 34, 0.28) 0%, rgba(6, 10, 24, 0.55) 100%), url(${game.image})`,
                opacity: 1 - Math.abs(offset) * 0.2,
                zIndex: 20 - Math.abs(offset),
              }}
              onClick={() => offset !== 0 && setActiveIndex(itemIndex)}
            >
              <span className="topdeck-pattern" />
              <div className="topdeck-head">
                <div>
                  <small>TOP10</small>
                  <h3>{game.title}</h3>
                </div>
                <span className="topdeck-score">#{String(itemIndex + 1).padStart(2, "0")}</span>
              </div>
              {offset === 0 && (
                <button
                  className="topdeck-open"
                  onClick={(e) => {
                    e.stopPropagation();
                    openProduct(game.id);
                  }}
                >
                  Ver produto
                </button>
              )}
            </article>
          ))}
        </div>

        <button className="topdeck-arrow left" onClick={() => navigate(-1)} aria-label="Anterior">
          {"<"}
        </button>
        <button className="topdeck-arrow right" onClick={() => navigate(1)} aria-label="Proximo">
          {">"}
        </button>
      </div>
    </section>
  );
}

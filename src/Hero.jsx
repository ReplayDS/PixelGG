import { useEffect, useState } from "react";
import "./hero.css";
import { useSiteData } from "./SiteDataContext";
import SiteHeader from "./SiteHeader";

export default function Hero() {
  const { heroSlides, heroSettings, products, addToCart } = useSiteData();
  const games = heroSlides.filter(s => s.active).sort((a, b) => a.order - b.order);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= games.length && games.length > 0) setIndex(0);
  }, [games.length, index]);

  useEffect(() => {
    if (!heroSettings.autoplay || games.length === 0) return;
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % games.length);
    }, heroSettings.intervalSeconds * 1000);
    return () => clearInterval(timer);
  }, [heroSettings.autoplay, heroSettings.intervalSeconds, games.length]);

  if (games.length === 0) return null;

  const game = games[index] ?? games[0];
  const matchedProduct = products.find(product => product.id === Number(game.productId))
    || products.find(product => product.title.toLowerCase() === (game.title || "").toLowerCase());

  return (
    <div className="hero-wrapper">
      <SiteHeader />

      <section className="hero">
        <div className="banner">
          {games.map((g, i) => (
            <img
              key={g.id ?? i}
              src={g.img}
              alt={g.title}
              className={i === index ? "active" : ""}
            />
          ))}

          <div className="overlay" />

          <div className="banner-content">
            <div className="tag">{game.tag}</div>
            <h1>{game.title}</h1>
            <p>{game.desc}</p>
            <div className="price">{game.price}</div>

            <div className="buttons">
              <button
                className="buy"
                onClick={() => {
                  if (matchedProduct) addToCart(matchedProduct.id, 1);
                }}
              >
                COMPRAR AGORA
              </button>
              <button
                className="details"
                onClick={() => {
                  if (matchedProduct) window.location.hash = `#produto/${matchedProduct.id}`;
                }}
              >
                VER DETALHES
              </button>
            </div>
          </div>
        </div>

        <div className="side">
          {games.map((g, i) => (
            <div
              key={g.id ?? i}
              className={`game ${i === index ? "active" : ""}`}
              onClick={() => setIndex(i)}
            >
              <img src={g.thumb} alt={g.title} />
              <span>{g.title}</span>
              <div className={`progress ${i === index ? "run" : ""}`} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

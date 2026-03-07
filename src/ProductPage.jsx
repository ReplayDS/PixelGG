import { useMemo, useState } from "react";
import { useSiteData } from "./SiteDataContext";
import "./product-page.css";
import SiteHeader from "./SiteHeader";

function formatBRL(value) {
  const numeric = Number(value || 0);
  return `R$ ${numeric.toFixed(2).replace(".", ",")}`;
}

function toYoutubeEmbed(url) {
  if (!url) return "";
  const shortMatch = url.match(/youtu\.be\/([^?&/]+)/i);
  if (shortMatch?.[1]) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const longMatch = url.match(/[?&]v=([^?&/]+)/i);
  if (longMatch?.[1]) return `https://www.youtube.com/embed/${longMatch[1]}`;
  const embedMatch = url.match(/youtube\.com\/embed\/([^?&/]+)/i);
  if (embedMatch?.[1]) return `https://www.youtube.com/embed/${embedMatch[1]}`;
  return "";
}

export default function ProductPage({ productId }) {
  const { products, categories, addToCart, toggleFavorite, userFavorites } = useSiteData();
  const [mediaIndex, setMediaIndex] = useState(0);
  const [favoriteMsg, setFavoriteMsg] = useState("");

  const product = products.find((item) => item.id === Number(productId));
  const categoryName = categories.find((cat) => cat.id === product?.categoryId)?.name || "Games";

  const media = useMemo(() => {
    if (!product) return [];
    return [product.image, product.image, product.image, product.image];
  }, [product]);
  const trailerEmbedUrl = toYoutubeEmbed(product?.youtubeUrl);
  const isFavorite = userFavorites.includes(product?.id);

  if (!product) {
    return (
      <div className="pp-empty">
        <h2>Produto nao encontrado</h2>
        <button onClick={() => { window.location.hash = ""; }}>Voltar para loja</button>
      </div>
    );
  }

  return (
    <div className="pp-wrap">
      <SiteHeader />

      <main className="pp-main">
        <div className="pp-breadcrumb">
          <button onClick={() => { window.location.hash = ""; }}>← Games</button>
          <span>/ {product.title}</span>
        </div>

        <section className="pp-headline">
          <img src={product.image} alt={product.title} />
          <div>
            <h1>{product.title}</h1>
            <div className="pp-meta-line">
              <span>★★★★★</span>
              <span className="pp-chip">4.7</span>
              <span className="pp-chip success">Available in my region</span>
              <span className="pp-chip">Coming soon</span>
            </div>
          </div>
        </section>

        <section className="pp-content">
          <div className="pp-left">
            <div className="pp-video">
              {trailerEmbedUrl ? (
                <iframe
                  src={`${trailerEmbedUrl}?rel=0&modestbranding=1`}
                  title={`Trailer - ${product.title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <img src={media[mediaIndex]} alt={product.title} />
                  <div className="pp-video-bar">
                    <span>▶ 00:00</span>
                    <div className="pp-progress"><span /></div>
                    <span>04:33 ⚙</span>
                  </div>
                </>
              )}
            </div>

            <div className="pp-thumb-row">
              <button className="pp-circle">←</button>
              {media.map((src, index) => (
                <button
                  key={index}
                  className={`pp-thumb ${mediaIndex === index ? "active" : ""}`}
                  onClick={() => setMediaIndex(index)}
                >
                  <img src={src} alt={`${product.title} ${index + 1}`} />
                </button>
              ))}
              <button className="pp-circle">→</button>
            </div>

            <article className="pp-details">
              <h3>Game Details</h3>
              <p>
                No cruzamento de mundos, jogadores exploram historias intensas e batalhas estrategicas.
                Esta pagina segue o estilo visual da referencia com foco em leitura, media e CTA lateral.
              </p>
              <button className="pp-view-more">VIEW MORE</button>
              <div className="pp-specs">
                <div>
                  <div className="pp-k">Developers</div>
                  <div className="pp-v">PixelGG Studio</div>
                </div>
                <div>
                  <div className="pp-k">Release Date</div>
                  <div className="pp-v">07/04/2024</div>
                </div>
                <div>
                  <div className="pp-k">Tags</div>
                  <div className="pp-v">{categoryName}, RPG</div>
                </div>
                <div>
                  <div className="pp-k">Platform</div>
                  <div className="pp-v">PC, Console</div>
                </div>
              </div>
            </article>
          </div>

          <aside className="pp-right">
            <div className="pp-logo"><img src={product.image} alt={product.title} /></div>
            <div className="pp-date">Close Beta Test date: 14/2/2024 4:00 PM</div>
            <button className="pp-download" onClick={() => addToCart(product.id, 1)}>ADICIONAR AO CARRINHO</button>
            <button className="pp-share" onClick={() => addToCart(product.id, 1)}>COMPRAR</button>
            <button
              className="pp-share"
              onClick={async () => {
                try {
                  const nowFavorite = await toggleFavorite(product.id);
                  setFavoriteMsg(nowFavorite ? "Adicionado aos favoritos." : "Removido dos favoritos.");
                } catch (error) {
                  setFavoriteMsg(error.message);
                }
              }}
            >
              {isFavorite ? "REMOVER FAVORITO" : "FAVORITAR"}
            </button>
            {favoriteMsg && <div className="pp-date" style={{ marginTop: 8 }}>{favoriteMsg}</div>}

            <div className="pp-info-table">
              <div><span>Website</span><b>pixelgg.gg</b></div>
              <div><span>Platform</span><b>PC / Console</b></div>
              <div><span>Tags</span><b>{categoryName}, RPG</b></div>
              <div className="pp-price-row"><span>Price</span><b>{formatBRL(product.newPrice)}</b></div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

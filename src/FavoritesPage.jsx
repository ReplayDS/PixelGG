import { useSiteData } from "./SiteDataContext";
import SiteHeader from "./SiteHeader";

function formatBRL(value) {
  const numeric = Number(value || 0);
  return `R$ ${numeric.toFixed(2).replace(".", ",")}`;
}

export default function FavoritesPage() {
  const { favoriteProducts } = useSiteData();

  return (
    <>
      <SiteHeader />
      <div className="page favorites-page">
      <h1>Favoritos</h1>
      {favoriteProducts.length === 0 && <p>Você ainda não favoritou nenhum produto.</p>}
      <div className="site-list">
        {favoriteProducts.map((item) => (
          <div className="site-mini-item" key={item.id}>
            <img src={item.image} alt={item.title} />
            <div>
              <div>{item.title}</div>
              <small>{formatBRL(item.newPrice)}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}

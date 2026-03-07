import "./promo-banners.css";
import { useSiteData } from "./SiteDataContext";

export default function PromoBanners() {
  const { promoBanners: allBanners } = useSiteData();
  const banners = allBanners.filter(b => b.active);

  if (banners.length === 0) return null;

  return (
    <section className="promo-section">
      <div className="promo-container">
        {banners.map((banner, index) => (
          <div className="promo-banner" key={banner.id ?? index}>
            <img src={banner.image} alt={banner.title} />
            <div className="promo-overlay" />
            <div className="promo-content">
              <h3>{banner.title}</h3>
              <p>{banner.desc}</p>
              <button>{banner.cta || "Ver promoção"}</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminPanel from './admin/dashboard.jsx'
import ProductPage from './ProductPage.jsx'
import CatalogPage from './CatalogPage.jsx'
import ProfilePage from './ProfilePage.jsx'
import OrdersPage from './OrdersPage.jsx'
import FavoritesPage from './FavoritesPage.jsx'
import ChatPage from './ChatPage.jsx'
import CheckoutPage from './CheckoutPage.jsx'
import Footer from './Footer.jsx'
import { SiteDataProvider } from './SiteDataContext.jsx'

// eslint-disable-next-line react-refresh/only-export-components
function Router() {
  const [route, setRoute] = useState(() => {
    const hash = window.location.hash || "";
    const path = window.location.pathname || "";
    if (path === "/admin") return { page: "admin" };
    if (hash === "#admin") return { page: "admin" };
    if (hash === "#perfil") return { page: "profile" };
    if (hash === "#pedidos" || hash === "#compras") return { page: "orders" };
    if (hash === "#favorites" || hash === "#favoritos") return { page: "favorites" };
    if (hash === "#checkout") return { page: "checkout" };
    if (hash.startsWith("#chat/")) return { page: "chat", orderId: hash.replace("#chat/", "") };
    if (hash.startsWith("#catalogo/")) return { page: "catalog", categoryId: hash.replace("#catalogo/", "") };
    if (hash.startsWith("#produto/")) return { page: "product", productId: hash.replace("#produto/", "") };
    return { page: "store" };
  });

  useEffect(() => {
    function onHash() {
      const hash = window.location.hash || "";
      const path = window.location.pathname || "";
      if (path === "/admin") {
        setRoute({ page: "admin" });
        return;
      }
      if (hash === "#admin") {
        setRoute({ page: "admin" });
        return;
      }
      if (hash === "#perfil") {
        setRoute({ page: "profile" });
        return;
      }
      if (hash === "#pedidos" || hash === "#compras") {
        setRoute({ page: "orders" });
        return;
      }
      if (hash === "#favoritos") {
        setRoute({ page: "favorites" });
        return;
      }
      if (hash === "#checkout") {
        setRoute({ page: "checkout" });
        return;
      }
      if (hash.startsWith("#chat/")) {
        setRoute({ page: "chat", orderId: hash.replace("#chat/", "") });
        return;
      }
      if (hash.startsWith("#catalogo/")) {
        setRoute({ page: "catalog", categoryId: hash.replace("#catalogo/", "") });
        return;
      }
      if (hash.startsWith("#produto/")) {
        setRoute({ page: "product", productId: hash.replace("#produto/", "") });
        return;
      }
      setRoute({ page: "store" });
    }
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (route.page === 'admin') return <AdminPanel />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        {route.page === "profile" && <ProfilePage />}
        {route.page === "orders" && <OrdersPage />}
        {route.page === "favorites" && <FavoritesPage />}
        {route.page === "checkout" && <CheckoutPage />}
        {route.page === "chat" && <ChatPage orderId={route.orderId} />}
        {route.page === "catalog" && <CatalogPage categoryId={route.categoryId} />}
        {route.page === "product" && <ProductPage productId={route.productId} />}
        {route.page === "store" && <App />}
      </main>
      <Footer />
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SiteDataProvider>
      <Router />
    </SiteDataProvider>
  </StrictMode>,
)

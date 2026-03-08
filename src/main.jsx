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
import { SiteDataProvider } from './SiteDataContext.jsx'

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
  if (route.page === "profile") return <ProfilePage />;
  if (route.page === "orders") return <OrdersPage />;
  if (route.page === "favorites") return <FavoritesPage />;
  if (route.page === "checkout") return <CheckoutPage />;
  if (route.page === "chat") return <ChatPage orderId={route.orderId} />;
  if (route.page === "catalog") return <CatalogPage categoryId={route.categoryId} />;
  if (route.page === "product") return <ProductPage productId={route.productId} />;
  return <App />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SiteDataProvider>
      <Router />
    </SiteDataProvider>
  </StrictMode>,
)

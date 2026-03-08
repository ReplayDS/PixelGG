import { useEffect } from "react";
import { useSiteData } from "./SiteDataContext";
import SiteHeader from "./SiteHeader";

function formatBRL(value) {
  const numeric = Number(value || 0);
  return `R$ ${numeric.toFixed(2).replace(".", ",")}`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR");
}

export default function OrdersPage() {
  const { userOrders } = useSiteData();

  return (
    <>
      <SiteHeader />
      <div className="page orders-page">
      <h1>Meus pedidos</h1>
      {userOrders.length === 0 && <p>Nenhum pedido realizado até o momento.</p>}
      {userOrders.map((order) => (
        <div className="order-item" key={order.id}>
          <div>Pedido #{order.id}</div>
          <small>
            {formatDate(order.createdAt)} • {formatBRL(order.total)}
          </small>
          <ul>
            {Array.isArray(order.items) &&
              order.items.map((i) => (
                <li key={i.productId}>
                  {i.title} x{i.qty} – {formatBRL(i.price)}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
    </>
  );
}

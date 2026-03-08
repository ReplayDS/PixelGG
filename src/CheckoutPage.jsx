import { useEffect, useState } from "react";
import { useSiteData } from "./SiteDataContext";
import SiteHeader from "./SiteHeader";

function formatBRL(value) {
  const numeric = Number(value || 0);
  return `R$ ${numeric.toFixed(2).replace(".", ",")}`;
}

export default function CheckoutPage() {
  const { cartProducts, cartTotal, authToken, userAccount } = useSiteData();
  const [chargeData, setChargeData] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [orderStatus, setOrderStatus] = useState("pending"); // pending, waiting, paid, failed

  if (!userAccount.loggedIn) {
    return (
      <>
        <SiteHeader />
        <div className="page checkout-page">
          <h1>Checkout</h1>
          <p className="site-msg error">Você precisa estar logado para continuar com o pagamento.</p>
          <button className="site-popup-action" onClick={() => { window.location.hash = ""; }}>
            Voltar à loja
          </button>
        </div>
      </>
    );
  }

  if (!authToken) {
    return (
      <>
        <SiteHeader />
        <div className="page checkout-page">
          <h1>Checkout</h1>
          <p className="site-msg error">Erro ao autenticar. Recarregue a página.</p>
          <button className="site-popup-action" onClick={() => { window.location.reload(); }}>
            Recarregar
          </button>
        </div>
      </>
    );
  }

  async function handleInitiatePayment() {
    setLoading(true);
    setError("");
    try {
      const items = cartProducts.map((item) => ({
        productId: item.id,
        qty: item.qty,
        title: item.title,
        price: Number(item.newPrice || 0),
        image: item.image,
      }));

      const res = await fetch("/api/checkout/woovi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao processar pagamento");

      setChargeData(data.charge);
      setOrderStatus("waiting");
      
      // poll for payment confirmation every 3 seconds
      pollPaymentStatus(data.charge.id);
    } catch (err) {
      setError(err.message);
      setOrderStatus("failed");
    } finally {
      setLoading(false);
    }
  }

  async function pollPaymentStatus(chargeId) {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/woovi/${chargeId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = await res.json();
        const status = data.charge.status;

        if (status === "COMPLETED" || status === "PAID") {
          setOrderStatus("paid");
          clearInterval(interval);
        } else if (status === "FAILED" || status === "EXPIRED") {
          setOrderStatus("failed");
          setError("Pagamento expirou ou falhou. Tente novamente.");
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Poll error:", err);
      }
    }, 3000);

    // stop polling after 30 minutes
    setTimeout(() => clearInterval(interval), 30 * 60 * 1000);
  }

  if (cartProducts.length === 0) {
    return (
      <div className="page checkout-page">
        <h1>Carrinho vazio</h1>
        <p>Adicione produtos ao carrinho para continuar.</p>
      </div>
    );
  }

  return (
    <>
      <SiteHeader />
      <div className="page checkout-page">
      <h1>Pagamento</h1>

      <div className="checkout-items">
        <h2>Resumo do pedido</h2>
        {cartProducts.map((item) => (
          <div key={item.id} className="checkout-item">
            <span>{item.title}</span>
            <span>x{item.qty}</span>
            <span>{formatBRL(item.newPrice)}</span>
          </div>
        ))}
        <div className="checkout-total">
          <strong>Total:</strong>
          <strong>{formatBRL(cartTotal)}</strong>
        </div>
      </div>

      {orderStatus === "pending" && (
        <div className="checkout-action">
          <button
            className="site-popup-action"
            onClick={handleInitiatePayment}
            disabled={loading}
          >
            {loading ? "Processando..." : "Pagar com Pix"}
          </button>
          {error && <div className="site-msg error">{error}</div>}
        </div>
      )}

      {orderStatus === "waiting" && chargeData && (
        <div className="checkout-qr-section">
          <h2>Escaneie o QR Code</h2>
          <p>Use o aplicativo do seu banco para ler o código abaixo:</p>
          {chargeData.qrCodeUrl && (
            <img src={chargeData.qrCodeUrl} alt="QR Code Pix" className="qr-code" />
          )}
          {chargeData.brCode && (
            <div className="brcode-section">
              <p>Ou copie o código:</p>
              <code className="brcode">{chargeData.brCode}</code>
              <button
                onClick={() => navigator.clipboard.writeText(chargeData.brCode)}
                className="site-popup-ghost"
              >
                Copiar código
              </button>
            </div>
          )}
          <p className="payment-timeout">Você tem 1 hora para completar o pagamento.</p>
        </div>
      )}

      {orderStatus === "paid" && (
        <div className="checkout-success">
          <h2>✓ Pagamento confirmado!</h2>
          <p>Seu pedido foi aprovado. Em breve você receberá os detalhes no email.</p>
          <button
            className="site-popup-action"
            onClick={() => (window.location.hash = "#pedidos")}
          >
            Ver meus pedidos
          </button>
        </div>
      )}

      {orderStatus === "failed" && (
        <div className="checkout-error">
          <h2>✗ Pagamento não confirmado</h2>
          <p>{error}</p>
          <button className="site-popup-action" onClick={() => setOrderStatus("pending")}>
            Tentar novamente
          </button>
        </div>
      )}
    </div>
    </>
  );
}

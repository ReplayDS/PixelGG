import { useEffect, useState } from "react";
import { useSiteData } from "./SiteDataContext";
import SiteHeader from "./SiteHeader";
import "./checkout-page.css";

function formatBRL(value) {
  const numeric = Number(value || 0);
  return `R$ ${numeric.toFixed(2).replace(".", ",")}`;
}

function formatCPF(cpf) {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return cpf;
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
}

export default function CheckoutPage() {
  const { cartProducts, cartTotal, authToken, userAccount } = useSiteData();
  
  // checkout state
  const [checkoutId, setCheckoutId] = useState(null);
  const [currentStep, setCurrentStep] = useState("customer"); // customer, payment, confirmation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // customer data
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [cpf, setCpf] = useState("");
  
  // payment state
  const [chargeData, setChargeData] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState("pending"); // pending, waiting, paid, failed
  
  // initialize checkout on mount
  useEffect(() => {
    if (cartProducts.length > 0 && authToken) {
      initializeCheckout();
    }
  }, [authToken]);

  async function initializeCheckout() {
    try {
      setLoading(true);
      setError("");
      
      // create checkout session
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          items: cartProducts.map((item) => ({
            productId: item.id,
            qty: item.qty,
            title: item.title,
            price: Number(item.newPrice || 0),
            image: item.image,
          })),
          customerData: {
            firstName: userAccount.name.split(" ")[0] || "",
            lastName: userAccount.name.split(" ").slice(1).join(" ") || "",
          },
        }),
      });

      if (!res.ok) throw new Error("Erro ao inicializar checkout");
      const data = await res.json();
      setCheckoutId(data.checkoutId);
      
      // pre-fill customer data from userAccount
      const nameParts = userAccount.name.split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function proceedToPayment() {
    setLoading(true);
    setError("");
    try {
      if (!firstName.trim()) throw new Error("Nome é obrigatório");
      if (!lastName.trim()) throw new Error("Sobrenome é obrigatório");
      if (!birthDate) throw new Error("Data de nascimento é obrigatória");
      if (!cpf.trim()) throw new Error("CPF é obrigatório");

      // update checkout with customer data
      const res = await fetch(`/api/checkout/${checkoutId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          status: "CUSTOMER_INFO_CONFIRMED",
        }),
      });

      if (!res.ok) throw new Error("Erro ao confirmar dados");
      setCurrentStep("payment");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function initiatePixPayment() {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const items = cartProducts.map((item) => ({
        productId: item.id,
        qty: item.qty,
        title: item.title,
        price: Number(item.newPrice || 0),
        image: item.image,
      }));

      const customer = {
        name: `${firstName} ${lastName}`.trim(),
        email: userAccount.email || "",
        taxId: cpf.replace(/\D/g, ""),
        birthDate: birthDate || undefined,
      };

      const res = await fetch("/api/checkout/woovi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ items, customer }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || "Erro ao processar pagamento");

      setChargeData(data.charge);
      setOrderId(data.order.id);
      setCurrentStep("confirmation");
      setOrderStatus("waiting");
      
      // poll for payment confirmation
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
        const status = data.charge?.status;

        if (status === "COMPLETED" || status === "PAID") {
          setOrderStatus("paid");
          setSuccess("Pagamento confirmado! Seu pedido foi processado com sucesso.");
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

  // --- AUTH CHECKS ---
  if (!userAccount.loggedIn) {
    return (
      <>
        <SiteHeader />
        <div className="checkout-page">
          <div className="checkout-auth-error">
            <h2>Acesso Restrito</h2>
            <p>Você precisa estar logado para continuar com o pagamento.</p>
            <button className="site-popup-action" onClick={() => { window.location.hash = ""; }}>
              Voltar à loja
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!authToken) {
    return (
      <>
        <SiteHeader />
        <div className="checkout-page">
          <div className="checkout-auth-error">
            <h2>Erro de Autenticação</h2>
            <p>Ocorreu um erro ao autenticar sua sessão. Por favor, recarregue a página.</p>
            <button className="site-popup-action" onClick={() => { window.location.reload(); }}>
              Recarregar
            </button>
          </div>
        </div>
      </>
    );
  }

  if (cartProducts.length === 0) {
    return (
      <>
        <SiteHeader />
        <div className="checkout-page">
          <div className="checkout-empty">
            <h2>Carrinho Vazio</h2>
            <p>Adicione produtos ao carrinho para continuar.</p>
            <button className="site-popup-action" onClick={() => { window.location.hash = ""; }}>
              Voltar à loja
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <div className="checkout-page-wrapper">
        
        {/* STEPS INDICATOR */}
        <div className="checkout-steps">
          <div className={`step ${currentStep === "customer" ? "active" : currentStep !== "customer" ? "done" : ""}`}>
            <span className="step-number">1</span>
            <span className="step-label">Dados Pessoais</span>
          </div>
          <div className={`step ${currentStep === "payment" ? "active" : currentStep === "confirmation" ? "done" : ""}`}>
            <span className="step-number">2</span>
            <span className="step-label">Pagamento</span>
          </div>
          <div className={`step ${currentStep === "confirmation" ? "active" : ""}`}>
            <span className="step-number">3</span>
            <span className="step-label">Confirmação</span>
          </div>
        </div>

        <div className="checkout-container">
          
          {/* LEFT COLUMN - ORDER SUMMARY */}
          <div className="checkout-summary">
            <h2>Resumo do Pedido</h2>
            <div className="checkout-items">
              {cartProducts.map((item) => (
                <div key={item.id} className="checkout-item">
                  <div className="item-info">
                    <span className="item-title">{item.title}</span>
                    <span className="item-qty">x{item.qty}</span>
                  </div>
                  <span className="item-price">{formatBRL(item.newPrice)}</span>
                </div>
              ))}
            </div>
            <div className="checkout-divider"></div>
            <div className="checkout-total">
              <span>Total</span>
              <span className="total-value">{formatBRL(cartTotal)}</span>
            </div>
          </div>

          {/* RIGHT COLUMN - CHECKOUT FORM */}
          <div className="checkout-form-container">
            
            {/* STEP 1: CUSTOMER DATA */}
            {currentStep === "customer" && (
              <div className="checkout-step-content">
                <h2>Dados Pessoais</h2>
                <p className="step-description">Preencha seus dados para continuar</p>
                
                <div className="form-group">
                  <label>
                    <span>Nome *</span>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Seu nome"
                      disabled={loading}
                    />
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    <span>Sobrenome *</span>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Seu sobrenome"
                      disabled={loading}
                    />
                  </label>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <span>Data de Nascimento *</span>
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        disabled={loading}
                      />
                    </label>
                  </div>
                  <div className="form-group">
                    <label>
                      <span>CPF *</span>
                      <input
                        type="text"
                        value={cpf}
                        onChange={(e) => setCpf(formatCPF(e.target.value))}
                        placeholder="000.000.000-00"
                        maxLength="14"
                        disabled={loading}
                      />
                    </label>
                  </div>
                </div>

                {error && <div className="checkout-error">{error}</div>}

                <button
                  className="site-popup-action checkout-button"
                  onClick={proceedToPayment}
                  disabled={loading || !firstName || !lastName || !birthDate || !cpf}
                >
                  {loading ? "Processando..." : "Continuar para Pagamento"}
                </button>
              </div>
            )}

            {/* STEP 2: PAYMENT METHOD */}
            {currentStep === "payment" && (
              <div className="checkout-step-content">
                <h2>Método de Pagamento</h2>
                <p className="step-description">Escolha como deseja pagar</p>

                <div className="payment-methods">
                  <div className="payment-method pix active">
                    <div className="method-header">
                      <span className="method-name">Pix</span>
                      <span className="method-icon">🔐</span>
                    </div>
                    <p className="method-description">Transferência instantânea. Segura e rápida.</p>
                    <div className="method-highlight">QR Code gerado na próxima etapa</div>
                  </div>
                </div>

                {error && <div className="checkout-error">{error}</div>}

                <div className="payment-confirmation">
                  <h3>Confirmar Dados</h3>
                  <div className="confirmation-item">
                    <span className="label">Nome:</span>
                    <span className="value">{firstName} {lastName}</span>
                  </div>
                  <div className="confirmation-item">
                    <span className="label">CPF:</span>
                    <span className="value">{cpf}</span>
                  </div>
                  <div className="confirmation-item">
                    <span className="label">Data Nasc.:</span>
                    <span className="value">{new Date(birthDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="confirmation-item highlight">
                    <span className="label">Total a pagar:</span>
                    <span className="value">{formatBRL(cartTotal)}</span>
                  </div>
                </div>

                <div className="button-group">
                  <button
                    className="site-popup-action secondary"
                    onClick={() => setCurrentStep("customer")}
                    disabled={loading}
                  >
                    Voltar
                  </button>
                  <button
                    className="site-popup-action"
                    onClick={initiatePixPayment}
                    disabled={loading}
                  >
                    {loading ? "Gerando QR Code..." : "Pagar com Pix"}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CONFIRMATION */}
            {currentStep === "confirmation" && chargeData && (
              <div className="checkout-step-content">
                <h2>Escaneie o QR Code</h2>
                <p className="step-description">Use o Pix para finalizar a compra</p>

                {/* QR Code Display */}
                {chargeData.qrCodeImage && (
                  <div className="qr-code-display">
                    <img src={chargeData.qrCodeImage} alt="QR Code Pix" className="qr-code-image" />
                    <p className="qr-help">Aponte a câmera do seu celular para escanear</p>
                  </div>
                )}

                {/* BR Code for manual copy-paste */}
                {chargeData.brCode && (
                  <div className="brcode-display">
                    <details>
                      <summary>Ou copie o código Pix abaixo</summary>
                      <div className="brcode-box">
                        <code>{chargeData.brCode}</code>
                        <button
                          className="copy-btn"
                          onClick={() => {
                            navigator.clipboard.writeText(chargeData.brCode);
                            setSuccess("Código copiado!");
                            setTimeout(() => setSuccess(""), 3000);
                          }}
                        >
                          Copiar
                        </button>
                      </div>
                    </details>
                  </div>
                )}

                {/* Status Display */}
                <div className={`payment-status ${orderStatus}`}>
                  {orderStatus === "waiting" && (
                    <>
                      <div className="status-spinner"></div>
                      <p>Aguardando confirmação do pagamento...</p>
                    </>
                  )}
                  {orderStatus === "paid" && (
                    <>
                      <p className="status-success">Pagamento confirmado!</p>
                      <p className="status-message">{success}</p>
                    </>
                  )}
                  {orderStatus === "failed" && (
                    <>
                      <p className="status-error">Pagamento falhou ou expirou</p>
                      <button
                        className="site-popup-action"
                        onClick={() => setCurrentStep("payment")}
                      >
                        Tentar novamente
                      </button>
                    </>
                  )}
                </div>

                {error && <div className="checkout-error">{error}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

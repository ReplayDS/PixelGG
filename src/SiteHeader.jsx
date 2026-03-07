import { useEffect, useState } from "react";
import { useSiteData } from "./SiteDataContext";
import "./site-header.css";

function formatBRL(value) {
  const numeric = Number(value || 0);
  return `R$ ${numeric.toFixed(2).replace(".", ",")}`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString("pt-BR");
}

export default function SiteHeader() {
  const {
    products,
    cartProducts,
    cartTotal,
    removeFromCart,
    updateCartQty,
    clearCart,
    checkoutCart,
    userAccount,
    authLoading,
    loginUser,
    registerUser,
    logoutUser,
    updateUserProfile,
    changeUserPassword,
    favoriteProducts,
    userOrders,
  } = useSiteData();

  const [openPopup, setOpenPopup] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [userTab, setUserTab] = useState("perfil");
  const [authError, setAuthError] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  const [loginForm, setLoginForm] = useState({ login: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", username: "", email: "", password: "" });
  const [profileForm, setProfileForm] = useState({
    name: userAccount.name || "",
    username: userAccount.username || "",
    email: userAccount.email || "",
    avatar: userAccount.avatar || "/img/user.png",
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });

  useEffect(() => {
    setProfileForm({
      name: userAccount.name || "",
      username: userAccount.username || "",
      email: userAccount.email || "",
      avatar: userAccount.avatar || "/img/user.png",
    });
  }, [userAccount]);

  const cartCount = cartProducts.reduce((sum, item) => sum + item.qty, 0);

  async function handleCheckout() {
    try {
      setActionMsg("");
      await checkoutCart();
      setActionMsg("Compra concluida com sucesso.");
      setUserTab("compras");
      setOpenPopup("user");
    } catch (error) {
      setActionMsg(error.message);
      setOpenPopup("user");
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setAuthError("");
    try {
      await loginUser(loginForm);
      setOpenPopup(null);
      setLoginForm({ login: "", password: "" });
    } catch (error) {
      setAuthError(error.message);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setAuthError("");
    try {
      await registerUser(registerForm);
      setOpenPopup(null);
      setRegisterForm({ name: "", username: "", email: "", password: "" });
    } catch (error) {
      setAuthError(error.message);
    }
  }

  async function handleProfileSave(e) {
    e.preventDefault();
    setActionMsg("");
    try {
      await updateUserProfile(profileForm);
      setActionMsg("Perfil atualizado.");
    } catch (error) {
      setActionMsg(error.message);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setActionMsg("");
    try {
      await changeUserPassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setActionMsg("Senha alterada com sucesso.");
    } catch (error) {
      setActionMsg(error.message);
    }
  }

  return (
    <header className="site-header">
      <div className="site-logo-wrap">
        <img src="/img/logo.png" alt="PixelGG" className="site-logo" />
      </div>

      <nav className="site-menu">
        <a>Descobrir</a>
        <a>Navegar</a>
        <a>Noticias</a>
      </nav>

      <div className="site-header-right">
        <input className="site-search" placeholder="Loja de pesquisa" />

        <div className="site-icons">
          <button className="site-icon-btn" onClick={() => setOpenPopup((prev) => (prev === "cart" ? null : "cart"))}>
            <img src="/img/cart.png" alt="Cart" />
            {cartCount > 0 && <span className="site-icon-badge">{cartCount}</span>}
          </button>

          <button className="site-icon-btn" onClick={() => setOpenPopup((prev) => (prev === "user" ? null : "user"))}>
            <img src={userAccount.avatar || "/img/user.png"} alt="User" />
          </button>
        </div>

        {openPopup === "cart" && (
          <div className="site-popup cart">
            <div className="site-popup-title">Carrinho</div>
            {cartProducts.length === 0 && <div className="site-popup-empty">Seu carrinho esta vazio.</div>}
            {cartProducts.map((item) => (
              <div key={item.id} className="site-cart-item">
                <img src={item.image} alt={item.title} />
                <div>
                  <div className="site-cart-name">{item.title}</div>
                  <div className="site-cart-price">{formatBRL(item.newPrice)}</div>
                </div>
                <div className="site-qty-controls">
                  <button onClick={() => updateCartQty(item.id, item.qty - 1)}>-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateCartQty(item.id, item.qty + 1)}>+</button>
                </div>
                <button className="site-remove" onClick={() => removeFromCart(item.id)}>x</button>
              </div>
            ))}
            {cartProducts.length > 0 && (
              <>
                <div className="site-cart-total">Total: {formatBRL(cartTotal)}</div>
                <button className="site-popup-action" onClick={handleCheckout}>Comprar</button>
                <button className="site-popup-ghost" onClick={clearCart}>Limpar carrinho</button>
              </>
            )}
            {actionMsg && <div className="site-msg">{actionMsg}</div>}
          </div>
        )}

        {openPopup === "user" && (
          <div className="site-popup user">
            <div className="site-popup-title">Conta</div>

            {authLoading && <div className="site-popup-empty">Carregando...</div>}

            {!authLoading && !userAccount.loggedIn && (
              <>
                <div className="site-user-auth-tabs">
                  <button className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>Login</button>
                  <button className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")}>Registro</button>
                </div>

                {authMode === "login" && (
                  <form className="site-form" onSubmit={handleLogin}>
                    <input placeholder="Email ou usuario" value={loginForm.login} onChange={(e) => setLoginForm((s) => ({ ...s, login: e.target.value }))} />
                    <input type="password" placeholder="Senha" value={loginForm.password} onChange={(e) => setLoginForm((s) => ({ ...s, password: e.target.value }))} />
                    <button className="site-popup-action" type="submit">Entrar</button>
                  </form>
                )}

                {authMode === "register" && (
                  <form className="site-form" onSubmit={handleRegister}>
                    <input placeholder="Nome" value={registerForm.name} onChange={(e) => setRegisterForm((s) => ({ ...s, name: e.target.value }))} />
                    <input placeholder="Usuario" value={registerForm.username} onChange={(e) => setRegisterForm((s) => ({ ...s, username: e.target.value }))} />
                    <input placeholder="Email" value={registerForm.email} onChange={(e) => setRegisterForm((s) => ({ ...s, email: e.target.value }))} />
                    <input type="password" placeholder="Senha" value={registerForm.password} onChange={(e) => setRegisterForm((s) => ({ ...s, password: e.target.value }))} />
                    <button className="site-popup-action" type="submit">Criar conta</button>
                  </form>
                )}

                {authError && <div className="site-msg error">{authError}</div>}
              </>
            )}

            {!authLoading && userAccount.loggedIn && (
              <>
                <div className="site-user-name">{userAccount.name}</div>
                <div className="site-user-mail">@{userAccount.username} â€¢ {userAccount.email}</div>
                <div className={`site-user-status ${userAccount.role === "ADMIN" ? "admin" : "on"}`}>
                  {userAccount.role === "ADMIN" ? "Administrador" : "Usuario"}
                </div>

                <div className="site-user-nav">
                  <button className={userTab === "perfil" ? "active" : ""} onClick={() => setUserTab("perfil")}>Editar Perfil</button>
                  <button className={userTab === "compras" ? "active" : ""} onClick={() => setUserTab("compras")}>Produtos adquiridos</button>
                  <button className={userTab === "favoritos" ? "active" : ""} onClick={() => setUserTab("favoritos")}>Favoritos</button>
                </div>

                {userTab === "perfil" && (
                  <>
                    <form className="site-form" onSubmit={handleProfileSave}>
                      <input placeholder="Nome" value={profileForm.name} onChange={(e) => setProfileForm((s) => ({ ...s, name: e.target.value }))} />
                      <input placeholder="Usuario" value={profileForm.username} onChange={(e) => setProfileForm((s) => ({ ...s, username: e.target.value }))} />
                      <input placeholder="Email" value={profileForm.email} onChange={(e) => setProfileForm((s) => ({ ...s, email: e.target.value }))} />
                      <input placeholder="URL avatar" value={profileForm.avatar} onChange={(e) => setProfileForm((s) => ({ ...s, avatar: e.target.value }))} />
                      <button className="site-popup-action" type="submit">Salvar perfil</button>
                    </form>
                    <form className="site-form" onSubmit={handleChangePassword}>
                      <input type="password" placeholder="Senha atual" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((s) => ({ ...s, currentPassword: e.target.value }))} />
                      <input type="password" placeholder="Nova senha" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((s) => ({ ...s, newPassword: e.target.value }))} />
                      <button className="site-popup-ghost" type="submit">Alterar senha</button>
                    </form>
                  </>
                )}

                {userTab === "favoritos" && (
                  <div className="site-list">
                    {favoriteProducts.length === 0 && <div className="site-popup-empty">Nenhum favorito.</div>}
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
                )}

                {userTab === "compras" && (
                  <div className="site-list">
                    {userOrders.length === 0 && <div className="site-popup-empty">Nenhuma compra ainda.</div>}
                    {userOrders.map((order) => (
                      <div className="site-order-item" key={order.id}>
                        <div>Pedido #{order.id}</div>
                        <small>{formatDate(order.createdAt)} â€¢ {formatBRL(order.total)}</small>
                      </div>
                    ))}
                  </div>
                )}

                <button className="site-popup-danger" onClick={logoutUser}>Sair</button>
                {userAccount.role === "ADMIN" && (
                  <button className="site-popup-ghost" onClick={() => { window.location.hash = "#admin"; }}>
                    Abrir painel admin
                  </button>
                )}
                {actionMsg && <div className="site-msg">{actionMsg}</div>}
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

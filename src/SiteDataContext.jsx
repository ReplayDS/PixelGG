import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { cloneInitialSiteData } from "./defaultSiteData";

const SiteDataContext = createContext(null);

const apiBase = (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
const siteDataEndpoint = `${apiBase}/api/site-data`;
const authTokenKey = "pixelgg_auth_token";

function reorderArr(arr, from, to) {
  const result = [...arr];
  const [removed] = result.splice(from, 1);
  result.splice(to, 0, removed);
  return result;
}

function getMaxId(snapshot) {
  const candidates = [
    snapshot.heroSlides,
    snapshot.spotlightGames,
    snapshot.promoBanners,
    snapshot.topGames,
    snapshot.categories,
    snapshot.products,
    snapshot.rechargeGames,
    snapshot.rechargeOptions,
  ];

  return candidates
    .flatMap((arr) => arr || [])
    .reduce((max, item) => (typeof item?.id === "number" ? Math.max(max, item.id) : max), 200);
}

function normalizeData(incoming) {
  const base = cloneInitialSiteData();

  if (!incoming || typeof incoming !== "object") {
    return base;
  }

  Object.keys(base).forEach((key) => {
    const current = base[key];
    const received = incoming[key];

    if (Array.isArray(current)) {
      base[key] = Array.isArray(received) ? received : current;
      return;
    }

    if (current && typeof current === "object") {
      base[key] = received && typeof received === "object" && !Array.isArray(received) ? received : current;
      return;
    }

    base[key] = received ?? current;
  });

  return base;
}

function getStoredToken() {
  try {
    return localStorage.getItem(authTokenKey) || "";
  } catch {
    return "";
  }
}

function setStoredToken(token) {
  try {
    if (!token) {
      localStorage.removeItem(authTokenKey);
      return;
    }
    localStorage.setItem(authTokenKey, token);
  } catch {
    // noop
  }
}

async function request(path, { method = "GET", body, token } = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || "Erro na requisicao.");
  }
  return payload;
}

export function useSiteData() {
  return useContext(SiteDataContext);
}

export function SiteDataProvider({ children }) {
  const defaults = useMemo(() => cloneInitialSiteData(), []);
  const nextIdRef = useRef(getMaxId(defaults));

  const [heroSlides, setHeroSlides] = useState(defaults.heroSlides);
  const [spotlightGames, setSpotlightGames] = useState(defaults.spotlightGames);
  const [promoBanners, setPromoBanners] = useState(defaults.promoBanners);
  const [topGames, setTopGames] = useState(defaults.topGames);
  const [heroSettings, setHeroSettings] = useState(defaults.heroSettings);
  const [categories, setCategories] = useState(defaults.categories);
  const [products, setProducts] = useState(defaults.products);
  const [topPixelProductIds, setTopPixelProductIds] = useState(defaults.topPixelProductIds);
  const [cartItems, setCartItems] = useState(defaults.cartItems);
  const [rechargeGames, setRechargeGames] = useState(defaults.rechargeGames);
  const [rechargeOptions, setRechargeOptions] = useState(defaults.rechargeOptions);

  const [isRemoteReady, setIsRemoteReady] = useState(false);
  const [authToken, setAuthToken] = useState(() => getStoredToken());
  const [userAccount, setUserAccount] = useState({
    id: null,
    name: "Visitante",
    username: "",
    email: "",
    avatar: "/img/user.png",
    role: "USER",
    loggedIn: false,
  });
  const [userFavorites, setUserFavorites] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);

  function nextId() {
    nextIdRef.current += 1;
    return nextIdRef.current;
  }

  const contentSnapshot = useMemo(
    () => ({
      heroSlides,
      spotlightGames,
      promoBanners,
      topGames,
      heroSettings,
      categories,
      products,
      topPixelProductIds,
      rechargeGames,
      rechargeOptions,
    }),
    [
      heroSlides,
      spotlightGames,
      promoBanners,
      topGames,
      heroSettings,
      categories,
      products,
      topPixelProductIds,
      rechargeGames,
      rechargeOptions,
    ]
  );

  const cartProducts = useMemo(() => {
    return cartItems
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        return { ...product, qty: item.qty };
      })
      .filter(Boolean);
  }, [cartItems, products]);

  const cartTotal = useMemo(
    () => cartProducts.reduce((sum, item) => sum + Number(item.newPrice || 0) * item.qty, 0),
    [cartProducts]
  );

  const favoriteProducts = useMemo(
    () => products.filter((product) => userFavorites.includes(product.id)),
    [products, userFavorites]
  );

  useEffect(() => {
    let active = true;

    async function loadFromDatabase() {
      try {
        const response = await fetch(siteDataEndpoint);
        if (!response.ok) throw new Error(`Falha ao carregar dados: ${response.status}`);

        const payload = await response.json();
        if (!active) return;

        if (payload?.data) {
          const merged = normalizeData(payload.data);
          nextIdRef.current = getMaxId(merged);
          setHeroSlides(merged.heroSlides);
          setSpotlightGames(merged.spotlightGames);
          setPromoBanners(merged.promoBanners);
          setTopGames(merged.topGames);
          setHeroSettings(merged.heroSettings);
          setCategories(merged.categories);
          setProducts(merged.products);
          setTopPixelProductIds(merged.topPixelProductIds);
          setRechargeGames(merged.rechargeGames);
          setRechargeOptions(merged.rechargeOptions);
        }
      } catch {
        // keep defaults
      } finally {
        if (active) setIsRemoteReady(true);
      }
    }

    loadFromDatabase();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isRemoteReady) return;

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        await fetch(siteDataEndpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contentSnapshot),
          signal: controller.signal,
        });
      } catch {
        // retry on next change
      }
    }, 350);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [contentSnapshot, isRemoteReady]);

  async function loadUserData(token) {
    if (!token) {
      setUserAccount({
        id: null,
        name: "Visitante",
        username: "",
        email: "",
        avatar: "/img/user.png",
        role: "USER",
        loggedIn: false,
      });
      setUserFavorites([]);
      setUserOrders([]);
      return;
    }

    const [{ user }, favData, orderData] = await Promise.all([
      request("/api/auth/me", { token }),
      request("/api/auth/me/favorites", { token }),
      request("/api/auth/me/orders", { token }),
    ]);

    setUserAccount(user);
    setUserFavorites(favData.favorites || []);
    setUserOrders(orderData.orders || []);
  }

  useEffect(() => {
    let active = true;

    async function bootstrapAuth() {
      setAuthLoading(true);
      const token = getStoredToken();
      if (!token) {
        if (active) {
          setAuthToken("");
          setStoredToken("");
          await loadUserData("");
          setAuthLoading(false);
        }
        return;
      }

      try {
        if (!active) return;
        setAuthToken(token);
        await loadUserData(token);
      } catch {
        if (!active) return;
        setAuthToken("");
        setStoredToken("");
        await loadUserData("");
      } finally {
        if (active) setAuthLoading(false);
      }
    }

    bootstrapAuth();
    return () => {
      active = false;
    };
  }, []);

  async function loginUser({ login, password }) {
    const data = await request("/api/auth/login", { method: "POST", body: { login, password } });
    setAuthToken(data.token);
    setStoredToken(data.token);
    setUserAccount(data.user);
    await loadUserData(data.token);
    return data.user;
  }

  async function registerUser({ name, username, email, password }) {
    const data = await request("/api/auth/register", {
      method: "POST",
      body: { name, username, email, password },
    });
    setAuthToken(data.token);
    setStoredToken(data.token);
    setUserAccount(data.user);
    await loadUserData(data.token);
    return data.user;
  }

  async function loginAdmin({ login, password }) {
    const data = await request("/api/auth/admin/login", { method: "POST", body: { login, password } });
    setAuthToken(data.token);
    setStoredToken(data.token);
    setUserAccount(data.user);
    await loadUserData(data.token);
    return data.user;
  }

  async function updateUserProfile(updates) {
    if (!authToken) throw new Error("Usuario nao autenticado.");
    const path = userAccount.role === "ADMIN" ? "/api/admin/profile" : "/api/auth/me/profile";
    const data = await request(path, { method: "PUT", body: updates, token: authToken });
    setUserAccount(data.user);
    return data.user;
  }

  async function changeUserPassword(currentPassword, newPassword) {
    if (!authToken) throw new Error("Usuario nao autenticado.");
    const path = userAccount.role === "ADMIN" ? "/api/admin/password" : "/api/auth/me/password";
    await request(path, { method: "PUT", body: { currentPassword, newPassword }, token: authToken });
    return true;
  }

  async function logoutUser() {
    setAuthToken("");
    setStoredToken("");
    setCartItems([]);
    await loadUserData("");
  }

  function toggleUserSession() {
    if (userAccount.loggedIn) {
      logoutUser();
    }
  }

  async function toggleFavorite(productId) {
    if (!authToken) throw new Error("FaÃ§a login para favoritar.");

    if (userFavorites.includes(productId)) {
      await request(`/api/auth/me/favorites/${productId}`, { method: "DELETE", token: authToken });
      setUserFavorites((prev) => prev.filter((id) => id !== productId));
      return false;
    }

    await request("/api/auth/me/favorites", { method: "POST", token: authToken, body: { productId } });
    setUserFavorites((prev) => [...prev, productId]);
    return true;
  }

  async function checkoutCart() {
    if (!authToken) throw new Error("FaÃ§a login para concluir a compra.");

    const items = cartProducts.map((item) => ({
      productId: item.id,
      qty: item.qty,
      title: item.title,
      price: Number(item.newPrice || 0),
      image: item.image,
    }));

    const data = await request("/api/orders/checkout", {
      method: "POST",
      token: authToken,
      body: { items },
    });

    setCartItems([]);
    const orders = await request("/api/auth/me/orders", { token: authToken });
    setUserOrders(orders.orders || []);
    return data.order;
  }

  function addHeroSlide(slide) {
    setHeroSlides((prev) => [...prev, { ...slide, id: nextId(), order: prev.length + 1 }]);
  }
  function updateHeroSlide(id, updates) {
    setHeroSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }
  function deleteHeroSlide(id) {
    setHeroSlides((prev) => prev.filter((s) => s.id !== id));
  }
  function reorderHeroSlides(from, to) {
    setHeroSlides((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      return reorderArr(sorted, from, to).map((s, i) => ({ ...s, order: i + 1 }));
    });
  }

  function addSpotlightGame(game) {
    setSpotlightGames((prev) => [...prev, { ...game, id: nextId() }]);
  }
  function updateSpotlightGame(id, updates) {
    setSpotlightGames((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  }
  function deleteSpotlightGame(id) {
    setSpotlightGames((prev) => prev.filter((g) => g.id !== id));
  }
  function reorderSpotlightGames(from, to) {
    setSpotlightGames((prev) => reorderArr(prev, from, to));
  }

  function addPromoBanner(banner) {
    setPromoBanners((prev) => [...prev, { ...banner, id: nextId() }]);
  }
  function updatePromoBanner(id, updates) {
    setPromoBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  }
  function deletePromoBanner(id) {
    setPromoBanners((prev) => prev.filter((b) => b.id !== id));
  }
  function reorderPromoBanners(from, to) {
    setPromoBanners((prev) => reorderArr(prev, from, to));
  }

  function addTopGame(game) {
    setTopGames((prev) => [...prev, { ...game, id: nextId(), rank: prev.length + 1 }]);
  }
  function updateTopGame(id, updates) {
    setTopGames((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  }
  function deleteTopGame(id) {
    setTopGames((prev) => prev.filter((g) => g.id !== id).map((g, i) => ({ ...g, rank: i + 1 })));
  }
  function reorderTopGames(from, to) {
    setTopGames((prev) => {
      const sorted = [...prev].sort((a, b) => a.rank - b.rank);
      return reorderArr(sorted, from, to).map((g, i) => ({ ...g, rank: i + 1 }));
    });
  }

  function addCategory(cat) {
    setCategories((prev) => [...prev, { ...cat, id: nextId(), order: prev.length + 1 }]);
  }
  function updateCategory(id, updates) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }
  function deleteCategory(id) {
    setCategories((prev) => prev.filter((c) => c.id !== id).map((c, i) => ({ ...c, order: i + 1 })));
  }
  function reorderCategories(from, to) {
    setCategories((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      return reorderArr(sorted, from, to).map((c, i) => ({ ...c, order: i + 1 }));
    });
  }

  function addProduct(product) {
    setProducts((prev) => [...prev, { ...product, id: nextId() }]);
  }
  function updateProduct(id, updates) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }
  function deleteProduct(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setTopPixelProductIds((prev) => prev.filter((pid) => pid !== id));
    setCartItems((prev) => prev.filter((item) => item.productId !== id));
    setUserFavorites((prev) => prev.filter((pid) => pid !== id));
  }

  function setTopPixelProducts(ids) {
    setTopPixelProductIds([...new Set((ids || []).map(Number))]);
  }
  function toggleTopPixelProduct(productId) {
    setTopPixelProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }
  function reorderTopPixelProducts(from, to) {
    setTopPixelProductIds((prev) => reorderArr(prev, from, to));
  }

  function addRechargeGame(game) {
    setRechargeGames((prev) => [...prev, { ...game, id: nextId(), order: prev.length + 1 }]);
  }
  function updateRechargeGame(id, updates) {
    setRechargeGames((prev) => prev.map((game) => (game.id === id ? { ...game, ...updates } : game)));
  }
  function deleteRechargeGame(id) {
    setRechargeGames((prev) => prev.filter((game) => game.id !== id).map((game, i) => ({ ...game, order: i + 1 })));
    setRechargeOptions((prev) => prev.filter((option) => option.gameId !== id));
  }
  function reorderRechargeGames(from, to) {
    setRechargeGames((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      return reorderArr(sorted, from, to).map((game, i) => ({ ...game, order: i + 1 }));
    });
  }

  function addRechargeOption(option) {
    setRechargeOptions((prev) => {
      const sameGame = prev.filter((item) => item.gameId === option.gameId).length;
      return [...prev, { ...option, id: nextId(), order: sameGame + 1 }];
    });
  }
  function updateRechargeOption(id, updates) {
    setRechargeOptions((prev) => prev.map((option) => (option.id === id ? { ...option, ...updates } : option)));
  }
  function deleteRechargeOption(id) {
    setRechargeOptions((prev) => prev.filter((option) => option.id !== id));
  }
  function reorderRechargeOptions(gameId, from, to) {
    setRechargeOptions((prev) => {
      const scoped = prev.filter((option) => option.gameId === gameId).sort((a, b) => a.order - b.order);
      const others = prev.filter((option) => option.gameId !== gameId);
      const ordered = reorderArr(scoped, from, to).map((option, i) => ({ ...option, order: i + 1 }));
      return [...others, ...ordered];
    });
  }

  function addToCart(productId, qty = 1) {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) => (item.productId === productId ? { ...item, qty: item.qty + qty } : item));
      }
      return [...prev, { productId, qty }];
    });
  }
  function removeFromCart(productId) {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  }
  function updateCartQty(productId, qty) {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) => prev.map((item) => (item.productId === productId ? { ...item, qty } : item)));
  }
  function clearCart() {
    setCartItems([]);
  }

  function resetAllData() {
    const reset = cloneInitialSiteData();
    nextIdRef.current = getMaxId(reset);
    setHeroSlides(reset.heroSlides);
    setSpotlightGames(reset.spotlightGames);
    setPromoBanners(reset.promoBanners);
    setTopGames(reset.topGames);
    setHeroSettings(reset.heroSettings);
    setCategories(reset.categories);
    setProducts(reset.products);
    setTopPixelProductIds(reset.topPixelProductIds);
    setRechargeGames(reset.rechargeGames);
    setRechargeOptions(reset.rechargeOptions);
  }

  return (
    <SiteDataContext.Provider
      value={{
        heroSlides,
        addHeroSlide,
        updateHeroSlide,
        deleteHeroSlide,
        reorderHeroSlides,
        spotlightGames,
        addSpotlightGame,
        updateSpotlightGame,
        deleteSpotlightGame,
        reorderSpotlightGames,
        promoBanners,
        addPromoBanner,
        updatePromoBanner,
        deletePromoBanner,
        reorderPromoBanners,
        topGames,
        addTopGame,
        updateTopGame,
        deleteTopGame,
        reorderTopGames,
        heroSettings,
        setHeroSettings,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        reorderCategories,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        topPixelProductIds,
        setTopPixelProducts,
        toggleTopPixelProduct,
        reorderTopPixelProducts,
        cartItems,
        cartProducts,
        cartTotal,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        checkoutCart,
        userAccount,
        setUserAccount,
        toggleUserSession,
        loginUser,
        registerUser,
        loginAdmin,
        logoutUser,
        updateUserProfile,
        changeUserPassword,
        authLoading,
        authToken,
        userFavorites,
        favoriteProducts,
        userOrders,
        toggleFavorite,
        rechargeGames,
        addRechargeGame,
        updateRechargeGame,
        deleteRechargeGame,
        reorderRechargeGames,
        rechargeOptions,
        addRechargeOption,
        updateRechargeOption,
        deleteRechargeOption,
        reorderRechargeOptions,
        resetAllData,
      }}
    >
      {children}
    </SiteDataContext.Provider>
  );
}

import { useEffect, useState } from "react";
import { useSiteData } from "./SiteDataContext";
import "./profile-page.css"; // you can create this file for custom styles if desired

function formatBRL(value) {
  const numeric = Number(value || 0);
  return `R$ ${numeric.toFixed(2).replace(".", ",")}`;
}

export default function ProfilePage() {
  const { userAccount, updateUserProfile, changeUserPassword } = useSiteData();
  const [profileForm, setProfileForm] = useState({ name: "", username: "", email: "", avatar: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setProfileForm({
      name: userAccount.name || "",
      username: userAccount.username || "",
      email: userAccount.email || "",
      avatar: userAccount.avatar || "/img/user.png",
    });
  }, [userAccount]);

  async function handleSave(e) {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      await updateUserProfile(profileForm);
      setMsg("Perfil atualizado com sucesso.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleChangePwd(e) {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      await changeUserPassword(passwordForm.currentPassword, passwordForm.newPassword);
      setMsg("Senha alterada com sucesso.");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page profile-page">
      <h1>Editar perfil</h1>
      <form className="site-form" onSubmit={handleSave}>
        <input
          placeholder="Nome"
          value={profileForm.name}
          onChange={(e) => setProfileForm((s) => ({ ...s, name: e.target.value }))}
        />
        <input
          placeholder="Usuário"
          value={profileForm.username}
          onChange={(e) => setProfileForm((s) => ({ ...s, username: e.target.value }))}
        />
        <input
          placeholder="Email"
          value={profileForm.email}
          onChange={(e) => setProfileForm((s) => ({ ...s, email: e.target.value }))}
        />
        <input
          placeholder="URL avatar"
          value={profileForm.avatar}
          onChange={(e) => setProfileForm((s) => ({ ...s, avatar: e.target.value }))}
        />
        <button className="site-popup-action" type="submit">
          Salvar perfil
        </button>
      </form>

      <form className="site-form" onSubmit={handleChangePwd}>
        <input
          type="password"
          placeholder="Senha atual"
          value={passwordForm.currentPassword}
          onChange={(e) => setPasswordForm((s) => ({ ...s, currentPassword: e.target.value }))}
        />
        <input
          type="password"
          placeholder="Nova senha"
          value={passwordForm.newPassword}
          onChange={(e) => setPasswordForm((s) => ({ ...s, newPassword: e.target.value }))}
        />
        <button className="site-popup-ghost" type="submit">
          Alterar senha
        </button>
      </form>

      {msg && <div className="site-msg">{msg}</div>}
      {error && <div className="site-msg error">{error}</div>}
    </div>
  );
}

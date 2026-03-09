import React, { useState } from 'react';
import { User, Heart, Package, LogOut, Key, Camera } from 'lucide-react';
import './profile-layout.css';

export default function UserProfileLayout({ children, activeTab = 'profile', onTabChange, onLogout }) {
  const tabs = [
    { id: 'profile', label: 'Meu Perfil', icon: User },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
    { id: 'orders', label: 'Minhas Compras', icon: Package },
  ];

  return (
    <div className="user-profile-container">
      {/* Sidebar */}
      <aside className="user-sidebar">
        <div className="user-sidebar-header">
          <div className="user-avatar-preview">
            <User size={40} />
          </div>
          <h3 className="user-name">Seu Perfil</h3>
        </div>

        <nav className="user-tabs-nav">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`user-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => onTabChange(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="user-sidebar-divider"></div>

        <div className="user-sidebar-footer">
          <button className="user-action-btn user-action-password" title="Alterar Senha">
            <Key size={16} />
            <span>Alterar Senha</span>
          </button>
          <button className="user-action-btn user-action-logout" onClick={onLogout}>
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="user-main-content">
        {children}
      </main>
    </div>
  );
}

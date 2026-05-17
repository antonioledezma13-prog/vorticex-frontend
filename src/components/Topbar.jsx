// src/components/Topbar.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';
import './Topbar.css';

const TABS = ['Sports', 'Politics', 'My Predictions', 'Live Feed', 'Leaderboard', 'Analytics'];

export default function Topbar({ activeTab, onTabChange, onOpenAuth, onNavigate }) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="topbar">
      {/* Botón de Hamburguesa - Visible solo en celulares y tablets */}
      <button
        className="topbar-hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          {menuOpen ? (
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          ) : (
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          )}
        </svg>
      </button>

      {/* Logo real — visible solo en móvil */}
      <div className="topbar-logo-mobile" onClick={() => onNavigate && onNavigate('home')}>
        <img
          src={require('../logo.png')}
          alt="Vorticex"
          style={{ height: 32, width: 'auto', objectFit: 'contain' }}
        />
      </div>

      {/* Menú de pestañas */}
      <nav className={`topbar-tabs ${menuOpen ? 'show' : ''}`}>
        {TABS.map(tab => {
          const key = tab.toLowerCase().replace(/ /g, '');
          return (
            <button
              key={tab}
              className={`tab-btn ${activeTab === key ? 'active' : ''}`}
              onClick={() => {
                onTabChange(key);
                setMenuOpen(false);
              }}
            >
              {tab}
            </button>
          );
        })}
      </nav>

      <div className="topbar-actions">
        {/* Botón Planes */}
        <button
          className="btn-planes-sm"
          onClick={() => onNavigate && onNavigate('planes')}
        >
          💎 Planes
        </button>

        {/* Notificaciones */}
        <button className="icon-btn" title="Notificaciones">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
          <span className="notif-dot" />
        </button>

        {/* Sesión */}
        {user ? (
          <UserMenu onNavigate={onNavigate} />
        ) : (
          <>
            <button className="btn-outline-sm" onClick={onOpenAuth}>Log in</button>
            <button className="btn-filled-sm"  onClick={onOpenAuth}>Sign Up</button>
          </>
        )}
      </div>
    </header>
  );
}

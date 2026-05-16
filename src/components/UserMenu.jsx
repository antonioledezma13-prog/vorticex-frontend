// src/components/UserMenu.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './UserMenu.css';

const MEDALLA = {
  novato:  { label: 'Novato',  color: '#6b7280', icon: '🥉' },
  pro:     { label: 'Pro',     color: '#f5a623', icon: '🥈' },
  oraculo: { label: 'Oráculo', color: '#ff2222', icon: '🔮' },
};

export default function UserMenu({ onNavigate }) {
  const { user, logout } = useAuth();
  const [open, setOpen]  = useState(false);

  if (!user) return null;

  const medalla  = MEDALLA[user.medalla] || MEDALLA.novato;
  const initials = user.nombre
    ? user.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'VX';

  const esTipster = ['tipster', 'admin'].includes(user.tipo_usuario);

  function handleNav(page) {
    setOpen(false);
    if (onNavigate) onNavigate(page);
  }

  return (
    <div className="user-menu" onMouseLeave={() => setOpen(false)}>
      <button className="um-trigger" onClick={() => setOpen(o => !o)}>
        <div className="um-avatar">{initials}</div>
        <div className="um-info">
          <span className="um-name">{user.nombre}</span>
          <span className="um-badge" style={{ color: medalla.color }}>
            {medalla.icon} {medalla.label}
          </span>
        </div>
        <svg className="um-chevron" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </button>

      {open && (
        <div className="um-dropdown card">
          {/* VortexScore */}
          <div className="um-score-row">
            <span className="um-score-label">VortexScore</span>
            <span className="um-score-val">{Number(user.vortex_score || 0).toFixed(1)}</span>
          </div>
          <div className="um-score-bar">
            <div
              className="um-score-fill"
              style={{ width: `${Math.min(user.vortex_score || 0, 100)}%` }}
            />
          </div>
          <div className="um-score-tiers">
            <span>Novato</span><span>Pro</span><span>Oráculo</span>
          </div>

          {/* Plan actual */}
          <div className="um-plan-row">
            <span className="um-plan-label">Plan actual</span>
            <span className={`um-plan-badge ${user.tipo_usuario}`}>
              {user.tipo_usuario.toUpperCase()}
            </span>
          </div>

          {/* Upgrade si es free */}
          {user.tipo_usuario === 'free' && (
            <button className="um-upgrade-btn" onClick={() => handleNav('planes')}>
              👑 Upgrade a Premium
            </button>
          )}

          {/* Mi Panel para tipsters */}
          {esTipster && (
            <button className="um-panel-btn" onClick={() => handleNav('mipanel')}>
              📊 Mi Panel de Tipster
            </button>
          )}

          {/* Ver planes */}
          <button className="um-planes-btn" onClick={() => handleNav('planes')}>
            💎 Ver Planes
          </button>

          <div className="um-divider" />

          {/* Cerrar sesión */}
          <button className="um-logout" onClick={logout}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

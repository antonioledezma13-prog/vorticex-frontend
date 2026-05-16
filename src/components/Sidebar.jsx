// src/components/Sidebar.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const NAV_MAIN = [
  {
    id: 'home', label: 'Home',
    icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
  },
  {
    id: 'sports', label: 'Sports',
    icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
  },
  {
    id: 'politics', label: 'Politics',
    icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l4 2.18V17h2v-4.5l1 .55V17c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-3.95l1-.55V17h2v-5.82L23 9 12 3zm4 14h-4v-2.96l4 2.18V17z"/></svg>
  },
  {
    id: 'predictions', label: 'My Predictions',
    icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/></svg>
  },
  {
    id: 'livefeed', label: 'Live Feed', badge: true,
    icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.66-1.65-4.34-1.65-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
  },
  {
    id: 'leaderboard', label: 'Leaderboard',
    icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.5 2C6.81 2 3 5.81 3 10.5S6.81 19 11.5 19h.5v3c4.86-2.34 8-7 8-11.5C20 5.81 16.19 2 11.5 2zm1 14.5h-2v-2h2v2zm0-4h-2c0-3.25 3-3 3-5 0-1.1-.9-2-2-2s-2 .9-2 2h-2c0-2.21 1.79-4 4-4s4 1.79 4 4c0 2.5-3 2.75-3 5z"/></svg>
  },
  {
    id: 'analytics', label: 'Analytics',
    icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
  },
];

const NAV_USER = [
  {
    id: 'planes', label: 'Planes & Precios', upgrade: true,
    icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
  },
];

const NAV_TIPSTER = [
  {
    id: 'mipanel', label: 'Mi Panel', gold: true,
    icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
  },
];

const NAV_ADMIN = [
  {
    id: 'admin', label: 'Panel Admin', admin: true,
    icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93-2.67-1.14-5-4.43-5-7.93V7.18L12 5zm-1 5v2h2v-2h-2zm0 4v2h2v-2h-2z"/></svg>
  },
];

export default function Sidebar({ activePage, onNavigate }) {
  const { user } = useAuth();

  const esTipster = user && ['tipster', 'admin'].includes(user.tipo_usuario);
  const esAdmin   = user && user.tipo_usuario === 'admin';
  const esFree    = !user || user.tipo_usuario === 'free';

  function NavItem({ item }) {
    const active = activePage === item.id;
    return (
      <button
        className={`nav-item ${active ? 'active' : ''} ${item.gold ? 'nav-item-gold' : ''} ${item.admin ? 'nav-item-admin' : ''}`}
        onClick={() => onNavigate(item.id)}
      >
        <span className="nav-icon">{item.icon}</span>
        <span className="nav-label">{item.label}</span>
        {item.badge   && <span className="nav-badge" />}
        {item.upgrade && esFree && <span className="nav-upgrade-badge">PRO</span>}
        {active && <span className="nav-active-bar" />}
      </button>
    );
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <img src={require('../logo.png')} alt="Vorticex" style={{ width: 160, height: 'auto' }} />
      </div>

      {/* Nav principal */}
      <nav className="sidebar-nav">
        {NAV_MAIN.map(item => <NavItem key={item.id} item={item} />)}

        <div className="nav-divider" />

        {NAV_USER.map(item => <NavItem key={item.id} item={item} />)}
        {esTipster && NAV_TIPSTER.map(item => <NavItem key={item.id} item={item} />)}

        {esAdmin && (
          <>
            <div className="nav-divider" />
            {NAV_ADMIN.map(item => <NavItem key={item.id} item={item} />)}
          </>
        )}
      </nav>

      {/* Market Status */}
      <div className="sidebar-status">
        <div className="status-label">Market Status</div>
        <div className="status-row">
          <span className="status-key">Active Markets</span>
          <span className="status-val gold">24</span>
        </div>
        <div className="status-row">
          <span className="status-key">Total Predictions</span>
          <span className="status-val">8,457</span>
        </div>
      </div>

      {/* User */}
      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.nombre
            ? user.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            : 'VX'}
        </div>
        <div className="user-info">
          <div className="user-name">{user?.nombre || 'Invitado'}</div>
          <div className="user-role">
            {user?.tipo_usuario
              ? user.tipo_usuario.charAt(0).toUpperCase() + user.tipo_usuario.slice(1)
              : 'Free'}
          </div>
        </div>
        <div className="user-online" />
      </div>
    </aside>
  );
}

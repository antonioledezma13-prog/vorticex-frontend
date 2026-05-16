// src/components/Topbar.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';
import './Topbar.css';

const TABS = ['Sports', 'Politics', 'My Predictions', 'Live Feed', 'Leaderboard', 'Analytics'];

export default function Topbar({ activeTab, onTabChange, onOpenAuth, onNavigate }) {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <nav className="topbar-tabs">
        {TABS.map(tab => {
          const key = tab.toLowerCase().replace(/ /g, '');
          return (
            <button
              key={tab}
              className={`tab-btn ${activeTab === key ? 'active' : ''}`}
              onClick={() => onTabChange(key)}
            >
              {tab}
            </button>
          );
        })}
      </nav>

      <div className="topbar-actions">
        {/* Botón Planes visible siempre */}
        <button
          className="btn-planes-sm"
          onClick={() => onNavigate && onNavigate('planes')}
        >
          💎 Planes
        </button>

        <button className="icon-btn" title="Notificaciones">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
          <span className="notif-dot" />
        </button>

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

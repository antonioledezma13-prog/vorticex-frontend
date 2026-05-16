// src/components/PaywallOverlay.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import './PaywallOverlay.css';

export default function PaywallOverlay({ onOpenAuth }) {
  const { user } = useAuth();

  return (
    <div className="paywall-overlay">
      <div className="paywall-content">
        <div className="paywall-lock">🔒</div>
        <div className="paywall-title">Contenido Premium</div>
        <div className="paywall-desc">
          {!user
            ? 'Inicia sesión para ver pronósticos completos, probabilidades de la IA y mercados en tiempo real.'
            : 'Actualiza a Premium para acceder al Cerebro IA, los Oráculos y todos los mercados en tiempo real.'}
        </div>
        <div className="paywall-perks">
          <span>✅ Probabilidades del Cerebro IA</span>
          <span>✅ Pronósticos de Oráculos &gt;75%</span>
          <span>✅ Odds en tiempo real</span>
          <span>✅ Analytics avanzados</span>
        </div>
        <button className="paywall-btn" onClick={onOpenAuth}>
          {!user ? '🚀 Crear cuenta gratis' : '👑 Upgrade a Premium'}
        </button>
      </div>
    </div>
  );
}

// src/pages/TipsterPanel.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './TipsterPanel.css';

const MEDALLA_CONFIG = {
  oraculo: { icon: '🔮', label: 'Oráculo', color: '#e01a1a' },
  pro:     { icon: '🥈', label: 'Pro',     color: '#f5a623' },
  novato:  { icon: '🥉', label: 'Novato',  color: '#6b7280' },
};

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="stat-card card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-val" style={{ color: color || 'var(--gold)' }}>{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export default function TipsterPanel() {
  const { user, token } = useAuth();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [retiro,  setRetiro]  = useState({ email: '', loading: false, msg: '' });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res  = await fetch('/api/payments/mis-stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('[TipsterPanel]', err);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchStats();
  }, [token]);

  async function handleRetiro() {
    if (!retiro.email) {
      setRetiro(r => ({ ...r, msg: 'Ingresa tu email de PayPal' }));
      return;
    }
    setRetiro(r => ({ ...r, loading: true, msg: '' }));
    try {
      const res  = await fetch('/api/payments/retiro', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ paypalEmail: retiro.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRetiro(r => ({ ...r, msg: `✅ Solicitud enviada por $${data.monto}` }));
      // Refrescar stats
      const res2 = await fetch('/api/payments/mis-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStats(await res2.json());
    } catch (err) {
      setRetiro(r => ({ ...r, msg: `❌ ${err.message}` }));
    } finally {
      setRetiro(r => ({ ...r, loading: false }));
    }
  }

  if (loading) return (
    <div className="tipster-panel">
      <div className="tp-loading">Cargando tu panel...</div>
    </div>
  );

  if (!stats) return (
    <div className="tipster-panel">
      <div className="tp-loading">Error al cargar estadísticas</div>
    </div>
  );

  const medalla = MEDALLA_CONFIG[stats.medalla] || MEDALLA_CONFIG.novato;
  const nextLevel = stats.medalla === 'novato' ? 'Pro (50 pts)'
    : stats.medalla === 'pro' ? 'Oráculo (75 pts)'
    : '¡Nivel máximo!';

  return (
    <div className="tipster-panel">

      {/* Header del tipster */}
      <div className="tp-header card">
        <div className="tp-avatar">
          {stats.nombre?.slice(0, 2).toUpperCase() || 'VX'}
        </div>
        <div className="tp-info">
          <div className="tp-nombre">{stats.nombre}</div>
          <div className="tp-email">{stats.email}</div>
          <div className="tp-medalla" style={{ color: medalla.color }}>
            {medalla.icon} {medalla.label}
          </div>
        </div>
        <div className="tp-score-wrap">
          <div className="tp-score-val">{stats.vortex_score.toFixed(1)}</div>
          <div className="tp-score-label">VortexScore</div>
          <div className="tp-score-bar">
            <div
              className="tp-score-fill"
              style={{ width: `${Math.min(stats.vortex_score, 100)}%` }}
            />
          </div>
          <div className="tp-score-next">Siguiente: {nextLevel}</div>
        </div>
      </div>

      {/* Stats de predicciones */}
      <div className="tp-section-title">📊 Mis Pronósticos</div>
      <div className="tp-stats-grid">
        <StatCard
          icon="🎯"
          label="Total"
          value={stats.predicciones.total}
          color="var(--text-primary)"
        />
        <StatCard
          icon="✅"
          label="Aciertos"
          value={stats.predicciones.aciertos}
          color="#22c55e"
        />
        <StatCard
          icon="❌"
          label="Fallos"
          value={stats.predicciones.fallos}
          color="var(--red-bright)"
        />
        <StatCard
          icon="⏳"
          label="Pendientes"
          value={stats.predicciones.pendientes}
          color="var(--text-secondary)"
        />
        <StatCard
          icon="📈"
          label="Efectividad"
          value={`${stats.predicciones.efectividad}%`}
          color="var(--gold)"
          sub={`${stats.predicciones.aciertos}/${stats.predicciones.aciertos + stats.predicciones.fallos} resueltos`}
        />
        <StatCard
          icon="🛒"
          label="Picks Vendidos"
          value={stats.picks.total_vendidos}
          color="var(--gold)"
          sub={`$${stats.picks.ganado_picks} ganados`}
        />
      </div>

      {/* Wallet */}
      <div className="tp-section-title">💰 Mi Billetera</div>
      <div className="tp-wallet card">
        <div className="tw-stats">
          <div className="tw-stat">
            <div className="tw-val gold">${stats.wallet.balance}</div>
            <div className="tw-key">Balance disponible</div>
          </div>
          <div className="tw-divider" />
          <div className="tw-stat">
            <div className="tw-val">${stats.wallet.total_earned}</div>
            <div className="tw-key">Total ganado</div>
          </div>
          <div className="tw-divider" />
          <div className="tw-stat">
            <div className="tw-val">${stats.wallet.total_withdrawn}</div>
            <div className="tw-key">Total retirado</div>
          </div>
        </div>

        {/* Barra de progreso hacia mínimo de retiro */}
        <div className="tw-progress-wrap">
          <div className="tw-progress-label">
            Progreso hacia retiro mínimo (${stats.wallet.min_retiro})
          </div>
          <div className="tw-progress-bar">
            <div
              className="tw-progress-fill"
              style={{ width: `${Math.min((parseFloat(stats.wallet.balance) / stats.wallet.min_retiro) * 100, 100)}%` }}
            />
          </div>
          <div className="tw-progress-pct">
            ${stats.wallet.balance} / ${stats.wallet.min_retiro}
          </div>
        </div>

        {/* Formulario de retiro */}
        {stats.wallet.puede_retirar ? (
          <div className="tw-retiro">
            <div className="tw-retiro-title">Solicitar retiro</div>
            <div className="tw-retiro-form">
              <input
                className="am-input"
                type="email"
                placeholder="Tu email de PayPal"
                value={retiro.email}
                onChange={e => setRetiro(r => ({ ...r, email: e.target.value }))}
                defaultValue={stats.wallet.paypal_email || ''}
              />
              <button
                className="btn-primary tw-retiro-btn"
                onClick={handleRetiro}
                disabled={retiro.loading}
              >
                {retiro.loading ? 'Procesando...' : `Retirar $${stats.wallet.balance}`}
              </button>
            </div>
            {retiro.msg && (
              <div className={`tw-retiro-msg ${retiro.msg.startsWith('✅') ? 'ok' : 'err'}`}>
                {retiro.msg}
              </div>
            )}
          </div>
        ) : (
          <div className="tw-retiro-pending">
            <span>💡</span>
            Necesitas acumular mínimo <strong>${stats.wallet.min_retiro}</strong> para solicitar un retiro.
            Te faltan <strong>${(stats.wallet.min_retiro - parseFloat(stats.wallet.balance)).toFixed(2)}</strong>.
          </div>
        )}
      </div>

    </div>
  );
}

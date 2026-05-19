// src/pages/TipsterPanel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import './TipsterPanel.css';

const MEDALLA_CONFIG = {
  oraculo: { icon: '🔮', label: 'Oráculo', color: '#e01a1a' },
  pro:     { icon: '🥈', label: 'Pro',     color: '#f5a623' },
  novato:  { icon: '🥉', label: 'Novato',  color: '#6b7280' },
};

const RESULT_CONFIG = {
  won:     { label: 'Acertado',  icon: '✅', color: '#22c55e', bg: 'rgba(34,197,94,0.10)'  },
  lost:    { label: 'Fallado',   icon: '❌', color: '#e01a1a', bg: 'rgba(224,26,26,0.10)'  },
  pending: { label: 'Pendiente', icon: '⏳', color: '#f5a623', bg: 'rgba(245,166,35,0.10)' },
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

// ─── PICK CARD ────────────────────────────────────────────────────────────────
function PickCard({ pick }) {
  const cfg = RESULT_CONFIG[pick.result] || RESULT_CONFIG.pending;
  const ev  = pick.evento;

  const fechaEvento = ev?.start_time
    ? new Date(ev.start_time).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  const nombreEvento = ev
    ? (ev.home_team && ev.away_team ? `${ev.home_team} vs ${ev.away_team}` : ev.name)
    : 'Evento no disponible';

  return (
    <div className="pick-card" style={{ borderLeftColor: cfg.color }}>
      <div className="pick-card-top">
        <div className="pick-event-info">
          <span className="pick-event-name">{nombreEvento}</span>
          {ev?.league && <span className="pick-league">{ev.league}</span>}
        </div>
        <span className="pick-result-badge" style={{ color: cfg.color, background: cfg.bg }}>
          {cfg.icon} {cfg.label}
        </span>
      </div>

      <div className="pick-card-body">
        <div className="pick-prediction-wrap">
          <span className="pick-prediction-label">Mi pronóstico</span>
          <span className="pick-prediction-val">{pick.prediction}</span>
        </div>
        {pick.result !== 'pending' && ev?.resultado && (
          <div className="pick-resultado-wrap">
            <span className="pick-prediction-label">Resultado real</span>
            <span className="pick-resultado-val">{ev.resultado}</span>
          </div>
        )}
      </div>

      <div className="pick-card-footer">
        <span className="pick-date">
          📅 {fechaEvento}
        </span>
        {ev?.type && (
          <span className={`pick-type-badge ${ev.type}`}>
            {ev.type === 'politics' ? '🏛 Política' : '⚽ Deporte'}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── MODAL DE NUEVO PRONÓSTICO ────────────────────────────────────────────────
function PronósticoModal({ onClose, onSubmit, submitting }) {
  const [eventos,   setEventos]   = useState([]);
  const [loadingEv, setLoadingEv] = useState(true);
  const [eventId,   setEventId]   = useState('');
  const [opcion,    setOpcion]    = useState('');
  const [custom,    setCustom]    = useState('');

  const { token } = useAuth();

  useEffect(() => {
    async function fetchEventos() {
      try {
        const res  = await fetch('/api/events', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        // Solo eventos que aún no terminaron
        const activos = data.filter(e => e.status !== 'finished');
        setEventos(activos);
        if (activos.length) setEventId(activos[0].id || activos[0]._id);
      } catch (err) {
        console.error('[PronósticoModal]', err);
      } finally {
        setLoadingEv(false);
      }
    }
    fetchEventos();
  }, [token]);

  const eventoSeleccionado = eventos.find(e => (e.id || e._id) === eventId);

  // Opciones rápidas según el evento
  function opcionesRapidas(ev) {
    if (!ev) return [];
    if (ev.type === 'politics') return ['Opción A', 'Opción B', 'Empate técnico'];
    const home = ev.home_team || 'Local';
    const away = ev.away_team || 'Visitante';
    return [`${home} gana`, `${away} gana`, 'Empate'];
  }

  function handleSubmit() {
    const prediction = opcion === '__custom__' ? custom.trim() : opcion;
    if (!eventId || !prediction) return;
    onSubmit(eventId, prediction);
  }

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal card" onClick={e => e.stopPropagation()}>
        <div className="pm-header">
          <span className="pm-title">🎯 Nuevo Pronóstico</span>
          <button className="pm-close" onClick={onClose}>✕</button>
        </div>

        {loadingEv ? (
          <div className="pm-loading">Cargando eventos disponibles...</div>
        ) : eventos.length === 0 ? (
          <div className="pm-loading">No hay eventos activos en este momento.</div>
        ) : (
          <>
            {/* Selector de evento */}
            <div className="pm-field">
              <label className="pm-label">Evento</label>
              <select
                className="pm-select"
                value={eventId}
                onChange={e => { setEventId(e.target.value); setOpcion(''); setCustom(''); }}
              >
                {eventos.map(ev => {
                  const id    = ev.id || ev._id;
                  const label = ev.home_team && ev.away_team
                    ? `${ev.home_team} vs ${ev.away_team}`
                    : ev.name;
                  return <option key={id} value={id}>{label}</option>;
                })}
              </select>
              {eventoSeleccionado && (
                <div className="pm-event-meta">
                  <span className={`pm-status-dot ${eventoSeleccionado.status}`} />
                  {eventoSeleccionado.status === 'live' ? 'En vivo' : 'Próximo'}
                  {eventoSeleccionado.league ? ` · ${eventoSeleccionado.league}` : ''}
                </div>
              )}
            </div>

            {/* Opciones rápidas */}
            <div className="pm-field">
              <label className="pm-label">Tu pronóstico</label>
              <div className="pm-opciones">
                {opcionesRapidas(eventoSeleccionado).map(op => (
                  <button
                    key={op}
                    className={`pm-opcion ${opcion === op ? 'active' : ''}`}
                    onClick={() => { setOpcion(op); setCustom(''); }}
                  >
                    {op}
                  </button>
                ))}
                <button
                  className={`pm-opcion pm-opcion-custom ${opcion === '__custom__' ? 'active' : ''}`}
                  onClick={() => setOpcion('__custom__')}
                >
                  ✏️ Otro
                </button>
              </div>

              {opcion === '__custom__' && (
                <input
                  className="pm-input"
                  type="text"
                  placeholder="Escribe tu pronóstico..."
                  value={custom}
                  onChange={e => setCustom(e.target.value)}
                  autoFocus
                />
              )}
            </div>

            <button
              className="btn-primary pm-submit"
              onClick={handleSubmit}
              disabled={submitting || !eventId || (!opcion || (opcion === '__custom__' && !custom.trim()))}
            >
              {submitting ? 'Registrando...' : '🎯 Confirmar Pronóstico'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── TIPSTER PANEL ────────────────────────────────────────────────────────────
export default function TipsterPanel() {
  const { token } = useAuth();

  const [stats,      setStats]      = useState(null);
  const [picks,      setPicks]      = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPicks, setLoadingPicks] = useState(true);
  const [retiro,     setRetiro]     = useState({ email: '', loading: false, msg: '' });
  const [showModal,  setShowModal]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterResult, setFilterResult] = useState('all');
  const [pickMsg,    setPickMsg]    = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const res  = await fetch('/api/payments/mis-stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('[TipsterPanel] fetchStats', err);
    } finally {
      setLoadingStats(false);
    }
  }, [token]);

  const fetchPicks = useCallback(async () => {
    try {
      const res  = await fetch('/api/predictions/mis-picks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPicks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[TipsterPanel] fetchPicks', err);
    } finally {
      setLoadingPicks(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchStats();
    fetchPicks();
  }, [token, fetchStats, fetchPicks]);

  async function handleRetiro() {
    if (!retiro.email) {
      setRetiro(r => ({ ...r, msg: 'Ingresa tu email de PayPal' }));
      return;
    }
    setRetiro(r => ({ ...r, loading: true, msg: '' }));
    try {
      const res  = await fetch('/api/payments/retiro', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ paypalEmail: retiro.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRetiro(r => ({ ...r, msg: `✅ Solicitud enviada por $${data.monto}` }));
      fetchStats();
    } catch (err) {
      setRetiro(r => ({ ...r, msg: `❌ ${err.message}` }));
    } finally {
      setRetiro(r => ({ ...r, loading: false }));
    }
  }

  async function handleNuevoPronóstico(eventId, prediction) {
    setSubmitting(true);
    setPickMsg('');
    try {
      const res  = await fetch('/api/predictions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ event_id: eventId, prediction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPickMsg(`✅ Pronóstico registrado: "${prediction}"`);
      setShowModal(false);
      fetchPicks();
      fetchStats();
    } catch (err) {
      setPickMsg(`❌ ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Loading / Error ──
  if (loadingStats) return (
    <div className="tipster-panel"><div className="tp-loading">Cargando tu panel...</div></div>
  );
  if (!stats) return (
    <div className="tipster-panel"><div className="tp-loading">Error al cargar estadísticas</div></div>
  );

  const medalla  = MEDALLA_CONFIG[stats.medalla] || MEDALLA_CONFIG.novato;
  const nextLevel = stats.medalla === 'novato' ? 'Pro (50 pts)'
    : stats.medalla === 'pro' ? 'Oráculo (75 pts)'
    : '¡Nivel máximo!';

  // Filtrado de picks
  const picksFiltrados = filterResult === 'all'
    ? picks
    : picks.filter(p => p.result === filterResult);

  return (
    <div className="tipster-panel">

      {/* ── Header tipster ── */}
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
            <div className="tp-score-fill"
              style={{ width: `${Math.min(stats.vortex_score, 100)}%` }} />
          </div>
          <div className="tp-score-next">Siguiente: {nextLevel}</div>
        </div>
      </div>

      {/* ── Stats predicciones ── */}
      <div className="tp-section-title">📊 Mis Pronósticos</div>
      <div className="tp-stats-grid">
        <StatCard icon="🎯" label="Total"       value={stats.predicciones.total}        color="var(--text-primary)" />
        <StatCard icon="✅" label="Aciertos"    value={stats.predicciones.aciertos}     color="#22c55e" />
        <StatCard icon="❌" label="Fallos"      value={stats.predicciones.fallos}       color="var(--red-bright)" />
        <StatCard icon="⏳" label="Pendientes"  value={stats.predicciones.pendientes}   color="var(--text-secondary)" />
        <StatCard icon="📈" label="Efectividad" value={`${stats.predicciones.efectividad}%`} color="var(--gold)"
          sub={`${stats.predicciones.aciertos}/${stats.predicciones.aciertos + stats.predicciones.fallos} resueltos`} />
        <StatCard icon="🛒" label="Picks Vendidos" value={stats.picks.total_vendidos}   color="var(--gold)"
          sub={`$${stats.picks.ganado_picks} ganados`} />
      </div>

      {/* ── Historial de picks ── */}
      <div className="tp-picks-header">
        <span className="tp-section-title" style={{ marginBottom: 0 }}>🗂️ Historial de Picks</span>
        <div className="tp-picks-actions">
          {/* Filtros */}
          <div className="tp-filter-group">
            {['all', 'pending', 'won', 'lost'].map(f => (
              <button
                key={f}
                className={`tp-filter-btn ${filterResult === f ? 'active' : ''}`}
                onClick={() => setFilterResult(f)}
              >
                {f === 'all' ? 'Todos' : f === 'pending' ? '⏳ Pendientes' : f === 'won' ? '✅ Aciertos' : '❌ Fallos'}
              </button>
            ))}
          </div>
          {/* Botón nuevo pronóstico */}
          <button className="btn-primary tp-nuevo-btn" onClick={() => { setPickMsg(''); setShowModal(true); }}>
            + Nuevo Pronóstico
          </button>
        </div>
      </div>

      {pickMsg && (
        <div className={`tw-retiro-msg ${pickMsg.startsWith('✅') ? 'ok' : 'err'}`}>
          {pickMsg}
        </div>
      )}

      <div className="tp-picks-list">
        {loadingPicks ? (
          <div className="tp-loading" style={{ padding: 32 }}>Cargando picks...</div>
        ) : picksFiltrados.length === 0 ? (
          <div className="tp-picks-empty">
            {filterResult === 'all'
              ? 'Aún no tienes pronósticos registrados. ¡Haz tu primer pick!'
              : `No tienes pronósticos con estado "${filterResult}".`}
          </div>
        ) : (
          picksFiltrados.map(pick => <PickCard key={pick.id} pick={pick} />)
        )}
      </div>

      {/* ── Wallet ── */}
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

        <div className="tw-progress-wrap">
          <div className="tw-progress-label">
            Progreso hacia retiro mínimo (${stats.wallet.min_retiro})
          </div>
          <div className="tw-progress-bar">
            <div className="tw-progress-fill"
              style={{ width: `${Math.min((parseFloat(stats.wallet.balance) / stats.wallet.min_retiro) * 100, 100)}%` }} />
          </div>
          <div className="tw-progress-pct">
            ${stats.wallet.balance} / ${stats.wallet.min_retiro}
          </div>
        </div>

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

      {/* ── Modal nuevo pronóstico ── */}
      {showModal && (
        <PronósticoModal
          onClose={() => setShowModal(false)}
          onSubmit={handleNuevoPronóstico}
          submitting={submitting}
        />
      )}

    </div>
  );
}

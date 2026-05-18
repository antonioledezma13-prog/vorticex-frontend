// src/pages/AnalyticsView.jsx  (o src/views/AnalyticsView.jsx según tu ruta)
// UI completa con datos reales del backend — 3 funciones: Vortex Tracker, Tipsters, My Tracker
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import './AnalyticsView.css';

// ── Mini gráfica de ROI ───────────────────────────────────────────────────────
function RoiChart({ data }) {
  if (!data || data.length < 2) return null;
  const W = 100, H = 48, pad = 4;
  const vals = data.map(d => d.bankroll);
  const min  = Math.min(...vals);
  const max  = Math.max(...vals);
  const rng  = max - min || 1;
  const pts  = vals.map((v, i) => {
    const x = pad + (i / (vals.length - 1)) * (W - pad * 2);
    const y = H - pad - ((v - min) / rng) * (H - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const area = [`${pad},${H}`, ...pts, `${W - pad},${H}`].join(' ');
  const isPositive = vals[vals.length - 1] >= vals[0];
  const color = isPositive ? '#34d399' : '#e01a1a';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 48 }}>
      <polygon points={area} fill={color} opacity="0.12" />
      <polyline points={pts.join(' ')} fill="none" stroke={color}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length-1].split(',')[0]}
              cy={pts[pts.length-1].split(',')[1]}
              r="3" fill={color} />
    </svg>
  );
}

// ── Círculo de Win Rate ───────────────────────────────────────────────────────
function WinRateCircle({ value }) {
  const r = 38, circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(value || 0, 0), 100);
  const dash = (pct / 100) * circ;
  const color = pct >= 70 ? '#34d399' : pct >= 55 ? '#f5a623' : '#e01a1a';

  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
      <circle cx="50" cy="50" r={r} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      <text x="50" y="46" textAnchor="middle"
        fill={color} fontSize="16" fontWeight="800"
        fontFamily="'Barlow Condensed', sans-serif">
        {pct.toFixed(1)}%
      </text>
      <text x="50" y="60" textAnchor="middle"
        fill="rgba(240,230,204,0.4)" fontSize="7"
        fontFamily="'Barlow Condensed', sans-serif" letterSpacing="1">
        WIN RATE
      </text>
    </svg>
  );
}

// ── Badges de racha ───────────────────────────────────────────────────────────
function RachaBadges({ racha }) {
  if (!racha || !racha.length) return <span style={{ color: 'var(--text-dim)' }}>—</span>;
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {racha.map((r, i) => (
        <span key={i} style={{
          width: 18, height: 18, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.55rem', fontWeight: 800,
          background: r === 'W' ? 'rgba(52,211,153,0.2)' : r === 'L' ? 'rgba(224,26,26,0.2)' : 'rgba(255,255,255,0.08)',
          color: r === 'W' ? '#34d399' : r === 'L' ? '#e01a1a' : '#9ca3af',
          border: `1px solid ${r === 'W' ? '#34d39944' : r === 'L' ? '#e01a1a44' : '#ffffff22'}`,
        }}>{r}</span>
      ))}
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function AnalyticsView() {
  const { user, token } = useAuth();
  const [tab,          setTab]          = useState('vortex');
  const [vortexData,   setVortexData]   = useState(null);
  const [leaderboard,  setLeaderboard]  = useState([]);
  const [myTracker,    setMyTracker]    = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  const isPremium = user && ['premium', 'oraculo', 'admin', 'tipster'].includes(user.tipo_usuario);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'vortex') {
        const res  = await fetch('/api/analytics/vortex-tracker');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setVortexData(data);

      } else if (tab === 'leaderboard') {
        const res  = await fetch('/api/analytics/tipsters');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setLeaderboard(data.leaderboard || []);

      } else if (tab === 'mytracker') {
        if (!isPremium) { setLoading(false); return; }
        const res  = await fetch('/api/analytics/my-tracker', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setMyTracker(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tab, token, isPremium]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const TABS = [
    { id: 'vortex',      label: '🔮 Vortex Tracker' },
    { id: 'leaderboard', label: '🎯 Tipsters Oficiales' },
    { id: 'mytracker',   label: '📒 Mi Bitácora' },
  ];

  return (
    <div className="av-page">
      {/* ── Header ── */}
      <div className="av-header">
        <div>
          <h1 className="av-title">
            <span className="av-title-icon">📊</span> Vortex Analytics
          </h1>
          <p className="av-subtitle">
            Auditoría financiera en tiempo real del Cerebro IA y control de bankroll
          </p>
        </div>
        <button className="av-refresh" onClick={fetchData} disabled={loading}>
          {loading ? '⟳' : '↺'} Actualizar
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="av-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`av-tab ${tab === t.id ? 'av-tab-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.id === 'mytracker' && !isPremium && (
              <span className="av-tab-lock">🔒</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Error ── */}
      {error && <div className="av-error">{error}</div>}

      {/* ── Loading ── */}
      {loading && (
        <div className="av-loading">
          <div className="av-spinner" />
          <span>Calculando métricas en vivo...</span>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          TAB 1: VORTEX TRACKER
      ════════════════════════════════════════════════ */}
      {!loading && tab === 'vortex' && vortexData && (
        <div className="av-body">

          {/* KPIs principales */}
          <div className="av-kpi-grid">
            <div className="av-kpi-card av-kpi-main">
              <WinRateCircle value={vortexData.winRate} />
              <div className="av-kpi-info">
                <div className="av-kpi-label">EFECTIVIDAD 30 DÍAS</div>
                <div className="av-kpi-sub">
                  {vortexData.aciertos} aciertos de {vortexData.totalAnalizados} analizados
                </div>
                <div className="av-kpi-bankroll">
                  Bankroll simulado:{' '}
                  <span style={{ color: '#34d399' }}>
                    ${vortexData.roiProgress?.length
                      ? vortexData.roiProgress[vortexData.roiProgress.length - 1].bankroll.toFixed(2)
                      : '100.00'}
                  </span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}> (base $100)</span>
                </div>
              </div>
            </div>

            <div className="av-kpi-card">
              <div className="av-kpi-label">COBROS EXITOSOS</div>
              <div className="av-kpi-big" style={{ color: '#34d399' }}>
                {vortexData.aciertos}
              </div>
              <div className="av-kpi-sub">Predicciones acertadas</div>
            </div>

            <div className="av-kpi-card">
              <div className="av-kpi-label">PARTIDOS EVALUADOS</div>
              <div className="av-kpi-big" style={{ color: '#f5a623' }}>
                {vortexData.totalAnalizados}
              </div>
              <div className="av-kpi-sub">Últimos 30 días</div>
            </div>
          </div>

          {/* Gráfica ROI */}
          {vortexData.roiProgress?.length > 1 && (
            <div className="av-section card">
              <div className="av-section-header">
                <span className="av-section-title">📈 Curva de ROI Simulado</span>
                <span className="av-section-sub">Bankroll inicial $100 · $10/apuesta</span>
              </div>
              <div style={{ padding: '0 16px 16px' }}>
                <RoiChart data={vortexData.roiProgress} />
              </div>
            </div>
          )}

          {/* Historial de operaciones */}
          {vortexData.roiProgress?.length > 0 && (
            <div className="av-section card">
              <div className="av-section-header">
                <span className="av-section-title">🗂 Historial de Operaciones</span>
              </div>
              <div className="av-ops-list">
                {vortexData.roiProgress.map((item, idx) => (
                  <div key={idx} className="av-op-row">
                    <div className="av-op-fecha">{item.fecha}</div>
                    <div className="av-op-partido">{item.partido}</div>
                    <div className={`av-op-result ${item.resultado === 'Ganado' ? 'win' : 'loss'}`}>
                      {item.resultado === 'Ganado' ? '✓ Ganado' : '✗ Perdido'}
                    </div>
                    <div className="av-op-bankroll">${item.bankroll.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {vortexData.totalAnalizados === 0 && (
            <div className="av-empty">
              ⚡ No hay eventos finalizados en los últimos 30 días para auditar
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════
          TAB 2: LEADERBOARD DE TIPSTERS
      ════════════════════════════════════════════════ */}
      {!loading && tab === 'leaderboard' && (
        <div className="av-body">
          {leaderboard.length === 0 ? (
            <div className="av-empty">No hay tipsters registrados aún</div>
          ) : (
            <div className="av-section card">
              <div className="av-section-header">
                <span className="av-section-title">🏆 Ranking de Pronosticadores</span>
                <span className="av-section-sub">Ordenado por Vortex Score</span>
              </div>
              <div className="av-table-wrap">
                <table className="av-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Pronosticador</th>
                      <th>Rango</th>
                      <th>Vortex Score</th>
                      <th>Win Rate</th>
                      <th>Yield</th>
                      <th>Picks</th>
                      <th>Racha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((t, idx) => (
                      <tr key={t.id}>
                        <td>
                          <span className="av-rank">
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                          </span>
                        </td>
                        <td>
                          <div className="av-tipster-cell">
                            <div className="av-avatar">
                              {t.nombre?.slice(0, 2).toUpperCase() || '??'}
                            </div>
                            <span className="av-tipster-nombre">{t.nombre}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`av-rango-badge av-rango-${t.rango?.toLowerCase()}`}>
                            {t.rango}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: '#f5a623', fontWeight: 700 }}>
                            {t.vortexScore?.toFixed(1)}
                          </span>
                        </td>
                        <td style={{ color: '#34d399', fontWeight: 600 }}>{t.winRate}</td>
                        <td style={{ color: '#34d399' }}>{t.yield}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{t.picksEnviados}</td>
                        <td><RachaBadges racha={t.racha} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════
          TAB 3: MY TRACKER
      ════════════════════════════════════════════════ */}
      {!loading && tab === 'mytracker' && (
        <div className="av-body">
          {!isPremium ? (
            /* Blur lock para usuarios free */
            <div className="av-lock-wrap">
              <div className="av-lock-blur card">
                <div className="av-lock-overlay">
                  <div className="av-lock-icon">🔒</div>
                  <div className="av-lock-title">Bitácora Inteligente de Inversión</div>
                  <div className="av-lock-desc">
                    Controla tu bankroll, rastrea tus apuestas y mide tu rendimiento financiero real.
                    Disponible en planes Premium y Oráculo.
                  </div>
                  <button
                    className="av-lock-btn"
                    onClick={() => window.location.hash = '#planes'}
                  >
                    💎 Desbloquear con Premium — $9.99/mes
                  </button>
                </div>
              </div>
            </div>
          ) : myTracker ? (
            <>
              {/* KPIs personales */}
              <div className="av-kpi-grid">
                <div className="av-kpi-card">
                  <div className="av-kpi-label">GANANCIA NETA</div>
                  <div className="av-kpi-big"
                    style={{ color: myTracker.netProfit >= 0 ? '#34d399' : '#e01a1a' }}>
                    {myTracker.netProfit >= 0 ? '+' : ''}${myTracker.netProfit?.toFixed(2)}
                  </div>
                  <div className="av-kpi-sub">USD acumulado</div>
                </div>
                <div className="av-kpi-card">
                  <div className="av-kpi-label">MI WIN RATE</div>
                  <div className="av-kpi-big" style={{ color: '#f5a623' }}>
                    {myTracker.winRatePersonal?.toFixed(1)}%
                  </div>
                  <div className="av-kpi-sub">Efectividad personal</div>
                </div>
                <div className="av-kpi-card">
                  <div className="av-kpi-label">PICKS SEGUIDOS</div>
                  <div className="av-kpi-big" style={{ color: 'var(--text-primary)' }}>
                    {myTracker.historial?.length || 0}
                  </div>
                  <div className="av-kpi-sub">Total registrados</div>
                </div>
              </div>

              {/* Historial personal */}
              {myTracker.historial?.length > 0 ? (
                <div className="av-section card">
                  <div className="av-section-header">
                    <span className="av-section-title">📒 Mis Apuestas Recientes</span>
                  </div>
                  <div className="av-ops-list">
                    {myTracker.historial.map((item, idx) => (
                      <div key={idx} className="av-op-row">
                        <div className="av-op-fecha">{item.fecha}</div>
                        <div className="av-op-partido">{item.partido}</div>
                        <div className="av-op-prediccion">
                          Mi pick: <strong>{item.miPrediccion}</strong>
                        </div>
                        <div className={`av-op-result ${
                          item.estado === 'won' ? 'win' :
                          item.estado === 'lost' ? 'loss' : 'pending'
                        }`}>
                          {item.estado === 'won'     ? '✓ Ganado'   :
                           item.estado === 'lost'    ? '✗ Perdido'  : '⏳ Pendiente'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="av-empty">
                  No has seguido ningún pick aún. ¡Empieza comprando un pick en el mercado!
                </div>
              )}
            </>
          ) : (
            <div className="av-empty">Cargando tu bitácora...</div>
          )}
        </div>
      )}
    </div>
  );
}

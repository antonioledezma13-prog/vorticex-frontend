// src/components/MarketCard.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './MarketCard.css';

// ─── SPARKLINE ────────────────────────────────────────────────────────────────
function Sparkline({ forma, color }) {
  const HEIGHT = 40;
  const WIDTH  = 98;

  if (!forma || !Array.isArray(forma) || forma.length === 0) {
    const y = HEIGHT / 2;
    return (
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <line x1="0" y1={y} x2={WIDTH} y2={y}
          stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="4,3" />
      </svg>
    );
  }

  let acum = 0;
  const valores = [0];
  for (const r of forma) {
    if (r === 'W')      acum += 1;
    else if (r === 'L') acum -= 1;
    valores.push(acum);
  }

  const min  = Math.min(...valores);
  const max  = Math.max(...valores);
  const rng  = max - min || 1;
  const padY = 6;

  const pts = valores.map((v, i) => {
    const x = (i / (valores.length - 1)) * WIDTH;
    const y = HEIGHT - padY - ((v - min) / rng) * (HEIGHT - padY * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const areaPoints = [`0,${HEIGHT}`, ...pts, `${WIDTH},${HEIGHT}`].join(' ');

  return (
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      <polygon points={areaPoints} fill={color} opacity="0.08" />
      <polyline points={pts.join(' ')} fill="none" stroke={color}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      {pts.length > 0 && (() => {
        const last = pts[pts.length - 1].split(',');
        return <circle cx={parseFloat(last[0])} cy={parseFloat(last[1])}
          r="3" fill={color} opacity="0.9" />;
      })()}
    </svg>
  );
}

// ─── MINI MODAL DE PRONÓSTICO INLINE ─────────────────────────────────────────
function PredictionInline({ market, token, onDone }) {
  const teamA  = market.teamA || market.home_team || 'Local';
  const teamB  = market.teamB || market.away_team || 'Visitante';
  const isPol  = market.type === 'politics';

  const opciones = isPol
    ? ['Opción A', 'Opción B', 'Empate técnico']
    : [`${teamA} gana`, `${teamB} gana`, 'Empate'];

  const [opcion,   setOpcion]   = useState('');
  const [custom,   setCustom]   = useState('');
  const [loading,  setLoading]  = useState(false);
  const [msg,      setMsg]      = useState('');

  async function submit() {
    const prediction = opcion === '__custom__' ? custom.trim() : opcion;
    if (!prediction) return;
    setLoading(true);
    setMsg('');
    try {
      const res  = await fetch('/api/predictions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ event_id: market.id, prediction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg(`✅ Pronóstico registrado: "${prediction}"`);
      setTimeout(() => onDone(prediction), 1200);
    } catch (err) {
      setMsg(`❌ ${err.message}`);
      setLoading(false);
    }
  }

  return (
    <div className="mc-pred-inline">
      <div className="mc-pred-label">🎯 Tu pronóstico</div>
      <div className="mc-pred-opciones">
        {opciones.map(op => (
          <button
            key={op}
            className={`mc-pred-btn ${opcion === op ? 'active' : ''}`}
            onClick={() => { setOpcion(op); setCustom(''); setMsg(''); }}
          >
            {op}
          </button>
        ))}
        <button
          className={`mc-pred-btn mc-pred-btn-custom ${opcion === '__custom__' ? 'active' : ''}`}
          onClick={() => { setOpcion('__custom__'); setMsg(''); }}
        >
          ✏️
        </button>
      </div>

      {opcion === '__custom__' && (
        <input
          className="mc-pred-input"
          type="text"
          placeholder="Escribe tu pronóstico..."
          value={custom}
          onChange={e => setCustom(e.target.value)}
          autoFocus
        />
      )}

      {msg ? (
        <div className={`mc-pred-msg ${msg.startsWith('✅') ? 'ok' : 'err'}`}>{msg}</div>
      ) : (
        <button
          className="mc-pred-confirm"
          onClick={submit}
          disabled={loading || !opcion || (opcion === '__custom__' && !custom.trim())}
        >
          {loading ? 'Registrando...' : 'Confirmar'}
        </button>
      )}
    </div>
  );
}

// ─── MARKET CARD ─────────────────────────────────────────────────────────────
export default function MarketCard({ market, onOpenAuth }) {
  const { user, token } = useAuth();
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [purchased,  setPurchased]  = useState(market.purchased || false);
  const [showPred,   setShowPred]   = useState(false);
  const [miPred,     setMiPred]     = useState(market.my_prediction || null);

  const isLive       = market.isLive;
  const isPolitics   = market.type === 'politics';
  const tieneTipster = !!market.tipster_id;

  // El usuario logueado es tipster o admin → puede pronosticar
  const esTipster = user && (user.tipo_usuario === 'tipster' || user.tipo_usuario === 'admin');
  const yaPronostico = !!miPred;
  // No se puede pronosticar en un evento propio (si el card tiene tipster_id igual al user)
  const esEventoPropio = esTipster && market.tipster_id && market.tipster_id === user?.id;

  const tipsterBadgeColor =
    market.tipster_tipo === 'oraculo' ? '#e01a1a' :
    market.tipster_tipo === 'pro'     ? '#f5a623' : '#6b7280';

  const tipsterLabel =
    market.tipster_tipo === 'oraculo' ? '🔮 Oráculo' :
    market.tipster_tipo === 'pro'     ? '⭐ Pro'     : '👤 Novato';

  function parsearForma(raw) {
    if (!raw) return null;
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw); } catch { return null; }
  }

  const formaHome = parsearForma(market.formaHome);
  const formaAway = parsearForma(market.formaAway);

  async function handleBuyPick() {
    if (!user)         { onOpenAuth?.(); return; }
    if (purchased)     return;
    if (!tieneTipster) return;
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/payments/pick/create', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ eventId: market.id, tipsterId: market.tipster_id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la orden');
      sessionStorage.setItem('vx_tipo_pago', 'pick');
      sessionStorage.setItem('vx_pick_meta', JSON.stringify({
        eventId:   market.id,
        tipsterId: market.tipster_id,
        evento:    market.title,
        tipster:   market.tipster_nombre,
      }));
      window.location.href = data.approvalUrl;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  function handlePredDone(prediction) {
    setMiPred(prediction);
    setShowPred(false);
  }

  return (
    <div className={`market-card card ${isLive ? 'is-live' : ''}`}
      style={{ position: 'relative', overflow: 'hidden' }}>
      {isLive && <div className="card-live-glow" />}

      {/* ── Header ── */}
      <div className="mc-header">
        <span className={`cat-badge ${isPolitics ? 'politics' : 'sport'}`}>
          {isPolitics ? '🏛 Politics' : '⚽ Sport'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isLive && (
            <span style={{ fontSize: 11, fontWeight: 700, color: '#e01a1a', letterSpacing: '0.05em' }}>
              ● LIVE
            </span>
          )}
          {tieneTipster && (
            <span style={{
              fontSize: '0.68rem', fontWeight: 600,
              padding: '2px 7px', borderRadius: 20,
              background: `${tipsterBadgeColor}22`,
              color: tipsterBadgeColor,
              border: `1px solid ${tipsterBadgeColor}55`,
            }}>
              {tipsterLabel}
            </span>
          )}
        </div>
      </div>

      {/* ── Título ── */}
      <div className="mc-title">{market.title}</div>
      {market.subtitle && <div className="mc-subtitle">{market.subtitle}</div>}

      {/* ── Contendientes ── */}
      <div className="mc-contenders">
        <div className="contender">
          <div className="contender-avatar">
            {isPolitics ? (
              <div className="politician-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
            ) : (
              <span className="team-abbr">
                {market.teamA?.slice(0, 3).toUpperCase() || 'HOM'}
              </span>
            )}
          </div>
          <span className="contender-name">{market.teamA || 'Local'}</span>
        </div>

        <span className="vs-divider">VS</span>

        <div className="contender">
          <div className="contender-avatar">
            {isPolitics ? (
              <div className="politician-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
            ) : (
              <span className="team-abbr" style={{ color: 'var(--gold)' }}>
                {market.teamB?.slice(0, 3).toUpperCase() || 'VIS'}
              </span>
            )}
          </div>
          <span className="contender-name">{market.teamB || 'Visitante'}</span>
        </div>
      </div>

      {/* ── Sparklines ── */}
      <div className="mc-sparklines">
        <Sparkline forma={formaHome} color="var(--red-bright, #e01a1a)" />
        <Sparkline forma={formaAway} color="var(--gold, #f5a623)" />
      </div>

      {/* ── Forma ── */}
      {(formaHome || formaAway) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          {[formaHome, formaAway].map((forma, idx) => forma && (
            <div key={idx} style={{ display: 'flex', gap: 3 }}>
              {forma.map((r, i) => (
                <span key={i} style={{
                  fontSize: '0.6rem', fontWeight: 700,
                  width: 14, height: 14, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: r === 'W' ? 'rgba(52,211,153,0.2)' : r === 'L' ? 'rgba(224,26,26,0.2)' : 'rgba(255,255,255,0.1)',
                  color: r === 'W' ? '#34d399' : r === 'L' ? '#e01a1a' : '#9ca3af',
                  border: `1px solid ${r === 'W' ? '#34d39944' : r === 'L' ? '#e01a1a44' : '#ffffff22'}`,
                }}>
                  {r}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── Probabilidades ── */}
      <div className="mc-probs">
        <div className="prob-col">
          <span className="prob-pct red">{market.probA || 50}%</span>
          <span className="prob-name">{market.teamA || 'Local'}</span>
          <span className="prob-odds">{market.oddsA !== '—' ? `@${market.oddsA}` : ''}</span>
        </div>
        <div className="prob-sep" />
        <div className="prob-col right">
          <span className="prob-pct gold">{market.probB || 50}%</span>
          <span className="prob-name">{market.teamB || 'Visitante'}</span>
          <span className="prob-odds">{market.oddsB !== '—' ? `@${market.oddsB}` : ''}</span>
        </div>
      </div>

      <div className="mc-progress-bar">
        <div className="mc-progress-fill" style={{ width: `${market.probA || 50}%` }} />
      </div>

      {/* ── Análisis preview ── */}
      {tieneTipster && market.analisis_preview && (
        <div style={{ marginTop: 12, position: 'relative' }}>
          <div style={{
            fontSize: '0.8rem', color: 'var(--text-secondary, #9ca3af)',
            padding: '0.6rem', background: 'rgba(255,255,255,0.04)',
            borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)',
            filter: purchased ? 'none' : 'blur(4px)',
            userSelect: purchased ? 'auto' : 'none',
          }}>
            {market.analisis_preview}
          </div>
          {!purchased && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', color: 'var(--text-secondary)',
            }}>
              🔒 Desbloquea para ver el análisis
            </div>
          )}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{
          marginTop: 8, fontSize: '0.78rem', color: '#e01a1a',
          background: 'rgba(224,26,26,0.1)', borderRadius: 6, padding: '4px 8px',
        }}>
          {error}
        </div>
      )}

      {/* ── Botón pick (compra para usuarios) ── */}
      {tieneTipster && !esTipster && (
        <div style={{ marginTop: 12 }}>
          {purchased ? (
            <div style={{
              textAlign: 'center', padding: '0.6rem', borderRadius: 8,
              background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)',
              color: '#34d399', fontSize: '0.82rem', fontWeight: 600,
            }}>
              ✅ Pick desbloqueado — {market.tipster_nombre}
            </div>
          ) : (
            <button onClick={handleBuyPick} disabled={loading} style={{
              width: '100%', padding: '0.65rem', borderRadius: 8, border: 'none',
              background: `linear-gradient(135deg, ${tipsterBadgeColor}, ${tipsterBadgeColor}99)`,
              color: '#fff', fontWeight: 700, fontSize: '0.85rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            }}>
              {loading ? '⚙️ Redirigiendo...' : `🎯 Pick de ${market.tipster_nombre} — $2.00`}
              {!loading && (
                <span style={{ fontSize: '0.68rem', fontWeight: 400, opacity: 0.85 }}>
                  80% al Tipster · Pago seguro PayPal
                </span>
              )}
            </button>
          )}
        </div>
      )}

      {/* ── Zona de pronóstico para tipsters ── */}
      {esTipster && !esEventoPropio && market.status !== 'finished' && (
        <div style={{ marginTop: 12 }}>
          {yaPronostico ? (
            <div className="mc-pred-done">
              <span>🎯</span>
              <span>Tu pronóstico: <strong>{miPred}</strong></span>
            </div>
          ) : showPred ? (
            <PredictionInline
              market={market}
              token={token}
              onDone={handlePredDone}
            />
          ) : (
            <button className="mc-pred-open-btn" onClick={() => setShowPred(true)}>
              🎯 Registrar mi pronóstico
            </button>
          )}
        </div>
      )}
    </div>
  );
}

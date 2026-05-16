// src/components/HotMarkets.jsx
import React from 'react';
import './HotMarkets.css';

const MEDALLA = { oraculo: '🔮', pro: '🥈', novato: '🥉' };

function getMedalla(score) {
  if (score >= 75) return 'oraculo';
  if (score >= 50) return 'pro';
  return 'novato';
}

export default function HotMarkets({ markets = [], leaderboard = [] }) {
  return (
    <div className="hot-markets card">
      <div className="section-header">
        <div className="section-title">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/>
          </svg>
          Hot Markets
        </div>
        <button className="view-all">↔</button>
      </div>

      {/* Mercados con odds reales */}
      {markets.length > 0 ? (
        <table className="hm-table">
          <tbody>
            {markets.map((m, i) => (
              <tr key={i} className="hm-row">
                <td className="hm-name-cell">
                  <span className={`hm-dot ${m.sports ? 'sports' : 'politics'}`} />
                  <span className="hm-name">{m.name}</span>
                </td>
                <td className="hm-odds-cell red">{m.a}</td>
                <td className="hm-odds-cell gold">{m.b}</td>
                <td className="hm-trend-cell">
                  <span className={`hm-trend ${m.trend}`}>
                    {m.trend === 'up' ? '▲' : m.trend === 'down' ? '▼' : '–'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ padding: '12px 0', color: 'var(--text-dim)', fontSize: 13, textAlign: 'center' }}>
          Cargando mercados...
        </div>
      )}

      {/* Leaderboard mini */}
      {leaderboard.length > 0 && (
        <>
          <div className="hm-divider" />
          <div className="hm-leaderboard-title">
            🏆 Top Tipsters
          </div>
          {leaderboard.slice(0, 3).map((user, i) => (
            <div key={user.id} className="hm-tipster-row">
              <span className="hm-tipster-rank">#{i + 1}</span>
              <span className="hm-tipster-medal">
                {MEDALLA[getMedalla(user.vortex_score)]}
              </span>
              <span className="hm-tipster-name">{user.nombre}</span>
              <span className="hm-tipster-score">
                {parseFloat(user.vortex_score || 0).toFixed(1)}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// src/pages/Leaderboard.jsx
// Ranking de tipsters — consume GET /api/auth/leaderboard
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Leaderboard.css';

const MEDALLA = {
  oraculo: { icon: '🔮', label: 'Oráculo', color: '#e01a1a' },
  pro:     { icon: '⭐', label: 'Pro',     color: '#f5a623' },
  novato:  { icon: '👤', label: 'Novato',  color: '#6b7280' },
};

function getMedalla(score) {
  if (score >= 75) return 'oraculo';
  if (score >= 50) return 'pro';
  return 'novato';
}

function RankBadge({ rank }) {
  if (rank === 1) return <span className="lb-rank lb-rank-1">🥇</span>;
  if (rank === 2) return <span className="lb-rank lb-rank-2">🥈</span>;
  if (rank === 3) return <span className="lb-rank lb-rank-3">🥉</span>;
  return <span className="lb-rank lb-rank-n">#{rank}</span>;
}

export default function Leaderboard() {
  const { token }  = useAuth();
  const [tipsters, setTipsters] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [filter,   setFilter]   = useState('all'); // 'all' | 'oraculo' | 'pro' | 'novato'

  useEffect(() => {
    async function fetch_() {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res  = await fetch('/api/auth/leaderboard', { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al cargar leaderboard');
        setTipsters(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetch_();
  }, [token]);

  const filtered = tipsters.filter(t => {
    if (filter === 'all') return true;
    return getMedalla(t.vortex_score || 0) === filter;
  });

  return (
    <div className="leaderboard-page">

      {/* Header */}
      <div className="lb-header">
        <div>
          <h1 className="lb-title">🏆 Leaderboard</h1>
          <p className="lb-subtitle">Los mejores tipsters de Vorticex rankeados por VortexScore</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="lb-filters">
        {['all', 'oraculo', 'pro', 'novato'].map(f => (
          <button
            key={f}
            className={`lb-filter ${filter === f ? 'lb-filter-active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all'    ? '🌐 Todos'         :
             f === 'oraculo'? '🔮 Oráculo'       :
             f === 'pro'    ? '⭐ Pro'           : '👤 Novato'}
          </button>
        ))}
      </div>

      {/* Estado */}
      {error   && <div className="lb-error">{error}</div>}
      {loading && <div className="lb-loading">Cargando ranking...</div>}

      {/* Top 3 podio */}
      {!loading && filtered.length >= 3 && (
        <div className="lb-podio">
          {/* 2do lugar */}
          <div className="lb-podio-item lb-podio-2">
            <div className="lb-podio-avatar">
              {filtered[1]?.nombre?.slice(0, 2).toUpperCase()}
            </div>
            <div className="lb-podio-rank">🥈</div>
            <div className="lb-podio-nombre">{filtered[1]?.nombre}</div>
            <div className="lb-podio-score">{Number(filtered[1]?.vortex_score || 0).toFixed(1)}</div>
          </div>
          {/* 1er lugar */}
          <div className="lb-podio-item lb-podio-1">
            <div className="lb-podio-crown">👑</div>
            <div className="lb-podio-avatar lb-podio-avatar-1">
              {filtered[0]?.nombre?.slice(0, 2).toUpperCase()}
            </div>
            <div className="lb-podio-rank">🥇</div>
            <div className="lb-podio-nombre">{filtered[0]?.nombre}</div>
            <div className="lb-podio-score">{Number(filtered[0]?.vortex_score || 0).toFixed(1)}</div>
          </div>
          {/* 3er lugar */}
          <div className="lb-podio-item lb-podio-3">
            <div className="lb-podio-avatar">
              {filtered[2]?.nombre?.slice(0, 2).toUpperCase()}
            </div>
            <div className="lb-podio-rank">🥉</div>
            <div className="lb-podio-nombre">{filtered[2]?.nombre}</div>
            <div className="lb-podio-score">{Number(filtered[2]?.vortex_score || 0).toFixed(1)}</div>
          </div>
        </div>
      )}

      {/* Tabla completa */}
      {!loading && filtered.length > 0 && (
        <div className="lb-table-wrap">
          <table className="lb-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tipster</th>
                <th>Nivel</th>
                <th>VortexScore</th>
                <th>Efectividad</th>
                <th>Picks</th>
                <th>Aciertos</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, idx) => {
                const medalla  = getMedalla(t.vortex_score || 0);
                const med      = MEDALLA[medalla];
                const total    = (t.aciertos || 0) + (t.fallos || 0);
                const efectividad = total > 0
                  ? ((t.aciertos / total) * 100).toFixed(1)
                  : '—';

                return (
                  <tr key={t.id} className={idx < 3 ? 'lb-row-top' : ''}>
                    <td><RankBadge rank={idx + 1} /></td>
                    <td>
                      <div className="lb-tipster-cell">
                        <div className="lb-avatar">
                          {t.nombre?.slice(0, 2).toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="lb-nombre">{t.nombre}</div>
                          <div className="lb-tipo">{t.tipo_usuario}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className="lb-medalla-badge"
                        style={{ color: med.color, background: med.color + '18', border: `1px solid ${med.color}44` }}
                      >
                        {med.icon} {med.label}
                      </span>
                    </td>
                    <td>
                      <div className="lb-score-wrap">
                        <span className="lb-score-val" style={{ color: med.color }}>
                          {Number(t.vortex_score || 0).toFixed(1)}
                        </span>
                        <div className="lb-score-bar">
                          <div
                            className="lb-score-fill"
                            style={{ width: `${Math.min(t.vortex_score || 0, 100)}%`, background: med.color }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: efectividad >= 60 ? '#34d399' : '#f5a623' }}>
                        {efectividad}{efectividad !== '—' ? '%' : ''}
                      </span>
                    </td>
                    <td>{t.total_picks || 0}</td>
                    <td style={{ color: '#34d399' }}>{t.aciertos || 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filtered.length === 0 && !error && (
        <div className="lb-empty">No hay tipsters en esta categoría aún</div>
      )}
    </div>
  );
}

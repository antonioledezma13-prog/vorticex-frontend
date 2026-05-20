// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import HeroBanner   from '../components/HeroBanner';
import MarketCard   from '../components/MarketCard';
import LiveFeed     from '../components/LiveFeed';
import GlobalTrends from '../components/GlobalTrends';
import HotMarkets   from '../components/HotMarkets';
import { useEvents }      from '../hooks/useEvents';
import { usePredictions } from '../hooks/usePredictions';
import { useAuth }        from '../context/AuthContext';
import './Dashboard.css';

// ─── SKELETON ────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="market-card card skeleton-card">
      <div className="sk-line sk-short" />
      <div className="sk-line sk-long"  />
      <div className="sk-line sk-med"   />
      <div className="sk-avatars">
        <div className="sk-avatar" />
        <div className="sk-avatar" />
      </div>
      <div className="sk-line sk-full" />
    </div>
  );
}

// ─── MEDALLA CONFIG ───────────────────────────────────────────────────────────
const MEDALLA_COLOR = {
  oraculo: '#e01a1a',
  pro:     '#f5a623',
  novato:  '#6b7280',
};

function getMedallaKey(score) {
  if (score >= 75) return 'oraculo';
  if (score >= 50) return 'pro';
  return 'novato';
}

// ─── PREDICTION FEED CARD ────────────────────────────────────────────────────
function PredFeedCard({ pred }) {
  const medalla = getMedallaKey(pred.vortex_score || 0);
  const color   = MEDALLA_COLOR[medalla];

  const resultCfg = {
    won:     { icon: '✅', color: '#22c55e', label: 'Acertó' },
    lost:    { icon: '❌', color: '#e01a1a', label: 'Falló'  },
    correct: { icon: '✅', color: '#22c55e', label: 'Acertó' },
    incorrect:{ icon:'❌', color: '#e01a1a', label: 'Falló'  },
    pending: { icon: '⏳', color: '#f5a623', label: 'Pendiente' },
  }[pred.result] || { icon: '⏳', color: '#f5a623', label: 'Pendiente' };

  return (
    <div className="pred-feed-card">
      <div className="pfc-left">
        <div className="pfc-avatar" style={{ borderColor: color }}>
          {pred.nombre?.slice(0, 2).toUpperCase() || 'TX'}
        </div>
        <div className="pfc-info">
          <span className="pfc-nombre">{pred.nombre}</span>
          <span className="pfc-score" style={{ color }}>
            {(pred.vortex_score || 0).toFixed(1)} pts
          </span>
        </div>
      </div>
      <div className="pfc-pick">
        <span className="pfc-pick-label">Pronóstico</span>
        <span className="pfc-pick-val">{pred.prediction}</span>
      </div>
      <div className="pfc-result" style={{ color: resultCfg.color }}>
        {resultCfg.icon} {resultCfg.label}
      </div>
    </div>
  );
}

// ─── PREDICTIONS FEED SECTION ─────────────────────────────────────────────────
function PredictionsFeed() {
  const { token, user }    = useAuth();
  const { predictions, loading } = usePredictions();

  if (loading) return null;
  if (!predictions || predictions.length === 0) return null;

  // Free solo ve novatos, premium/tipster ve todos — ya filtrado por el backend
  const isPremium = user && user.tipo_usuario !== 'free';

  return (
    <section className="dash-section" style={{ animationDelay: '0.18s' }}>
      <div className="section-header">
        <div className="section-title">
          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}>
            <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
          </svg>
          Pronósticos de Tipsters
        </div>
        {!isPremium && (
          <span className="pred-feed-lock-note">
            🔒 Premium desbloquea pronósticos de Oráculos y Pros
          </span>
        )}
      </div>
      <div className="pred-feed-list">
        {predictions.slice(0, 8).map(p => (
          <PredFeedCard key={p.id} pred={p} />
        ))}
      </div>
    </section>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 6;

export default function Dashboard({ activeTab, onOpenAuth }) {
  const [visible, setVisible] = useState(false);
  const [page,    setPage]    = useState(1);
  const { events,  loading: eventsLoading } = useEvents();
  const { leaderboard }                      = usePredictions();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { setPage(1); }, [activeTab]);

  const filteredEvents = events.filter(e => {
    if (activeTab === 'sports' || activeTab === 'sport')
      return e.type === 'sports' || e.type === 'sport';
    if (activeTab === 'politics')
      return e.type === 'politics';
    return true;
  });

  const totalPages  = Math.ceil(filteredEvents.length / PAGE_SIZE);
  const pagedEvents = filteredEvents.slice(0, page * PAGE_SIZE);

  const hotMarkets = events
    .filter(e => e.oddsA !== '—' && e.oddsB !== '—')
    .slice(0, 5)
    .map(e => ({
      name:  e.title,
      a:     e.oddsA,
      b:     e.oddsB,
      trend: 'neutral',
      sport: e.type === 'sports' || e.type === 'sport',
    }));

  return (
    <div className={`dashboard ${visible ? 'dashboard-visible' : ''}`}>
      <HeroBanner />

      <div className="dashboard-body">

        {/* ── Markets + Live Feed ── */}
        <section className="dash-section" style={{ animationDelay: '0.05s' }}>
          <div className="section-header">
            <div className="section-title">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z"/>
              </svg>
              Top Markets Today
            </div>
            {!eventsLoading && (
              <span style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: "'Share Tech Mono', monospace" }}>
                {filteredEvents.length} mercados activos
              </span>
            )}
          </div>

          <div className="markets-livefeed-row">
            <div className="markets-col">
              {eventsLoading ? (
                <div className="markets-grid">
                  <CardSkeleton /><CardSkeleton />
                  <CardSkeleton /><CardSkeleton />
                </div>
              ) : pagedEvents.length > 0 ? (
                <>
                  <div className="markets-grid">
                    {pagedEvents.map(m => (
                      <MarketCard key={m.id} market={m} onOpenAuth={onOpenAuth} />
                    ))}
                  </div>
                  {page < totalPages && (
                    <div className="load-more-wrap">
                      <button className="load-more-btn" onClick={() => setPage(p => p + 1)}>
                        Ver más mercados ({filteredEvents.length - pagedEvents.length} restantes)
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-events">
                  <span>⚡</span>
                  <p>No hay mercados disponibles para esta categoría</p>
                </div>
              )}
            </div>

            <div className="livefeed-col">
              <LiveFeed events={pagedEvents} />
            </div>
          </div>
        </section>

        {/* ── Feed de pronósticos de tipsters ── */}
        <PredictionsFeed />

        {/* ── Global Trends + Hot Markets ── */}
        <section className="dash-section" style={{ animationDelay: '0.12s' }}>
          <div className="trends-hot-row">
            <div className="trends-col"><GlobalTrends /></div>
            <div className="hotmarkets-col">
              <HotMarkets markets={hotMarkets} leaderboard={leaderboard} />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

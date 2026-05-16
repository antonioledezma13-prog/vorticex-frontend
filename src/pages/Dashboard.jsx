// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import HeroBanner   from '../components/HeroBanner';
import MarketCard   from '../components/MarketCard';
import LiveFeed     from '../components/LiveFeed';
import GlobalTrends from '../components/GlobalTrends';
import HotMarkets   from '../components/HotMarkets';
import { useEvents }      from '../hooks/useEvents';
import { usePredictions } from '../hooks/usePredictions';
import './Dashboard.css';

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

const PAGE_SIZE = 6; // eventos por página

export default function Dashboard({ activeTab, onOpenAuth }) {
  const [visible,  setVisible]  = useState(false);
  const [page,     setPage]     = useState(1);
  const { events,  loading: eventsLoading } = useEvents();
  const { leaderboard }                      = usePredictions();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Resetear página al cambiar tab
  useEffect(() => { setPage(1); }, [activeTab]);

  // Filtrar según tab activo — acepta 'sports' y 'sport' por compatibilidad
  const filteredEvents = events.filter(e => {
    if (activeTab === 'sports' || activeTab === 'sport')
      return e.type === 'sports' || e.type === 'sport';
    if (activeTab === 'politics')
      return e.type === 'politics';
    return true; // home, livefeed, etc. muestran todos
  });

  const totalPages  = Math.ceil(filteredEvents.length / PAGE_SIZE);
  const pagedEvents = filteredEvents.slice(0, page * PAGE_SIZE);

  // Hot markets — eventos con odds reales
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

        {/* Header de sección */}
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

          {/* Grid de markets + Live Feed */}
          <div className="markets-livefeed-row">
            <div className="markets-col">

              {/* Skeletons mientras carga */}
              {eventsLoading ? (
                <div className="markets-grid">
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              ) : pagedEvents.length > 0 ? (
                <>
                  <div className="markets-grid">
                    {pagedEvents.map(m => (
                      <MarketCard key={m.id} market={m} onOpenAuth={onOpenAuth} />
                    ))}
                  </div>

                  {/* Paginación */}
                  {page < totalPages && (
                    <div className="load-more-wrap">
                      <button
                        className="load-more-btn"
                        onClick={() => setPage(p => p + 1)}
                      >
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

            {/* Live Feed a la derecha */}
            <div className="livefeed-col">
              <LiveFeed events={pagedEvents} />
            </div>
          </div>
        </section>

        {/* Global Trends + Hot Markets */}
        <section className="dash-section" style={{ animationDelay: '0.12s' }}>
          <div className="trends-hot-row">
            <div className="trends-col">
              <GlobalTrends />
            </div>
            <div className="hotmarkets-col">
              <HotMarkets markets={hotMarkets} leaderboard={leaderboard} />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

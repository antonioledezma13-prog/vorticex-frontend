// src/components/LiveFeed.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './LiveFeed.css';

const MEDALLA_ICON = { oraculo: '🔮', pro: '🥈', novato: '🥉' };

function getMedalla(score) {
  if (score >= 75) return 'oraculo';
  if (score >= 50) return 'pro';
  return 'novato';
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)  return 'ahora';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function LiveFeed({ events = [] }) {
  const { token } = useAuth();
  const [feed,    setFeed]    = useState([]);
  const [flashId, setFlashId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch predicciones reales del backend
  useEffect(() => {
    async function fetchFeed() {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res  = await fetch('/api/predictions', { headers });
        const data = await res.json();

        if (Array.isArray(data) && data.length) {
          const items = data.slice(0, 8).map(p => ({
            id:     p.id,
            icon:   MEDALLA_ICON[getMedalla(p.vortex_score || 0)] || '🎯',
            title:  p.nombre ? `${p.nombre} predijo` : 'Nuevo pronóstico',
            detail: p.prediction,
            time:   timeAgo(p.created_at),
            gold:   (p.vortex_score || 0) >= 50,
            result: p.result,
          }));
          setFeed(items);
        } else {
          // Fallback con datos de los eventos reales
          setFeed(buildFeedFromEvents(events));
        }
      } catch {
        setFeed(buildFeedFromEvents(events));
      } finally {
        setLoading(false);
      }
    }

    fetchFeed();
    const interval = setInterval(fetchFeed, 30000); // refresh cada 30s
    return () => clearInterval(interval);
  }, [token, events]);

  // Construir feed a partir de eventos cuando no hay predicciones
  function buildFeedFromEvents(evs) {
    return evs.slice(0, 6).map((e, i) => ({
      id:     i + 1,
      icon:   e.type === 'politics' ? '🏛' : '⚡',
      title:  'Mercado activo',
      detail: e.title,
      time:   'ahora',
      gold:   e.type === 'politics',
      result: 'pending',
    }));
  }

  // Simular nuevas entradas cuando hay poca actividad
  useEffect(() => {
    if (feed.length < 3) return;
    const interval = setInterval(() => {
      const eventNames = events.map(e => e.title).filter(Boolean);
      if (!eventNames.length) return;
      const name = eventNames[Math.floor(Math.random() * eventNames.length)];
      const newItem = {
        id:     Date.now(),
        icon:   '🎯',
        title:  'Nuevo pronóstico',
        detail: name,
        time:   'ahora',
        gold:   false,
        result: 'pending',
      };
      setFlashId(newItem.id);
      setFeed(prev => [newItem, ...prev.slice(0, 7)]);
      setTimeout(() => setFlashId(null), 800);
    }, 8000);
    return () => clearInterval(interval);
  }, [feed, events]);

  return (
    <div className="live-feed card">
      <div className="section-header">
        <div className="section-title">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.66-1.65-4.34-1.65-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
          </svg>
          Live Feed
        </div>
        <button className="view-all">Ver todo</button>
      </div>

      <div className="feed-list">
        {loading ? (
          [1,2,3,4].map(i => (
            <div key={i} className="feed-item">
              <div className="feed-icon gold" style={{ opacity: 0.3 }}>⏳</div>
              <div className="feed-body">
                <div className="sk-line sk-short" style={{ height:10, marginBottom:4 }} />
                <div className="sk-line sk-long"  style={{ height:8 }} />
              </div>
            </div>
          ))
        ) : feed.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
            Sin actividad reciente
          </div>
        ) : (
          feed.map(item => (
            <div
              key={item.id}
              className={`feed-item ${flashId === item.id ? 'feed-flash' : ''}`}
            >
              <div className={`feed-icon ${item.gold ? 'gold' : 'red'}`}>{item.icon}</div>
              <div className="feed-body">
                <div className="feed-title">{item.title}</div>
                <div className="feed-detail">{item.detail}</div>
              </div>
              <div className="feed-time-wrap">
                <div className="feed-time">{item.time}</div>
                {item.result === 'correct'   && <span className="feed-result correct">✓</span>}
                {item.result === 'incorrect' && <span className="feed-result incorrect">✗</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

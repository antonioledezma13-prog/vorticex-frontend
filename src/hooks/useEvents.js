// src/hooks/useEvents.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

function normalizeType(t) {
  if (!t) return 'sports';
  return t === 'sport' ? 'sports' : t;
}

// Parsear forma desde string JSON, array, o null
function parsarForma(raw) {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return null; }
}

function mapEvent(e) {
  const formaHome = parsarForma(e.forma_home || e.formaHome);
  const formaAway = parsarForma(e.forma_away || e.formaAway);

  return {
    // Identidad
    id:       e.id || e._id?.toString(),
    title:    e.home_team && e.away_team
      ? `${e.home_team} vs ${e.away_team}`
      : e.name,
    subtitle: e.league || e.country || '',
    name:     e.name,

    // Tipo y estado
    type:   normalizeType(e.type),
    status: e.status || 'upcoming',
    isLive: e.status === 'live',

    // Equipos
    teamA:     e.home_team || 'Local',
    teamB:     e.away_team || 'Visitante',
    home_team: e.home_team,
    away_team: e.away_team,
    league:    e.league,
    country:   e.country,

    // Probabilidades y odds
    probA:  e.prob_home ?? 50,
    probB:  e.prob_away ?? 50,
    oddsA:  e.odds_home ?? '—',
    oddsB:  e.odds_away ?? '—',

    // IA
    ia_analisis:      e.ia_analisis  || null,
    ia_confianza:     e.ia_confianza || null,
    analisis_preview: e.ia_analisis
      ? e.ia_analisis.slice(0, 120) + '...'
      : null,

    // ✅ Sparklines reales — formaHome/formaAway que MarketCard espera
    formaHome,
    formaAway,

    // Tipster del evento
    tipster_id:     e.tipster_id     || null,
    tipster_nombre: e.tipster_nombre || null,
    tipster_tipo:   e.tipster_tipo   || null,

    // Acceso
    _locked:   e._locked  ?? true,
    purchased: e.purchased ?? 0,

    // Pronóstico del usuario logueado
    my_prediction: e.my_prediction || null,
    my_result:     e.my_result     || null,

    // Tiempo
    start_time: e.start_time,
    end_time:   e.end_time,
    resultado:  e.resultado || null,
  };
}

export function useEvents() {
  const { token } = useAuth();
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res  = await fetch('/api/events', { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setEvents(Array.isArray(data) ? data.map(mapEvent) : []);
    } catch (err) {
      console.error('[useEvents]', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
}

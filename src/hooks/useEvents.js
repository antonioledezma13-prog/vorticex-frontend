// src/hooks/useEvents.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function useEvents() {
  const { token } = useAuth();
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res  = await fetch('/api/events', { headers });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Error al cargar eventos');
        if (!Array.isArray(data)) throw new Error('Respuesta inesperada del servidor');

        const transformed = data.map(e => {
          const rawA  = parseFloat(e.prob_home) || 50;
          const rawB  = parseFloat(e.prob_away) || 50;
          const total = rawA + rawB || 100;
          const probA = parseFloat(((rawA / total) * 100).toFixed(1));
          const probB = parseFloat((100 - probA).toFixed(1));

          const tipo = e.type === 'politics' ? 'politics' : 'sports';

          const fecha = e.start_time
            ? new Date(e.start_time).toLocaleDateString('es-ES', {
                day: 'numeric', month: 'short',
                hour: '2-digit', minute: '2-digit',
              })
            : '';
          const subtitle = e.league ? `${e.league} · ${fecha}` : fecha;

          let iaAnalisis = null;
          if (e.ia_analisis) {
            try {
              iaAnalisis = typeof e.ia_analisis === 'string'
                ? JSON.parse(e.ia_analisis)
                : e.ia_analisis;
            } catch { iaAnalisis = null; }
          }

          // Parsear forma — soporta: array, JSON string, string con comas "W,D,L,W,W"
          function parsearForma(raw) {
            if (!raw) return null;
            if (Array.isArray(raw)) return raw.filter(r => ['W','D','L'].includes(r));
            if (typeof raw === 'string') {
              // Intentar JSON primero
              try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed.filter(r => ['W','D','L'].includes(r));
              } catch { /* no es JSON */ }
              // String con comas: "W,D,L,W,W"
              const partes = raw.split(',').map(s => s.trim()).filter(r => ['W','D','L'].includes(r));
              return partes.length > 0 ? partes : null;
            }
            return null;
          }

          let tipster_tipo = null;
          if (e.tipster_score != null) {
            tipster_tipo = e.tipster_score >= 75 ? 'oraculo'
              : e.tipster_score >= 50 ? 'pro'
              : 'novato';
          }

          return {
            id:              e.id || e._id?.toString(),
            type:            tipo,
            title:           e.name        || 'Evento sin nombre',
            subtitle,
            isLive:          e.status      === 'live',
            teamA:           e.home_team   || 'Local',
            teamB:           e.away_team   || 'Visitante',
            probA,
            probB,
            oddsA:           e.odds_home   ? String(parseFloat(e.odds_home).toFixed(2)) : '—',
            oddsB:           e.odds_away   ? String(parseFloat(e.odds_away).toFixed(2)) : '—',
            _locked:         e._locked     || false,
            ia_analisis:     iaAnalisis,
            ia_confianza:    e.ia_confianza || null,
            source:          e.source,
            country:         e.country,
            venue:           e.venue,
            status:          e.status,
            league:          e.league,
            // ── Forma real para Sparkline (soporta W,D,L string del puente MongoDB) ──
            formaHome:       parsearForma(e.forma_home),
            formaAway:       parsearForma(e.forma_away),
            // ── Tipster ──
            tipster_id:      e.tipster_id     || null,
            tipster_nombre:  e.tipster_nombre || null,
            tipster_tipo,
            confianza:       e.ia_confianza   || null,
            analisis_preview: iaAnalisis?.analisis
              ? iaAnalisis.analisis.slice(0, 120) + '...'
              : null,
            purchased:       e.purchased      || false,
          };
        });

        setEvents(transformed);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('[useEvents]', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
    const interval = setInterval(fetchEvents, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  return { events, loading, error };
}

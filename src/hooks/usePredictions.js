// src/hooks/usePredictions.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function usePredictions() {
  const { token } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [myStats,     setMyStats]     = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Predicciones recientes
        const resP = await fetch('/api/predictions', { headers });
        if (resP.ok) {
          const data = await resP.json();
          setPredictions(data);
        }

        // Mis stats (solo si está logueado)
        if (token) {
          const resS = await fetch('/api/predictions/mis-stats', { headers });
          if (resS.ok) setMyStats(await resS.json());
        }

        // Leaderboard público
        const resL = await fetch('/api/auth/leaderboard');
        if (resL.ok) setLeaderboard(await resL.json());

      } catch (err) {
        console.error('[usePredictions]', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
    const interval = setInterval(fetchAll, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  // Crear nuevo pronóstico
  async function createPrediction(eventId, prediction) {
    const res = await fetch('/api/predictions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ event_id: eventId, prediction }),
    });
    return res.json();
  }

  return { predictions, myStats, leaderboard, loading, createPrediction };
}

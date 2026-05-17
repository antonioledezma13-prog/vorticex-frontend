// src/views/AnalyticsView.jsx
import React, { useState, useEffect } from 'react';

export default function AnalyticsView() {
  const [activeSubTab, setActiveSubTab] = useState('vortex');
  const [vortexData, setVortexData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulación de data estructurada para poblar los contenedores
    setVortexData({
      winRate: 76.4,
      totalAnalizados: 34,
      aciertos: 26,
      roiProgress: [
        { fecha: '10 May', partido: 'Atalanta BC vs Bologna', bankroll: 108.50, resultado: 'Ganado' },
        { fecha: '12 May', partido: 'Newcastle vs West Ham', bankroll: 117.00, resultado: 'Ganado' },
        { fecha: '14 May', partido: 'Athletic Bilbao vs Celta Vigo', bankroll: 125.50, resultado: 'Ganado' }
      ]
    });
    setLeaderboard([
      { id: 1, nombre: 'Vortex AI Bot', rango: 'ALGORITMO', yield: '+24.5%', winRate: '78.2%' },
      { id: 2, nombre: 'Antonio Ledezma', rango: 'ADMINISTRADOR', yield: '+18.2%', winRate: '74.0%' }
    ]);
    setLoading(false);
  }, [activeSubTab]);

  return (
    <div className="analytics-view-container" style={{ padding: '24px' }}>
      
      {/* Encabezado plano */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #222', paddingBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Vortex Analytics
        </h2>
        <p style={{ color: '#888', fontSize: '13px', margin: '4px 0 0 0' }}>
          Auditoría financiera en tiempo real del Cerebro IA y control de bankroll.
        </p>
      </div>

      {/* Selectores internos */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', borderBottom: '1px solid #1c1c1e', paddingBottom: '12px' }}>
        <span 
          onClick={() => setActiveSubTab('vortex')} 
          style={{ cursor: 'pointer', color: activeSubTab === 'vortex' ? '#ffcc00' : '#666', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}
        >
          🔮 Vortex Tracker
        </span>
        <span 
          onClick={() => setActiveSubTab('leaderboard')} 
          style={{ cursor: 'pointer', color: activeSubTab === 'leaderboard' ? '#ffcc00' : '#666', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}
        >
          🎯 Tipsters Oficiales
        </span>
      </div>

      {loading ? (
        <p style={{ color: '#666' }}>Calculando métricas...</p>
      ) : (
        <div>
          {activeSubTab === 'vortex' && vortexData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div style={{ background: '#111', padding: '24px', borderRadius: '12px', border: '1px solid #222' }}>
                  <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 'bold', tracking: '1px' }}>EFECTIVIDAD 30D</span>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#34d399', margin: '8px 0' }}>{vortexData.winRate}%</div>
                </div>
                <div style={{ background: '#111', padding: '24px', borderRadius: '12px', border: '1px solid #222' }}>
                  <span style={{ fontSize: '11px', color: '#ffcc00', fontWeight: 'bold', tracking: '1px' }}>COBROS EXITOSOS</span>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ffcc00', margin: '8px 0' }}>{vortexData.aciertos}</div>
                </div>
              </div>

              <div style={{ background: '#111', padding: '24px', borderRadius: '12px', border: '1px solid #222' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', textTransform: 'uppercase', color: '#ccc' }}>Historial de Operaciones</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {vortexData.roiProgress.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#0a0a0a', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
                      <span style={{ fontSize: '13px' }}>{item.partido}</span>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#34d399' }}>{item.resultado}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'leaderboard' && (
            <div style={{ background: '#111', padding: '24px', borderRadius: '12px', border: '1px solid #222' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase', borderBottom: '1px solid #222' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Pronosticador</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Yield</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #1a1a1a', fontSize: '13px' }}>
                      <td style={{ padding: '10px' }}>{t.nombre} <span style={{ fontSize: '10px', background: '#222', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', color: '#888' }}>{t.rango}</span></td>
                      <td style={{ padding: '10px', color: '#34d399', fontWeight: 'bold' }}>{t.yield}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
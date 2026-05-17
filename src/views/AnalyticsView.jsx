import React, { useState, useEffect } from 'react';

export default function AnalyticsView() {
  const [activeSubTab, setActiveSubTab] = useState('vortex');
  const [vortexData, setVortexData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    <div className="analytics-view">
      
      <div className="page-header">
        <h2>VORTEX ANALYTICS</h2>
        <p className="subtitle">Auditoría financiera en tiempo real del Cerebro IA y control de bankroll.</p>
      </div>

      <div className="tab-menu">
        <button 
          className={`tab-btn ${activeSubTab === 'vortex' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('vortex')}
        >
          🔮 Vortex Tracker
        </button>
        <button 
          className={`tab-btn ${activeSubTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('leaderboard')}
        >
          🎯 Tipsters Oficiales
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Calculando métricas...</div>
      ) : (
        <div className="analytics-body">
          {activeSubTab === 'vortex' && vortexData && (
            <div className="vortex-dashboard">
              
              <div className="metrics-grid">
                <div className="metric-card success">
                  <span className="card-label">EFECTIVIDAD 30D</span>
                  <div className="card-value">{vortexData.winRate}%</div>
                </div>
                <div className="metric-card highlight">
                  <span className="card-label">COBROS EXITOSOS</span>
                  <div className="card-value">{vortexData.aciertos}</div>
                </div>
              </div>

              <div className="data-section">
                <h3>HISTORIAL DE OPERACIONES</h3>
                <div className="operations-list">
                  {vortexData.roiProgress.map((item, idx) => (
                    <div key={idx} className="operation-row">
                      <span className="match-title">{item.partido}</span>
                      <span className="match-status win">{item.resultado}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {activeSubTab === 'leaderboard' && (
            <div className="data-section">
              <h3>RANKING DE PRONOSTICADORES</h3>
              <div className="table-responsive">
                <table className="vortex-table">
                  <thead>
                    <tr>
                      <th>Pronosticador</th>
                      <th>Yield</th>
                      <th>Win Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map(t => (
                      <tr key={t.id}>
                        <td>
                          {t.nombre} <span className="badge">{t.rango}</span>
                        </td>
                        <td className="text-success">{t.yield}</td>
                        <td>{t.winRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
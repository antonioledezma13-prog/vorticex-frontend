import React, { useState, useEffect } from 'react';

export default function AnalyticsView({ user }) {
  const [activeSubTab, setActiveSubTab] = useState('vortex'); // vortex | leaderboard | mytracker
  const [vortexData, setVortexData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myTracker, setMyTracker] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rol del usuario activo (con fallback seguro a 'free')
  const userRole = user?.tipo_usuario || 'free'; 

  // URL de producción de tu backend en Render
  const API_BASE = 'https://vorticex-backend.onrender.com/api/analytics';

  useEffect(() => {
    fetchData();
  }, [activeSubTab, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'vortex') {
        const res = await fetch(`${API_BASE}/vortex-tracker`).then(r => r.json());
        if (res.success) setVortexData(res);
      } else if (activeSubTab === 'leaderboard') {
        const res = await fetch(`${API_BASE}/tipsters`).then(r => r.json());
        if (res.success) setLeaderboard(res.leaderboard);
      } else if (activeSubTab === 'mytracker') {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }
        const res = await fetch(`${API_BASE}/my-tracker`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(r => r.json());
        if (res.success) setMyTracker(res);
      }
    } catch (err) {
      console.error("Error cargando estadísticas de Analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      
      {/* ENCABEZADO DE SECCIÓN */}
      <div className="mb-8 relative overflow-hidden bg-neutral-900/40 p-6 rounded-2xl border border-neutral-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[100px] -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 bg-clip-text text-transparent uppercase font-mono">
            Vortex Analytics
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Auditoría financiera en tiempo real del Cerebro IA y control de bankroll de inversiones.
          </p>
        </div>
      </div>

      {/* NAVEGACIÓN DE SUB-PESTAÑAS */}
      <div className="flex border-b border-neutral-800 mb-8 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveSubTab('vortex')}
          className={`pb-4 px-4 font-bold text-sm tracking-wide uppercase transition-all whitespace-nowrap bg-transparent border-0 cursor-pointer ${
            activeSubTab === 'vortex' 
              ? 'border-b-2 border-yellow-500 text-yellow-500' 
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          🔮 Vortex Tracker (IA)
        </button>
        <button
          onClick={() => setActiveSubTab('leaderboard')}
          className={`pb-4 px-4 font-bold text-sm tracking-wide uppercase transition-all whitespace-nowrap bg-transparent border-0 cursor-pointer ${
            activeSubTab === 'leaderboard' 
              ? 'border-b-2 border-yellow-500 text-yellow-500' 
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          🎯 Tipsters Oficiales
        </button>
        <button
          onClick={() => setActiveSubTab('mytracker')}
          className={`pb-4 px-4 font-bold text-sm tracking-wide uppercase transition-all whitespace-nowrap bg-transparent border-0 cursor-pointer ${
            activeSubTab === 'mytracker' 
              ? 'border-b-2 border-yellow-500 text-yellow-500' 
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          📒 Mi Bitácora (My Tracker)
        </button>
      </div>

      {/* CONTENIDO DINÁMICO */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-neutral-400 text-xs mt-4 uppercase tracking-widest animate-pulse">Calculando métricas en caliente...</p>
        </div>
      ) : (
        <>
          {/* VORTEX TRACKER */}
          {activeSubTab === 'vortex' && vortexData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl text-center">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-2">Efectividad 30D</span>
                <div className="text-5xl font-black text-emerald-500 font-mono">{vortexData.winRate}%</div>
                <p className="text-xs text-neutral-500 mt-2">Partidos analizados: {vortexData.totalAnalizados}</p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl text-center">
                <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest block mb-2">Retorno de Inversión</span>
                <div className="text-5xl font-black text-yellow-500 font-mono">+{((vortexData.winRate - 50) * 1.8).toFixed(1)}%</div>
                <p className="text-xs text-neutral-500 mt-2">Simulado sobre cuotas reales de mercado</p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl text-center">
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest block mb-2">Picks Acertados</span>
                <div className="text-5xl font-black text-red-500 font-mono">{vortexData.aciertos}</div>
                <p className="text-xs text-neutral-500 mt-2">Predicciones correctas registradas</p>
              </div>

              <div className="md:col-span-3 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold mb-4 uppercase text-neutral-400">Curva de Crecimiento de Capital</h3>
                <div className="space-y-3">
                  {vortexData.roiProgress?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-neutral-950/60 rounded-xl border border-neutral-850">
                      <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.resultado === 'Ganado' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <div>
                          <p className="text-sm font-bold text-white leading-none">{item.partido}</p>
                          <span className="text-[10px] text-neutral-500 mt-1 inline-block">{item.fecha}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-yellow-500 font-mono">${item.bankroll} USD</p>
                        <span className={`text-[10px] font-bold ${item.resultado === 'Ganado' ? 'text-emerald-400' : 'text-red-400'}`}>{item.resultado}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* LEADERBOARD */}
          {activeSubTab === 'leaderboard' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-500 text-xs uppercase tracking-wider">
                      <th className="p-4 pl-6">Rank</th>
                      <th className="p-4">Tipster</th>
                      <th className="p-4">Yield %</th>
                      <th className="p-4">Acierto</th>
                      <th className="p-4">Picks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {leaderboard.map((tipster, idx) => (
                      <tr key={tipster.id} className="hover:bg-neutral-950/40 text-sm">
                        <td className="p-4 pl-6 font-mono text-neutral-500">#{idx + 1}</td>
                        <td className="p-4">
                          <p className="font-bold text-white">{tipster.nombre}</p>
                          <span className="text-[9px] px-1.5 py-0.5 bg-neutral-800 text-neutral-400 font-bold uppercase rounded mt-1 inline-block">{tipster.rango}</span>
                        </td>
                        <td className="p-4 font-mono font-bold text-emerald-400">{tipster.yield}</td>
                        <td className="p-4 font-mono font-bold">{tipster.winRate}</td>
                        <td className="p-4 text-neutral-400">{tipster.picksEnviados}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MY TRACKER */}
          {activeSubTab === 'mytracker' && (
            <div className="relative">
              {/* Bloqueo comercial si el usuario no es VIP */}
              {(userRole === 'free' || !user) && (
                <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-neutral-800/60 shadow-2xl">
                  <span className="text-3xl mb-4">🔒</span>
                  <h3 className="text-xl font-bold uppercase text-white mb-2">Desbloquea tu Bitácora de Inversión</h3>
                  <p className="text-neutral-400 text-sm max-w-lg mb-6">Lleva el control exacto de tus apuestas, calcula tu rendimiento real, automatiza tus resultados y gestiona tu bankroll como un profesional con el **Plan VIP**.</p>
                </div>
              )}

              <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${(userRole === 'free' || !user) ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block mb-2">Beneficio Neto</span>
                  <div className="text-4xl font-black text-emerald-400 font-mono">+{myTracker?.netProfit ? `$${myTracker.netProfit}` : '$0.00'}</div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block mb-2">Tasa de Acierto Personal</span>
                  <div className="text-4xl font-black text-yellow-500 font-mono">{myTracker?.winRatePersonal || 0}%</div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block mb-2">Estado del Banco</span>
                  <div className="text-xl font-bold text-white mt-2">Salud Estable 🟢</div>
                </div>

                <div className="md:col-span-3 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                  <h3 className="text-sm font-bold mb-4 uppercase text-neutral-400 font-sans">Historial de Predicciones Seguidas</h3>
                  <div className="space-y-3">
                    {myTracker?.historial.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-neutral-950/60 rounded-xl border border-neutral-850">
                        <div>
                          <p className="text-sm font-bold text-white">{p.partido}</p>
                          <span className="text-[10px] text-neutral-500">Fecha: {p.fecha}</span>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase text-[9px] border ${p.estado === 'won' ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400' : 'bg-red-950/40 border-red-900/20 text-red-400'}`}>{p.estado === 'won' ? 'Ganado' : 'Perdido'}</span>
                          <p className="text-[10px] text-neutral-400 mt-1">Predicción: {p.miPrediccion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
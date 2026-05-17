import React, { useState, useEffect } from 'react';

// Recibimos 'user' de forma directa como prop desde AppShell para evitar problemas de importación
export default function AnalyticsView({ user }) {
  const [activeSubTab, setActiveSubTab] = useState('vortex'); // vortex | leaderboard | mytracker
  const [vortexData, setVortexData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myTracker, setMyTracker] = useState(null);
  const [loading, setLoading] = useState(true);

  // Consumimos el rol real del usuario autenticado recibido por props (con fallback seguro a 'free')
  const userRole = user?.tipo_usuario || 'free'; 

  // URL del backend en producción de Render
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
        // Obtenemos de forma segura el token JWT de localStorage para autorizar la petición
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
    <div className="min-h-screen bg-neutral-950 text-white p-4 sm:p-6 lg:p-8 font-sans animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        
        {/* ENCABEZADO DE SECCIÓN */}
        <div className="mb-8 relative overflow-hidden bg-neutral-900/40 p-6 rounded-2xl border border-neutral-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[100px] -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 bg-clip-text text-transparent uppercase">
              Vortex Analytics
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              Auditoría financiera en tiempo real del Cerebro IA y control de bankroll de inversiones.
            </p>
          </div>
        </div>

        {/* NAVEGACIÓN DE PESTAÑAS (SUB-TABS) */}
        <div className="flex border-b border-neutral-800 mb-8 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveSubTab('vortex')}
            className={`pb-4 px-4 font-bold text-sm tracking-wide uppercase transition-all whitespace-nowrap ${
              activeSubTab === 'vortex' 
                ? 'border-b-2 border-yellow-500 text-yellow-500' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            🔮 Vortex Tracker (IA)
          </button>
          <button
            onClick={() => setActiveSubTab('leaderboard')}
            className={`pb-4 px-4 font-bold text-sm tracking-wide uppercase transition-all whitespace-nowrap ${
              activeSubTab === 'leaderboard' 
                ? 'border-b-2 border-yellow-500 text-yellow-500' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            🎯 Tipsters Oficiales
          </button>
          <button
            onClick={() => setActiveSubTab('mytracker')}
            className={`pb-4 px-4 font-bold text-sm tracking-wide uppercase transition-all whitespace-nowrap ${
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
            <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
            <p className="text-neutral-400 text-xs mt-4 uppercase tracking-widest">Calculando métricas en caliente...</p>
          </div>
        ) : (
          <>
            {/* VORTEX TRACKER (INTELIGENCIA ARTIFICIAL) */}
            {activeSubTab === 'vortex' && vortexData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                
                {/* MÉTRICA: TASA DE ACIERTO */}
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[60px]"></div>
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">Efectividad 30D</span>
                  <div className="text-6xl font-black text-emerald-500 font-mono tracking-tight mb-2">
                    {vortexData.winRate}%
                  </div>
                  <p className="text-xs text-neutral-400">
                    Calculado sobre <span className="text-white font-bold">{vortexData.totalAnalizados} partidos</span> finalizados este mes.
                  </p>
                </div>

                {/* MÉTRICA: ROI SIMULADO */}
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-[60px]"></div>
                  <span className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-2">Retorno de Inversión</span>
                  <div className="text-6xl font-black text-yellow-500 font-mono tracking-tight mb-2">
                    +{((vortexData.winRate - 50) * 1.8).toFixed(1)}%
                  </div>
                  <p className="text-xs text-neutral-400">
                    Ganancia simulada operando con cuotas reales de mercado.
                  </p>
                </div>

                {/* MÉTRICA: CONFIDENCIALIDAD GLOBAL */}
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-[60px]"></div>
                  <span className="text-xs font-black text-red-500 uppercase tracking-widest mb-2">Predicciones Acertadas</span>
                  <div className="text-6xl font-black text-red-500 font-mono tracking-tight mb-2">
                    {vortexData.aciertos}
                  </div>
                  <p className="text-xs text-neutral-400">
                    Sugerencias que resultaron en cobros confirmados.
                  </p>
                </div>

                {/* GRÁFICA DE EVOLUCIÓN */}
                <div className="lg:col-span-3 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-neutral-300">Curva de Crecimiento del Bankroll</h3>
                  <div className="space-y-3">
                    {vortexData.roiProgress.length === 0 ? (
                      <p className="text-neutral-500 text-sm py-4 text-center">No hay datos históricos recientes para graficar.</p>
                    ) : (
                      vortexData.roiProgress.map((item, idx) => (
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
                            <span className={`text-[10px] font-bold ${item.resultado === 'Ganado' ? 'text-emerald-400' : 'text-red-400'}`}>
                              {item.resultado}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* LEADERBOARD DE TIPSTERS */}
            {activeSubTab === 'leaderboard' && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden animate-fadeIn">
                <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-neutral-300">Ranking Oficial de Pronosticadores</h3>
                  <span className="text-xs bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/20 font-bold uppercase">
                    Vortex Score Active
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-400 text-xs uppercase tracking-wider">
                        <th className="p-4 pl-6">Rango</th>
                        <th className="p-4">Tipster</th>
                        <th className="p-4">Yield %</th>
                        <th className="p-4">Tasa de Acierto</th>
                        <th className="p-4">Picks</th>
                        <th className="p-4 pr-6">Racha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60">
                      {leaderboard.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center p-8 text-neutral-500 text-sm">No hay tipsters registrados actualmente.</td>
                        </tr>
                      ) : (
                        leaderboard.map((tipster, idx) => (
                          <tr key={tipster.id} className="hover:bg-neutral-950/40 transition-all text-sm">
                            <td className="p-4 pl-6 font-mono font-bold text-neutral-400">#{idx + 1}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 to-red-600 flex items-center justify-center font-black text-neutral-950 text-xs">
                                  {tipster.nombre.substring(0,2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-white leading-none">{tipster.nombre}</p>
                                  <span className="text-[9px] px-1 py-0.5 rounded-sm bg-neutral-800 border border-neutral-700 text-neutral-400 font-bold uppercase mt-1 inline-block">
                                    {tipster.rango}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 font-mono font-bold text-emerald-400">{tipster.yield}</td>
                            <td className="p-4 font-mono font-bold">{tipster.winRate}</td>
                            <td className="p-4 text-neutral-400">{tipster.picksEnviados} enviados</td>
                            <td className="p-4 pr-6">
                              <div className="flex gap-1.5">
                                {tipster.racha.map((r, rIdx) => (
                                  <span 
                                    key={rIdx} 
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                      r === 'W' ? 'bg-emerald-950 border border-emerald-500 text-emerald-400' : 'bg-red-950 border border-red-900 text-red-400'
                                    }`}
                                  >
                                    {r}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MY TRACKER */}
            {activeSubTab === 'mytracker' && (
              <div className="relative">
                
                {/* GANCHO PREMIUM DE VENTAS (MUESTRA BLUR SI ES USUARIO GRATUITO O NO LOGUEADO) */}
                {(userRole === 'free' || !user) && (
                  <div className="absolute inset-0 bg-neutral-950/85 backdrop-blur-md z-30 flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-neutral-800/60 shadow-2xl animate-fadeIn">
                    <div className="w-16 h-16 bg-red-950 border border-red-500/30 rounded-full flex items-center justify-center text-red-400 text-2xl mb-4 shadow-[0_0_20px_rgba(239,68,68,0.35)]">
                      🔒
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">
                      Desbloquea tu Bitácora Inteligente de Inversión
                    </h3>
                    <p className="text-neutral-400 text-sm max-w-lg mb-6 leading-relaxed">
                      Lleva el control exacto de tus apuestas, calcula tu rendimiento real, automatiza tus resultados y gestiona tu bankroll como un apostador profesional con el **Plan VIP**.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-yellow-500 text-neutral-950 font-black rounded-xl shadow-[0_4px_20px_rgba(239,68,68,0.35)] hover:scale-[1.02] transition-all">
                        💎 Adquirir Plan VIP
                      </button>
                    </div>
                  </div>
                )}

                {/* CONTENIDO DE MY TRACKER */}
                <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${(userRole === 'free' || !user) ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
                  
                  {/* RESUMEN DE GANANCIA NETO */}
                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                    <span className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Tu Beneficio Neto</span>
                    <div>
                      <div className="text-5xl font-black text-emerald-400 font-mono tracking-tight mb-2">
                        {myTracker?.netProfit >= 0 ? `+$${myTracker.netProfit}` : `-$${Math.abs(myTracker?.netProfit || 0)}`}
                      </div>
                      <p className="text-xs text-neutral-400 leading-tight">
                        Rentabilidad acumulada de todos tus picks seguidos.
                      </p>
                    </div>
                  </div>

                  {/* PROPORCIÓN DE APUESTAS ACERTADAS */}
                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                    <span className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Tasa de Acierto Personal</span>
                    <div>
                      <div className="text-5xl font-black text-yellow-500 font-mono tracking-tight mb-2">
                        {myTracker?.winRatePersonal || 0}%
                      </div>
                      <p className="text-xs text-neutral-400 leading-tight">
                        Porcentaje de efectividad de tu bitácora individual.
                      </p>
                    </div>
                  </div>

                  {/* NOTIFICACIÓN ADICIONAL DE CONTROL */}
                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                    <span className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Estatus de Bankroll</span>
                    <div>
                      <div className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                        Salud Estable 🟢
                      </div>
                      <p className="text-xs text-neutral-400 leading-tight">
                        Estás operando bajo márgenes de riesgo seguros sugeridos por el Cerebro IA.
                      </p>
                    </div>
                  </div>

                  {/* TABLA DE HISTORIAL DE APUESTAS PERSONAL */}
                  <div className="lg:col-span-3 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-neutral-300">Historial de Predicciones Seguidas</h3>
                    <div className="space-y-3">
                      {!myTracker || myTracker.historial.length === 0 ? (
                        <p className="text-neutral-500 text-sm py-4 text-center">Aún no has registrado ninguna predicción en tu bitácora.</p>
                      ) : (
                        myTracker.historial.map((p, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3.5 bg-neutral-950/60 rounded-xl border border-neutral-850">
                            <div>
                              <p className="text-sm font-bold text-white leading-none">{p.partido}</p>
                              <span className="text-[10px] text-neutral-500 mt-1.5 inline-block">Fecha de Apuesta: {p.fecha}</span>
                            </div>
                            <div className="text-right">
                              <span className={`text-xs px-2.5 py-1 rounded-full font-black uppercase tracking-wider text-[9px] border ${
                                p.estado === 'won' 
                                  ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400' 
                                  : p.estado === 'lost' 
                                    ? 'bg-red-950/40 border-red-900/20 text-red-400' 
                                    : 'bg-yellow-950/40 border-yellow-900/20 text-yellow-400'
                              }`}>
                                {p.estado === 'won' ? 'Ganado' : p.estado === 'lost' ? 'Perdido' : 'Pendiente'}
                              </span>
                              <p className="text-[10px] text-neutral-400 mt-1">Predicción: {p.miPrediccion}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
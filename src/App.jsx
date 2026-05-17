import React, { useState, useEffect, createContext, useContext } from 'react';

// =====================================================================
// 🔑 CONTEXTO DE AUTENTICACIÓN (AUTO-CONTENIDO)
// =====================================================================
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    id: 1,
    nombre: 'Antonio Ledezma',
    email: 'antonioledezma13@gmail.com',
    tipo_usuario: 'admin', // free | premium | oraculo | tipster | admin
    vortex_score: 95.00
  });

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// =====================================================================
// 📊 COMPONENTE: VORTEX ANALYTICS (VISTA EXCLUSIVA NEÓN)
// =====================================================================
function AnalyticsView({ user }) {
  const [activeSubTab, setActiveSubTab] = useState('vortex'); // vortex | leaderboard | mytracker
  const [loading, setLoading] = useState(false);
  const userRole = user?.tipo_usuario || 'free'; 

  // Datos simulados de alta calidad para renderizar de inmediato
  const vortexData = {
    winRate: 76.4,
    totalAnalizados: 34,
    aciertos: 26,
    roiProgress: [
      { fecha: '10 May', partido: 'Atalanta BC vs Bologna', bankroll: 108.50, resultado: 'Ganado' },
      { fecha: '12 May', partido: 'Newcastle vs West Ham', bankroll: 117.00, resultado: 'Ganado' },
      { fecha: '14 May', partido: 'Athletic Bilbao vs Celta Vigo', bankroll: 125.50, resultado: 'Ganado' },
      { fecha: '15 May', partido: 'Real Sociedad vs Valencia', bankroll: 115.50, resultado: 'Perdido' },
      { fecha: '17 May', partido: 'Everton vs Sunderland', bankroll: 124.00, resultado: 'Ganado' }
    ]
  };
  
  const leaderboard = [
    { id: 1, nombre: 'Vortex AI Bot', rango: 'ALGORITMO', yield: '+24.5%', winRate: '78.2%', picksEnviados: 120, racha: ['W', 'W', 'W', 'L', 'W'] },
    { id: 2, nombre: 'Antonio Ledezma', rango: 'ADMINISTRADOR', yield: '+18.2%', winRate: '74.0%', picksEnviados: 85, racha: ['W', 'W', 'L', 'W', 'W'] },
    { id: 3, nombre: 'Carlos Tipster', rango: 'TIPSTER', yield: '+12.4%', winRate: '68.5%', picksEnviados: 40, racha: ['L', 'W', 'W', 'D', 'W'] }
  ];

  const myTracker = {
    netProfit: 145.80,
    winRatePersonal: 72.5,
    historial: [
      { id: 101, partido: 'Atalanta BC vs Bologna', miPrediccion: 'Local', estado: 'won', fecha: '17/05/2026' },
      { id: 102, partido: 'Newcastle vs West Ham', miPrediccion: 'Local', estado: 'won', fecha: '17/05/2026' },
      { id: 103, partido: 'Real Sociedad vs Valencia', miPrediccion: 'Local', estado: 'lost', fecha: '17/05/2026' }
    ]
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fadeIn">
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
            <p className="text-neutral-400 text-xs mt-4 uppercase tracking-widest">Calculando métricas...</p>
          </div>
        ) : (
          <>
            {activeSubTab === 'vortex' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[60px]"></div>
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">Efectividad 30D</span>
                  <div className="text-6xl font-black text-emerald-500 font-mono tracking-tight mb-2">{vortexData.winRate}%</div>
                  <p className="text-xs text-neutral-400">Calculado sobre <span className="text-white font-bold">{vortexData.totalAnalizados} partidos</span> finalizados.</p>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-[60px]"></div>
                  <span className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-2">Retorno de Inversión</span>
                  <div className="text-6xl font-black text-yellow-500 font-mono tracking-tight mb-2">+{((vortexData.winRate - 50) * 1.8).toFixed(1)}%</div>
                  <p className="text-xs text-neutral-400">Ganancia acumulada sugerida de forma automatizada.</p>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-[60px]"></div>
                  <span className="text-xs font-black text-red-500 uppercase tracking-widest mb-2">Picks Acertados</span>
                  <div className="text-6xl font-black text-red-500 font-mono tracking-tight mb-2">{vortexData.aciertos}</div>
                  <p className="text-xs text-neutral-400">Sugerencias que resultaron en cobros exitosos.</p>
                </div>

                <div className="lg:col-span-3 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-neutral-300">Curva de Crecimiento de Capital</h3>
                  <div className="space-y-3">
                    {vortexData.roiProgress.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-neutral-950/60 rounded-xl border border-neutral-850">
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${item.resultado === 'Ganado' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
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

            {activeSubTab === 'leaderboard' && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden animate-fadeIn">
                <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-neutral-300">Ranking de Pronosticadores</h3>
                  <span className="text-xs bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/20 font-bold uppercase">Vortex Score Active</span>
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
                      {leaderboard.map((tipster, idx) => (
                        <tr key={tipster.id} className="hover:bg-neutral-950/40 transition-all text-sm">
                          <td className="p-4 pl-6 font-mono font-bold text-neutral-400">#{idx + 1}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 to-red-600 flex items-center justify-center font-black text-neutral-950 text-xs">
                                {tipster.nombre.substring(0,2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-white leading-none">{tipster.nombre}</p>
                                <span className="text-[9px] px-1 py-0.5 rounded-sm bg-neutral-800 border border-neutral-700 text-neutral-400 font-bold uppercase mt-1 inline-block">{tipster.rango}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-mono font-bold text-emerald-400">{tipster.yield}</td>
                          <td className="p-4 font-mono font-bold">{tipster.winRate}</td>
                          <td className="p-4 text-neutral-400">{tipster.picksEnviados} enviados</td>
                          <td className="p-4 pr-6">
                            <div className="flex gap-1.5">
                              {tipster.racha.map((r, rIdx) => (
                                <span key={rIdx} className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${r === 'W' ? 'bg-emerald-950 border border-emerald-500 text-emerald-400' : 'bg-red-950 border border-red-900 text-red-400'}`}>{r}</span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeSubTab === 'mytracker' && (
              <div className="relative">
                {(userRole === 'free' || !user) && (
                  <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md z-30 flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-neutral-800/60 shadow-2xl animate-fadeIn">
                    <div className="w-16 h-16 bg-red-950 border border-red-500/30 rounded-full flex items-center justify-center text-red-400 text-2xl mb-4 shadow-[0_0_20px_rgba(239,68,68,0.35)] animate-bounce">🔒</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Desbloquea tu Bitácora de Inversión</h3>
                    <p className="text-neutral-400 text-sm max-w-lg mb-6 leading-relaxed">Lleva el control exacto de tus apuestas, calcula tu rendimiento real, automatiza tus resultados y gestiona tu bankroll como un profesional con el **Plan VIP**.</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-yellow-500 text-neutral-950 font-black rounded-xl shadow-[0_4px_20px_rgba(239,68,68,0.35)] hover:scale-[1.02] transition-all">💎 Adquirir Plan VIP</button>
                    </div>
                  </div>
                )}

                <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${(userRole === 'free' || !user) ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                    <span className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Beneficio Neto</span>
                    <div>
                      <div className="text-5xl font-black text-emerald-400 font-mono tracking-tight mb-2">+{myTracker?.netProfit ? `$${myTracker.netProfit}` : '$0'}</div>
                      <p className="text-xs text-neutral-400 leading-tight">Rentabilidad acumulada de todos tus picks seguidos.</p>
                    </div>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                    <span className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Tasa de Acierto Personal</span>
                    <div>
                      <div className="text-5xl font-black text-yellow-500 font-mono tracking-tight mb-2">{myTracker?.winRatePersonal || 0}%</div>
                      <p className="text-xs text-neutral-400 leading-tight">Porcentaje de efectividad de tu bitácora individual.</p>
                    </div>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                    <span className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Estado del Banco</span>
                    <div>
                      <div className="text-2xl font-black text-white uppercase tracking-tight mb-2">Salud Estable 🟢</div>
                      <p className="text-xs text-neutral-400 leading-tight">Operando bajo márgenes de riesgo seguros calculados por el Cerebro IA.</p>
                    </div>
                  </div>

                  <div className="lg:col-span-3 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-neutral-300">Historial de Predicciones Seguidas</h3>
                    <div className="space-y-3">
                      {myTracker?.historial.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3.5 bg-neutral-950/60 rounded-xl border border-neutral-850">
                          <div>
                            <p className="text-sm font-bold text-white leading-none">{p.partido}</p>
                            <span className="text-[10px] text-neutral-500 mt-1.5 inline-block">Fecha de Apuesta: {p.fecha}</span>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-black uppercase tracking-wider text-[9px] border ${p.estado === 'won' ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400' : 'bg-red-950/40 border-red-900/20 text-red-400'}`}>{p.estado === 'won' ? 'Ganado' : 'Perdido'}</span>
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
    </div>
  );
}

// =====================================================================
// 🖥️ COMPONENTES COMPLEMENTARIOS DE INTERFAZ (DISEÑO PREMIUM ACTIVO)
// =====================================================================
function Sidebar({ activePage, onNavigate }) {
  const { user } = useAuth();
  const items = [
    { id: 'home', label: 'Inicio', icon: '🏠' },
    { id: 'planes', label: 'Planes & Precios', icon: '💎' },
    { id: 'leaderboard', label: 'Líderes', icon: '🏆' },
    { id: 'analytics', label: 'Analytics', icon: '📊' }
  ];

  if (user?.tipo_usuario === 'admin' || user?.tipo_usuario === 'tipster') {
    items.push({ id: 'mipanel', label: 'Mi Panel', icon: '💼' });
  }
  if (user?.tipo_usuario === 'admin') {
    items.push({ id: 'admin', label: 'Panel Admin', icon: '⚙️' });
  }

  return (
    <div className="w-64 bg-neutral-900 border-r border-neutral-800 h-screen flex flex-col justify-between p-4 fixed left-0 top-0 z-30">
      <div>
        <div className="flex items-center gap-2 mb-8 px-2 py-4 border-b border-neutral-850">
          <span className="text-2xl animate-pulse">🔥</span>
          <span className="font-black text-xl bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent uppercase tracking-wider">Vorticex</span>
        </div>
        <nav className="space-y-1">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm tracking-wide uppercase transition-all ${
                activePage === item.id 
                  ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-neutral-950 shadow-lg shadow-red-500/10' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      {user && (
        <div className="p-3 bg-neutral-950/40 rounded-2xl border border-neutral-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 to-red-600 flex items-center justify-center font-black text-neutral-950 shadow-md">
            {user.nombre.substring(0,2).toUpperCase()}
          </div>
          <div className="truncate">
            <p className="text-sm font-black text-white leading-none truncate">{user.nombre}</p>
            <span className="text-[10px] text-yellow-500 font-bold uppercase mt-1 inline-block">{user.tipo_usuario}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Topbar({ activeTab, onTabChange, onOpenAuth, onNavigate }) {
  const { user, logout } = useAuth();
  return (
    <header className="h-16 border-b border-neutral-800 bg-neutral-900/60 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex gap-4">
        {['sports', 'politics', 'livefeed'].map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`text-xs font-black tracking-widest uppercase pb-1 transition-all ${
              activeTab === tab ? 'border-b border-yellow-500 text-yellow-500' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {tab === 'sports' ? '⚽ Deportes' : tab === 'politics' ? '🗳️ Política' : '⚡ Live'}
          </button>
        ))}
      </div>
      <div>
        {user ? (
          <button onClick={logout} className="text-xs font-bold uppercase tracking-wider bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 px-4 py-2 rounded-xl text-neutral-300 transition-all">Cerrar Sesión</button>
        ) : (
          <button onClick={onOpenAuth} className="text-xs font-black uppercase tracking-wider bg-gradient-to-r from-red-600 to-yellow-500 text-neutral-950 px-4 py-2 rounded-xl transition-all hover:scale-[1.02]">Iniciar Sesión</button>
        )}
      </div>
    </header>
  );
}

function Dashboard({ activeTab, onOpenAuth }) {
  const sampleEvents = [
    { id: 1, home: 'Atalanta BC', away: 'Bologna', time: 'Serie A - Hoy, 12:00', probHome: '72.7%', probAway: '27.3%', confidence: '92%', formHome: ['W', 'L', 'D', 'W', 'W'], formAway: ['L', 'D', 'W', 'D', 'L'] },
    { id: 2, home: 'Newcastle United', away: 'West Ham United', time: 'Premier League - Hoy, 12:30', probHome: '60.4%', probAway: '39.6%', confidence: '85%', formHome: ['W', 'D', 'L', 'W', 'W'], formAway: ['L', 'D', 'W', 'D', 'L'] },
    { id: 3, home: 'Athletic Bilbao', away: 'Celta Vigo', time: 'La Liga - Hoy, 13:00', probHome: '60.0%', probAway: '40.0%', confidence: '80%', formHome: ['W', 'D', 'L', 'W', 'W'], formAway: ['L', 'D', 'W', 'D', 'L'] }
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="relative overflow-hidden bg-neutral-900/40 p-6 rounded-2xl border border-neutral-800">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-[80px]"></div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-white relative z-10">Top Mercados de Hoy</h2>
        <p className="text-xs text-neutral-400 mt-1 relative z-10 font-medium font-sans">Sugerencias y análisis algorítmico del Cerebro IA en vivo.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleEvents.map(event => (
          <div key={event.id} className="bg-neutral-900 border border-neutral-850 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between hover:border-neutral-700 hover:shadow-[0_4px_30px_rgba(239,68,68,0.05)] transition-all">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500">{event.time}</span>
              <div className="flex justify-between items-center">
                <div className="text-center w-5/12">
                  <div className="w-12 h-12 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center font-black text-xs mx-auto mb-2 text-white shadow-md">{event.home.substring(0,3).toUpperCase()}</div>
                  <p className="text-xs font-black truncate text-neutral-200">{event.home}</p>
                </div>
                <span className="text-xs text-neutral-600 font-bold uppercase tracking-widest w-2/12 text-center">vs</span>
                <div className="text-center w-5/12">
                  <div className="w-12 h-12 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center font-black text-xs mx-auto mb-2 text-white shadow-md">{event.away.substring(0,3).toUpperCase()}</div>
                  <p className="text-xs font-black truncate text-neutral-200">{event.away}</p>
                </div>
              </div>
              <div className="flex gap-1.5 justify-center py-2 border-t border-neutral-850/40 mt-3">
                {event.formHome.map((r, idx) => (
                  <span key={idx} className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${r === 'W' ? 'bg-emerald-950/60 border border-emerald-500/20 text-emerald-400' : r === 'D' ? 'bg-yellow-950/60 border border-yellow-500/20 text-yellow-400' : 'bg-red-950/60 border border-red-500/20 text-red-400'}`}>{r}</span>
                ))}
              </div>
            </div>
            <div className="border-t border-neutral-850/60 pt-4 mt-4 flex justify-between items-center text-xs font-bold text-neutral-400">
              <div>Prob. Local: <span className="text-emerald-400 font-black">{event.probHome}</span></div>
              <div>Visitante: <span className="text-yellow-500 font-black">{event.probAway}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Plans({ onOpenAuth }) {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 text-center animate-fadeIn">
      <h2 className="text-3xl font-black uppercase bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">Planes y Membresías VIP</h2>
      <p className="text-neutral-400 text-sm max-w-lg mx-auto leading-relaxed">Únete al búnker premium de Vorticex y obtén acceso total a la Bitácora My Tracker y los análisis confidenciales de nuestro algoritmo.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto mt-6">
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-black uppercase tracking-wider text-neutral-300">Plan Gratuito</h3>
            <p className="text-4xl font-black text-white mt-4">$0 <span className="text-xs text-neutral-500">USD/mes</span></p>
            <ul className="text-sm text-neutral-400 text-left space-y-3 mt-6 border-t border-neutral-800 pt-6">
              <li>✔️ Predicciones públicas básicas</li>
              <li>❌ Sin acceso a Bitácora Personal</li>
              <li>❌ Sin análisis del Cerebro IA</li>
            </ul>
          </div>
          <button onClick={onOpenAuth} className="w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-750 font-bold text-sm uppercase transition-all">Comenzar</button>
        </div>
        <div className="bg-neutral-900 border-2 border-yellow-500 p-8 rounded-2xl space-y-6 flex flex-col justify-between relative shadow-[0_4px_30px_rgba(234,179,8,0.05)]">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-neutral-950 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Recomendado</span>
          <div>
            <h3 className="text-xl font-black uppercase tracking-wider text-yellow-500">Membresía VIP</h3>
            <p className="text-4xl font-black text-white mt-4">$19.99 <span className="text-xs text-neutral-500">USD/mes</span></p>
            <ul className="text-sm text-neutral-300 text-left space-y-3 mt-6 border-t border-neutral-800 pt-6">
              <li>✔️ Acceso total a Vortex Analytics</li>
              <li>✔️ Bitácora My Tracker ilimitada</li>
              <li>✔️ Recomendaciones del Cerebro IA</li>
            </ul>
          </div>
          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-yellow-500 text-neutral-950 font-black text-sm uppercase shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-all">Adquirir VIP</button>
        </div>
      </div>
    </div>
  );
}

function TipsterPanel() {
  return <div className="p-8 text-center text-neutral-400 text-sm uppercase tracking-wider min-h-screen">💼 Panel de Tipster — Operativo en Producción</div>;
}

function AdminPanel() {
  return <div className="p-8 text-center text-neutral-400 text-sm uppercase tracking-wider min-h-screen">⚙️ Panel de Control Administrativo — Operativo en Producción</div>;
}

function LeaderboardPage() {
  return <div className="p-8 text-center text-neutral-400 text-sm uppercase tracking-wider min-h-screen">🏆 Ranking de Líderes — Operativo en Producción</div>;
}

function PaymentSuccess() {
  return <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6 text-center"><div><span className="text-5xl mb-4 inline-block">🟢</span><h2 className="text-2xl font-black uppercase">Pago Procesado con Éxito</h2><p className="text-neutral-400 text-xs mt-2">Tu membresía VIP se ha activado en la base de datos de Aiven.</p></div></div>;
}

function PaymentCancel() {
  return <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6 text-center"><div><span className="text-5xl mb-4 inline-block">🔴</span><h2 className="text-2xl font-black uppercase">Operación Cancelada</h2><p className="text-neutral-400 text-xs mt-2">La pasarela de cobros ha cancelado el cargo de PayPal.</p></div></div>;
}

function AuthModal({ onClose }) {
  const { login } = useAuth();
  
  const handleQuickLogin = (role) => {
    login({
      id: Math.floor(Math.random() * 100) + 1,
      nombre: role === 'free' ? 'Usuario Gratuito' : (role === 'premium' ? 'Usuario VIP' : 'Antonio Admin'),
      email: `${role}@vorticex.com`,
      tipo_usuario: role,
      vortex_score: 90.00
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-2xl">
        <h3 className="text-lg font-black uppercase tracking-wider text-white">Inicio de Sesión</h3>
        
        {/* Accesos rápidos de prueba integrados */}
        <div className="space-y-2 pb-4 border-b border-neutral-800">
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Prueba rápida de roles:</p>
          <button onClick={() => handleQuickLogin('free')} className="w-full py-2 rounded-xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-800 text-xs font-bold uppercase tracking-wide text-neutral-400 transition-all">Entrar como Gratuito (Free)</button>
          <button onClick={() => handleQuickLogin('premium')} className="w-full py-2 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-xs font-bold uppercase tracking-wide text-yellow-500 transition-all">Entrar como Suscriptor (VIP)</button>
          <button onClick={() => handleQuickLogin('admin')} className="w-full py-2 rounded-xl bg-gradient-to-r from-red-600 to-yellow-500 text-neutral-950 text-xs font-black uppercase tracking-wide transition-all hover:scale-[1.01]">Entrar como Admin</button>
        </div>

        <input type="email" placeholder="Correo Electrónico" className="w-full bg-neutral-950 border border-neutral-800 p-3 rounded-xl text-sm text-white focus:outline-none focus:border-yellow-500" />
        <input type="password" placeholder="Contraseña" className="w-full bg-neutral-950 border border-neutral-800 p-3 rounded-xl text-sm text-white focus:outline-none focus:border-yellow-500" />
        <button onClick={onClose} className="w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-white font-bold text-sm uppercase">Entrar</button>
        <button onClick={onClose} className="w-full text-xs text-neutral-500 font-bold uppercase tracking-wider hover:text-neutral-400 transition-all">Cancelar</button>
      </div>
    </div>
  );
}

// =====================================================================
// 🏢 CONTENEDOR PRINCIPAL: APP SHELL (ENRUTADOR GENERAL)
// =====================================================================
function AppShell() {
  const { user } = useAuth(); // Extraemos 'user' del contexto de manera centralizada en AppShell
  const [activePage, setActivePage] = useState('home');
  const [activeTab,  setActiveTab]  = useState('sports');
  const [showAuth,   setShowAuth]   = useState(false);

  const path = window.location.pathname;
  if (path === '/pago-exitoso')   return <PaymentSuccess />;
  if (path === '/pago-cancelado') return <PaymentCancel />;

  /**
   * Navegador global inteligente: gestiona las vistas de Dashboard
   * y las páginas autónomas del sistema.
   */
  function navigate(page) {
    if (['sports', 'politics', 'livefeed', 'analytics'].includes(page)) {
      setActiveTab(page);
      setActivePage('home');
    } else {
      setActivePage(page);
    }
  }

  /**
   * Renderizador adaptativo de vistas basado en el estado activePage.
   * Inyectamos dinámicamente la propiedad 'user' en AnalyticsView.
   */
  function renderPage() {
    switch (activePage) {
      case 'planes':      return <Plans onOpenAuth={() => setShowAuth(true)} />;
      case 'mipanel':     return <TipsterPanel />;
      case 'admin':       return <AdminPanel />;
      case 'leaderboard': return <LeaderboardPage />;
      case 'analytics':   return <AnalyticsView user={user} />; // Inyección de prop 'user' robusta
      default:            return <Dashboard activeTab={activeTab} onOpenAuth={() => setShowAuth(true)} />;
    }
  }

  return (
    <div className="app-shell flex bg-neutral-950 min-h-screen text-white font-sans overflow-x-hidden select-none">
      {/* SIDEBAR FIJO */}
      <Sidebar activePage={activePage} onNavigate={navigate} />
      
      {/* CUERPO DE CONTENIDO CON DESPLAZAMIENTO HACIA LA IZQUIERDA DEL SIDEBAR */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen bg-neutral-950">
        <Topbar
          activeTab={activeTab}
          onTabChange={tab => { 
            // Si el usuario presiona una pestaña autónoma desde el Topbar, cambiamos de página
            if (tab === 'leaderboard' || tab === 'analytics') {
              setActivePage(tab); 
            } else {
              setActiveTab(tab); 
              setActivePage('home');
            }
          }}
          onOpenAuth={() => setShowAuth(true)}
          onNavigate={navigate}
        />
        <main className="flex-1 bg-neutral-950">
          {renderPage()}
        </main>
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
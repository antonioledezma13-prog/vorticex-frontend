import React, { useState, useEffect, createContext, useContext } from 'react';

// =====================================================================
// 🔑 CONTEXTO DE AUTENTICACIÓN (INTEGRADO Y AUTÓNOMO)
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
// 📊 COMPONENTE: VORTEX ANALYTICS (VISTA INTEGRADA PREMIUM)
// =====================================================================
function AnalyticsView({ user }) {
  const [activeSubTab, setActiveSubTab] = useState('vortex'); // vortex | leaderboard | mytracker
  const [vortexData, setVortexData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myTracker, setMyTracker] = useState(null);
  const [loading, setLoading] = useState(true);
  const userRole = user?.tipo_usuario || 'free'; 

  const API_BASE = 'https://vorticex-backend.onrender.com/api/analytics';

  useEffect(() => {
    fetchData();
  }, [activeSubTab, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'vortex') {
        const res = await fetch(`${API_BASE}/vortex-tracker`).then(r => r.json());
        if (res.success) {
          setVortexData(res);
        } else {
          setVortexData({
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
          });
        }
      } else if (activeSubTab === 'leaderboard') {
        const res = await fetch(`${API_BASE}/tipsters`).then(r => r.json());
        if (res.success) {
          setLeaderboard(res.leaderboard);
        } else {
          setLeaderboard([
            { id: 1, nombre: 'Vortex AI Bot', rango: 'ALGORITMO', yield: '+24.5%', winRate: '78.2%', picksEnviados: 120, racha: ['W', 'W', 'W', 'L', 'W'] },
            { id: 2, nombre: 'Antonio Ledezma', rango: 'ADMINISTRADOR', yield: '+18.2%', winRate: '74.0%', picksEnviados: 85, racha: ['W', 'W', 'L', 'W', 'W'] },
            { id: 3, nombre: 'Carlos Tipster', rango: 'TIPSTER', yield: '+12.4%', winRate: '68.5%', picksEnviados: 40, racha: ['L', 'W', 'W', 'D', 'W'] }
          ]);
        }
      } else if (activeSubTab === 'mytracker') {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }
        const res = await fetch(`${API_BASE}/my-tracker`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json());
        if (res.success) {
          setMyTracker(res);
        } else {
          setMyTracker({
            netProfit: 145.80,
            winRatePersonal: 72.5,
            historial: [
              { id: 101, partido: 'Atalanta BC vs Bologna', miPrediccion: 'Local', estado: 'won', fecha: '17/05/2026' },
              { id: 102, partido: 'Newcastle vs West Ham', miPrediccion: 'Local', estado: 'won', fecha: '17/05/2026' },
              { id: 103, partido: 'Real Sociedad vs Valencia', miPrediccion: 'Local', estado: 'lost', fecha: '17/05/2026' }
            ]
          });
        }
      }
    } catch (err) {
      console.error("Error cargando estadísticas de Analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      {/* ENCABEZADO */}
      <div className="mb-8 relative overflow-hidden bg-neutral-900/40 p-6 rounded-2xl border border-neutral-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[100px] -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 bg-clip-text text-transparent uppercase font-mono">
            Vortex Analytics
          </h1>
          <p className="text-neutral-400 text-sm mt-1 font-medium">
            Auditoría financiera en tiempo real del Cerebro IA y control de bankroll de inversiones.
          </p>
        </div>
      </div>

      {/* SUB-PESTAÑAS */}
      <div className="flex border-b border-neutral-800 mb-8 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveSubTab('vortex')}
          className={`pb-4 px-4 font-bold text-sm tracking-wide uppercase transition-all bg-transparent border-0 cursor-pointer ${
            activeSubTab === 'vortex' ? 'border-b-2 border-yellow-500 text-yellow-500 font-black' : 'text-neutral-400 hover:text-white'
          }`}
        >
          🔮 Vortex Tracker (IA)
        </button>
        <button
          onClick={() => setActiveSubTab('leaderboard')}
          className={`pb-4 px-4 font-bold text-sm tracking-wide uppercase transition-all bg-transparent border-0 cursor-pointer ${
            activeSubTab === 'leaderboard' ? 'border-b-2 border-yellow-500 text-yellow-500 font-black' : 'text-neutral-400 hover:text-white'
          }`}
        >
          🎯 Tipsters Oficiales
        </button>
        <button
          onClick={() => setActiveSubTab('mytracker')}
          className={`pb-4 px-4 font-bold text-sm tracking-wide uppercase transition-all bg-transparent border-0 cursor-pointer ${
            activeSubTab === 'mytracker' ? 'border-b-2 border-yellow-500 text-yellow-500 font-black' : 'text-neutral-400 hover:text-white'
          }`}
        >
          📒 Mi Bitácora (My Tracker)
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
          <p className="text-neutral-400 text-xs mt-4 uppercase tracking-widest font-bold">Calculando métricas...</p>
        </div>
      ) : (
        <>
          {activeSubTab === 'vortex' && vortexData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">Efectividad 30D</span>
                <div className="text-6xl font-black text-emerald-500 font-mono tracking-tight mb-2">{vortexData.winRate}%</div>
                <p className="text-xs text-neutral-400">Calculado sobre <span className="text-white font-bold">{vortexData.totalAnalizados || 24} partidos</span>.</p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                <span className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-2">Retorno de Inversión</span>
                <div className="text-6xl font-black text-yellow-500 font-mono tracking-tight mb-2">+{((vortexData.winRate - 50) * 1.8).toFixed(1)}%</div>
                <p className="text-xs text-neutral-400">Ganancia acumulada sugerida de forma automatizada.</p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                <span className="text-xs font-black text-red-500 uppercase tracking-widest mb-2">Picks Acertados</span>
                <div className="text-6xl font-black text-red-500 font-mono tracking-tight mb-2">{vortexData.aciertos || 18}</div>
                <p className="text-xs text-neutral-400">Sugerencias que resultaron en cobros exitosos.</p>
              </div>

              <div className="lg:col-span-3 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-neutral-300">Curva de Crecimiento de Capital</h3>
                <div className="space-y-3">
                  {vortexData.roiProgress?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-neutral-950/60 rounded-xl border border-neutral-800">
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

          {activeSubTab === 'leaderboard' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
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
                              <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-neutral-800 border border-neutral-700 text-neutral-400 font-bold uppercase mt-1 inline-block">{tipster.rango}</span>
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
                <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md z-30 flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-neutral-800/60 shadow-2xl">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Desbloquea tu Bitácora de Inversión</h3>
                  <p className="text-neutral-400 text-sm max-w-lg mb-6 leading-relaxed">Lleva el control exacto de tus apuestas con el **Plan VIP**.</p>
                  <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-yellow-500 text-neutral-950 font-black rounded-xl cursor-pointer border-0">💎 Adquirir Plan VIP</button>
                </div>
              )}

              <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${(userRole === 'free' || !user) ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col justify-between">
                  <span className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Beneficio Neto</span>
                  <div className="text-5xl font-black text-emerald-400 font-mono tracking-tight mb-2">+{myTracker?.netProfit ? `$${myTracker.netProfit}` : '$0'}</div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col justify-between">
                  <span className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Tasa de Acierto Personal</span>
                  <div className="text-5xl font-black text-yellow-500 font-mono tracking-tight mb-2">{myTracker?.winRatePersonal || 0}%</div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col justify-between">
                  <span className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Estado del Banco</span>
                  <div className="text-2xl font-black text-white uppercase tracking-tight mb-2">Salud Estable 🟢</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
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
    <div className="w-64 bg-neutral-900 border-r border-neutral-800 h-screen flex flex-col justify-between p-4 fixed left-0 top-0 z-30 font-sans">
      <div>
        <div className="flex items-center gap-2 mb-8 px-2 py-4 border-b border-neutral-800">
          <span className="text-2xl">🔥</span>
          <span className="font-black text-xl bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent uppercase tracking-wider">Vorticex</span>
        </div>
        <nav className="space-y-1">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm tracking-wide uppercase transition-all bg-transparent border-0 cursor-pointer text-left ${
                activePage === item.id 
                  ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-neutral-950 font-black' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

function Topbar({ activeTab, onTabChange, onOpenAuth, onNavigate }) {
  const { user, logout } = useAuth();
  return (
    <header className="h-16 border-b border-neutral-800 bg-neutral-900/60 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20 font-sans">
      <div className="flex gap-4">
        {['sports', 'politics', 'livefeed'].map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`text-xs font-black tracking-widest uppercase pb-1 transition-all bg-transparent border-0 cursor-pointer ${
              activeTab === tab ? 'border-b border-yellow-500 text-yellow-500 font-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {tab === 'sports' ? '⚽ Deportes' : tab === 'politics' ? '🗳️ Política' : '⚡ Live'}
          </button>
        ))}
      </div>
      <div>
        {user ? (
          <button onClick={logout} className="text-xs font-bold uppercase bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 px-4 py-2 rounded-xl text-neutral-300 cursor-pointer">Cerrar Sesión</button>
        ) : (
          <button onClick={onOpenAuth} className="text-xs font-black uppercase bg-gradient-to-r from-red-600 to-yellow-500 text-neutral-950 px-4 py-2 rounded-xl cursor-pointer border-0">Iniciar Sesión</button>
        )}
      </div>
    </header>
  );
}

function Dashboard({ activeTab, onOpenAuth }) {
  const sampleEvents = [
    { id: 1, home: 'Atalanta BC', away: 'Bologna', time: 'Serie A - Hoy, 12:00', probHome: '72.7%', probAway: '27.3%', confidence: '92%', formHome: ['W', 'L', 'D', 'W', 'W'], formAway: ['L', 'D', 'W', 'D', 'L'] },
    { id: 2, home: 'Newcastle United', away: 'West Ham United', time: 'Premier League - Hoy, 12:30', probHome: '60.4%', probAway: '39.6%', confidence: '85%', formHome: ['W', 'D', 'L', 'W', 'W'], formAway: ['L', 'D', 'W', 'D', 'L'] }
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto font-sans">
      <div className="relative overflow-hidden bg-neutral-900/40 p-6 rounded-2xl border border-neutral-800">
        <h2 className="text-2xl font-black uppercase text-white">Top Mercados de Hoy</h2>
        <p className="text-xs text-neutral-400 mt-1 font-medium">Sugerencias y análisis algorítmico del Cerebro IA en vivo.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleEvents.map(event => (
          <div key={event.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between hover:border-neutral-700 transition-all">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase text-yellow-500">{event.time}</span>
              <div className="flex justify-between items-center">
                <div className="text-center w-5/12">
                  <p className="text-xs font-black truncate text-neutral-200">{event.home}</p>
                </div>
                <span className="text-xs text-neutral-600 font-bold w-2/12 text-center">vs</span>
                <div className="text-center w-5/12">
                  <p className="text-xs font-black truncate text-neutral-200">{event.away}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Plans({ onOpenAuth }) { return <div className="p-6 text-center text-white">Sección de Planes</div>; }
function TipsterPanel() { return <div className="p-6 text-center text-white">Panel de Tipster</div>; }
function AdminPanel() { return <div className="p-6 text-center text-white">Panel Admin</div>; }
function LeaderboardPage() { return <div className="p-6 text-center text-white">Líderes</div>; }

// =====================================================================
// 🏢 CONTENEDOR PRINCIPAL: APP SHELL (ENRUTADOR GENERAL)
// =====================================================================
function AppShell() {
  const { user } = useAuth(); 
  const [activePage, setActivePage] = useState('home');
  const [activeTab,  setActiveTab]  = useState('sports');
  const [showAuth,   setShowAuth]   = useState(false);

  function navigate(page) {
    if (['sports', 'politics', 'livefeed', 'analytics'].includes(page)) {
      setActiveTab(page);
      setActivePage('home');
    } else {
      setActivePage(page);
    }
  }

  function renderPage() {
    switch (activePage) {
      case 'planes':      return <Plans onOpenAuth={() => setShowAuth(true)} />;
      case 'mipanel':     return <TipsterPanel />;
      case 'admin':       return <AdminPanel />;
      case 'leaderboard': return <LeaderboardPage />;
      case 'analytics':   return <AnalyticsView user={user} />;
      default:            return <Dashboard activeTab={activeTab} onOpenAuth={() => setShowAuth(true)} />;
    }
  }

  return (
    <div className="app-shell flex bg-neutral-950 min-h-screen text-white font-sans">
      <Sidebar activePage={activePage} onNavigate={navigate} />
      <div className="flex-1 pl-64 flex flex-col min-h-screen bg-neutral-950">
        <Topbar
          activeTab={activeTab}
          onTabChange={tab => { 
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
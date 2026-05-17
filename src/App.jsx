// src/App.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';

// =====================================================================
// 🎨 PALETA DE COLORES VORTEX (ESTILOS COMPARTIDOS)
// =====================================================================
const theme = {
  bgGradient: 'linear-gradient(135deg, #0a0a0a 0%, #121212 100%)',
  panelBg: 'rgba(23, 23, 23, 0.75)', // Efecto translúcido limpio
  border: '1px solid rgba(63, 63, 70, 0.4)',
  textMain: '#ffffff',
  textMuted: '#a3a3a3',
  vortexNeon: 'linear-gradient(90deg, #dc2626, #facc15, #dc2626)',
  yellow: '#facc15',
  emerald: '#34d399',
  red: '#f87171',
  darkBg: '#050505'
};

// =====================================================================
// 🔑 CONTEXTO DE AUTENTICACIÓN
// =====================================================================
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    id: 1,
    nombre: 'Antonio Ledezma',
    email: 'antonioledezma13@gmail.com',
    tipo_usuario: 'admin',
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
// 📊 COMPONENTE: VORTEX ANALYTICS (ESTILOS NATIVOS)
// =====================================================================
function AnalyticsView({ user }) {
  const [activeSubTab, setActiveSubTab] = useState('vortex');
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
        // Fallback inmediato con data estructurada si el backend no responde
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
      } else if (activeSubTab === 'leaderboard') {
        setLeaderboard([
          { id: 1, nombre: 'Vortex AI Bot', rango: 'ALGORITMO', yield: '+24.5%', winRate: '78.2%', picksEnviados: 120, racha: ['W', 'W', 'W', 'L', 'W'] },
          { id: 2, nombre: 'Antonio Ledezma', rango: 'ADMINISTRADOR', yield: '+18.2%', winRate: '74.0%', picksEnviados: 85, racha: ['W', 'W', 'L', 'W', 'W'] },
          { id: 3, nombre: 'Carlos Tipster', rango: 'TIPSTER', yield: '+12.4%', winRate: '68.5%', picksEnviados: 40, racha: ['L', 'W', 'W', 'D', 'W'] }
        ]);
      } else if (activeSubTab === 'mytracker') {
        setMyTracker({
          netProfit: 145.80,
          winRatePersonal: 72.5,
          historial: [
            { id: 101, partido: 'Atalanta BC vs Bologna', miPrediccion: 'Local', estado: 'won', fecha: '17/05/2026' },
            { id: 102, partido: 'Newcastle vs West Ham', miPrediccion: 'Local', estado: 'won', fecha: '17/05/2026' }
          ]
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ background: theme.panelBg, padding: '24px', borderRadius: '16px', border: theme.border, marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.5px', color: theme.yellow }}>
          Vortex Analytics
        </h1>
        <p style={{ color: theme.textMuted, fontSize: '14px', margin: '4px 0 0 0' }}>
          Auditoría financiera en tiempo real del Cerebro IA y control de bankroll.
        </p>
      </div>

      {/* TABS SELECTOR */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #27272a', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
        {[['vortex', '🔮 Vortex Tracker'], ['leaderboard', '🎯 Tipsters Oficiales'], ['mytracker', '📒 Mi Bitácora']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveSubTab(id)}
            style={{
              padding: '10px 16px',
              background: activeSubTab === id ? 'rgba(250, 250, 21, 0.1)' : 'transparent',
              color: activeSubTab === id ? theme.yellow : theme.textMuted,
              border: 'none',
              borderBottom: activeSubTab === id ? `2px solid ${theme.yellow}` : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
              textTransform: 'uppercase',
              transition: 'all 0.2s'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: theme.textMuted, textAlign: 'center', padding: '40px' }}>Calculando métricas...</div>
      ) : (
        <>
          {activeSubTab === 'vortex' && vortexData && (
            <div>
              {/* CARDS GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#18181b', border: theme.border, padding: '24px', borderRadius: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: theme.emerald, tracking: '1px', textTransform: 'uppercase' }}>Efectividad 30D</span>
                  <div style={{ fontSize: '48px', fontWeight: '900', color: theme.emerald, margin: '8px 0' }}>{vortexData.winRate}%</div>
                  <p style={{ fontSize: '12px', color: theme.textMuted, margin: 0 }}>Muestreo de {vortexData.totalAnalizados} partidos.</p>
                </div>
                <div style={{ background: '#18181b', border: theme.border, padding: '24px', borderRadius: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: theme.yellow, tracking: '1px', textTransform: 'uppercase' }}>Rendimiento</span>
                  <div style={{ fontSize: '48px', fontWeight: '900', color: theme.yellow, margin: '8px 0' }}>+47.5%</div>
                  <p style={{ fontSize: '12px', color: theme.textMuted, margin: 0 }}>Crecimiento estimado del capital.</p>
                </div>
                <div style={{ background: '#18181b', border: theme.border, padding: '24px', borderRadius: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: theme.red, tracking: '1px', textTransform: 'uppercase' }}>Picks Cobrados</span>
                  <div style={{ fontSize: '48px', fontWeight: '900', color: theme.red, margin: '8px 0' }}>{vortexData.aciertos}</div>
                  <p style={{ fontSize: '12px', color: theme.textMuted, margin: 0 }}>Predicciones ganadoras.</p>
                </div>
              </div>

              {/* LISTA DE PARTIDOS */}
              <div style={{ background: '#18181b', border: theme.border, borderRadius: '16px', padding: '20px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', textTransform: 'uppercase', color: '#e4e4e7' }}>Historial Reciente de Inversión</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {vortexData.roiProgress.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#09090b', borderRadius: '12px', border: '1px solid #27272a' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{item.partido}</p>
                        <span style={{ fontSize: '11px', color: theme.textMuted }}>{item.fecha}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: theme.yellow }}>${item.bankroll} USD</p>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: item.resultado === 'Ganado' ? theme.emerald : theme.red }}>{item.resultado}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'leaderboard' && (
            <div style={{ background: '#18181b', border: theme.border, borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '16px', textTransform: 'uppercase' }}>Ranking General</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #27272a', color: theme.textMuted, fontSize: '12px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 20px' }}>User</th>
                      <th style={{ padding: '12px 20px' }}>Yield</th>
                      <th style={{ padding: '12px 20px' }}>Efectividad</th>
                      <th style={{ padding: '12px 20px' }}>Racha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((t) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #27272a', fontSize: '14px' }}>
                        <td style={{ padding: '12px 20px', fontWeight: 'bold' }}>{t.nombre} <span style={{ fontSize: '10px', background: '#27272a', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>{t.rango}</span></td>
                        <td style={{ padding: '12px 20px', color: theme.emerald, fontWeight: 'bold' }}>{t.yield}</td>
                        <td style={{ padding: '12px 20px' }}>{t.winRate}</td>
                        <td style={{ padding: '12px 20px' }}>{t.racha.join(' - ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'mytracker' && (
            <div style={{ position: 'relative', padding: '40px 20px', textAlign: 'center', background: '#18181b', border: theme.border, borderRadius: '16px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>Bitácora VIP Personal</h3>
              <p style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '20px' }}>Automatiza y audita tus propias jugadas en tiempo real de forma segura.</p>
              <button style={{ padding: '12px 24px', background: theme.yellow, color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}> Desbloquear Bitácora</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// =====================================================================
// 🖥️ COMPONENTES DE INTERFAZ NATIVOS (SIDEBAR & TOPBAR)
// =====================================================================
function Sidebar({ activePage, onNavigate }) {
  const { user } = useAuth();
  const items = [
    { id: 'home', label: 'Inicio', icon: '🏠' },
    { id: 'planes', label: 'Planes & Precios', icon: '💎' },
    { id: 'analytics', label: 'Analytics', icon: '📊' }
  ];

  return (
    <div style={{ width: '240px', background: '#111111', borderRight: '1px solid #27272a', height: '100vh', position: 'fixed', left: 0, top: 0, padding: '16px', boxSizing: 'border-box' }}>
      <div style={{ fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '32px', color: theme.yellow, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🔥</span> Vorticex
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '12px 16px',
              background: activePage === item.id ? theme.yellow : 'transparent',
              color: activePage === item.id ? '#000000' : '#e4e4e7',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s'
            }}
          >
            <span>{item.icon}</span> {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Topbar({ activeTab, onTabChange, onOpenAuth }) {
  const { user, logout } = useAuth();
  return (
    <header style={{ height: '64px', borderBottom: '1px solid #27272a', background: 'rgba(18, 18, 18, 0.8)', display: 'flex', alignItems: 'center', justifyBetween: 'space-between', padding: '0 24px', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        {['sports', 'politics'].map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === tab ? theme.yellow : theme.textMuted,
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '13px',
              textTransform: 'uppercase',
              borderBottom: activeTab === tab ? `2px solid ${theme.yellow}` : '2px solid transparent',
              paddingBottom: '4px'
            }}
          >
            {tab === 'sports' ? '⚽ Deportes' : '🗳️ Política'}
          </button>
        ))}
      </div>
      <div>
        {user ? (
          <button onClick={logout} style={{ background: '#27272a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Cerrar Sesión</button>
        ) : (
          <button onClick={onOpenAuth} style={{ background: theme.yellow, color: '#000', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Iniciar Sesión</button>
        )}
      </div>
    </header>
  );
}

function Dashboard() {
  const events = [
    { id: 1, home: 'Atalanta BC', away: 'Bologna', time: 'Serie A - Hoy, 12:00', confidence: '92%' },
    { id: 2, home: 'Newcastle United', away: 'West Ham', time: 'Premier League - Hoy, 12:30', confidence: '85%' }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ background: theme.panelBg, padding: '24px', borderRadius: '16px', border: theme.border, marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', textTransform: 'uppercase' }}>Top Mercados de Hoy</h2>
        <p style={{ color: theme.textMuted, fontSize: '12px', margin: '4px 0 0 0' }}>Análisis algorítmico activo.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {events.map(e => (
          <div key={e.id} style={{ background: '#18181b', border: theme.border, borderRadius: '16px', padding: '20px' }}>
            <span style={{ fontSize: '10px', color: theme.yellow, fontWeight: 'bold' }}>{e.time}</span>
            <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '12px 0' }}>{e.home} vs {e.away}</p>
            <span style={{ fontSize: '12px', color: theme.emerald }}>Confianza: {e.confidence}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================================
// 🏢 APP CONTAINER GENERAL
// =====================================================================
function AppShell() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('home');
  const [activeTab, setActiveTab] = useState('sports');

  function renderPage() {
    if (activePage === 'analytics') return <AnalyticsView user={user} />;
    return <Dashboard />;
  }

  return (
    <div style={{ display: 'flex', background: '#050505', minHeight: '100vh', color: '#ffffff' }}>
      <Sidebar activePage={activePage} onNavigate={(page) => setActivePage(page)} />
      <div style={{ flex: 1, marginLeft: '240px', display: 'flex', flexDirection: 'column' }}>
        <Topbar activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setActivePage('home'); }} />
        <main style={{ flex: 1 }}>
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
// src/App.jsx
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar        from './components/Sidebar';
import Topbar         from './components/Topbar';
import Dashboard      from './pages/Dashboard';
import Plans          from './pages/Plans';
import TipsterPanel   from './pages/TipsterPanel';
import AdminPanel     from './pages/AdminPanel';
import Leaderboard    from './pages/Leaderboard';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel  from './pages/PaymentCancel';
import AuthModal      from './components/AuthModal';
import './styles/global.css';

function AppShell() {
  const [activePage, setActivePage] = useState('home');
  const [activeTab,  setActiveTab]  = useState('sports');
  const [showAuth,   setShowAuth]   = useState(false);

  const path = window.location.pathname;
  if (path === '/pago-exitoso')   return <PaymentSuccess />;
  if (path === '/pago-cancelado') return <PaymentCancel />;

  function navigate(page) {
    if (['sports', 'politics', 'livefeed'].includes(page)) {
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
      case 'leaderboard': return <Leaderboard />;
      default:            return <Dashboard activeTab={activeTab} onOpenAuth={() => setShowAuth(true)} />;
    }
  }

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={navigate} />
      <div className="main-content">
        <Topbar
          activeTab={activeTab}
          onTabChange={tab => { setActiveTab(tab); setActivePage('home'); }}
          onOpenAuth={() => setShowAuth(true)}
          onNavigate={navigate}
        />
        {renderPage()}
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

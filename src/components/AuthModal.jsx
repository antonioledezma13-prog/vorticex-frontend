// src/components/AuthModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

export default function AuthModal({ onClose }) {
  const { login } = useAuth();
  const [mode, setMode]       = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm]       = useState({
    nombre: '', email: '', password: '', tipo_usuario: 'free'
  });

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = mode === 'login'
      ? { email: form.email, password: form.password }
      : { nombre: form.nombre, email: form.email, password: form.password, tipo_usuario: form.tipo_usuario };

    try {
      const res  = await fetch(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error desconocido');
        return;
      }

      login(data.user, data.token);
      onClose();
    } catch {
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="auth-modal card" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="am-header">
          <div className="am-logo">
            <span className="am-logo-icon">◈</span>
            <span className="am-logo-text">VORTICEX</span>
          </div>
          <button className="am-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="am-tabs">
          <button
            className={`am-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >Iniciar Sesión</button>
          <button
            className={`am-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); }}
          >Registrarse</button>
        </div>

        {/* Form */}
        <div className="am-body">
          {mode === 'register' && (
            <div className="am-field">
              <label className="am-label">Nombre</label>
              <input
                className="am-input"
                type="text"
                name="nombre"
                placeholder="Tu nombre"
                value={form.nombre}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              />
            </div>
          )}

          <div className="am-field">
            <label className="am-label">Email</label>
            <input
              className="am-input"
              type="email"
              name="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="am-field">
            <label className="am-label">Contraseña</label>
            <input
              className="am-input"
              type="password"
              name="password"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
          </div>

          {mode === 'register' && (
            <div className="am-field">
              <label className="am-label">Tipo de cuenta</label>
              <div className="am-role-selector">
                {[
                  { id: 'free',    label: 'Fan',      desc: 'Ver resultados básicos',         icon: '👁' },
                  { id: 'tipster', label: 'Tipster',  desc: 'Publica pronósticos y acumula VortexScore', icon: '🎯' },
                ].map(r => (
                  <button
                    key={r.id}
                    className={`role-btn ${form.tipo_usuario === r.id ? 'active' : ''}`}
                    onClick={() => setForm(prev => ({ ...prev, tipo_usuario: r.id }))}
                  >
                    <span className="role-icon">{r.icon}</span>
                    <span className="role-label">{r.label}</span>
                    <span className="role-desc">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <div className="am-error">{error}</div>}

          <button
            className="am-submit btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Procesando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>

          {mode === 'login' && (
            <div className="am-footer-note">
              ¿No tienes cuenta?{' '}
              <button className="am-link" onClick={() => setMode('register')}>
                Regístrate gratis
              </button>
            </div>
          )}

          {mode === 'register' && (
            <div className="am-premium-note">
              <span className="am-crown">👑</span>
              ¿Quieres acceso al Cerebro IA y a los Oráculos?
              <strong> Actualiza a Premium</strong> después del registro.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

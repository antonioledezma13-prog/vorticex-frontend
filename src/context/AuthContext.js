// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(localStorage.getItem('vx_token'));
  const [loading, setLoading] = useState(true);

  // Al montar: si hay token guardado, verificar con /api/auth/me
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) setUser(data);
          else logout(); // token expirado
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  function login(userData, jwt) {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem('vx_token', jwt);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('vx_token');
  }

  // Helper: ¿tiene acceso a contenido premium?
  function canAccess(requiredRole = 'premium') {
    if (!user) return false;
    const hierarchy = { free: 0, tipster: 1, premium: 2, admin: 3 };
    return (hierarchy[user.tipo_usuario] ?? 0) >= (hierarchy[requiredRole] ?? 99);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, canAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

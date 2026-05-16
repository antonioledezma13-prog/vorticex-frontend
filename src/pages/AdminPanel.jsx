// src/pages/AdminPanel.jsx
// Panel de administración — gestión de retiros de tipsters
// Requiere rol: admin
// Status reales en DB: pending | paid | rejected

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminPanel.css';

const STATUS_LABELS = {
  pending:  { label: 'Pendiente',  color: '#f5a623' },
  paid:     { label: 'Pagado',     color: '#34d399' },
  rejected: { label: 'Rechazado', color: '#e01a1a' },
};

export default function AdminPanel() {
  const { user, token } = useAuth();

  const [tab,      setTab]      = useState('pending');
  const [retiros,  setRetiros]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [stats,    setStats]    = useState(null);

  const [rejectModal,    setRejectModal]    = useState(null);
  const [motivoRechazo,  setMotivoRechazo]  = useState('');
  const [actionLoading,  setActionLoading]  = useState(null);

  useEffect(() => {
    if (user && user.tipo_usuario !== 'admin') {
      window.location.href = '/';
    }
  }, [user]);

  const fetchRetiros = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`/api/admin/retiros?status=${tab}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRetiros(data.retiros || []);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tab, token]);

  useEffect(() => { fetchRetiros(); }, [fetchRetiros]);

  async function handleAprobar(retiroId) {
    setActionLoading(retiroId + '_aprobar');
    try {
      const res  = await fetch(`/api/admin/retiros/${retiroId}/aprobar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchRetiros();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRechazar() {
    if (!rejectModal) return;
    setActionLoading(rejectModal.retiroId + '_rechazar');
    try {
      const res  = await fetch(`/api/admin/retiros/${rejectModal.retiroId}/rechazar`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ motivo: motivoRechazo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRejectModal(null);
      setMotivoRechazo('');
      fetchRetiros();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-VE', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  if (!user || user.tipo_usuario !== 'admin') return null;

  return (
    <div className="admin-panel">

      <div className="ap-header">
        <div>
          <h1 className="ap-title">⚙️ Panel Admin</h1>
          <p className="ap-subtitle">Gestión de retiros de tipsters</p>
        </div>
        <button className="ap-refresh" onClick={fetchRetiros} disabled={loading}>
          {loading ? '⟳' : '↺'} Actualizar
        </button>
      </div>

      {stats && (
        <div className="ap-stats-grid">
          <div className="ap-stat-card">
            <div className="ap-stat-val gold">{stats.pendientes || 0}</div>
            <div className="ap-stat-label">Pendientes</div>
          </div>
          <div className="ap-stat-card">
            <div className="ap-stat-val green">{stats.aprobados || 0}</div>
            <div className="ap-stat-label">Pagados</div>
          </div>
          <div className="ap-stat-card">
            <div className="ap-stat-val">${Number(stats.total_pendiente || 0).toFixed(2)}</div>
            <div className="ap-stat-label">Total pendiente</div>
          </div>
          <div className="ap-stat-card">
            <div className="ap-stat-val">${Number(stats.total_pagado || 0).toFixed(2)}</div>
            <div className="ap-stat-label">Total pagado</div>
          </div>
        </div>
      )}

      <div className="ap-tabs">
        {['pending', 'all'].map(t => (
          <button
            key={t}
            className={`ap-tab ${tab === t ? 'ap-tab-active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'pending' ? 'Pendientes' : 'Todos'}
          </button>
        ))}
      </div>

      {error && <div className="ap-error">{error}</div>}

      {loading ? (
        <div className="ap-loading">Cargando retiros...</div>
      ) : retiros.length === 0 ? (
        <div className="ap-empty">
          {tab === 'pending' ? '✅ No hay retiros pendientes' : 'No hay retiros registrados'}
        </div>
      ) : (
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr>
                <th>Tipster</th>
                <th>Email / PayPal</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Solicitado</th>
                <th>Pagado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {retiros.map(r => {
                const st = STATUS_LABELS[r.status] || STATUS_LABELS.pending;
                return (
                  <tr key={r.id}>
                    <td className="ap-cell-tipster">
                      <div className="ap-mini-avatar">
                        {r.tipster_nombre?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span>{r.tipster_nombre}</span>
                    </td>
                    <td className="ap-cell-mono">{r.metodo_pago}</td>
                    <td className="ap-cell-monto">${Number(r.monto).toFixed(2)}</td>
                    <td>
                      <span
                        className="ap-status-badge"
                        style={{ color: st.color, borderColor: st.color + '55', background: st.color + '18' }}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td className="ap-cell-date">{fmtDate(r.created_at)}</td>
                    <td className="ap-cell-date">{fmtDate(r.paid_at)}</td>
                    <td>
                      {r.status === 'pending' ? (
                        <div className="ap-actions">
                          <button
                            className="ap-btn-aprobar"
                            onClick={() => handleAprobar(r.id)}
                            disabled={!!actionLoading}
                          >
                            {actionLoading === r.id + '_aprobar' ? '...' : '✓ Aprobar'}
                          </button>
                          <button
                            className="ap-btn-rechazar"
                            onClick={() => {
                              setRejectModal({ retiroId: r.id, tipsterNombre: r.tipster_nombre });
                              setMotivoRechazo('');
                            }}
                            disabled={!!actionLoading}
                          >
                            ✕ Rechazar
                          </button>
                        </div>
                      ) : (
                        <span className="ap-no-action">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {rejectModal && (
        <div className="ap-modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="ap-modal" onClick={e => e.stopPropagation()}>
            <div className="ap-modal-title">Rechazar retiro</div>
            <div className="ap-modal-sub">
              Tipster: <strong>{rejectModal.tipsterNombre}</strong>
            </div>
            <textarea
              className="ap-modal-input"
              placeholder="Motivo del rechazo (opcional)..."
              value={motivoRechazo}
              onChange={e => setMotivoRechazo(e.target.value)}
              rows={3}
            />
            <div className="ap-modal-actions">
              <button
                className="ap-btn-rechazar"
                onClick={handleRechazar}
                disabled={!!actionLoading}
              >
                {actionLoading ? '...' : 'Confirmar rechazo'}
              </button>
              <button className="ap-btn-cancel" onClick={() => setRejectModal(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

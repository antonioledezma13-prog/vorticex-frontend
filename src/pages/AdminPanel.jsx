// src/pages/AdminPanel.jsx
// Panel de administración — retiros + gestión completa de eventos
// Requiere rol: admin

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminPanel.css';

const STATUS_LABELS = {
  pending:  { label: 'Pendiente',  color: '#f5a623' },
  paid:     { label: 'Pagado',     color: '#34d399' },
  rejected: { label: 'Rechazado', color: '#e01a1a' },
};

const EVENT_STATUS_LABELS = {
  upcoming: { label: 'Próximo',    color: '#6b7280' },
  live:     { label: 'En Vivo',    color: '#e01a1a' },
  finished: { label: 'Finalizado', color: '#34d399' },
};

// ─── MODAL CREAR EVENTO ───────────────────────────────────────────────────────
function CreateEventModal({ token, onClose, onCreated }) {
  const [form, setForm] = useState({
    name:      '',
    home_team: '',
    away_team: '',
    league:    '',
    type:      'sports',
    start_time:'',
    prob_home: 50,
    prob_away: 50,
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  function upd(k, v) {
    setForm(f => {
      const next = { ...f, [k]: v };
      // Mantener probs sumando 100
      if (k === 'prob_home') next.prob_away = 100 - Number(v);
      if (k === 'prob_away') next.prob_home = 100 - Number(v);
      return next;
    });
  }

  async function handleSubmit() {
    if (!form.name || !form.start_time) {
      setError('Nombre y fecha son obligatorios');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/events', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onCreated(data);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="ap-modal-overlay" onClick={onClose}>
      <div className="ap-modal ap-modal-lg" onClick={e => e.stopPropagation()}>
        <div className="ap-modal-title">➕ Crear Evento</div>

        <div className="ap-form-grid">
          <div className="ap-form-field ap-form-full">
            <label className="ap-form-label">Nombre del Evento *</label>
            <input className="ap-form-input" value={form.name}
              onChange={e => upd('name', e.target.value)}
              placeholder="Ej: Real Madrid vs Barcelona" />
          </div>

          <div className="ap-form-field">
            <label className="ap-form-label">Equipo / Opción A</label>
            <input className="ap-form-input" value={form.home_team}
              onChange={e => upd('home_team', e.target.value)}
              placeholder="Local / Sí" />
          </div>

          <div className="ap-form-field">
            <label className="ap-form-label">Equipo / Opción B</label>
            <input className="ap-form-input" value={form.away_team}
              onChange={e => upd('away_team', e.target.value)}
              placeholder="Visitante / No" />
          </div>

          <div className="ap-form-field">
            <label className="ap-form-label">Liga / Competición</label>
            <input className="ap-form-input" value={form.league}
              onChange={e => upd('league', e.target.value)}
              placeholder="Champions League" />
          </div>

          <div className="ap-form-field">
            <label className="ap-form-label">Tipo</label>
            <select className="ap-form-select" value={form.type}
              onChange={e => upd('type', e.target.value)}>
              <option value="sports">⚽ Deportivo</option>
              <option value="politics">🏛 Político</option>
            </select>
          </div>

          <div className="ap-form-field ap-form-full">
            <label className="ap-form-label">Fecha y Hora de Inicio *</label>
            <input className="ap-form-input" type="datetime-local" value={form.start_time}
              onChange={e => upd('start_time', e.target.value)} />
          </div>

          <div className="ap-form-field">
            <label className="ap-form-label">Prob. A: {form.prob_home}%</label>
            <input type="range" min="1" max="99" value={form.prob_home}
              className="ap-form-range"
              onChange={e => upd('prob_home', e.target.value)} />
          </div>

          <div className="ap-form-field">
            <label className="ap-form-label">Prob. B: {form.prob_away}%</label>
            <input type="range" min="1" max="99" value={form.prob_away}
              className="ap-form-range"
              onChange={e => upd('prob_away', e.target.value)} />
          </div>
        </div>

        {error && <div className="ap-error" style={{ marginTop: 0 }}>{error}</div>}

        <div className="ap-modal-actions">
          <button className="ap-btn-aprobar" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creando...' : '✓ Crear Evento'}
          </button>
          <button className="ap-btn-cancel" onClick={onClose}>Cancelar</button>
        </div>
      </div>
      {/* ── Modal asignar tipster a evento ── */}
      {asignModal && (
        <div className="ap-modal-overlay" onClick={() => setAsignModal(null)}>
          <div className="ap-modal" onClick={e => e.stopPropagation()}>
            <div className="ap-modal-title">👤 Asignar Tipster</div>
            <div className="ap-modal-sub">
              Evento: <strong>
                {asignModal.home_team && asignModal.away_team
                  ? `${asignModal.home_team} vs ${asignModal.away_team}`
                  : asignModal.name}
              </strong>
            </div>

            {(() => {
              const tipsters = usuarios.filter(u =>
                ['tipster','oraculo','admin'].includes(u.tipo_usuario)
              );
              return tipsters.length === 0 ? (
                <div style={{ color:'var(--text-dim)', fontSize:13, padding:'12px 0' }}>
                  No hay tipsters disponibles. Cambia el rol de un usuario primero.
                </div>
              ) : (
                <div className="ap-res-opciones">
                  {tipsters.map(t => (
                    <button key={t.id}
                      className={`ap-res-btn ${asignModal.tipster_id === t.id ? 'active' : ''}`}
                      onClick={() => handleAsignarTipster(asignModal.id, t.id, t.nombre)}>
                      {t.nombre}
                      <span style={{ fontSize:10, marginLeft:6, opacity:0.7 }}>
                        ({t.tipo_usuario} · {parseFloat(t.vortex_score||0).toFixed(1)} pts)
                      </span>
                    </button>
                  ))}
                </div>
              );
            })()}

            <div className="ap-modal-actions" style={{ marginTop:16 }}>
              {asignModal.tipster_id && (
                <button className="ap-btn-rechazar"
                  onClick={() => handleAsignarTipster(asignModal.id, null, null)}>
                  🗑 Quitar tipster
                </button>
              )}
              <button className="ap-btn-cancel" onClick={() => setAsignModal(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── MODAL REGISTRAR RESULTADO ────────────────────────────────────────────────
function ResultadoModal({ evento, token, onClose, onResolved }) {
  const teamA    = evento.home_team || 'Opción A';
  const teamB    = evento.away_team || 'Opción B';
  const opciones = [
    `${teamA} gana`,
    `${teamB} gana`,
    'Empate',
    teamA,
    teamB,
  ];

  const [opcion,   setOpcion]   = useState('');
  const [custom,   setCustom]   = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleSubmit() {
    const resultado = opcion === '__custom__' ? custom.trim() : opcion;
    if (!resultado) { setError('Selecciona o escribe el resultado'); return; }
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`/api/events/${evento.id}/resultado`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ resultado }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onResolved({ ...evento, resultado, status: 'finished' }, data.auditoria);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="ap-modal-overlay" onClick={onClose}>
      <div className="ap-modal" onClick={e => e.stopPropagation()}>
        <div className="ap-modal-title">🏁 Registrar Resultado</div>
        <div className="ap-modal-sub">
          <strong>{evento.home_team} vs {evento.away_team}</strong>
          {evento.league && <span style={{ color: 'var(--text-dim)', marginLeft: 8 }}>{evento.league}</span>}
        </div>

        <div className="ap-res-opciones">
          {opciones.map(op => (
            <button key={op}
              className={`ap-res-btn ${opcion === op ? 'active' : ''}`}
              onClick={() => { setOpcion(op); setCustom(''); setError(''); }}>
              {op}
            </button>
          ))}
          <button
            className={`ap-res-btn ap-res-btn-custom ${opcion === '__custom__' ? 'active' : ''}`}
            onClick={() => { setOpcion('__custom__'); setError(''); }}>
            ✏️ Otro
          </button>
        </div>

        {opcion === '__custom__' && (
          <input className="ap-form-input" style={{ marginTop: 8 }}
            placeholder="Escribe el resultado exacto..."
            value={custom}
            onChange={e => setCustom(e.target.value)}
            autoFocus />
        )}

        {error && <div className="ap-error" style={{ marginTop: 4 }}>{error}</div>}

        <div className="ap-modal-actions" style={{ marginTop: 16 }}>
          <button className="ap-btn-aprobar" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Auditando...' : '✓ Confirmar y Auditar'}
          </button>
          <button className="ap-btn-cancel" onClick={onClose}>Cancelar</button>
        </div>
      </div>
      {/* ── Modal asignar tipster a evento ── */}
      {asignModal && (
        <div className="ap-modal-overlay" onClick={() => setAsignModal(null)}>
          <div className="ap-modal" onClick={e => e.stopPropagation()}>
            <div className="ap-modal-title">👤 Asignar Tipster</div>
            <div className="ap-modal-sub">
              Evento: <strong>
                {asignModal.home_team && asignModal.away_team
                  ? `${asignModal.home_team} vs ${asignModal.away_team}`
                  : asignModal.name}
              </strong>
            </div>

            {(() => {
              const tipsters = usuarios.filter(u =>
                ['tipster','oraculo','admin'].includes(u.tipo_usuario)
              );
              return tipsters.length === 0 ? (
                <div style={{ color:'var(--text-dim)', fontSize:13, padding:'12px 0' }}>
                  No hay tipsters disponibles. Cambia el rol de un usuario primero.
                </div>
              ) : (
                <div className="ap-res-opciones">
                  {tipsters.map(t => (
                    <button key={t.id}
                      className={`ap-res-btn ${asignModal.tipster_id === t.id ? 'active' : ''}`}
                      onClick={() => handleAsignarTipster(asignModal.id, t.id, t.nombre)}>
                      {t.nombre}
                      <span style={{ fontSize:10, marginLeft:6, opacity:0.7 }}>
                        ({t.tipo_usuario} · {parseFloat(t.vortex_score||0).toFixed(1)} pts)
                      </span>
                    </button>
                  ))}
                </div>
              );
            })()}

            <div className="ap-modal-actions" style={{ marginTop:16 }}>
              {asignModal.tipster_id && (
                <button className="ap-btn-rechazar"
                  onClick={() => handleAsignarTipster(asignModal.id, null, null)}>
                  🗑 Quitar tipster
                </button>
              )}
              <button className="ap-btn-cancel" onClick={() => setAsignModal(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const { user, token } = useAuth();

  const [mainTab,  setMainTab]  = useState('retiros');   // 'retiros' | 'eventos' | 'usuarios'
  const [retTab,   setRetTab]   = useState('pending');
  const [evTab,    setEvTab]    = useState('active');

  // Usuarios state
  const [usuarios,    setUsuarios]    = useState([]);
  const [userSearch,  setUserSearch]  = useState('');
  const [userFilter,  setUserFilter]  = useState('all');
  const [roleLoading, setRoleLoading] = useState(null);
  const [asignModal,  setAsignModal]  = useState(null);

  // Retiros state
  const [retiros,       setRetiros]       = useState([]);
  const [retStats,      setRetStats]      = useState(null);
  const [rejectModal,   setRejectModal]   = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');

  // Eventos state
  const [eventos,          setEventos]          = useState([]);
  const [showCreate,       setShowCreate]       = useState(false);
  const [resultModal,      setResultModal]       = useState(null);
  const [auditMsg,         setAuditMsg]          = useState('');
  const [statusLoading,    setStatusLoading]     = useState(null);
  const [regenLoading,     setRegenLoading]      = useState(false);

  // Shared state
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error,         setError]         = useState('');

  useEffect(() => {
    if (user && user.tipo_usuario !== 'admin') window.location.href = '/';
  }, [user]);

  // ── Fetch retiros ──
  const fetchRetiros = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`/api/admin/retiros?status=${retTab}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRetiros(data.retiros || []);
      if (data.stats) setRetStats(data.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [retTab, token]);

  // ── Fetch eventos ──
  const fetchEventos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Admin recibe todos los eventos sin filtro de tiempo — usamos un flag especial
      const res  = await fetch('/api/admin/events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar eventos');
      setEventos(Array.isArray(data) ? data : []);
    } catch (err) {
      // Fallback al endpoint normal si /admin/events no existe aún
      try {
        const res2 = await fetch('/api/events', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data2 = await res2.json();
        setEventos(Array.isArray(data2) ? data2 : []);
      } catch {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (mainTab === 'retiros') fetchRetiros();
    if (mainTab === 'eventos') fetchEventos();
    if (mainTab === 'usuarios') fetchUsuarios();
  }, [mainTab, fetchRetiros, fetchEventos]);

  // ── Aprobar retiro ──
  async function handleAprobar(retiroId) {
    setActionLoading(retiroId + '_aprobar');
    try {
      const res  = await fetch(`/api/admin/retiros/${retiroId}/aprobar`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
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

  // ── Rechazar retiro ──
  async function handleRechazar() {
    if (!rejectModal) return;
    setActionLoading(rejectModal.retiroId + '_rechazar');
    try {
      const res  = await fetch(`/api/admin/retiros/${rejectModal.retiroId}/rechazar`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ motivo: motivoRechazo }),
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

  // ── Cambiar status evento ──
  async function handleStatusEvento(eventoId, newStatus) {
    setStatusLoading(eventoId);
    setError('');
    try {
      const res  = await fetch(`/api/events/${eventoId}/status`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEventos(evs => evs.map(e => e.id === eventoId ? { ...e, status: newStatus } : e));
    } catch (err) {
      setError(err.message);
    } finally {
      setStatusLoading(null);
    }
  }

  // ── Fetch usuarios ──
  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar usuarios');
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ── Cambiar rol ──
  async function handleCambiarRol(userId, nuevoRol) {
    setRoleLoading(userId);
    setError('');
    try {
      const res  = await fetch(`/api/auth/role/${userId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ tipo_usuario: nuevoRol }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsuarios(us => us.map(u => u.id === userId ? { ...u, tipo_usuario: nuevoRol } : u));
      setAuditMsg(`✅ Rol de ${data.usuario?.nombre} actualizado a "${nuevoRol}"`);
      setTimeout(() => setAuditMsg(''), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setRoleLoading(null);
    }
  }

  // ── Asignar tipster_id a evento ──
  async function handleAsignarTipster(eventoId, tipsterId, tipsterNombre) {
    setError('');
    try {
      const res  = await fetch(`/api/events/${eventoId}/tipster`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ tipster_id: tipsterId, tipster_nombre: tipsterNombre }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEventos(evs => evs.map(e =>
        e.id === eventoId ? { ...e, tipster_id: tipsterId, tipster_nombre: tipsterNombre } : e
      ));
      setAsignModal(null);
      setAuditMsg(`✅ Tipster "${tipsterNombre}" asignado al evento`);
      setTimeout(() => setAuditMsg(''), 5000);
    } catch (err) {
      setError(err.message);
    }
  }

  // ── Callback: resultado registrado ──
  function handleResolved(eventoActualizado, auditoria) {
    setResultModal(null);
    setEventos(evs => evs.map(e =>
      e.id === eventoActualizado.id ? eventoActualizado : e
    ));
    setAuditMsg(`✅ Evento finalizado. ${auditoria?.procesados ?? 0} pronóstico(s) auditado(s).`);
    setTimeout(() => setAuditMsg(''), 6000);
  }

  // ── Regenerar sparklines de todos los eventos ──
  async function handleRegenerarFormas() {
    setRegenLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/admin/regenerar-formas', {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAuditMsg('🔄 Regeneración de sparklines iniciada en background. Las gráficas se actualizarán en ~30 segundos.');
      setTimeout(() => setAuditMsg(''), 8000);
    } catch (err) {
      setError(`Error regenerando formas: ${err.message}`);
    } finally {
      setRegenLoading(false);
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

  // Filtrar eventos según sub-tab
  const eventosActivos  = eventos.filter(e => e.status !== 'finished');
  const eventosFinished = eventos.filter(e => e.status === 'finished');
  const eventosVista    = evTab === 'active' ? eventosActivos : eventosFinished;

  return (
    <div className="admin-panel">

      {/* ── Header ── */}
      <div className="ap-header">
        <div>
          <h1 className="ap-title">⚙️ Panel Admin</h1>
          <p className="ap-subtitle">Control total de Vorticex</p>
        </div>
        <button className="ap-refresh"
          onClick={() => mainTab === 'retiros' ? fetchRetiros() : mainTab === 'eventos' ? fetchEventos() : fetchUsuarios()}
          disabled={loading}>
          {loading ? '⟳' : '↺'} Actualizar
        </button>
      </div>

      {/* ── Main tabs ── */}
      <div className="ap-main-tabs">
        <button className={`ap-main-tab ${mainTab === 'retiros' ? 'active' : ''}`}
          onClick={() => setMainTab('retiros')}>
          💸 Retiros de Tipsters
        </button>
        <button className={`ap-main-tab ${mainTab === 'eventos' ? 'active' : ''}`}
          onClick={() => setMainTab('eventos')}>
          🗓 Gestión de Eventos
        </button>
        <button className={`ap-main-tab ${mainTab === 'usuarios' ? 'active' : ''}`}
          onClick={() => setMainTab('usuarios')}>
          👥 Usuarios & Tipsters
        </button>
      </div>

      {error     && <div className="ap-error">{error}</div>}
      {auditMsg  && <div className="ap-audit-msg">{auditMsg}</div>}

      {/* ══════════════════════════════════════════
          SECCIÓN: RETIROS
      ══════════════════════════════════════════ */}
      {mainTab === 'retiros' && (
        <>
          {retStats && (
            <div className="ap-stats-grid">
              <div className="ap-stat-card">
                <div className="ap-stat-val gold">{retStats.pendientes || 0}</div>
                <div className="ap-stat-label">Pendientes</div>
              </div>
              <div className="ap-stat-card">
                <div className="ap-stat-val green">{retStats.aprobados || 0}</div>
                <div className="ap-stat-label">Pagados</div>
              </div>
              <div className="ap-stat-card">
                <div className="ap-stat-val">${Number(retStats.total_pendiente || 0).toFixed(2)}</div>
                <div className="ap-stat-label">Total pendiente</div>
              </div>
              <div className="ap-stat-card">
                <div className="ap-stat-val">${Number(retStats.total_pagado || 0).toFixed(2)}</div>
                <div className="ap-stat-label">Total pagado</div>
              </div>
            </div>
          )}

          <div className="ap-tabs">
            {['pending', 'all'].map(t => (
              <button key={t}
                className={`ap-tab ${retTab === t ? 'ap-tab-active' : ''}`}
                onClick={() => setRetTab(t)}>
                {t === 'pending' ? 'Pendientes' : 'Todos'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="ap-loading">Cargando retiros...</div>
          ) : retiros.length === 0 ? (
            <div className="ap-empty">
              {retTab === 'pending' ? '✅ No hay retiros pendientes' : 'No hay retiros registrados'}
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
                          <div className="ap-mini-avatar">{r.tipster_nombre?.[0]?.toUpperCase() || '?'}</div>
                          <span>{r.tipster_nombre}</span>
                        </td>
                        <td className="ap-cell-mono">{r.metodo_pago}</td>
                        <td className="ap-cell-monto">${Number(r.monto).toFixed(2)}</td>
                        <td>
                          <span className="ap-status-badge"
                            style={{ color: st.color, borderColor: st.color + '55', background: st.color + '18' }}>
                            {st.label}
                          </span>
                        </td>
                        <td className="ap-cell-date">{fmtDate(r.created_at)}</td>
                        <td className="ap-cell-date">{fmtDate(r.paid_at)}</td>
                        <td>
                          {r.status === 'pending' ? (
                            <div className="ap-actions">
                              <button className="ap-btn-aprobar"
                                onClick={() => handleAprobar(r.id)}
                                disabled={!!actionLoading}>
                                {actionLoading === r.id + '_aprobar' ? '...' : '✓ Aprobar'}
                              </button>
                              <button className="ap-btn-rechazar"
                                onClick={() => { setRejectModal({ retiroId: r.id, tipsterNombre: r.tipster_nombre }); setMotivoRechazo(''); }}
                                disabled={!!actionLoading}>
                                ✕ Rechazar
                              </button>
                            </div>
                          ) : <span className="ap-no-action">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════
          SECCIÓN: EVENTOS
      ══════════════════════════════════════════ */}
      {mainTab === 'eventos' && (
        <>
          <div className="ap-eventos-toolbar">
            <div className="ap-tabs" style={{ marginBottom: 0 }}>
              <button className={`ap-tab ${evTab === 'active' ? 'ap-tab-active' : ''}`}
                onClick={() => setEvTab('active')}>
                Activos ({eventosActivos.length})
              </button>
              <button className={`ap-tab ${evTab === 'finished' ? 'ap-tab-active' : ''}`}
                onClick={() => setEvTab('finished')}>
                Finalizados ({eventosFinished.length})
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="ap-btn-regen"
                onClick={handleRegenerarFormas}
                disabled={regenLoading}
                title="Regenera las gráficas sparkline de todos los eventos activos"
              >
                {regenLoading ? '⏳ Regenerando...' : '📊 Regenerar Sparklines'}
              </button>
              <button className="ap-btn-crear" onClick={() => setShowCreate(true)}>
                ➕ Nuevo Evento
              </button>
            </div>
          </div>

          {loading ? (
            <div className="ap-loading">Cargando eventos...</div>
          ) : eventosVista.length === 0 ? (
            <div className="ap-empty">
              {evTab === 'active'
                ? 'No hay eventos activos. ¡Crea uno!'
                : 'No hay eventos finalizados.'}
            </div>
          ) : (
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>Evento</th>
                    <th>Liga</th>
                    <th>Tipo</th>
                    <th>Inicio</th>
                    <th>Status</th>
                    {evTab === 'finished' && <th>Resultado</th>}
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {eventosVista.map(ev => {
                    const st  = EVENT_STATUS_LABELS[ev.status] || EVENT_STATUS_LABELS.upcoming;
                    const nombre = ev.home_team && ev.away_team
                      ? `${ev.home_team} vs ${ev.away_team}`
                      : ev.name;
                    const isChanging = statusLoading === ev.id;

                    return (
                      <tr key={ev.id}>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{nombre}</div>
                          {ev.name && ev.home_team && (
                            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{ev.name}</div>
                          )}
                        </td>
                        <td className="ap-cell-date">{ev.league || '—'}</td>
                        <td>
                          <span className={`ap-type-badge ap-type-${ev.type}`}>
                            {ev.type === 'politics' ? '🏛 Política' : '⚽ Deporte'}
                          </span>
                        </td>
                        <td className="ap-cell-date">{fmtDate(ev.start_time)}</td>
                        <td>
                          <span className="ap-status-badge"
                            style={{ color: st.color, borderColor: st.color + '55', background: st.color + '18' }}>
                            {st.label}
                          </span>
                        </td>
                        {evTab === 'finished' && (
                          <td>
                            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 13, color: 'var(--gold)' }}>
                              {ev.resultado || '—'}
                            </span>
                          </td>
                        )}
                        <td>
                          <div className="ap-actions">
                            {/* Cambio de status — solo en activos */}
                            {ev.status === 'upcoming' && (
                              <button className="ap-btn-status ap-btn-live"
                                onClick={() => handleStatusEvento(ev.id, 'live')}
                                disabled={isChanging}>
                                {isChanging ? '...' : '▶ En vivo'}
                              </button>
                            )}
                            {ev.status === 'live' && (
                              <button className="ap-btn-status ap-btn-upcoming"
                                onClick={() => handleStatusEvento(ev.id, 'upcoming')}
                                disabled={isChanging}>
                                {isChanging ? '...' : '⏸ Pausar'}
                              </button>
                            )}
                            {/* Registrar resultado — solo si no está finished */}
                            {ev.status !== 'finished' && (
                              <button className="ap-btn-resultado"
                                onClick={() => setResultModal(ev)}>
                                🏁 Resultado
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════
          SECCIÓN: USUARIOS & TIPSTERS
      ══════════════════════════════════════════ */}
      {mainTab === 'usuarios' && (
        <>
          <div className="ap-usuarios-toolbar">
            <input
              className="ap-user-search"
              type="text"
              placeholder="Buscar por nombre o email..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
            />
            <div className="ap-tabs" style={{ marginBottom: 0 }}>
              {['all','free','tipster','premium','oraculo','admin'].map(f => (
                <button key={f}
                  className={`ap-tab ${userFilter === f ? 'ap-tab-active' : ''}`}
                  onClick={() => setUserFilter(f)}>
                  {f === 'all' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="ap-loading">Cargando usuarios...</div>
          ) : (
            (() => {
              const filtrados = usuarios.filter(u => {
                const matchFilter = userFilter === 'all' || u.tipo_usuario === userFilter;
                const matchSearch = !userSearch ||
                  u.nombre?.toLowerCase().includes(userSearch.toLowerCase()) ||
                  u.email?.toLowerCase().includes(userSearch.toLowerCase());
                return matchFilter && matchSearch;
              });

              return filtrados.length === 0 ? (
                <div className="ap-empty">No hay usuarios con ese criterio</div>
              ) : (
                <div className="ap-table-wrap">
                  <table className="ap-table">
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Email</th>
                        <th>Rol Actual</th>
                        <th>VortexScore</th>
                        <th>Cambiar Rol</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtrados.map(u => {
                        const ROL_COLOR = {
                          free:'#6b7280', tipster:'#f5a623',
                          premium:'#3b82f6', oraculo:'#e01a1a', admin:'#8b5cf6',
                        };
                        const color = ROL_COLOR[u.tipo_usuario] || '#6b7280';
                        return (
                          <tr key={u.id}>
                            <td className="ap-cell-tipster">
                              <div className="ap-mini-avatar">
                                {u.nombre?.[0]?.toUpperCase() || '?'}
                              </div>
                              <span style={{ fontWeight: 600 }}>{u.nombre}</span>
                            </td>
                            <td className="ap-cell-mono">{u.email}</td>
                            <td>
                              <span className="ap-status-badge"
                                style={{ color, borderColor: color+'55', background: color+'18' }}>
                                {u.tipo_usuario}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontFamily:"'Share Tech Mono',monospace",
                                color:'var(--gold)', fontSize:14 }}>
                                {parseFloat(u.vortex_score||0).toFixed(1)}
                              </span>
                            </td>
                            <td>
                              <div className="ap-rol-select-wrap">
                                <select
                                  className="ap-form-select"
                                  style={{ padding:'5px 8px', fontSize:12 }}
                                  value={u.tipo_usuario}
                                  disabled={roleLoading === u.id}
                                  onChange={e => handleCambiarRol(u.id, e.target.value)}
                                >
                                  {['free','tipster','premium','oraculo','admin'].map(r => (
                                    <option key={r} value={r}>{r}</option>
                                  ))}
                                </select>
                                {roleLoading === u.id && (
                                  <span style={{ fontSize:11, color:'var(--text-dim)' }}>
                                    Guardando...
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()
          )}

          {/* Sub-sección: asignar tipster a eventos activos */}
          <div className="tp-section-title" style={{ marginTop: 8 }}>
            🎯 Asignar Tipster a Eventos
          </div>
          <p style={{ fontSize:13, color:'var(--text-dim)', marginBottom: 8 }}>
            Selecciona un evento activo y asígnale un tipster para que su pick aparezca en el MarketCard.
          </p>
          {(() => {
            const eventosActivos = eventos.filter(e => e.status !== 'finished');
            return eventosActivos.length === 0 ? (
              <div className="ap-empty" style={{ padding:24 }}>
                No hay eventos activos. Crea uno en "Gestión de Eventos".
              </div>
            ) : (
              <div className="ap-table-wrap">
                <table className="ap-table">
                  <thead>
                    <tr>
                      <th>Evento</th>
                      <th>Liga</th>
                      <th>Tipster Asignado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventosActivos.map(ev => {
                      const nombre = ev.home_team && ev.away_team
                        ? `${ev.home_team} vs ${ev.away_team}` : ev.name;
                      return (
                        <tr key={ev.id}>
                          <td style={{ fontWeight:600, fontSize:13 }}>{nombre}</td>
                          <td className="ap-cell-date">{ev.league || '—'}</td>
                          <td>
                            {ev.tipster_nombre ? (
                              <span style={{ color:'var(--gold)', fontSize:13, fontWeight:600 }}>
                                ✅ {ev.tipster_nombre}
                              </span>
                            ) : (
                              <span style={{ color:'var(--text-dim)', fontSize:12 }}>
                                Sin asignar
                              </span>
                            )}
                          </td>
                          <td>
                            <button className="ap-btn-resultado"
                              onClick={() => setAsignModal(ev)}>
                              👤 Asignar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </>
      )}

      {/* ── Modal rechazar retiro ── */}
      {rejectModal && (
        <div className="ap-modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="ap-modal" onClick={e => e.stopPropagation()}>
            <div className="ap-modal-title">Rechazar retiro</div>
            <div className="ap-modal-sub">Tipster: <strong>{rejectModal.tipsterNombre}</strong></div>
            <textarea className="ap-modal-input"
              placeholder="Motivo del rechazo (opcional)..."
              value={motivoRechazo}
              onChange={e => setMotivoRechazo(e.target.value)}
              rows={3} />
            <div className="ap-modal-actions">
              <button className="ap-btn-rechazar" onClick={handleRechazar} disabled={!!actionLoading}>
                {actionLoading ? '...' : 'Confirmar rechazo'}
              </button>
              <button className="ap-btn-cancel" onClick={() => setRejectModal(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal crear evento ── */}
      {showCreate && (
        <CreateEventModal
          token={token}
          onClose={() => setShowCreate(false)}
          onCreated={ev => {
            setShowCreate(false);
            setEventos(evs => [{ ...ev, status: 'upcoming' }, ...evs]);
            setEvTab('active');
          }}
        />
      )}

      {/* ── Modal registrar resultado ── */}
      {resultModal && (
        <ResultadoModal
          evento={resultModal}
          token={token}
          onClose={() => setResultModal(null)}
          onResolved={handleResolved}
        />
      )}
      {/* ── Modal asignar tipster a evento ── */}
      {asignModal && (
        <div className="ap-modal-overlay" onClick={() => setAsignModal(null)}>
          <div className="ap-modal" onClick={e => e.stopPropagation()}>
            <div className="ap-modal-title">👤 Asignar Tipster</div>
            <div className="ap-modal-sub">
              Evento: <strong>
                {asignModal.home_team && asignModal.away_team
                  ? `${asignModal.home_team} vs ${asignModal.away_team}`
                  : asignModal.name}
              </strong>
            </div>

            {(() => {
              const tipsters = usuarios.filter(u =>
                ['tipster','oraculo','admin'].includes(u.tipo_usuario)
              );
              return tipsters.length === 0 ? (
                <div style={{ color:'var(--text-dim)', fontSize:13, padding:'12px 0' }}>
                  No hay tipsters disponibles. Cambia el rol de un usuario primero.
                </div>
              ) : (
                <div className="ap-res-opciones">
                  {tipsters.map(t => (
                    <button key={t.id}
                      className={`ap-res-btn ${asignModal.tipster_id === t.id ? 'active' : ''}`}
                      onClick={() => handleAsignarTipster(asignModal.id, t.id, t.nombre)}>
                      {t.nombre}
                      <span style={{ fontSize:10, marginLeft:6, opacity:0.7 }}>
                        ({t.tipo_usuario} · {parseFloat(t.vortex_score||0).toFixed(1)} pts)
                      </span>
                    </button>
                  ))}
                </div>
              );
            })()}

            <div className="ap-modal-actions" style={{ marginTop:16 }}>
              {asignModal.tipster_id && (
                <button className="ap-btn-rechazar"
                  onClick={() => handleAsignarTipster(asignModal.id, null, null)}>
                  🗑 Quitar tipster
                </button>
              )}
              <button className="ap-btn-cancel" onClick={() => setAsignModal(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

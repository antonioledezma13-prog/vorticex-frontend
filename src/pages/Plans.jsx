// src/pages/Plans.jsx
// v2 — guarda vx_tipo_pago en sessionStorage antes de redirigir a PayPal
//       para que PaymentSuccess.jsx sepa qué endpoint de capture usar
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Plans.css';

const PLANES = [
  {
    id:       'free',
    nombre:   'Free',
    precio:   '$0',
    periodo:  '',
    color:    '#6b7280',
    icon:     '👁',
    features: [
      'Resultados de eventos pasados',
      'Pronósticos de Novatos',
      'Leaderboard público',
      'Registro gratuito',
    ],
    locked: [
      'Cerebro IA',
      'Tipsters Pro y Oráculo',
      'Odds en tiempo real',
    ],
  },
  {
    id:       'premium',
    nombre:   'Premium',
    precio:   '$9.99',
    periodo:  '/mes',
    color:    '#f5a623',
    icon:     '🧠',
    popular:  true,
    features: [
      'Todo lo de Free',
      'Cerebro IA completo',
      'Probabilidades en tiempo real',
      'Analytics avanzados',
      'Odds actualizados',
    ],
    locked: [
      'Picks de Tipsters Oráculo',
    ],
  },
  {
    id:       'oraculo',
    nombre:   'Oráculo',
    precio:   '$19.99',
    periodo:  '/mes',
    color:    '#e01a1a',
    icon:     '🔮',
    features: [
      'Todo lo de Premium',
      'Acceso a Tipsters Pro y Oráculo',
      'Análisis combinado IA + Humano',
      'Alertas de picks exclusivos',
      'Prioridad en soporte',
    ],
    locked: [],
  },
];

export default function Plans({ onOpenAuth }) {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(null);
  const [error,   setError]   = useState('');

  async function handleSubscribe(planId) {
    if (!user) { onOpenAuth(); return; }
    if (planId === 'free') return;

    setLoading(planId);
    setError('');

    try {
      const res = await fetch('/api/payments/subscription/create', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // ── CRÍTICO: marcar tipo de pago antes de salir a PayPal ──
      sessionStorage.setItem('vx_tipo_pago', 'subscription');

      window.location.href = data.approvalUrl;

    } catch (err) {
      setError(err.message);
      setLoading(null);
    }
  }

  const planActual = user?.tipo_usuario || 'free';

  return (
    <div className="plans-page">
      <div className="plans-header">
        <h1 className="plans-title">
          Elige tu <span className="plans-title-gold">Plan</span>
        </h1>
        <p className="plans-subtitle">
          Accede al análisis más preciso del mercado — IA + Humanos Auditados
        </p>
      </div>

      {error && <div className="plans-error">{error}</div>}

      <div className="plans-grid">
        {PLANES.map(plan => (
          <div
            key={plan.id}
            className={`plan-card card ${plan.popular ? 'plan-popular' : ''} ${planActual === plan.id ? 'plan-active' : ''}`}
            style={{ '--plan-color': plan.color }}
          >
            {plan.popular && <div className="plan-badge-popular">Más Popular</div>}
            {planActual === plan.id && <div className="plan-badge-active">Tu Plan Actual</div>}

            <div className="plan-icon">{plan.icon}</div>
            <div className="plan-nombre">{plan.nombre}</div>
            <div className="plan-precio">
              <span className="plan-precio-val">{plan.precio}</span>
              <span className="plan-precio-periodo">{plan.periodo}</span>
            </div>

            <ul className="plan-features">
              {plan.features.map((f, i) => (
                <li key={i} className="plan-feature plan-feature-ok">
                  <span className="pf-icon">✓</span>{f}
                </li>
              ))}
              {plan.locked.map((f, i) => (
                <li key={i} className="plan-feature plan-feature-lock">
                  <span className="pf-icon">🔒</span>{f}
                </li>
              ))}
            </ul>

            <button
              className={`plan-btn ${plan.id === 'free' ? 'plan-btn-free' : 'plan-btn-paid'}`}
              style={plan.id !== 'free' ? { background: `linear-gradient(135deg, ${plan.color}, ${plan.color}99)` } : {}}
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading === plan.id || planActual === plan.id}
            >
              {loading === plan.id ? 'Procesando...'
                : planActual === plan.id ? 'Plan Actual'
                : plan.id === 'free'     ? 'Comenzar Gratis'
                : `Suscribirse — ${plan.precio}${plan.periodo}`}
            </button>

            {plan.id !== 'free' && (
              <div className="plan-paypal-note">
                <img
                  src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg"
                  alt="PayPal"
                  style={{ height: 16 }}
                />
                Pago seguro con PayPal
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pick individual info */}
      <div className="pick-info-card card">
        <div className="pick-info-icon">🎯</div>
        <div className="pick-info-body">
          <div className="pick-info-title">Pick Individual — $2.00</div>
          <div className="pick-info-desc">
            ¿No quieres suscribirte? Compra el análisis de un evento específico.
            Incluye el análisis del Cerebro IA + el pronóstico del Tipster elegido.
            El 80% va directamente al Tipster.
          </div>
        </div>
      </div>
    </div>
  );
}

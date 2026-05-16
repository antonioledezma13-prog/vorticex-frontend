// src/pages/PaymentCancel.jsx
// Página a la que PayPal redirige cuando el usuario cancela el pago
import React from 'react';
import './PaymentResult.css';

export default function PaymentCancel() {
  const goPlans = () => window.location.href = '/planes';
  const goHome  = () => window.location.href = '/';

  return (
    <div className="payment-result-page">
      <div className="pr-card card">
        <div className="pr-icon">↩️</div>
        <div className="pr-title" style={{ color: 'var(--text-secondary)' }}>
          Pago cancelado
        </div>
        <div className="pr-sub">
          No se realizó ningún cargo. Puedes intentarlo de nuevo cuando quieras.
        </div>
        <button className="btn-primary pr-btn" onClick={goPlans}>
          Ver Planes
        </button>
        <button className="btn-secondary pr-btn" onClick={goHome}
          style={{ marginTop: 8 }}>
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

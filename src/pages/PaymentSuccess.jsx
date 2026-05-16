// src/pages/PaymentSuccess.jsx
// Detecta automáticamente si es suscripción o pick via sessionStorage
// Idempotente: no re-captura si ya fue procesado en esta sesión
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import './PaymentResult.css';

export default function PaymentSuccess() {
  const { token, login } = useAuth();
  const [status,  setStatus]  = useState('processing');
  const [message, setMessage] = useState('');
  const [detail,  setDetail]  = useState('');
  const capturedRef = useRef(false); // evita doble capture en StrictMode / recarga

  useEffect(() => {
    if (capturedRef.current) return;
    capturedRef.current = true;

    const params  = new URLSearchParams(window.location.search);
    const orderId = params.get('token'); // PayPal siempre pasa el orderId como "token"

    if (!orderId) {
      setStatus('error');
      setMessage('No se recibió el ID de la orden.');
      return;
    }

    // Idempotencia: si ya procesamos esta orden en esta sesión, no volver a hacerlo
    const processedKey = `vx_captured_${orderId}`;
    if (sessionStorage.getItem(processedKey)) {
      setStatus('success');
      setMessage(sessionStorage.getItem(`${processedKey}_msg`) || '¡Pago ya procesado!');
      return;
    }

    // Detectar tipo de pago desde sessionStorage (guardado antes de redirigir a PayPal)
    const tipoPago   = sessionStorage.getItem('vx_tipo_pago') || 'subscription'; // 'subscription' | 'pick'
    const pickMeta   = tipoPago === 'pick'
      ? JSON.parse(sessionStorage.getItem('vx_pick_meta') || '{}')
      : null;

    async function capture() {
      try {
        let endpoint, body;

        if (tipoPago === 'pick') {
          endpoint = '/api/payments/pick/capture';
          body     = { orderId };
        } else {
          endpoint = '/api/payments/subscription/capture';
          body     = { orderId };
        }

        const res  = await fetch(endpoint, {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Error al procesar el pago');

        const successMsg = data.message || '¡Pago procesado exitosamente!';

        // Marcar como procesado en esta sesión
        sessionStorage.setItem(processedKey, '1');
        sessionStorage.setItem(`${processedKey}_msg`, successMsg);
        sessionStorage.removeItem('vx_tipo_pago');
        sessionStorage.removeItem('vx_pick_meta');

        setStatus('success');
        setMessage(successMsg);

        if (tipoPago === 'pick' && data.eventId) {
          setDetail(`Evento #${data.eventId} desbloqueado — Tipster recibió $${data.tipsterCut}`);
        }

        // Refrescar perfil del usuario (solo en suscripciones cambia el rol)
        if (tipoPago === 'subscription') {
          const resMe = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resMe.ok) {
            const userData = await resMe.json();
            login(userData, token);
          }
        }

      } catch (err) {
        setStatus('error');
        setMessage(err.message);
      }
    }

    capture();
  }, [token, login]);

  const goHome   = () => window.location.href = '/';
  const goPlans  = () => window.location.href = '/planes';

  return (
    <div className="payment-result-page">
      <div className="pr-card card">
        {status === 'processing' && (
          <>
            <div className="pr-icon spin">⚙️</div>
            <div className="pr-title">Procesando pago...</div>
            <div className="pr-sub">Estamos confirmando tu transacción con PayPal</div>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="pr-icon">✅</div>
            <div className="pr-title gold">¡Pago exitoso!</div>
            <div className="pr-sub">{message}</div>
            {detail && <div className="pr-detail">{detail}</div>}
            <button className="btn-primary pr-btn" onClick={goHome}>
              Ir al Dashboard
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="pr-icon">❌</div>
            <div className="pr-title red">Error en el pago</div>
            <div className="pr-sub">{message || 'Ocurrió un error. Contacta soporte.'}</div>
            <button className="btn-secondary pr-btn" onClick={goPlans}>
              Volver a Planes
            </button>
          </>
        )}
      </div>
    </div>
  );
}

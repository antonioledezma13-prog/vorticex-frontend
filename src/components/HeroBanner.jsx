import React from 'react';
import VortexCanvas from './VortexCanvas';
import heroBg from '../hero-bg.png';
import './HeroBanner.css';

export default function HeroBanner() {
  return (
    <div className="hero-banner">

      {/* Imagen de fondo: futbolista + capitolio */}
      <div
        className="hero-bg-image"
        style={{ backgroundImage: `url(${heroBg})` }}
      />

      {/* Canvas vórtice encima de la imagen */}
      <VortexCanvas />

      {/* Overlay degradado para legibilidad del texto */}
      <div className="hero-overlay" />

      {/* Contenido */}
      <div className="hero-content">
        <div className="hero-tag">
          <span className="hero-tag-dot" />
          Live Markets Open
        </div>
        <h1 className="hero-heading">
          REAL PREDICTIONS.<br />
          <span className="hero-heading-red">REAL IMPACT.</span>
        </h1>
        <p className="hero-sub">
          Predict sports outcomes and political events.<br />
          Compete, earn points, and stay ahead.
        </p>
        <div className="hero-ctas">
          <button className="btn-primary">Start Predicting</button>
          <button className="btn-secondary">View Markets</button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="hero-stats">
        <div className="hero-stat">
          <span className="hstat-val">24</span>
          <span className="hstat-key">Active Markets</span>
        </div>
        <div className="hero-stat-divider" />
        <div className="hero-stat">
          <span className="hstat-val">8,457</span>
          <span className="hstat-key">Total Predictions</span>
        </div>
        <div className="hero-stat-divider" />
        <div className="hero-stat">
          <span className="hstat-val">3</span>
          <span className="hstat-key">Live Now</span>
        </div>
      </div>

    </div>
  );
}

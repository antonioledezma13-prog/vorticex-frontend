import React, { useRef, useEffect } from 'react';
import HeatmapCanvas from './HeatmapCanvas';
import './GlobalTrends.css';

function ActivityChart({ width = 200, height = 60 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    // Generate 3 lines
    const series = [
      { color: '#e01a1a', data: [], base: 0.6 },
      { color: '#f5a623', data: [], base: 0.45 },
      { color: 'rgba(245,166,35,0.35)', data: [], base: 0.3 },
    ];
    const LEN = 40;
    series.forEach(s => {
      let v = s.base;
      for (let i = 0; i < LEN; i++) {
        v = Math.max(0.05, Math.min(0.95, v + (Math.random() - 0.5) * 0.12));
        s.data.push(v);
      }
    });

    let offset = 0;

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const pad = 4;

      series.forEach(s => {
        const pts = s.data.map((v, i) => ({
          x: pad + (i / (LEN - 1)) * (width - pad * 2),
          y: pad + (1 - v) * (height - pad * 2)
        }));

        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          const cpx = (pts[i - 1].x + pts[i].x) / 2;
          ctx.bezierCurveTo(cpx, pts[i - 1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
        }
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Animate: shift last point
        const last = s.data[LEN - 1];
        const next = Math.max(0.05, Math.min(0.95, last + (Math.random() - 0.5) * 0.06));
        s.data.push(next);
        s.data.shift();
      });

      offset++;
      animRef.current = setTimeout(() => {
        animRef.current = requestAnimationFrame(draw);
      }, 120);
    }

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      clearTimeout(animRef.current);
    };
  }, [width, height]);

  return <canvas ref={canvasRef} style={{ display: 'block', borderRadius: 6 }} />;
}

export default function GlobalTrends() {
  return (
    <div className="global-trends card">
      <div className="section-header">
        <div className="section-title">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z"/>
          </svg>
          Global Trends
        </div>
        <button className="view-all">↔</button>
      </div>

      <div className="gt-grid">
        <div className="gt-block">
          <div className="gt-label">Prediction Activity</div>
          <HeatmapCanvas width={148} height={72} cellSize={10} />
        </div>
        <div className="gt-block">
          <div className="gt-label">Activity Over Time</div>
          <ActivityChart width={196} height={72} />
        </div>
      </div>
    </div>
  );
}

import React, { useRef, useEffect } from 'react';

export default function Sparkline({ data, color = '#f5a623', height = 50, width = 160 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length < 2) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pad = 4;

    const points = data.map((v, i) => ({
      x: pad + (i / (data.length - 1)) * (width - pad * 2),
      y: pad + (1 - (v - min) / range) * (height - pad * 2)
    }));

    // Fill gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, color.replace(')', ', 0.3)').replace('rgb', 'rgba'));
    grad.addColorStop(1, color.replace(')', ', 0)').replace('rgb', 'rgba'));

    ctx.beginPath();
    ctx.moveTo(points[0].x, height);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, height);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      ctx.bezierCurveTo(cpx, prev.y, cpx, curr.y, curr.x, curr.y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Last point dot
    const last = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }, [data, color, width, height]);

  return <canvas ref={canvasRef} style={{ display: 'block' }} />;
}

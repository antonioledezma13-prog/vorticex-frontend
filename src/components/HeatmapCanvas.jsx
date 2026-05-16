import React, { useRef, useEffect } from 'react';

export default function HeatmapCanvas({ width = 160, height = 80, cellSize = 12 }) {
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

    const cols = Math.floor(width / (cellSize + 2));
    const rows = Math.floor(height / (cellSize + 2));
    let t = 0;

    const cells = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => ({
        base: Math.random(),
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.04,
      }))
    );

    function getColor(v) {
      // 0 → dark, 0.5 → orange, 1 → bright gold/red
      if (v < 0.3) return `rgba(30, 10, 0, ${0.3 + v})`;
      if (v < 0.6) {
        const r = Math.floor(180 + v * 70);
        const g = Math.floor(80 + v * 60);
        return `rgba(${r}, ${g}, 10, 0.85)`;
      }
      const r = 240;
      const g = Math.floor(100 + (v - 0.6) * 200);
      return `rgba(${r}, ${g}, 20, 0.95)`;
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = cells[r][c];
          const v = cell.base * 0.5 + 0.5 * (0.5 + 0.5 * Math.sin(t * cell.speed + cell.phase));
          ctx.fillStyle = getColor(v);
          ctx.beginPath();
          ctx.roundRect(
            c * (cellSize + 2),
            r * (cellSize + 2),
            cellSize, cellSize, 2
          );
          ctx.fill();
        }
      }
      t += 1;
      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, cellSize]);

  return <canvas ref={canvasRef} style={{ display: 'block', borderRadius: 6 }} />;
}

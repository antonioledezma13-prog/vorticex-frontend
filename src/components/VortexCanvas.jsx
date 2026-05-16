import React, { useRef, useEffect } from 'react';

export default function VortexCanvas({ style }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    // Particles
    const PARTICLE_COUNT = 180;
    const particles = [];

    function createParticle(i) {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
      const radius = 60 + Math.random() * 220;
      return {
        angle: angle + Math.random() * 0.5,
        radius,
        baseRadius: radius,
        speed: (0.0004 + Math.random() * 0.0008) * (Math.random() < 0.5 ? 1 : -1),
        size: 0.8 + Math.random() * 2.2,
        opacity: 0.2 + Math.random() * 0.7,
        color: Math.random() < 0.55 ? 'gold' : 'red',
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.008 + Math.random() * 0.012,
        trail: [],
        trailLen: Math.floor(4 + Math.random() * 12),
      };
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle(i));
    }

    // Spiral arms
    const ARMS = 3;

    let t = 0;
    let cx = W / 2;
    let cy = H / 2;

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Deep background radial glow
      const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.6);
      radGrad.addColorStop(0, 'rgba(60, 8, 8, 0.18)');
      radGrad.addColorStop(0.4, 'rgba(40, 20, 0, 0.08)');
      radGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, W, H);

      // Spiral arms
      for (let arm = 0; arm < ARMS; arm++) {
        const armOffset = (arm / ARMS) * Math.PI * 2;
        ctx.beginPath();
        let firstPoint = true;
        for (let r = 20; r < 300; r += 2) {
          const theta = (r / 60) + armOffset + t * 0.3;
          const x = cx + r * Math.cos(theta);
          const y = cy + r * Math.sin(theta);
          const alpha = (1 - r / 300) * 0.07;
          if (firstPoint) { ctx.moveTo(x, y); firstPoint = false; }
          else ctx.lineTo(x, y);
        }
        const armColor = arm % 2 === 0
          ? `rgba(245, 166, 35, ${0.12})`
          : `rgba(224, 26, 26, ${0.1})`;
        ctx.strokeStyle = armColor;
        ctx.lineWidth = arm === 1 ? 1.5 : 1;
        ctx.stroke();
      }

      // Particles
      particles.forEach(p => {
        p.angle += p.speed;
        p.wobble += p.wobbleSpeed;
        const wobbleR = p.baseRadius + Math.sin(p.wobble) * 18;
        const x = cx + wobbleR * Math.cos(p.angle);
        const y = cy + wobbleR * Math.sin(p.angle);

        // Trail
        p.trail.push({ x, y });
        if (p.trail.length > p.trailLen) p.trail.shift();

        if (p.trail.length > 1) {
          for (let i = 1; i < p.trail.length; i++) {
            const ratio = i / p.trail.length;
            const trailAlpha = p.opacity * ratio * 0.45;
            ctx.beginPath();
            ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y);
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
            ctx.strokeStyle = p.color === 'gold'
              ? `rgba(255, 200, 30, ${trailAlpha})`
              : `rgba(224, 50, 30, ${trailAlpha})`;
            ctx.lineWidth = p.size * ratio;
            ctx.stroke();
          }
        }

        // Core dot
        const grd = ctx.createRadialGradient(x, y, 0, x, y, p.size * 3);
        if (p.color === 'gold') {
          grd.addColorStop(0, `rgba(255, 215, 50, ${p.opacity})`);
          grd.addColorStop(1, 'rgba(245, 166, 35, 0)');
        } else {
          grd.addColorStop(0, `rgba(255, 80, 50, ${p.opacity})`);
          grd.addColorStop(1, 'rgba(180, 20, 20, 0)');
        }
        ctx.beginPath();
        ctx.arc(x, y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      });

      // Center vortex eye glow
      const eyeGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
      eyeGrad.addColorStop(0, 'rgba(255, 100, 20, 0.22)');
      eyeGrad.addColorStop(0.3, 'rgba(200, 80, 10, 0.08)');
      eyeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = eyeGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
      ctx.fill();

      // Rotating ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.4);
      ctx.beginPath();
      ctx.arc(0, 0, 40, 0, Math.PI * 1.5);
      ctx.strokeStyle = `rgba(245, 166, 35, 0.25)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-t * 0.6);
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 1.2);
      ctx.strokeStyle = `rgba(224, 26, 26, 0.3)`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      t += 0.008;
      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
      cx = W / 2;
      cy = H / 2;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        ...style
      }}
    />
  );
}

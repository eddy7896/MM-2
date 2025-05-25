import { useRef, useEffect } from 'react';

const COLORS = [
  '#64ffda', '#5a8fff', '#ff5eae', '#ffe066', '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#D7BAFF'
];
const NUM_BLOBS = 10;

function randomBlob(width, height) {
  const isMobile = window.innerWidth <= 600;
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    r: isMobile ? 50 + Math.random() * 60 : 120 + Math.random() * 120,
    vx: (Math.random() - 0.5) * 0.0002,
    vy: (Math.random() - 0.5) * 0.0002,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    phase: Math.random() * Math.PI * 2,
    freq: 0.002 + Math.random() * 0.0025,
    amp: 30 + Math.random() * 40,
  };
}

export default function BlobsBackground({ colors }) {
  const canvasRef = useRef();
  const blobs = useRef([]);
  const lastColors = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    const palette = colors && colors.length ? colors : COLORS;
    blobs.current = Array.from({ length: NUM_BLOBS }, (_, i) => {
      const blob = randomBlob(width, height);
      blob.color = palette[i % palette.length];
      return blob;
    });
    lastColors.current = palette;
    // Removed unused: mouse, followerIdx, overlapTimes, centerX, centerY
    function animate() {
      const now = Date.now();
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter'; // alpha blending for metaball effect
      // Calculate boids center
      // Removed unused: centerX, centerY
      // If palette changes, update blob colors
      const palette = colors && colors.length ? colors : COLORS;
      if (lastColors.current !== palette && palette.length) {
        blobs.current.forEach((b, i) => { b.color = palette[i % palette.length]; });
        lastColors.current = palette;
      }
      // --- GENTLE REPULSION & METABALL COLOR BLENDING ---
      let overlaps = [];
      for (let i = 0; i < blobs.current.length; ++i) {
        for (let j = i + 1; j < blobs.current.length; ++j) {
          const a = blobs.current[i], b = blobs.current[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const minDist = a.r + b.r - 30;
          const blendDist = Math.min(a.r, b.r);
          if (dist < minDist) {
            // Gentle repulsion
            const force = 0.08;
            const nx = dx / (dist + 1);
            const ny = dy / (dist + 1);
            a.vx += nx * force;
            a.vy += ny * force;
            b.vx -= nx * force;
            b.vy -= ny * force;
            // Only blend colors if centers overlap
            if (dist < blendDist) {
              overlaps.push([i, j, (a.x + b.x) / 2, (a.y + b.y) / 2, Math.min(a.r, b.r) * 0.7]);
            }
          }
        }
      }
      // --- END GENTLE REPULSION ---
      // Draw blobs
      blobs.current.forEach((b, i) => {
        // Animate organic movement
        const speedFactor = window.innerWidth <= 600 ? 0.0004 : 0.0007;
        const angle = b.phase + Math.sin(now * b.freq + i) * 2 + Math.cos(now * b.freq * 0.7 + i * 2) * 2;
        b.x += Math.cos(angle) * b.amp * speedFactor + b.vx;
        b.y += Math.sin(angle) * b.amp * speedFactor + b.vy;

        // Bounce off edges
        if (b.x - b.r < 0 || b.x + b.r > width) b.vx *= -1;
        if (b.y - b.r < 0 || b.y + b.r > height) b.vy *= -1;
        b.x = Math.max(b.r, Math.min(width - b.r, b.x));
        b.y = Math.max(b.r, Math.min(height - b.r, b.y));
        // Draw
        ctx.save();
        ctx.globalAlpha = 0.44;
        ctx.filter = 'blur(56px)';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, 2 * Math.PI);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.restore();
      });
      // Draw metaball color blends at overlaps
      overlaps.forEach(([i, j, x, y, r]) => {
        const ca = blobs.current[i].color;
        const cb = blobs.current[j].color;
        // Blend: average RGB
        function hexToRgb(hex) {
          hex = hex.replace('#','');
          if (hex.length === 3) hex = hex.split('').map(x=>x+x).join('');
          const n = parseInt(hex, 16);
          return [(n>>16)&255, (n>>8)&255, n&255];
        }
        function rgbToHex([r,g,b]) {
          return '#' + [r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');
        }
        const rgbA = hexToRgb(ca), rgbB = hexToRgb(cb);
        const blend = rgbToHex([
          Math.round((rgbA[0]+rgbB[0])/2),
          Math.round((rgbA[1]+rgbB[1])/2),
          Math.round((rgbA[2]+rgbB[2])/2)
        ]);
        // Gentle transition: alpha increases as centers get closer
        const a = blobs.current[i], b = blobs.current[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const blendDist = Math.min(a.r, b.r);
        let strength = 1 - (dist / (blendDist + 1));
        strength = Math.max(0, Math.min(1, strength));
        ctx.save();
        ctx.globalAlpha = 0.18 + 0.47 * strength; // fades from 0.18 to 0.65
        ctx.filter = 'blur(48px)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = blend;
        ctx.fill();
        ctx.restore();
      });
      ctx.restore();
      requestAnimationFrame(animate);
    }
    animate();

    // Resize
    function handleResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

import { useEffect, useRef, useState } from 'react';

const PALETTE = [
  '#003366', '#0a2342', '#1a2a6c', '#2e294e', '#22223b', '#3a506b', '#4b3869', '#4e148c',
  '#2d3142', '#22223b', '#3a0ca3', '#720026', '#540b0e', '#3d405b', '#283618', '#1b263b',
  '#212529', '#232946', '#2c003e', '#2d132c', '#112d32', '#22333b', '#1a535c', '#254441', '#14213d'
];

function randomColor() {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)];
}

export default function AnimatedRainbowText({ text, className }) {
  const [colors, setColors] = useState(() => Array.from(text, randomColor));
  const intervalRef = useRef();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setColors(prev => prev.map((c) => {
        // Gradually change color: 10% chance per letter per tick
        if (Math.random() < 0.1) return randomColor();
        return c;
      }));
    }, 180);
    return () => clearInterval(intervalRef.current);
  }, [text]);

  return (
    <span className={className} style={{display: 'inline-block'}}>
      {Array.from(text).map((ch, idx) => (
        <span
          key={idx}
          style={{
            color: colors[idx],
            transition: 'color 0.7s cubic-bezier(.4,1.6,.4,1)',
            display: ch === ' ' ? 'inline-block' : 'inline',
            minWidth: ch === ' ' ? '0.4em' : undefined
          }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

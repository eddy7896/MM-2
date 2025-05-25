import { useEffect, useRef, useState } from 'react';
import './progress-bar.css';

const PROMPTS = [
  'Analyzing colors...',
  'Extracting fonts...',
  'Detecting UI patterns...',
  'Crunching pixels...',
  'Almost done...'
];

export default function ProgressBar({ loading }) {
  const [progress, setProgress] = useState(0);
  const [promptIdx, setPromptIdx] = useState(0);
  const intervalRef = useRef();

  useEffect(() => {
    if (loading) {
      setProgress(0);
      setPromptIdx(0);
      intervalRef.current = setInterval(() => {
        setProgress(p => (p < 92 ? p + Math.random() * 6 : p));
      }, 220);
      const promptInterval = setInterval(() => {
        setPromptIdx(idx => (idx + 1) % PROMPTS.length);
      }, 1600);
      return () => {
        clearInterval(intervalRef.current);
        clearInterval(promptInterval);
      };
    } else {
      setProgress(100);
      setTimeout(() => setProgress(0), 600);
    }
  }, [loading]);

  return loading ? (
    <div className="progress-bar-outer">
      <div className="progress-bar-inner" style={{ width: progress + '%' }} />
      <div className="progress-bar-prompt">{PROMPTS[promptIdx]}</div>
    </div>
  ) : null;
}

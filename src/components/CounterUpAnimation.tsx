import React, { useState, useEffect } from 'react';

interface CounterUpAnimationProps {
  targetValue: number;
  duration?: number; // optional override in ms
  onComplete?: () => void;
}

export function CounterUpAnimation({ targetValue, duration, onComplete }: CounterUpAnimationProps) {
  const [currentValue, setCurrentValue] = useState(0);

  // Dynamic duration calculation based on amount: larger wins get longer, more dramatic count-ups
  const calculatedDuration = duration || (
    targetValue < 50 ? 1800 :
    targetValue < 200 ? 2800 :
    targetValue < 1000 ? 4200 : 6000 // Huge wins count up for 6 seconds beautifully
  );

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / calculatedDuration, 1);
      
      // Easing function: easeOutQuart (starts briskly, decelerates elegantly with a long, satisfying tail)
      const easeOutProgress = 1 - Math.pow(1 - progress, 4);
      
      setCurrentValue(easeOutProgress * targetValue);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCurrentValue(targetValue);
        if (onComplete) onComplete();
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [targetValue, calculatedDuration, onComplete]);

  return (
    <span className="font-black text-amber-400 drop-shadow-[0_4px_16px_rgba(245,158,11,0.5)]">
      R$ {currentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
}

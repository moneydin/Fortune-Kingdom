import React from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';

interface SpinButtonProps {
  onSpin: () => void;
  isSpinning: boolean;
  label?: string;
  color?: 'gold' | 'red' | 'green' | 'blue' | 'purple';
}

export const SpinButton: React.FC<SpinButtonProps> = ({ onSpin, isSpinning, label = 'Girar', color = 'gold' }) => {
  // Map color options to Tailwind gradients & glows
  const colorMap = {
    gold: {
      glow: 'bg-[#d4af37]',
      border: 'border-[#8b6914]',
      bgGrad: 'from-[#3a2d0b] to-[#0a0a0a]',
      dashed: 'border-[#d4af37]/30',
      dotted: 'border-[#d4af37]/50',
      text: 'text-yellow-400 drop-shadow-[0_2px_4px_rgba(212,175,55,0.4)]',
      icon: 'text-[#d4af37]'
    },
    red: {
      glow: 'bg-red-500',
      border: 'border-red-800',
      bgGrad: 'from-red-950 to-[#0a0a0a]',
      dashed: 'border-red-500/30',
      dotted: 'border-red-400/50',
      text: 'text-red-400 drop-shadow-[0_2px_4px_rgba(239,68,68,0.4)]',
      icon: 'text-red-500'
    },
    green: {
      glow: 'bg-emerald-500',
      border: 'border-emerald-800',
      bgGrad: 'from-emerald-950 to-[#0a0a0a]',
      dashed: 'border-emerald-500/30',
      dotted: 'border-emerald-400/50',
      text: 'text-emerald-400 drop-shadow-[0_2px_4px_rgba(16,185,129,0.4)]',
      icon: 'text-emerald-500'
    },
    blue: {
      glow: 'bg-blue-500',
      border: 'border-blue-800',
      bgGrad: 'from-blue-950 to-[#0a0a0a]',
      dashed: 'border-blue-500/30',
      dotted: 'border-blue-400/50',
      text: 'text-blue-400 drop-shadow-[0_2px_4px_rgba(59,130,246,0.4)]',
      icon: 'text-blue-500'
    },
    purple: {
      glow: 'bg-purple-500',
      border: 'border-purple-800',
      bgGrad: 'from-purple-950 to-[#0a0a0a]',
      dashed: 'border-purple-500/30',
      dotted: 'border-purple-400/50',
      text: 'text-purple-400 drop-shadow-[0_2px_4px_rgba(168,85,247,0.4)]',
      icon: 'text-purple-500'
    }
  };

  const scheme = colorMap[color] || colorMap.gold;

  return (
    <div className="relative group flex items-center justify-center">
      {/* Outer Glow */}
      <div className={`absolute inset-0 ${scheme.glow} rounded-full blur-[15px] sm:blur-[25px] opacity-25 group-hover:opacity-45 transition-opacity duration-500`} />
      
      <button
        onClick={onSpin}
        disabled={isSpinning}
        className={`relative w-18 h-18 sm:w-22 sm:h-22 md:w-26 md:h-26 rounded-full bg-gradient-to-br ${scheme.bgGrad} border-2 sm:border-3 ${scheme.border} shadow-[inset_0_0_15px_rgba(0,0,0,0.6),0_6px_20px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden transition-transform duration-100 hover:scale-105 active:scale-95 disabled:opacity-80 disabled:hover:scale-100 cursor-pointer`}
      >
        {/* Animated Gears/Decorations */}
        <motion.div
          animate={isSpinning ? { rotate: 360 } : { rotate: 0 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className={`absolute inset-0 border-[3px] sm:border-[5px] border-dashed ${scheme.dashed} rounded-full`}
        />
        <motion.div
          animate={isSpinning ? { rotate: -360 } : { rotate: 0 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className={`absolute inset-1.5 sm:inset-2.5 border-[2px] sm:border-[3px] border-dotted ${scheme.dotted} rounded-full`}
        />
        
        {/* Central Gem/Text */}
        <div className="z-10 flex flex-col items-center justify-center px-1">
          <span className={`text-xs sm:text-sm md:text-base font-black tracking-wider sm:tracking-widest uppercase text-center leading-none ${scheme.text}`}>
            {label}
          </span>
          {isSpinning && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="mt-0.5"
            >
              <Zap className={`w-3 h-3 sm:w-4 sm:h-4 ${scheme.icon}`} />
            </motion.div>
          )}
        </div>
      </button>
    </div>
  );
};


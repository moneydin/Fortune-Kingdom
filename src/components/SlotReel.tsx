import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation } from 'motion/react';
import { SymbolType, SymbolImageConfig } from '../types';
import { SlotSymbol } from './SlotSymbol';

interface SlotReelProps {
  isSpinning: boolean;
  resultSymbols: string[];
  delay: number;
  customSymbols?: Partial<Record<string, string>>;
  customSymbolConfigs?: Partial<Record<string, SymbolImageConfig>>;
  winningRows?: number[];
  activeSymbols?: string[];
  noSlotMargins?: boolean;
  cashMultipliers?: number[];
  bet?: number;
  customCashImages?: Record<number, string>;
  isAnticipating?: boolean;
  slotHideGrid?: boolean;
  anticipationColor?: 'gold' | 'red' | 'purple' | 'cyan' | 'neon_green';
}

const ALL_SYMBOLS: string[] = ['King', 'Queen', 'Crown', 'Lion', 'Sword', 'Shield', 'Castle', 'Diamond', 'Coin', 'Dragon'];

const ANTICIPATION_STYLES: Record<string, { ring: string; shadow: string; badgeBg: string; textGlow: string }> = {
  gold: {
    ring: 'ring-4 ring-amber-400 border-amber-300',
    shadow: 'shadow-[0_0_50px_rgba(245,158,11,0.95),inset_0_0_25px_rgba(245,158,11,0.6)]',
    badgeBg: 'from-amber-600 via-yellow-500 to-amber-600 border-amber-300 text-black',
    textGlow: 'bg-gradient-to-b from-amber-500/30 via-yellow-500/15 to-amber-500/30',
  },
  red: {
    ring: 'ring-4 ring-red-500 border-red-400',
    shadow: 'shadow-[0_0_50px_rgba(239,68,68,0.95),inset_0_0_25px_rgba(239,68,68,0.6)]',
    badgeBg: 'from-red-700 via-rose-600 to-red-700 border-red-300 text-white',
    textGlow: 'bg-gradient-to-b from-red-600/30 via-rose-500/15 to-red-600/30',
  },
  purple: {
    ring: 'ring-4 ring-purple-500 border-purple-400',
    shadow: 'shadow-[0_0_50px_rgba(168,85,247,0.95),inset_0_0_25px_rgba(168,85,247,0.6)]',
    badgeBg: 'from-purple-700 via-fuchsia-600 to-purple-700 border-purple-300 text-white',
    textGlow: 'bg-gradient-to-b from-purple-600/30 via-fuchsia-500/15 to-purple-600/30',
  },
  cyan: {
    ring: 'ring-4 ring-cyan-400 border-cyan-300',
    shadow: 'shadow-[0_0_50px_rgba(6,182,212,0.95),inset_0_0_25px_rgba(6,182,212,0.6)]',
    badgeBg: 'from-cyan-600 via-blue-500 to-cyan-600 border-cyan-200 text-black',
    textGlow: 'bg-gradient-to-b from-cyan-500/30 via-blue-500/15 to-cyan-500/30',
  },
  neon_green: {
    ring: 'ring-4 ring-emerald-400 border-emerald-300',
    shadow: 'shadow-[0_0_50px_rgba(16,185,129,0.95),inset_0_0_25px_rgba(16,185,129,0.6)]',
    badgeBg: 'from-emerald-600 via-lime-500 to-emerald-600 border-lime-300 text-black',
    textGlow: 'bg-gradient-to-b from-emerald-500/30 via-lime-500/15 to-emerald-500/30',
  },
};

export const SlotReel: React.FC<SlotReelProps> = ({ 
  isSpinning, 
  resultSymbols, 
  delay, 
  customSymbols, 
  customSymbolConfigs, 
  winningRows = [],
  activeSymbols = [],
  noSlotMargins = false,
  cashMultipliers,
  bet,
  customCashImages,
  isAnticipating = false,
  slotHideGrid = false,
  anticipationColor = 'gold'
}) => {
  const [currentSymbols, setCurrentSymbols] = useState<string[]>(resultSymbols);
  const [reelSpinning, setReelSpinning] = useState<boolean>(false);
  const controls = useAnimation();
  const stopTimerRef = useRef<NodeJS.Timeout | null>(null);

  const rowsCount = currentSymbols.length || 3;
  const spinningMultiplier = 5;
  const totalSpinningItems = rowsCount * spinningMultiplier;

  useEffect(() => {
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }

    if (isSpinning) {
      setReelSpinning(true);
      controls.start({
        y: ["0%", "-80%"],
        transition: {
          y: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 0.3,
            ease: "linear",
          }
        }
      });
    } else {
      stopTimerRef.current = setTimeout(() => {
        controls.stop();
        setCurrentSymbols(resultSymbols);
        setReelSpinning(false);
        controls.set({ y: -12 });
        controls.start({
          y: 0,
          transition: { type: "spring", stiffness: 400, damping: 25 }
        });
      }, Math.max(0, delay));
    }

    return () => {
      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current);
        stopTimerRef.current = null;
      }
    };
  }, [isSpinning, resultSymbols, delay, controls]);

  const spinPool = activeSymbols.length > 0 ? activeSymbols : ALL_SYMBOLS;
  const spinningColumn = Array.from({ length: totalSpinningItems }).map((_, i) => {
    const sym = spinPool[Math.floor(Math.random() * spinPool.length)];
    return (
      <div 
        key={i} 
        className="w-full py-0.5 flex items-center justify-center" 
        style={{ height: `${100 / totalSpinningItems}%` }}
      >
        <SlotSymbol 
          type={sym} 
          customImage={customSymbols?.[sym]} 
          symbolConfig={customSymbolConfigs?.[sym]}
          slotHideGrid={slotHideGrid}
        />
      </div>
    );
  });

  const antStyle = ANTICIPATION_STYLES[anticipationColor] || ANTICIPATION_STYLES.gold;

  return (
    <div className={`relative flex-1 h-full max-w-[150px] overflow-hidden flex flex-col transition-all duration-300 ${
      noSlotMargins || slotHideGrid
        ? 'bg-transparent border-none shadow-none' 
        : 'bg-black/75 rounded-xl border-x border-[#4d3d00]/60 shadow-[inset_0_0_20px_rgba(0,0,0,0.9)]'
    } ${
      isAnticipating && reelSpinning
        ? `${antStyle.ring} ${antStyle.shadow} z-30 animate-pulse scale-[1.03]`
        : ''
    }`}>
      {/* 3D Glass Light Overlay for Reel Depth */}
      {(!noSlotMargins && !slotHideGrid) && (
        <>
          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-white/5 to-transparent pointer-events-none z-10" />
        </>
      )}

      {/* Anticipation Glow Overlay */}
      {isAnticipating && reelSpinning && (
        <div className={`absolute inset-0 ${antStyle.textGlow} pointer-events-none z-20 animate-pulse`} />
      )}

      <motion.div 
        animate={controls}
        className="absolute top-0 w-full px-0.5 sm:px-1 flex flex-col h-full"
        style={reelSpinning ? { height: `${spinningMultiplier * 100}%` } : undefined}
      >
        {reelSpinning ? spinningColumn : (
          <div className="flex flex-col justify-around h-full py-1 gap-1">
            {currentSymbols.map((symbol, i) => (
              <SlotSymbol 
                key={i} 
                type={symbol} 
                isWinning={winningRows.includes(i)}
                customImage={
                  symbol === 'cash' && cashMultipliers?.[i] !== undefined && customCashImages?.[cashMultipliers[i]]
                    ? customCashImages[cashMultipliers[i]]
                    : customSymbols?.[symbol]
                } 
                symbolConfig={customSymbolConfigs?.[symbol]}
                cashMultiplier={cashMultipliers?.[i]}
                bet={bet}
                slotHideGrid={slotHideGrid}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

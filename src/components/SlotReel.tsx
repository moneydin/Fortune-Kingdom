import React, { useEffect, useState } from 'react';
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
}

const ALL_SYMBOLS: string[] = ['King', 'Queen', 'Crown', 'Lion', 'Sword', 'Shield', 'Castle', 'Diamond', 'Coin', 'Dragon'];

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
  isAnticipating = false
}) => {
  const [currentSymbols, setCurrentSymbols] = useState<string[]>(resultSymbols);
  const [reelSpinning, setReelSpinning] = useState<boolean>(false);
  const [playBounce, setPlayBounce] = useState<boolean>(false);
  const controls = useAnimation();

  const rowsCount = currentSymbols.length || 3;
  const spinningMultiplier = 5;
  const totalSpinningItems = rowsCount * spinningMultiplier;

  // Handles the spinning and stopping states
  useEffect(() => {
    let stopTimer: NodeJS.Timeout;

    if (isSpinning) {
      setReelSpinning(true);
      controls.start({
        y: ["0%", "-80%"],
        transition: {
          y: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 0.35,
            ease: "linear",
          }
        }
      });
    } else {
      if (reelSpinning) {
        // Reel was spinning, let's stop with a clean staggered delay
        stopTimer = setTimeout(() => {
          controls.stop();
          setCurrentSymbols(resultSymbols);
          setReelSpinning(false);
          setPlayBounce(true);
        }, delay);
      } else {
        // Simple state sync for mounting or changes to the board configuration
        setCurrentSymbols(resultSymbols);
        controls.set({ y: 0 });
      }
    }

    return () => {
      clearTimeout(stopTimer);
    };
  }, [isSpinning, resultSymbols, delay, controls, reelSpinning]);

  // Handle the landing bounce effect after the component has updated its DOM/dimensions
  useEffect(() => {
    if (playBounce) {
      setPlayBounce(false);
      
      // Ensure we clean any ongoing animations first
      controls.stop();
      
      // Perform the crisp spring bounce animation
      controls.set({ y: -15 });
      controls.start({
        y: 0,
        transition: { type: "spring", stiffness: 380, damping: 22 }
      });
    }
  }, [playBounce, controls]);

  // Generate a mathematically proportional list of random symbols for the spinning blur effect
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
        />
      </div>
    );
  });

  return (
    <div className={`relative flex-1 h-full max-w-[150px] overflow-hidden flex flex-col transition-all duration-300 ${
      noSlotMargins 
        ? 'bg-transparent border-none shadow-none' 
        : 'bg-black/75 rounded-xl border-x border-[#4d3d00]/60 shadow-[inset_0_0_20px_rgba(0,0,0,0.9)]'
    } ${
      isAnticipating && reelSpinning
        ? 'ring-4 ring-amber-500 ring-offset-2 ring-offset-black shadow-[0_0_40px_rgba(245,158,11,0.9),inset_0_0_20px_rgba(245,158,11,0.5)] border-amber-400 z-30 animate-pulse scale-[1.03]'
        : ''
    }`}>
      {/* 3D Glass Light Overlay for Reel Depth */}
      {!noSlotMargins && (
        <>
          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-white/5 to-transparent pointer-events-none z-10" />
        </>
      )}

      {/* Anticipation Glow and Badge Overlays */}
      {isAnticipating && reelSpinning && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-red-500/10 to-amber-500/10 pointer-events-none z-20 animate-pulse" />
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-600 to-amber-600 border border-red-400 text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg text-white z-20 animate-bounce tracking-widest whitespace-nowrap uppercase">
            ⚡ AMEAÇA ⚡
          </div>
        </>
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
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

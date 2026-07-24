import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'motion/react';
import { SymbolType, SymbolImageConfig } from '../types';
import { SlotSymbol } from './SlotSymbol';

interface SlotReelProps {
  isSpinning: boolean;
  resultSymbols: SymbolType[];
  delay: number;
  customSymbols?: Partial<Record<SymbolType, string>>;
  customSymbolConfigs?: Partial<Record<SymbolType, SymbolImageConfig>>;
}

const ALL_SYMBOLS: SymbolType[] = ['King', 'Queen', 'Crown', 'Lion', 'Sword', 'Shield', 'Castle', 'Diamond', 'Coin', 'Dragon'];

export const SlotReel: React.FC<SlotReelProps> = ({ isSpinning, resultSymbols, delay, customSymbols, customSymbolConfigs }) => {
  const [currentSymbols, setCurrentSymbols] = useState<SymbolType[]>(resultSymbols || ['Castle', 'Sword', 'Diamond']);
  const [reelSpinning, setReelSpinning] = useState<boolean>(false);
  const controls = useAnimation();

  useEffect(() => {
    let stopTimer: NodeJS.Timeout;

    if (isSpinning) {
      setReelSpinning(true);
      controls.start({
        y: [0, -800],
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
      stopTimer = setTimeout(() => {
        controls.stop();
        setCurrentSymbols(resultSymbols);
        setReelSpinning(false);
        controls.set({ y: -50 });
        controls.start({
          y: 0,
          transition: { type: "spring", stiffness: 350, damping: 22 }
        });
      }, delay);
    }

    return () => {
      clearTimeout(stopTimer);
    };
  }, [isSpinning, resultSymbols, delay, controls]);

  // Generate a long list of random symbols for the spinning blur effect
  const spinningColumn = Array.from({ length: 20 }).map((_, i) => {
    const sym = ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)];
    return (
      <div key={i} className="py-2 h-20">
        <SlotSymbol 
          type={sym} 
          customImage={customSymbols?.[sym]} 
          symbolConfig={customSymbolConfigs?.[sym]}
        />
      </div>
    );
  });

  return (
    <div className="relative flex-1 h-full max-w-[120px] overflow-hidden bg-black/60 rounded-md sm:rounded-xl border-x sm:border-x-2 border-[#4d3d00] shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
      <motion.div 
        animate={controls}
        className="absolute top-0 w-full px-0.5 sm:px-1.5 flex flex-col h-full"
      >
        {reelSpinning ? spinningColumn : (
          <div className="flex flex-col justify-around h-full py-1 gap-1">
            {currentSymbols.map((symbol, i) => (
              <SlotSymbol 
                key={i} 
                type={symbol} 
                customImage={customSymbols?.[symbol]} 
                symbolConfig={customSymbolConfigs?.[symbol]}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

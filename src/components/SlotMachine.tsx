import React from 'react';
import { SlotReel } from './SlotReel';
import { SymbolType, SymbolImageConfig } from '../types';
import { motion } from 'motion/react';

interface SlotMachineProps {
  isSpinning: boolean;
  grid: SymbolType[][];
  customSymbols?: Partial<Record<SymbolType, string>>;
  customSymbolConfigs?: Partial<Record<SymbolType, SymbolImageConfig>>;
}

export const SlotMachine: React.FC<SlotMachineProps> = ({ isSpinning, grid, customSymbols, customSymbolConfigs }) => {
  return (
    <div className="relative z-10 w-full h-full flex items-center justify-center p-0.5 sm:p-1 md:p-2">
      {/* Main Grid - Background is transparent to show the castle gates from the background image */}
      <div className="flex gap-0.5 sm:gap-1.5 md:gap-2 w-full h-full justify-center items-center">
        {grid.map((column, index) => (
          <SlotReel 
            key={index}
            isSpinning={isSpinning}
            resultSymbols={column}
            delay={index * 200}
            customSymbols={customSymbols}
            customSymbolConfigs={customSymbolConfigs}
          />
        ))}
      </div>
    </div>
  );
};


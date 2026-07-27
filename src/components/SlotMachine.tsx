import React from 'react';
import { SlotReel } from './SlotReel';
import { SymbolType, SymbolImageConfig } from '../types';
import { motion } from 'motion/react';

interface SlotMachineProps {
  isSpinning: boolean;
  grid: string[][];
  customSymbols?: Partial<Record<string, string>>;
  customSymbolConfigs?: Partial<Record<string, SymbolImageConfig>>;
  winningCells?: { col: number; row: number }[];
  activeSymbols?: string[];
  noSlotMargins?: boolean;
  cashGrid?: number[][];
  bet?: number;
  customCashImages?: Record<number, string>;
  hasAnticipation?: boolean;
}

export const SlotMachine: React.FC<SlotMachineProps> = ({ 
  isSpinning, 
  grid, 
  customSymbols, 
  customSymbolConfigs, 
  winningCells = [],
  activeSymbols = [],
  noSlotMargins = false,
  cashGrid,
  bet = 1,
  customCashImages,
  hasAnticipation = false
}) => {
  return (
    <div className="relative z-10 w-full h-full flex items-center justify-center p-0.5 sm:p-1 md:p-2">
      {/* Main Grid - Background is transparent to show the castle gates from the background image */}
      <div className={`flex w-full h-full justify-center items-center transition-all duration-300 ${
        noSlotMargins ? 'gap-0' : 'gap-0.5 sm:gap-1.5 md:gap-2'
      }`}>
        {grid.map((column, index) => {
          const winningRows = winningCells
            ? winningCells.filter(cell => cell.col === index).map(cell => cell.row)
            : [];
          
          // Last reel anticipation delay
          const isLastReel = index === grid.length - 1;
          const isReelAnticipating = isLastReel && hasAnticipation;
          const reelDelay = isReelAnticipating ? (index * 150 + 2000) : (index * 150);

          return (
            <SlotReel 
              key={index}
              isSpinning={isSpinning}
              resultSymbols={column}
              delay={reelDelay}
              customSymbols={customSymbols}
              customSymbolConfigs={customSymbolConfigs}
              winningRows={winningRows}
              activeSymbols={activeSymbols}
              noSlotMargins={noSlotMargins}
              cashMultipliers={cashGrid?.[index]}
              bet={bet}
              customCashImages={customCashImages}
              isAnticipating={isReelAnticipating}
            />
          );
        })}
      </div>
    </div>
  );
};


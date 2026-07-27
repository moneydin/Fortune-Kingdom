import React from 'react';
import { SlotReel } from './SlotReel';
import { SymbolType, SymbolImageConfig } from '../types';

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
  slotHideGrid?: boolean;
  staggerDelay?: number;
  anticipationExtraDelay?: number;
  cashAnticipationColor?: 'gold' | 'red' | 'purple' | 'cyan' | 'neon_green';
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
  hasAnticipation = false,
  slotHideGrid = false,
  staggerDelay = 120,
  anticipationExtraDelay = 1800,
  cashAnticipationColor = 'gold'
}) => {
  return (
    <div className="relative z-10 w-full h-full flex items-center justify-center p-0.5 sm:p-1 md:p-2">
      {/* Main Grid - Background is transparent to show background graphics */}
      <div className={`flex w-full h-full justify-center items-center transition-all duration-300 ${
        noSlotMargins || slotHideGrid ? 'gap-0 sm:gap-0.5' : 'gap-0.5 sm:gap-1.5 md:gap-2'
      }`}>
        {grid.map((column, index) => {
          const winningRows = winningCells
            ? winningCells.filter(cell => cell.col === index).map(cell => cell.row)
            : [];
          
          // Last reel anticipation delay calculation
          const isLastReel = index === grid.length - 1;
          const isReelAnticipating = isLastReel && hasAnticipation;
          const reelDelay = isReelAnticipating 
            ? (index * staggerDelay + anticipationExtraDelay) 
            : (index * staggerDelay);
          const antStartDelay = isReelAnticipating
            ? Math.max(0, (index - 1) * staggerDelay)
            : 0;

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
              anticipationStartDelay={antStartDelay}
              slotHideGrid={slotHideGrid}
              anticipationColor={cashAnticipationColor}
            />
          );
        })}
      </div>
    </div>
  );
};

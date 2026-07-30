import React from 'react';
import { SlotReel } from './SlotReel';
import { SymbolType, SymbolImageConfig, SpinRollStyle } from '../types';
import { LineWinResult } from '../slotEngine';

interface PaylineOverlayProps {
  winningLines: LineWinResult[];
  activeWinLineIndex: number | null;
  isSpinning: boolean;
  gridCols: number;
  gridRows: number;
}

const PaylineOverlay: React.FC<PaylineOverlayProps> = ({
  winningLines,
  activeWinLineIndex,
  isSpinning,
  gridCols,
  gridRows,
}) => {
  if (isSpinning || !winningLines || winningLines.length === 0 || gridCols <= 0 || gridRows <= 0) {
    return null;
  }

  // Display active win line for sequential cycling, or all winning lines
  const linesToDraw = (activeWinLineIndex !== null && winningLines[activeWinLineIndex])
    ? [winningLines[activeWinLineIndex]]
    : winningLines;

  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="paylineGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="paylineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>
      </defs>

      {linesToDraw.map((line, lIdx) => {
        if (!line.coordinates || line.coordinates.length < 2) return null;

        const points = line.coordinates.map(coord => {
          const x = ((coord.col + 0.5) / gridCols) * 100;
          const y = ((coord.row + 0.5) / gridRows) * 100;
          return { x, y };
        });

        const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');

        return (
          <g key={(line.paylineId || 'line') + '_' + lIdx} className="animate-in fade-in duration-300">
            {/* Outer Thick Glowing Blur Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#paylineGlow)"
              className="opacity-90 animate-pulse"
            />

            {/* Inner Bright Gold Core Line */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#paylineGrad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Glowing Connector Nodes at each symbol center */}
            {points.map((pt, pIdx) => (
              <g key={pIdx}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="2.8"
                  fill="#facc15"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                  className="animate-ping opacity-75"
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="2.2"
                  fill="#fef08a"
                  stroke="#b45309"
                  strokeWidth="0.6"
                />
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
};

interface SlotMachineProps {
  isSpinning: boolean;
  grid: string[][];
  customSymbols?: Partial<Record<string, string>>;
  customSymbolConfigs?: Partial<Record<string, SymbolImageConfig>>;
  winningCells?: { col: number; row: number }[];
  winningLines?: LineWinResult[];
  activeWinLineIndex?: number | null;
  bonusPulsingCells?: { col: number; row: number }[];
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
  spinRollStyle?: SpinRollStyle;
}

export const SlotMachine: React.FC<SlotMachineProps> = ({ 
  isSpinning, 
  grid, 
  customSymbols, 
  customSymbolConfigs, 
  winningCells = [],
  winningLines = [],
  activeWinLineIndex = null,
  bonusPulsingCells = [],
  activeSymbols = [],
  noSlotMargins = false,
  cashGrid,
  bet = 1,
  customCashImages,
  hasAnticipation = false,
  slotHideGrid = false,
  staggerDelay = 120,
  anticipationExtraDelay = 1800,
  cashAnticipationColor = 'gold',
  spinRollStyle = 'standard'
}) => {
  const gridCols = grid.length;
  const gridRows = grid[0]?.length || 3;

  return (
    <div className="relative z-10 w-full h-full flex items-center justify-center p-0.5 sm:p-1 md:p-2">
      {/* Main Grid - Background is transparent to show background graphics */}
      <div className={`relative z-10 flex w-full h-full justify-center items-center transition-all duration-300 ${
        noSlotMargins || slotHideGrid ? 'gap-0 sm:gap-0.5' : 'gap-0.5 sm:gap-1.5 md:gap-2'
      }`}>
        {/* SVG Winning Paylines Overlay - Placed directly inside reels grid container behind slot reels */}
        <PaylineOverlay
          winningLines={winningLines}
          activeWinLineIndex={activeWinLineIndex}
          isSpinning={isSpinning}
          gridCols={gridCols}
          gridRows={gridRows}
        />

        {grid.map((column, index) => {
          const winningRows = winningCells
            ? winningCells.filter(cell => cell.col === index).map(cell => cell.row)
            : [];
          
          const bonusPulsingRows = bonusPulsingCells
            ? bonusPulsingCells.filter(cell => cell.col === index).map(cell => cell.row)
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
              bonusPulsingRows={bonusPulsingRows}
              activeSymbols={activeSymbols}
              noSlotMargins={noSlotMargins}
              cashMultipliers={cashGrid?.[index]}
              bet={bet}
              customCashImages={customCashImages}
              isAnticipating={isReelAnticipating}
              anticipationStartDelay={antStartDelay}
              slotHideGrid={slotHideGrid}
              anticipationColor={cashAnticipationColor}
              spinRollStyle={spinRollStyle}
            />
          );
        })}
      </div>
    </div>
  );
};

export type SymbolType = 'King' | 'Queen' | 'Crown' | 'Lion' | 'Sword' | 'Shield' | 'Castle' | 'Diamond' | 'Coin' | 'Dragon';

export interface ReelState {
  symbols: SymbolType[];
  isSpinning: boolean;
  stopPosition: number;
}

export interface SymbolImageConfig {
  url: string;
  objectFit?: 'cover' | 'contain';
  offsetX?: number; // % offset (-50 to 50)
  offsetY?: number; // % offset (-50 to 50)
  scale?: number; // zoom % (50 to 200)
}

export interface AdminConfig {
  targetRtp: number;
  volatility: 'low' | 'medium' | 'high';
  forcedOutcome: 'none' | 'normal_win' | 'big_win' | 'loss';
  minBet: number;
  maxBet: number;
  totalSpins: number;
  totalWagered: number;
  totalPayout: number;
  autoWinBoost: boolean;

  // Custom Background and Layout Positioning
  bgImage: string;
  bgPosX: number; // X offset in % (-100 to 100)
  bgPosY: number; // Y offset in % (-100 to 100)
  bgZoom: number; // Zoom level (100 to 200%)

  // Slot Reel Box Frame Position over background (%)
  slotTop: number; // default 32
  slotLeft: number; // default 30
  slotWidth: number; // default 40
  slotHeight: number; // default 40

  // Spin Button Positioning (%)
  spinBottom: number; // default 4
  spinLeft: number; // default 50
  spinScale: number; // default 100 (%)

  // Custom Symbol Images (SymbolType -> URL/DataURI)
  customSymbols: Partial<Record<SymbolType, string>>;
  customSymbolConfigs?: Partial<Record<SymbolType, SymbolImageConfig>>;
}

export interface SpinHistoryItem {
  id: string;
  time: string;
  bet: number;
  win: number;
  multiplier: number;
  symbols: SymbolType[];
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  turboMode: boolean;
  autoSpinCount: number;
  isAutoSpinning: boolean;
}

export interface GameState {
  balance: number;
  bet: number;
  win: number;
  isSpinning: boolean;
  progression: number; // 0 to 100
  bigWin: boolean;
}


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
  forcedOutcome: 'none' | 'normal_win' | 'big_win' | 'loss' | 'full_screen' | 'force_cash_collect';
  minBet: number;
  maxBet: number;
  betPresets?: number[];
  totalSpins: number;
  totalWagered: number;
  totalPayout: number;
  autoWinBoost: boolean;

  // Custom Background and Layout Positioning
  bgImage: string;
  bgPosX: number; // X offset in % (-100 to 100)
  bgPosY: number; // Y offset in % (-100 to 100)
  bgZoom: number; // Zoom level (100 to 200%)
  bgMediaType?: 'auto' | 'image' | 'video';

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
  boardType?: '5x3' | '3x3' | '5x4' | '3x1';

  // Custom Cash Multiplier and specific images configuration
  customCashMultipliers?: number[];
  customCashImages?: Record<number, string>;

  // Buy Bonus (Comprar Bônus) Configurations
  enableBuyBonus?: boolean;
  buyBonusMultiplier?: number; // e.g., 50x bet
  bonusFreeSpinsCount?: number; // e.g., 10 spins
  bonusMultiplierBoost?: number; // e.g., 2x multiplier boost during bonus
  bonusForceWinType?: 'none' | 'normal_win' | 'big_win' | 'full_screen'; // force wins during free spins
  bonusMediaUrl?: string; // Image or video URL to play on the Bonus Completed summary screen

  // Element Toggle & Theme Configurations
  showHeader?: boolean;
  showBalance?: boolean;
  showBetController?: boolean;
  showWinBanner?: boolean;
  noSlotMargins?: boolean;
  slotFrameColor?: string; // e.g. '#d4af37' hex
  slotFrameBgOpacity?: number; // 0 to 100 %
  slotFrameBorderWidth?: number; // 0 to 8px
  slotFrameBgColor?: string; // e.g. 'black' or 'rgba(0,0,0,0.6)'
  spinButtonLabel?: string; // e.g. 'GIRAR'
  spinButtonColor?: 'gold' | 'red' | 'green' | 'blue' | 'purple';

  // Custom buttons with specialized functions
  customButtons?: CustomButtonConfig[];
}

export interface CustomButtonConfig {
  id: string;
  label: string;
  actionType: 'add_balance' | 'force_big_win' | 'force_bonus' | 'support_alert' | 'redirect_url' | 'reset_balance';
  actionValue: string; // parameters like URL or value amount or text
  posX: number; // horizontal % (0 to 100)
  posY: number; // vertical % (0 to 100)
  scale: number; // size scaling %
  bgColor: string; // e.g., 'bg-red-600', 'bg-gold', etc.
  textColor: string; // e.g., 'text-white'
  isActive: boolean;
}

export interface SpinHistoryItem {
  id: string;
  time: string;
  bet: number;
  win: number;
  multiplier: number;
  symbols: SymbolType[];
  isBonusSpin?: boolean;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  turboMode: boolean;
  autoSpinCount: number;
  isAutoSpinning: boolean;
  stopOnBonusTrigger?: boolean;
  stopOnWinExceeds?: number;
  stopOnBalanceDrop?: number;
  stopOnBalanceIncrease?: number;
}

export interface GameState {
  balance: number;
  bet: number;
  win: number;
  isSpinning: boolean;
  progression: number; // 0 to 100
  bigWin: boolean;
  
  // Bonus Round State
  inBonusRound?: boolean;
  bonusSpinsRemaining?: number;
  bonusTotalWin?: number;
  bonusMultiplierAccumulated?: number;
}


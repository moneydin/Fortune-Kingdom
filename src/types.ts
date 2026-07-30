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

export interface CustomTextConfig {
  id: string;
  text: string;
  posX: number; // 0 to 100%
  posY: number; // 0 to 100%
  fontSize: number; // in px
  color: string; // hex or tailwind class
  fontWeight: 'normal' | 'bold' | 'extrabold' | 'black';
  fontFamily?: 'sans' | 'mono' | 'serif';
  isActive: boolean;
}

export interface CustomButtonConfig {
  id: string;
  label: string;
  actionType: 'spin' | 'buy_bonus' | 'bet_plus' | 'bet_minus' | 'turbo_toggle' | 'auto_spin' | 'open_menu' | 'add_balance' | 'force_big_win' | 'force_bonus' | 'support_alert' | 'redirect_url' | 'reset_balance';
  actionValue: string; // parameters like URL or value amount or text
  posX: number; // horizontal % (0 to 100)
  posY: number; // vertical % (0 to 100)
  scale: number; // size scaling %
  bgColor: string; // e.g., 'bg-red-600', 'bg-gold', etc.
  textColor: string; // e.g., 'text-white'
  shape?: 'pill' | 'circle' | 'square' | 'rounded' | 'neon_glow' | 'glass' | 'retro';
  icon?: string;
  imageUrl?: string;
  isActive: boolean;
}

export type BoardType = '3x1' | '3x3' | '4x3' | '4x4' | '5x3' | '5x4' | '6x3' | '6x4' | '7x7';
export type SpinRollStyle = 'standard' | 'cascade' | 'bounce_rebound' | 'hyper_blur' | 'scale_pop' | 'wave_swing';

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

  // Slot Cell & Frame Visibility Controls
  slotHideGrid?: boolean; // Removes symbol box cards/grid borders (only symbol element floats)
  slotHideOuterFrame?: boolean; // Removes outer container box border & shadow

  // Spin Button Positioning (%)
  spinBottom: number; // default 4
  spinLeft: number; // default 50
  spinScale: number; // default 100 (%)
  spinButtonShape?: 'pill' | 'circle' | 'square' | 'rounded' | 'neon_glow' | 'glass' | 'retro';

  // HUD Element Positions & Scale
  balancePosX?: number; // default 15
  balancePosY?: number; // default 8
  balanceScale?: number; // default 100
  
  betPosX?: number; // default 85
  betPosY?: number; // default 8
  betScale?: number; // default 100

  winPosX?: number; // default 50
  winPosY?: number; // default 82
  winScale?: number; // default 100

  headerPosX?: number; // default 50
  headerPosY?: number; // default 3
  headerScale?: number; // default 100

  // Custom Symbol Images (SymbolType -> URL/DataURI)
  customSymbols: Partial<Record<SymbolType, string>>;
  customSymbolConfigs?: Partial<Record<SymbolType, SymbolImageConfig>>;
  boardType?: BoardType;
  spinRollStyle?: SpinRollStyle;

  // Custom Cash Multiplier and specific images configuration
  customCashMultipliers?: number[];
  customCashImages?: Record<number, string>;
  minCashCardsForWin?: number; // Minimum cash cards needed to pay out (default 5, configurable 1-5)
  cashCardSinglePay?: boolean; // If true, single/isolated cash cards also pay their multiplier
  cashAnticipationColor?: 'gold' | 'red' | 'purple' | 'cyan' | 'neon_green'; // Glow color for anticipation on last reel

  // Reel Spin Speeds & Animations
  spinSpeedNormal?: number; // ms duration per reel in normal mode (e.g. 1200)
  spinSpeedTurbo?: number; // ms duration per reel in turbo mode (e.g. 350)
  reelStaggerDelay?: number; // ms delay between consecutive reels (e.g. 120)

  // Buy Bonus & Free Spins Trigger Configurations
  enableBuyBonus?: boolean;
  buyBonusMultiplier?: number; // e.g., 50x bet
  bonusTriggerSymbolId?: string; // Symbol required to trigger bonus (default 'crown')
  bonusMinCardsCount?: number; // Minimum bonus cards required on board (default 3)
  bonusFreeSpinsCount?: number; // e.g., 10 spins
  bonusMultiplierBoost?: number; // e.g., 2x multiplier boost during bonus
  bonusInstantPayMultiplier?: number; // e.g., 5x bet paid instantly on trigger
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

  // Custom buttons & custom texts with specialized functions
  customButtons?: CustomButtonConfig[];
  customTexts?: CustomTextConfig[];
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


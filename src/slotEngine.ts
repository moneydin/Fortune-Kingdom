export interface SlotSymbolConfig {
  id: string;
  name: string;
  image: string; // Icon identifier, Base64 image, or custom image URL
  weight: number; // Probability weight for appearing in reels
  payouts: Record<number, number>; // e.g., { 3: 2, 4: 5, 5: 10 } for matches
  isActive: boolean;
  fullScreenMultiplier?: number; // Special big win multiplier if symbol occupies full board
  fullScreenMedia?: string; // Optional custom full-screen background image or video URL
}

export interface PaylineConfig {
  id: string;
  name: string;
  coordinates: { col: number; row: number }[]; // Coordinates along the grid
  isActive: boolean;
}

export interface SlotEngineConfig {
  boardType: '3x1' | '3x3' | '5x3' | '5x4';
  symbols: SlotSymbolConfig[];
  paylines: PaylineConfig[];
  targetRtp: number;
}

// ---------------------------------------------------------
// DEFAULT INITIAL CONFIGURATIONS (Pre-populations)
// ---------------------------------------------------------

export const DEFAULT_SYMBOLS: SlotSymbolConfig[] = [
  {
    id: 'crown',
    name: 'Coroa Imperial',
    image: '👑',
    weight: 10,
    payouts: { 3: 15, 4: 50, 5: 200 },
    fullScreenMultiplier: 250,
    isActive: true,
  },
  {
    id: 'dragon',
    name: 'Dragão Supremo',
    image: '🐉',
    weight: 15,
    payouts: { 3: 10, 4: 30, 5: 100 },
    fullScreenMultiplier: 150,
    isActive: true,
  },
  {
    id: 'king',
    name: 'Rei de Copas',
    image: '👑',
    weight: 20,
    payouts: { 3: 8, 4: 20, 5: 75 },
    fullScreenMultiplier: 100,
    isActive: true,
  },
  {
    id: 'lion',
    name: 'Leão Guardião',
    image: '🦁',
    weight: 25,
    payouts: { 3: 6, 4: 15, 5: 50 },
    fullScreenMultiplier: 80,
    isActive: true,
  },
  {
    id: 'castle',
    name: 'Castelo Fortificado',
    image: '🏰',
    weight: 30,
    payouts: { 3: 4, 4: 10, 5: 30 },
    fullScreenMultiplier: 50,
    isActive: true,
  },
  {
    id: 'sword',
    name: 'Espada Mágica',
    image: '⚔️',
    weight: 40,
    payouts: { 3: 3, 4: 8, 5: 20 },
    fullScreenMultiplier: 30,
    isActive: true,
  },
  {
    id: 'shield',
    name: 'Escudo Real',
    image: '🛡️',
    weight: 50,
    payouts: { 3: 2.5, 4: 6, 5: 15 },
    fullScreenMultiplier: 20,
    isActive: true,
  },
  {
    id: 'diamond',
    name: 'Diamante Ancestral',
    image: '💎',
    weight: 60,
    payouts: { 3: 2, 4: 5, 5: 10 },
    fullScreenMultiplier: 15,
    isActive: true,
  },
  {
    id: 'coin',
    name: 'Moeda de Ouro',
    image: '🪙',
    weight: 80,
    payouts: { 3: 1.5, 4: 3, 5: 6 },
    fullScreenMultiplier: 10,
    isActive: true,
  },
  {
    id: 'cash',
    name: 'Dinheiro',
    image: '💵',
    weight: 25, // reasonable rate to appear
    payouts: {}, // no line payouts
    fullScreenMultiplier: 0,
    isActive: true,
  },
  {
    id: 'wild',
    name: 'Curinga',
    image: '🃏',
    weight: 12,
    payouts: { 3: 30, 4: 100, 5: 500 },
    fullScreenMultiplier: 1000,
    isActive: true,
  },
];

export const DEFAULT_PAYLINES: PaylineConfig[] = [
  // 3x1 and all boards support:
  {
    id: 'line_h_mid',
    name: 'Horizontal Central',
    coordinates: [{ col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 }],
    isActive: true,
  },
  // 3x3 horizontal lines
  {
    id: 'line_h_top',
    name: 'Horizontal Superior',
    coordinates: [{ col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 }],
    isActive: true,
  },
  {
    id: 'line_h_bot',
    name: 'Horizontal Inferior',
    coordinates: [{ col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 }],
    isActive: true,
  },
  // 3x3 diagonals
  {
    id: 'line_d_down',
    name: 'Diagonal Descendente',
    coordinates: [{ col: 0, row: 0 }, { col: 1, row: 1 }, { col: 2, row: 2 }],
    isActive: true,
  },
  {
    id: 'line_d_up',
    name: 'Diagonal Ascendente',
    coordinates: [{ col: 0, row: 2 }, { col: 1, row: 1 }, { col: 2, row: 0 }],
    isActive: true,
  },
  // 5x3 or 5x4 layout lines:
  {
    id: 'line_h_mid_5',
    name: 'Horizontal Central (5x)',
    coordinates: [{ col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 }, { col: 3, row: 1 }, { col: 4, row: 1 }],
    isActive: true,
  },
  {
    id: 'line_h_top_5',
    name: 'Horizontal Superior (5x)',
    coordinates: [{ col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 }, { col: 3, row: 0 }, { col: 4, row: 0 }],
    isActive: true,
  },
  {
    id: 'line_h_bot_5',
    name: 'Horizontal Inferior (5x)',
    coordinates: [{ col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 }, { col: 3, row: 2 }, { col: 4, row: 2 }],
    isActive: true,
  },
  {
    id: 'line_v_shape_5',
    name: 'V-Shape (5x)',
    coordinates: [{ col: 0, row: 0 }, { col: 1, row: 1 }, { col: 2, row: 2 }, { col: 3, row: 1 }, { col: 4, row: 0 }],
    isActive: true,
  },
  {
    id: 'line_inv_v_5',
    name: 'Inverted V-Shape (5x)',
    coordinates: [{ col: 0, row: 2 }, { col: 1, row: 1 }, { col: 2, row: 0 }, { col: 3, row: 1 }, { col: 4, row: 2 }],
    isActive: true,
  },
  {
    id: 'line_zigzag_5',
    name: 'Zig-Zag (5x)',
    coordinates: [{ col: 0, row: 0 }, { col: 1, row: 1 }, { col: 2, row: 0 }, { col: 3, row: 1 }, { col: 4, row: 0 }],
    isActive: true,
  },
];

// Helper to determine board grid dimensions from layout id
export function getBoardDimensions(boardType: '3x1' | '3x3' | '5x3' | '5x4'): { cols: number; rows: number } {
  switch (boardType) {
    case '3x1': return { cols: 3, rows: 1 };
    case '3x3': return { cols: 3, rows: 3 };
    case '5x4': return { cols: 5, rows: 4 };
    case '5x3':
    default:
      return { cols: 5, rows: 3 };
  }
}

// ---------------------------------------------------------
// 1. MOTOR DOS ROLOS (REEL MOTOR) & 2. GERADOR DO TABULEIRO (BOARD GENERATOR)
// ---------------------------------------------------------

/**
 * Weighted random selection helper.
 * Takes active symbols and returns a single chosen symbol based on its weight.
 */
function getRandomSymbolWeighted(symbols: SlotSymbolConfig[]): SlotSymbolConfig {
  let activeSymbols = symbols.filter(s => s.isActive);
  if (activeSymbols.length === 0) {
    console.warn('Não há símbolos ativos configurados para o jogo. Recuperando de forma automática.');
    if (symbols && symbols.length > 0) {
      symbols.forEach(s => { s.isActive = true; });
      activeSymbols = symbols;
    } else {
      // Re-populate from defaults
      DEFAULT_SYMBOLS.forEach(s => {
        symbols.push({ ...s });
      });
      activeSymbols = symbols.filter(s => s.isActive);
      if (activeSymbols.length === 0) {
        return DEFAULT_SYMBOLS[0];
      }
    }
  }

  const totalWeight = activeSymbols.reduce((sum, s) => sum + s.weight, 0);
  let randomValue = Math.random() * totalWeight;

  for (const sym of activeSymbols) {
    if (randomValue < sym.weight) {
      return sym;
    }
    randomValue -= sym.weight;
  }
  return activeSymbols[activeSymbols.length - 1];
}

/**
 * Generates an entirely fresh board grid using weighted random distribution.
 * Represented as grid[col][row].
 */
export function generateBoardGrid(
  boardType: '3x1' | '3x3' | '5x3' | '5x4',
  symbols: SlotSymbolConfig[]
): string[][] {
  const { cols, rows } = getBoardDimensions(boardType);
  const grid: string[][] = [];

  for (let c = 0; c < cols; c++) {
    const colSymbols: string[] = [];
    for (let r = 0; r < rows; r++) {
      const selectedSym = getRandomSymbolWeighted(symbols);
      colSymbols.push(selectedSym.id);
    }
    grid.push(colSymbols);
  }

  return grid;
}

// ---------------------------------------------------------
// 3. VALIDADOR DE LINHAS (LINE VALIDATOR) & 4. CALCULADORA DE PAGAMENTOS (PAYOUT CALCULATOR)
// ---------------------------------------------------------

export function getRandomCashMultiplier(activeMultipliers?: number[]): number {
  const choicesAll = [1, 2, 5, 10, 20, 50, 100];
  const weightsAll = [35, 25, 20, 10, 6, 3, 1];
  
  const choices = activeMultipliers && activeMultipliers.length > 0 ? activeMultipliers : choicesAll;
  const weights = choices.map(c => {
    const idx = choicesAll.indexOf(c);
    return idx !== -1 ? weightsAll[idx] : 10;
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let randomValue = Math.random() * totalWeight;

  for (let i = 0; i < choices.length; i++) {
    if (randomValue < weights[i]) {
      return choices[i];
    }
    randomValue -= weights[i];
  }
  return choices[0] || 1;
}

export interface LineWinResult {
  paylineId: string;
  paylineName: string;
  symbolId: string;
  symbolName: string;
  coordinates: { col: number; row: number }[];
  matchCount: number;
  multiplier: number;
  payoutAmount: number;
}

/**
 * Filters the paylines configured for the current grid dimensions, keeping only those that fit.
 */
export function getValidPaylinesForBoard(
  boardType: '3x1' | '3x3' | '5x3' | '5x4',
  paylines: PaylineConfig[]
): PaylineConfig[] {
  const { cols, rows } = getBoardDimensions(boardType);

  return paylines.filter(line => {
    if (!line.isActive) return false;
    // Every coordinate in the payline must lie within the board boundary
    return line.coordinates.every(coord => {
      return coord.col >= 0 && coord.col < cols && coord.row >= 0 && coord.row < rows;
    });
  });
}

/**
 * Validates all registered, active paylines against the current board.
 * Returns detailed win results for each winning line.
 */
export function evaluateBoardWins(
  grid: string[][],
  boardType: '3x1' | '3x3' | '5x3' | '5x4',
  symbols: SlotSymbolConfig[],
  paylines: PaylineConfig[],
  bet: number,
  cashGrid?: number[][],
  options?: {
    minCashCardsForWin?: number;
    cashCardSinglePay?: boolean;
    bonusTriggerSymbolId?: string;
    bonusMinCardsCount?: number;
    bonusInstantPayMultiplier?: number;
  }
): {
  winningLines: LineWinResult[];
  totalPayoutAmount: number;
  totalMultiplier: number;
  isBonusTriggered: boolean;
} {
  // Check for FULL SCREEN (Big Win) with wild substitution
  let bestFsSymbol: SlotSymbolConfig | null = null;
  let bestFsMultiplier = 0;

  for (const sym of symbols) {
    if (!sym.isActive || sym.id === 'cash') continue;

    let isFsMatch = true;
    for (let c = 0; c < grid.length; c++) {
      for (let r = 0; r < grid[c].length; r++) {
        const id = grid[c][r];
        if (id !== sym.id && id !== 'wild') {
          isFsMatch = false;
          break;
        }
      }
      if (!isFsMatch) break;
    }

    if (isFsMatch && sym.fullScreenMultiplier && sym.fullScreenMultiplier > bestFsMultiplier) {
      bestFsMultiplier = sym.fullScreenMultiplier;
      bestFsSymbol = sym;
    }
  }

  if (bestFsSymbol && bestFsMultiplier > 0) {
    const fsPayout = bet * bestFsMultiplier;
    return {
      winningLines: [{
        paylineId: 'full_screen_bonus',
        paylineName: 'TELA CHEIA ' + bestFsSymbol.name.toUpperCase(),
        symbolId: bestFsSymbol.id,
        symbolName: bestFsSymbol.name,
        coordinates: grid.flatMap((col, colIdx) => col.map((_, rowIdx) => ({ col: colIdx, row: rowIdx }))),
        matchCount: grid.length * (grid[0]?.length || 1),
        multiplier: bestFsMultiplier,
        payoutAmount: fsPayout,
      }],
      totalPayoutAmount: fsPayout,
      totalMultiplier: bestFsMultiplier,
      isBonusTriggered: false,
    };
  }

  // If NOT a full screen (or full screen symbol has no special multiplier), evaluate normal paylines
  const validPaylines = getValidPaylinesForBoard(boardType, paylines);
  const winningLines: LineWinResult[] = [];
  let totalPayoutAmount = 0;
  let totalMultiplier = 0;

  for (const line of validPaylines) {
    if (line.coordinates.length === 0) continue;

    // Get all symbol IDs along this payline
    const lineSymbols = line.coordinates.map(coord => grid[coord.col]?.[coord.row]);

    // Find the best winning candidate among active symbols (excluding 'cash')
    let bestSymbol: SlotSymbolConfig | null = null;
    let bestMultiplier = 0;

    for (const sym of symbols) {
      if (!sym.isActive || sym.id === 'cash') continue;

      // Check if all symbols on this line match 'sym.id' or are wild card 'wild'
      const isMatch = lineSymbols.every(id => id === sym.id || id === 'wild');
      if (isMatch) {
        const matchCount = lineSymbols.length;
        const multiplier = sym.payouts[matchCount] || 0;
        if (multiplier > bestMultiplier) {
          bestMultiplier = multiplier;
          bestSymbol = sym;
        }
      }
    }

    if (bestSymbol && bestMultiplier > 0) {
      const payoutAmount = bet * bestMultiplier;
      totalPayoutAmount += payoutAmount;
      totalMultiplier += bestMultiplier;

      winningLines.push({
        paylineId: line.id,
        paylineName: line.name,
        symbolId: bestSymbol.id,
        symbolName: bestSymbol.name,
        coordinates: [...line.coordinates],
        matchCount: lineSymbols.length,
        multiplier: bestMultiplier,
        payoutAmount,
      });
    }
  }

  // Evaluate special cash symbols collection
  const cashCoords: { col: number; row: number }[] = [];
  for (let c = 0; c < grid.length; c++) {
    for (let r = 0; r < grid[c].length; r++) {
      if (grid[c]?.[r] === 'cash') {
        cashCoords.push({ col: c, row: r });
      }
    }
  }

  const minRequired = options?.minCashCardsForWin ?? 5;
  const singlePayAllowed = options?.cashCardSinglePay ?? false;

  if (cashCoords.length >= minRequired || (singlePayAllowed && cashCoords.length > 0)) {
    let combinedCashMultiplier = 0;
    let combinedPayout = 0;

    cashCoords.forEach(coord => {
      const mult = (cashGrid && cashGrid[coord.col] && cashGrid[coord.col][coord.row]) || 1;
      combinedCashMultiplier += mult;
      combinedPayout += mult * bet;
    });

    const cashSymbolInfo = symbols.find(s => s.id === 'cash') || { name: 'Dinheiro', id: 'cash' };
    const labelText = cashCoords.length >= minRequired
      ? `${cashCoords.length}X CARTAS DE DINHEIRO (PRÊMIO COMPLETO)!`
      : `CARTAS DE DINHEIRO (${cashCoords.length}x)!`;

    winningLines.push({
      paylineId: 'cash_collect_bonus',
      paylineName: labelText,
      symbolId: 'cash',
      symbolName: cashSymbolInfo.name,
      coordinates: cashCoords,
      matchCount: cashCoords.length,
      multiplier: combinedCashMultiplier,
      payoutAmount: combinedPayout,
    });

    totalPayoutAmount += combinedPayout;
    totalMultiplier += combinedCashMultiplier;
  }

  // Evaluate Scatter Bonus Trigger Cards (Anywhere on board, no payline required)
  const bonusSymbolTarget = options?.bonusTriggerSymbolId || 'crown';
  const minBonusCardsReq = options?.bonusMinCardsCount ?? 3;
  const bonusCoords: { col: number; row: number }[] = [];

  for (let c = 0; c < grid.length; c++) {
    for (let r = 0; r < grid[c].length; r++) {
      if (grid[c]?.[r] === bonusSymbolTarget) {
        bonusCoords.push({ col: c, row: r });
      }
    }
  }

  let isBonusTriggered = false;
  if (bonusCoords.length >= minBonusCardsReq) {
    isBonusTriggered = true;
    const bonusSymbolInfo = symbols.find(s => s.id === bonusSymbolTarget) || { name: 'Símbolo Bônus', id: bonusSymbolTarget };
    const instantMult = options?.bonusInstantPayMultiplier ?? 5;
    const instantPayout = bet * instantMult;

    winningLines.push({
      paylineId: 'bonus_scatter_trigger',
      paylineName: `🎉 BÔNUS ATIVADO! (${bonusCoords.length}x ${bonusSymbolInfo.name.toUpperCase()})`,
      symbolId: bonusSymbolTarget,
      symbolName: bonusSymbolInfo.name,
      coordinates: bonusCoords,
      matchCount: bonusCoords.length,
      multiplier: instantMult,
      payoutAmount: instantPayout,
    });

    totalPayoutAmount += instantPayout;
    totalMultiplier += instantMult;
  }

  return {
    winningLines,
    totalPayoutAmount,
    totalMultiplier,
    isBonusTriggered,
  };
}

// ---------------------------------------------------------
// 5. LOCAL PERSISTENCE SYSTEM (SISTEMA DE CONFIGURAÇÃO)
// ---------------------------------------------------------

const LOCAL_STORAGE_KEY = 'slot_platform_engine_v1';

export function loadEngineConfig(): SlotEngineConfig {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.symbols && parsed.paylines && parsed.symbols.length > 0) {
        const hasCash = parsed.symbols.some((s: any) => s.id === 'cash');
        if (!hasCash) {
          parsed.symbols.push({
            id: 'cash',
            name: 'Dinheiro',
            image: '💵',
            weight: 25,
            payouts: {},
            fullScreenMultiplier: 0,
            isActive: true,
          });
        }
        const hasWild = parsed.symbols.some((s: any) => s.id === 'wild');
        if (!hasWild) {
          parsed.symbols.push({
            id: 'wild',
            name: 'Curinga',
            image: '🃏',
            weight: 12,
            payouts: { 3: 30, 4: 100, 5: 500 },
            fullScreenMultiplier: 1000,
            isActive: true,
          });
        }
        const hasActive = parsed.symbols.some((s: any) => s.isActive);
        if (!hasActive) {
          parsed.symbols.forEach((s: any) => { s.isActive = true; });
        }
        return parsed as SlotEngineConfig;
      }
    }
  } catch (err) {
    console.error('Falha ao ler configuração do motor:', err);
  }

  // Return fresh initial default configuration
  const defaultConfig: SlotEngineConfig = {
    boardType: '5x3',
    symbols: [...DEFAULT_SYMBOLS],
    paylines: [...DEFAULT_PAYLINES],
    targetRtp: 96.5,
  };
  saveEngineConfig(defaultConfig);
  return defaultConfig;
}

export function saveEngineConfig(config: SlotEngineConfig): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Falha ao salvar configuração do motor:', err);
  }
}

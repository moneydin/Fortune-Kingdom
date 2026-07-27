import React, { useState, useEffect, useRef } from 'react';
import { Menu, ShieldAlert, Volume2, VolumeX, Plus, Minus, Trophy, Coins, Play, Square, Settings2, Zap } from 'lucide-react';
import { SlotMachine } from './components/SlotMachine';
import { SpinButton } from './components/SpinButton';
import { GameMenuModal } from './components/GameMenuModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { BackgroundMedia } from './components/BackgroundMedia';
import { CounterUpAnimation } from './components/CounterUpAnimation';
import { motion } from 'motion/react';
import { GameState, SymbolType, AdminConfig, GameSettings, SpinHistoryItem, CustomButtonConfig } from './types';
import { 
  SlotEngineConfig, 
  loadEngineConfig, 
  saveEngineConfig, 
  generateBoardGrid, 
  evaluateBoardWins, 
  getBoardDimensions,
  getRandomCashMultiplier,
  LineWinResult 
} from './slotEngine';

const ADMIN_CONFIG_KEY = 'slot_platform_admin_v1';

const defaultAdminConfig: AdminConfig = {
  targetRtp: 96.5,
  volatility: 'medium',
  forcedOutcome: 'none',
  minBet: 1.00,
  maxBet: 500.00,
  betPresets: [1.00, 2.00, 5.00, 10.00, 20.00, 50.00, 100.00, 200.00, 500.00],
  totalSpins: 0,
  totalWagered: 0,
  totalPayout: 0,
  autoWinBoost: false,
  bgImage: '/background.jpg',
  bgPosX: 0,
  bgPosY: 0,
  bgZoom: 100,
  bgMediaType: 'auto',
  slotTop: 28,
  slotLeft: 4,
  slotWidth: 92,
  slotHeight: 38,
  spinBottom: 12,
  spinLeft: 50,
  spinScale: 110,
  customSymbols: {},
  boardType: '5x3',
  customCashMultipliers: [1, 2, 5, 10, 20, 50, 100],
  customCashImages: {},

  // Buy Bonus Defaults
  enableBuyBonus: true,
  buyBonusMultiplier: 50,
  bonusFreeSpinsCount: 10,
  bonusMultiplierBoost: 2,
  bonusForceWinType: 'big_win',
  bonusMediaUrl: '',

  // UI elements customization default
  showHeader: true,
  showBalance: true,
  showBetController: true,
  showWinBanner: true,
  slotFrameColor: '#ffb700',
  slotFrameBgOpacity: 70,
  slotFrameBorderWidth: 4,
  slotFrameBgColor: 'rgba(0,0,0,0.65)',
  spinButtonLabel: 'GIRAR',
  spinButtonColor: 'gold',

  // Default beautiful custom buttons with functions
  customButtons: [
    {
      id: 'btn-suporte',
      label: '💬 Suporte',
      actionType: 'support_alert',
      actionValue: 'Olá! Para falar conosco, acesse nosso suporte 24h em t.me/casino_suporte_demo',
      posX: 16,
      posY: 87,
      scale: 100,
      bgColor: 'bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/30 shadow-[0_2px_10px_rgba(16,185,129,0.3)]',
      textColor: 'text-white',
      isActive: true
    },
    {
      id: 'btn-mega-win',
      label: '⚡ Forçar Mega Win',
      actionType: 'force_big_win',
      actionValue: '',
      posX: 84,
      posY: 87,
      scale: 100,
      bgColor: 'bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 shadow-[0_2px_10px_rgba(79,70,229,0.3)]',
      textColor: 'text-white',
      isActive: true
    }
  ]
};

function loadAdminConfig(): AdminConfig {
  try {
    const stored = localStorage.getItem(ADMIN_CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Deep merge customButtons if present, or use defaults
      const merged = { ...defaultAdminConfig, ...parsed };
      if (parsed.customButtons && Array.isArray(parsed.customButtons)) {
        merged.customButtons = parsed.customButtons;
      }
      return merged;
    }
  } catch (err) {
    console.error('Failed to load admin config:', err);
  }
  return defaultAdminConfig;
}

function saveAdminConfig(config: AdminConfig) {
  try {
    localStorage.setItem(ADMIN_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save admin config:', err);
  }
}

export default function App() {
  const [adminConfig, setAdminConfig] = useState<AdminConfig>(() => loadAdminConfig());

  const [gameState, setGameState] = useState<GameState>(() => {
    const initialConfig = loadAdminConfig();
    return {
      balance: 25680.00,
      bet: initialConfig.betPresets && initialConfig.betPresets.length > 0 
        ? initialConfig.betPresets[0] 
        : initialConfig.minBet,
      win: 0,
      isSpinning: false,
      progression: 95,
      bigWin: false,
      inBonusRound: false,
      bonusSpinsRemaining: 0,
      bonusTotalWin: 0,
    };
  });

  const [engineConfig, setEngineConfig] = useState<SlotEngineConfig>(() => loadEngineConfig());

  const [gameSettings, setGameSettings] = useState<GameSettings>({
    soundEnabled: true,
    musicEnabled: true,
    turboMode: false,
    autoSpinCount: 0,
    isAutoSpinning: false,
  });

  const gameSettingsRef = useRef<GameSettings>(gameSettings);
  useEffect(() => {
    gameSettingsRef.current = gameSettings;
  }, [gameSettings]);

  const [spinHistory, setSpinHistory] = useState<SpinHistoryItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [bonusFinalWin, setBonusFinalWin] = useState<number | null>(null);
  const [isBuyBonusConfirmOpen, setIsBuyBonusConfirmOpen] = useState<boolean>(false);

  // States for Full Screen (Tela Cheia) Celebration Overlay
  const [fullScreenCelebration, setFullScreenCelebration] = useState<{
    symbolId: string;
    symbolName: string;
    payout: number;
    mediaUrl?: string;
    imageEmoji: string;
  } | null>(null);

  // States for Auto Spin popover on main screen
  const [isAutoSpinPopoverOpen, setIsAutoSpinPopoverOpen] = useState<boolean>(false);
  const [localAutoSpinCount, setLocalAutoSpinCount] = useState<number>(25);
  const [localStopOnBonus, setLocalStopOnBonus] = useState<boolean>(true);
  const [localStopOnWin, setLocalStopOnWin] = useState<number>(0);
  const [localStopOnDrop, setLocalStopOnDrop] = useState<number>(0);
  const [localStopOnIncrease, setLocalStopOnIncrease] = useState<number>(0);
  const [buyBonusBet, setBuyBonusBet] = useState<number>(1.00);
  const [reelsStopTrigger, setReelsStopTrigger] = useState<boolean>(false);
  const [hasAnticipation, setHasAnticipation] = useState<boolean>(false);

  const [grid, setGrid] = useState<string[][]>(() => generateBoardGrid(engineConfig.boardType, engineConfig.symbols));
  const [cashGrid, setCashGrid] = useState<number[][]>(() => {
    const { cols, rows } = getBoardDimensions(engineConfig.boardType);
    return Array(cols).fill(null).map(() => 
      Array(rows).fill(null).map(() => getRandomCashMultiplier(adminConfig.customCashMultipliers))
    );
  });
  const [winningLines, setWinningLines] = useState<LineWinResult[]>([]);
  const [activeWinLineIndex, setActiveWinLineIndex] = useState<number | null>(null);

  // Sync game layout automatically when engine configuration alters
  useEffect(() => {
    setGrid(generateBoardGrid(engineConfig.boardType, engineConfig.symbols));
    const { cols, rows } = getBoardDimensions(engineConfig.boardType);
    setCashGrid(Array(cols).fill(null).map(() => 
      Array(rows).fill(null).map(() => getRandomCashMultiplier(adminConfig.customCashMultipliers))
    ));
    setWinningLines([]);
    setActiveWinLineIndex(null);
  }, [engineConfig.boardType, engineConfig.symbols, adminConfig.customCashMultipliers]);

  // Global keyboard shortcut to open Admin Panel (Press "A")
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement | null;
      const isInput = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable);
      if (isInput) return;

      if (e.key === 'a' || e.key === 'A') {
        setIsAdminOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Keep player bet within safety boundaries when min/max limits change
  useEffect(() => {
    if (gameState.bet < adminConfig.minBet) {
      setGameState(prev => ({ ...prev, bet: adminConfig.minBet }));
    } else if (gameState.bet > adminConfig.maxBet) {
      setGameState(prev => ({ ...prev, bet: adminConfig.maxBet }));
    }
  }, [adminConfig.minBet, adminConfig.maxBet]);

  const handleBetChange = (direction: number) => {
    if (gameState.isSpinning) return;
    
    const presets = adminConfig.betPresets || [1.00, 2.00, 5.00, 10.00, 20.00, 50.00, 100.00, 200.00, 500.00];
    
    // Filter and sort the preset values based on the admin min/max limits
    const activePresets = presets
      .filter(p => p >= adminConfig.minBet && p <= adminConfig.maxBet)
      .sort((a, b) => a - b);
    
    if (activePresets.length === 0) {
      // Fallback in case no presets fit within current range
      const step = direction > 0 ? 5 : -5;
      const newBet = Math.max(adminConfig.minBet, Math.min(adminConfig.maxBet, gameState.bet + step));
      setGameState(prev => ({ ...prev, bet: newBet }));
      return;
    }

    // Find current index of active bet or the closest match
    let currentIndex = activePresets.indexOf(gameState.bet);
    if (currentIndex === -1) {
      let closestIdx = 0;
      let minDiff = Infinity;
      for (let i = 0; i < activePresets.length; i++) {
        const diff = Math.abs(activePresets[i] - gameState.bet);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      }
      currentIndex = closestIdx;
    }

    // Determine the next index
    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = 0;
    if (nextIndex >= activePresets.length) nextIndex = activePresets.length - 1;

    setGameState(prev => ({ ...prev, bet: activePresets[nextIndex] }));
  };

  const handleSpin = () => {
    if (gameState.isSpinning) return;

    const isBonusSpin = !!gameState.inBonusRound && (gameState.bonusSpinsRemaining ?? 0) > 0;
    const currentBet = gameState.bet;
    const cost = isBonusSpin ? 0 : currentBet;

    if (!isBonusSpin && gameState.balance < currentBet) {
      alert('Saldo insuficiente para girar!');
      return;
    }

    // Reset animations & charge bet
    setWinningLines([]);
    setActiveWinLineIndex(null);
    setReelsStopTrigger(true);
    setHasAnticipation(false);
    
    setGameState(prev => {
      const nextRemaining = isBonusSpin ? (prev.bonusSpinsRemaining ?? 1) - 1 : 0;
      return {
        ...prev,
        balance: prev.balance - cost,
        win: 0,
        isSpinning: true,
        bigWin: false,
        bonusSpinsRemaining: isBonusSpin ? nextRemaining : prev.bonusSpinsRemaining,
      };
    });

    // Generate outcome using the dynamic Slot Engine
    const dims = getBoardDimensions(engineConfig.boardType);
    let resultCashGrid = Array(dims.cols).fill(null).map(() => 
      Array(dims.rows).fill(null).map(() => getRandomCashMultiplier(adminConfig.customCashMultipliers))
    );

    let resultGrid = generateBoardGrid(engineConfig.boardType, engineConfig.symbols);
    let evaluation = evaluateBoardWins(resultGrid, engineConfig.boardType, engineConfig.symbols, engineConfig.paylines, currentBet, resultCashGrid);

    // Determine what forced outcome to use
    let forced = adminConfig.forcedOutcome;
    if (isBonusSpin && adminConfig.bonusForceWinType && adminConfig.bonusForceWinType !== 'none') {
      forced = adminConfig.bonusForceWinType;
    }

    // Realistic math-based cheat mechanism
    if (forced === 'full_screen') {
      const activeSymbolsWithFs = engineConfig.symbols.filter(s => s.isActive && s.fullScreenMultiplier && s.fullScreenMultiplier > 0);
      if (activeSymbolsWithFs.length > 0) {
        const chosenSym = activeSymbolsWithFs[Math.floor(Math.random() * activeSymbolsWithFs.length)];
        const { cols, rows } = getBoardDimensions(engineConfig.boardType);
        resultGrid = Array(cols).fill(null).map(() => Array(rows).fill(chosenSym.id));
        evaluation = evaluateBoardWins(resultGrid, engineConfig.boardType, engineConfig.symbols, engineConfig.paylines, currentBet, resultCashGrid);
      }
    } else if (forced === 'big_win') {
      let attempts = 0;
      while (evaluation.totalPayoutAmount < currentBet * 15 && attempts < 1000) {
        resultGrid = generateBoardGrid(engineConfig.boardType, engineConfig.symbols);
        resultCashGrid = Array(dims.cols).fill(null).map(() => 
          Array(dims.rows).fill(null).map(() => getRandomCashMultiplier(adminConfig.customCashMultipliers))
        );
        evaluation = evaluateBoardWins(resultGrid, engineConfig.boardType, engineConfig.symbols, engineConfig.paylines, currentBet, resultCashGrid);
        attempts++;
      }
    } else if (forced === 'normal_win') {
      let attempts = 0;
      while ((evaluation.totalPayoutAmount === 0 || evaluation.totalPayoutAmount >= currentBet * 15) && attempts < 1000) {
        resultGrid = generateBoardGrid(engineConfig.boardType, engineConfig.symbols);
        resultCashGrid = Array(dims.cols).fill(null).map(() => 
          Array(dims.rows).fill(null).map(() => getRandomCashMultiplier(adminConfig.customCashMultipliers))
        );
        evaluation = evaluateBoardWins(resultGrid, engineConfig.boardType, engineConfig.symbols, engineConfig.paylines, currentBet, resultCashGrid);
        attempts++;
      }
    } else if (forced === 'loss') {
      let attempts = 0;
      while (evaluation.totalPayoutAmount > 0 && attempts < 1000) {
        resultGrid = generateBoardGrid(engineConfig.boardType, engineConfig.symbols);
        resultCashGrid = Array(dims.cols).fill(null).map(() => 
          Array(dims.rows).fill(null).map(() => getRandomCashMultiplier(adminConfig.customCashMultipliers))
        );
        evaluation = evaluateBoardWins(resultGrid, engineConfig.boardType, engineConfig.symbols, engineConfig.paylines, currentBet, resultCashGrid);
        attempts++;
      }
    } else if (forced === 'force_cash_collect') {
      const { cols, rows } = getBoardDimensions(engineConfig.boardType);
      resultGrid = Array(cols).fill(null).map(() => Array(rows).fill(''));
      
      const allCoords: { col: number; row: number }[] = [];
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          allCoords.push({ col: c, row: r });
        }
      }
      
      for (let i = allCoords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = allCoords[i];
        allCoords[i] = allCoords[j];
        allCoords[j] = temp;
      }
      
      for (let i = 0; i < 5; i++) {
        const coord = allCoords[i];
        resultGrid[coord.col][coord.row] = 'cash';
      }
      
      const activeNonCashSymbols = engineConfig.symbols.filter(s => s.isActive && s.id !== 'cash');
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          if (resultGrid[c][r] !== 'cash') {
            const sym = activeNonCashSymbols[Math.floor(Math.random() * activeNonCashSymbols.length)];
            resultGrid[c][r] = sym ? sym.id : 'crown';
          }
        }
      }
      
      resultCashGrid = Array(cols).fill(null).map(() => 
        Array(rows).fill(null).map(() => getRandomCashMultiplier(adminConfig.customCashMultipliers))
      );
      evaluation = evaluateBoardWins(resultGrid, engineConfig.boardType, engineConfig.symbols, engineConfig.paylines, currentBet, resultCashGrid);
    }

    // Reset cheat trigger if it was a manual forced outcome (non-bonus)
    if (!isBonusSpin && adminConfig.forcedOutcome !== 'none') {
      setAdminConfig(prev => {
        const updated = { ...prev, forcedOutcome: 'none' as const };
        saveAdminConfig(updated);
        return updated;
      });
    }

    // Determine anticipation condition: high special symbols in columns 0..N-2
    const cols = dims.cols;
    let isAnticipating = false;
    if (cols >= 3) {
      let specialSymbolCount = 0;
      for (let c = 0; c < cols - 1; c++) {
        specialSymbolCount += resultGrid[c].filter(sym => sym === 'cash' || sym === 'wild' || sym === 'Dragon' || sym === 'Crown').length;
      }
      if (specialSymbolCount >= 3) {
        isAnticipating = true;
      }
    }
    setHasAnticipation(isAnticipating);

    // Load actual grid state
    setGrid(resultGrid);
    setCashGrid(resultCashGrid);

    const spinDuration = gameSettings.turboMode ? 600 : 1500;
    const isAnticipatingNow = isAnticipating && !gameSettings.turboMode;
    const stopPresentationDelay = isAnticipatingNow ? 2000 : 0;

    // Trigger sequential reels stagger stop
    setTimeout(() => {
      setReelsStopTrigger(false);
    }, spinDuration);

    // Present outcomes after all reels (including anticipation) have come to a complete halt
    setTimeout(() => {
      const hasWins = evaluation.winningLines.length > 0;
      
      let payout = evaluation.totalPayoutAmount;
      // Multiplier boost during bonus round!
      if (isBonusSpin && adminConfig.bonusMultiplierBoost && adminConfig.bonusMultiplierBoost > 1) {
        payout = payout * adminConfig.bonusMultiplierBoost;
        // Adjust the evaluation win values so they match the visual representation
        evaluation.totalPayoutAmount = payout;
        evaluation.winningLines = evaluation.winningLines.map(line => ({
          ...line,
          payoutAmount: line.payoutAmount * (adminConfig.bonusMultiplierBoost || 1),
          multiplier: line.multiplier * (adminConfig.bonusMultiplierBoost || 1)
        }));
      }

      if (hasWins) {
        setWinningLines(evaluation.winningLines);
        setActiveWinLineIndex(0); // Trigger visual payline painter cycle

        // Check if there's a full-screen win (tela cheia)
        const fsWin = evaluation.winningLines.find(line => line.paylineId === 'full_screen_bonus');
        if (fsWin) {
          const symbolId = fsWin.symbolId;
          const symbolInfo = engineConfig.symbols.find(s => s.id === symbolId);
          if (symbolInfo) {
            setFullScreenCelebration({
              symbolId,
              symbolName: symbolInfo.name,
              payout,
              mediaUrl: symbolInfo.fullScreenMedia,
              imageEmoji: symbolInfo.image,
            });
          }
        }
      }

      setGameState(prev => {
        const nextBonusTotalWin = isBonusSpin ? (prev.bonusTotalWin ?? 0) + payout : prev.bonusTotalWin;
        const stillInBonus = isBonusSpin ? (prev.bonusSpinsRemaining ?? 1) - 1 > 0 : prev.inBonusRound;
        
        if (isBonusSpin && !stillInBonus) {
          setBonusFinalWin(nextBonusTotalWin);
        }

        return {
          ...prev,
          isSpinning: false,
          win: payout,
          balance: prev.balance + payout,
          bigWin: payout >= currentBet * 15,
          progression: Math.min(100, prev.progression + (hasWins ? 2.5 : 0.5)),
          bonusTotalWin: nextBonusTotalWin,
          inBonusRound: stillInBonus,
        };
      });

      // Update casino math records and persist to localStorage
      setAdminConfig(prev => {
        const updated = {
          ...prev,
          totalSpins: prev.totalSpins + 1,
          totalWagered: prev.totalWagered + cost,
          totalPayout: prev.totalPayout + payout,
        };
        saveAdminConfig(updated);
        return updated;
      });

      // Add to Spin Logs History
      const now = new Date();
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      setSpinHistory(prev => [
        {
          id: Math.random().toString(36).substring(2, 11),
          time: timeStr,
          bet: currentBet,
          win: payout,
          multiplier: currentBet > 0 ? payout / currentBet : 0,
          symbols: resultGrid.map(col => col[0] || ''),
          isBonusSpin: isBonusSpin,
        },
        ...prev.slice(0, 49),
      ]);

      // Auto spin check using safe synchronized ref to avoid closures lag
      const currentSettings = gameSettingsRef.current;
      if (currentSettings.isAutoSpinning) {
        let shouldStop = false;
        let stopReason = "";

        // 1. Check if bonus was triggered
        const stillInBonusNow = isBonusSpin ? (gameState.bonusSpinsRemaining ?? 1) - 1 > 0 : gameState.inBonusRound;
        const justEnteredBonus = !isBonusSpin && stillInBonusNow;
        if (currentSettings.stopOnBonusTrigger && justEnteredBonus) {
          shouldStop = true;
          stopReason = "Bônus ativado!";
        }

        // 2. Check if single win exceeds
        if (!shouldStop && currentSettings.stopOnWinExceeds && currentSettings.stopOnWinExceeds > 0 && payout >= currentSettings.stopOnWinExceeds) {
          shouldStop = true;
          stopReason = `Ganho de R$ ${payout.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} superou o limite de R$ ${currentSettings.stopOnWinExceeds.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        }

        // Calculate theoretical next balance after deducting bet and adding win
        const theoreticalBalance = gameState.balance - cost + payout;

        // 3. Check if balance drops below
        if (!shouldStop && currentSettings.stopOnBalanceDrop && currentSettings.stopOnBalanceDrop > 0 && theoreticalBalance <= currentSettings.stopOnBalanceDrop) {
          shouldStop = true;
          stopReason = `Saldo de R$ ${theoreticalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} caiu abaixo do limite de R$ ${currentSettings.stopOnBalanceDrop.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        }

        // 4. Check if balance increases above
        if (!shouldStop && currentSettings.stopOnBalanceIncrease && currentSettings.stopOnBalanceIncrease > 0 && theoreticalBalance >= currentSettings.stopOnBalanceIncrease) {
          shouldStop = true;
          stopReason = `Saldo de R$ ${theoreticalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} subiu acima do limite de R$ ${currentSettings.stopOnBalanceIncrease.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        }

        if (shouldStop) {
          setGameSettings(prev => ({
            ...prev,
            isAutoSpinning: false,
            autoSpinCount: 0
          }));
          alert(`Giros Automáticos Parados: ${stopReason}`);
        } else {
          if (currentSettings.autoSpinCount > 1 && currentSettings.autoSpinCount !== 9999) {
            setGameSettings(prev => ({ ...prev, autoSpinCount: prev.autoSpinCount - 1 }));
          } else if (currentSettings.autoSpinCount === 9999) {
            // Infinite spins, do not decrement
          } else {
            setGameSettings(prev => ({ ...prev, isAutoSpinning: false, autoSpinCount: 0 }));
          }
        }
      }
    }, spinDuration);
  };

  const handleBuyBonusClick = () => {
    if (gameState.isSpinning || gameState.inBonusRound) return;
    setBuyBonusBet(gameState.bet);
    setIsBuyBonusConfirmOpen(true);
  };

  const handleConfirmBuyBonus = () => {
    setIsBuyBonusConfirmOpen(false);
    
    const multiplier = adminConfig.buyBonusMultiplier ?? 50;
    const cost = buyBonusBet * multiplier;
    
    if (gameState.balance < cost) {
      alert(`Saldo insuficiente! Comprar Bônus custa R$ ${cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Aposta x${multiplier}).`);
      return;
    }
    
    setWinningLines([]);
    setActiveWinLineIndex(null);
    setGameState(prev => ({
      ...prev,
      bet: buyBonusBet,
      balance: prev.balance - cost,
      win: 0,
      inBonusRound: true,
      bonusSpinsRemaining: adminConfig.bonusFreeSpinsCount ?? 10,
      bonusTotalWin: 0,
    }));
  };

  const handleCustomButtonAction = (btn: CustomButtonConfig) => {
    if (gameState.isSpinning) return;
    switch (btn.actionType) {
      case 'add_balance': {
        const amt = parseFloat(btn.actionValue) || 1000;
        setGameState(prev => ({ ...prev, balance: prev.balance + amt }));
        break;
      }
      case 'reset_balance': {
        setGameState(prev => ({ ...prev, balance: 0 }));
        break;
      }
      case 'force_big_win': {
        setAdminConfig(prev => {
          const updated = { ...prev, forcedOutcome: 'big_win' as const };
          saveAdminConfig(updated);
          return updated;
        });
        alert('Próxima rodada configurada para MEGA WIN!');
        break;
      }
      case 'force_bonus': {
        setWinningLines([]);
        setActiveWinLineIndex(null);
        setGameState(prev => ({
          ...prev,
          win: 0,
          inBonusRound: true,
          bonusSpinsRemaining: adminConfig.bonusFreeSpinsCount ?? 10,
          bonusTotalWin: 0,
        }));
        alert('Modo BÔNUS ativado com sucesso (Grátis)!');
        break;
      }
      case 'support_alert': {
        alert(btn.actionValue || 'Suporte acionado!');
        break;
      }
      case 'redirect_url': {
        if (btn.actionValue) {
          window.open(btn.actionValue, '_blank');
        } else {
          alert('Link não configurado.');
        }
        break;
      }
    }
  };

  // Auto spin trigger effect with turbo mode and balance protection
  useEffect(() => {
    if (gameSettings.isAutoSpinning && !gameState.isSpinning && !fullScreenCelebration) {
      if (gameState.balance < gameState.bet && !gameState.inBonusRound) {
        setGameSettings(prev => ({ ...prev, isAutoSpinning: false, autoSpinCount: 0 }));
        alert('Giros automáticos parados: Saldo insuficiente.');
        return;
      }
      
      const delay = gameSettings.turboMode ? 200 : 800;
      const timer = setTimeout(() => {
        handleSpin();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [gameSettings.isAutoSpinning, gameState.isSpinning, gameState.balance, fullScreenCelebration]);

  // Sequential win presentation effect
  useEffect(() => {
    if (winningLines.length <= 1 || fullScreenCelebration) {
      return;
    }
    
    if (activeWinLineIndex !== null) {
      const timer = setTimeout(() => {
        setActiveWinLineIndex(prev => {
          if (prev === null) return 0;
          return (prev + 1) % winningLines.length;
        });
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [winningLines, activeWinLineIndex, fullScreenCelebration]);

  // Auto play free spins in bonus round sequentially
  useEffect(() => {
    if (gameState.inBonusRound && (gameState.bonusSpinsRemaining ?? 0) > 0 && !gameState.isSpinning && !fullScreenCelebration) {
      const timer = setTimeout(() => {
        handleSpin();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.inBonusRound, gameState.bonusSpinsRemaining, gameState.isSpinning, fullScreenCelebration]);

  // Combine engine-defined symbol images/emojis and custom user uploaded images
  const customSymbolsMap: Partial<Record<string, string>> = {};
  engineConfig.symbols.forEach(sym => {
    customSymbolsMap[sym.id] = sym.image;
  });
  Object.entries(adminConfig.customSymbols || {}).forEach(([key, val]) => {
    if (val) customSymbolsMap[key] = val as string;
  });

  // Calculate highlighted cells for sequential win animations
  const highlightedCells = activeWinLineIndex !== null && winningLines[activeWinLineIndex]
    ? winningLines[activeWinLineIndex].coordinates
    : winningLines.flatMap(line => line.coordinates);

  return (
    <div className="relative w-full h-screen h-[100dvh] bg-[#0a0b12] font-sans text-white flex items-center justify-center overflow-hidden touch-none select-none p-0 sm:p-4">
      
      {/* Game Stage - Mobile-first portrait layout (9:16) for absolute placement precision */}
      <div 
        className="relative w-full max-w-[min(100vw,calc(100vh*9/16))] h-full max-h-[min(100dvh,calc(100vw*16/9))] sm:max-h-[840px] aspect-[9/16] bg-[#050914] sm:rounded-[36px] sm:border-[10px] sm:border-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden flex items-center justify-center transition-all duration-100"
      >
        {/* Background Media Layer (Image or Infinite Loop Video) */}
        <BackgroundMedia 
          src={adminConfig.bgImage}
          posX={adminConfig.bgPosX}
          posY={adminConfig.bgPosY}
          zoom={adminConfig.bgZoom}
          mediaType={adminConfig.bgMediaType}
        />

        {/* TOP INTERFACE BAR */}
        {(adminConfig.showHeader !== false) && (
          <div className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-4 z-30 flex items-center justify-between pointer-events-auto">
            
            {/* Balance Widget */}
            {(adminConfig.showBalance !== false) && (
              <div className="flex items-center gap-1.5 sm:gap-3 bg-black/70 backdrop-blur-md px-2.5 py-1 sm:px-4 sm:py-2 rounded-xl border border-[#d4af37]/40 shadow-lg">
                <Coins className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-yellow-400" />
                <div className="flex flex-col">
                  <span className="text-[9px] sm:text-[10px] text-yellow-500 font-bold uppercase tracking-wider">Saldo</span>
                  <span className="text-xs sm:text-base font-extrabold text-white">
                    R$ {gameState.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            {/* Win & Bet Quick Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
              
              {/* Bet Controller */}
              {(adminConfig.showBetController !== false) && (
                <div className="flex items-center bg-black/70 backdrop-blur-md px-2 py-1 rounded-xl border border-[#8b6914]/40 gap-1 sm:gap-2">
                  <button 
                    onClick={() => handleBetChange(-1)}
                    disabled={gameState.isSpinning || !!gameState.inBonusRound}
                    className="w-5 h-5 sm:w-7 sm:h-7 rounded-lg bg-[#8b6914]/30 hover:bg-[#d4af37]/40 flex items-center justify-center text-white disabled:opacity-50 cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <div className="flex flex-col items-center px-1">
                    <span className="text-[8px] sm:text-[9px] text-gray-400 uppercase font-bold">Aposta</span>
                    <span className="text-xs sm:text-sm font-bold text-yellow-300">R$ {gameState.bet.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => handleBetChange(1)}
                    disabled={gameState.isSpinning || !!gameState.inBonusRound}
                    className="w-5 h-5 sm:w-7 sm:h-7 rounded-lg bg-[#8b6914]/30 hover:bg-[#d4af37]/40 flex items-center justify-center text-white disabled:opacity-50 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Win Display */}
              {gameState.win > 0 && (
                <div className="flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/50 px-2.5 py-1 rounded-xl animate-bounce">
                  <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs sm:text-sm font-black text-emerald-300">
                    +R$ {gameState.win.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Menu Button */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-1.5 sm:p-2 bg-black/70 backdrop-blur-md hover:bg-white/10 rounded-xl border border-[#d4af37]/40 text-[#d4af37] transition cursor-pointer"
                title="Menu Principal"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Admin Quick Trigger */}
              <button
                onClick={() => setIsAdminOpen(true)}
                className="p-1.5 sm:p-2 bg-red-950/80 backdrop-blur-md hover:bg-red-900 rounded-xl border border-red-500/50 text-red-300 transition cursor-pointer"
                title="Painel de Administração"
              >
                <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
              </button>

            </div>

          </div>
        )}

        {/* Emergency Admin Button if header is hidden */}
        {adminConfig.showHeader === false && (
          <button
            onClick={() => setIsAdminOpen(true)}
            className="absolute top-2 right-2 z-40 p-1.5 bg-black/60 hover:bg-black/90 text-white/40 hover:text-white rounded-lg border border-white/10 transition-all opacity-30 hover:opacity-100 cursor-pointer flex items-center gap-1 text-[9px]"
            title="Abrir Painel Admin"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
            <span className="font-bold">ADMIN</span>
          </button>
        )}

        {/* Sequential Animations Banner Overlay */}
        {(adminConfig.showWinBanner !== false) && activeWinLineIndex !== null && winningLines[activeWinLineIndex] && (
          <div className="absolute top-[18%] left-1/2 -translate-x-1/2 z-30 w-[85%] bg-gradient-to-r from-yellow-700/90 via-black/95 to-yellow-700/90 border-2 border-yellow-400 p-2 sm:p-2.5 rounded-xl text-center shadow-[0_4px_25px_rgba(251,191,36,0.6)] animate-bounce select-none pointer-events-none">
            <span className="text-[9px] sm:text-[10px] text-yellow-300 font-extrabold uppercase tracking-widest block leading-none mb-0.5 animate-pulse">
              Linha Vencedora! ({activeWinLineIndex + 1}/{winningLines.length})
            </span>
            <span className="text-xs sm:text-sm font-black text-white uppercase block leading-tight">
              {winningLines[activeWinLineIndex].paylineName}
            </span>
            <span className="text-xs font-extrabold text-amber-300 font-mono block leading-none mt-0.5">
              +R$ {winningLines[activeWinLineIndex].payoutAmount.toFixed(2)} (x{winningLines[activeWinLineIndex].multiplier})
            </span>
          </div>
        )}

        {/* FREE SPINS / BONUS ROUND ACTIVE DISPLAY HUD */}
        {!!gameState.inBonusRound && (
          <div className="absolute top-[17%] left-1/2 -translate-x-1/2 z-30 bg-gradient-to-r from-[#5a1212] via-[#240808] to-[#5a1212] border-2 border-red-500/80 px-4 py-1.5 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.5)] text-center animate-pulse flex flex-col items-center">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-red-400 leading-none">
              🔥 RODADAS GRÁTIS 🔥
            </span>
            <span className="text-sm sm:text-base font-extrabold text-white font-mono mt-0.5 leading-none">
              {gameState.bonusSpinsRemaining} Restantes
            </span>
            <span className="text-[9px] font-black text-yellow-400 mt-0.5">
              Ganho Total Bônus: R$ {(gameState.bonusTotalWin ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {/* Slot Machine Area - Positioned according to Admin Configuration */}
        <div 
          style={{
            top: `${adminConfig.slotTop ?? 32}%`,
            left: `${adminConfig.slotLeft ?? 30}%`,
            width: `${adminConfig.slotWidth ?? 40}%`,
            height: `${adminConfig.slotHeight ?? 40}%`,
            borderColor: adminConfig.slotFrameColor ?? '#ffb700',
            borderWidth: `${adminConfig.slotFrameBorderWidth ?? 4}px`,
            backgroundColor: adminConfig.slotFrameBgColor ?? 'rgba(0,0,0,0.65)',
            borderStyle: (adminConfig.slotFrameBorderWidth ?? 4) > 0 ? 'solid' : 'none',
          }}
          className="absolute flex items-center justify-center z-10 transition-all duration-100 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          <SlotMachine 
            isSpinning={reelsStopTrigger} 
            grid={grid} 
            customSymbols={customSymbolsMap}
            customSymbolConfigs={adminConfig.customSymbolConfigs}
            winningCells={highlightedCells}
            activeSymbols={engineConfig.symbols.filter(s => s.isActive).map(s => s.id)}
            noSlotMargins={adminConfig.noSlotMargins ?? false}
            cashGrid={cashGrid}
            bet={gameState.bet}
            hasAnticipation={hasAnticipation}
          />
        </div>

        {/* BUY BONUS FLOATING OPTION */}
        {adminConfig.enableBuyBonus !== false && !gameState.inBonusRound && (
          <button
            onClick={handleBuyBonusClick}
            disabled={gameState.isSpinning}
            style={{
              position: 'absolute',
              top: '71%',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
            className="z-20 px-4 py-1.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-400 text-black font-black text-[10px] sm:text-xs rounded-full shadow-[0_4px_15px_rgba(245,158,11,0.4)] hover:shadow-yellow-400/30 active:scale-95 transition pointer-events-auto cursor-pointer animate-pulse whitespace-nowrap uppercase tracking-wider border border-yellow-300"
          >
            ⭐ Comprar Bônus (x{adminConfig.buyBonusMultiplier ?? 50})
          </button>
        )}

        {/* ACTIVE CUSTOM BUTTONS ON THE SCREEN */}
        {adminConfig.customButtons?.filter(btn => btn.isActive).map(btn => (
          <button
            key={btn.id}
            onClick={() => handleCustomButtonAction(btn)}
            disabled={gameState.isSpinning}
            style={{
              position: 'absolute',
              top: `${btn.posY}%`,
              left: `${btn.posX}%`,
              transform: `translate(-50%, -50%) scale(${btn.scale / 100})`,
            }}
            className={`z-20 px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition pointer-events-auto cursor-pointer shadow-md select-none ${btn.bgColor} ${btn.textColor}`}
          >
            {btn.label}
          </button>
        ))}
        
        {/* Spin Button Area - Positioned according to Admin Configuration */}
        <div 
          style={{
            bottom: `${adminConfig.spinBottom ?? 4}%`,
            left: `${adminConfig.spinLeft ?? 50}%`,
            transform: `translateX(-50%) scale(${(adminConfig.spinScale ?? 100) / 100})`,
          }}
          className="absolute z-20 transition-all duration-100 flex items-center justify-center gap-2 sm:gap-3 pointer-events-auto"
        >
          {/* TURBO TOGGLE BUTTON */}
          <button
            onClick={() => setGameSettings(prev => ({ ...prev, turboMode: !prev.turboMode }))}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border flex flex-col items-center justify-center transition-all cursor-pointer select-none relative group ${
              gameSettings.turboMode
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                : 'bg-black/60 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
            }`}
            title="Modo Turbo"
          >
            <Zap className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${gameSettings.turboMode ? 'animate-pulse text-amber-400' : ''}`} />
            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-wider leading-none mt-0.5">
              Turbo
            </span>
          </button>

          {/* MAIN SPIN BUTTON */}
          <SpinButton 
            onSpin={handleSpin} 
            isSpinning={gameState.isSpinning}
            label={adminConfig.spinButtonLabel}
            color={adminConfig.spinButtonColor}
          />

          {/* AUTO SPIN PANEL TRIGGER */}
          <div className="relative">
            <button
              onClick={() => {
                if (gameSettings.isAutoSpinning) {
                  setGameSettings(prev => ({ ...prev, isAutoSpinning: false, autoSpinCount: 0 }));
                } else {
                  setIsAutoSpinPopoverOpen(!isAutoSpinPopoverOpen);
                }
              }}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
                gameSettings.isAutoSpinning
                  ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse'
                  : isAutoSpinPopoverOpen
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-black/60 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
              }`}
              title="Configurar/Iniciar Rodadas Automáticas"
            >
              {gameSettings.isAutoSpinning ? (
                <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-red-400" />
              ) : (
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-gray-400 group-hover:text-white" />
              )}
              <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-wider leading-none mt-0.5">
                {gameSettings.isAutoSpinning 
                  ? (gameSettings.autoSpinCount === 9999 ? '∞' : `${gameSettings.autoSpinCount}x`) 
                  : 'Auto'
                }
              </span>
            </button>

            {/* BEAUTIFUL AUTO SPIN CONFIG OVERLAY POPOVER */}
            {isAutoSpinPopoverOpen && !gameSettings.isAutoSpinning && (
              <div className="absolute bottom-12 right-1/2 translate-x-1/2 z-50 w-56 p-3 sm:p-4 bg-[#090b14]/95 border-2 border-amber-500 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.95)] text-white animate-in slide-in-from-bottom duration-200 pointer-events-auto">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2.5">
                  <h4 className="text-[10px] sm:text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
                    <Settings2 className="w-3.5 h-3.5" />
                    Auto Giros Config
                  </h4>
                  <button 
                    onClick={() => setIsAutoSpinPopoverOpen(false)}
                    className="text-gray-400 hover:text-white text-[10px] font-bold px-1"
                  >
                    X
                  </button>
                </div>

                {/* SPIN PRESET SELECTORS */}
                <div className="space-y-2.5">
                  <div>
                    <label className="text-[9px] text-gray-400 font-bold block mb-1">
                      Quantidade de Giros:
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {[10, 25, 50, 100].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setLocalAutoSpinCount(preset)}
                          className={`py-1 rounded font-bold text-[10px] border transition cursor-pointer ${
                            localAutoSpinCount === preset
                              ? 'bg-amber-500 border-amber-500 text-black'
                              : 'bg-black/50 border-white/10 text-gray-300 hover:border-amber-500/50'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      <button
                        onClick={() => setLocalAutoSpinCount(250)}
                        className={`py-1 rounded font-bold text-[10px] border transition cursor-pointer ${
                          localAutoSpinCount === 250
                            ? 'bg-amber-500 border-amber-500 text-black'
                            : 'bg-black/50 border-white/10 text-gray-300 hover:border-amber-500/50'
                        }`}
                      >
                        250x
                      </button>
                      <button
                        onClick={() => setLocalAutoSpinCount(9999)}
                        className={`py-1 rounded font-bold text-[10px] border transition cursor-pointer ${
                          localAutoSpinCount === 9999
                            ? 'bg-amber-500 border-amber-500 text-black'
                            : 'bg-black/50 border-white/10 text-gray-300 hover:border-amber-500/50'
                        }`}
                        title="Girar indefinidamente até atingir um limite ou saldo acabar"
                      >
                        Infinito (∞)
                      </button>
                    </div>
                  </div>

                  {/* ADVANCED STOPPING CONTROLS */}
                  <div className="border-t border-white/5 pt-2 space-y-1.5">
                    <span className="text-[8px] text-amber-500 font-extrabold uppercase tracking-wider block">
                      Condições de Parada:
                    </span>

                    {/* STOP ON BONUS TOGGLE */}
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-gray-300">Parar ao ativar Bônus</span>
                      <button
                        onClick={() => setLocalStopOnBonus(!localStopOnBonus)}
                        className={`w-7 h-4 rounded-full relative transition-colors cursor-pointer ${
                          localStopOnBonus ? 'bg-amber-500' : 'bg-gray-700'
                        }`}
                      >
                        <div className={`w-3 h-3 bg-black rounded-full absolute top-0.5 transition-transform ${localStopOnBonus ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    {/* STOP ON SINGLE WIN VALUE */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[8px] text-gray-400">
                        <span>Se único ganho exceder:</span>
                        <span className="text-amber-400 font-mono">{localStopOnWin > 0 ? `R$ ${localStopOnWin}` : 'Desat.'}</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={localStopOnWin || ''}
                        onChange={(e) => setLocalStopOnWin(Math.max(0, parseFloat(e.target.value) || 0))}
                        placeholder="R$ 0.00"
                        className="w-full px-1.5 py-0.5 bg-black border border-white/10 rounded text-[9px] font-mono text-white text-right"
                      />
                    </div>

                    {/* STOP ON BALANCE DECREASING BELOW */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[8px] text-gray-400">
                        <span>Se saldo cair abaixo de:</span>
                        <span className="text-red-400 font-mono">{localStopOnDrop > 0 ? `R$ ${localStopOnDrop}` : 'Desat.'}</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={localStopOnDrop || ''}
                        onChange={(e) => setLocalStopOnDrop(Math.max(0, parseFloat(e.target.value) || 0))}
                        placeholder="R$ 0.00"
                        className="w-full px-1.5 py-0.5 bg-black border border-white/10 rounded text-[9px] font-mono text-white text-right"
                      />
                    </div>

                    {/* STOP ON BALANCE INCREASING ABOVE */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[8px] text-gray-400">
                        <span>Se saldo subir acima de:</span>
                        <span className="text-emerald-400 font-mono">{localStopOnIncrease > 0 ? `R$ ${localStopOnIncrease}` : 'Desat.'}</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={localStopOnIncrease || ''}
                        onChange={(e) => setLocalStopOnIncrease(Math.max(0, parseFloat(e.target.value) || 0))}
                        placeholder="R$ 0.00"
                        className="w-full px-1.5 py-0.5 bg-black border border-white/10 rounded text-[9px] font-mono text-white text-right"
                      />
                    </div>
                  </div>

                  {/* CONFIRM START BUTTON */}
                  <button
                    onClick={() => {
                      setIsAutoSpinPopoverOpen(false);
                      setGameSettings(prev => ({
                        ...prev,
                        autoSpinCount: localAutoSpinCount,
                        isAutoSpinning: true,
                        stopOnBonusTrigger: localStopOnBonus,
                        stopOnWinExceeds: localStopOnWin > 0 ? localStopOnWin : undefined,
                        stopOnBalanceDrop: localStopOnDrop > 0 ? localStopOnDrop : undefined,
                        stopOnBalanceIncrease: localStopOnIncrease > 0 ? localStopOnIncrease : undefined,
                      }));
                    }}
                    className="w-full py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-[10px] uppercase tracking-wider rounded-lg transition cursor-pointer active:scale-95 shadow-md flex items-center justify-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Iniciar Auto Giros
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BONUS COMPLETED POPUP MODAL OVERLAY */}
        {bonusFinalWin !== null && (
          <div className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 pointer-events-auto overflow-hidden">
            
            {/* Background Media Layer for Bonus Completed */}
            {adminConfig.bonusMediaUrl && (
              <div className="absolute inset-0 w-full h-full z-0">
                {getYouTubeEmbedUrl(adminConfig.bonusMediaUrl) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(adminConfig.bonusMediaUrl)!}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; loop"
                    className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none scale-110"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                ) : (
                  adminConfig.bonusMediaUrl.match(/\.(mp4|webm|ogg|mov)/i) || adminConfig.bonusMediaUrl.includes('video') ? (
                    <video
                      src={adminConfig.bonusMediaUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none"
                    />
                  ) : (
                    <img
                      src={adminConfig.bonusMediaUrl}
                      alt="Bonus celebration background"
                      className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                  )
                )}
                {/* Subtle dark overlay to ensure text readability */}
                <div className="absolute inset-0 bg-black/45" />
              </div>
            )}

            <div className="relative z-10 max-w-xs sm:max-w-md bg-gradient-to-b from-[#221703]/90 to-[#0a0600]/95 backdrop-blur-md border-4 border-yellow-400 p-6 rounded-2xl shadow-[0_0_50px_rgba(251,191,36,0.5)]">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center border-4 border-yellow-300 animate-bounce">
                <Trophy className="w-10 h-10 text-black" />
              </div>
              <div className="mt-8">
                <h3 className="text-lg sm:text-xl font-black text-yellow-400 uppercase tracking-widest animate-pulse">
                  BÔNUS CONCLUÍDO!
                </h3>
                <p className="text-gray-400 text-[10px] uppercase font-extrabold tracking-wider mt-2">
                  Total Ganho nas Rodadas Grátis:
                </p>
                <div className="text-xl sm:text-3xl font-black text-white mt-3 font-mono drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                  R$ {bonusFinalWin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <button
                  onClick={() => {
                    setBonusFinalWin(null);
                    setGameState(prev => ({ ...prev, bonusTotalWin: 0 }));
                  }}
                  className="mt-6 px-6 py-2.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-lg hover:shadow-yellow-500/20 active:scale-95 transition cursor-pointer"
                >
                  COLETAR
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BUY BONUS CONFIRMATION MODAL OVERLAY */}
        {isBuyBonusConfirmOpen && (
          <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200 pointer-events-auto">
            <div className="relative w-full max-w-xs bg-gradient-to-b from-[#1b1e2a] to-[#0e1017] border-2 border-yellow-500 p-5 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.9)] text-white animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 bg-gradient-to-tr from-yellow-500 to-amber-400 rounded-full flex items-center justify-center border border-yellow-300 mx-auto mb-3 shadow-[0_0_15px_rgba(234,179,8,0.3)] animate-pulse">
                <Coins className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-sm font-black text-yellow-400 uppercase tracking-widest">
                Confirmar Compra
              </h3>
              <p className="text-[11px] text-gray-400 mt-1">
                Deseja comprar o bônus de Rodadas Grátis?
              </p>
              
              {/* Select Bonus Bet Controller */}
              <div className="my-2.5 p-2.5 bg-black/50 border border-amber-500/30 rounded-xl flex flex-col gap-1.5 text-left">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Aposta do Bônus:</span>
                <div className="flex items-center justify-between gap-2 bg-black/60 px-2.5 py-1.5 rounded-lg border border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      const presets = adminConfig.betPresets || [1.00, 2.00, 5.00, 10.00, 20.00, 50.00, 100.00, 200.00, 500.00];
                      const curIdx = presets.indexOf(buyBonusBet);
                      if (curIdx > 0) {
                        setBuyBonusBet(presets[curIdx - 1]);
                      }
                    }}
                    className="w-6 h-6 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 font-extrabold flex items-center justify-center text-xs select-none cursor-pointer border border-amber-500/20 active:scale-95 transition"
                  >
                    -
                  </button>
                  <span className="text-xs sm:text-sm font-mono font-black text-amber-400 min-w-[70px] text-center">
                    R$ {buyBonusBet.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const presets = adminConfig.betPresets || [1.00, 2.00, 5.00, 10.00, 20.00, 50.00, 100.00, 200.00, 500.00];
                      const curIdx = presets.indexOf(buyBonusBet);
                      if (curIdx !== -1 && curIdx < presets.length - 1) {
                        setBuyBonusBet(presets[curIdx + 1]);
                      }
                    }}
                    className="w-6 h-6 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 font-extrabold flex items-center justify-center text-xs select-none cursor-pointer border border-amber-500/20 active:scale-95 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="my-2.5 p-3 bg-black/40 rounded-xl border border-white/5 space-y-1 text-xs font-mono text-left">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-[10px]">Multiplicador:</span>
                  <span className="text-yellow-400 font-bold">x{adminConfig.buyBonusMultiplier ?? 50}</span>
                </div>
                <div className="h-px bg-white/5 my-1" />
                <div className="flex justify-between text-xs">
                  <span className="text-yellow-500 font-black">CUSTO DO BÔNUS:</span>
                  <span className="text-yellow-400 font-black">
                    R$ {(buyBonusBet * (adminConfig.buyBonusMultiplier ?? 50)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsBuyBonusConfirmOpen(false)}
                  className="py-2 bg-neutral-800 hover:bg-neutral-700 text-[10px] font-bold text-gray-300 rounded-xl transition cursor-pointer"
                >
                  CANCELAR
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBuyBonus}
                  className="py-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black text-[10px] rounded-xl shadow-lg transition cursor-pointer"
                >
                  CONFIRMAR
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* GAME MENU MODAL */}
      <GameMenuModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        settings={gameSettings}
        onUpdateSettings={(newSettings) => setGameSettings(prev => ({ ...prev, ...newSettings }))}
        history={spinHistory}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* ADMIN PANEL MODAL */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        adminConfig={adminConfig}
        onUpdateAdminConfig={(newConfig) => setAdminConfig(prev => ({ ...prev, ...newConfig }))}
        gameState={gameState}
        onUpdateBalance={(newBalance) => setGameState(prev => ({ ...prev, balance: newBalance }))}
        onResetStats={() => setAdminConfig(prev => ({ ...prev, totalSpins: 0, totalWagered: 0, totalPayout: 0 }))}
        engineConfig={engineConfig}
        onUpdateEngineConfig={(newConfig) => {
          setEngineConfig(newConfig);
          saveEngineConfig(newConfig);
        }}
      />

      {/* FULL SCREEN (TELA CHEIA) CELEBRATION OVERLAY */}
      {fullScreenCelebration && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#05060d] overflow-hidden">
          {/* Media background */}
          {fullScreenCelebration.mediaUrl && (
            <div className="absolute inset-0 w-full h-full">
              {getYouTubeEmbedUrl(fullScreenCelebration.mediaUrl) ? (
                <iframe
                  src={getYouTubeEmbedUrl(fullScreenCelebration.mediaUrl)!}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; loop"
                  className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none scale-110"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              ) : (
                fullScreenCelebration.mediaUrl.match(/\.(mp4|webm|ogg|mov)/i) || fullScreenCelebration.mediaUrl.includes('video') ? (
                  <video
                    src={fullScreenCelebration.mediaUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none"
                  />
                ) : (
                  <img
                    src={fullScreenCelebration.mediaUrl}
                    alt="Celebration background"
                    className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                )
              )}
              {/* Original clean video without any dark overlays */}
            </div>
          )}

          {/* Celebration content */}
          <div className="relative z-10 text-center px-4 max-w-xl mx-auto flex flex-col items-center justify-center space-y-6">
            {/* Symbol badge with spin entrance */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 10, stiffness: 80 }}
              className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.6)] border-4 border-amber-300 relative"
            >
              <span className="text-5xl sm:text-7xl select-none filter drop-shadow-md">
                {fullScreenCelebration.imageEmoji.startsWith('data:') || fullScreenCelebration.imageEmoji.startsWith('http') ? (
                  <img 
                    src={fullScreenCelebration.imageEmoji} 
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-lg" 
                    alt="Symbol"
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  fullScreenCelebration.imageEmoji
                )}
              </span>
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute -top-2 -right-2 text-3xl sm:text-4xl"
              >
                ✨
              </motion.div>
            </motion.div>

            <div className="space-y-1 sm:space-y-2">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl sm:text-5xl font-extrabold uppercase tracking-widest text-amber-400 drop-shadow-md font-black"
              >
                TELA CHEIA!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xs sm:text-sm font-bold tracking-wider text-gray-300 uppercase"
              >
                {fullScreenCelebration.symbolName} Completou o Tabuleiro!
              </motion.p>
            </div>

            {/* COUNTING UP WIN */}
            <div className="py-2.5 px-6 bg-black/70 border-2 border-amber-500/40 rounded-2xl backdrop-blur-md min-w-[240px] shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <div className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">
                VALOR GANHO
              </div>
              <div className="text-3xl sm:text-5xl font-black">
                <CounterUpAnimation targetValue={fullScreenCelebration.payout} />
              </div>
            </div>

            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
              onClick={() => setFullScreenCelebration(null)}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black text-xs sm:text-sm font-black uppercase tracking-widest rounded-xl transition cursor-pointer transform active:scale-95 shadow-[0_4px_15px_rgba(245,158,11,0.4)]"
            >
              Coletar Prêmio
            </motion.button>
          </div>
        </div>
      )}

    </div>
  );
}

// Helper to extract YouTube video ID and return embed URL
function getYouTubeEmbedUrl(url: string | undefined): string | null {
  if (!url) return null;
  let videoId = '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    videoId = match[2];
  } else {
    const simpleMatch = url.trim();
    if (simpleMatch.length === 11 && !simpleMatch.includes('/') && !simpleMatch.includes('.')) {
      videoId = simpleMatch;
    }
  }
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&enablejsapi=1&playsinline=1&modestbranding=1`;
  }
  return null;
}


import React, { useState, useRef } from 'react';
import { 
  X, Smartphone, Monitor, Eye, Grid, Crosshair, ZoomIn, ZoomOut, Maximize2, Minimize2, 
  RotateCcw, Sliders, Image as ImageIcon, Sparkles, Plus, Trash2, Move, 
  Type as TypeIcon, Layers, Palette, Play, Settings, DollarSign, Trophy,
  ChevronRight, CheckCircle2, Shield, Flame, Activity, Coins, Minus, Zap, Volume2,
  Lock, Unlock, Key, RefreshCw, Award, Upload, Check, LayoutGrid, Dices,
  GripHorizontal, ArrowUp, ArrowDown, ArrowLeft, ArrowRight
} from 'lucide-react';
import { AdminConfig, CustomButtonConfig, CustomTextConfig, GameState, SymbolType, SymbolImageConfig, BoardType, SpinRollStyle, getCustomButtonStyles } from '../types';
import { SlotMachine } from './SlotMachine';
import { BackgroundMedia } from './BackgroundMedia';
import { SpinButton } from './SpinButton';
import { SlotSymbol } from './SlotSymbol';
import { SlotEngineConfig, generateBoardGrid, getBoardDimensions } from '../slotEngine';
import { SlotEngineEditor } from './SlotEngineEditor';

interface CriadorDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminConfig: AdminConfig;
  onUpdateAdminConfig: (updates: Partial<AdminConfig>) => void;
  gameState: GameState;
  onSpin: () => void;
  onUpdateGameState: (updates: Partial<GameState>) => void;
  engineConfig?: SlotEngineConfig;
  onUpdateEngineConfig?: (newConfig: SlotEngineConfig) => void;
  onUpdateBalance?: (newBalance: number) => void;
  onResetStats?: () => void;
}

const SYMBOL_LIST: { type: SymbolType; label: string }[] = [
  { type: 'Crown', label: 'Coroa Imperial' },
  { type: 'Dragon', label: 'Dragão do Reino' },
  { type: 'King', label: 'Rei Supremo' },
  { type: 'Queen', label: 'Rainha K' },
  { type: 'Lion', label: 'Leão Dourado' },
  { type: 'Castle', label: 'Castelo Real' },
  { type: 'Sword', label: 'Espada Mágica' },
  { type: 'Shield', label: 'Escudo Lendário' },
  { type: 'Diamond', label: 'Diamante Azul' },
  { type: 'Coin', label: 'Moeda de Ouro' },
];

const BOARD_OPTIONS: { id: BoardType; label: string; desc: string }[] = [
  { id: '3x1', label: '3x1', desc: 'Retrô 1 Linha (3×1)' },
  { id: '3x3', label: '3x3', desc: 'Clássico 3x3 (3×3)' },
  { id: '4x3', label: '4x3', desc: 'Moderno 4x3 (4×3)' },
  { id: '4x4', label: '4x4', desc: 'Quadrado 4x4 (4×4)' },
  { id: '5x3', label: '5x3', desc: 'Padrão Slot (5×3)' },
  { id: '5x4', label: '5x4', desc: 'Expandido (5×4)' },
  { id: '6x3', label: '6x3', desc: 'Largo 6x3 (6×3)' },
  { id: '6x4', label: '6x4', desc: 'Megaways (6×4)' },
  { id: '7x7', label: '7x7', desc: 'Grid Cluster (7×7)' },
];

const SPIN_ROLL_STYLES: { id: SpinRollStyle; label: string; desc: string; icon: string }[] = [
  { id: 'standard', label: 'Giro Tradicional', desc: 'Rotor vertical clássico com freio elástico', icon: '🎰' },
  { id: 'cascade', label: 'Queda Cascata', desc: 'Símbolos caindo do topo (Tumble/Avalanche) com gravidade', icon: '⚡' },
  { id: 'bounce_rebound', label: 'Recuo Elástico', desc: 'Giro dinâmico com quique forte e efeito mola ao travar', icon: '🏀' },
  { id: 'hyper_blur', label: 'Super Blur Neon', desc: 'Borrão de movimento em alta velocidade com travamento seco', icon: '🌀' },
  { id: 'scale_pop', label: 'Zoom & Pop 3D', desc: 'Animação de escala 3D surgindo em destaque no resultado', icon: '✨' },
  { id: 'wave_swing', label: 'Onda Harmônica', desc: 'Balanço senoidal em fase horizontal e vertical durante a rolagem', icon: '🌊' },
];

const BUTTON_COLOR_PRESETS = [
  { name: 'Ouro', bgColor: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600', textColor: 'text-black font-black' },
  { name: 'Vermelho', bgColor: 'bg-gradient-to-r from-red-600 to-rose-500', textColor: 'text-white font-black' },
  { name: 'Verde', bgColor: 'bg-gradient-to-r from-emerald-600 to-teal-500', textColor: 'text-white font-black' },
  { name: 'Azul', bgColor: 'bg-gradient-to-r from-blue-600 to-indigo-500', textColor: 'text-white font-black' },
  { name: 'Roxo', bgColor: 'bg-gradient-to-r from-purple-600 to-pink-500', textColor: 'text-white font-black' },
  { name: 'Preto', bgColor: 'bg-neutral-900 border border-yellow-500/50', textColor: 'text-yellow-400 font-extrabold' },
  { name: 'Prata', bgColor: 'bg-gradient-to-r from-gray-200 via-white to-gray-300', textColor: 'text-gray-900 font-black' },
  { name: 'Vulcan', bgColor: 'bg-gradient-to-r from-amber-600 to-red-600', textColor: 'text-white font-black' },
  { name: 'Cyan', bgColor: 'bg-gradient-to-r from-cyan-500 to-blue-500', textColor: 'text-black font-black' },
];

export const CriadorDesignerModal: React.FC<CriadorDesignerModalProps> = ({
  isOpen,
  onClose,
  adminConfig,
  onUpdateAdminConfig,
  gameState,
  onSpin,
  onUpdateGameState,
  engineConfig,
  onUpdateEngineConfig,
  onUpdateBalance,
  onResetStats,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'engine' | 'screen' | 'symbols' | 'buttons' | 'hud'>('metrics');
  
  // Security & Authentication
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);

  // Phone viewport scale & presets
  const [phoneWidth, setPhoneWidth] = useState<number>(360);
  const [toolbarWidth, setToolbarWidth] = useState<number>(440);
  const [toolbarTab, setToolbarTab] = useState<'board' | 'layout' | 'size'>('board');
  const [showGridLines, setShowGridLines] = useState<boolean>(true);
  const [dragPrecisionMode, setDragPrecisionMode] = useState<'fine' | 'normal'>('fine');
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  // Dragging states
  const previewCanvasRef = useRef<HTMLDivElement>(null);

  // Active Board & Preview Grid Calculations
  const activeBoardType: BoardType = adminConfig.boardType || '5x3';
  const activeBoardDims = getBoardDimensions(activeBoardType);

  const previewGrid = React.useMemo(() => {
    return generateBoardGrid(activeBoardType, engineConfig?.symbols || []);
  }, [activeBoardType, engineConfig?.symbols]);

  const activeRollStyle = SPIN_ROLL_STYLES.find(s => s.id === (adminConfig.spinRollStyle || 'standard')) || SPIN_ROLL_STYLES[0];
  const [draggingTarget, setDraggingTarget] = useState<string | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; initialX: number; initialY: number }>({ x: 0, y: 0, initialX: 0, initialY: 0 });

  const [resizingTarget, setResizingTarget] = useState<string | null>(null);
  const [resizeHandle, setResizeHandle] = useState<'tl' | 'tr' | 'bl' | 'br' | null>(null);
  const resizeStartRef = useRef<{ x: number; y: number; startWidth: number; startHeight: number; startScale: number; startFontSize: number }>({
    x: 0,
    y: 0,
    startWidth: 0,
    startHeight: 0,
    startScale: 100,
    startFontSize: 14,
  });

  const handleStartResize = (target: string, handle: 'tl' | 'tr' | 'bl' | 'br', e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setResizingTarget(target);
    setResizeHandle(handle);
    setNudgeTarget(target as any);

    let startWidth = 0;
    let startHeight = 0;
    let startScale = 100;
    let startFontSize = 14;

    if (target === 'phone') {
      startWidth = phoneWidth;
    } else if (target === 'background') {
      startScale = adminConfig.bgZoom ?? 100;
    } else if (target === 'slot') {
      startWidth = adminConfig.slotWidth ?? 92;
      startHeight = adminConfig.slotHeight ?? 38;
    } else if (target === 'spin') {
      startScale = adminConfig.spinScale ?? 100;
    } else if (target === 'buyBonus') {
      startScale = adminConfig.buyBonusScale ?? 100;
    } else if (target.startsWith('button-')) {
      const btnId = target.replace('button-', '');
      const btn = (adminConfig.customButtons || []).find(b => b.id === btnId);
      if (btn) startScale = btn.scale;
    } else if (target.startsWith('text-')) {
      const textId = target.replace('text-', '');
      const txt = (adminConfig.customTexts || []).find(t => t.id === textId);
      if (txt) startFontSize = txt.fontSize;
    }

    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startWidth,
      startHeight,
      startScale,
      startFontSize,
    };
  };

  // Pixel Precision Nudge State
  const [nudgeTarget, setNudgeTarget] = useState<string | null>('phone');
  const [nudgeStep, setNudgeStep] = useState<number>(1); // 1px, 5px, 10px

  const handleNudge = (dirX: number, dirY: number) => {
    if (nudgeTarget === 'phone') {
      const curX = adminConfig.phonePosX ?? 0;
      const curY = adminConfig.phonePosY ?? 0;
      onUpdateAdminConfig({ phonePosX: curX + dirX * nudgeStep, phonePosY: curY + dirY * nudgeStep });
    } else if (nudgeTarget === 'toolbar') {
      const curX = adminConfig.toolbarPosX ?? 0;
      const curY = adminConfig.toolbarPosY ?? 0;
      onUpdateAdminConfig({ toolbarPosX: curX + dirX * nudgeStep, toolbarPosY: curY + dirY * nudgeStep });
    } else if (nudgeTarget === 'slot') {
      const curX = adminConfig.slotLeft ?? 4;
      const curY = adminConfig.slotTop ?? 28;
      const pctStep = nudgeStep === 1 ? 0.5 : nudgeStep;
      onUpdateAdminConfig({ slotLeft: roundPrecision(curX + dirX * pctStep), slotTop: roundPrecision(curY + dirY * pctStep) });
    } else if (nudgeTarget === 'spin') {
      const curX = adminConfig.spinLeft ?? 50;
      const curY = adminConfig.spinBottom ?? 4;
      const pctStep = nudgeStep === 1 ? 0.5 : nudgeStep;
      onUpdateAdminConfig({ spinLeft: roundPrecision(curX + dirX * pctStep), spinBottom: roundPrecision(curY - dirY * pctStep) });
    } else if (nudgeTarget === 'buyBonus') {
      const curX = adminConfig.buyBonusPosX ?? 50;
      const curY = adminConfig.buyBonusPosY ?? 71;
      const pctStep = nudgeStep === 1 ? 0.5 : nudgeStep;
      onUpdateAdminConfig({ buyBonusPosX: roundPrecision(curX + dirX * pctStep), buyBonusPosY: roundPrecision(curY + dirY * pctStep) });
    } else if (nudgeTarget === 'background') {
      const curX = adminConfig.bgPosX ?? 0;
      const curY = adminConfig.bgPosY ?? 0;
      const pctStep = nudgeStep === 1 ? 1 : nudgeStep * 2;
      onUpdateAdminConfig({ bgPosX: roundPrecision(curX + dirX * pctStep), bgPosY: roundPrecision(curY + dirY * pctStep) });
    } else if (nudgeTarget?.startsWith('button-')) {
      const btnId = nudgeTarget.replace('button-', '');
      const btn = (adminConfig.customButtons || []).find(b => b.id === btnId);
      if (btn) {
        const pctStep = nudgeStep === 1 ? 0.5 : nudgeStep;
        const updatedButtons = (adminConfig.customButtons || []).map(b =>
          b.id === btnId ? { ...b, posX: roundPrecision(b.posX + dirX * pctStep), posY: roundPrecision(b.posY + pctStep * dirY) } : b
        );
        onUpdateAdminConfig({ customButtons: updatedButtons });
      }
    } else if (nudgeTarget?.startsWith('text-')) {
      const textId = nudgeTarget.replace('text-', '');
      const txt = (adminConfig.customTexts || []).find(t => t.id === textId);
      if (txt) {
        const pctStep = nudgeStep === 1 ? 0.5 : nudgeStep;
        const updatedTexts = (adminConfig.customTexts || []).map(t =>
          t.id === textId ? { ...t, posX: roundPrecision(t.posX + dirX * pctStep), posY: roundPrecision(t.posY + pctStep * dirY) } : t
        );
        onUpdateAdminConfig({ customTexts: updatedTexts });
      }
    }
  };

  const handleCenterTarget = (axis: 'x' | 'y' | 'both') => {
    const alignX = axis === 'x' || axis === 'both';
    const alignY = axis === 'y' || axis === 'both';

    if (nudgeTarget === 'phone') {
      onUpdateAdminConfig({
        ...(alignX && { phonePosX: 0 }),
        ...(alignY && { phonePosY: 0 }),
      });
    } else if (nudgeTarget === 'toolbar') {
      onUpdateAdminConfig({
        ...(alignX && { toolbarPosX: 0 }),
        ...(alignY && { toolbarPosY: 0 }),
      });
    } else if (nudgeTarget === 'slot') {
      onUpdateAdminConfig({
        ...(alignX && { slotLeft: roundPrecision((100 - (adminConfig.slotWidth ?? 92)) / 2) }),
        ...(alignY && { slotTop: roundPrecision((100 - (adminConfig.slotHeight ?? 38)) / 2) }),
      });
    } else if (nudgeTarget === 'spin') {
      onUpdateAdminConfig({
        ...(alignX && { spinLeft: 50 }),
        ...(alignY && { spinBottom: 4 }),
      });
    } else if (nudgeTarget === 'buyBonus') {
      onUpdateAdminConfig({
        ...(alignX && { buyBonusPosX: 50 }),
        ...(alignY && { buyBonusPosY: 71 }),
      });
    } else if (nudgeTarget === 'background') {
      onUpdateAdminConfig({
        ...(alignX && { bgPosX: 0 }),
        ...(alignY && { bgPosY: 0 }),
      });
    } else if (nudgeTarget?.startsWith('button-')) {
      const btnId = nudgeTarget.replace('button-', '');
      const updatedButtons = (adminConfig.customButtons || []).map(b => {
        if (b.id === btnId) {
          return {
            ...b,
            ...(alignX && { posX: 50 }),
            ...(alignY && { posY: 50 }),
          };
        }
        return b;
      });
      onUpdateAdminConfig({ customButtons: updatedButtons });
    } else if (nudgeTarget?.startsWith('text-')) {
      const textId = nudgeTarget.replace('text-', '');
      const updatedTexts = (adminConfig.customTexts || []).map(t => {
        if (t.id === textId) {
          return {
            ...t,
            ...(alignX && { posX: 50 }),
            ...(alignY && { posY: 50 }),
          };
        }
        return t;
      });
      onUpdateAdminConfig({ customTexts: updatedTexts });
    }
  };

  // Custom button creator state
  const [btnLabel, setBtnLabel] = useState<string>('BÔNUS GRÁTIS');
  const [btnAction, setBtnAction] = useState<CustomButtonConfig['actionType']>('buy_bonus');
  const [btnValue, setBtnValue] = useState<string>('100');
  const [btnColor, setBtnColor] = useState<string>('bg-gradient-to-r from-amber-500 to-yellow-400');
  const [btnTextColor, setBtnTextColor] = useState<string>('text-black font-black');
  const [btnShape, setBtnShape] = useState<CustomButtonConfig['shape']>('pill');
  const [btnIcon, setBtnIcon] = useState<CustomButtonConfig['icon']>('play');
  const [btnImageUrl, setBtnImageUrl] = useState<string>('');

  // Custom text creator state
  const [newText, setNewText] = useState<string>('MEGA PRÊMIO');
  const [newTextSize, setNewTextSize] = useState<number>(14);
  const [newTextColor, setNewTextColor] = useState<string>('#fde047');

  // Custom balance input
  const [customBalanceInput, setCustomBalanceInput] = useState<string>('');
  const [newBetPresetInput, setNewBetPresetInput] = useState<string>('');

  if (!isOpen) return null;

  // PIN Unlock Check
  if (isLocked) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center font-sans text-white p-4">
        <div className="max-w-md w-full bg-[#0d0e15] border border-red-500/30 rounded-2xl p-6 shadow-2xl space-y-5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-amber-500 p-0.5 mx-auto shadow-lg flex items-center justify-center">
            <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 uppercase tracking-wide">
              Estúdio de Criação Protegido
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Digite a senha de administrador/desenvolvedor para acessar
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="password"
              placeholder="Digite a senha (ex: 777 ou 0000)"
              value={pinInput}
              onChange={(e) => { setPinInput(e.target.value); setPinError(false); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (pinInput === '777' || pinInput === '0000' || pinInput === '1234' || pinInput === '') {
                    setIsLocked(false);
                  } else {
                    setPinError(true);
                  }
                }
              }}
              className="w-full px-4 py-3 bg-black/80 border border-white/20 rounded-xl text-center font-mono text-lg text-yellow-300 focus:outline-none focus:border-red-500 tracking-widest"
            />

            {pinError && (
              <p className="text-xs text-red-400 font-bold animate-shake">
                ⚠️ Senha incorreta! Tente 777, 0000 ou pressione Enter.
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                if (pinInput === '777' || pinInput === '0000' || pinInput === '1234' || pinInput === '') {
                  setIsLocked(false);
                } else {
                  setPinError(true);
                }
              }}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-black font-black uppercase text-xs tracking-widest rounded-xl shadow-lg transition cursor-pointer"
            >
              Desbloquear Estúdio
            </button>
          </div>
        </div>
      </div>
    );
  }

  const roundPrecision = (val: number) => {
    return dragPrecisionMode === 'fine' ? Math.round(val * 10) / 10 : Math.round(val);
  };

  // Generic Drag Start for Canvas
  const handleStartDrag = (target: string, initialX: number, initialY: number, clientX: number, clientY: number) => {
    setDraggingTarget(target);
    dragStartRef.current = { x: clientX, y: clientY, initialX, initialY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (resizingTarget && resizeHandle && previewCanvasRef.current) {
      const rect = previewCanvasRef.current.getBoundingClientRect();
      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;

      if (resizingTarget === 'phone') {
        const factor = (resizeHandle === 'tr' || resizeHandle === 'br') ? 1 : -1;
        const newPhoneWidth = Math.max(240, Math.min(700, Math.round(resizeStartRef.current.startWidth + deltaX * factor * 1.5)));
        setPhoneWidth(newPhoneWidth);
      } else if (resizingTarget === 'slot') {
        const factorX = (resizeHandle === 'tr' || resizeHandle === 'br') ? 1 : -1;
        const factorY = (resizeHandle === 'bl' || resizeHandle === 'br') ? 1 : -1;
        
        // Approximate scaling delta relative to phone viewport size inside container
        const deltaXPct = (deltaX / rect.width) * 100 * 2.2;
        const deltaYPct = (deltaY / rect.height) * 100 * 2.2;
        
        const newSlotWidth = Math.max(10, Math.min(100, roundPrecision(resizeStartRef.current.startWidth + deltaXPct * factorX)));
        const newSlotHeight = Math.max(10, Math.min(100, roundPrecision(resizeStartRef.current.startHeight + deltaYPct * factorY)));
        
        onUpdateAdminConfig({
          slotWidth: newSlotWidth,
          slotHeight: newSlotHeight
        });
      } else if (resizingTarget === 'background') {
        const factorX = (resizeHandle === 'tr' || resizeHandle === 'br') ? 1 : -1;
        const newZoom = Math.max(50, Math.min(500, Math.round(resizeStartRef.current.startScale + deltaX * factorX * 0.8)));
        onUpdateAdminConfig({ bgZoom: newZoom });
      } else if (resizingTarget === 'spin') {
        const factorX = (resizeHandle === 'tr' || resizeHandle === 'br') ? 1 : -1;
        const newSpinScale = Math.max(40, Math.min(250, Math.round(resizeStartRef.current.startScale + deltaX * factorX * 0.8)));
        onUpdateAdminConfig({ spinScale: newSpinScale });
      } else if (resizingTarget === 'buyBonus') {
        const factorX = (resizeHandle === 'tr' || resizeHandle === 'br') ? 1 : -1;
        const newBuyBonusScale = Math.max(40, Math.min(250, Math.round(resizeStartRef.current.startScale + deltaX * factorX * 0.8)));
        onUpdateAdminConfig({ buyBonusScale: newBuyBonusScale });
      } else if (resizingTarget.startsWith('button-')) {
        const btnId = resizingTarget.replace('button-', '');
        const factorX = (resizeHandle === 'tr' || resizeHandle === 'br') ? 1 : -1;
        const newScale = Math.max(40, Math.min(250, Math.round(resizeStartRef.current.startScale + deltaX * factorX * 0.8)));
        const updatedButtons = (adminConfig.customButtons || []).map(b => 
          b.id === btnId ? { ...b, scale: newScale } : b
        );
        onUpdateAdminConfig({ customButtons: updatedButtons });
      } else if (resizingTarget.startsWith('text-')) {
        const textId = resizingTarget.replace('text-', '');
        const factorX = (resizeHandle === 'tr' || resizeHandle === 'br') ? 1 : -1;
        const newFontSize = Math.max(8, Math.min(64, Math.round(resizeStartRef.current.startFontSize + deltaX * factorX * 0.2)));
        const updatedTexts = (adminConfig.customTexts || []).map(t => 
          t.id === textId ? { ...t, fontSize: newFontSize } : t
        );
        onUpdateAdminConfig({ customTexts: updatedTexts });
      }
      return;
    }

    if (!draggingTarget || !previewCanvasRef.current) return;
    const rect = previewCanvasRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;

    const newX = Math.max(-50, Math.min(150, roundPrecision(dragStartRef.current.initialX + deltaX)));
    const newY = Math.max(-50, Math.min(150, roundPrecision(dragStartRef.current.initialY + deltaY)));

    if (draggingTarget === 'phone') {
      const pixelDeltaX = e.clientX - dragStartRef.current.x;
      const pixelDeltaY = e.clientY - dragStartRef.current.y;
      const newPhoneX = Math.round(dragStartRef.current.initialX + pixelDeltaX);
      const newPhoneY = Math.round(dragStartRef.current.initialY + pixelDeltaY);
      onUpdateAdminConfig({ phonePosX: newPhoneX, phonePosY: newPhoneY });
    } else if (draggingTarget === 'background') {
      const panDeltaX = Math.round((e.clientX - dragStartRef.current.x) * 0.5);
      const panDeltaY = Math.round((e.clientY - dragStartRef.current.y) * 0.5);
      const newOffsetX = Math.max(-200, Math.min(200, dragStartRef.current.initialX + panDeltaX));
      const newOffsetY = Math.max(-200, Math.min(200, dragStartRef.current.initialY + panDeltaY));
      onUpdateAdminConfig({
        bgPosX: newOffsetX,
        bgPosY: newOffsetY
      });
    } else if (draggingTarget === 'toolbar') {
      const pixelDeltaX = e.clientX - dragStartRef.current.x;
      const pixelDeltaY = e.clientY - dragStartRef.current.y;
      const newToolbarX = Math.round(dragStartRef.current.initialX + pixelDeltaX);
      const newToolbarY = Math.round(dragStartRef.current.initialY + pixelDeltaY);
      onUpdateAdminConfig({ toolbarPosX: newToolbarX, toolbarPosY: newToolbarY });
    } else if (draggingTarget === 'slot') {
      onUpdateAdminConfig({ slotLeft: newX, slotTop: newY });
    } else if (draggingTarget === 'spin') {
      onUpdateAdminConfig({ spinLeft: newX, spinBottom: 100 - newY });
    } else if (draggingTarget === 'buyBonus') {
      onUpdateAdminConfig({ buyBonusPosX: newX, buyBonusPosY: newY });
    } else if (draggingTarget === 'balance') {
      onUpdateAdminConfig({ balancePosX: newX, balancePosY: newY });
    } else if (draggingTarget === 'bet') {
      onUpdateAdminConfig({ betPosX: newX, betPosY: newY });
    } else if (draggingTarget === 'win') {
      onUpdateAdminConfig({ winPosX: newX, winPosY: newY });
    } else if (draggingTarget.startsWith('button-')) {
      const btnId = draggingTarget.replace('button-', '');
      const updatedButtons = (adminConfig.customButtons || []).map(b => 
        b.id === btnId ? { ...b, posX: newX, posY: newY } : b
      );
      onUpdateAdminConfig({ customButtons: updatedButtons });
    } else if (draggingTarget.startsWith('text-')) {
      const textId = draggingTarget.replace('text-', '');
      const updatedTexts = (adminConfig.customTexts || []).map(t => 
        t.id === textId ? { ...t, posX: newX, posY: newY } : t
      );
      onUpdateAdminConfig({ customTexts: updatedTexts });
    } else if (draggingTarget.startsWith('symbol-pan-')) {
      const symType = draggingTarget.replace('symbol-pan-', '') as SymbolType;
      const currentConfigs = adminConfig.customSymbolConfigs || {};
      const symConfig = currentConfigs[symType] || { url: adminConfig.customSymbols?.[symType] || '' };
      
      const panDeltaX = Math.round((e.clientX - dragStartRef.current.x) * 0.8);
      const panDeltaY = Math.round((e.clientY - dragStartRef.current.y) * 0.8);
      
      const newOffsetX = Math.max(-100, Math.min(100, dragStartRef.current.initialX + panDeltaX));
      const newOffsetY = Math.max(-100, Math.min(100, dragStartRef.current.initialY + panDeltaY));

      onUpdateAdminConfig({
        customSymbolConfigs: {
          ...currentConfigs,
          [symType]: {
            ...symConfig,
            offsetX: newOffsetX,
            offsetY: newOffsetY,
          }
        }
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingTarget(null);
    setResizingTarget(null);
    setResizeHandle(null);
  };

  // Symbol Image File Upload: Default to CONTAIN (Full image, no cropping)
  const handleFileUploadForSymbol = (type: SymbolType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          const url = event.target.result;
          const updatedSymbols = { ...adminConfig.customSymbols, [type]: url };
          const updatedConfigs = {
            ...(adminConfig.customSymbolConfigs || {}),
            [type]: {
              url,
              objectFit: 'contain' as const, // FULL UNCROPPED IMAGE BY DEFAULT!
              offsetX: 0,
              offsetY: 0,
              scale: 100,
            },
          };
          onUpdateAdminConfig({
            customSymbols: updatedSymbols,
            customSymbolConfigs: updatedConfigs,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Background Image File Upload
  const handleFileUploadForBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          const url = event.target.result;
          onUpdateAdminConfig({ bgImage: url });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Custom Button
  const handleAddButton = () => {
    if (!btnLabel.trim() && !btnImageUrl.trim()) return;
    const newBtn: CustomButtonConfig = {
      id: `btn-${Date.now()}`,
      label: btnLabel,
      actionType: btnAction,
      actionValue: btnValue,
      posX: 50,
      posY: 88,
      scale: 100,
      bgColor: btnColor,
      textColor: btnTextColor,
      shape: btnShape,
      icon: btnIcon,
      imageUrl: btnImageUrl.trim() || undefined,
      isActive: true,
    };
    onUpdateAdminConfig({
      customButtons: [...(adminConfig.customButtons || []), newBtn],
    });
    setBtnLabel('');
    setBtnImageUrl('');
  };

  const handleRemoveButton = (id: string) => {
    onUpdateAdminConfig({
      customButtons: (adminConfig.customButtons || []).filter(b => b.id !== id),
    });
  };

  // Add Custom Text
  const handleAddText = () => {
    if (!newText.trim()) return;
    const txt: CustomTextConfig = {
      id: `txt-${Date.now()}`,
      text: newText,
      posX: 50,
      posY: 15,
      fontSize: newTextSize,
      color: newTextColor,
      fontWeight: 'extrabold',
      isActive: true,
    };
    onUpdateAdminConfig({
      customTexts: [...(adminConfig.customTexts || []), txt],
    });
    setNewText('');
  };

  const handleRemoveText = (id: string) => {
    onUpdateAdminConfig({
      customTexts: (adminConfig.customTexts || []).filter(t => t.id !== id),
    });
  };

  // Calculations for Session Metrics
  const calculatedRtp = adminConfig.totalWagered > 0 
    ? ((adminConfig.totalPayout / adminConfig.totalWagered) * 100).toFixed(1) 
    : '100.0';
  const calculatedGgr = (adminConfig.totalWagered - adminConfig.totalPayout).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col font-sans text-white overflow-hidden animate-in fade-in duration-200 select-none">
      
      {/* Studio Top Header Bar */}
      <header className="w-full bg-[#0b0c12] border-b border-red-500/30 px-4 py-2.5 flex items-center justify-between shrink-0 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-amber-500 to-yellow-400 p-0.5 shadow-[0_0_20px_rgba(239,68,68,0.6)]">
            <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 uppercase">
                ESTÚDIO ENGINE DE CRIAÇÃO DE SLOT
              </h1>
              <span className="bg-red-950/90 border border-red-500/50 text-red-300 text-[9px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase shadow">
                Professional v3.0
              </span>
            </div>
            <p className="text-[10px] text-gray-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>RTP Ativo: <b>{adminConfig.targetRtp}%</b></span>
              <span className="text-gray-600">•</span>
              <span>Motor: <b>{adminConfig.boardType || '5x3'}</b></span>
              <span className="text-gray-600">•</span>
              <span>GGR: <b className="text-emerald-400">R$ {calculatedGgr}</b></span>
            </p>
          </div>
        </div>

        {/* Toolbar Center Quick Controls */}
        <div className="hidden md:flex items-center gap-2 bg-black/80 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setShowGridLines(!showGridLines)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              showGridLines ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grade 10%</span>
          </button>

          <button
            type="button"
            onClick={() => setDragPrecisionMode(dragPrecisionMode === 'fine' ? 'normal' : 'fine')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
              dragPrecisionMode === 'fine' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Passo {dragPrecisionMode === 'fine' ? '0.1%' : '1.0%'}</span>
          </button>

          <div className="h-4 w-[1px] bg-white/10 mx-1" />

          <div className="flex items-center gap-2 bg-black/60 p-1 rounded-xl border border-white/10 text-xs text-gray-300">
            <span className="text-[10px] uppercase font-black text-amber-400 tracking-wider flex items-center gap-1 pl-1">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Celular:</span>
            </span>

            {/* Decrease button */}
            <button
              type="button"
              title="Diminuir Celular"
              onClick={() => setPhoneWidth(prev => Math.max(240, prev - 20))}
              className="p-1 bg-neutral-800 hover:bg-amber-500 hover:text-black rounded transition cursor-pointer active:scale-95"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            {/* Slider */}
            <input
              type="range"
              min={240}
              max={650}
              step={10}
              value={phoneWidth}
              onChange={(e) => setPhoneWidth(parseInt(e.target.value) || 360)}
              className="w-20 accent-amber-500 cursor-pointer h-1 bg-neutral-700 rounded-lg appearance-none"
              title="Ajustar largura do celular"
            />

            {/* Increase button */}
            <button
              type="button"
              title="Aumentar Celular"
              onClick={() => setPhoneWidth(prev => Math.min(650, prev + 20))}
              className="p-1 bg-neutral-800 hover:bg-amber-500 hover:text-black rounded transition cursor-pointer active:scale-95"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            {/* Width Badge */}
            <span className="text-[10px] font-mono font-black bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
              {phoneWidth}px
            </span>

            {/* Presets */}
            <div className="flex items-center gap-0.5">
              {[290, 360, 420, 480, 560, 640].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setPhoneWidth(w)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-black transition cursor-pointer ${
                    phoneWidth === w 
                      ? 'bg-amber-400 text-black font-bold' 
                      : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {w}px
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={`p-2 rounded-xl transition cursor-pointer border flex items-center gap-1.5 text-xs font-black ${
              isFocusMode 
                ? 'bg-amber-500 text-black border-amber-400 font-black shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105' 
                : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
            }`}
            title={isFocusMode ? "Sair do Modo Foco (Mostrar Painel Lateral)" : "Entrar no Modo Foco (Ocular Painel Lateral)"}
          >
            {isFocusMode ? <Minimize2 className="w-4 h-4 text-black animate-pulse" /> : <Maximize2 className="w-4 h-4 text-amber-400" />}
            <span>{isFocusMode ? "Modo Normal" : "Modo Foco (Tela Cheia)"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLocked(true)}
            className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition cursor-pointer border border-white/10"
            title="Bloquear Painel"
          >
            <Lock className="w-4 h-4 text-amber-400" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 active:scale-95 text-white rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-black shadow-lg border border-red-400/40"
          >
            <X className="w-4 h-4" />
            <span>Fechar Estúdio</span>
          </button>
        </div>
      </header>

      {/* Main Studio Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Control Panel (5 Cols) */}
        {!isFocusMode && (
          <div className="lg:col-span-5 bg-[#08090d] border-r border-red-500/20 flex flex-col h-full overflow-hidden">
          
          {/* Main Navigation Tabs */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 p-2 bg-black/80 border-b border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('metrics')}
              className={`p-2 rounded-lg font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                activeTab === 'metrics' ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span className="text-[9px]">1. Métricas & RTP</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('engine')}
              className={`p-2 rounded-lg font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                activeTab === 'engine' ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-amber-300" />
              <span className="text-[9px] font-black">2. Editar Slot</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('screen')}
              className={`p-2 rounded-lg font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                activeTab === 'screen' ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="text-[9px]">3. Fundo & Quadro</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('symbols')}
              className={`p-2 rounded-lg font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                activeTab === 'symbols' ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span className="text-[9px]">4. Símbolos & Imagens</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('buttons')}
              className={`p-2 rounded-lg font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                activeTab === 'buttons' ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span className="text-[9px]">5. Botões & Ações</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('hud')}
              className={`p-2 rounded-lg font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                activeTab === 'hud' ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <TypeIcon className="w-4 h-4" />
              <span className="text-[9px]">6. Textos & HUD</span>
            </button>
          </div>

          {/* Active Tab Panel Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* -------------------------------------------------------------
                TAB 1: METRICS, RTP & FINANCIAL MANAGEMENT (ADMIN)
                ------------------------------------------------------------- */}
            {activeTab === 'metrics' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                
                {/* Financial Session Metrics */}
                <div className="bg-gradient-to-r from-red-950/60 via-black to-red-950/60 p-3.5 rounded-xl border border-red-500/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <span>Métricas Financeiras da Sessão</span>
                    </h3>
                    {onResetStats && (
                      <button
                        type="button"
                        onClick={onResetStats}
                        className="px-2 py-0.5 bg-red-950 hover:bg-red-900 border border-red-500/40 text-red-300 rounded text-[9px] font-bold transition flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Resetar</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-black/60 p-2 rounded-lg border border-white/5 text-center">
                      <span className="text-[9px] text-gray-400 uppercase font-bold block">Total Giros</span>
                      <span className="text-sm font-black font-mono text-white">{adminConfig.totalSpins}</span>
                    </div>

                    <div className="bg-black/60 p-2 rounded-lg border border-white/5 text-center">
                      <span className="text-[9px] text-gray-400 uppercase font-bold block">Volume Apostado</span>
                      <span className="text-sm font-black font-mono text-amber-300">R$ {adminConfig.totalWagered.toFixed(2)}</span>
                    </div>

                    <div className="bg-black/60 p-2 rounded-lg border border-white/5 text-center">
                      <span className="text-[9px] text-gray-400 uppercase font-bold block">Prêmios Pagos</span>
                      <span className="text-sm font-black font-mono text-emerald-400">R$ {adminConfig.totalPayout.toFixed(2)}</span>
                    </div>

                    <div className="bg-black/60 p-2 rounded-lg border border-white/5 text-center">
                      <span className="text-[9px] text-gray-400 uppercase font-bold block">RTP Real</span>
                      <span className="text-sm font-black font-mono text-yellow-300">{calculatedRtp}%</span>
                    </div>
                  </div>
                </div>

                {/* RTP & Volatility Config */}
                <div className="bg-black/50 p-3.5 rounded-xl border border-red-500/20 space-y-3">
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>RTP Desejado & Volatilidade do Casino</span>
                  </h3>

                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-gray-300 mb-1">
                      <span>RTP Alvo (Retorno ao Jogador):</span>
                      <span className="text-amber-300 font-mono text-xs">{adminConfig.targetRtp}%</span>
                    </div>
                    <input
                      type="range"
                      min="80"
                      max="99"
                      step="0.5"
                      value={adminConfig.targetRtp}
                      onChange={(e) => onUpdateAdminConfig({ targetRtp: parseFloat(e.target.value) })}
                      className="w-full accent-amber-500 cursor-pointer h-2"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-300 font-bold block mb-1">Nível de Volatilidade:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'low', name: 'Baixa (Paga Mais Vezes)', color: 'border-emerald-500 text-emerald-300 bg-emerald-950/40' },
                        { id: 'medium', name: 'Média (Equilibrada)', color: 'border-yellow-500 text-yellow-300 bg-yellow-950/40' },
                        { id: 'high', name: 'Alta (Prêmios Grandes)', color: 'border-red-500 text-red-300 bg-red-950/40' },
                      ].map((vol) => (
                        <button
                          key={vol.id}
                          type="button"
                          onClick={() => onUpdateAdminConfig({ volatility: vol.id as any })}
                          className={`py-2 px-2 rounded-lg border text-[10px] font-black uppercase text-center transition cursor-pointer ${
                            adminConfig.volatility === vol.id
                              ? `${vol.color} ring-2 ring-white/50 shadow-lg`
                              : 'bg-black/60 border-white/10 text-gray-400 hover:border-white/30'
                          }`}
                        >
                          {vol.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* DEMO MODE: Forced Next Outcome */}
                <div className="bg-black/50 p-3.5 rounded-xl border border-yellow-500/30 space-y-3">
                  <h3 className="text-xs font-black text-yellow-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>Forçar Próximo Resultado (Modo Demonstração)</span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'none', label: '🎲 Aleatório (RNG)', color: 'bg-gray-800 text-gray-200' },
                      { id: 'normal_win', label: '✅ Vitória Normal', color: 'bg-emerald-900 text-emerald-200' },
                      { id: 'big_win', label: '💥 Mega Vitória', color: 'bg-amber-900 text-amber-200' },
                      { id: 'full_screen', label: '👑 Tela Cheia', color: 'bg-purple-900 text-purple-200' },
                      { id: 'loss', label: '❌ Derrota (Sem Pagar)', color: 'bg-red-950 text-red-200' },
                      { id: 'force_cash_collect', label: '💵 5x Dinheiro Board', color: 'bg-green-950 text-green-200' },
                    ].map((outcome) => (
                      <button
                        key={outcome.id}
                        type="button"
                        onClick={() => onUpdateAdminConfig({ forcedOutcome: outcome.id as any })}
                        className={`p-2 rounded-lg font-extrabold text-[10px] uppercase transition cursor-pointer border ${
                          adminConfig.forcedOutcome === outcome.id
                            ? `${outcome.color} border-yellow-400 ring-2 ring-yellow-400/50 scale-102`
                            : 'bg-black/60 border-white/10 text-gray-400 hover:border-white/30'
                        }`}
                      >
                        {outcome.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Player Balance Management */}
                <div className="bg-black/50 p-3.5 rounded-xl border border-red-500/20 space-y-3">
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Gestão do Saldo do Jogador</span>
                  </h3>

                  <div className="flex items-center justify-between bg-black/80 p-3 rounded-lg border border-white/10">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block">Saldo Atual em Conta:</span>
                      <span className="text-lg font-black font-mono text-emerald-400">R$ {gameState.balance.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onUpdateBalance?.(gameState.balance + 1000)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] rounded-lg shadow cursor-pointer uppercase"
                      >
                        + R$ 1.000
                      </button>

                      <button
                        type="button"
                        onClick={() => onUpdateBalance?.(gameState.balance + 10000)}
                        className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-[10px] rounded-lg shadow cursor-pointer uppercase"
                      >
                        + R$ 10.000
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Digitar valor exato R$"
                      value={customBalanceInput}
                      onChange={(e) => setCustomBalanceInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-emerald-300 font-mono font-bold focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = parseFloat(customBalanceInput);
                        if (!isNaN(val) && val >= 0) {
                          onUpdateBalance?.(val);
                          setCustomBalanceInput('');
                        }
                      }}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase rounded-lg shadow cursor-pointer"
                    >
                      Aplicar Saldo
                    </button>
                  </div>
                </div>

                {/* Bet Limits & Presets */}
                <div className="bg-black/50 p-3.5 rounded-xl border border-red-500/20 space-y-3">
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                    Limites de Aposta & Valores Disponíveis
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Aposta Mínima R$:</label>
                      <input
                        type="number"
                        step="0.1"
                        value={adminConfig.minBet}
                        onChange={(e) => onUpdateAdminConfig({ minBet: parseFloat(e.target.value) || 0.1 })}
                        className="w-full px-2.5 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-yellow-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Aposta Máxima R$:</label>
                      <input
                        type="number"
                        step="1"
                        value={adminConfig.maxBet}
                        onChange={(e) => onUpdateAdminConfig({ maxBet: parseFloat(e.target.value) || 500 })}
                        className="w-full px-2.5 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-yellow-300 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-300 font-bold block mb-1">Valores de Aposta Rápidos (Chips):</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(adminConfig.betPresets || [0.5, 1, 2, 5, 10, 20, 50, 100]).map((preset) => (
                        <span key={preset} className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1">
                          R$ {preset}
                          <button
                            type="button"
                            onClick={() => {
                              const filtered = (adminConfig.betPresets || [0.5, 1, 2, 5, 10, 20, 50, 100]).filter(p => p !== preset);
                              onUpdateAdminConfig({ betPresets: filtered });
                            }}
                            className="text-red-400 hover:text-red-200 ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.5"
                        placeholder="Adicionar aposta R$"
                        value={newBetPresetInput}
                        onChange={(e) => setNewBetPresetInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-white font-mono focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const parsed = parseFloat(newBetPresetInput);
                          if (!isNaN(parsed) && parsed > 0) {
                            const current = adminConfig.betPresets || [0.5, 1, 2, 5, 10, 20, 50, 100];
                            if (!current.includes(parsed)) {
                              onUpdateAdminConfig({ betPresets: [...current, parsed].sort((a, b) => a - b) });
                            }
                            setNewBetPresetInput('');
                          }
                        }}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-lg shadow cursor-pointer uppercase"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                TAB 2: ENGINE & MATH RULES (ADMIN + ENGINE EDITOR)
                ------------------------------------------------------------- */}
            {activeTab === 'engine' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                
                {/* Board Type Selector */}
                <div className="bg-black/50 p-3.5 rounded-xl border border-red-500/20 space-y-3">
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <LayoutGrid className="w-4 h-4 text-amber-400" />
                    <span>Tipo de Tabuleiro / Grade do Slot</span>
                  </h3>

                  <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                    {BOARD_OPTIONS.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          onUpdateAdminConfig({ boardType: b.id });
                          if (engineConfig && onUpdateEngineConfig) {
                            onUpdateEngineConfig({ ...engineConfig, boardType: b.id });
                          }
                        }}
                        className={`p-2 rounded-lg font-black text-xs uppercase transition cursor-pointer border flex flex-col items-center justify-center ${
                          (adminConfig.boardType || '5x3') === b.id
                            ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white border-yellow-400 shadow-lg'
                            : 'bg-black/60 border-white/10 text-gray-400 hover:border-white/30'
                        }`}
                      >
                        <span>{b.label}</span>
                        <span className="text-[9px] font-normal opacity-80 normal-case">{b.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Formas e Animações de Rolagem (Spin Roll Styles) */}
                <div className="bg-black/50 p-3.5 rounded-xl border border-red-500/20 space-y-3">
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Formas & Efeitos de Rolagem dos Rolos</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SPIN_ROLL_STYLES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onUpdateAdminConfig({ spinRollStyle: s.id })}
                        className={`p-2.5 rounded-xl text-left transition cursor-pointer border flex items-start gap-2.5 ${
                          (adminConfig.spinRollStyle || 'standard') === s.id
                            ? 'bg-gradient-to-r from-amber-950/80 via-black to-red-950/80 border-amber-400 shadow-lg'
                            : 'bg-black/60 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className="text-xl shrink-0 leading-none pt-0.5">{s.icon}</span>
                        <div>
                          <div className={`text-xs font-black uppercase ${
                            (adminConfig.spinRollStyle || 'standard') === s.id ? 'text-amber-300' : 'text-gray-200'
                          }`}>
                            {s.label}
                          </div>
                          <div className="text-[9px] text-gray-400 leading-tight mt-0.5">
                            {s.desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Full Embedded SlotEngineEditor */}
                {engineConfig && onUpdateEngineConfig && (
                  <div className="bg-black/60 p-3.5 rounded-xl border border-red-500/30">
                    <SlotEngineEditor
                      engineConfig={engineConfig}
                      onUpdateEngineConfig={onUpdateEngineConfig}
                      adminConfig={adminConfig}
                      onUpdateAdminConfig={onUpdateAdminConfig}
                    />
                  </div>
                )}

                {/* Spin Speeds & Motion Timing */}
                <div className="bg-black/50 p-3.5 rounded-xl border border-red-500/20 space-y-3">
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span>Velocidades da Rolagem (Normal & Turbo)</span>
                  </h3>

                  <div className="space-y-2.5">
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-300 font-bold mb-1">
                        <span>Duração Giro Normal:</span>
                        <span className="text-amber-300 font-mono">{adminConfig.spinSpeedNormal ?? 1200} ms</span>
                      </div>
                      <input
                        type="range"
                        min="300"
                        max="2500"
                        step="50"
                        value={adminConfig.spinSpeedNormal ?? 1200}
                        onChange={(e) => onUpdateAdminConfig({ spinSpeedNormal: parseInt(e.target.value) })}
                        className="w-full accent-amber-500 cursor-pointer h-1.5"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-gray-300 font-bold mb-1">
                        <span>Duração Giro Modo Turbo:</span>
                        <span className="text-red-400 font-mono">{adminConfig.spinSpeedTurbo ?? 350} ms</span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="800"
                        step="25"
                        value={adminConfig.spinSpeedTurbo ?? 350}
                        onChange={(e) => onUpdateAdminConfig({ spinSpeedTurbo: parseInt(e.target.value) })}
                        className="w-full accent-red-500 cursor-pointer h-1.5"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-gray-300 font-bold mb-1">
                        <span>Atraso entre Colunas (Stagger):</span>
                        <span className="text-yellow-300 font-mono">{adminConfig.reelStaggerDelay ?? 120} ms</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="300"
                        step="10"
                        value={adminConfig.reelStaggerDelay ?? 120}
                        onChange={(e) => onUpdateAdminConfig({ reelStaggerDelay: parseInt(e.target.value) })}
                        className="w-full accent-yellow-400 cursor-pointer h-1.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Cash Card Rules & Threat Glow */}
                <div className="bg-black/50 p-3.5 rounded-xl border border-red-500/20 space-y-3">
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Regras da Carta de Dinheiro & Animação de Ameaça</span>
                  </h3>

                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">
                        Qtd Mínima de Cartas de Dinheiro para Pagar no Tabuleiro:
                      </label>
                      <select
                        value={adminConfig.minCashCardsForWin ?? 5}
                        onChange={(e) => onUpdateAdminConfig({ minCashCardsForWin: parseInt(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-amber-300 font-bold focus:outline-none cursor-pointer"
                      >
                        <option value={1}>1 Carta de Dinheiro (Qualquer 1 paga)</option>
                        <option value={2}>2 Cartas de Dinheiro</option>
                        <option value={3}>3 Cartas de Dinheiro</option>
                        <option value={4}>4 Cartas de Dinheiro</option>
                        <option value={5}>5 Cartas de Dinheiro (Padrão)</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-2 p-2 bg-black/70 rounded-lg border border-white/10 cursor-pointer hover:border-emerald-500/50 transition">
                      <input
                        type="checkbox"
                        checked={adminConfig.cashCardSinglePay ?? false}
                        onChange={(e) => onUpdateAdminConfig({ cashCardSinglePay: e.target.checked })}
                        className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                      />
                      <span className="text-xs text-gray-200 font-bold">
                        Pagar Carta de Dinheiro Única Isolada (Se vier apenas 1 ela paga seu valor)
                      </span>
                    </label>

                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">
                        Cor da Animação de Ameaça/Antecipação na Última Coluna:
                      </label>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[
                          { id: 'gold', name: 'Ouro', class: 'border-yellow-400 text-yellow-300 bg-yellow-950/40' },
                          { id: 'red', name: 'Fogo', class: 'border-red-500 text-red-400 bg-red-950/40' },
                          { id: 'purple', name: 'Roxo', class: 'border-purple-500 text-purple-300 bg-purple-950/40' },
                          { id: 'cyan', name: 'Ciano', class: 'border-cyan-400 text-cyan-300 bg-cyan-950/40' },
                          { id: 'neon_green', name: 'Neon', class: 'border-emerald-400 text-emerald-300 bg-emerald-950/40' },
                        ].map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => onUpdateAdminConfig({ cashAnticipationColor: c.id as any })}
                            className={`py-1.5 px-1 rounded-lg border text-[10px] font-black uppercase text-center transition cursor-pointer ${
                              (adminConfig.cashAnticipationColor || 'gold') === c.id
                                ? `${c.class} shadow-[0_0_12px_rgba(255,255,255,0.2)] ring-2 ring-white/50`
                                : 'bg-black/60 border-white/10 text-gray-400 hover:border-white/30'
                            }`}
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bonus Trigger Rules */}
                <div className="bg-black/50 p-3.5 rounded-xl border border-yellow-500/30 space-y-3">
                  <h3 className="text-xs font-black text-yellow-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>Regras do Bônus & Carta Scatter</span>
                  </h3>

                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">
                        Qual é a Carta Bônus (Scatter Trigger):
                      </label>
                      <select
                        value={adminConfig.bonusTriggerSymbolId || 'crown'}
                        onChange={(e) => onUpdateAdminConfig({ bonusTriggerSymbolId: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-black/80 border border-yellow-500/40 rounded-lg text-xs text-yellow-300 font-bold focus:outline-none cursor-pointer"
                      >
                        {SYMBOL_LIST.map((sym) => (
                          <option key={sym.type} value={sym.type.toLowerCase()}>
                            {sym.label} ({sym.type})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-300 font-bold block mb-1">
                          Qtd Mínima de Cartas:
                        </label>
                        <select
                          value={adminConfig.bonusMinCardsCount ?? 3}
                          onChange={(e) => onUpdateAdminConfig({ bonusMinCardsCount: parseInt(e.target.value) })}
                          className="w-full px-2.5 py-1.5 bg-black/80 border border-yellow-500/40 rounded-lg text-xs text-amber-300 font-bold focus:outline-none cursor-pointer"
                        >
                          <option value={2}>2 Cartas no Tabuleiro</option>
                          <option value={3}>3 Cartas no Tabuleiro (Padrão)</option>
                          <option value={4}>4 Cartas no Tabuleiro</option>
                          <option value={5}>5 Cartas no Tabuleiro</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-gray-300 font-bold block mb-1">
                          Qtd de Rodadas Grátis:
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={adminConfig.bonusFreeSpinsCount ?? 10}
                          onChange={(e) => onUpdateAdminConfig({ bonusFreeSpinsCount: parseInt(e.target.value) || 10 })}
                          className="w-full px-2 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-emerald-300 font-mono font-bold"
                        />
                      </div>
                    </div>

                    {/* Advanced Bonus Settings */}
                    <div className="pt-2 border-t border-white/10 space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-gray-300 font-bold block mb-1">
                            Boost Multiplicador no Bônus:
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            step="0.5"
                            value={adminConfig.bonusMultiplierBoost ?? 2}
                            onChange={(e) => onUpdateAdminConfig({ bonusMultiplierBoost: parseFloat(e.target.value) || 2 })}
                            className="w-full px-2 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-yellow-300 font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-300 font-bold block mb-1">
                            Ganho Instantâneo no Acionamento:
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={adminConfig.bonusInstantPayMultiplier ?? 5}
                            onChange={(e) => onUpdateAdminConfig({ bonusInstantPayMultiplier: parseInt(e.target.value) || 0 })}
                            className="w-full px-2 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-emerald-300 font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-gray-300 font-bold block mb-1">
                          Comportamento / Forçar Ganhos no Bônus:
                        </label>
                        <select
                          value={adminConfig.bonusForceWinType || 'none'}
                          onChange={(e) => onUpdateAdminConfig({ bonusForceWinType: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-amber-300 font-bold focus:outline-none cursor-pointer"
                        >
                          <option value="none">Resultado Natural (Sem Forçar)</option>
                          <option value="normal_win">Forçar Ganhos Normais Constantes</option>
                          <option value="big_win">Forçar Sempre Big Wins!</option>
                          <option value="full_screen">Forçar Sempre Tela Cheia de Símbolos!</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-gray-300 font-bold block mb-1">
                          Mídia do Encerramento do Bônus (Vídeo ou Imagem):
                        </label>
                        <input
                          type="text"
                          value={adminConfig.bonusMediaUrl ?? ''}
                          onChange={(e) => onUpdateAdminConfig({ bonusMediaUrl: e.target.value })}
                          placeholder="Link da imagem/vídeo exibido no final"
                          className="w-full px-2.5 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                TAB 3: BACKGROUND, FRAME & LAYOUT
                ------------------------------------------------------------- */}
            {activeTab === 'screen' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                
                {/* Background Media */}
                <div className="bg-black/50 p-3.5 rounded-xl border border-red-500/20 space-y-3">
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>Mídia do Fundo (Imagem ou Vídeo MP4)</span>
                  </h3>

                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-300 font-bold block">Escolha uma Imagem por Upload ou Link:</label>
                    
                    {/* Drag and Drop / Selector zone */}
                    <div className="flex gap-2 items-center bg-black/60 p-2.5 rounded-xl border border-white/10 hover:border-amber-500/40 transition">
                      <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/20 hover:border-amber-400 hover:bg-white/5 py-4 px-2 rounded-lg cursor-pointer transition text-center group">
                        <Upload className="w-5 h-5 text-gray-400 group-hover:text-amber-400 group-hover:scale-110 transition mb-1" />
                        <span className="text-[10px] text-gray-300 font-extrabold uppercase tracking-wide group-hover:text-white">Fazer Upload de Imagem</span>
                        <span className="text-[8px] text-gray-500 mt-0.5 font-bold">Arraste ou clique para selecionar</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUploadForBackground}
                          className="hidden"
                        />
                      </label>

                      {/* Preview thumbnail of current background */}
                      {adminConfig.bgImage && (
                        <div className="relative w-16 h-16 rounded-lg border border-white/15 bg-neutral-900 overflow-hidden shrink-0 group flex items-center justify-center shadow-inner">
                          {adminConfig.bgImage.endsWith('.mp4') || adminConfig.bgImage.includes('video/') || adminConfig.bgImage.startsWith('data:video/') ? (
                            <div className="text-[8px] text-amber-300 font-bold font-mono">Vídeo MP4</div>
                          ) : (
                            <img 
                              src={adminConfig.bgImage} 
                              alt="Fundo" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <button
                            type="button"
                            title="Remover Imagem de Fundo"
                            onClick={() => onUpdateAdminConfig({ bgImage: '' })}
                            className="absolute inset-0 bg-red-600/95 text-white font-black text-[9px] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer"
                          >
                            Remover
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-center text-[9px] font-black uppercase text-amber-500/60 my-1">— OU INSIRA UM LINK DIRETO —</div>

                    <input
                      type="text"
                      value={adminConfig.bgImage}
                      onChange={(e) => onUpdateAdminConfig({ bgImage: e.target.value })}
                      placeholder="https://exemplo.com/fundo.png ou link .mp4"
                      className="w-full px-3 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-yellow-300 focus:outline-none focus:border-red-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Posição X (%):</label>
                      <input
                        type="number"
                        step="0.5"
                        value={adminConfig.bgPosX ?? 0}
                        onChange={(e) => onUpdateAdminConfig({ bgPosX: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1 bg-black/80 border border-white/20 rounded text-xs text-yellow-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Posição Y (%):</label>
                      <input
                        type="number"
                        step="0.5"
                        value={adminConfig.bgPosY ?? 0}
                        onChange={(e) => onUpdateAdminConfig({ bgPosY: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1 bg-black/80 border border-white/20 rounded text-xs text-yellow-300 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-300 font-bold mb-1">
                      <span>Zoom do Fundo:</span>
                      <span className="text-amber-300 font-mono">{adminConfig.bgZoom || 100}%</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="300"
                      value={adminConfig.bgZoom || 100}
                      onChange={(e) => onUpdateAdminConfig({ bgZoom: parseInt(e.target.value) })}
                      className="w-full accent-amber-500 cursor-pointer h-1.5"
                    />
                  </div>
                </div>

                {/* Símbolos Flutuantes Mode & Outer Frame */}
                <div className="bg-gradient-to-r from-red-950/80 via-black to-red-950/80 p-3.5 rounded-xl border-2 border-red-500/50 space-y-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
                    <div>
                      <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                        Modo Símbolos Flutuantes (Sem Grade / Transparente)
                      </h3>
                      <p className="text-[10px] text-gray-300">
                        Deixa cada elemento/figura transparente sem caixas/quadrados/grades, mantendo a animação perfeita.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2.5 p-2 bg-black/80 rounded-lg border border-white/10 cursor-pointer hover:border-amber-400/50 transition">
                    <input
                      type="checkbox"
                      checked={adminConfig.slotHideGrid ?? false}
                      onChange={(e) => onUpdateAdminConfig({ slotHideGrid: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <span className="text-xs font-extrabold text-white">
                      Remover Grade e Fundo dos Símbolos (Apenas Figura)
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 bg-black/80 rounded-lg border border-white/10 cursor-pointer hover:border-amber-400/50 transition">
                    <input
                      type="checkbox"
                      checked={adminConfig.slotHideOuterFrame ?? false}
                      onChange={(e) => onUpdateAdminConfig({ slotHideOuterFrame: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <span className="text-xs font-extrabold text-white">
                      Remover Moldura Externa do Quadro
                    </span>
                  </label>
                </div>

                {/* Slot Reel Box Frame Position & Scale */}
                <div className="bg-black/50 p-3.5 rounded-xl border border-red-500/20 space-y-3">
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                    Posicionamento & Tamanho da Moldura do Slot
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Margem Esquerda (%):</label>
                      <input
                        type="number"
                        step="0.5"
                        value={adminConfig.slotLeft ?? 4}
                        onChange={(e) => onUpdateAdminConfig({ slotLeft: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1 bg-black/80 border border-white/20 rounded text-xs text-amber-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Margem Topo (%):</label>
                      <input
                        type="number"
                        step="0.5"
                        value={adminConfig.slotTop ?? 28}
                        onChange={(e) => onUpdateAdminConfig({ slotTop: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1 bg-black/80 border border-white/20 rounded text-xs text-amber-300 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Largura (%):</label>
                      <input
                        type="number"
                        step="0.5"
                        value={adminConfig.slotWidth ?? 92}
                        onChange={(e) => onUpdateAdminConfig({ slotWidth: parseFloat(e.target.value) || 40 })}
                        className="w-full px-2 py-1 bg-black/80 border border-white/20 rounded text-xs text-amber-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Altura (%):</label>
                      <input
                        type="number"
                        step="0.5"
                        value={adminConfig.slotHeight ?? 38}
                        onChange={(e) => onUpdateAdminConfig({ slotHeight: parseFloat(e.target.value) || 40 })}
                        className="w-full px-2 py-1 bg-black/80 border border-white/20 rounded text-xs text-amber-300 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                TAB 4: SYMBOLS, ENHANCED UPLOAD & FREE POSITIONING
                ------------------------------------------------------------- */}
            {activeTab === 'symbols' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="bg-gradient-to-r from-red-950/80 via-black to-red-950/80 p-3.5 rounded-xl border border-red-500/40 space-y-2">
                  <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>Edição e Manipulação Livre de Símbolos</span>
                  </h3>
                  <p className="text-[10px] text-gray-300 leading-relaxed">
                    💡 Ao enviar uma nova imagem por upload, <strong className="text-amber-300">por padrão ela é carregada por inteiro sem cortes</strong> (<code className="text-yellow-300 font-mono">objectFit: contain</code>). Você pode alterar a escala (zoom), mover e posicioná-la livremente na tela!
                  </p>
                </div>

                <div className="space-y-3">
                  {SYMBOL_LIST.map(({ type, label }) => {
                    const currentConfig = adminConfig.customSymbolConfigs?.[type] || {
                      url: adminConfig.customSymbols?.[type] || '',
                      objectFit: 'contain',
                      offsetX: 0,
                      offsetY: 0,
                      scale: 100,
                    };

                    const updateSymConfig = (updates: Partial<SymbolImageConfig>) => {
                      const updatedConfigs = {
                        ...(adminConfig.customSymbolConfigs || {}),
                        [type]: { ...currentConfig, ...updates }
                      };
                      onUpdateAdminConfig({ customSymbolConfigs: updatedConfigs });
                    };

                    return (
                      <div key={type} className="bg-black/60 p-3.5 rounded-xl border border-white/10 space-y-3 hover:border-red-500/40 transition">
                        
                        {/* Header with Title & Preview */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-amber-500/40 flex items-center justify-center text-lg overflow-hidden shrink-0 shadow-inner">
                              <SlotSymbol 
                                type={type} 
                                customImage={currentConfig.url} 
                                symbolConfig={currentConfig}
                              />
                            </div>
                            <div>
                              <span className="text-xs font-black text-amber-300">{label}</span>
                              <span className="text-[9px] text-gray-400 block font-mono">ID: {type}</span>
                            </div>
                          </div>

                          <label className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-[10px] uppercase rounded-lg shadow transition cursor-pointer flex items-center gap-1">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Imagem</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUploadForSymbol(type, e)}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* URL Direct Input */}
                        <div>
                          <label className="text-[10px] text-gray-400 font-bold block mb-1">URL da Imagem:</label>
                          <input
                            type="text"
                            value={currentConfig.url}
                            onChange={(e) => {
                              const url = e.target.value;
                              const updatedSymbols = { ...adminConfig.customSymbols, [type]: url };
                              updateSymConfig({ url });
                              onUpdateAdminConfig({ customSymbols: updatedSymbols });
                            }}
                            placeholder="https://exemplo.com/simbolo.png"
                            className="w-full px-2.5 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-yellow-200 focus:outline-none font-mono"
                          />
                        </div>

                        {/* Full Image Controls: Fit Mode, Zoom Scale, Offset X/Y */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                          
                          {/* Fit Mode & Scale */}
                          <div className="space-y-2">
                            <div>
                              <label className="text-[10px] text-gray-300 font-bold block mb-1">
                                Modo de Encaixe:
                              </label>
                              <div className="grid grid-cols-2 gap-1">
                                <button
                                  type="button"
                                  onClick={() => updateSymConfig({ objectFit: 'contain' })}
                                  className={`py-1 text-[10px] font-black uppercase rounded border transition ${
                                    (currentConfig.objectFit || 'contain') === 'contain'
                                      ? 'bg-amber-500 text-black border-amber-300'
                                      : 'bg-black/60 text-gray-400 border-white/10'
                                  }`}
                                >
                                  Inteira (Contain)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateSymConfig({ objectFit: 'cover' })}
                                  className={`py-1 text-[10px] font-black uppercase rounded border transition ${
                                    currentConfig.objectFit === 'cover'
                                      ? 'bg-amber-500 text-black border-amber-300'
                                      : 'bg-black/60 text-gray-400 border-white/10'
                                  }`}
                                >
                                  Preencher (Cover)
                                </button>
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-[10px] font-bold text-gray-300 mb-1">
                                <span>Aumentar / Zoom Scale:</span>
                                <span className="text-amber-300 font-mono">{currentConfig.scale || 100}%</span>
                              </div>
                              <input
                                type="range"
                                min="20"
                                max="300"
                                value={currentConfig.scale || 100}
                                onChange={(e) => updateSymConfig({ scale: parseInt(e.target.value) })}
                                className="w-full accent-amber-500 cursor-pointer h-1.5"
                              />
                            </div>
                          </div>

                          {/* Free Movement Position Offset X and Offset Y */}
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-[10px] font-bold text-gray-300 mb-1">
                                <span>Mover Horizontal (X):</span>
                                <span className="text-yellow-300 font-mono">{currentConfig.offsetX || 0}%</span>
                              </div>
                              <input
                                type="range"
                                min="-100"
                                max="100"
                                value={currentConfig.offsetX || 0}
                                onChange={(e) => updateSymConfig({ offsetX: parseInt(e.target.value) })}
                                className="w-full accent-yellow-400 cursor-pointer h-1.5"
                              />
                            </div>

                            <div>
                              <div className="flex justify-between text-[10px] font-bold text-gray-300 mb-1">
                                <span>Mover Vertical (Y):</span>
                                <span className="text-yellow-300 font-mono">{currentConfig.offsetY || 0}%</span>
                              </div>
                              <input
                                type="range"
                                min="-100"
                                max="100"
                                value={currentConfig.offsetY || 0}
                                onChange={(e) => updateSymConfig({ offsetY: parseInt(e.target.value) })}
                                className="w-full accent-yellow-400 cursor-pointer h-1.5"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Interactive Drag & Pan Pad */}
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                          <div
                            onMouseDown={(e) => handleStartDrag(`symbol-pan-${type}`, currentConfig.offsetX || 0, currentConfig.offsetY || 0, e.clientX, e.clientY)}
                            className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 border border-white/20 rounded-lg text-center cursor-move text-xs font-bold text-amber-300 flex items-center justify-center gap-2 select-none"
                            title="Clique e arraste para posicionar a imagem livremente"
                          >
                            <Move className="w-4 h-4 text-amber-400 animate-bounce" />
                            <span>Arrastar e Posicionar Imagem Livremente</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => updateSymConfig({ offsetX: 0, offsetY: 0, scale: 100, objectFit: 'contain' })}
                            className="px-2.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white rounded-lg text-[10px] font-bold shrink-0"
                            title="Resetar Posição e Zoom"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                TAB 5: CUSTOM BUTTON CREATOR
                ------------------------------------------------------------- */}
            {activeTab === 'buttons' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="bg-black/50 p-3.5 rounded-xl border border-red-500/20 space-y-3">
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>Adicionar Novo Botão na Tela</span>
                  </h3>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Texto do Botão:</label>
                      <input
                        type="text"
                        value={btnLabel}
                        onChange={(e) => setBtnLabel(e.target.value)}
                        placeholder="Ex: COMPRAR BÔNUS"
                        className="w-full px-3 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Função / Ação do Botão:</label>
                      <select
                        value={btnAction}
                        onChange={(e) => setBtnAction(e.target.value as any)}
                        className="w-full px-3 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-amber-300 focus:outline-none"
                      >
                        <option value="spin">GIRAR (Spin)</option>
                        <option value="buy_bonus">Comprar Bônus</option>
                        <option value="bet_plus">Aumentar Aposta (+)</option>
                        <option value="bet_minus">Diminuir Aposta (-)</option>
                        <option value="turbo_toggle">Modo Turbo</option>
                        <option value="auto_spin">Auto Giro</option>
                        <option value="open_menu">Abrir Menu</option>
                        <option value="add_balance">Adicionar R$ Saldo</option>
                        <option value="force_big_win">Forçar Mega Vitória</option>
                        <option value="redirect_url">Redirecionar para Link/URL</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Forma do Botão:</label>
                      <select
                        value={btnShape}
                        onChange={(e) => setBtnShape(e.target.value as any)}
                        className="w-full px-3 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-amber-300 focus:outline-none"
                      >
                        <option value="pill">Pílula Arredondada (Pill)</option>
                        <option value="circle">Círculo Perfeito</option>
                        <option value="square">Quadrado</option>
                        <option value="rounded">Retângulo Arredondado</option>
                        <option value="neon_glow">Neon Brilhante (Glow)</option>
                        <option value="glass">Vidro Translúcido (Glass)</option>
                        <option value="retro">Retro Arcade (8-bit)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1.5">Cor e Estilo do Botão:</label>
                      <div className="grid grid-cols-3 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                        {BUTTON_COLOR_PRESETS.map((preset) => {
                          const isActive = btnColor === preset.bgColor;
                          return (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => {
                                setBtnColor(preset.bgColor);
                                setBtnTextColor(preset.textColor);
                              }}
                              className={`p-1.5 text-[9px] font-black uppercase text-center rounded transition-all duration-150 border cursor-pointer ${preset.bgColor} ${preset.textColor} ${
                                isActive ? 'border-yellow-400 ring-2 ring-yellow-400/55 scale-[1.03]' : 'border-neutral-800 opacity-80 hover:opacity-100 hover:scale-[1.02]'
                              }`}
                            >
                              {preset.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">URL de Imagem / Logo Customizada (Opcional):</label>
                      <input
                        type="text"
                        value={btnImageUrl}
                        onChange={(e) => setBtnImageUrl(e.target.value)}
                        placeholder="https://exemplo.com/icone.png"
                        className="w-full px-3 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-white focus:outline-none font-mono"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddButton}
                      className="w-full py-2.5 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-xs uppercase tracking-wider rounded-lg shadow-lg transition cursor-pointer"
                    >
                      + Criar Botão na Tela
                    </button>
                  </div>
                </div>

                {/* Buy Bonus Button Configuration Area */}
                <div className="bg-gradient-to-r from-amber-950/40 via-black to-amber-950/40 p-3.5 rounded-xl border border-yellow-500/40 space-y-3">
                  <h3 className="text-xs font-black text-yellow-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>Configuração do Botão Comprar Bônus</span>
                  </h3>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 p-2 bg-black/70 rounded-lg border border-white/10 cursor-pointer hover:border-yellow-500/50 transition">
                      <input
                        type="checkbox"
                        checked={adminConfig.enableBuyBonus !== false}
                        onChange={(e) => onUpdateAdminConfig({ enableBuyBonus: e.target.checked })}
                        className="w-4 h-4 accent-yellow-500 rounded cursor-pointer"
                      />
                      <span className="text-xs text-gray-200 font-bold">
                        Habilitar Botão de Comprar Bônus no Jogo
                      </span>
                    </label>

                    {adminConfig.enableBuyBonus !== false && (
                      <>
                        <div>
                          <label className="text-[10px] text-gray-300 font-bold block mb-1">
                            Preço do Bônus (Multiplicador de Aposta, ex: 50x ou 100x):
                          </label>
                          <input
                            type="number"
                            min="5"
                            max="500"
                            value={adminConfig.buyBonusMultiplier ?? 50}
                            onChange={(e) => onUpdateAdminConfig({ buyBonusMultiplier: parseInt(e.target.value) || 50 })}
                            className="w-full px-2.5 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-yellow-300 font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-300 font-bold block mb-1">
                            Texto / Label do Botão:
                          </label>
                          <input
                            type="text"
                            value={adminConfig.buyBonusLabel ?? "⭐ Comprar Bônus (x{multiplier})"}
                            onChange={(e) => onUpdateAdminConfig({ buyBonusLabel: e.target.value })}
                            placeholder="Use {multiplier} para mostrar o preço"
                            className="w-full px-2.5 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-white"
                          />
                          <p className="text-[8px] text-gray-400 mt-0.5">
                            Use o texto <code className="text-yellow-400">{`{multiplier}`}</code> para inserir dinamicamente o custo selecionado.
                          </p>
                        </div>

                        {/* Position X and Y, and Scale */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="flex justify-between text-[10px] text-gray-300 font-bold mb-1">
                              <span>Posição X (%):</span>
                              <span className="text-amber-300 font-mono">{adminConfig.buyBonusPosX ?? 50}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="0.5"
                              value={adminConfig.buyBonusPosX ?? 50}
                              onChange={(e) => onUpdateAdminConfig({ buyBonusPosX: parseFloat(e.target.value) })}
                              className="w-full accent-amber-500 cursor-pointer h-1.5"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-[10px] text-gray-300 font-bold mb-1">
                              <span>Posição Y (%):</span>
                              <span className="text-amber-300 font-mono">{adminConfig.buyBonusPosY ?? 71}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="0.5"
                              value={adminConfig.buyBonusPosY ?? 71}
                              onChange={(e) => onUpdateAdminConfig({ buyBonusPosY: parseFloat(e.target.value) })}
                              className="w-full accent-amber-500 cursor-pointer h-1.5"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[10px] text-gray-300 font-bold mb-1">
                            <span>Tamanho do Botão (%):</span>
                            <span className="text-amber-300 font-mono">{adminConfig.buyBonusScale ?? 100}%</span>
                          </div>
                          <input
                            type="range"
                            min="40"
                            max="250"
                            value={adminConfig.buyBonusScale ?? 100}
                            onChange={(e) => onUpdateAdminConfig({ buyBonusScale: parseInt(e.target.value) })}
                            className="w-full accent-amber-500 cursor-pointer h-1.5"
                          />
                        </div>

                        {/* Interactive Drag Hint */}
                        <button
                          type="button"
                          onClick={() => setNudgeTarget('buyBonus')}
                          className="w-full py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 rounded-lg text-[10px] font-extrabold uppercase flex items-center justify-center gap-1"
                        >
                          <Move className="w-3.5 h-3.5" />
                          <span>Selecionar p/ Ajustar na Tela</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* List of Created Custom Buttons */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black text-gray-300 uppercase tracking-wider">
                    Botões Criados ({adminConfig.customButtons?.length || 0}):
                  </h4>

                  {(adminConfig.customButtons || []).map((btn) => (
                    <div key={btn.id} className="bg-black/60 p-2.5 rounded-xl border border-white/10 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-black text-yellow-300">{btn.label}</div>
                        <div className="text-[9px] text-gray-400 font-mono">
                          Ação: {btn.actionType} | X:{btn.posX}% Y:{btn.posY}%
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveButton(btn.id)}
                        className="p-1.5 bg-red-950/80 hover:bg-red-600 text-red-300 hover:text-white rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                TAB 6: CUSTOM TEXTS & HUD POSITIONING
                ------------------------------------------------------------- */}
            {activeTab === 'hud' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Create Custom Text */}
                <div className="bg-black/50 p-3.5 rounded-xl border border-red-500/20 space-y-3">
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <TypeIcon className="w-4 h-4 text-amber-400" />
                    <span>Adicionar Texto Customizado</span>
                  </h3>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Texto Exibido:</label>
                      <input
                        type="text"
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder="Ex: MEGA PRÊMIO"
                        className="w-full px-3 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-300 font-bold block mb-1">Tamanho da Fonte (px):</label>
                        <input
                          type="number"
                          value={newTextSize}
                          onChange={(e) => setNewTextSize(parseInt(e.target.value) || 14)}
                          className="w-full px-2.5 py-1 bg-black/80 border border-white/20 rounded text-xs text-yellow-300 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-300 font-bold block mb-1">Cor do Texto (Hex):</label>
                        <input
                          type="color"
                          value={newTextColor}
                          onChange={(e) => setNewTextColor(e.target.value)}
                          className="w-full h-7 bg-black/80 border border-white/20 rounded cursor-pointer"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddText}
                      className="w-full py-2.5 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-xs uppercase tracking-wider rounded-lg shadow-lg transition cursor-pointer"
                    >
                      + Criar Texto na Tela
                    </button>
                  </div>
                </div>

                {/* List of Custom Texts */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black text-gray-300 uppercase tracking-wider">
                    Textos Criados ({adminConfig.customTexts?.length || 0}):
                  </h4>

                  {(adminConfig.customTexts || []).map((txt) => (
                    <div key={txt.id} className="bg-black/60 p-2.5 rounded-xl border border-white/10 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-extrabold" style={{ color: txt.color }}>{txt.text}</div>
                        <div className="text-[9px] text-gray-400 font-mono">
                          Tamanho: {txt.fontSize}px | X:{txt.posX}% Y:{txt.posY}%
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveText(txt.id)}
                        className="p-1.5 bg-red-950/80 hover:bg-red-600 text-red-300 hover:text-white rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

        {/* Right Studio Canvas: Interactive Live Simulator Stage (7 Cols) */}
        <div 
          ref={previewCanvasRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`${isFocusMode ? 'lg:col-span-12' : 'lg:col-span-7'} bg-[#040508] p-4 flex flex-col items-center justify-center relative overflow-hidden select-none min-h-[500px] transition-all duration-300`}
        >
          {/* Alignment Crosshairs Overlay */}
          {showGridLines && (
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="w-full h-full grid grid-cols-10 grid-rows-10 border border-yellow-500/10">
                {Array.from({ length: 100 }).map((_, i) => (
                  <div key={i} className="border-r border-b border-yellow-500/10" />
                ))}
              </div>
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-red-500/40" />
              <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-red-500/40" />
            </div>
          )}

          {/* Preview Control Header: Tabuleiro e Rolagem Selector Bar (Draggable) */}
          <div 
            style={{
              width: `${toolbarWidth}px`,
              maxWidth: '95vw',
              transform: `translate(${adminConfig.toolbarPosX ?? 0}px, ${adminConfig.toolbarPosY ?? 0}px)`
            }}
            className="bg-black/95 backdrop-blur-md border-2 border-amber-500/60 rounded-2xl p-3 mb-3 shadow-[0_0_35px_rgba(245,158,11,0.35)] z-30 space-y-2.5 select-none relative transition-all duration-75"
          >
            {/* Header: Draggable Grip and Reset */}
            <div 
              onMouseDown={(e) => handleStartDrag('toolbar', adminConfig.toolbarPosX ?? 0, adminConfig.toolbarPosY ?? 0, e.clientX, e.clientY)}
              className="flex items-center justify-between border-b border-white/10 pb-1.5 cursor-grab active:cursor-grabbing hover:bg-white/5 px-1.5 py-1 rounded-lg transition"
            >
              <div className="flex items-center gap-1.5">
                <GripHorizontal className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                <span className="text-[11px] font-black uppercase text-amber-300 tracking-wider">
                  Ferramenta de Ajustes Gerais
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-gray-300 bg-neutral-900 px-1.5 py-0.5 rounded border border-white/10">
                  X:{adminConfig.toolbarPosX ?? 0}px | Y:{adminConfig.toolbarPosY ?? 0}px
                </span>
                {(adminConfig.toolbarPosX !== 0 || adminConfig.toolbarPosY !== 0) && (
                  <button
                    type="button"
                    title="Resetar Posição da Ferramenta"
                    onClick={(e) => { e.stopPropagation(); onUpdateAdminConfig({ toolbarPosX: 0, toolbarPosY: 0 }); }}
                    className="p-1 bg-red-950/80 hover:bg-red-600 text-red-300 hover:text-white rounded transition cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Sub-tabs system within the Tool Board */}
            <div className="grid grid-cols-3 gap-1 bg-neutral-950 p-1 rounded-lg border border-white/5">
              <button
                type="button"
                onClick={() => setToolbarTab('board')}
                className={`py-1 text-[10px] font-black rounded transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  toolbarTab === 'board' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>🎰</span>
                <span>Motor</span>
              </button>
              <button
                type="button"
                onClick={() => setToolbarTab('layout')}
                className={`py-1 text-[10px] font-black rounded transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  toolbarTab === 'layout' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>🎯</span>
                <span>Alinhamento</span>
              </button>
              <button
                type="button"
                onClick={() => setToolbarTab('size')}
                className={`py-1 text-[10px] font-black rounded transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  toolbarTab === 'size' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>📐</span>
                <span>Tamanho</span>
              </button>
            </div>

            {/* SUB-TAB Content: BOARD */}
            {toolbarTab === 'board' && (
              <div className="space-y-2.5 animate-in fade-in duration-150">
                {/* Fast Swap Board Pills */}
                <div>
                  <div className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1 flex items-center justify-between">
                    <span>Selecionar Tabuleiro Ativo:</span>
                    <span className="text-gray-500 font-mono text-[8px]">{activeBoardType}</span>
                  </div>
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
                    {BOARD_OPTIONS.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          onUpdateAdminConfig({ boardType: b.id });
                          if (engineConfig && onUpdateEngineConfig) {
                            onUpdateEngineConfig({ ...engineConfig, boardType: b.id });
                          }
                        }}
                        className={`px-2 py-1 rounded-md text-[10px] font-extrabold shrink-0 border transition cursor-pointer ${
                          activeBoardType === b.id
                            ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white border-yellow-300 shadow scale-105'
                            : 'bg-neutral-900 text-gray-300 border-white/5 hover:border-amber-400/50 hover:text-amber-300'
                        }`}
                      >
                        {b.id}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fast Swap Spin Roll Style Pills */}
                <div className="pt-1.5 border-t border-white/10">
                  <div className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1 flex items-center justify-between">
                    <span>Rolagem dos Rolos:</span>
                    <span className="text-gray-500 font-mono text-[8px]">{activeRollStyle.label}</span>
                  </div>
                  <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-thin scrollbar-thumb-white/10">
                    {SPIN_ROLL_STYLES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onUpdateAdminConfig({ spinRollStyle: s.id })}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 border transition cursor-pointer flex items-center gap-1 ${
                          (adminConfig.spinRollStyle || 'standard') === s.id
                            ? 'bg-amber-400 text-black border-yellow-200 shadow scale-105'
                            : 'bg-neutral-900 text-gray-400 border-white/5 hover:text-white'
                        }`}
                      >
                        <span>{s.icon}</span>
                        <span>{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB Content: LAYOUT (ALIGNMENT & DIRECTIONAL COORDS) */}
            {toolbarTab === 'layout' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between gap-2 bg-neutral-950 p-1.5 rounded-lg border border-white/5">
                  <span className="text-[10px] font-black uppercase text-gray-400">Elemento Focado:</span>
                  <select
                    value={nudgeTarget || 'phone'}
                    onChange={(e) => setNudgeTarget(e.target.value as any)}
                    className="bg-neutral-900 border border-white/10 text-amber-300 font-bold text-[10px] px-2 py-1 rounded cursor-pointer focus:outline-none"
                  >
                    <option value="phone">📱 Celular (Fundo)</option>
                    <option value="background">🖼️ Imagem de Fundo (Upload)</option>
                    <option value="slot">🎰 Moldura do Slot</option>
                    <option value="spin">🔘 Botão de Girar</option>
                    <option value="buyBonus">⭐ Botão Comprar Bônus</option>
                    <option value="toolbar">🛠️ Esta Ferramenta</option>
                    {(adminConfig.customButtons || []).map(b => (
                      <option key={b.id} value={`button-${b.id}`}>🎨 Botão: {b.label}</option>
                    ))}
                    {(adminConfig.customTexts || []).map(t => (
                      <option key={t.id} value={`text-${t.id}`}>📝 Texto: {t.text.substring(0,10)}...</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 items-center">
                  {/* Left Side: Directional Arrows Nudge D-pad */}
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Ajustar Posição</span>
                    <div className="grid grid-cols-3 gap-1 w-24 h-24 relative bg-neutral-900/50 p-1.5 rounded-xl border border-white/5">
                      <div />
                      <button
                        type="button"
                        onClick={() => handleNudge(0, -1)}
                        className="bg-neutral-800 hover:bg-amber-400 hover:text-black text-gray-200 font-black rounded-lg flex items-center justify-center transition active:scale-90 cursor-pointer border border-white/5"
                        title="Mover para Cima"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <div />

                      <button
                        type="button"
                        onClick={() => handleNudge(-1, 0)}
                        className="bg-neutral-800 hover:bg-amber-400 hover:text-black text-gray-200 font-black rounded-lg flex items-center justify-center transition active:scale-90 cursor-pointer border border-white/5"
                        title="Mover para Esquerda"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <div className="bg-neutral-950 flex items-center justify-center rounded text-[9px] font-black font-mono text-amber-300 border border-white/10">
                        {nudgeStep}px
                      </div>
                      <button
                        type="button"
                        onClick={() => handleNudge(1, 0)}
                        className="bg-neutral-800 hover:bg-amber-400 hover:text-black text-gray-200 font-black rounded-lg flex items-center justify-center transition active:scale-90 cursor-pointer border border-white/5"
                        title="Mover para Direita"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <div />
                      <button
                        type="button"
                        onClick={() => handleNudge(0, 1)}
                        className="bg-neutral-800 hover:bg-amber-400 hover:text-black text-gray-200 font-black rounded-lg flex items-center justify-center transition active:scale-90 cursor-pointer border border-white/5"
                        title="Mover para Baixo"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <div />
                    </div>
                  </div>

                  {/* Right Side: Step and Center presets */}
                  <div className="space-y-2">
                    <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Passo</span>
                      <div className="grid grid-cols-3 gap-0.5 bg-neutral-950 p-0.5 rounded border border-white/5">
                        {[1, 5, 10].map((step) => (
                          <button
                            key={step}
                            type="button"
                            onClick={() => setNudgeStep(step)}
                            className={`py-0.5 text-[9px] font-black rounded cursor-pointer transition ${
                              nudgeStep === step ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {step}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1 pt-1.5 border-t border-white/5">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Alinhamento</span>
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          type="button"
                          onClick={() => handleCenterTarget('x')}
                          className="py-1 px-1.5 bg-neutral-900 hover:bg-amber-500 hover:text-black text-[9px] font-black rounded transition text-center cursor-pointer border border-white/5 whitespace-nowrap"
                          title="Centralizar Horizontalmente"
                        >
                          Centrar Horiz.
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCenterTarget('y')}
                          className="py-1 px-1.5 bg-neutral-900 hover:bg-amber-500 hover:text-black text-[9px] font-black rounded transition text-center cursor-pointer border border-white/5 whitespace-nowrap"
                          title="Centralizar Verticalmente"
                        >
                          Centrar Vert.
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB Content: SIZES & OTHER SETTINGS */}
            {toolbarTab === 'size' && (
              <div className="space-y-2.5 animate-in fade-in duration-150 text-xs">
                {/* 1. Celular Width */}
                <div>
                  <div className="flex justify-between text-[10px] text-gray-300 font-bold mb-1">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Smartphone className="w-3 h-3" />
                      <span>Largura do Celular (Preview):</span>
                    </span>
                    <span className="text-amber-300 font-mono font-black">{phoneWidth}px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={240}
                      max={650}
                      step={10}
                      value={phoneWidth}
                      onChange={(e) => setPhoneWidth(parseInt(e.target.value) || 360)}
                      className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                    />
                    <div className="flex gap-0.5">
                      {[320, 360, 420].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setPhoneWidth(w)}
                          className={`px-1 py-0.5 rounded text-[8px] font-black cursor-pointer transition ${
                            phoneWidth === w ? 'bg-amber-400 text-black' : 'bg-neutral-800 text-gray-300'
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Tool Board Width */}
                <div className="pt-1.5 border-t border-white/10">
                  <div className="flex justify-between text-[10px] text-gray-300 font-bold mb-1">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Maximize2 className="w-3 h-3" />
                      <span>Largura deste Painel:</span>
                    </span>
                    <span className="text-amber-300 font-mono font-black">{toolbarWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min={340}
                    max={720}
                    step={10}
                    value={toolbarWidth}
                    onChange={(e) => setToolbarWidth(parseInt(e.target.value) || 440)}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                  />
                </div>

                {/* 3. Selected Target Width/Height/Scale Sliders */}
                {nudgeTarget && (
                  <div className="pt-2 border-t border-white/10 bg-neutral-950 p-2 rounded-lg border border-white/5 space-y-2">
                    <span className="text-[9px] font-black uppercase text-amber-300 block">
                      Ajustar Dimensões de: <b className="text-white">{nudgeTarget}</b>
                    </span>

                    {/* If selected target is SLOT */}
                    {nudgeTarget === 'slot' && (
                      <div className="space-y-1.5">
                        <div>
                          <div className="flex justify-between text-[9px] text-gray-300 font-bold">
                            <span>Largura do Slot (%):</span>
                            <span className="text-yellow-400 font-mono">{adminConfig.slotWidth ?? 92}%</span>
                          </div>
                          <input
                            type="range"
                            min="30"
                            max="100"
                            step="1"
                            value={adminConfig.slotWidth ?? 92}
                            onChange={(e) => onUpdateAdminConfig({ slotWidth: parseFloat(e.target.value) })}
                            className="w-full accent-yellow-400 h-1 cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[9px] text-gray-300 font-bold">
                            <span>Altura do Slot (%):</span>
                            <span className="text-yellow-400 font-mono">{adminConfig.slotHeight ?? 38}%</span>
                          </div>
                          <input
                            type="range"
                            min="15"
                            max="80"
                            step="1"
                            value={adminConfig.slotHeight ?? 38}
                            onChange={(e) => onUpdateAdminConfig({ slotHeight: parseFloat(e.target.value) })}
                            className="w-full accent-yellow-400 h-1 cursor-pointer"
                          />
                        </div>
                      </div>
                    )}

                    {/* If selected target is SPIN */}
                    {nudgeTarget === 'spin' && (
                      <div>
                        <div className="flex justify-between text-[9px] text-gray-300 font-bold">
                          <span>Escala do Botão (%):</span>
                          <span className="text-yellow-400 font-mono">{adminConfig.spinScale ?? 100}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="180"
                          step="5"
                          value={adminConfig.spinScale ?? 100}
                          onChange={(e) => onUpdateAdminConfig({ spinScale: parseInt(e.target.value) })}
                          className="w-full accent-yellow-400 h-1 cursor-pointer"
                        />
                      </div>
                    )}

                    {/* If selected target is BUY BONUS */}
                    {nudgeTarget === 'buyBonus' && (
                      <div>
                        <div className="flex justify-between text-[9px] text-gray-300 font-bold">
                          <span>Escala do Bônus (%):</span>
                          <span className="text-yellow-400 font-mono">{adminConfig.buyBonusScale ?? 100}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="180"
                          step="5"
                          value={adminConfig.buyBonusScale ?? 100}
                          onChange={(e) => onUpdateAdminConfig({ buyBonusScale: parseInt(e.target.value) })}
                          className="w-full accent-yellow-400 h-1 cursor-pointer"
                        />
                      </div>
                    )}

                    {/* If selected target is BACKGROUND */}
                    {nudgeTarget === 'background' && (
                      <div className="space-y-2.5">
                        <div>
                          <div className="flex justify-between text-[9px] text-gray-300 font-bold">
                            <span>Zoom da Imagem (%):</span>
                            <span className="text-yellow-400 font-mono">{adminConfig.bgZoom ?? 100}%</span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="500"
                            step="5"
                            value={adminConfig.bgZoom ?? 100}
                            onChange={(e) => onUpdateAdminConfig({ bgZoom: parseInt(e.target.value) })}
                            className="w-full accent-yellow-400 h-1 cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[9px] text-gray-300 font-bold">
                            <span>Posição Horizontal X (%):</span>
                            <span className="text-yellow-400 font-mono">{adminConfig.bgPosX ?? 0}%</span>
                          </div>
                          <input
                            type="range"
                            min="-200"
                            max="200"
                            step="1"
                            value={adminConfig.bgPosX ?? 0}
                            onChange={(e) => onUpdateAdminConfig({ bgPosX: parseInt(e.target.value) })}
                            className="w-full accent-yellow-400 h-1 cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[9px] text-gray-300 font-bold">
                            <span>Posição Vertical Y (%):</span>
                            <span className="text-yellow-400 font-mono">{adminConfig.bgPosY ?? 0}%</span>
                          </div>
                          <input
                            type="range"
                            min="-200"
                            max="200"
                            step="1"
                            value={adminConfig.bgPosY ?? 0}
                            onChange={(e) => onUpdateAdminConfig({ bgPosY: parseInt(e.target.value) })}
                            className="w-full accent-yellow-400 h-1 cursor-pointer"
                          />
                        </div>
                        <div className="pt-1 flex gap-1">
                          <button
                            type="button"
                            onClick={() => onUpdateAdminConfig({ bgPosX: 0, bgPosY: 0, bgZoom: 100 })}
                            className="w-full py-1 text-[9px] font-black uppercase text-center rounded transition bg-neutral-800 border border-neutral-700 text-amber-300 hover:bg-neutral-700 cursor-pointer"
                          >
                            Resetar Imagem
                          </button>
                        </div>
                      </div>
                    )}

                    {/* If selected target is custom button */}
                    {nudgeTarget?.startsWith('button-') && (
                      <div className="space-y-3 pt-1 border-t border-white/5">
                        {(() => {
                          const btnId = nudgeTarget.replace('button-', '');
                          const btn = (adminConfig.customButtons || []).find(b => b.id === btnId);
                          if (!btn) return <div className="text-[10px] text-red-400">Botão não encontrado</div>;

                          const updateBtnProperty = (updates: Partial<CustomButtonConfig>) => {
                            const updated = (adminConfig.customButtons || []).map(b =>
                              b.id === btnId ? { ...b, ...updates } : b
                            );
                            onUpdateAdminConfig({ customButtons: updated });
                          };

                          return (
                            <div className="space-y-2.5">
                              {/* Title / Label input */}
                              <div>
                                <label className="text-[9px] text-gray-300 font-bold block mb-1">Texto do Botão:</label>
                                <input
                                  type="text"
                                  value={btn.label}
                                  onChange={(e) => updateBtnProperty({ label: e.target.value })}
                                  className="w-full px-2 py-1 bg-black/80 border border-white/15 rounded text-[11px] text-white focus:outline-none focus:border-yellow-500"
                                />
                              </div>

                              {/* Scale slider */}
                              <div>
                                <div className="flex justify-between text-[9px] text-gray-300 font-bold mb-1">
                                  <span>Escala (%):</span>
                                  <span className="text-yellow-400 font-mono">{btn.scale}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="50"
                                  max="180"
                                  step="5"
                                  value={btn.scale}
                                  onChange={(e) => updateBtnProperty({ scale: parseInt(e.target.value) })}
                                  className="w-full accent-yellow-400 h-1 cursor-pointer"
                                />
                              </div>

                              {/* Shape dropdown */}
                              <div>
                                <label className="text-[9px] text-gray-300 font-bold block mb-1">Forma do Botão:</label>
                                <select
                                  value={btn.shape || 'pill'}
                                  onChange={(e) => updateBtnProperty({ shape: e.target.value as any })}
                                  className="w-full px-2 py-1 bg-black border border-white/15 rounded text-[10px] text-amber-300 focus:outline-none"
                                >
                                  <option value="pill">Pílula Arredondada (Pill)</option>
                                  <option value="circle">Círculo Perfeito</option>
                                  <option value="square">Quadrado</option>
                                  <option value="rounded">Retângulo Arredondado</option>
                                  <option value="neon_glow">Neon Brilhante (Glow)</option>
                                  <option value="glass">Vidro Translúcido (Glass)</option>
                                  <option value="retro">Retro Arcade (8-bit)</option>
                                </select>
                              </div>

                              {/* Color Presets */}
                              <div>
                                <label className="text-[9px] text-gray-300 font-bold block mb-1">Cor do Botão:</label>
                                <div className="grid grid-cols-5 gap-1">
                                  {BUTTON_COLOR_PRESETS.map((preset) => {
                                    const isSelected = btn.bgColor === preset.bgColor;
                                    return (
                                      <button
                                        key={preset.name}
                                        type="button"
                                        onClick={() => updateBtnProperty({ bgColor: preset.bgColor, textColor: preset.textColor })}
                                        title={preset.name}
                                        className={`w-full h-5 rounded cursor-pointer border transition-all duration-150 flex items-center justify-center ${preset.bgColor} ${
                                          isSelected ? 'border-yellow-400 ring-1 ring-yellow-400 scale-[1.05]' : 'border-neutral-800 opacity-85 hover:opacity-100'
                                        }`}
                                      >
                                        <span className={`text-[8px] font-black ${preset.textColor}`}>A</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Action Type */}
                              <div>
                                <label className="text-[9px] text-gray-300 font-bold block mb-1">Função / Ação:</label>
                                <select
                                  value={btn.actionType}
                                  onChange={(e) => updateBtnProperty({ actionType: e.target.value as any })}
                                  className="w-full px-2 py-1 bg-black border border-white/15 rounded text-[10px] text-white focus:outline-none"
                                >
                                  <option value="spin">GIRAR (Spin)</option>
                                  <option value="buy_bonus">Comprar Bônus</option>
                                  <option value="bet_plus">Aumentar Aposta (+)</option>
                                  <option value="bet_minus">Diminuir Aposta (-)</option>
                                  <option value="turbo_toggle">Modo Turbo</option>
                                  <option value="auto_spin">Auto Giro</option>
                                  <option value="open_menu">Abrir Menu</option>
                                  <option value="add_balance">Adicionar R$ Saldo</option>
                                  <option value="force_big_win">Forçar Mega Vitória</option>
                                  <option value="redirect_url">Redirecionar Link</option>
                                </select>
                              </div>

                              {/* Action Value */}
                              {(btn.actionType === 'redirect_url' || btn.actionType === 'add_balance') && (
                                <div>
                                  <label className="text-[9px] text-gray-300 font-bold block mb-1">Valor / Link:</label>
                                  <input
                                    type="text"
                                    value={btn.actionValue}
                                    onChange={(e) => updateBtnProperty({ actionValue: e.target.value })}
                                    placeholder="Ex: https://... ou 1000"
                                    className="w-full px-2 py-1 bg-black/80 border border-white/15 rounded text-[10px] text-white focus:outline-none font-mono"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* If selected target is custom text */}
                    {nudgeTarget?.startsWith('text-') && (
                      <div>
                        <div className="flex justify-between text-[9px] text-gray-300 font-bold">
                          <span>Tamanho da Fonte (px):</span>
                          {(() => {
                            const textId = nudgeTarget.replace('text-', '');
                            const txt = (adminConfig.customTexts || []).find(t => t.id === textId);
                            return (
                              <>
                                <span className="text-yellow-400 font-mono">{txt ? txt.fontSize : 14}px</span>
                                <input
                                  type="range"
                                  min="8"
                                  max="48"
                                  step="1"
                                  value={txt ? txt.fontSize : 14}
                                  onChange={(e) => {
                                    const nextSize = parseInt(e.target.value);
                                    const updated = (adminConfig.customTexts || []).map(t =>
                                      t.id === textId ? { ...t, fontSize: nextSize } : t
                                    );
                                    onUpdateAdminConfig({ customTexts: updated });
                                  }}
                                  className="w-full accent-yellow-400 h-1 cursor-pointer"
                                />
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Phone Wrapper with Resize Bounding Box */}
          <div
            style={{ 
              width: `${phoneWidth}px`,
              transform: `translate(${adminConfig.phonePosX ?? 0}px, ${adminConfig.phonePosY ?? 0}px)`
            }}
            className={`relative aspect-[9/16] z-20 transition-transform duration-75 select-none ${
              nudgeTarget === 'phone' ? 'ring-2 ring-yellow-400 ring-offset-4 ring-offset-black rounded-[38px]' : ''
            }`}
            onClick={() => setNudgeTarget('phone')}
          >
            {/* Visual Bounding Box with 4 Handles around Phone */}
            {nudgeTarget === 'phone' && (
              <div className="absolute -inset-4 border-2 border-dashed border-yellow-400 pointer-events-none rounded-[44px] z-50">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setNudgeTarget(null);
                  }}
                  className="absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-5 bg-red-600 hover:bg-red-500 border border-black rounded-full pointer-events-auto flex items-center justify-center text-[10px] text-white font-black hover:scale-125 transition shadow-lg z-50 cursor-pointer animate-bounce"
                  title="Desmarcar Celular"
                >
                  ×
                </button>
                <div 
                  onMouseDown={(e) => handleStartResize('phone', 'tl', e)}
                  className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-yellow-400 border-2 border-black rounded-full pointer-events-auto cursor-nwse-resize hover:scale-125 transition z-50 shadow-md flex items-center justify-center animate-pulse"
                  title="Arrastar para Redimensionar"
                />
                <div 
                  onMouseDown={(e) => handleStartResize('phone', 'tr', e)}
                  className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-yellow-400 border-2 border-black rounded-full pointer-events-auto cursor-nesw-resize hover:scale-125 transition z-50 shadow-md flex items-center justify-center animate-pulse"
                  title="Arrastar para Redimensionar"
                />
                <div 
                  onMouseDown={(e) => handleStartResize('phone', 'bl', e)}
                  className="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-yellow-400 border-2 border-black rounded-full pointer-events-auto cursor-nesw-resize hover:scale-125 transition z-50 shadow-md flex items-center justify-center animate-pulse"
                  title="Arrastar para Redimensionar"
                />
                <div 
                  onMouseDown={(e) => handleStartResize('phone', 'br', e)}
                  className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-yellow-400 border-2 border-black rounded-full pointer-events-auto cursor-nwse-resize hover:scale-125 transition z-50 shadow-md flex items-center justify-center animate-pulse"
                  title="Arrastar para Redimensionar"
                />
              </div>
            )}

            {/* Phone Simulator Frame */}
            <div 
              className="w-full h-full relative bg-black rounded-[38px] border-[8px] border-neutral-800 overflow-hidden shadow-[0_0_60px_rgba(239,68,68,0.3)] flex flex-col justify-between select-none"
            >
              {/* Draggable Top Handle Bar over Notch */}
              <div 
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleStartDrag('phone', adminConfig.phonePosX ?? 0, adminConfig.phonePosY ?? 0, e.clientX, e.clientY);
                  setNudgeTarget('phone');
                }}
                className="w-full bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 border-b border-amber-500/40 px-3 py-1 flex items-center justify-between cursor-grab active:cursor-grabbing hover:bg-neutral-800 z-50 transition"
              >
                <div className="flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                    Mover Celular (X:{adminConfig.phonePosX ?? 0}px Y:{adminConfig.phonePosY ?? 0}px)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {(adminConfig.phonePosX !== 0 || adminConfig.phonePosY !== 0) && (
                    <button
                      type="button"
                      title="Centralizar Celular"
                      onClick={(e) => { e.stopPropagation(); onUpdateAdminConfig({ phonePosX: 0, phonePosY: 0 }); }}
                      className="p-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black rounded transition cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Background Media */}
              <BackgroundMedia 
                src={adminConfig.bgImage}
                posX={adminConfig.bgPosX}
                posY={adminConfig.bgPosY}
                zoom={adminConfig.bgZoom}
                mediaType={adminConfig.bgMediaType}
              />

              {/* Clickable drag handler layer for Background Media */}
              <div 
                className={`absolute inset-0 z-0 cursor-grab active:cursor-grabbing ${
                  nudgeTarget === 'background' ? 'ring-4 ring-dashed ring-amber-500/85 ring-inset rounded-[30px]' : ''
                }`}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleStartDrag('background', adminConfig.bgPosX ?? 0, adminConfig.bgPosY ?? 0, e.clientX, e.clientY);
                  setNudgeTarget('background');
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setNudgeTarget('background');
                }}
              />

              {/* Interactive Corner Resize Handles for Background when active */}
              {nudgeTarget === 'background' && (
                <div className="absolute inset-0 pointer-events-none z-10 rounded-[30px] overflow-hidden">
                  <div 
                    onMouseDown={(e) => handleStartResize('background', 'tl', e)}
                    className="absolute top-4 left-4 w-4 h-4 bg-amber-500 border border-black rounded-full pointer-events-auto cursor-nwse-resize hover:scale-125 transition z-50 shadow-md flex items-center justify-center animate-pulse"
                    title="Zoom da Imagem (Arrastar)"
                  />
                  <div 
                    onMouseDown={(e) => handleStartResize('background', 'tr', e)}
                    className="absolute top-4 right-4 w-4 h-4 bg-amber-500 border border-black rounded-full pointer-events-auto cursor-nesw-resize hover:scale-125 transition z-50 shadow-md flex items-center justify-center animate-pulse"
                    title="Zoom da Imagem (Arrastar)"
                  />
                  <div 
                    onMouseDown={(e) => handleStartResize('background', 'bl', e)}
                    className="absolute bottom-4 left-4 w-4 h-4 bg-amber-500 border border-black rounded-full pointer-events-auto cursor-nesw-resize hover:scale-125 transition z-50 shadow-md flex items-center justify-center animate-pulse"
                    title="Zoom da Imagem (Arrastar)"
                  />
                  <div 
                    onMouseDown={(e) => handleStartResize('background', 'br', e)}
                    className="absolute bottom-4 right-4 w-4 h-4 bg-amber-500 border border-black rounded-full pointer-events-auto cursor-nwse-resize hover:scale-125 transition z-50 shadow-md flex items-center justify-center animate-pulse"
                    title="Zoom da Imagem (Arrastar)"
                  />
                </div>
              )}

              {/* Draggable Slot Frame */}
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleStartDrag('slot', adminConfig.slotLeft ?? 4, adminConfig.slotTop ?? 28, e.clientX, e.clientY);
                  setNudgeTarget('slot');
                }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  top: `${adminConfig.slotTop ?? 28}%`,
                  left: `${adminConfig.slotLeft ?? 4}%`,
                  width: `${adminConfig.slotWidth ?? 92}%`,
                  height: `${adminConfig.slotHeight ?? 38}%`,
                  borderColor: adminConfig.slotHideOuterFrame ? 'transparent' : '#ffb700',
                  borderWidth: adminConfig.slotHideOuterFrame ? '0px' : '4px',
                  backgroundColor: adminConfig.slotHideOuterFrame ? 'transparent' : 'rgba(0,0,0,0.65)',
                  boxShadow: adminConfig.slotHideOuterFrame ? 'none' : '0 10px 35px rgba(0,0,0,0.8)',
                }}
                className={`absolute cursor-move z-20 flex items-center justify-center rounded-2xl transition-all p-1 border-solid ${
                  nudgeTarget === 'slot' ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-black' : ''
                }`}
              >
                <div className="w-full h-full pointer-events-none overflow-hidden rounded-xl">
                  <SlotMachine 
                    isSpinning={gameState.isSpinning} 
                    grid={previewGrid} 
                    customSymbols={adminConfig.customSymbols}
                    customSymbolConfigs={adminConfig.customSymbolConfigs}
                    slotHideGrid={adminConfig.slotHideGrid}
                    cashAnticipationColor={adminConfig.cashAnticipationColor ?? 'gold'}
                    spinRollStyle={adminConfig.spinRollStyle ?? 'standard'}
                  />
                </div>

                {/* 4 Corner handles for Slot Resizing */}
                {nudgeTarget === 'slot' && (
                  <div className="absolute -inset-3 border-2 border-dashed border-yellow-400 pointer-events-none rounded-2xl z-40">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNudgeTarget(null);
                      }}
                      className="absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-5 bg-red-600 hover:bg-red-500 border border-black rounded-full pointer-events-auto flex items-center justify-center text-[10px] text-white font-black hover:scale-125 transition shadow-lg z-50 cursor-pointer animate-bounce"
                      title="Desmarcar Moldura"
                    >
                      ×
                    </button>
                    <div 
                      onMouseDown={(e) => handleStartResize('slot', 'tl', e)}
                      className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-yellow-400 border-2 border-black rounded-full pointer-events-auto cursor-nwse-resize hover:scale-125 transition z-50 shadow-md flex items-center justify-center animate-pulse"
                      title="Arrastar para Redimensionar"
                    />
                    <div 
                      onMouseDown={(e) => handleStartResize('slot', 'tr', e)}
                      className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-yellow-400 border-2 border-black rounded-full pointer-events-auto cursor-nesw-resize hover:scale-125 transition z-50 shadow-md flex items-center justify-center animate-pulse"
                      title="Arrastar para Redimensionar"
                    />
                    <div 
                      onMouseDown={(e) => handleStartResize('slot', 'bl', e)}
                      className="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-yellow-400 border-2 border-black rounded-full pointer-events-auto cursor-nesw-resize hover:scale-125 transition z-50 shadow-md flex items-center justify-center animate-pulse"
                      title="Arrastar para Redimensionar"
                    />
                    <div 
                      onMouseDown={(e) => handleStartResize('slot', 'br', e)}
                      className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-yellow-400 border-2 border-black rounded-full pointer-events-auto cursor-nwse-resize hover:scale-125 transition z-50 shadow-md flex items-center justify-center animate-pulse"
                      title="Arrastar para Redimensionar"
                    />
                  </div>
                )}
              </div>

              {/* Floating Buy Bonus Option */}
              {adminConfig.enableBuyBonus !== false && (
                <div
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleStartDrag('buyBonus', adminConfig.buyBonusPosX ?? 50, adminConfig.buyBonusPosY ?? 71, e.clientX, e.clientY);
                    setNudgeTarget('buyBonus');
                  }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: `${adminConfig.buyBonusPosY ?? 71}%`,
                    left: `${adminConfig.buyBonusPosX ?? 50}%`,
                    transform: `translate(-50%, -50%) scale(${(adminConfig.buyBonusScale ?? 100) / 100})`,
                  }}
                  className={`z-30 px-3.5 py-1.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-black font-black text-[10px] rounded-full shadow-[0_4px_15px_rgba(245,158,11,0.4)] border border-yellow-300 uppercase tracking-wider flex items-center gap-1 cursor-move select-none transition-all ${
                    nudgeTarget === 'buyBonus' ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-black' : ''
                  }`}
                >
                  <span>
                    {(adminConfig.buyBonusLabel ?? "⭐ Comprar Bônus (x{multiplier})").replace('{multiplier}', String(adminConfig.buyBonusMultiplier ?? 50))}
                  </span>

                  {/* Handles & Close for Buy Bonus Selection */}
                  {nudgeTarget === 'buyBonus' && (
                    <div className="absolute -inset-2 border border-dashed border-yellow-400 pointer-events-none rounded-full z-40">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNudgeTarget(null);
                        }}
                        className="absolute -top-5 left-1/2 -translate-x-1/2 w-4.5 h-4.5 bg-red-600 hover:bg-red-500 border border-black rounded-full pointer-events-auto flex items-center justify-center text-[8px] text-white font-black hover:scale-125 transition shadow-lg z-50 cursor-pointer"
                        title="Desmarcar Botão de Bônus"
                      >
                        ×
                      </button>
                      <div 
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleStartResize('buyBonus', 'tr', e);
                        }}
                        className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-400 border border-black rounded-full pointer-events-auto cursor-nesw-resize hover:scale-125 transition z-50 shadow-md flex items-center justify-center"
                        title="Arrastar para Redimensionar"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Draggable Spin Button Cluster */}
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleStartDrag('spin', adminConfig.spinLeft ?? 50, 100 - (adminConfig.spinBottom ?? 4), e.clientX, e.clientY);
                  setNudgeTarget('spin');
                }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  bottom: `${adminConfig.spinBottom ?? 4}%`,
                  left: `${adminConfig.spinLeft ?? 50}%`,
                  transform: `translateX(-50%) scale(${(adminConfig.spinScale ?? 100) / 100})`,
                }}
                className={`absolute z-30 cursor-move flex items-center justify-center gap-2 transition-all duration-100 select-none ${
                  nudgeTarget === 'spin' ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-black rounded-full p-1' : ''
                }`}
              >
                <div className="w-9 h-9 rounded-full border border-white/10 bg-black/60 text-gray-400 flex flex-col items-center justify-center shadow-md">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[7px] font-black uppercase leading-none mt-0.5">Turbo</span>
                </div>

                <SpinButton 
                  onSpin={onSpin} 
                  isSpinning={gameState.isSpinning}
                  label={adminConfig.spinButtonLabel || 'GIRAR'}
                  color={adminConfig.spinButtonColor || 'gold'}
                />

                <div className="w-9 h-9 rounded-full border border-white/10 bg-black/60 text-gray-400 flex flex-col items-center justify-center shadow-md">
                  <Play className="w-3.5 h-3.5 fill-current text-gray-400" />
                  <span className="text-[7px] font-black uppercase leading-none mt-0.5">Auto</span>
                </div>

                {/* Corner Resizing Handles */}
                {nudgeTarget === 'spin' && (
                  <div className="absolute -inset-3 border-2 border-dashed border-yellow-400 pointer-events-none rounded-lg z-40">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNudgeTarget(null);
                      }}
                      className="absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-5 bg-red-600 hover:bg-red-500 border border-black rounded-full pointer-events-auto flex items-center justify-center text-[10px] text-white font-black hover:scale-125 transition shadow-lg z-50 cursor-pointer animate-bounce"
                      title="Desmarcar Botão"
                    >
                      ×
                    </button>
                    <div 
                      onMouseDown={(e) => handleStartResize('spin', 'tl', e)}
                      className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-yellow-400 border-2 border-black rounded-full pointer-events-auto cursor-nwse-resize hover:scale-125 transition z-50 shadow-md flex items-center justify-center animate-pulse"
                      title="Arrastar para Redimensionar"
                    />
                    <div 
                      onMouseDown={(e) => handleStartResize('spin', 'tr', e)}
                      className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-yellow-400 border-2 border-black rounded-full pointer-events-auto cursor-nesw-resize hover:scale-125 transition z-50 shadow-md flex items-center justify-center animate-pulse"
                      title="Arrastar para Redimensionar"
                    />
                    <div 
                      onMouseDown={(e) => handleStartResize('spin', 'bl', e)}
                      className="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-yellow-400 border-2 border-black rounded-full pointer-events-auto cursor-nesw-resize hover:scale-125 transition z-50 shadow-md flex items-center justify-center animate-pulse"
                      title="Arrastar para Redimensionar"
                    />
                    <div 
                      onMouseDown={(e) => handleStartResize('spin', 'br', e)}
                      className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-yellow-400 border-2 border-black rounded-full pointer-events-auto cursor-nwse-resize hover:scale-125 transition z-50 shadow-md flex items-center justify-center animate-pulse"
                      title="Arrastar para Redimensionar"
                    />
                  </div>
                )}
              </div>

              {/* Draggable Custom Buttons */}
              {(adminConfig.customButtons || []).map((btn) => (
                <div
                  key={btn.id}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleStartDrag(`button-${btn.id}`, btn.posX, btn.posY, e.clientX, e.clientY);
                    setNudgeTarget(`button-${btn.id}` as any);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: `${btn.posY}%`,
                    left: `${btn.posX}%`,
                    transform: `translate(-50%, -50%) scale(${btn.scale / 100})`,
                  }}
                  className={`z-30 cursor-move whitespace-nowrap select-none ${getCustomButtonStyles(btn)}`}
                >
                  {btn.imageUrl && (
                    <img src={btn.imageUrl} alt={btn.label} className="w-4 h-4 object-contain rounded" />
                  )}
                  <span>{btn.label}</span>

                  {/* Resizing handles */}
                  {nudgeTarget === `button-${btn.id}` && (
                    <div className="absolute -inset-3 border-2 border-dashed border-yellow-400 pointer-events-none rounded-lg z-40">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNudgeTarget(null);
                        }}
                        className="absolute -top-6 left-1/2 -translate-x-1/2 w-4.5 h-4.5 bg-red-600 hover:bg-red-500 border border-black rounded-full pointer-events-auto flex items-center justify-center text-[9px] text-white font-black hover:scale-125 transition shadow-lg z-50 cursor-pointer"
                        title="Desmarcar Botão"
                      >
                        ×
                      </button>
                      <div 
                        onMouseDown={(e) => handleStartResize(`button-${btn.id}`, 'tl', e)}
                        className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-yellow-400 border-2 border-black rounded-full pointer-events-auto cursor-nwse-resize hover:scale-125 transition z-50 shadow-md flex items-center justify-center animate-pulse"
                        title="Arrastar para Redimensionar"
                      />
                      <div 
                        onMouseDown={(e) => handleStartResize(`button-${btn.id}`, 'tr', e)}
                        className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-yellow-400 border-2 border-black rounded-full pointer-events-auto cursor-nesw-resize hover:scale-125 transition z-50 shadow-md flex items-center justify-center animate-pulse"
                        title="Arrastar para Redimensionar"
                      />
                      <div 
                        onMouseDown={(e) => handleStartResize(`button-${btn.id}`, 'bl', e)}
                        className="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-yellow-400 border-2 border-black rounded-full pointer-events-auto cursor-nesw-resize hover:scale-125 transition z-50 shadow-md flex items-center justify-center animate-pulse"
                        title="Arrastar para Redimensionar"
                      />
                      <div 
                        onMouseDown={(e) => handleStartResize(`button-${btn.id}`, 'br', e)}
                        className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-yellow-400 border-2 border-black rounded-full pointer-events-auto cursor-nwse-resize hover:scale-125 transition z-50 shadow-md flex items-center justify-center animate-pulse"
                        title="Arrastar para Redimensionar"
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* Draggable Custom Texts */}
              {(adminConfig.customTexts || []).map((txt) => (
                <div
                  key={txt.id}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleStartDrag(`text-${txt.id}`, txt.posX, txt.posY, e.clientX, e.clientY);
                    setNudgeTarget(`text-${txt.id}` as any);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: `${txt.posY}%`,
                    left: `${txt.posX}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: `${txt.fontSize}px`,
                    color: txt.color,
                  }}
                  className="z-30 cursor-move font-black tracking-wider uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] px-1 relative"
                >
                  {txt.text}

                  {/* Resizing handles */}
                  {nudgeTarget === `text-${txt.id}` && (
                    <div className="absolute -inset-3 border-2 border-dashed border-yellow-400 pointer-events-none rounded-lg z-40">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNudgeTarget(null);
                        }}
                        className="absolute -top-6 left-1/2 -translate-x-1/2 w-4.5 h-4.5 bg-red-600 hover:bg-red-500 border border-black rounded-full pointer-events-auto flex items-center justify-center text-[9px] text-white font-black hover:scale-125 transition shadow-lg z-50 cursor-pointer"
                        title="Desmarcar Texto"
                      >
                        ×
                      </button>
                      <div 
                        onMouseDown={(e) => handleStartResize(`text-${txt.id}`, 'tl', e)}
                        className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-yellow-400 border-2 border-black rounded-full pointer-events-auto cursor-nwse-resize hover:scale-125 transition z-50 shadow-md flex items-center justify-center animate-pulse"
                        title="Arrastar para Redimensionar"
                      />
                      <div 
                        onMouseDown={(e) => handleStartResize(`text-${txt.id}`, 'tr', e)}
                        className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-yellow-400 border-2 border-black rounded-full pointer-events-auto cursor-nesw-resize hover:scale-125 transition z-50 shadow-md flex items-center justify-center animate-pulse"
                        title="Arrastar para Redimensionar"
                      />
                      <div 
                        onMouseDown={(e) => handleStartResize(`text-${txt.id}`, 'bl', e)}
                        className="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-yellow-400 border-2 border-black rounded-full pointer-events-auto cursor-nesw-resize hover:scale-125 transition z-50 shadow-md flex items-center justify-center animate-pulse"
                        title="Arrastar para Redimensionar"
                      />
                      <div 
                        onMouseDown={(e) => handleStartResize(`text-${txt.id}`, 'br', e)}
                        className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-yellow-400 border-2 border-black rounded-full pointer-events-auto cursor-nwse-resize hover:scale-125 transition z-50 shadow-md flex items-center justify-center animate-pulse"
                        title="Arrastar para Redimensionar"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pixel Precision Control Panel (Painel de Ajuste Fino por Pixels) */}
          <div className="w-full max-w-[440px] bg-black/90 backdrop-blur-md border border-amber-500/40 rounded-2xl p-2.5 mt-3 shadow-xl z-30 space-y-2 select-none">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Crosshair className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] font-black uppercase text-amber-300 tracking-wider">
                  Controle de Precisão Pixel a Pixel
                </span>
              </div>

              {/* Step selector */}
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-gray-400 font-bold uppercase">Passo:</span>
                {[1, 5, 10].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setNudgeStep(step)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-black transition cursor-pointer ${
                      nudgeStep === step ? 'bg-amber-400 text-black font-bold' : 'bg-neutral-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {step}px
                  </button>
                ))}
              </div>
            </div>

            {/* Target Element Selector */}
            <div className="grid grid-cols-5 gap-1">
              {[
                { id: 'phone', label: '📱 Celular', valX: adminConfig.phonePosX ?? 0, valY: adminConfig.phonePosY ?? 0, unit: 'px' },
                { id: 'background', label: '🖼️ Imagem', valX: adminConfig.bgPosX ?? 0, valY: adminConfig.bgPosY ?? 0, unit: '%' },
                { id: 'toolbar', label: '🎯 Ferramenta', valX: adminConfig.toolbarPosX ?? 0, valY: adminConfig.toolbarPosY ?? 0, unit: 'px' },
                { id: 'slot', label: '🎰 Slot', valX: adminConfig.slotLeft ?? 4, valY: adminConfig.slotTop ?? 28, unit: '%' },
                { id: 'spin', label: '🔘 Girar', valX: adminConfig.spinLeft ?? 50, valY: adminConfig.spinBottom ?? 4, unit: '%' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setNudgeTarget(t.id as any)}
                  className={`p-1.5 rounded-lg text-center transition cursor-pointer border ${
                    nudgeTarget === t.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-black shadow-md'
                      : 'bg-neutral-900/90 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="text-[10px] font-bold leading-tight">{t.label}</div>
                  <div className="text-[8px] font-mono opacity-80 mt-0.5">
                    X:{t.valX}{t.unit} Y:{t.valY}{t.unit}
                  </div>
                </button>
              ))}
            </div>

            {/* Arrow Nudge Pad & Numerical Controls */}
            <div className="flex items-center justify-between gap-3 bg-black/60 p-2 rounded-xl border border-white/10">
              <div className="text-[10px] text-gray-300">
                <span className="font-bold text-amber-300 uppercase block">Ajuste Direcional:</span>
                <span className="text-[9px] text-gray-400">Mover {nudgeTarget} em {nudgeStep}px</span>
              </div>

              {/* 4-Way Arrow Pad */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  title={`Mover p/ Esquerda (${nudgeStep}px)`}
                  onClick={() => handleNudge(-1, 0)}
                  className="p-2 bg-neutral-800 hover:bg-amber-500 hover:text-black text-gray-200 rounded-lg border border-white/10 transition cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>

                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    title={`Mover p/ Cima (${nudgeStep}px)`}
                    onClick={() => handleNudge(0, -1)}
                    className="p-2 bg-neutral-800 hover:bg-amber-500 hover:text-black text-gray-200 rounded-lg border border-white/10 transition cursor-pointer active:scale-95"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title={`Mover p/ Baixo (${nudgeStep}px)`}
                    onClick={() => handleNudge(0, 1)}
                    className="p-2 bg-neutral-800 hover:bg-amber-500 hover:text-black text-gray-200 rounded-lg border border-white/10 transition cursor-pointer active:scale-95"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  title={`Mover p/ Direita (${nudgeStep}px)`}
                  onClick={() => handleNudge(1, 0)}
                  className="p-2 bg-neutral-800 hover:bg-amber-500 hover:text-black text-gray-200 rounded-lg border border-white/10 transition cursor-pointer active:scale-95"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Reset Selected Element Position */}
                <button
                  type="button"
                  title="Resetar Posições do Estúdio"
                  onClick={() => {
                    onUpdateAdminConfig({
                      phonePosX: 0,
                      phonePosY: 0,
                      toolbarPosX: 0,
                      toolbarPosY: 0,
                      slotLeft: 4,
                      slotTop: 28,
                      spinLeft: 50,
                      spinBottom: 4
                    });
                  }}
                  className="p-2 ml-1 bg-red-950/80 hover:bg-red-600 text-red-300 hover:text-white rounded-lg border border-red-500/30 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Floating Focus Mode Control Toggle on Canvas */}
          <button
            type="button"
            onClick={() => setIsFocusMode(!isFocusMode)}
            className="absolute bottom-4 right-4 z-40 bg-black/85 backdrop-blur-md border border-white/10 hover:border-amber-500/50 text-xs text-gray-300 hover:text-white px-3 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
          >
            <div className={`w-2 h-2 rounded-full ${isFocusMode ? 'bg-amber-400 animate-pulse' : 'bg-gray-500'}`} />
            <span>{isFocusMode ? "Sair da Tela Cheia" : "Modo Foco / Tela Cheia"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

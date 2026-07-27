import React, { useState, useRef } from 'react';
import { 
  Shield, X, DollarSign, Activity, Percent, Flame, RefreshCw, Key, 
  AlertTriangle, Image as ImageIcon, Move, LayoutGrid, Upload, Trash2, 
  RotateCcw, Sliders, Eye, Settings, Plus, Grid, Crosshair, Smartphone,
  Monitor, ZoomIn, ZoomOut, Maximize2, Sparkles
} from 'lucide-react';
import { AdminConfig, GameState, SymbolType } from '../types';
import { SlotSymbol } from './SlotSymbol';
import { SlotMachine } from './SlotMachine';
import { BackgroundMedia } from './BackgroundMedia';
import { SlotEngineConfig } from '../slotEngine';
import { SlotEngineEditor } from './SlotEngineEditor';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminConfig: AdminConfig;
  onUpdateAdminConfig: (newConfig: Partial<AdminConfig>) => void;
  gameState: GameState;
  onUpdateBalance: (newBalance: number) => void;
  onResetStats: () => void;
  engineConfig: SlotEngineConfig;
  onUpdateEngineConfig: (newConfig: SlotEngineConfig) => void;
  onOpenCriadorDesigner?: () => void;
}

const SYMBOL_NAMES: { type: SymbolType; label: string }[] = [
  { type: 'Crown', label: 'Coroa Imperial' },
  { type: 'Dragon', label: 'Dragão do Reino' },
  { type: 'King', label: 'Rei Supremo' },
  { type: 'Queen', label: 'Rainha das Armas' },
  { type: 'Lion', label: 'Leão Guardião' },
  { type: 'Castle', label: 'Castelo Fortificado' },
  { type: 'Sword', label: 'Espada Mágica' },
  { type: 'Shield', label: 'Escudo Real' },
  { type: 'Diamond', label: 'Diamante Ancentral' },
  { type: 'Coin', label: 'Moeda de Ouro' },
];

// Helper Component for Ultra High-Precision Numeric & Step Adjustment on PC & Mobile
const PrecisionControl: React.FC<{
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  colorClass?: string;
}> = ({ label, value, onChange, min = -100, max = 300, step = 0.5, unit = '%', colorClass = 'text-yellow-300' }) => {
  const handleStep = (delta: number) => {
    const newVal = Math.min(max, Math.max(min, Math.round((value + delta) * 10) / 10));
    onChange(newVal);
  };

  return (
    <div className="space-y-1.5 bg-black/50 p-2 sm:p-2.5 rounded-xl border border-white/10 hover:border-red-500/30 transition-all shadow-inner">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-gray-200 font-extrabold uppercase tracking-wider flex items-center gap-1">
          {label}
        </span>
        <div className="flex items-center gap-1 font-mono font-bold">
          <input
            type="number"
            step="0.1"
            min={min}
            max={max}
            value={value}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value);
              if (!isNaN(parsed)) {
                onChange(Math.min(max, Math.max(min, Math.round(parsed * 10) / 10)));
              }
            }}
            className={`w-16 px-1.5 py-0.5 bg-black/90 border border-white/20 rounded text-right text-xs ${colorClass} focus:outline-none focus:border-red-500 font-mono font-bold shadow-sm`}
          />
          <span className="text-gray-400 text-[10px]">{unit}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1 accent-red-500 cursor-pointer h-1.5"
        />
      </div>

      <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleStep(-5)}
            className="px-1.5 py-0.5 bg-white/5 hover:bg-white/20 active:scale-95 text-gray-300 rounded text-[9px] font-mono font-black transition cursor-pointer"
            title="Diminuir 5%"
          >
            -5
          </button>
          <button
            type="button"
            onClick={() => handleStep(-1)}
            className="px-1.5 py-0.5 bg-white/5 hover:bg-white/20 active:scale-95 text-gray-300 rounded text-[9px] font-mono font-black transition cursor-pointer"
            title="Diminuir 1%"
          >
            -1
          </button>
          <button
            type="button"
            onClick={() => handleStep(-0.5)}
            className="px-1.5 py-0.5 bg-red-950/80 hover:bg-red-900 border border-red-500/40 active:scale-95 text-red-300 rounded text-[9px] font-mono font-black transition cursor-pointer"
            title="Diminuir 0.5% (Ajuste Fino)"
          >
            -0.5
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleStep(0.5)}
            className="px-1.5 py-0.5 bg-red-950/80 hover:bg-red-900 border border-red-500/40 active:scale-95 text-red-300 rounded text-[9px] font-mono font-black transition cursor-pointer"
            title="Aumentar 0.5% (Ajuste Fino)"
          >
            +0.5
          </button>
          <button
            type="button"
            onClick={() => handleStep(1)}
            className="px-1.5 py-0.5 bg-white/5 hover:bg-white/20 active:scale-95 text-gray-300 rounded text-[9px] font-mono font-black transition cursor-pointer"
            title="Aumentar 1%"
          >
            +1
          </button>
          <button
            type="button"
            onClick={() => handleStep(5)}
            className="px-1.5 py-0.5 bg-white/5 hover:bg-white/20 active:scale-95 text-gray-300 rounded text-[9px] font-mono font-black transition cursor-pointer"
            title="Aumentar 5%"
          >
            +5
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  adminConfig,
  onUpdateAdminConfig,
  gameState,
  onUpdateBalance,
  onResetStats,
  engineConfig,
  onUpdateEngineConfig,
  onOpenCriadorDesigner,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [pinInput, setPinInput] = useState<string>('');
  const [customBalanceInput, setCustomBalanceInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'metrics' | 'layout' | 'engine'>('metrics');
  const [newPresetInput, setNewPresetInput] = useState<string>('');

  const [openSection, setOpenSection] = useState<'position' | 'ui' | 'bonus' | 'buttons'>('position');
  const [mobileLayoutView, setMobileLayoutView] = useState<'controls' | 'preview'>('controls');

  // Advanced Precision PC Features State
  const [showGridLines, setShowGridLines] = useState<boolean>(true);
  const [dragPrecisionMode, setDragPrecisionMode] = useState<'fine' | 'normal'>('fine');
  const [previewProfile, setPreviewProfile] = useState<'phone' | 'samsung' | 'pc_large' | 'desktop_full'>('pc_large');
  const [workspaceZoom, setWorkspaceZoom] = useState<number>(100);
  
  // Custom button creator state
  const [btnLabel, setBtnLabel] = useState<string>('RODADA BÔNUS');
  const [btnActionType, setBtnActionType] = useState<'add_balance' | 'reset_balance' | 'force_big_win' | 'force_bonus' | 'support_alert' | 'redirect_url'>('force_bonus');
  const [btnActionValue, setBtnActionValue] = useState<string>('');
  const [btnPosX, setBtnPosX] = useState<number>(50);
  const [btnPosY, setBtnPosY] = useState<number>(82);
  const [btnScale, setBtnScale] = useState<number>(100);
  const [btnBgColor, setBtnBgColor] = useState<string>('bg-yellow-500 hover:bg-yellow-400');
  const [btnTextColor, setBtnTextColor] = useState<string>('text-black');

  // Dragging state for layout preview
  const [isDraggingBg, setIsDraggingBg] = useState<boolean>(false);
  const [isDraggingSlot, setIsDraggingSlot] = useState<boolean>(false);
  const [isResizingSlot, setIsResizingSlot] = useState<boolean>(false);
  const [isDraggingSpin, setIsDraggingSpin] = useState<boolean>(false);
  const dragStartRef = useRef<{ 
    x: number; 
    y: number; 
    initialX: number; 
    initialY: number; 
    initialWidth: number; 
    initialHeight: number;
  }>({ x: 0, y: 0, initialX: 0, initialY: 0, initialWidth: 40, initialHeight: 40 });
  const previewCanvasRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '777' || pinInput === '1234' || pinInput === '0000' || pinInput === '') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const calculatedRtp = adminConfig.totalWagered > 0
    ? ((adminConfig.totalPayout / adminConfig.totalWagered) * 100).toFixed(2)
    : '96.50';

  const houseProfit = adminConfig.totalWagered - adminConfig.totalPayout;

  // Background image file upload
  const handleBgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateAdminConfig({ bgImage: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Custom symbol image file upload
  const handleSymbolFileUpload = (type: SymbolType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const url = event.target.result as string;
          const updatedSymbols = { ...adminConfig.customSymbols, [type]: url };
          const updatedConfigs = {
            ...(adminConfig.customSymbolConfigs || {}),
            [type]: {
              url,
              objectFit: 'cover' as const,
              offsetX: 0,
              offsetY: 0,
              scale: 100,
            }
          };
          onUpdateAdminConfig({ customSymbols: updatedSymbols, customSymbolConfigs: updatedConfigs });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Update symbol image config
  const handleUpdateSymbolConfig = (type: SymbolType, updates: Partial<{ objectFit: 'cover' | 'contain'; offsetX: number; offsetY: number; scale: number }>) => {
    const currentConfig = adminConfig.customSymbolConfigs?.[type] || {
      url: adminConfig.customSymbols?.[type] || '',
      objectFit: 'cover',
      offsetX: 0,
      offsetY: 0,
      scale: 100,
    };
    const updatedConfigs = {
      ...(adminConfig.customSymbolConfigs || {}),
      [type]: { ...currentConfig, ...updates }
    };
    onUpdateAdminConfig({ customSymbolConfigs: updatedConfigs });
  };

  // Remove custom symbol
  const handleRemoveSymbol = (type: SymbolType) => {
    const updatedSymbols = { ...adminConfig.customSymbols };
    delete updatedSymbols[type];
    const updatedConfigs = { ...(adminConfig.customSymbolConfigs || {}) };
    delete updatedConfigs[type];
    onUpdateAdminConfig({ customSymbols: updatedSymbols, customSymbolConfigs: updatedConfigs });
  };

  // Reset layout positioning
  const handleResetLayout = () => {
    onUpdateAdminConfig({
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
    });
  };

  // Canvas Mouse Down handlers for free dragging and resizing
  const handleBgMouseDown = (e: React.MouseEvent) => {
    if (isDraggingSlot || isResizingSlot || isDraggingSpin) return;
    setIsDraggingBg(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialX: adminConfig.bgPosX || 0,
      initialY: adminConfig.bgPosY || 0,
      initialWidth: adminConfig.slotWidth ?? 40,
      initialHeight: adminConfig.slotHeight ?? 40,
    };
  };

  const handleSlotMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingSlot(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialX: adminConfig.slotLeft ?? 30,
      initialY: adminConfig.slotTop ?? 32,
      initialWidth: adminConfig.slotWidth ?? 40,
      initialHeight: adminConfig.slotHeight ?? 40,
    };
  };

  const handleSlotResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizingSlot(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialX: adminConfig.slotLeft ?? 30,
      initialY: adminConfig.slotTop ?? 32,
      initialWidth: adminConfig.slotWidth ?? 40,
      initialHeight: adminConfig.slotHeight ?? 40,
    };
  };

  const handleSpinMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingSpin(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialX: adminConfig.spinLeft ?? 50,
      initialY: adminConfig.spinBottom ?? 4,
      initialWidth: 0,
      initialHeight: 0,
    };
  };

  // Canvas Touch Start handlers for mobile support
  const handleBgTouchStart = (e: React.TouchEvent) => {
    if (isDraggingSlot || isResizingSlot || isDraggingSpin) return;
    setIsDraggingBg(true);
    const touch = e.touches[0];
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      initialX: adminConfig.bgPosX || 0,
      initialY: adminConfig.bgPosY || 0,
      initialWidth: adminConfig.slotWidth ?? 40,
      initialHeight: adminConfig.slotHeight ?? 40,
    };
  };

  const handleSlotTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDraggingSlot(true);
    const touch = e.touches[0];
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      initialX: adminConfig.slotLeft ?? 30,
      initialY: adminConfig.slotTop ?? 32,
      initialWidth: adminConfig.slotWidth ?? 40,
      initialHeight: adminConfig.slotHeight ?? 40,
    };
  };

  const handleSlotResizeTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsResizingSlot(true);
    const touch = e.touches[0];
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      initialX: adminConfig.slotLeft ?? 30,
      initialY: adminConfig.slotTop ?? 32,
      initialWidth: adminConfig.slotWidth ?? 40,
      initialHeight: adminConfig.slotHeight ?? 40,
    };
  };

  const handleSpinTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDraggingSpin(true);
    const touch = e.touches[0];
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      initialX: adminConfig.spinLeft ?? 50,
      initialY: adminConfig.spinBottom ?? 4,
      initialWidth: 0,
      initialHeight: 0,
    };
  };

  const roundPrecision = (val: number) => {
    return dragPrecisionMode === 'fine' ? Math.round(val * 10) / 10 : Math.round(val);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!previewCanvasRef.current) return;
    const rect = previewCanvasRef.current.getBoundingClientRect();

    if (isDraggingBg) {
      const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;
      const newX = Math.max(-100, Math.min(100, roundPrecision(dragStartRef.current.initialX + deltaX)));
      const newY = Math.max(-100, Math.min(100, roundPrecision(dragStartRef.current.initialY + deltaY)));
      onUpdateAdminConfig({ bgPosX: newX, bgPosY: newY });
    } else if (isDraggingSlot) {
      const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;
      const newLeft = Math.max(0, Math.min(100 - (adminConfig.slotWidth ?? 40), roundPrecision(dragStartRef.current.initialX + deltaX)));
      const newTop = Math.max(0, Math.min(100 - (adminConfig.slotHeight ?? 40), roundPrecision(dragStartRef.current.initialY + deltaY)));
      onUpdateAdminConfig({ slotLeft: newLeft, slotTop: newTop });
    } else if (isResizingSlot) {
      const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;
      const newWidth = Math.max(15, Math.min(90, roundPrecision(dragStartRef.current.initialWidth + deltaX)));
      const newHeight = Math.max(15, Math.min(90, roundPrecision(dragStartRef.current.initialHeight + deltaY)));
      onUpdateAdminConfig({ slotWidth: newWidth, slotHeight: newHeight });
    } else if (isDraggingSpin) {
      const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
      const deltaY = ((dragStartRef.current.y - e.clientY) / rect.height) * 100; // inverted Y for bottom
      const newLeft = Math.max(10, Math.min(90, roundPrecision(dragStartRef.current.initialX + deltaX)));
      const newBottom = Math.max(0, Math.min(80, roundPrecision(dragStartRef.current.initialY + deltaY)));
      onUpdateAdminConfig({ spinLeft: newLeft, spinBottom: newBottom });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!previewCanvasRef.current) return;
    const rect = previewCanvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];

    if (isDraggingBg || isDraggingSlot || isResizingSlot || isDraggingSpin) {
      if (e.cancelable) {
        e.preventDefault();
      }
    }

    if (isDraggingBg) {
      const deltaX = ((touch.clientX - dragStartRef.current.x) / rect.width) * 100;
      const deltaY = ((touch.clientY - dragStartRef.current.y) / rect.height) * 100;
      const newX = Math.max(-100, Math.min(100, roundPrecision(dragStartRef.current.initialX + deltaX)));
      const newY = Math.max(-100, Math.min(100, roundPrecision(dragStartRef.current.initialY + deltaY)));
      onUpdateAdminConfig({ bgPosX: newX, bgPosY: newY });
    } else if (isDraggingSlot) {
      const deltaX = ((touch.clientX - dragStartRef.current.x) / rect.width) * 100;
      const deltaY = ((touch.clientY - dragStartRef.current.y) / rect.height) * 100;
      const newLeft = Math.max(0, Math.min(100 - (adminConfig.slotWidth ?? 40), roundPrecision(dragStartRef.current.initialX + deltaX)));
      const newTop = Math.max(0, Math.min(100 - (adminConfig.slotHeight ?? 40), roundPrecision(dragStartRef.current.initialY + deltaY)));
      onUpdateAdminConfig({ slotLeft: newLeft, slotTop: newTop });
    } else if (isResizingSlot) {
      const deltaX = ((touch.clientX - dragStartRef.current.x) / rect.width) * 100;
      const deltaY = ((touch.clientY - dragStartRef.current.y) / rect.height) * 100;
      const newWidth = Math.max(15, Math.min(90, roundPrecision(dragStartRef.current.initialWidth + deltaX)));
      const newHeight = Math.max(15, Math.min(90, roundPrecision(dragStartRef.current.initialHeight + deltaY)));
      onUpdateAdminConfig({ slotWidth: newWidth, slotHeight: newHeight });
    } else if (isDraggingSpin) {
      const deltaX = ((touch.clientX - dragStartRef.current.x) / rect.width) * 100;
      const deltaY = ((dragStartRef.current.y - touch.clientY) / rect.height) * 100; // inverted Y for bottom
      const newLeft = Math.max(10, Math.min(90, roundPrecision(dragStartRef.current.initialX + deltaX)));
      const newBottom = Math.max(0, Math.min(80, roundPrecision(dragStartRef.current.initialY + deltaY)));
      onUpdateAdminConfig({ spinLeft: newLeft, spinBottom: newBottom });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingBg(false);
    setIsDraggingSlot(false);
    setIsResizingSlot(false);
    setIsDraggingSpin(false);
  };

  const handleTouchEnd = () => {
    setIsDraggingBg(false);
    setIsDraggingSlot(false);
    setIsResizingSlot(false);
    setIsDraggingSpin(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full transition-all duration-300 ${isAuthenticated && (activeTab === 'layout' || activeTab === 'engine') ? 'max-w-6xl h-[95vh] max-h-[95vh]' : 'max-w-3xl max-h-[92vh]'} bg-gradient-to-b from-[#1a0505] via-[#0f0a14] to-[#050914] border-2 border-red-600/60 rounded-2xl shadow-[0_0_60px_rgba(220,38,38,0.3)] flex flex-col overflow-hidden text-white`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-red-900/40 bg-red-950/40">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            <span className="text-sm sm:text-base font-black text-red-100 tracking-wider uppercase">
              Painel Administrativo OddsBet
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 font-mono">
              v2.5 Custom Engine
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCriadorDesigner && (
              <button
                type="button"
                onClick={onOpenCriadorDesigner}
                className="px-3 py-1 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 text-black font-black text-xs rounded-lg shadow-md hover:scale-105 transition flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
              >
                <Sparkles className="w-3.5 h-3.5 fill-black" />
                <span>Estúdio Criador Designer</span>
              </button>
            )}

            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg bg-black/50 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isAuthenticated ? (
          /* PIN LOGIN LOCK SCREEN */
          <div className="p-8 flex flex-col items-center justify-center space-y-4 text-center">
            <Key className="w-12 h-12 text-red-500" />
            <h3 className="text-lg font-bold text-red-200">Acesso Restrito ao Operador</h3>
            <p className="text-xs text-gray-400 max-w-sm">
              Digite o PIN de administrador para acessar os controles de RTP, layout do jogo e personalização de imagens (Padrão: 777 ou deixe em branco).
            </p>

            <form onSubmit={handlePinSubmit} className="space-y-3 w-full max-w-xs">
              <input
                type="password"
                placeholder="PIN Administrativo"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full px-4 py-2 bg-black/60 border border-red-800/60 rounded-xl text-center text-lg font-mono text-white focus:outline-none focus:border-red-500"
              />
              {pinError && (
                <div className="text-xs text-red-400 font-semibold">PIN Incorreto. Tente 777</div>
              )}
              <button
                type="submit"
                className="w-full py-2.5 bg-red-700 hover:bg-red-600 rounded-xl font-bold text-sm transition text-white shadow-lg cursor-pointer"
              >
                Desbloquear Painel
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Admin Sub-Tabs */}
            <div className="flex border-b border-red-900/40 bg-black/40 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('metrics')}
                className={`flex-1 min-w-[120px] py-2.5 px-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
                  activeTab === 'metrics'
                    ? 'border-red-500 text-red-400 bg-red-950/20'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Métricas & RTP</span>
              </button>
              
              <button
                onClick={() => setActiveTab('layout')}
                className={`flex-1 min-w-[120px] py-2.5 px-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
                  activeTab === 'layout'
                    ? 'border-red-500 text-red-400 bg-red-950/20'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Layout & Fundo</span>
              </button>

              <button
                onClick={() => setActiveTab('engine')}
                className={`flex-1 min-w-[120px] py-2.5 px-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
                  activeTab === 'engine'
                    ? 'border-red-500 text-red-400 bg-red-950/20'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Motor Matemático</span>
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
              
              {/* TAB 1: METRICS & RTP */}
              {activeTab === 'metrics' && (
                <div className="space-y-5">
                  {/* STATS OVERVIEW CARDS */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-red-300 uppercase tracking-widest flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-red-400" />
                        Métricas da Sessão Ativa
                      </span>
                      <button
                        onClick={onResetStats}
                        className="text-[10px] text-gray-400 hover:text-red-300 flex items-center gap-1 transition cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Resetar Dados
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-3 bg-black/50 border border-red-900/30 rounded-xl">
                        <div className="text-[10px] text-gray-400 font-medium">Total de Giros</div>
                        <div className="text-lg font-black text-white mt-0.5">{adminConfig.totalSpins}</div>
                      </div>

                      <div className="p-3 bg-black/50 border border-red-900/30 rounded-xl">
                        <div className="text-[10px] text-gray-400 font-medium">Volume Apostado</div>
                        <div className="text-base font-black text-yellow-400 mt-0.5">
                          R$ {adminConfig.totalWagered.toFixed(2)}
                        </div>
                      </div>

                      <div className="p-3 bg-black/50 border border-red-900/30 rounded-xl">
                        <div className="text-[10px] text-gray-400 font-medium">RTP Real Calculado</div>
                        <div className="text-base font-black text-emerald-400 mt-0.5">
                          {calculatedRtp}%
                        </div>
                      </div>

                      <div className="p-3 bg-black/50 border border-red-900/30 rounded-xl">
                        <div className="text-[10px] text-gray-400 font-medium">Lucro da Casa (GGR)</div>
                        <div className={`text-base font-black mt-0.5 ${houseProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          R$ {houseProfit.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RTP & VOLATILITY CONTROLS */}
                  <div className="bg-black/40 p-3.5 rounded-xl border border-red-900/40 space-y-4">
                    <span className="text-xs font-bold text-red-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Percent className="w-4 h-4 text-red-400" />
                      Configuração de Retorno (RTP) & Volatilidade
                    </span>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-300 font-semibold">Alvo de RTP Teórico:</span>
                        <span className="text-yellow-400 font-bold">{adminConfig.targetRtp}%</span>
                      </div>
                      <input
                        type="range"
                        min="80"
                        max="99"
                        step="0.5"
                        value={adminConfig.targetRtp}
                        onChange={(e) => onUpdateAdminConfig({ targetRtp: parseFloat(e.target.value) })}
                        className="w-full accent-red-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-xs text-gray-300 font-semibold">Perfil de Volatilidade:</div>
                      <div className="grid grid-cols-3 gap-2">
                        {(['low', 'medium', 'high'] as const).map((vol) => (
                          <button
                            key={vol}
                            onClick={() => onUpdateAdminConfig({ volatility: vol })}
                            className={`py-2 px-3 rounded-lg text-xs font-bold border transition capitalize cursor-pointer ${
                              adminConfig.volatility === vol
                                ? 'bg-red-900/80 border-red-500 text-white shadow-md'
                                : 'bg-black/60 border-white/10 text-gray-400 hover:border-red-500/50'
                            }`}
                          >
                            {vol === 'low' ? 'Baixa' : vol === 'medium' ? 'Média' : 'Alta'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* FORCED OUTCOME */}
                  <div className="bg-black/40 p-3.5 rounded-xl border border-red-900/40 space-y-3">
                    <span className="text-xs font-bold text-red-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-red-400" />
                      Forçar Resultado Próximo Giro (Modo Demonstração)
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                      {[
                        { id: 'none', label: 'RNG Normal' },
                        { id: 'normal_win', label: 'Forçar Vitória' },
                        { id: 'big_win', label: 'Forçar Big Win' },
                        { id: 'full_screen', label: 'Forçar Tela Cheia' },
                        { id: 'loss', label: 'Forçar Derrota' },
                        { id: 'force_cash_collect', label: 'Forçar 5x Dinheiro' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => onUpdateAdminConfig({ forcedOutcome: item.id as any })}
                          className={`py-2 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                            adminConfig.forcedOutcome === item.id
                              ? 'bg-amber-600 border-amber-300 text-black font-extrabold shadow-md'
                              : 'bg-black/60 border-white/10 text-gray-300 hover:border-amber-500/50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PLAYER BALANCE */}
                  <div className="bg-black/40 p-3.5 rounded-xl border border-red-900/40 space-y-3">
                    <span className="text-xs font-bold text-red-300 uppercase tracking-widest flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-red-400" />
                      Gestão de Saldo do Jogador
                    </span>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-300">
                        Saldo Atual: <span className="text-yellow-400 font-bold text-sm">R$ {gameState.balance.toFixed(2)}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onUpdateBalance(gameState.balance + 1000)}
                          className="px-3 py-1.5 bg-green-900/60 border border-green-500/50 rounded-lg text-xs font-bold text-green-300 hover:bg-green-800 transition cursor-pointer"
                        >
                          + R$ 1.000
                        </button>
                        <button
                          onClick={() => onUpdateBalance(gameState.balance + 10000)}
                          className="px-3 py-1.5 bg-green-900/60 border border-green-500/50 rounded-lg text-xs font-bold text-green-300 hover:bg-green-800 transition cursor-pointer"
                        >
                          + R$ 10.000
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <input
                        type="number"
                        placeholder="Definir Saldo exato"
                        value={customBalanceInput}
                        onChange={(e) => setCustomBalanceInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                      />
                      <button
                        onClick={() => {
                          const val = parseFloat(customBalanceInput);
                          if (!isNaN(val) && val >= 0) {
                            onUpdateBalance(val);
                            setCustomBalanceInput('');
                          }
                        }}
                        className="px-4 py-1.5 bg-red-800 hover:bg-red-700 rounded-lg text-xs font-bold transition text-white cursor-pointer"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>

                  {/* BOARD TYPE SELECTOR */}
                  <div className="bg-black/40 p-3.5 rounded-xl border border-red-900/40 space-y-3">
                    <span className="text-xs font-bold text-red-300 uppercase tracking-widest flex items-center gap-1.5">
                      <LayoutGrid className="w-4 h-4 text-red-400" />
                      Tipo de Tabuleiro (Grade do Jogo)
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: '3x1', label: '3x1 (Retrô)', desc: '1 Linha x 3 Rolos' },
                        { id: '3x3', label: '3x3 (Clássico)', desc: '3 Linhas x 3 Rolos' },
                        { id: '5x3', label: '5x3 (Padrão)', desc: '3 Linhas x 5 Rolos' },
                        { id: '5x4', label: '5x4 (Expandido)', desc: '4 Linhas x 5 Rolos' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => onUpdateAdminConfig({ boardType: item.id as any })}
                          className={`py-2 px-2.5 rounded-lg border flex flex-col items-center justify-center gap-0.5 transition cursor-pointer text-center ${
                            (adminConfig.boardType || '5x3') === item.id
                              ? 'bg-red-950 border-red-500 text-red-400 font-extrabold shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                              : 'bg-black/60 border-white/10 text-gray-300 hover:border-red-500/50'
                          }`}
                        >
                          <span className="text-xs font-bold">{item.label}</span>
                          <span className="text-[9px] text-gray-400 font-normal">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CONFIGURAÇÃO DE VALORES DE APOSTA (BET CONFIGURATION) */}
                  <div className="bg-black/40 p-3.5 rounded-xl border border-red-900/40 space-y-4">
                    <span className="text-xs font-bold text-red-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-red-400" />
                      Configurações de Valores de Aposta
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase">Aposta Mínima (R$)</label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={adminConfig.minBet}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val > 0) {
                              onUpdateAdminConfig({ minBet: val });
                            }
                          }}
                          className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase">Aposta Máxima (R$)</label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={adminConfig.maxBet}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val > 0) {
                              onUpdateAdminConfig({ maxBet: val });
                            }
                          }}
                          className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-400 font-bold uppercase block">Opções de Aposta Cadastradas</label>
                      <div className="flex flex-wrap gap-1.5 p-2 bg-black/60 border border-white/10 rounded-lg min-h-[44px]">
                        {(adminConfig.betPresets || [1.00, 2.00, 5.00, 10.00, 20.00, 50.00, 100.00, 200.00, 500.00]).map((preset, idx) => {
                          const isOutOfBounds = preset < adminConfig.minBet || preset > adminConfig.maxBet;
                          return (
                            <div 
                              key={idx} 
                              className={`flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-[11px] font-mono font-bold ${
                                isOutOfBounds 
                                  ? 'bg-red-950/60 border border-red-500/30 text-red-400 line-through' 
                                  : 'bg-red-900/30 border border-red-500/20 text-gray-200'
                              }`}
                              title={isOutOfBounds ? "Fora dos limites de aposta mín/máx" : ""}
                            >
                              <span>R$ {preset.toFixed(2)}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentPresets = adminConfig.betPresets || [1.00, 2.00, 5.00, 10.00, 20.00, 50.00, 100.00, 200.00, 500.00];
                                  const updated = currentPresets.filter((_, i) => i !== idx);
                                  onUpdateAdminConfig({ betPresets: updated });
                                }}
                                className="p-0.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition cursor-pointer flex items-center justify-center"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="Adicionar novo valor (ex: 15.00)"
                          value={newPresetInput}
                          onChange={(e) => setNewPresetInput(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = parseFloat(newPresetInput);
                            if (!isNaN(val) && val > 0) {
                              const currentPresets = adminConfig.betPresets || [1.00, 2.00, 5.00, 10.00, 20.00, 50.00, 100.00, 200.00, 500.00];
                              if (!currentPresets.includes(val)) {
                                const updated = [...currentPresets, val].sort((a, b) => a - b);
                                onUpdateAdminConfig({ betPresets: updated });
                              }
                              setNewPresetInput('');
                            }
                          }}
                          className="px-3.5 py-1.5 bg-red-800 hover:bg-red-700 rounded-lg text-xs font-bold text-white transition flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* VELOCIDADES E TEMPOS DE GIRO */}
                  <div className="bg-black/40 p-3.5 rounded-xl border border-red-900/40 space-y-3">
                    <span className="text-xs font-bold text-red-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-red-400" />
                      Velocidades da Rolagem dos Rolos (Normal & Turbo)
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-300 font-bold">
                          <span>Modo Normal (ms):</span>
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

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-300 font-bold">
                          <span>Modo Turbo (ms):</span>
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

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-300 font-bold">
                          <span>Intervalo Stagger (ms):</span>
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

                  {/* REGRAS DE ATIVAÇÃO DO BÔNUS & CARTAS SCATTER */}
                  <div className="bg-black/40 p-3.5 rounded-xl border border-yellow-500/40 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-yellow-500/20 pb-2">
                      <span className="text-xs font-black text-yellow-300 uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        Regras de Ativação do Bônus & Cartas Scatter (Rodadas Grátis)
                      </span>
                      <span className="text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-2 py-0.5 rounded font-bold uppercase">
                        Garantia Scatter Sem Linha
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-300 leading-relaxed bg-black/50 p-2.5 rounded-lg border border-white/5">
                      💡 <strong className="text-yellow-300">Como Funciona:</strong> Quando a quantidade configurada da <strong className="text-white font-black">Carta Bônus</strong> aparecer em qualquer posição do tabuleiro durante a mesma rodada (sem necessidade de formar linha de pagamento), o jogo ativa as <strong className="text-emerald-400 font-black">Rodadas Grátis</strong> instantaneamente!
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* CARTA BÔNUS ESCOLHIDA */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-300 font-bold block uppercase">
                          Qual é a Carta Bônus (Scatter Trigger):
                        </label>
                        <select
                          value={adminConfig.bonusTriggerSymbolId || 'crown'}
                          onChange={(e) => onUpdateAdminConfig({ bonusTriggerSymbolId: e.target.value })}
                          className="w-full px-3 py-1.5 bg-black/80 border border-yellow-500/40 rounded-lg text-xs text-yellow-300 font-bold focus:outline-none focus:border-yellow-400 cursor-pointer"
                        >
                          {(engineConfig.symbols || []).map((sym) => (
                            <option key={sym.id} value={sym.id}>
                              {sym.image} {sym.name} ({sym.id})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* QUANTIDADE MÍNIMA DE CARTAS */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-300 font-bold block uppercase">
                          Qtd Mínima de Cartas no Tabuleiro para Liberar Bônus:
                        </label>
                        <select
                          value={adminConfig.bonusMinCardsCount ?? 3}
                          onChange={(e) => onUpdateAdminConfig({ bonusMinCardsCount: parseInt(e.target.value) })}
                          className="w-full px-3 py-1.5 bg-black/80 border border-yellow-500/40 rounded-lg text-xs text-amber-300 font-bold focus:outline-none focus:border-yellow-400 cursor-pointer"
                        >
                          <option value={2}>2 Cartas Bônus no Tabuleiro</option>
                          <option value={3}>3 Cartas Bônus no Tabuleiro (Padrão)</option>
                          <option value={4}>4 Cartas Bônus no Tabuleiro</option>
                          <option value={5}>5 Cartas Bônus no Tabuleiro</option>
                        </select>
                      </div>

                      {/* QUANTIDADE DE RODADAS GRÁTIS */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-300 font-bold block uppercase">
                          Quantidade de Rodadas Grátis Concedidas:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={adminConfig.bonusFreeSpinsCount ?? 10}
                            onChange={(e) => onUpdateAdminConfig({ bonusFreeSpinsCount: parseInt(e.target.value) || 10 })}
                            className="w-full px-3 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-emerald-300 font-mono font-extrabold focus:outline-none focus:border-emerald-400"
                          />
                          <span className="text-xs text-gray-400 font-bold whitespace-nowrap">Rodadas</span>
                        </div>
                      </div>

                      {/* MULTIPLICADOR DE IMPULSO DURANTE O BÔNUS */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-300 font-bold block uppercase">
                          Multiplicador dos Ganhos no Bônus:
                        </label>
                        <div className="flex items-center gap-2">
                          <select
                            value={adminConfig.bonusMultiplierBoost ?? 2}
                            onChange={(e) => onUpdateAdminConfig({ bonusMultiplierBoost: parseFloat(e.target.value) })}
                            className="w-full px-3 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-yellow-300 font-bold focus:outline-none cursor-pointer"
                          >
                            <option value={1}>1x (Sem multiplicador extra)</option>
                            <option value={2}>2x (Prêmios dobrados!)</option>
                            <option value={3}>3x (Prêmios triplicados!)</option>
                            <option value={5}>5x (Prêmios x5!)</option>
                            <option value={10}>10x (Prêmios x10 Super Bônus!)</option>
                          </select>
                        </div>
                      </div>

                      {/* PRÊMIO INSTANTÂNEO NA ATIVAÇÃO */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-300 font-bold block uppercase">
                          Prêmio Instantâneo Pago na Ativação (x Aposta):
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={adminConfig.bonusInstantPayMultiplier ?? 5}
                          onChange={(e) => onUpdateAdminConfig({ bonusInstantPayMultiplier: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-amber-300 font-mono font-bold focus:outline-none"
                        />
                      </div>

                      {/* PREÇO DA COMPRA DE BÔNUS */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-300 font-bold block uppercase">
                          Preço da Compra de Bônus (x Aposta):
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="500"
                          value={adminConfig.buyBonusMultiplier ?? 50}
                          onChange={(e) => onUpdateAdminConfig({ buyBonusMultiplier: parseFloat(e.target.value) || 50 })}
                          className="w-full px-3 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-yellow-300 font-mono font-bold focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* BOTÃO TESTAR FORÇAR BÔNUS */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[11px] text-gray-300 font-bold">
                        Forçar Bônus no Próximo Giro:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateAdminConfig({ forcedOutcome: 'bonus' as any });
                          alert(`🎯 Próximo giro configurado para soltar ${adminConfig.bonusMinCardsCount ?? 3} Cartas Bônus e ativar as Rodadas Grátis!`);
                        }}
                        className="px-4 py-1.5 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-black text-xs uppercase tracking-wider rounded-lg shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 fill-black" />
                        <span>Soltar Bônus no Próximo Giro</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LAYOUT & BACKGROUND CUSTOMIZATION */}
              {activeTab === 'layout' && (
                <div className="flex flex-col h-full min-h-0">
                  {/* Mobile-only toggle sub-tabs */}
                  <div className="flex lg:hidden bg-black/60 p-1 rounded-xl border border-white/5 gap-1 select-none mb-3">
                    <button
                      type="button"
                      onClick={() => setMobileLayoutView('controls')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-black uppercase transition cursor-pointer text-center ${
                        mobileLayoutView === 'controls'
                          ? 'bg-red-800 text-white shadow'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      ⚙️ Ajustes & Controles
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileLayoutView('preview')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-black uppercase transition cursor-pointer text-center ${
                        mobileLayoutView === 'preview'
                          ? 'bg-red-800 text-white shadow'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      📱 Simulador (9:16)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch h-full min-h-0">
                    {/* Left Column: Sliders & Controls */}
                    <div className={`${mobileLayoutView === 'controls' ? 'flex' : 'hidden lg:flex'} lg:col-span-5 flex-col justify-between space-y-4 pr-1 overflow-y-auto max-h-[60vh] lg:max-h-[72vh] no-scrollbar`}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-bold text-red-300 uppercase tracking-widest flex items-center gap-1.5">
                            <Move className="w-4 h-4 text-red-400" />
                            Painel de Posicionamento
                          </h3>
                          <p className="text-[10px] text-gray-400">Ajustes manuais e upload de mídias de fundo.</p>
                        </div>
                        <button
                          onClick={handleResetLayout}
                          className="px-2 py-1 bg-black/60 border border-red-800/40 hover:bg-red-950/60 rounded-lg text-[10px] font-bold text-gray-300 flex items-center gap-1 transition cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3 text-red-400" />
                          <span>Resetar</span>
                        </button>
                      </div>

                      {/* BACKGROUND UPLOADER / URL INPUT */}
                      <div className="bg-black/40 p-3 rounded-xl border border-red-900/40 space-y-2.5">
                        <span className="text-[10px] font-bold text-gray-300 uppercase block tracking-wider">Mídia de Fundo</span>
                        <div>
                          <label className="flex items-center justify-center gap-2 p-2 bg-black/60 border border-dashed border-red-700/50 hover:border-red-500 rounded-lg cursor-pointer text-xs font-bold text-red-300 transition w-full">
                            <Upload className="w-4 h-4 text-red-400" />
                            <span>Selecionar Fundo (MP4/Imagem)</span>
                            <input
                              type="file"
                              accept="image/*,video/*,video/mp4,video/webm,video/ogg"
                              onChange={handleBgFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400 block font-bold uppercase">ou URL direta:</label>
                          <input
                            type="text"
                            placeholder="https://exemplo.com/fundo.mp4"
                            value={adminConfig.bgImage}
                            onChange={(e) => onUpdateAdminConfig({ bgImage: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                          />
                        </div>

                        {/* Tipo de Mídia Selector */}
                        <div className="space-y-1 pt-2 border-t border-white/5">
                          <label className="text-[9px] text-gray-400 block font-bold uppercase">Tipo de Mídia do Fundo:</label>
                          <div className="grid grid-cols-3 gap-1 bg-black/60 p-1 rounded-lg border border-white/5">
                            {(['auto', 'image', 'video'] as const).map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => onUpdateAdminConfig({ bgMediaType: type })}
                                className={`py-1 text-[9px] font-bold uppercase rounded transition cursor-pointer text-center ${
                                  (adminConfig.bgMediaType || 'auto') === type
                                    ? 'bg-amber-500 text-black shadow'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                              >
                                {type === 'auto' ? '🔍 Auto' : type === 'image' ? '🖼️ Imagem' : '🎥 Vídeo'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* SUB-SECTIONS ACCORDION NAV BUTTONS */}
                      <div className="flex bg-black/60 p-1 rounded-xl border border-white/5 gap-1 select-none mb-3">
                        {(['position', 'ui', 'bonus', 'buttons'] as const).map((sec) => (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => setOpenSection(sec)}
                            className={`flex-1 py-1 px-2 rounded-lg text-[9px] sm:text-[10px] font-extrabold uppercase transition cursor-pointer text-center whitespace-nowrap ${
                              openSection === sec
                                ? 'bg-red-800 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {sec === 'position' ? 'Posição' : sec === 'ui' ? 'Layout/HUD' : sec === 'bonus' ? 'Bônus' : 'Botões'}
                          </button>
                        ))}
                      </div>

                      {/* ACCORDION CONTENT */}
                      <div className="space-y-3">
                        {openSection === 'position' && (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            {/* Fundo (Background) */}
                            <div className="bg-black/40 p-3 rounded-xl border border-red-900/40 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-yellow-400 uppercase tracking-wider block">1. Fundo (Background)</span>
                                <span className="text-[9px] text-gray-400 font-mono">Precisão 0.1%</span>
                              </div>
                              <PrecisionControl
                                label="Posição X (Horizontal)"
                                value={adminConfig.bgPosX ?? 0}
                                onChange={(val) => onUpdateAdminConfig({ bgPosX: val })}
                                min={-100}
                                max={100}
                                colorClass="text-yellow-300"
                              />
                              <PrecisionControl
                                label="Posição Y (Vertical)"
                                value={adminConfig.bgPosY ?? 0}
                                onChange={(val) => onUpdateAdminConfig({ bgPosY: val })}
                                min={-100}
                                max={100}
                                colorClass="text-yellow-300"
                              />
                              <PrecisionControl
                                label="Zoom / Escala Fundo"
                                value={adminConfig.bgZoom ?? 100}
                                onChange={(val) => onUpdateAdminConfig({ bgZoom: val })}
                                min={100}
                                max={300}
                                colorClass="text-yellow-300"
                              />
                            </div>

                            {/* Quadro do Slot */}
                            <div className="bg-black/40 p-3 rounded-xl border border-red-900/40 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">2. Quadro do Slot</span>
                                <span className="text-[9px] text-gray-400 font-mono">Precisão 0.1%</span>
                              </div>
                              <PrecisionControl
                                label="Largura (%)"
                                value={adminConfig.slotWidth ?? 40}
                                onChange={(val) => onUpdateAdminConfig({ slotWidth: val })}
                                min={15}
                                max={100}
                                colorClass="text-amber-300"
                              />
                              <PrecisionControl
                                label="Altura (%)"
                                value={adminConfig.slotHeight ?? 40}
                                onChange={(val) => onUpdateAdminConfig({ slotHeight: val })}
                                min={15}
                                max={100}
                                colorClass="text-amber-300"
                              />
                              <PrecisionControl
                                label="Margem Esquerda (%)"
                                value={adminConfig.slotLeft ?? 0}
                                onChange={(val) => onUpdateAdminConfig({ slotLeft: val })}
                                min={0}
                                max={85}
                                colorClass="text-amber-300"
                              />
                              <PrecisionControl
                                label="Margem Topo (%)"
                                value={adminConfig.slotTop ?? 0}
                                onChange={(val) => onUpdateAdminConfig({ slotTop: val })}
                                min={0}
                                max={85}
                                colorClass="text-amber-300"
                              />
                            </div>

                            {/* Quadro Styling */}
                            <div className="bg-black/40 p-3 rounded-xl border border-red-900/40 space-y-3">
                              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Bordas & Fundo do Slot</span>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-0.5">
                                  <label className="text-[9px] text-gray-400 font-bold block">Espessura Borda (px):</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    value={adminConfig.slotFrameBorderWidth ?? 4}
                                    onChange={(e) => onUpdateAdminConfig({ slotFrameBorderWidth: parseInt(e.target.value) || 0 })}
                                    className="w-full px-2.5 py-1 bg-black/60 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-red-500"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <label className="text-[9px] text-gray-400 font-bold block">Cor da Borda:</label>
                                  <input
                                    type="color"
                                    value={adminConfig.slotFrameColor ?? '#ffb700'}
                                    onChange={(e) => onUpdateAdminConfig({ slotFrameColor: e.target.value })}
                                    className="w-full h-8 bg-black/60 border border-white/10 rounded-lg cursor-pointer p-0.5"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-gray-300">
                                  <span>Fundo do Slot (Preto Translúcido):</span>
                                  <span className="font-mono text-amber-300">{adminConfig.slotFrameBgColor ? 'Personalizado' : 'Padrão'}</span>
                                </div>
                                <input
                                  type="text"
                                  placeholder="rgba(0,0,0,0.65)"
                                  value={adminConfig.slotFrameBgColor ?? 'rgba(0,0,0,0.65)'}
                                  onChange={(e) => onUpdateAdminConfig({ slotFrameBgColor: e.target.value })}
                                  className="w-full px-2.5 py-1 bg-black/60 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-red-500"
                                />
                              </div>
                            </div>

                            {/* Botão Girar */}
                            <div className="bg-black/40 p-3 rounded-xl border border-red-900/40 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-red-400 uppercase tracking-wider block">3. Botão GIRAR</span>
                                <span className="text-[9px] text-gray-400 font-mono">Precisão 0.1%</span>
                              </div>
                              <PrecisionControl
                                label="Posição X (%)"
                                value={adminConfig.spinLeft ?? 50}
                                onChange={(val) => onUpdateAdminConfig({ spinLeft: val })}
                                min={10}
                                max={90}
                                colorClass="text-red-300"
                              />
                              <PrecisionControl
                                label="Posição Y Inferior (%)"
                                value={adminConfig.spinBottom ?? 4}
                                onChange={(val) => onUpdateAdminConfig({ spinBottom: val })}
                                min={0}
                                max={80}
                                colorClass="text-red-300"
                              />
                              <PrecisionControl
                                label="Escala / Tamanho (%)"
                                value={adminConfig.spinScale ?? 100}
                                onChange={(val) => onUpdateAdminConfig({ spinScale: val })}
                                min={40}
                                max={200}
                                colorClass="text-red-300"
                              />
                            </div>
                          </div>
                        )}

                        {openSection === 'ui' && (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            <div className="bg-black/40 p-3 rounded-xl border border-red-900/40 space-y-2.5">
                              <span className="text-[10px] font-bold text-red-300 uppercase block tracking-wider">Toggles de Elementos Visuais</span>
                              <div className="space-y-2">
                                <label className="flex items-center justify-between text-xs text-gray-300 cursor-pointer hover:text-white">
                                  <span>Exibir Barra Superior (Header):</span>
                                  <input
                                    type="checkbox"
                                    checked={adminConfig.showHeader !== false}
                                    onChange={(e) => onUpdateAdminConfig({ showHeader: e.target.checked })}
                                    className="w-4 h-4 rounded bg-black/60 border-white/10 text-red-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                  />
                                </label>
                                <label className="flex items-center justify-between text-xs text-gray-300 cursor-pointer hover:text-white">
                                  <span>Exibir Caixa de Saldo (Balance):</span>
                                  <input
                                    type="checkbox"
                                    checked={adminConfig.showBalance !== false}
                                    onChange={(e) => onUpdateAdminConfig({ showBalance: e.target.checked })}
                                    className="w-4 h-4 rounded bg-black/60 border-white/10 text-red-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                  />
                                </label>
                                <label className="flex items-center justify-between text-xs text-gray-300 cursor-pointer hover:text-white">
                                  <span>Exibir Botões de Aposta (Bet):</span>
                                  <input
                                    type="checkbox"
                                    checked={adminConfig.showBetController !== false}
                                    onChange={(e) => onUpdateAdminConfig({ showBetController: e.target.checked })}
                                    className="w-4 h-4 rounded bg-black/60 border-white/10 text-red-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                  />
                                </label>
                                <label className="flex items-center justify-between text-xs text-gray-300 cursor-pointer hover:text-white">
                                  <span>Exibir Banner de Linhas Ganhas:</span>
                                  <input
                                    type="checkbox"
                                    checked={adminConfig.showWinBanner !== false}
                                    onChange={(e) => onUpdateAdminConfig({ showWinBanner: e.target.checked })}
                                    className="w-4 h-4 rounded bg-black/60 border-white/10 text-red-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                  />
                                </label>
                                <label className="flex items-center justify-between text-xs text-gray-300 cursor-pointer hover:text-white">
                                  <span>Slots sem Margem (Apenas Símbolos):</span>
                                  <input
                                    type="checkbox"
                                    checked={!!adminConfig.noSlotMargins}
                                    onChange={(e) => onUpdateAdminConfig({ noSlotMargins: e.target.checked })}
                                    className="w-4 h-4 rounded bg-black/60 border-white/10 text-red-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                  />
                                </label>
                              </div>
                            </div>

                            <div className="bg-black/40 p-3 rounded-xl border border-red-900/40 space-y-3">
                              <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider block">Customização do Botão Girar</span>
                              <div className="space-y-1.5">
                                <label className="text-[9px] text-gray-400 font-bold block">Texto do Botão:</label>
                                <input
                                  type="text"
                                  placeholder="Girar"
                                  value={adminConfig.spinButtonLabel ?? 'Girar'}
                                  onChange={(e) => onUpdateAdminConfig({ spinButtonLabel: e.target.value })}
                                  className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[9px] text-gray-400 font-bold block">Cor/Tema Visual:</label>
                                <select
                                  value={adminConfig.spinButtonColor ?? 'gold'}
                                  onChange={(e) => onUpdateAdminConfig({ spinButtonColor: e.target.value as any })}
                                  className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                                >
                                  <option value="gold">Dourado Imperial (Ouro)</option>
                                  <option value="red">Vermelho Dracônico</option>
                                  <option value="green">Verde Esmeralda</option>
                                  <option value="blue">Azul Cristalino</option>
                                  <option value="purple">Roxo Arcânio</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}

                        {openSection === 'bonus' && (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            <div className="bg-black/40 p-3 rounded-xl border border-red-900/40 space-y-3">
                              <span className="text-[10px] font-bold text-red-300 uppercase block tracking-wider">Recurso de Compra de Bônus (Buy Bonus)</span>
                              <label className="flex items-center justify-between text-xs text-gray-300 cursor-pointer hover:text-white">
                                <span>Habilitar Compra de Bônus:</span>
                                <input
                                  type="checkbox"
                                  checked={adminConfig.enableBuyBonus !== false}
                                  onChange={(e) => onUpdateAdminConfig({ enableBuyBonus: e.target.checked })}
                                  className="w-4 h-4 rounded bg-black/60 border-white/10 text-red-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                />
                              </label>

                              <div className="space-y-1 pt-1.5 border-t border-white/5">
                                <div className="flex justify-between text-[10px] text-gray-300">
                                  <span>Custo do Bônus (Multiplicador de Aposta):</span>
                                  <span className="font-bold text-yellow-400">{adminConfig.buyBonusMultiplier ?? 50}x</span>
                                </div>
                                <input
                                  type="range"
                                  min="10"
                                  max="200"
                                  step="5"
                                  value={adminConfig.buyBonusMultiplier ?? 50}
                                  onChange={(e) => onUpdateAdminConfig({ buyBonusMultiplier: parseInt(e.target.value) })}
                                  className="w-full accent-yellow-500 cursor-pointer h-1"
                                />
                                <span className="text-[8px] text-gray-500 block">Ex: Aposta R$ 2.00 x 50 = Custo de R$ 100.00 para entrar</span>
                              </div>
                            </div>

                            <div className="bg-black/40 p-3 rounded-xl border border-red-900/40 space-y-3">
                              <span className="text-[10px] font-bold text-red-300 uppercase block tracking-wider">Configurações das Rodadas Grátis</span>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[9px] text-gray-400 font-bold block">Quantidade Giros Grátis:</label>
                                  <input
                                    type="number"
                                    min="5"
                                    max="50"
                                    value={adminConfig.bonusFreeSpinsCount ?? 10}
                                    onChange={(e) => onUpdateAdminConfig({ bonusFreeSpinsCount: parseInt(e.target.value) || 10 })}
                                    className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-red-500"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] text-gray-400 font-bold block">Multiplicador do Bônus (Boost):</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={adminConfig.bonusMultiplierBoost ?? 1}
                                    onChange={(e) => onUpdateAdminConfig({ bonusMultiplierBoost: parseInt(e.target.value) || 1 })}
                                    className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-red-500"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5 pt-1.5 border-t border-white/5">
                                <label className="text-[9px] text-gray-400 font-bold block">Padrão de Vitória no Bônus (Demonstração):</label>
                                <select
                                  value={adminConfig.bonusForceWinType ?? 'none'}
                                  onChange={(e) => onUpdateAdminConfig({ bonusForceWinType: e.target.value as any })}
                                  className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                                >
                                  <option value="none">RNG Normal (Aleatório Puro)</option>
                                  <option value="normal_win">Vitórias Frequentes (Sem perdas brutas)</option>
                                  <option value="big_win">Vitórias Altas (Foco em Big Win)</option>
                                  <option value="full_screen">Forçar Tela Cheia (Big Win Especial)</option>
                                  <option value="loss">Apenas Derrotas (Fins matemáticos)</option>
                                </select>
                              </div>
                            </div>

                            <div className="bg-black/40 p-3 rounded-xl border border-red-900/40 space-y-3">
                              <span className="text-[10px] font-bold text-red-300 uppercase block tracking-wider">Mídia de Comemoração de Bônus</span>
                              <div className="space-y-1">
                                <label className="text-[9px] text-gray-400 font-bold block">Vídeo ou Foto (Link / URL):</label>
                                <input
                                  type="text"
                                  placeholder="Link do YouTube, MP4 ou Imagem (.jpg, .png, etc)"
                                  value={adminConfig.bonusMediaUrl ?? ''}
                                  onChange={(e) => onUpdateAdminConfig({ bonusMediaUrl: e.target.value })}
                                  className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs font-sans text-white focus:outline-none focus:border-red-500"
                                />
                                <span className="text-[8px] text-gray-500 block leading-tight">
                                  Pode ser um link de vídeo do YouTube, um link direto para um arquivo de vídeo MP4, ou uma foto/imagem da internet. Ficará de fundo na tela de resultado do bônus.
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {openSection === 'buttons' && (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            {/* Panel Creator */}
                            <div className="bg-black/40 p-3 rounded-xl border border-red-900/40 space-y-3">
                              <span className="text-[10px] font-bold text-red-300 uppercase block tracking-wider">Criador de Botões Customizados</span>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[9px] text-gray-400 font-bold block">Rótulo (Texto):</label>
                                  <input
                                    type="text"
                                    placeholder="Ex: +Saldo"
                                    value={btnLabel}
                                    onChange={(e) => setBtnLabel(e.target.value)}
                                    className="w-full px-2.5 py-1 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] text-gray-400 font-bold block">Ação / Função:</label>
                                  <select
                                    value={btnActionType}
                                    onChange={(e) => setBtnActionType(e.target.value as any)}
                                    className="w-full px-2.5 py-1 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none cursor-pointer"
                                  >
                                    <option value="add_balance">Adicionar Saldo (+R$)</option>
                                    <option value="reset_balance">Zerar Saldo (R$ 0)</option>
                                    <option value="force_big_win">Forçar Mega Vitória</option>
                                    <option value="force_bonus">Ativar Modo Bônus</option>
                                    <option value="support_alert">Mostrar Alerta/Suporte</option>
                                    <option value="redirect_url">Redirecionar para URL</option>
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] text-gray-400 font-bold block">Valor da Ação (Parâmetro):</label>
                                <input
                                  type="text"
                                  placeholder={
                                    btnActionType === 'add_balance' ? 'Ex: 1000' :
                                    btnActionType === 'support_alert' ? 'Ex: Fale conosco!' :
                                    btnActionType === 'redirect_url' ? 'Ex: https://google.com' :
                                    'Ação não requer parâmetro'
                                  }
                                  disabled={['reset_balance', 'force_big_win', 'force_bonus'].includes(btnActionType)}
                                  value={btnActionValue}
                                  onChange={(e) => setBtnActionValue(e.target.value)}
                                  className="w-full px-2.5 py-1 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none disabled:opacity-40"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-0.5">
                                  <div className="flex justify-between text-[9px] text-gray-400">
                                    <span>Posição X (%):</span>
                                    <span className="font-mono text-yellow-300">{btnPosX}%</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="5"
                                    max="95"
                                    value={btnPosX}
                                    onChange={(e) => setBtnPosX(parseInt(e.target.value))}
                                    className="w-full accent-yellow-500 cursor-pointer h-1"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <div className="flex justify-between text-[9px] text-gray-400">
                                    <span>Posição Y (%):</span>
                                    <span className="font-mono text-yellow-300">{btnPosY}%</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="5"
                                    max="95"
                                    value={btnPosY}
                                    onChange={(e) => setBtnPosY(parseInt(e.target.value))}
                                    className="w-full accent-yellow-500 cursor-pointer h-1"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[9px] text-gray-400 font-bold block">Tema de Cor:</label>
                                  <select
                                    value={btnBgColor}
                                    onChange={(e) => {
                                      const bg = e.target.value;
                                      setBtnBgColor(bg);
                                      setBtnTextColor(bg.includes('yellow') || bg.includes('green') || bg.includes('emerald') ? 'text-black' : 'text-white');
                                    }}
                                    className="w-full px-2.5 py-1 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none cursor-pointer"
                                  >
                                    <option value="bg-yellow-500 hover:bg-yellow-400">Dourado (Ouro)</option>
                                    <option value="bg-red-600 hover:bg-red-500">Vermelho Vivo</option>
                                    <option value="bg-blue-600 hover:bg-blue-500">Azul Brilhante</option>
                                    <option value="bg-emerald-600 hover:bg-emerald-500">Verde Jade</option>
                                    <option value="bg-neutral-700 hover:bg-neutral-600">Cinza Neutro</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] text-gray-400 font-bold block">Escala (%):</label>
                                  <input
                                    type="number"
                                    min="50"
                                    max="150"
                                    value={btnScale}
                                    onChange={(e) => setBtnScale(parseInt(e.target.value) || 100)}
                                    className="w-full px-2.5 py-1 bg-black/60 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none"
                                  />
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  if (!btnLabel.trim()) {
                                    alert('Por favor, informe um rótulo para o botão.');
                                    return;
                                  }
                                  const newBtn = {
                                    id: Math.random().toString(36).substring(2, 11),
                                    label: btnLabel,
                                    actionType: btnActionType,
                                    actionValue: btnActionValue,
                                    posX: btnPosX,
                                    posY: btnPosY,
                                    scale: btnScale,
                                    bgColor: btnBgColor,
                                    textColor: btnTextColor,
                                    isActive: true,
                                  };
                                  const currentButtons = adminConfig.customButtons || [];
                                  onUpdateAdminConfig({ customButtons: [...currentButtons, newBtn] });
                                  setBtnLabel('RODADA BÔNUS');
                                  setBtnActionValue('');
                                }}
                                className="w-full py-2 bg-green-600 hover:bg-green-500 font-extrabold text-xs text-white rounded-lg uppercase tracking-wider transition cursor-pointer mt-1"
                              >
                                Criar Botão
                              </button>
                            </div>

                            {/* Active Buttons List */}
                            <div className="bg-black/40 p-3 rounded-xl border border-red-900/40 space-y-2">
                              <span className="text-[10px] font-bold text-gray-300 uppercase block tracking-wider">Botões Ativos</span>
                              {(adminConfig.customButtons || []).length === 0 ? (
                                <p className="text-[10px] text-gray-500 italic text-center py-2">Nenhum botão criado até o momento.</p>
                              ) : (
                                <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
                                  {(adminConfig.customButtons || []).map((btn, idx) => (
                                    <div key={btn.id} className="p-2 bg-black/60 border border-white/5 rounded-lg flex items-center justify-between gap-2">
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-xs font-bold text-white truncate">{btn.label}</span>
                                          <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-white/10 text-gray-400">
                                            {btn.actionType === 'add_balance' ? 'Add $' :
                                             btn.actionType === 'reset_balance' ? 'Zerar $' :
                                             btn.actionType === 'force_big_win' ? 'Mega W' :
                                             btn.actionType === 'force_bonus' ? 'Ativar B' :
                                             btn.actionType === 'support_alert' ? 'Msg' : 'URL'}
                                          </span>
                                        </div>
                                        <div className="text-[8px] text-gray-500 mt-0.5 font-mono">
                                          Pos: X:{btn.posX}% Y:{btn.posY}% | Escala: {btn.scale}%
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          checked={btn.isActive}
                                          onChange={(e) => {
                                            const updated = (adminConfig.customButtons || []).map((b, i) => i === idx ? { ...b, isActive: e.target.checked } : b);
                                            onUpdateAdminConfig({ customButtons: updated });
                                          }}
                                          className="w-3.5 h-3.5 text-red-500 bg-black/60 border-white/10 rounded cursor-pointer"
                                          title="Habilitar/Desabilitar"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = (adminConfig.customButtons || []).filter((_, i) => i !== idx);
                                            onUpdateAdminConfig({ customButtons: updated });
                                          }}
                                          className="p-1 text-red-400 hover:bg-red-950/40 rounded transition cursor-pointer"
                                          title="Deletar Botão"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Visual Device Workspace Viewport */}
                  <div className={`${mobileLayoutView === 'preview' ? 'flex' : 'hidden lg:flex'} lg:col-span-7 bg-[#08090d] rounded-2xl border border-red-500/30 p-3 sm:p-4 flex-col items-center justify-between relative min-h-[500px] lg:h-[76vh] overflow-hidden shadow-2xl`}>
                    
                    {/* PC Workspace Control Toolbar */}
                    <div className="w-full flex flex-wrap items-center justify-between gap-2 bg-black/80 backdrop-blur-md p-2 rounded-xl border border-white/10 z-30 shadow-lg">
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-black text-amber-200 uppercase tracking-wider hidden sm:inline">
                          Simulador de Precisão PC
                        </span>
                      </div>

                      {/* Device Profile Selectors */}
                      <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                        <button
                          type="button"
                          onClick={() => setPreviewProfile('phone')}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${previewProfile === 'phone' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                          title="Visão Celular Padrão (290px)"
                        >
                          <Smartphone className="w-3 h-3" />
                          <span className="hidden md:inline">Celular (290px)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewProfile('pc_large')}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${previewProfile === 'pc_large' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                          title="Visão Expandida PC (360px)"
                        >
                          <Monitor className="w-3 h-3" />
                          <span className="hidden md:inline">PC Ampliado (360px)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewProfile('desktop_full')}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${previewProfile === 'desktop_full' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                          title="Visão Max Workstation PC (420px)"
                        >
                          <Maximize2 className="w-3 h-3" />
                          <span className="hidden md:inline">PC Máximo (420px)</span>
                        </button>
                      </div>

                      {/* Toggles: Gridlines, Sensitivity & Zoom */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowGridLines(!showGridLines)}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition flex items-center gap-1 cursor-pointer ${showGridLines ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-black/60 border-white/10 text-gray-400 hover:text-white'}`}
                          title="Grade de Alinhamento 10%"
                        >
                          <Grid className="w-3 h-3" />
                          <span className="hidden xl:inline">Grade 10%</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDragPrecisionMode(dragPrecisionMode === 'fine' ? 'normal' : 'fine')}
                          className={`px-2 py-1 rounded text-[10px] font-mono font-bold border transition flex items-center gap-1 cursor-pointer ${dragPrecisionMode === 'fine' ? 'bg-red-500/20 border-red-500/50 text-red-300' : 'bg-black/60 border-white/10 text-gray-400'}`}
                          title="Sensibilidade do Arraste: Fina (0.1%) / Normal (1%)"
                        >
                          <Crosshair className="w-3 h-3" />
                          <span>{dragPrecisionMode === 'fine' ? '0.1%' : '1.0%'}</span>
                        </button>

                        <div className="flex items-center gap-0.5 bg-black/60 px-1.5 py-0.5 rounded border border-white/10">
                          <button
                            type="button"
                            onClick={() => setWorkspaceZoom(Math.max(80, workspaceZoom - 10))}
                            className="p-1 hover:text-white text-gray-400 cursor-pointer"
                          >
                            <ZoomOut className="w-3 h-3" />
                          </button>
                          <span className="text-[10px] font-mono text-amber-300 px-1">{workspaceZoom}%</span>
                          <button
                            type="button"
                            onClick={() => setWorkspaceZoom(Math.min(140, workspaceZoom + 10))}
                            className="p-1 hover:text-white text-gray-400 cursor-pointer"
                          >
                            <ZoomIn className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Canvas Container Wrapper */}
                    <div className="w-full flex-1 flex items-center justify-center overflow-auto p-2 relative">
                      <div 
                        ref={previewCanvasRef}
                        onMouseDown={handleBgMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleBgTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        style={{
                          width: previewProfile === 'phone' ? '290px' : previewProfile === 'pc_large' ? '360px' : '420px',
                          maxHeight: previewProfile === 'phone' ? '520px' : previewProfile === 'pc_large' ? '620px' : '680px',
                          transform: `scale(${workspaceZoom / 100})`,
                          transformOrigin: 'center center',
                        }}
                        className="relative w-full h-full aspect-[9/16] bg-black rounded-3xl border-2 border-red-500/60 overflow-hidden shadow-[0_0_40px_rgba(239,68,68,0.3)] cursor-grab active:cursor-grabbing select-none touch-none z-20 transition-all duration-200"
                      >
                        {/* Background Layer (Image or Loop Video) */}
                        <BackgroundMedia 
                          src={adminConfig.bgImage}
                          posX={adminConfig.bgPosX}
                          posY={adminConfig.bgPosY}
                          zoom={adminConfig.bgZoom}
                          mediaType={adminConfig.bgMediaType}
                        />

                        {/* Alignment Gridlines & Center Crosshair Overlay */}
                        {showGridLines && (
                          <div className="absolute inset-0 pointer-events-none z-10 opacity-35">
                            <div className="w-full h-full grid grid-cols-10 grid-rows-10 border border-yellow-400/20">
                              {Array.from({ length: 100 }).map((_, i) => (
                                <div key={i} className="border-r border-b border-yellow-400/20 text-[6px] text-yellow-300 font-mono p-0.5 select-none">
                                  {i % 10 === 0 ? `${i}%` : ''}
                                </div>
                              ))}
                            </div>
                            {/* Center Crosshairs */}
                            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-red-500/80 shadow-[0_0_4px_red]" />
                            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-red-500/80 shadow-[0_0_4px_red]" />
                          </div>
                        )}

                        {/* Interactive Draggable & Resizable Slot Box Frame */}
                        <div
                          onMouseDown={handleSlotMouseDown}
                          onTouchStart={handleSlotTouchStart}
                          style={{
                            top: `${adminConfig.slotTop ?? 28}%`,
                            left: `${adminConfig.slotLeft ?? 4}%`,
                            width: `${adminConfig.slotWidth ?? 92}%`,
                            height: `${adminConfig.slotHeight ?? 38}%`,
                          }}
                          className="absolute border-2 border-amber-400 bg-black/50 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center cursor-move shadow-[0_0_20px_rgba(251,191,36,0.6)] hover:border-yellow-200 transition-colors z-20 group"
                        >
                          <div className="absolute -top-6 bg-amber-400 text-black px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow pointer-events-none z-30 whitespace-nowrap">
                            Quadro Slot (X:{adminConfig.slotLeft}% Y:{adminConfig.slotTop}%)
                          </div>

                          {/* Real SlotMachine rendered inside preview for 100% visual fidelity */}
                          <div className="w-full h-full pointer-events-none flex items-center justify-center p-1">
                            <SlotMachine 
                              isSpinning={false} 
                              grid={[
                                ['Castle', 'Sword', 'Diamond', 'Crown', 'Lion'],
                                ['Shield', 'Queen', 'Dragon', 'King', 'Coin'],
                                ['Lion', 'Diamond', 'Castle', 'Sword', 'Crown']
                              ]} 
                              customSymbols={adminConfig.customSymbols}
                              customSymbolConfigs={adminConfig.customSymbolConfigs}
                            />
                          </div>

                          {/* Bottom-Right Resize Handle */}
                          <div
                            onMouseDown={handleSlotResizeMouseDown}
                            onTouchStart={handleSlotResizeTouchStart}
                            className="absolute -bottom-2 -right-2 w-6 h-6 bg-amber-400 hover:bg-yellow-200 border-2 border-black rounded-full cursor-se-resize shadow-lg flex items-center justify-center z-30 active:scale-125 transition-transform"
                            title="Arraste para Redimensionar o Slot"
                          >
                            <div className="w-2.5 h-2.5 border-r-2 border-b-2 border-black" />
                          </div>
                        </div>

                        {/* Interactive Draggable Spin Button in Canvas */}
                        <div
                          onMouseDown={handleSpinMouseDown}
                          onTouchStart={handleSpinTouchStart}
                          style={{
                            bottom: `${adminConfig.spinBottom ?? 4}%`,
                            left: `${adminConfig.spinLeft ?? 50}%`,
                            transform: `translateX(-50%) scale(${(adminConfig.spinScale ?? 100) / 100})`,
                          }}
                          className="absolute z-20 cursor-move bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 p-2 px-4 rounded-full border-2 border-white shadow-[0_0_15px_rgba(250,204,21,0.8)] text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 hover:scale-105 transition-transform whitespace-nowrap"
                        >
                          <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                          <span>GIRAR ({adminConfig.spinLeft}%, {adminConfig.spinBottom}%)</span>
                        </div>

                        {/* Live preview of custom buttons inside device simulation workspace */}
                        {(adminConfig.customButtons || []).map((btn) => {
                          if (!btn.isActive) return null;
                          return (
                            <div
                              key={btn.id}
                              style={{
                                left: `${btn.posX}%`,
                                top: `${btn.posY}%`,
                                transform: `translate(-50%, -50%) scale(${(btn.scale || 100) / 100})`,
                              }}
                              className={`absolute z-20 px-2.5 py-1.5 rounded-lg font-black text-[8px] tracking-wider uppercase shadow-md border border-white/10 pointer-events-none whitespace-nowrap truncate ${btn.bgColor} ${btn.textColor}`}
                            >
                              {btn.label}
                            </div>
                          );
                        })}

                        {/* HUD Coordinates Monitor */}
                        <div className="absolute bottom-2 left-2 right-2 bg-black/90 backdrop-blur px-2.5 py-1.5 rounded-xl text-[9px] text-gray-300 font-mono pointer-events-none z-20 leading-normal border border-red-500/30 shadow-lg">
                          <div className="flex justify-between items-center text-amber-300 font-bold">
                            <span>QUADRO: X:{adminConfig.slotLeft}% Y:{adminConfig.slotTop}%</span>
                            <span>TAM: {adminConfig.slotWidth}%x{adminConfig.slotHeight}%</span>
                          </div>
                          <div className="flex justify-between items-center mt-0.5 text-[8px] text-red-300">
                            <span>GIRAR: X:{adminConfig.spinLeft}% Y-Inf:{adminConfig.spinBottom}%</span>
                            <span>FUNDO: X:{adminConfig.bgPosX}% Y:{adminConfig.bgPosY}% ({adminConfig.bgZoom}%)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

              {activeTab === 'engine' && (
                <SlotEngineEditor
                  engineConfig={engineConfig}
                  onUpdateEngineConfig={onUpdateEngineConfig}
                  adminConfig={adminConfig}
                  onUpdateAdminConfig={onUpdateAdminConfig}
                />
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
};

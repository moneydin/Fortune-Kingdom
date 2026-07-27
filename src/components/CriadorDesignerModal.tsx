import React, { useState, useRef } from 'react';
import { 
  X, Smartphone, Monitor, Eye, Grid, Crosshair, ZoomIn, ZoomOut, Maximize2, 
  RotateCcw, Sliders, Image as ImageIcon, Sparkles, Plus, Trash2, Move, 
  Type as TypeIcon, Layers, Palette, Play, Settings, DollarSign, Trophy,
  ChevronRight, CheckCircle2, Shield, Flame, Activity, Coins, Minus, Zap, Volume2, Square
} from 'lucide-react';
import { AdminConfig, CustomButtonConfig, CustomTextConfig, GameState, SymbolType } from '../types';
import { SlotMachine } from './SlotMachine';
import { BackgroundMedia } from './BackgroundMedia';
import { SpinButton } from './SpinButton';

interface CriadorDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminConfig: AdminConfig;
  onUpdateAdminConfig: (updates: Partial<AdminConfig>) => void;
  gameState: GameState;
  onSpin: () => void;
  onUpdateGameState: (updates: Partial<GameState>) => void;
}

const SYMBOL_LIST: { type: SymbolType; label: string }[] = [
  { type: 'King', label: 'Rei K' },
  { type: 'Queen', label: 'Rainha Q' },
  { type: 'Crown', label: 'Coroa Impreial' },
  { type: 'Lion', label: 'Leão Dourado' },
  { type: 'Sword', label: 'Espada Lendária' },
  { type: 'Shield', label: 'Escudo Real' },
  { type: 'Castle', label: 'Castelo' },
  { type: 'Diamond', label: 'Diamante Azul' },
  { type: 'Coin', label: 'Moeda de Ouro' },
];

export const CriadorDesignerModal: React.FC<CriadorDesignerModalProps> = ({
  isOpen,
  onClose,
  adminConfig,
  onUpdateAdminConfig,
  gameState,
  onSpin,
  onUpdateGameState,
}) => {
  const [activeTab, setActiveTab] = useState<'screen' | 'slot' | 'buttons' | 'hud' | 'text' | 'symbols'>('screen');
  
  // Phone viewport scale & presets
  const [phoneWidth, setPhoneWidth] = useState<number>(360);
  const [phoneScale, setPhoneScale] = useState<number>(100);
  const [showGridLines, setShowGridLines] = useState<boolean>(true);
  const [dragPrecisionMode, setDragPrecisionMode] = useState<'fine' | 'normal'>('fine');

  // Dragging states
  const previewCanvasRef = useRef<HTMLDivElement>(null);
  const [draggingTarget, setDraggingTarget] = useState<string | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; initialX: number; initialY: number }>({ x: 0, y: 0, initialX: 0, initialY: 0 });

  // Custom button creator state
  const [btnLabel, setBtnLabel] = useState<string>('BÔNUS GRÁTIS');
  const [btnAction, setBtnAction] = useState<CustomButtonConfig['actionType']>('buy_bonus');
  const [btnValue, setBtnValue] = useState<string>('100');
  const [btnColor, setBtnColor] = useState<string>('bg-gradient-to-r from-amber-500 to-yellow-400');
  const [btnShape, setBtnShape] = useState<CustomButtonConfig['shape']>('pill');
  const [btnIcon, setBtnIcon] = useState<CustomButtonConfig['icon']>('play');
  const [btnImageUrl, setBtnImageUrl] = useState<string>('');

  // Custom text creator state
  const [newText, setNewText] = useState<string>('MEGA PRÊMIO');
  const [newTextSize, setNewTextSize] = useState<number>(14);
  const [newTextColor, setNewTextColor] = useState<string>('#fde047');

  if (!isOpen) return null;

  const roundPrecision = (val: number) => {
    return dragPrecisionMode === 'fine' ? Math.round(val * 10) / 10 : Math.round(val);
  };

  // Generic Drag Start
  const handleStartDrag = (target: string, initialX: number, initialY: number, clientX: number, clientY: number) => {
    setDraggingTarget(target);
    dragStartRef.current = { x: clientX, y: clientY, initialX, initialY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingTarget || !previewCanvasRef.current) return;
    const rect = previewCanvasRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;

    const newX = Math.max(0, Math.min(100, roundPrecision(dragStartRef.current.initialX + deltaX)));
    const newY = Math.max(0, Math.min(100, roundPrecision(dragStartRef.current.initialY + deltaY)));

    if (draggingTarget === 'slot') {
      onUpdateAdminConfig({ slotLeft: newX, slotTop: newY });
    } else if (draggingTarget === 'spin') {
      onUpdateAdminConfig({ spinLeft: newX, spinBottom: 100 - newY });
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
    }
  };

  const handleMouseUp = () => {
    setDraggingTarget(null);
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
      textColor: 'text-black font-black',
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

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col font-sans text-white overflow-hidden animate-in fade-in duration-200 select-none">
      
      {/* Studio Top Header Navigation */}
      <header className="w-full bg-[#0d0e14] border-b border-red-500/30 px-4 py-2.5 flex items-center justify-between shrink-0 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-amber-500 to-yellow-400 p-0.5 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 uppercase">
                Criador Designer Studio
              </h1>
              <span className="bg-red-950/80 border border-red-500/40 text-red-300 text-[9px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase">
                Estúdio PC
              </span>
            </div>
            <p className="text-[10px] text-gray-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Simulador em Tempo Real com Alta Precisão de Elementos
            </p>
          </div>
        </div>

        {/* Toolbar Center Quick Controls */}
        <div className="hidden md:flex items-center gap-2 bg-black/60 p-1 rounded-xl border border-white/10">
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

          <div className="flex items-center gap-1 text-xs text-gray-300">
            <span className="text-[10px] uppercase font-bold text-gray-400">Celular:</span>
            <button
              type="button"
              onClick={() => setPhoneWidth(290)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${phoneWidth === 290 ? 'bg-red-600 text-white' : 'bg-white/5 hover:bg-white/10'}`}
            >
              290px
            </button>
            <button
              type="button"
              onClick={() => setPhoneWidth(360)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${phoneWidth === 360 ? 'bg-red-600 text-white' : 'bg-white/5 hover:bg-white/10'}`}
            >
              360px
            </button>
            <button
              type="button"
              onClick={() => setPhoneWidth(420)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${phoneWidth === 420 ? 'bg-red-600 text-white' : 'bg-white/5 hover:bg-white/10'}`}
            >
              420px
            </button>
          </div>
        </div>

        {/* Right Close Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-red-600/80 active:scale-95 text-gray-300 hover:text-white rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-white/10"
          >
            <X className="w-4 h-4" />
            <span>Sair do Criador</span>
          </button>
        </div>
      </header>

      {/* Main Studio Body Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Control Panel Navigation Tabs & Controls (4 Cols) */}
        <div className="lg:col-span-4 bg-[#090a0f] border-r border-red-500/20 flex flex-col h-full overflow-hidden">
          
          {/* Tab Selector Buttons */}
          <div className="grid grid-cols-3 gap-1 p-2 bg-black/60 border-b border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('screen')}
              className={`p-2 rounded-lg font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                activeTab === 'screen' ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="text-[10px]">1. Fundo & Tela</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('slot')}
              className={`p-2 rounded-lg font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                activeTab === 'slot' ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span className="text-[10px]">2. Slot & Grade</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('buttons')}
              className={`p-2 rounded-lg font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                activeTab === 'buttons' ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span className="text-[10px]">3. Botões</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('hud')}
              className={`p-2 rounded-lg font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                activeTab === 'hud' ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span className="text-[10px]">4. Saldo & Aposta</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`p-2 rounded-lg font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                activeTab === 'text' ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <TypeIcon className="w-4 h-4" />
              <span className="text-[10px]">5. Textos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('symbols')}
              className={`p-2 rounded-lg font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                activeTab === 'symbols' ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span className="text-[10px]">6. Símbolos</span>
            </button>
          </div>

          {/* Active Tab Panel Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* TAB 1: SCREEN & BACKGROUND */}
            {activeTab === 'screen' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="bg-black/50 p-3 rounded-xl border border-red-500/20 space-y-3">
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>Mídia do Fundo (Imagem / Vídeo Loop)</span>
                  </h3>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-300 font-bold">URL da Imagem ou Vídeo (.mp4):</label>
                    <input
                      type="text"
                      value={adminConfig.bgImage}
                      onChange={(e) => onUpdateAdminConfig({ bgImage: e.target.value })}
                      placeholder="https://exemplo.com/fundo.png"
                      className="w-full px-3 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-yellow-300 focus:outline-none focus:border-red-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Posição X (%):</label>
                      <input
                        type="number"
                        step="0.1"
                        value={adminConfig.bgPosX ?? 0}
                        onChange={(e) => onUpdateAdminConfig({ bgPosX: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1 bg-black/80 border border-white/20 rounded text-xs text-yellow-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Posição Y (%):</label>
                      <input
                        type="number"
                        step="0.1"
                        value={adminConfig.bgPosY ?? 0}
                        onChange={(e) => onUpdateAdminConfig({ bgPosY: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1 bg-black/80 border border-white/20 rounded text-xs text-yellow-300 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-300 font-bold block mb-1">Zoom do Fundo ({adminConfig.bgZoom || 100}%):</label>
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

                {/* Phone Simulator Scale */}
                <div className="bg-black/50 p-3 rounded-xl border border-red-500/20 space-y-3">
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span>Escala do Celular Simulado</span>
                  </h3>

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-300 mb-1">
                      <span>Tamanho da Tela:</span>
                      <span className="font-mono text-amber-300">{phoneWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="260"
                      max="500"
                      step="10"
                      value={phoneWidth}
                      onChange={(e) => setPhoneWidth(parseInt(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-1.5"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SLOT FRAME & SYMBOL GRID */}
            {activeTab === 'slot' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                
                {/* SPECIAL FEATURE: HIDE GRID / FRAMELESS SYMBOLS */}
                <div className="bg-gradient-to-r from-red-950/80 via-black to-red-950/80 p-3.5 rounded-xl border-2 border-red-500/50 space-y-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
                    <div>
                      <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                        Modo Símbolos Flutuantes (Sem Grade / Sem Caixa)
                      </h3>
                      <p className="text-[10px] text-gray-300">
                        Deixa cada elemento/figura transparente, sem caixas/quadrados/grades, mantendo a animação de rolagem perfeita.
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
                      Remover Grade e Fundo dos Símbolos (Apenas Imagem)
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

                {/* Slot Position Controls */}
                <div className="bg-black/50 p-3 rounded-xl border border-red-500/20 space-y-3">
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                    Posicionamento do Quadro de Slots
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Margem Esquerda (%):</label>
                      <input
                        type="number"
                        step="0.1"
                        value={adminConfig.slotLeft ?? 0}
                        onChange={(e) => onUpdateAdminConfig({ slotLeft: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1 bg-black/80 border border-white/20 rounded text-xs text-amber-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Margem Topo (%):</label>
                      <input
                        type="number"
                        step="0.1"
                        value={adminConfig.slotTop ?? 0}
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
                        step="0.1"
                        value={adminConfig.slotWidth ?? 40}
                        onChange={(e) => onUpdateAdminConfig({ slotWidth: parseFloat(e.target.value) || 40 })}
                        className="w-full px-2 py-1 bg-black/80 border border-white/20 rounded text-xs text-amber-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Altura (%):</label>
                      <input
                        type="number"
                        step="0.1"
                        value={adminConfig.slotHeight ?? 40}
                        onChange={(e) => onUpdateAdminConfig({ slotHeight: parseFloat(e.target.value) || 40 })}
                        className="w-full px-2 py-1 bg-black/80 border border-white/20 rounded text-xs text-amber-300 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* SPIN SPEEDS & TIMING CONTROLS */}
                <div className="bg-black/50 p-3 rounded-xl border border-red-500/20 space-y-3">
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span>Velocidade da Rolagem (Normal / Turbo)</span>
                  </h3>

                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-300 font-bold mb-1">
                        <span>Velocidade Modo Normal:</span>
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
                        <span>Velocidade Modo Turbo:</span>
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
                        <span>Intervalo entre Colunas (Stagger):</span>
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

                {/* CASH CARD RULES & ANIMATION SETTINGS */}
                <div className="bg-black/50 p-3 rounded-xl border border-red-500/20 space-y-3">
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
                        Pagar Carta de Dinheiro Única Isolada (se vier apenas 1 no tabuleiro ela paga seu valor)
                      </span>
                    </label>

                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">
                        Cor da Animação de Ameaça/Antecipação (Última Coluna):
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

                  {/* REGRAS DE ATIVAÇÃO DO BÔNUS & CARTAS SCATTER */}
                  <div className="bg-black/50 p-3 rounded-xl border border-yellow-500/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-yellow-500/20 pb-1.5">
                      <h3 className="text-xs font-black text-yellow-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span>Regras do Bônus & Carta Scatter</span>
                      </h3>
                      <span className="text-[9px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-1.5 py-0.5 rounded font-bold uppercase">
                        Scatter
                      </span>
                    </div>

                    <p className="text-[10px] text-gray-300 leading-snug bg-black/60 p-2 rounded border border-white/5">
                      💡 Quando cair <strong className="text-yellow-300">3 ou a qtd configurada</strong> da Carta Bônus no slot (em qualquer posição, sem precisar de linha), ativa as <strong className="text-emerald-400">Rodadas Grátis</strong>!
                    </p>

                    <div className="space-y-2">
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

                      <div>
                        <label className="text-[10px] text-gray-300 font-bold block mb-1">
                          Qtd Mínima de Cartas no Tabuleiro para Liberar Bônus:
                        </label>
                        <select
                          value={adminConfig.bonusMinCardsCount ?? 3}
                          onChange={(e) => onUpdateAdminConfig({ bonusMinCardsCount: parseInt(e.target.value) })}
                          className="w-full px-2.5 py-1.5 bg-black/80 border border-yellow-500/40 rounded-lg text-xs text-amber-300 font-bold focus:outline-none cursor-pointer"
                        >
                          <option value={2}>2 Cartas Bônus no Tabuleiro</option>
                          <option value={3}>3 Cartas Bônus no Tabuleiro (Padrão)</option>
                          <option value={4}>4 Cartas Bônus no Tabuleiro</option>
                          <option value={5}>5 Cartas Bônus no Tabuleiro</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
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
                            className="w-full px-2 py-1 bg-black/80 border border-white/20 rounded text-xs text-emerald-300 font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-300 font-bold block mb-1">
                            Impulso no Bônus (x):
                          </label>
                          <select
                            value={adminConfig.bonusMultiplierBoost ?? 2}
                            onChange={(e) => onUpdateAdminConfig({ bonusMultiplierBoost: parseFloat(e.target.value) })}
                            className="w-full px-2 py-1 bg-black/80 border border-white/20 rounded text-xs text-yellow-300 font-bold"
                          >
                            <option value={1}>1x</option>
                            <option value={2}>2x</option>
                            <option value={3}>3x</option>
                            <option value={5}>5x</option>
                            <option value={10}>10x</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[10px] text-gray-300 font-bold">Testar Ativação:</span>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateAdminConfig({ forcedOutcome: 'bonus' as any });
                            alert(`🎯 Próximo giro configurado no Designer para soltar ${adminConfig.bonusMinCardsCount ?? 3} Cartas Bônus!`);
                          }}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-black text-[10px] uppercase rounded shadow cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 fill-black" />
                          <span>Soltar Bônus no Giro</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CUSTOM BUTTON CREATOR & STYLES */}
            {activeTab === 'buttons' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                
                {/* Create Button Form */}
                <div className="bg-black/50 p-3.5 rounded-xl border border-red-500/20 space-y-3">
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>Adicionar Novo Botão</span>
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
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Função do Botão:</label>
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
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Forma / Estilo do Botão:</label>
                      <select
                        value={btnShape}
                        onChange={(e) => setBtnShape(e.target.value as any)}
                        className="w-full px-3 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-amber-300 focus:outline-none"
                      >
                        <option value="pill">Pílula Arredondada (Pill)</option>
                        <option value="circle">Círculo Perfeito</option>
                        <option value="square">Quadrado</option>
                        <option value="rounded">Retângulo Arredondado</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Ícone Interno:</label>
                      <select
                        value={btnIcon || 'none'}
                        onChange={(e) => setBtnIcon(e.target.value === 'none' ? undefined : (e.target.value as any))}
                        className="w-full px-3 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-amber-300 focus:outline-none"
                      >
                        <option value="none">Nenhum Ícone</option>
                        <option value="play">Play ▶</option>
                        <option value="zap">Raio Turbo ⚡</option>
                        <option value="repeat">Giro Repetir 🔄</option>
                        <option value="plus">Mais (+)</option>
                        <option value="minus">Menos (-)</option>
                        <option value="volume">Som 🔊</option>
                        <option value="settings">Engrenagem ⚙️</option>
                        <option value="shield">Escudo 🛡️</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">URL de Imagem / Logo Customizada (Opcional):</label>
                      <input
                        type="text"
                        value={btnImageUrl}
                        onChange={(e) => setBtnImageUrl(e.target.value)}
                        placeholder="https://exemplo.com/icone.png"
                        className="w-full px-3 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddButton}
                      className="w-full py-2 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-lg shadow-lg transition cursor-pointer"
                    >
                      + Criar Botão na Tela
                    </button>
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
                          Função: {btn.actionType} | X:{btn.posX}% Y:{btn.posY}%
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveButton(btn.id)}
                        className="p-1.5 bg-red-950/80 hover:bg-red-600 text-red-300 hover:text-white rounded-lg transition cursor-pointer"
                        title="Remover Botão"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: HUD POSITIONS (BALANCE, BET, WIN) */}
            {activeTab === 'hud' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                
                {/* Saldo HUD */}
                <div className="bg-black/50 p-3 rounded-xl border border-red-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">1. Saldo (Balance)</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adminConfig.showBalance ?? true}
                        onChange={(e) => onUpdateAdminConfig({ showBalance: e.target.checked })}
                        className="w-3.5 h-3.5 accent-emerald-500"
                      />
                      <span className="text-[10px] text-gray-300 font-bold">Exibir</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Posição X (%):</label>
                      <input
                        type="number"
                        step="0.1"
                        value={adminConfig.balancePosX ?? 15}
                        onChange={(e) => onUpdateAdminConfig({ balancePosX: parseFloat(e.target.value) || 15 })}
                        className="w-full px-2 py-1 bg-black/80 border border-white/20 rounded text-xs text-emerald-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Posição Y (%):</label>
                      <input
                        type="number"
                        step="0.1"
                        value={adminConfig.balancePosY ?? 8}
                        onChange={(e) => onUpdateAdminConfig({ balancePosY: parseFloat(e.target.value) || 8 })}
                        className="w-full px-2 py-1 bg-black/80 border border-white/20 rounded text-xs text-emerald-300 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Aposta HUD */}
                <div className="bg-black/50 p-3 rounded-xl border border-red-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider">2. Aposta (Bet)</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adminConfig.showBetController ?? true}
                        onChange={(e) => onUpdateAdminConfig({ showBetController: e.target.checked })}
                        className="w-3.5 h-3.5 accent-amber-500"
                      />
                      <span className="text-[10px] text-gray-300 font-bold">Exibir</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Posição X (%):</label>
                      <input
                        type="number"
                        step="0.1"
                        value={adminConfig.betPosX ?? 85}
                        onChange={(e) => onUpdateAdminConfig({ betPosX: parseFloat(e.target.value) || 85 })}
                        className="w-full px-2 py-1 bg-black/80 border border-white/20 rounded text-xs text-amber-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Posição Y (%):</label>
                      <input
                        type="number"
                        step="0.1"
                        value={adminConfig.betPosY ?? 8}
                        onChange={(e) => onUpdateAdminConfig({ betPosY: parseFloat(e.target.value) || 8 })}
                        className="w-full px-2 py-1 bg-black/80 border border-white/20 rounded text-xs text-amber-300 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Banner Vitória HUD */}
                <div className="bg-black/50 p-3 rounded-xl border border-red-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-yellow-400 uppercase tracking-wider">3. Vitória (Win Banner)</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adminConfig.showWinBanner ?? true}
                        onChange={(e) => onUpdateAdminConfig({ showWinBanner: e.target.checked })}
                        className="w-3.5 h-3.5 accent-yellow-500"
                      />
                      <span className="text-[10px] text-gray-300 font-bold">Exibir</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Posição X (%):</label>
                      <input
                        type="number"
                        step="0.1"
                        value={adminConfig.winPosX ?? 50}
                        onChange={(e) => onUpdateAdminConfig({ winPosX: parseFloat(e.target.value) || 50 })}
                        className="w-full px-2 py-1 bg-black/80 border border-white/20 rounded text-xs text-yellow-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Posição Y (%):</label>
                      <input
                        type="number"
                        step="0.1"
                        value={adminConfig.winPosY ?? 82}
                        onChange={(e) => onUpdateAdminConfig({ winPosY: parseFloat(e.target.value) || 82 })}
                        className="w-full px-2 py-1 bg-black/80 border border-white/20 rounded text-xs text-yellow-300 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: CUSTOM TEXTS */}
            {activeTab === 'text' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="bg-black/50 p-3 rounded-xl border border-red-500/20 space-y-3">
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <TypeIcon className="w-4 h-4 text-amber-400" />
                    <span>Adicionar Texto na Tela</span>
                  </h3>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-1">Texto:</label>
                      <input
                        type="text"
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder="Ex: MEGA BÔNUS"
                        className="w-full px-3 py-1.5 bg-black/80 border border-white/20 rounded-lg text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-300 font-bold block mb-1">Tamanho (px):</label>
                        <input
                          type="number"
                          value={newTextSize}
                          onChange={(e) => setNewTextSize(parseInt(e.target.value) || 14)}
                          className="w-full px-2 py-1 bg-black/80 border border-white/20 rounded text-xs text-yellow-300 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-300 font-bold block mb-1">Cor do Texto:</label>
                        <input
                          type="color"
                          value={newTextColor}
                          onChange={(e) => setNewTextColor(e.target.value)}
                          className="w-full h-7 bg-black border border-white/20 rounded cursor-pointer"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddText}
                      className="w-full py-2 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-lg transition cursor-pointer"
                    >
                      + Adicionar Texto no Jogo
                    </button>
                  </div>
                </div>

                {/* List of Custom Texts */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black text-gray-300 uppercase tracking-wider">
                    Textos Adicionados ({adminConfig.customTexts?.length || 0}):
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

            {/* TAB 6: CUSTOM SYMBOLS */}
            {activeTab === 'symbols' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  Símbolos das Rodadas
                </h3>

                {SYMBOL_LIST.map(({ type, label }) => {
                  const currentConfig = adminConfig.customSymbolConfigs?.[type] || { url: adminConfig.customSymbols?.[type] || '' };
                  return (
                    <div key={type} className="bg-black/50 p-2.5 rounded-xl border border-white/10 space-y-1.5">
                      <span className="text-xs font-bold text-yellow-300">{label} ({type})</span>
                      <input
                        type="text"
                        value={currentConfig.url}
                        onChange={(e) => {
                          const url = e.target.value;
                          const updatedSymbols = { ...adminConfig.customSymbols, [type]: url };
                          const updatedConfigs = { 
                            ...adminConfig.customSymbolConfigs, 
                            [type]: { ...currentConfig, url } 
                          };
                          onUpdateAdminConfig({
                            customSymbols: updatedSymbols,
                            customSymbolConfigs: updatedConfigs,
                          });
                        }}
                        placeholder="https://exemplo.com/simbolo.png"
                        className="w-full px-2.5 py-1 bg-black/80 border border-white/20 rounded text-xs text-white focus:outline-none"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Studio Canvas: Interactive Phone Simulator (8 Cols) */}
        <div 
          ref={previewCanvasRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="lg:col-span-8 bg-[#050609] p-4 flex flex-col items-center justify-center relative overflow-hidden select-none"
        >
          
          {/* Subtle Background Studio Grid Pattern */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#1e202e_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />

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

          {/* Interactive Phone Simulator Frame */}
          <div 
            style={{ width: `${phoneWidth}px` }}
            className="relative aspect-[9/16] bg-black rounded-[38px] border-[8px] border-neutral-800 overflow-hidden shadow-[0_0_60px_rgba(239,68,68,0.25)] flex flex-col justify-between z-20 transition-all duration-200"
          >
            {/* Phone Speaker Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-3 bg-neutral-900 rounded-full z-40 flex items-center justify-center">
              <div className="w-8 h-1 bg-neutral-700 rounded-full" />
            </div>

            {/* Background Media */}
            <BackgroundMedia 
              src={adminConfig.bgImage}
              posX={adminConfig.bgPosX}
              posY={adminConfig.bgPosY}
              zoom={adminConfig.bgZoom}
              mediaType={adminConfig.bgMediaType}
            />

            {/* Draggable Slot Frame */}
            <div
              onMouseDown={(e) => handleStartDrag('slot', adminConfig.slotLeft ?? 0, adminConfig.slotTop ?? 0, e.clientX, e.clientY)}
              style={{
                top: `${adminConfig.slotTop ?? 28}%`,
                left: `${adminConfig.slotLeft ?? 4}%`,
                width: `${adminConfig.slotWidth ?? 92}%`,
                height: `${adminConfig.slotHeight ?? 38}%`,
                borderColor: adminConfig.slotHideOuterFrame ? 'transparent' : (adminConfig.slotFrameColor ?? '#ffb700'),
                borderWidth: adminConfig.slotHideOuterFrame ? '0px' : `${adminConfig.slotFrameBorderWidth ?? 4}px`,
                backgroundColor: adminConfig.slotHideOuterFrame ? 'transparent' : (adminConfig.slotFrameBgColor ?? 'rgba(0,0,0,0.65)'),
                borderStyle: adminConfig.slotHideOuterFrame ? 'none' : ((adminConfig.slotFrameBorderWidth ?? 4) > 0 ? 'solid' : 'none'),
                boxShadow: adminConfig.slotHideOuterFrame ? 'none' : '0 10px 35px rgba(0,0,0,0.8)',
              }}
              className="absolute cursor-move z-20 flex items-center justify-center rounded-2xl transition-all p-1 overflow-hidden"
            >
              <div className="w-full h-full pointer-events-none">
                <SlotMachine 
                  isSpinning={gameState.isSpinning} 
                  grid={[
                    ['Castle', 'Sword', 'Diamond', 'Crown', 'Lion'],
                    ['Shield', 'Queen', 'Dragon', 'King', 'Coin'],
                    ['Lion', 'Diamond', 'Castle', 'Sword', 'Crown']
                  ]} 
                  customSymbols={adminConfig.customSymbols}
                  customSymbolConfigs={adminConfig.customSymbolConfigs}
                  slotHideGrid={adminConfig.slotHideGrid}
                  noSlotMargins={adminConfig.noSlotMargins}
                  cashAnticipationColor={adminConfig.cashAnticipationColor ?? 'gold'}
                />
              </div>
            </div>

            {/* Floating Buy Bonus Option */}
            {adminConfig.enableBuyBonus !== false && (
              <div
                style={{
                  position: 'absolute',
                  top: '71%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
                className="z-20 px-3.5 py-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-black font-black text-[10px] rounded-full shadow-[0_4px_15px_rgba(245,158,11,0.4)] border border-yellow-300 uppercase tracking-wider flex items-center gap-1 cursor-pointer pointer-events-none select-none"
              >
                <span>⭐ Comprar Bônus (x{adminConfig.buyBonusMultiplier ?? 50})</span>
              </div>
            )}

            {/* Draggable Spin Button Cluster (Turbo + Spin + Auto) */}
            <div
              onMouseDown={(e) => handleStartDrag('spin', adminConfig.spinLeft ?? 50, 100 - (adminConfig.spinBottom ?? 4), e.clientX, e.clientY)}
              style={{
                bottom: `${adminConfig.spinBottom ?? 4}%`,
                left: `${adminConfig.spinLeft ?? 50}%`,
                transform: `translateX(-50%) scale(${(adminConfig.spinScale ?? 100) / 100})`,
              }}
              className="absolute z-30 cursor-move flex items-center justify-center gap-2 transition-all duration-100 active:scale-95 select-none"
            >
              {/* TURBO BUTTON PREVIEW */}
              <div className="w-9 h-9 rounded-full border border-white/10 bg-black/60 text-gray-400 flex flex-col items-center justify-center shadow-md">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[7px] font-black uppercase leading-none mt-0.5">Turbo</span>
              </div>

              {/* MAIN SPIN BUTTON */}
              <SpinButton 
                onSpin={onSpin} 
                isSpinning={gameState.isSpinning}
                label={adminConfig.spinButtonLabel || 'GIRAR'}
                color={adminConfig.spinButtonColor || 'gold'}
              />

              {/* AUTO SPIN BUTTON PREVIEW */}
              <div className="w-9 h-9 rounded-full border border-white/10 bg-black/60 text-gray-400 flex flex-col items-center justify-center shadow-md">
                <Play className="w-3.5 h-3.5 fill-current text-gray-400" />
                <span className="text-[7px] font-black uppercase leading-none mt-0.5">Auto</span>
              </div>
            </div>

            {/* Draggable Saldo (Balance) HUD */}
            {adminConfig.showBalance !== false && (
              <div
                onMouseDown={(e) => handleStartDrag('balance', adminConfig.balancePosX ?? 15, adminConfig.balancePosY ?? 8, e.clientX, e.clientY)}
                style={{
                  top: `${adminConfig.balancePosY ?? 8}%`,
                  left: `${adminConfig.balancePosX ?? 15}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute z-30 cursor-move flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-[#d4af37]/50 shadow-lg text-white"
              >
                <Coins className="w-3.5 h-3.5 text-yellow-400" />
                <div className="flex flex-col">
                  <span className="text-[8px] text-yellow-500 font-bold uppercase tracking-wider leading-none">Saldo</span>
                  <span className="text-xs font-extrabold text-white leading-tight">
                    R$ {gameState.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            {/* Draggable Aposta (Bet) HUD */}
            {adminConfig.showBetController !== false && (
              <div
                onMouseDown={(e) => handleStartDrag('bet', adminConfig.betPosX ?? 85, adminConfig.betPosY ?? 8, e.clientX, e.clientY)}
                style={{
                  top: `${adminConfig.betPosY ?? 8}%`,
                  left: `${adminConfig.betPosX ?? 85}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute z-30 cursor-move flex items-center bg-black/80 backdrop-blur-md px-2 py-1 rounded-xl border border-[#8b6914]/50 gap-1 shadow-lg text-white"
              >
                <div className="w-4 h-4 rounded bg-[#8b6914]/40 flex items-center justify-center text-white">
                  <Minus className="w-2.5 h-2.5" />
                </div>
                <div className="flex flex-col items-center px-0.5">
                  <span className="text-[8px] text-gray-400 uppercase font-bold leading-none">Aposta</span>
                  <span className="text-xs font-bold text-yellow-300 leading-tight">R$ {gameState.bet.toFixed(2)}</span>
                </div>
                <div className="w-4 h-4 rounded bg-[#8b6914]/40 flex items-center justify-center text-white">
                  <Plus className="w-2.5 h-2.5" />
                </div>
              </div>
            )}

            {/* Draggable Win Banner HUD */}
            {adminConfig.showWinBanner !== false && (
              <div
                onMouseDown={(e) => handleStartDrag('win', adminConfig.winPosX ?? 50, adminConfig.winPosY ?? 82, e.clientX, e.clientY)}
                style={{
                  top: `${adminConfig.winPosY ?? 82}%`,
                  left: `${adminConfig.winPosX ?? 50}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute z-30 w-[85%] bg-gradient-to-r from-yellow-700/90 via-black/95 to-yellow-700/90 border-2 border-yellow-400 p-2 rounded-xl text-center shadow-[0_4px_25px_rgba(251,191,36,0.6)] cursor-move select-none"
              >
                <span className="text-[9px] text-yellow-300 font-extrabold uppercase tracking-widest block leading-none mb-0.5 animate-pulse">
                  Linha Vencedora! (1/3)
                </span>
                <span className="text-xs font-black text-white uppercase block leading-tight">
                  5x Símbolos Combinados
                </span>
                <span className="text-xs font-extrabold text-amber-300 font-mono block leading-none mt-0.5">
                  +R$ 50,00 (x50)
                </span>
              </div>
            )}

            {/* Draggable Custom Buttons */}
            {(adminConfig.customButtons || []).map((btn) => {
              if (!btn.isActive) return null;
              return (
                <div
                  key={btn.id}
                  onMouseDown={(e) => handleStartDrag(`button-${btn.id}`, btn.posX, btn.posY, e.clientX, e.clientY)}
                  style={{
                    left: `${btn.posX}%`,
                    top: `${btn.posY}%`,
                    transform: `translate(-50%, -50%) scale(${(btn.scale || 100) / 100})`,
                  }}
                  className={`absolute z-30 cursor-move font-black text-[10px] uppercase shadow-xl border border-white/20 whitespace-nowrap active:scale-95 transition-transform flex items-center justify-center gap-1.5 ${
                    btn.shape === 'pill'
                      ? 'rounded-full px-3.5 py-1.5'
                      : btn.shape === 'circle'
                      ? 'rounded-full w-10 h-10 p-0 flex items-center justify-center'
                      : 'rounded-xl px-3.5 py-1.5'
                  } ${btn.bgColor || 'bg-gradient-to-r from-amber-500 to-yellow-400'} ${btn.textColor || 'text-black font-black'}`}
                >
                  {btn.icon === 'play' && <Play className="w-3.5 h-3.5 fill-current" />}
                  {btn.icon === 'zap' && <Zap className="w-3.5 h-3.5 fill-current" />}
                  {btn.icon === 'repeat' && <RotateCcw className="w-3.5 h-3.5" />}
                  {btn.icon === 'plus' && <Plus className="w-3.5 h-3.5" />}
                  {btn.icon === 'minus' && <Minus className="w-3.5 h-3.5" />}
                  {btn.icon === 'volume' && <Volume2 className="w-3.5 h-3.5" />}
                  {btn.icon === 'settings' && <Settings className="w-3.5 h-3.5" />}
                  {btn.icon === 'shield' && <Shield className="w-3.5 h-3.5" />}
                  {btn.imageUrl && (
                    <img src={btn.imageUrl} alt="" className="w-4 h-4 object-contain" />
                  )}
                  {btn.shape !== 'circle' && <span>{btn.label}</span>}
                </div>
              );
            })}

            {/* Draggable Custom Texts */}
            {(adminConfig.customTexts || []).map((txt) => {
              if (!txt.isActive) return null;
              return (
                <div
                  key={txt.id}
                  onMouseDown={(e) => handleStartDrag(`text-${txt.id}`, txt.posX, txt.posY, e.clientX, e.clientY)}
                  style={{
                    left: `${txt.posX}%`,
                    top: `${txt.posY}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: `${txt.fontSize}px`,
                    color: txt.color,
                  }}
                  className="absolute z-30 cursor-move font-extrabold shadow-sm select-none whitespace-nowrap"
                >
                  {txt.text}
                </div>
              );
            })}
          </div>

          {/* Floating Instructions Footer */}
          <div className="absolute bottom-3 bg-black/80 backdrop-blur px-4 py-1.5 rounded-full border border-white/10 text-[10px] text-gray-300 font-mono shadow-xl flex items-center gap-2 pointer-events-none">
            <Move className="w-3.5 h-3.5 text-amber-400" />
            <span>Arraste qualquer elemento na tela do celular para ajustar em tempo real</span>
          </div>
        </div>

      </div>
    </div>
  );
};

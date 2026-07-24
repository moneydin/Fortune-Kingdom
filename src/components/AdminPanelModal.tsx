import React, { useState, useRef } from 'react';
import { 
  Shield, X, DollarSign, Activity, Percent, Flame, RefreshCw, Key, 
  AlertTriangle, Image as ImageIcon, Move, LayoutGrid, Upload, Trash2, 
  RotateCcw, Sliders, Eye
} from 'lucide-react';
import { AdminConfig, GameState, SymbolType } from '../types';
import { SlotSymbol } from './SlotSymbol';
import { SlotMachine } from './SlotMachine';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminConfig: AdminConfig;
  onUpdateAdminConfig: (newConfig: Partial<AdminConfig>) => void;
  gameState: GameState;
  onUpdateBalance: (newBalance: number) => void;
  onResetStats: () => void;
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

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  adminConfig,
  onUpdateAdminConfig,
  gameState,
  onUpdateBalance,
  onResetStats,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [pinInput, setPinInput] = useState<string>('');
  const [customBalanceInput, setCustomBalanceInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'metrics' | 'layout' | 'symbols'>('metrics');

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
      slotTop: 32,
      slotLeft: 30,
      slotWidth: 40,
      slotHeight: 40,
      spinBottom: 4,
      spinLeft: 50,
      spinScale: 100,
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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!previewCanvasRef.current) return;
    const rect = previewCanvasRef.current.getBoundingClientRect();

    if (isDraggingBg) {
      const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;
      const newX = Math.max(-100, Math.min(100, Math.round(dragStartRef.current.initialX + deltaX)));
      const newY = Math.max(-100, Math.min(100, Math.round(dragStartRef.current.initialY + deltaY)));
      onUpdateAdminConfig({ bgPosX: newX, bgPosY: newY });
    } else if (isDraggingSlot) {
      const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;
      const newLeft = Math.max(0, Math.min(100 - (adminConfig.slotWidth ?? 40), Math.round(dragStartRef.current.initialX + deltaX)));
      const newTop = Math.max(0, Math.min(100 - (adminConfig.slotHeight ?? 40), Math.round(dragStartRef.current.initialY + deltaY)));
      onUpdateAdminConfig({ slotLeft: newLeft, slotTop: newTop });
    } else if (isResizingSlot) {
      const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;
      const newWidth = Math.max(15, Math.min(90, Math.round(dragStartRef.current.initialWidth + deltaX)));
      const newHeight = Math.max(15, Math.min(90, Math.round(dragStartRef.current.initialHeight + deltaY)));
      onUpdateAdminConfig({ slotWidth: newWidth, slotHeight: newHeight });
    } else if (isDraggingSpin) {
      const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
      const deltaY = ((dragStartRef.current.y - e.clientY) / rect.height) * 100; // inverted Y for bottom
      const newLeft = Math.max(10, Math.min(90, Math.round(dragStartRef.current.initialX + deltaX)));
      const newBottom = Math.max(0, Math.min(80, Math.round(dragStartRef.current.initialY + deltaY)));
      onUpdateAdminConfig({ spinLeft: newLeft, spinBottom: newBottom });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingBg(false);
    setIsDraggingSlot(false);
    setIsResizingSlot(false);
    setIsDraggingSpin(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-gradient-to-b from-[#1a0505] via-[#0f0a14] to-[#050914] border-2 border-red-600/60 rounded-2xl shadow-[0_0_60px_rgba(220,38,38,0.3)] flex flex-col overflow-hidden text-white">
        
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

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/50 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
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
                onClick={() => setActiveTab('symbols')}
                className={`flex-1 min-w-[120px] py-2.5 px-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
                  activeTab === 'symbols'
                    ? 'border-red-500 text-red-400 bg-red-950/20'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Imagens dos Lots</span>
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

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'none', label: 'RNG Normal' },
                        { id: 'normal_win', label: 'Forçar Vitória' },
                        { id: 'big_win', label: 'Forçar Big Win' },
                        { id: 'loss', label: 'Forçar Derrota' },
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
                </div>
              )}

              {/* TAB 2: LAYOUT & BACKGROUND CUSTOMIZATION */}
              {activeTab === 'layout' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-red-300 uppercase tracking-widest flex items-center gap-1.5">
                        <Move className="w-4 h-4 text-red-400" />
                        Editor de Layout & Posicionamento Completo
                      </h3>
                      <p className="text-[11px] text-gray-400">
                        Arraste o fundo, o quadro do slot (e o canto para redimensionar) ou o botão GIRAR na tela abaixo.
                      </p>
                    </div>
                    
                    <button
                      onClick={handleResetLayout}
                      className="px-2.5 py-1.5 bg-black/60 border border-red-800/40 hover:bg-red-950/60 rounded-lg text-xs font-bold text-gray-300 flex items-center gap-1 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                      <span>Restaurar Padrão</span>
                    </button>
                  </div>

                  {/* BACKGROUND UPLOADER / URL INPUT */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/40 p-3 rounded-xl border border-red-900/40">
                    <div>
                      <label className="text-[11px] font-bold text-gray-300 block mb-1">
                        Carregar Nova Imagem de Fundo:
                      </label>
                      <label className="flex items-center justify-center gap-2 p-2 bg-black/60 border border-dashed border-red-700/50 hover:border-red-500 rounded-xl cursor-pointer text-xs font-bold text-red-300 transition">
                        <Upload className="w-4 h-4 text-red-400" />
                        <span>Selecionar Arquivo do Computador</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBgFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-300 block mb-1">
                        ou Cole a URL da Imagem:
                      </label>
                      <input
                        type="text"
                        placeholder="https://exemplo.com/fundo.jpg"
                        value={adminConfig.bgImage}
                        onChange={(e) => onUpdateAdminConfig({ bgImage: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  {/* INTERACTIVE DRAGGABLE & RESIZABLE 16:9 PREVIEW CANVAS */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-300 font-bold">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-yellow-400" />
                        Pré-visualização Interativa (Clique e Arraste Elementos)
                      </span>
                      <span className="text-[10px] text-amber-400 font-mono">
                        [Arraste: Fundo | Quadro Amarelo | Canto p/ Redimensionar | Botão Girar]
                      </span>
                    </div>

                    <div 
                      ref={previewCanvasRef}
                      onMouseDown={handleBgMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      className="relative w-full aspect-video bg-black rounded-2xl border-2 border-red-600/60 overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing select-none"
                    >
                      {/* Background Image Layer */}
                      <div 
                        className="absolute inset-0 bg-cover bg-no-repeat transition-transform duration-75 pointer-events-none"
                        style={{
                          backgroundImage: `url("${adminConfig.bgImage || '/background.jpg'}")`,
                          transform: `translate(${adminConfig.bgPosX || 0}%, ${adminConfig.bgPosY || 0}%) scale(${(adminConfig.bgZoom || 100) / 100})`,
                          transformOrigin: 'center center',
                        }}
                      />

                      {/* Interactive Draggable & Resizable Slot Box Frame */}
                      <div
                        onMouseDown={handleSlotMouseDown}
                        style={{
                          top: `${adminConfig.slotTop ?? 32}%`,
                          left: `${adminConfig.slotLeft ?? 30}%`,
                          width: `${adminConfig.slotWidth ?? 40}%`,
                          height: `${adminConfig.slotHeight ?? 40}%`,
                        }}
                        className="absolute border-2 border-amber-400 bg-black/50 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center cursor-move shadow-[0_0_20px_rgba(251,191,36,0.6)] hover:border-yellow-200 transition-colors z-20 group"
                      >
                        <div className="absolute -top-6 bg-amber-400 text-black px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow pointer-events-none z-30 whitespace-nowrap">
                          Quadro do Slot (Mover)
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
                          className="absolute -bottom-2 -right-2 w-5 h-5 bg-amber-400 hover:bg-yellow-200 border border-black rounded-full cursor-se-resize shadow-lg flex items-center justify-center z-30"
                          title="Arraste para Redimensionar o Slot"
                        >
                          <div className="w-2 h-2 border-r-2 border-b-2 border-black" />
                        </div>
                      </div>

                      {/* Interactive Draggable Spin Button in Canvas */}
                      <div
                        onMouseDown={handleSpinMouseDown}
                        style={{
                          bottom: `${adminConfig.spinBottom ?? 4}%`,
                          left: `${adminConfig.spinLeft ?? 50}%`,
                          transform: `translateX(-50%) scale(${(adminConfig.spinScale ?? 100) / 100})`,
                        }}
                        className="absolute z-20 cursor-move bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 p-2 px-4 rounded-full border-2 border-white shadow-[0_0_15px_rgba(250,204,21,0.8)] text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 hover:scale-105 transition-transform"
                      >
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                        <span>GIRAR (Arraste)</span>
                      </div>

                      {/* Info Badge */}
                      <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur px-2 py-1 rounded text-[10px] text-gray-300 font-mono pointer-events-none z-10">
                        Fundo: X={adminConfig.bgPosX || 0}% Y={adminConfig.bgPosY || 0}% | Slot: W={adminConfig.slotWidth ?? 40}% H={adminConfig.slotHeight ?? 40}% | Girar: Left={adminConfig.spinLeft ?? 50}% Bottom={adminConfig.spinBottom ?? 4}%
                      </div>
                    </div>
                  </div>

                  {/* FINE-TUNING CONTROLS SLIDERS */}
                  <div className="bg-black/40 p-3.5 rounded-xl border border-red-900/40 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Background Controls */}
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                        Fundo (Background)
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-gray-300">
                          <span>Posição X:</span>
                          <span className="font-mono text-yellow-300">{adminConfig.bgPosX || 0}%</span>
                        </div>
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          value={adminConfig.bgPosX || 0}
                          onChange={(e) => onUpdateAdminConfig({ bgPosX: parseInt(e.target.value) })}
                          className="w-full accent-yellow-500 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-gray-300">
                          <span>Posição Y:</span>
                          <span className="font-mono text-yellow-300">{adminConfig.bgPosY || 0}%</span>
                        </div>
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          value={adminConfig.bgPosY || 0}
                          onChange={(e) => onUpdateAdminConfig({ bgPosY: parseInt(e.target.value) })}
                          className="w-full accent-yellow-500 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-gray-300">
                          <span>Zoom Fundo:</span>
                          <span className="font-mono text-yellow-300">{adminConfig.bgZoom || 100}%</span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="200"
                          value={adminConfig.bgZoom || 100}
                          onChange={(e) => onUpdateAdminConfig({ bgZoom: parseInt(e.target.value) })}
                          className="w-full accent-yellow-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Slot Frame Controls */}
                    <div className="space-y-3 border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-3">
                      <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        Quadro do Slot
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-gray-300">
                          <span>Largura Slot:</span>
                          <span className="font-mono text-amber-300">{adminConfig.slotWidth ?? 40}%</span>
                        </div>
                        <input
                          type="range"
                          min="15"
                          max="85"
                          value={adminConfig.slotWidth ?? 40}
                          onChange={(e) => onUpdateAdminConfig({ slotWidth: parseInt(e.target.value) })}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-gray-300">
                          <span>Altura Slot:</span>
                          <span className="font-mono text-amber-300">{adminConfig.slotHeight ?? 40}%</span>
                        </div>
                        <input
                          type="range"
                          min="15"
                          max="85"
                          value={adminConfig.slotHeight ?? 40}
                          onChange={(e) => onUpdateAdminConfig({ slotHeight: parseInt(e.target.value) })}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Spin Button Controls */}
                    <div className="space-y-3 border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-3">
                      <div className="text-xs font-bold text-red-400 uppercase tracking-wider">
                        Botão GIRAR
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-gray-300">
                          <span>Posição X:</span>
                          <span className="font-mono text-red-300">{adminConfig.spinLeft ?? 50}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="90"
                          value={adminConfig.spinLeft ?? 50}
                          onChange={(e) => onUpdateAdminConfig({ spinLeft: parseInt(e.target.value) })}
                          className="w-full accent-red-500 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-gray-300">
                          <span>Posição Y (Inferior):</span>
                          <span className="font-mono text-red-300">{adminConfig.spinBottom ?? 4}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="80"
                          value={adminConfig.spinBottom ?? 4}
                          onChange={(e) => onUpdateAdminConfig({ spinBottom: parseInt(e.target.value) })}
                          className="w-full accent-red-500 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-gray-300">
                          <span>Escala / Tamanho:</span>
                          <span className="font-mono text-red-300">{adminConfig.spinScale ?? 100}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="180"
                          value={adminConfig.spinScale ?? 100}
                          onChange={(e) => onUpdateAdminConfig({ spinScale: parseInt(e.target.value) })}
                          className="w-full accent-red-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CUSTOM SYMBOL IMAGES */}
              {activeTab === 'symbols' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-red-300 uppercase tracking-widest flex items-center gap-1.5">
                        <LayoutGrid className="w-4 h-4 text-red-400" />
                        Imagens dos Lots (Símbolos Sem Margens & Posicionamento)
                      </h3>
                      <p className="text-[11px] text-gray-400">
                        Cada lot possui um tamanho padrão padronizado. Preencha sem margens ou ajuste a posição e zoom de cada imagem.
                      </p>
                    </div>

                    <button
                      onClick={() => onUpdateAdminConfig({ customSymbols: {}, customSymbolConfigs: {} })}
                      className="px-2.5 py-1.5 bg-black/60 border border-red-800/40 hover:bg-red-950/60 rounded-lg text-xs font-bold text-gray-300 flex items-center gap-1 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                      <span>Restaurar Símbolos Padrão</span>
                    </button>
                  </div>

                  {/* SYMBOLS LIST */}
                  <div className="space-y-3">
                    {SYMBOL_NAMES.map(({ type, label }) => {
                      const customImg = adminConfig.customSymbols?.[type];
                      const symConfig = adminConfig.customSymbolConfigs?.[type];

                      return (
                        <div
                          key={type}
                          className="p-3 bg-black/50 border border-red-900/30 rounded-xl hover:border-red-600/50 transition flex flex-col sm:flex-row gap-3 items-start sm:items-center"
                        >
                          {/* Standardized Tile Box Preview (Strict 64x64px standard lot square tile) */}
                          <div className="w-16 h-16 shrink-0 rounded-xl bg-gradient-to-br from-[#2a1a00] to-black border-2 border-[#8b6914] flex items-center justify-center relative shadow-inner overflow-hidden">
                            <SlotSymbol type={type} customImage={customImg} symbolConfig={symConfig} />
                          </div>

                          <div className="flex-1 min-w-0 space-y-2 w-full">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white truncate">{label}</span>
                              <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                                {type}
                              </span>
                            </div>

                            {/* Upload Button or Remove */}
                            <div className="flex items-center gap-2">
                              <label className="flex-1 py-1.5 px-3 bg-black/60 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-300 font-bold flex items-center justify-center gap-1.5 cursor-pointer transition">
                                <Upload className="w-3.5 h-3.5 text-amber-400" />
                                <span>{customImg ? 'Alterar Imagem do Lot' : 'Carregar Imagem para este Lot'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleSymbolFileUpload(type, e)}
                                  className="hidden"
                                />
                              </label>

                              {customImg && (
                                <button
                                  onClick={() => handleRemoveSymbol(type)}
                                  className="p-1.5 bg-red-950/60 border border-red-500/40 hover:bg-red-900 text-red-400 rounded-lg transition cursor-pointer"
                                  title="Remover Imagem Customizada"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>

                            {/* Fine tuning per-symbol position & scale if custom image exists */}
                            {customImg && (
                              <div className="pt-2 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <div>
                                  <div className="text-[10px] text-gray-400 font-bold mb-1">Preenchimento:</div>
                                  <button
                                    onClick={() => handleUpdateSymbolConfig(type, { objectFit: symConfig?.objectFit === 'contain' ? 'cover' : 'contain' })}
                                    className={`w-full py-1 px-2 rounded text-[10px] font-bold border ${
                                      symConfig?.objectFit !== 'contain' 
                                        ? 'bg-amber-900/80 border-amber-500 text-amber-200' 
                                        : 'bg-black/60 border-white/10 text-gray-400'
                                    }`}
                                  >
                                    {symConfig?.objectFit === 'contain' ? 'Centralizado' : 'Sem Margens (Cover)'}
                                  </button>
                                </div>

                                <div>
                                  <div className="text-[10px] text-gray-400 font-bold mb-0.5">Offset X: {symConfig?.offsetX || 0}%</div>
                                  <input
                                    type="range"
                                    min="-50"
                                    max="50"
                                    value={symConfig?.offsetX || 0}
                                    onChange={(e) => handleUpdateSymbolConfig(type, { offsetX: parseInt(e.target.value) })}
                                    className="w-full accent-amber-500 cursor-pointer h-1"
                                  />
                                </div>

                                <div>
                                  <div className="text-[10px] text-gray-400 font-bold mb-0.5">Offset Y: {symConfig?.offsetY || 0}%</div>
                                  <input
                                    type="range"
                                    min="-50"
                                    max="50"
                                    value={symConfig?.offsetY || 0}
                                    onChange={(e) => handleUpdateSymbolConfig(type, { offsetY: parseInt(e.target.value) })}
                                    className="w-full accent-amber-500 cursor-pointer h-1"
                                  />
                                </div>

                                <div>
                                  <div className="text-[10px] text-gray-400 font-bold mb-0.5">Zoom Lot: {symConfig?.scale || 100}%</div>
                                  <input
                                    type="range"
                                    min="50"
                                    max="200"
                                    value={symConfig?.scale || 100}
                                    onChange={(e) => handleUpdateSymbolConfig(type, { scale: parseInt(e.target.value) })}
                                    className="w-full accent-amber-500 cursor-pointer h-1"
                                  />
                                </div>
                              </div>
                            )}

                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
};

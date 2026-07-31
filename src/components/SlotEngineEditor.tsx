import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit3, Save, Layout, Grid, Dices, Check, X, 
  HelpCircle, Sliders, Play, Settings, RefreshCw, Layers, Award, Upload
} from 'lucide-react';
import { 
  SlotSymbolConfig, PaylineConfig, SlotEngineConfig, 
  getBoardDimensions, generateBoardGrid, evaluateBoardWins 
} from '../slotEngine';

import { AdminConfig } from '../types';

import { BoardType, SpinRollStyle } from '../types';

interface SlotEngineEditorProps {
  engineConfig: SlotEngineConfig;
  onUpdateEngineConfig: (newConfig: SlotEngineConfig) => void;
  adminConfig: AdminConfig;
  onUpdateAdminConfig: (newConfig: Partial<AdminConfig>) => void;
}

export const SlotEngineEditor: React.FC<SlotEngineEditorProps> = ({
  engineConfig,
  onUpdateEngineConfig,
  adminConfig,
  onUpdateAdminConfig,
}) => {
  const [editorTab, setEditorTab] = useState<'symbols' | 'paylines' | 'settings'>('symbols');
  const [symbols, setSymbols] = useState<SlotSymbolConfig[]>([]);
  const [paylines, setPaylines] = useState<PaylineConfig[]>([]);
  const [boardType, setBoardType] = useState<BoardType>('5x3');
  const [targetRtp, setTargetRtp] = useState<number>(96.5);

  // Symbol form state
  const [editingSymbolId, setEditingSymbolId] = useState<string | null>(null);
  const [symId, setSymId] = useState('');
  const [symName, setSymName] = useState('');
  const [symImage, setSymImage] = useState('🪙');
  const [symWeight, setSymWeight] = useState(50);
  const [payout3, setPayout3] = useState(2);
  const [payout4, setPayout4] = useState(5);
  const [payout5, setPayout5] = useState(10);
  const [symFullScreenMultiplier, setSymFullScreenMultiplier] = useState<number>(0);
  const [symFullScreenMedia, setSymFullScreenMedia] = useState('');
  const [symIsActive, setSymIsActive] = useState(true);

  // Payline form state
  const [editingPaylineId, setEditingPaylineId] = useState<string | null>(null);
  const [paylineId, setPaylineId] = useState('');
  const [paylineName, setPaylineName] = useState('');
  const [paylineCoords, setPaylineCoords] = useState<{ col: number; row: number }[]>([]);
  const [paylineIsActive, setPaylineIsActive] = useState(true);

  // Simulation Tool State
  const [simRunning, setSimRunning] = useState(false);
  const [simSpinsCount, setSimSpinsCount] = useState(10000);
  const [simResults, setSimResults] = useState<{
    totalSpins: number;
    totalBet: number;
    totalWin: number;
    measuredRtp: number;
    hitRate: number;
    totalWinSpins: number;
    symbolHitCounts: Record<string, number>;
    paylineHitCounts: Record<string, number>;
  } | null>(null);

  // Deletion confirmation state to bypass blocked/unsafe window.confirm in iframe
  const [confirmingDeleteSymId, setConfirmingDeleteSymId] = useState<string | null>(null);
  const [confirmingDeletePaylineId, setConfirmingDeletePaylineId] = useState<string | null>(null);
  const [newMultiplierInput, setNewMultiplierInput] = useState('');

  // Sync state from props
  useEffect(() => {
    setSymbols(engineConfig.symbols);
    setPaylines(engineConfig.paylines);
    setBoardType(engineConfig.boardType);
    setTargetRtp(engineConfig.targetRtp);
  }, [engineConfig]);

  const saveConfigChange = (updated: Partial<SlotEngineConfig>) => {
    const nextConfig: SlotEngineConfig = {
      boardType: updated.boardType !== undefined ? updated.boardType : boardType,
      symbols: updated.symbols !== undefined ? updated.symbols : symbols,
      paylines: updated.paylines !== undefined ? updated.paylines : paylines,
      targetRtp: updated.targetRtp !== undefined ? updated.targetRtp : targetRtp,
    };
    onUpdateEngineConfig(nextConfig);
  };

  // ---------------------------------------------------------
  // SYMBOL ACTIONS
  // ---------------------------------------------------------
  const startCreateSymbol = () => {
    setEditingSymbolId('new');
    setSymId('');
    setSymName('');
    setSymImage('🍒');
    setSymWeight(50);
    setPayout3(2);
    setPayout4(5);
    setPayout5(10);
    setSymFullScreenMultiplier(0);
    setSymFullScreenMedia('');
    setSymIsActive(true);
  };

  const startEditSymbol = (sym: SlotSymbolConfig) => {
    setEditingSymbolId(sym.id);
    setSymId(sym.id);
    setSymName(sym.name);
    setSymImage(sym.image);
    setSymWeight(sym.weight);
    setPayout3(sym.payouts[3] || 0);
    setPayout4(sym.payouts[4] || 0);
    setPayout5(sym.payouts[5] || 0);
    setSymFullScreenMultiplier(sym.fullScreenMultiplier || 0);
    setSymFullScreenMedia(sym.fullScreenMedia || '');
    setSymIsActive(sym.isActive);
  };

  const handleSymbolImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          setSymImage(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCashMultiplierImageUpload = (multiplier: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          const currentImages = adminConfig.customCashImages || {};
          const updatedImages = { ...currentImages, [multiplier]: event.target.result };
          onUpdateAdminConfig({ customCashImages: updatedImages });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCashMultiplier = (multiplier: number) => {
    const currentMultipliers = adminConfig.customCashMultipliers || [1, 2, 5, 10, 20, 50, 100];
    let nextMultipliers: number[];
    if (currentMultipliers.includes(multiplier)) {
      nextMultipliers = currentMultipliers.filter(m => m !== multiplier);
    } else {
      nextMultipliers = [...currentMultipliers, multiplier].sort((a, b) => a - b);
    }
    onUpdateAdminConfig({ customCashMultipliers: nextMultipliers });
  };

  const clearCashMultiplierImage = (multiplier: number) => {
    const currentImages = { ...(adminConfig.customCashImages || {}) };
    delete currentImages[multiplier];
    onUpdateAdminConfig({ customCashImages: currentImages });
  };

  const saveSymbol = () => {
    if (!symId.trim() || !symName.trim()) {
      alert('Por favor, preencha o ID e o Nome do Símbolo.');
      return;
    }

    const payload: SlotSymbolConfig = {
      id: symId.trim().toLowerCase(),
      name: symName.trim(),
      image: symImage,
      weight: Math.max(1, symWeight),
      payouts: {
        3: Math.max(0, payout3),
        4: Math.max(0, payout4),
        5: Math.max(0, payout5),
      },
      fullScreenMultiplier: symFullScreenMultiplier > 0 ? symFullScreenMultiplier : undefined,
      fullScreenMedia: symFullScreenMedia.trim() ? symFullScreenMedia.trim() : undefined,
      isActive: symIsActive,
    };

    let nextSymbols: SlotSymbolConfig[];
    if (editingSymbolId === 'new') {
      // Check duplicate ID
      if (symbols.some(s => s.id === payload.id)) {
        alert('Este ID de Símbolo já existe!');
        return;
      }
      nextSymbols = [...symbols, payload];
    } else {
      nextSymbols = symbols.map(s => s.id === editingSymbolId ? payload : s);
    }

    setSymbols(nextSymbols);
    setEditingSymbolId(null);
    saveConfigChange({ symbols: nextSymbols });
  };

  const deleteSymbol = (id: string) => {
    const nextSymbols = symbols.filter(s => s.id !== id);
    setSymbols(nextSymbols);
    saveConfigChange({ symbols: nextSymbols });
    setConfirmingDeleteSymId(null);
  };

  // ---------------------------------------------------------
  // PAYLINE ACTIONS & PAINTER
  // ---------------------------------------------------------
  const startCreatePayline = () => {
    setEditingPaylineId('new');
    setPaylineId('');
    setPaylineName('');
    setPaylineCoords([]);
    setPaylineIsActive(true);
  };

  const startEditPayline = (line: PaylineConfig) => {
    setEditingPaylineId(line.id);
    setPaylineId(line.id);
    setPaylineName(line.name);
    setPaylineCoords([...line.coordinates]);
    setPaylineIsActive(line.isActive);
  };

  const togglePainterCoord = (col: number, row: number) => {
    const exists = paylineCoords.some(c => c.col === col && c.row === row);
    let nextCoords: { col: number; row: number }[];
    if (exists) {
      nextCoords = paylineCoords.filter(c => !(c.col === col && c.row === row));
    } else {
      // Ensure col order matches
      nextCoords = [...paylineCoords, { col, row }].sort((a, b) => a.col - b.col || a.row - b.row);
    }
    setPaylineCoords(nextCoords);
  };

  const savePayline = () => {
    if (!paylineId.trim() || !paylineName.trim()) {
      alert('Por favor, preencha o ID e o Nome da Payline.');
      return;
    }
    if (paylineCoords.length === 0) {
      alert('Desenhe a Payline selecionando as células no seletor visual abaixo.');
      return;
    }

    const payload: PaylineConfig = {
      id: paylineId.trim().toLowerCase(),
      name: paylineName.trim(),
      coordinates: paylineCoords,
      isActive: paylineIsActive,
    };

    let nextPaylines: PaylineConfig[];
    if (editingPaylineId === 'new') {
      if (paylines.some(p => p.id === payload.id)) {
        alert('Este ID de Payline já existe!');
        return;
      }
      nextPaylines = [...paylines, payload];
    } else {
      nextPaylines = paylines.map(p => p.id === editingPaylineId ? payload : p);
    }

    setPaylines(nextPaylines);
    setEditingPaylineId(null);
    saveConfigChange({ paylines: nextPaylines });
  };

  const deletePayline = (id: string) => {
    const nextPaylines = paylines.filter(p => p.id !== id);
    setPaylines(nextPaylines);
    saveConfigChange({ paylines: nextPaylines });
    setConfirmingDeletePaylineId(null);
  };

  // ---------------------------------------------------------
  // RUN ADVANCED RTP & HIT RATE SIMULATION
  // ---------------------------------------------------------
  const runRtpSimulation = () => {
    setSimRunning(true);
    setSimResults(null);

    // Run async-ish to keep UI fluid
    setTimeout(() => {
      const activeSyms = symbols.filter(s => s.isActive);
      if (activeSyms.length === 0) {
        alert('Por favor, ative pelo menos um símbolo antes de simular!');
        setSimRunning(false);
        return;
      }

      const activeLines = paylines.filter(p => p.isActive);
      const betSize = 1;
      let totalBet = 0;
      let totalWin = 0;
      let winSpins = 0;

      const symbolHitCounts: Record<string, number> = {};
      const paylineHitCounts: Record<string, number> = {};

      activeSyms.forEach(s => { symbolHitCounts[s.id] = 0; });
      activeLines.forEach(l => { paylineHitCounts[l.id] = 0; });

      for (let s = 0; s < simSpinsCount; s++) {
        // 1. Roll board
        const grid = generateBoardGrid(boardType, symbols);
        totalBet += betSize;

        // 2. Evaluate
        const evaluation = evaluateBoardWins(grid, boardType, symbols, paylines, betSize);

        if (evaluation.winningLines.length > 0) {
          totalWin += evaluation.totalPayoutAmount;
          winSpins++;

          evaluation.winningLines.forEach(line => {
            symbolHitCounts[line.symbolId] = (symbolHitCounts[line.symbolId] || 0) + 1;
            paylineHitCounts[line.paylineId] = (paylineHitCounts[line.paylineId] || 0) + 1;
          });
        }
      }

      setSimResults({
        totalSpins: simSpinsCount,
        totalBet,
        totalWin,
        measuredRtp: totalBet > 0 ? (totalWin / totalBet) * 100 : 0,
        hitRate: simSpinsCount > 0 ? (winSpins / simSpinsCount) * 100 : 0,
        totalWinSpins: winSpins,
        symbolHitCounts,
        paylineHitCounts,
      });
      setSimRunning(false);
    }, 150);
  };

  const { cols: gridCols, rows: gridRows } = getBoardDimensions(boardType);

  return (
    <div className="space-y-4">
      {/* Visual Header / Banner */}
      <div className="bg-gradient-to-r from-red-950/80 via-black/90 to-red-950/80 p-3 sm:p-4 rounded-xl border border-red-800/30 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500 animate-pulse" />
            <h3 className="text-sm sm:text-base font-black text-amber-200 uppercase tracking-widest">
              Motor Matemático Slot Casino v2.0
            </h3>
          </div>
          <p className="text-[11px] text-gray-400">
            Arquitetura escalável de rolos independentes com RTP auditável e paylines customizáveis.
          </p>
        </div>
        
        <span className="text-xs px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg font-bold font-mono">
          RTP Alvo: {targetRtp}%
        </span>
      </div>

      {/* Selector Tabs */}
      <div className="flex bg-black/40 p-1 rounded-lg border border-red-950/60 max-w-md">
        <button
          onClick={() => { setEditorTab('symbols'); setEditingSymbolId(null); }}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition flex items-center justify-center gap-1.5 ${
            editorTab === 'symbols' ? 'bg-red-800 text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Símbolos ({symbols.length})</span>
        </button>

        <button
          onClick={() => { setEditorTab('paylines'); setEditingPaylineId(null); }}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition flex items-center justify-center gap-1.5 ${
            editorTab === 'paylines' ? 'bg-red-800 text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Paylines ({paylines.length})</span>
        </button>

        <button
          onClick={() => { setEditorTab('settings'); }}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition flex items-center justify-center gap-1.5 ${
            editorTab === 'settings' ? 'bg-red-800 text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Configuração & Simulador</span>
        </button>
      </div>

      {/* -------------------------------------------------------------
          TAB 1: SYMBOLS EDITOR 
          ------------------------------------------------------------- */}
      {editorTab === 'symbols' && (
        <div className="space-y-4">
          {editingSymbolId ? (
            editingSymbolId === 'cash' ? (
              /* SPECIAL CASH CONFIGURATION FORM */
              <div className="bg-black/60 p-4 rounded-xl border border-red-900/40 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                      💵 Configurar Dinheiro (Cash Collect)
                    </span>
                  </div>
                  <button 
                    onClick={() => setEditingSymbolId(null)}
                    className="p-1 hover:bg-white/10 rounded transition text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left Column: Basic configuration */}
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold block mb-1">ID DO SÍMBOLO:</label>
                      <input
                        type="text"
                        disabled
                        value="cash"
                        className="w-full px-3 py-1.5 bg-black/80 border border-white/10 rounded-lg text-xs font-mono text-gray-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 font-bold block mb-1">NOME DO SÍMBOLO:</label>
                      <input
                        type="text"
                        value={symName}
                        onChange={(e) => setSymName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-black/80 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 font-bold block mb-1">PESO DE APARIÇÃO:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={symWeight}
                          onChange={(e) => setSymWeight(parseInt(e.target.value))}
                          className="flex-1 accent-emerald-500"
                        />
                        <span className="w-8 text-center text-xs font-mono font-bold text-emerald-300">{symWeight}</span>
                      </div>
                    </div>

                    {/* STATUS ACTIVE/INACTIVE */}
                    <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5 mt-2">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-gray-200">Símbolo Ativo</span>
                        <p className="text-[9px] text-gray-500">Se desativado, o dinheiro nunca será sorteado.</p>
                      </div>
                      <button
                        onClick={() => setSymIsActive(!symIsActive)}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors ${symIsActive ? 'bg-emerald-600' : 'bg-gray-800'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white transition-transform transform ${symIsActive ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Active values */}
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-gray-200">Valores Ativos (Multiplicadores)</span>
                        <p className="text-[9px] text-gray-400 font-sans">Escolha quais valores de aposta podem vir nas cartas de dinheiro.</p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                        {(() => {
                          const defaultChoices = [0.5, 1, 2, 3, 5, 10, 20, 50, 100];
                          const activeMultipliers = adminConfig.customCashMultipliers || [1, 2, 5, 10, 20, 50, 100];
                          const allAvailableChoices = Array.from(new Set([...defaultChoices, ...activeMultipliers])).sort((a, b) => a - b);

                          return allAvailableChoices.map((val) => {
                            const isActive = activeMultipliers.includes(val);
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => toggleCashMultiplier(val)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black transition-all ${
                                  isActive
                                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40'
                                    : 'bg-neutral-900 text-gray-500 border border-transparent hover:border-white/10'
                                }`}
                              >
                                x{val}
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 space-y-2">
                      <label className="text-[9px] text-gray-400 font-bold block">ADICIONAR VALOR PERSONALIZADO:</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Ex: 0.5, 3, 15, 200"
                          value={newMultiplierInput}
                          onChange={(e) => setNewMultiplierInput(e.target.value)}
                          className="flex-1 px-2.5 py-1 bg-black/50 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const parsed = parseFloat(newMultiplierInput.replace(',', '.'));
                            if (!isNaN(parsed) && parsed > 0) {
                              const activeMultipliers = adminConfig.customCashMultipliers || [1, 2, 5, 10, 20, 50, 100];
                              if (!activeMultipliers.includes(parsed)) {
                                const next = [...activeMultipliers, parsed].sort((a, b) => a - b);
                                onUpdateAdminConfig({ customCashMultipliers: next });
                              }
                              setNewMultiplierInput('');
                            }
                          }}
                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-xs font-bold text-white transition"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* IMAGE UPLOADS PER ACTIVE MULTIPLIER */}
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-yellow-400 font-sans">Imagens por Valor</span>
                    <p className="text-[9px] text-gray-400">Faça o upload de uma imagem específica para cada multiplicador de dinheiro ativo.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[160px] overflow-y-auto pr-1 no-scrollbar">
                    {(adminConfig.customCashMultipliers || [1, 2, 5, 10, 20, 50, 100]).map((val) => {
                      const uploadedImg = adminConfig.customCashImages?.[val];
                      return (
                        <div key={val} className="p-2 bg-black/60 rounded-xl border border-white/5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            {/* Preview box */}
                            <div className="w-8 h-8 rounded bg-neutral-900 border border-emerald-500/20 flex items-center justify-center text-xs overflow-hidden shrink-0">
                              {uploadedImg ? (
                                <img src={uploadedImg} alt={`x${val}`} className="w-full h-full object-contain" />
                              ) : (
                                <span className="font-mono text-gray-500 text-[10px]">💵</span>
                              )}
                            </div>
                            <span className="text-xs font-mono font-black text-white">x{val}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <label className="p-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/20 rounded-lg text-[10px] text-emerald-300 font-bold transition flex items-center gap-1 cursor-pointer">
                              <Upload className="w-3 h-3" />
                              <span>Upload</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleCashMultiplierImageUpload(val, e)}
                                className="hidden"
                              />
                            </label>
                            {uploadedImg && (
                              <button
                                onClick={() => clearCashMultiplierImage(val)}
                                className="p-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/20 rounded-lg text-red-400 transition"
                                title="Limpar Imagem"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => setEditingSymbolId(null)}
                    className="px-4 py-1.5 bg-neutral-900 border border-white/10 hover:bg-neutral-800 rounded-lg text-xs font-bold text-gray-300 transition cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => {
                      const payload: SlotSymbolConfig = {
                        id: 'cash',
                        name: symName.trim() || 'Dinheiro',
                        image: '💵',
                        weight: Math.max(1, symWeight),
                        payouts: {},
                        fullScreenMultiplier: 0,
                        isActive: symIsActive,
                      };
                      const nextSymbols = symbols.map(s => s.id === 'cash' ? payload : s);
                      setSymbols(nextSymbols);
                      setEditingSymbolId(null);
                      saveConfigChange({ symbols: nextSymbols });
                    }}
                    className="px-5 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-xs font-black text-white flex items-center gap-1 transition cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar Configuração</span>
                  </button>
                </div>
              </div>
            ) : (
              /* SYMBOL FORM */
              <div className="bg-black/60 p-4 rounded-xl border border-red-900/40 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
                  {editingSymbolId === 'new' ? '✨ Criar Novo Símbolo' : `✏️ Editar Símbolo: ${editingSymbolId}`}
                </span>
                <button 
                  onClick={() => setEditingSymbolId(null)}
                  className="p-1 hover:bg-white/10 rounded transition text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold block mb-1">ID ÚNICO DO SÍMBOLO (Sem espaços):</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      disabled={editingSymbolId !== 'new'}
                      placeholder="ex: cherry, gold_coin"
                      value={symId}
                      onChange={(e) => setSymId(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      className="flex-1 min-w-0 px-3 py-1.5 bg-black/80 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-red-500 disabled:opacity-50"
                    />
                    {editingSymbolId === 'new' && (
                      <button
                        type="button"
                        onClick={() => {
                          let newId = '';
                          do {
                            newId = 'sym_' + Math.random().toString(36).substring(2, 8);
                          } while (symbols.some(s => s.id === newId));
                          setSymId(newId);
                        }}
                        className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                        title="Gerar ID Aleatório Único"
                      >
                        <Dices className="w-3.5 h-3.5" />
                        <span>Gerar ID</span>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-bold block mb-1">NOME DO SÍMBOLO:</label>
                  <input
                    type="text"
                    placeholder="ex: Cereja Silvestre"
                    value={symName}
                    onChange={(e) => setSymName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-black/80 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-gray-400 font-bold block">VISUAL / EMOJI (Ou URL da Imagem):</label>
                    {symImage && (
                      <div className="w-6 h-6 rounded bg-neutral-900 border border-amber-500/30 flex items-center justify-center text-sm overflow-hidden shadow-inner">
                        {symImage.startsWith('http') || symImage.startsWith('data:') ? (
                          <img src={symImage} alt="Preview" className="w-full h-full object-contain" />
                        ) : (
                          symImage
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="ex: 🍒 ou emoji / URL"
                      value={symImage}
                      onChange={(e) => setSymImage(e.target.value)}
                      className="flex-1 min-w-0 px-3 py-1.5 bg-black/80 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                    />
                    <label className="px-2.5 py-1.5 bg-red-900/60 hover:bg-red-800/80 border border-red-500/30 rounded-lg text-xs font-bold text-red-200 transition flex items-center gap-1 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSymbolImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-bold block mb-1">PESO DE APARIÇÃO (Probabilidade):</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={symWeight}
                      onChange={(e) => setSymWeight(parseInt(e.target.value))}
                      className="flex-1 accent-red-600"
                    />
                    <span className="w-8 text-center text-xs font-mono font-bold text-amber-300">{symWeight}</span>
                  </div>
                </div>
              </div>

              {/* PAYOUT MULTIPLIERS FOR MATCHES */}
              <div className="bg-black/40 p-3 rounded-lg border border-white/5 space-y-2.5">
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                  Tabela de Pagamentos (Multiplicadores por nº de Símbolos Iguais)
                </span>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9px] text-gray-400 font-bold block mb-1">3 Símbolos:</label>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-1.5">x</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={payout3}
                        onChange={(e) => setPayout3(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1 bg-black border border-white/10 rounded text-xs font-mono text-center text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] text-gray-400 font-bold block mb-1">4 Símbolos:</label>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-1.5">x</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={payout4}
                        onChange={(e) => setPayout4(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1 bg-black border border-white/10 rounded text-xs font-mono text-center text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] text-gray-400 font-bold block mb-1">5 Símbolos:</label>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-1.5">x</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={payout5}
                        onChange={(e) => setPayout5(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1 bg-black border border-white/10 rounded text-xs font-mono text-center text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SPECIAL FULL SCREEN MULTIPLIER (BIG WIN) */}
              <div className="bg-black/40 p-3 rounded-lg border border-white/5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                      Multiplicador Especial de Tela Cheia (Big Win)
                    </span>
                    <p className="text-[9px] text-gray-400">
                      Se o tabuleiro inteiro vier completo APENAS com este símbolo, paga este multiplicador de aposta extra.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 w-full sm:w-28 shrink-0">
                    <span className="text-xs text-gray-500">x</span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={symFullScreenMultiplier}
                      onChange={(e) => setSymFullScreenMultiplier(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-2.5 py-1 bg-black border border-white/10 rounded text-xs font-mono text-center text-white"
                      placeholder="ex: 10"
                    />
                  </div>
                </div>

                <div className="border-t border-white/5 pt-2.5 space-y-1">
                  <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                    Link de Imagem ou Vídeo de Tela Cheia
                  </span>
                  <p className="text-[9px] text-gray-400">
                    Insira a URL de uma imagem ou link de vídeo (YouTube ou MP4 direto) que preencherá o layout na tela cheia deste símbolo.
                  </p>
                  <input
                    type="text"
                    value={symFullScreenMedia}
                    onChange={(e) => setSymFullScreenMedia(e.target.value)}
                    className="w-full px-2.5 py-1 bg-black border border-white/10 rounded text-xs text-white"
                    placeholder="ex: https://dominio.com/video.mp4 ou imagem.jpg"
                  />
                </div>
              </div>

              {/* ACTIVE SWITCH */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-gray-300">Símbolo Ativo no Motor</span>
                  <p className="text-[9px] text-gray-500">Se desativado, o símbolo nunca será sorteado nos rolos.</p>
                </div>
                <button
                  onClick={() => setSymIsActive(!symIsActive)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors ${symIsActive ? 'bg-red-600' : 'bg-gray-800'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform transform ${symIsActive ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => setEditingSymbolId(null)}
                  className="px-3.5 py-1.5 bg-neutral-900 border border-white/10 hover:bg-neutral-800 rounded-lg text-xs font-bold text-gray-300 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveSymbol}
                  className="px-4 py-1.5 bg-red-800 hover:bg-red-700 rounded-lg text-xs font-bold text-white flex items-center gap-1 transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Símbolo</span>
                </button>
              </div>
            </div>
          )
        ) : (
          /* SYMBOL LIST VIEW */
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Total cadastrado: <b>{symbols.length}</b></span>
                <button
                  onClick={startCreateSymbol}
                  className="py-1 px-2.5 bg-red-800 hover:bg-red-700 rounded-lg text-xs font-black flex items-center gap-1 text-white transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Criar Símbolo</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
                {symbols.map(sym => (
                  <div
                    key={sym.id}
                    className={`p-3 bg-black/50 border rounded-xl flex items-center justify-between gap-3 hover:border-red-600/50 transition-all ${
                      sym.isActive ? 'border-red-950/40' : 'border-dashed border-gray-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Visual Avatar Square */}
                      <div className="w-10 h-10 rounded-lg bg-neutral-900/90 border border-amber-600/30 flex items-center justify-center text-xl shadow-inner select-none">
                        {sym.image.startsWith('http') || sym.image.startsWith('data:') ? (
                          <img src={sym.image} alt={sym.name} className="w-8 h-8 object-contain rounded" />
                        ) : (
                          sym.image
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white leading-none">{sym.name}</span>
                          <span className="text-[8px] font-mono font-bold px-1 py-0.5 bg-neutral-800 rounded text-gray-400">
                            {sym.id}
                          </span>
                        </div>
                        <div className="text-[9px] text-gray-400 leading-none flex flex-wrap gap-x-1.5 gap-y-0.5 items-center">
                          <span>Peso: <span className="font-mono text-amber-400 font-bold">{sym.weight}</span></span>
                          <span className="text-gray-600">|</span>
                          <span>Pagam.: <span className="font-mono text-emerald-400 font-bold">3x={sym.payouts[3] || 0} / 5x={sym.payouts[5] || 0}</span></span>
                          {sym.fullScreenMultiplier && sym.fullScreenMultiplier > 0 ? (
                            <>
                              <span className="text-gray-600">|</span>
                              <span className="text-yellow-400 font-bold">Tela Cheia: <span className="font-mono">x{sym.fullScreenMultiplier}</span></span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEditSymbol(sym)}
                        className="p-1.5 bg-neutral-950/60 border border-white/5 hover:bg-neutral-900 text-gray-300 hover:text-white rounded-lg transition cursor-pointer"
                        title="Editar Símbolo"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      
                      {confirmingDeleteSymId === sym.id ? (
                        <div className="flex items-center gap-1 bg-red-950/90 border border-red-500/40 rounded-lg p-0.5 animate-in fade-in zoom-in-95 duration-150">
                          <button
                            onClick={() => deleteSymbol(sym.id)}
                            className="px-2 py-1 bg-red-700 hover:bg-red-600 text-white rounded text-[10px] font-black transition cursor-pointer leading-none"
                            title="Confirmar Exclusão"
                          >
                            Sim
                          </button>
                          <button
                            onClick={() => setConfirmingDeleteSymId(null)}
                            className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-gray-300 rounded text-[10px] font-black transition cursor-pointer leading-none"
                            title="Cancelar"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingDeleteSymId(sym.id)}
                          className="p-1.5 bg-neutral-950/60 border border-white/5 hover:bg-red-950 hover:text-red-400 text-gray-400 rounded-lg transition cursor-pointer"
                          title="Excluir Símbolo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 2: PAYLINE EDITOR & PAINTER 
          ------------------------------------------------------------- */}
      {editorTab === 'paylines' && (
        <div className="space-y-4">
          {editingPaylineId ? (
            /* PAYLINE FORM WITH INTERACTIVE PAINTER GRID */
            <div className="bg-black/60 p-4 rounded-xl border border-red-900/40 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
                  {editingPaylineId === 'new' ? '✨ Criar Nova Payline' : `✏️ Editar Payline: ${editingPaylineId}`}
                </span>
                <button 
                  onClick={() => setEditingPaylineId(null)}
                  className="p-1 hover:bg-white/10 rounded transition text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold block mb-1">ID DA PAYLINE (Único, sem espaços):</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      disabled={editingPaylineId !== 'new'}
                      placeholder="ex: diagonal_descendente"
                      value={paylineId}
                      onChange={(e) => setPaylineId(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      className="flex-1 min-w-0 px-3 py-1.5 bg-black/80 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-red-500 disabled:opacity-50"
                    />
                    {editingPaylineId === 'new' && (
                      <button
                        type="button"
                        onClick={() => {
                          let newId = '';
                          do {
                            newId = 'line_' + Math.random().toString(36).substring(2, 8);
                          } while (paylines.some(p => p.id === newId));
                          setPaylineId(newId);
                        }}
                        className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                        title="Gerar ID Aleatório Único"
                      >
                        <Dices className="w-3.5 h-3.5" />
                        <span>Gerar ID</span>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-bold block mb-1">NOME DA LINHA:</label>
                  <input
                    type="text"
                    placeholder="ex: Diagonal Principal"
                    value={paylineName}
                    onChange={(e) => setPaylineName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-black/80 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* PAINTER CANVAS BOX */}
              <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5 text-amber-400" />
                    Pintor de Coordenadas Visual ({boardType})
                  </span>
                  <span className="text-[9px] text-gray-400">
                    Clique nas células para pintar a payline. Coordenadas: <b>{paylineCoords.length}</b>
                  </span>
                </div>

                {/* Grid Visual representation */}
                <div className="flex justify-center p-2 bg-neutral-950/80 rounded-lg border border-white/5 overflow-x-auto no-scrollbar">
                  <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(45px, 1fr))` }}>
                    {Array.from({ length: gridRows }).map((_, rIndex) => (
                      <React.Fragment key={rIndex}>
                        {Array.from({ length: gridCols }).map((_, cIndex) => {
                          const isSelected = paylineCoords.some(c => c.col === cIndex && c.row === rIndex);
                          return (
                            <button
                              key={`${cIndex}-${rIndex}`}
                              onClick={() => togglePainterCoord(cIndex, rIndex)}
                              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg flex flex-col items-center justify-center transition border font-mono text-[9px] cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-500 border-amber-300 text-black font-extrabold shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                                  : 'bg-black/60 border-neutral-800 text-gray-500 hover:border-neutral-600'
                              }`}
                            >
                              <span className="text-[8px] opacity-75">Col {cIndex}</span>
                              <span className="text-[10px]">Row {rIndex}</span>
                            </button>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="text-[9px] text-gray-400 leading-normal bg-neutral-900/60 p-2 rounded border border-white/5 font-mono">
                  Lista de Coordenadas Selecionadas: [
                  {paylineCoords.map(c => `(${c.col},${c.row})`).join(', ')}
                  ]
                </div>
              </div>

              {/* ACTIVE SWITCH */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-gray-300">Payline Ativa</span>
                  <p className="text-[9px] text-gray-500">Se desativada, o motor ignorará esta linha na validação de vitórias.</p>
                </div>
                <button
                  onClick={() => setPaylineIsActive(!paylineIsActive)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors ${paylineIsActive ? 'bg-red-600' : 'bg-gray-800'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform transform ${paylineIsActive ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => setEditingPaylineId(null)}
                  className="px-3.5 py-1.5 bg-neutral-900 border border-white/10 hover:bg-neutral-800 rounded-lg text-xs font-bold text-gray-300 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={savePayline}
                  className="px-4 py-1.5 bg-red-800 hover:bg-red-700 rounded-lg text-xs font-bold text-white flex items-center gap-1 transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Payline</span>
                </button>
              </div>
            </div>
          ) : (
            /* PAYLINES LIST VIEW */
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Linhas de pagamento ativas: <b>{paylines.filter(p => p.isActive).length}</b> / {paylines.length}</span>
                <button
                  onClick={startCreatePayline}
                  className="py-1 px-2.5 bg-red-800 hover:bg-red-700 rounded-lg text-xs font-black flex items-center gap-1 text-white transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Criar Payline</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[350px] overflow-y-auto pr-1 no-scrollbar font-mono text-[11px]">
                {paylines.map(line => {
                  const coordStr = line.coordinates.map(c => `(${c.col},${c.row})`).join(' ➜ ');
                  return (
                    <div
                      key={line.id}
                      className={`p-3 bg-black/50 border rounded-xl flex items-center justify-between gap-3 hover:border-red-600/50 transition-all ${
                        line.isActive ? 'border-red-950/40' : 'border-dashed border-gray-800 opacity-60'
                      }`}
                    >
                      <div className="space-y-1 overflow-hidden min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white font-sans truncate">{line.name}</span>
                          <span className="text-[8px] font-bold px-1.5 py-0.5 bg-neutral-800 rounded text-gray-400 leading-none">
                            {line.id}
                          </span>
                        </div>
                        <p className="text-[9px] text-amber-500 font-mono truncate tracking-tight">
                          {coordStr}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEditPayline(line)}
                          className="p-1.5 bg-neutral-950/60 border border-white/5 hover:bg-neutral-900 text-gray-300 hover:text-white rounded-lg transition cursor-pointer"
                          title="Editar Payline"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {confirmingDeletePaylineId === line.id ? (
                          <div className="flex items-center gap-1 bg-red-950/90 border border-red-500/40 rounded-lg p-0.5 animate-in fade-in zoom-in-95 duration-150">
                            <button
                              onClick={() => deletePayline(line.id)}
                              className="px-2 py-1 bg-red-700 hover:bg-red-600 text-white rounded text-[10px] font-black transition cursor-pointer leading-none"
                              title="Confirmar Exclusão"
                            >
                              Sim
                            </button>
                            <button
                              onClick={() => setConfirmingDeletePaylineId(null)}
                              className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-gray-300 rounded text-[10px] font-black transition cursor-pointer leading-none"
                              title="Cancelar"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmingDeletePaylineId(line.id)}
                            className="p-1.5 bg-neutral-950/60 border border-white/5 hover:bg-red-950 hover:text-red-400 text-gray-400 rounded-lg transition cursor-pointer"
                            title="Excluir Payline"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 3: SETTINGS & HIGH-SPEED RTP SIMULATOR
          ------------------------------------------------------------- */}
      {editorTab === 'settings' && (
        <div className="space-y-4 font-sans text-xs">
          {/* GENERAL MATHEMATICAL SETTINGS */}
          <div className="bg-black/40 p-4 rounded-xl border border-red-900/40 space-y-4">
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest block border-b border-white/5 pb-1">
              ⚙️ Parâmetros Básicos do Sistema
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Layout Selector */}
              <div className="space-y-2">
                <label className="text-[10px] text-gray-400 font-bold block leading-none">TAMANHO DO TABULEIRO (LAYOUT):</label>
                <select
                  value={boardType}
                  onChange={(e) => {
                    const nextLayout = e.target.value as any;
                    setBoardType(nextLayout);
                    saveConfigChange({ boardType: nextLayout });
                  }}
                  className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg font-bold text-white focus:outline-none focus:border-red-500 text-xs"
                >
                  <option value="3x1">3x1 (Retrô - 1 Linha x 3 Rolos)</option>
                  <option value="3x3">3x3 (Clássico - 3 Linhas x 3 Rolos)</option>
                  <option value="3x4x3">3x4x3 (Asimétrico - 3-4-3 Rolos)</option>
                  <option value="4x3">4x3 (Moderno - 3 Linhas x 4 Rolos)</option>
                  <option value="4x4">4x4 (Quadrado - 4 Linhas x 4 Rolos)</option>
                  <option value="5x3">5x3 (Padrão Slot - 3 Linhas x 5 Rolos)</option>
                  <option value="5x4">5x4 (Expandido - 4 Linhas x 5 Rolos)</option>
                  <option value="6x3">6x3 (Largo - 3 Linhas x 6 Rolos)</option>
                  <option value="6x4">6x4 (Megaways - 4 Linhas x 6 Rolos)</option>
                  <option value="7x7">7x7 (Grid Cluster - 7 Linhas x 7 Rolos)</option>
                </select>
                <p className="text-[9px] text-gray-500">As paylines ativas que estiverem fora da grade serão omitidas automaticamente.</p>
              </div>

              {/* Target RTP Setup */}
              <div className="space-y-2">
                <label className="text-[10px] text-gray-400 font-bold block leading-none">RETORNO AO JOGADOR ALVO (TARGET RTP %):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="50"
                    max="150"
                    value={targetRtp}
                    onChange={(e) => {
                      const nextRtp = parseFloat(e.target.value) || 96.5;
                      setTargetRtp(nextRtp);
                      saveConfigChange({ targetRtp: nextRtp });
                    }}
                    className="flex-1 px-3 py-1.5 bg-black border border-white/10 rounded-lg font-mono font-bold text-white focus:outline-none focus:border-red-500 text-xs text-center"
                  />
                  <span className="text-xs text-gray-400 font-bold">%</span>
                </div>
                <p className="text-[9px] text-gray-500">Valor puramente teórico para fins estatísticos e de auditoria de apostas.</p>
              </div>
            </div>
          </div>

          {/* ADVANCED MONTE-CARLO SIMULATOR */}
          <div className="bg-black/40 p-4 rounded-xl border border-red-900/40 space-y-4">
            <div className="space-y-1 border-b border-white/5 pb-2">
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Dices className="w-4 h-4 text-amber-500 animate-spin" />
                Simulador de Probabilidades Real (RTP & Hit Rate)
              </span>
              <p className="text-[10px] text-gray-400 leading-none">
                Gere milhares de jogadas em microssegundos para auditar matematicamente as paylines e pesos atuais.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center bg-neutral-950 p-3 rounded-lg border border-white/5">
              <div className="flex-1 w-full space-y-1.5">
                <label className="text-[10px] text-gray-400 font-bold block">NÚMERO DE SPINS PARA SIMULAR:</label>
                <select
                  value={simSpinsCount}
                  onChange={(e) => setSimSpinsCount(parseInt(e.target.value))}
                  className="w-full px-2 py-1.5 bg-black border border-white/10 rounded-lg font-mono text-xs text-amber-400 focus:outline-none"
                >
                  <option value="1000">1.000 giros (Rápido)</option>
                  <option value="10000">10.000 giros (Recomendado)</option>
                  <option value="50000">50.000 giros (Médio)</option>
                  <option value="100000">100.000 giros (Alta Precisão)</option>
                </select>
              </div>

              <button
                onClick={runRtpSimulation}
                disabled={simRunning}
                className="w-full sm:w-auto px-6 py-3.5 bg-red-800 hover:bg-red-700 disabled:opacity-50 rounded-xl font-bold flex items-center justify-center gap-2 text-white shadow-lg shadow-red-950/50 cursor-pointer transition"
              >
                {simRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Calculando...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-green-400 fill-green-400" />
                    <span>Iniciar Simulação</span>
                  </>
                )}
              </button>
            </div>

            {/* SIMULATION RESULTS SCREEN */}
            {simResults && (
              <div className="bg-neutral-950/80 p-4 rounded-xl border border-red-950/80 space-y-3.5 text-xs animate-in fade-in duration-200">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block">
                  📈 Relatório Estatístico da Simulação (Monte Carlo)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-black/60 p-2.5 rounded-lg border border-white/5 text-center">
                    <span className="text-[9px] text-gray-400 font-bold block">Measured RTP</span>
                    <span className={`text-base font-black font-mono block ${
                      simResults.measuredRtp >= 90 && simResults.measuredRtp <= 102 ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {simResults.measuredRtp.toFixed(2)}%
                    </span>
                  </div>

                  <div className="bg-black/60 p-2.5 rounded-lg border border-white/5 text-center">
                    <span className="text-[9px] text-gray-400 font-bold block">Taxa de Acerto (Hit Rate)</span>
                    <span className="text-base font-black font-mono text-amber-300 block">
                      {simResults.hitRate.toFixed(2)}%
                    </span>
                  </div>

                  <div className="bg-black/60 p-2.5 rounded-lg border border-white/5 text-center">
                    <span className="text-[9px] text-gray-400 font-bold block">Giros Vencedores</span>
                    <span className="text-base font-black font-mono text-white block">
                      {simResults.totalWinSpins} / {simResults.totalSpins}
                    </span>
                  </div>

                  <div className="bg-black/60 p-2.5 rounded-lg border border-white/5 text-center">
                    <span className="text-[9px] text-gray-400 font-bold block">Balanço do Casino</span>
                    <span className="text-base font-black font-mono block text-red-400">
                      x{(simResults.totalBet - simResults.totalWin).toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* HIT BREAKDOWNS BY SYMBOLS */}
                <div className="space-y-2 border-t border-white/5 pt-3">
                  <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">
                    Frequência de Acertos por Símbolo:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.entries(simResults.symbolHitCounts) as [string, number][])
                      .sort((a, b) => b[1] - a[1])
                      .map(([symId, count]) => {
                        const sym = symbols.find(s => s.id === symId);
                        const pct = simResults.totalSpins > 0 ? (count / simResults.totalSpins) * 100 : 0;
                        return (
                          <div key={symId} className="flex items-center justify-between p-1.5 px-2 bg-black/40 border border-white/5 rounded font-mono text-[10px]">
                            <span className="text-gray-300 truncate max-w-[80px]">{sym?.name || symId}</span>
                            <span className="font-bold text-amber-400">{pct.toFixed(2)}%</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

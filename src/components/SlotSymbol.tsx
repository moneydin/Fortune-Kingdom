import React from 'react';
import { motion } from 'motion/react';
import { Crown, Shield, Sword, Gem, Coins, Hexagon, Castle, Orbit } from 'lucide-react';
import { SymbolType, SymbolImageConfig } from '../types';

interface SlotSymbolProps {
  type: string;
  isWinning?: boolean;
  customImage?: string;
  symbolConfig?: SymbolImageConfig;
  cashMultiplier?: number;
  bet?: number;
}

export const SlotSymbol: React.FC<SlotSymbolProps> = ({ type, isWinning, customImage, symbolConfig, cashMultiplier, bet }) => {
  const imageUrl = symbolConfig?.url || customImage;
  const fitMode = symbolConfig?.objectFit || 'cover';
  const offsetX = symbolConfig?.offsetX || 0;
  const offsetY = symbolConfig?.offsetY || 0;
  const zoomScale = (symbolConfig?.scale || 100) / 100;

  const normalizedType = type.toLowerCase();
  const isRealImageUrl = imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('data:') || imageUrl.startsWith('/'));

  const getSymbolContent = () => {
    const iconClasses = "w-full h-full transition-all duration-300";

    if (imageUrl && isRealImageUrl) {
      return (
        <div className="relative w-full h-full overflow-hidden flex items-center justify-center rounded-lg sm:rounded-xl">
          <img 
            src={imageUrl} 
            alt={type} 
            style={{
              objectFit: fitMode,
              transform: `translate(${offsetX}%, ${offsetY}%) scale(${zoomScale})`,
            }}
            className="w-full h-full absolute inset-0 transition-transform duration-75 drop-shadow-[0_0_12px_rgba(253,224,71,0.6)]"
          />
        </div>
      );
    }

    const getIcon = () => {
      switch (normalizedType) {
        case 'king':
          return <Crown className={`${iconClasses} text-yellow-300 drop-shadow-[0_0_12px_rgba(253,224,71,0.7)]`} />;
        case 'queen':
          return <Crown className={`${iconClasses} text-pink-400 drop-shadow-[0_0_12px_rgba(244,114,182,0.7)]`} />;
        case 'crown':
          return <Crown className={`${iconClasses} text-yellow-400 drop-shadow-[0_0_16px_rgba(250,204,21,0.9)]`} />;
        case 'lion':
          return <Orbit className={`${iconClasses} text-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.7)]`} />;
        case 'sword':
          return <Sword className={`${iconClasses} text-slate-300 drop-shadow-[0_0_12px_rgba(203,213,225,0.7)]`} />;
        case 'shield':
          return <Shield className={`${iconClasses} text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]`} />;
        case 'castle':
          return <Castle className={`${iconClasses} text-purple-400 drop-shadow-[0_0_12px_rgba(192,132,252,0.7)]`} />;
        case 'diamond':
          return <Gem className={`${iconClasses} text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]`} />;
        case 'coin':
          return <Coins className={`${iconClasses} text-yellow-500 drop-shadow-[0_0_12px_rgba(234,179,8,0.7)]`} />;
        case 'cash':
          return <Coins className={`${iconClasses} text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]`} />;
        case 'dragon':
          return <Hexagon className={`${iconClasses} text-emerald-500 drop-shadow-[0_0_12px_rgba(16,185,129,0.7)]`} />;
        default:
          return null;
      }
    };

    const iconElement = getIcon();
    if (iconElement) {
      return (
        <div className="w-[60%] h-[60%] xs:w-[65%] xs:h-[65%] max-w-[64px] max-h-[64px] flex items-center justify-center transition-transform hover:scale-115 duration-300">
          {iconElement}
        </div>
      );
    }

    // Fallback for custom emojis or labels
    const displayText = imageUrl || type;
    const isEmoji = displayText.length <= 4;
    return (
      <div className={`flex items-center justify-center font-bold text-center transition-transform hover:scale-115 duration-300 select-none ${
        isEmoji ? 'text-3xl sm:text-4xl filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]' : 'text-xs sm:text-sm font-black uppercase text-amber-300 tracking-wider'
      }`}>
        {displayText}
      </div>
    );
  };

  const isWild = normalizedType === 'wild';

  return (
    <div className={`relative flex items-center justify-center w-full h-full flex-1 min-h-0 symbol-container rounded-xl overflow-hidden transition-all duration-300 ${
      isWinning 
        ? 'bg-gradient-to-b from-[#3a2505] to-[#251502] border-2 border-yellow-400 z-10 scale-105 shadow-[0_0_25px_rgba(253,224,71,0.85),inset_0_0_12px_rgba(253,224,71,0.3)]' 
        : isWild
          ? 'bg-gradient-to-b from-[#210936]/90 via-[#120321]/90 to-black border border-purple-500/40 shadow-[inset_0_1px_3px_rgba(168,85,247,0.15),0_0_15px_rgba(168,85,247,0.25)] hover:border-purple-400/60'
          : 'bg-gradient-to-b from-neutral-900/90 to-neutral-950/95 border border-[#4d3d00]/30 hover:border-[#997a00]/40 shadow-[inset_0_1px_3px_rgba(255,255,255,0.04)]'
    }`}>
      <motion.div
        animate={isWinning ? {
          scale: [1, 1.15, 1],
          rotate: [0, 2, -2, 0],
        } : isWild ? {
          scale: [1, 1.05, 1],
        } : {}}
        transition={{ 
          duration: isWinning ? 1.2 : 2.5, 
          repeat: isWinning || isWild ? Infinity : 0, 
          ease: "easeInOut" 
        }}
        className="w-full h-full flex items-center justify-center p-0.5"
      >
        {getSymbolContent()}
      </motion.div>
      {/* Premium Swipe Shine Animation for Winners */}
      {isWinning && (
        <motion.div 
          className="absolute inset-0 w-full h-full pointer-events-none bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 z-20"
          animate={{
            x: ['-150%', '150%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 0.4
          }}
        />
      )}
      {/* Dynamic Lighting Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none mix-blend-overlay"></div>
      
      {/* Cash Value Badge Overlay */}
      {normalizedType === 'cash' && cashMultiplier !== undefined && (
        <div className="absolute bottom-1 bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 border border-emerald-300 text-[8px] xs:text-[9.5px] font-mono px-1.5 py-0.5 rounded-md font-black text-white shadow-[0_2px_8px_rgba(0,0,0,0.6)] whitespace-nowrap z-20 select-none animate-pulse">
          R$ {(cashMultiplier * (bet || 1.00)).toFixed(2)}
        </div>
      )}

      {/* Curinga Badge Overlay */}
      {normalizedType === 'wild' && (
        <div className="absolute bottom-1 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 border border-purple-400 text-[8px] xs:text-[9.5px] font-sans px-1.5 py-0.5 rounded-md font-black text-white shadow-[0_2px_8px_rgba(0,0,0,0.6)] whitespace-nowrap z-20 select-none animate-pulse uppercase tracking-wider">
          Curinga
        </div>
      )}
    </div>
  );
};


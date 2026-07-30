import React from 'react';
import { AdminConfig, GameState } from '../types';
import { SlotEngineConfig } from '../slotEngine';
import { CriadorDesignerModal } from './CriadorDesignerModal';

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
}) => {
  return (
    <CriadorDesignerModal
      isOpen={isOpen}
      onClose={onClose}
      adminConfig={adminConfig}
      onUpdateAdminConfig={onUpdateAdminConfig}
      gameState={gameState}
      onSpin={() => {}}
      onUpdateGameState={(updates) => {
        if (updates.balance !== undefined) {
          onUpdateBalance(updates.balance);
        }
      }}
      engineConfig={engineConfig}
      onUpdateEngineConfig={onUpdateEngineConfig}
      onUpdateBalance={onUpdateBalance}
      onResetStats={onResetStats}
    />
  );
};

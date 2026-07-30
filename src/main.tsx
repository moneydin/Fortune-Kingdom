import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely ignore third-party browser extension / wallet / MetaMask errors
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason?.message || event.reason?.toString() || '';
  if (
    reason.toLowerCase().includes('metamask') ||
    reason.toLowerCase().includes('ethereum') ||
    reason.toLowerCase().includes('wallet') ||
    reason.toLowerCase().includes('user rejected')
  ) {
    event.preventDefault();
    console.warn('Suppressed third-party extension error:', reason);
  }
});

window.addEventListener('error', (event) => {
  const msg = event.message?.toLowerCase() || '';
  if (msg.includes('metamask') || msg.includes('ethereum') || msg.includes('wallet')) {
    event.preventDefault();
    console.warn('Suppressed third-party extension window error:', event.message);
  }
});

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  props: ErrorBoundaryProps;
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught React boundary error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-amber-400">Ocorreu um erro na aplicação</h2>
            <p className="text-sm text-slate-400">
              Desculpe pelo inconveniente. Clique no botão abaixo para recarregar o jogo.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all"
            >
              Recarregar Aplicativo
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);


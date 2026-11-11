import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message, duration = 5000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    const toast = { id, type, title, message };
    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (title, message) => addToast({ type: 'success', title, message }),
    error: (title, message) => addToast({ type: 'error', title, message, duration: 8000 }),
    warning: (title, message) => addToast({ type: 'warning', title, message, duration: 7000 }),
    info: (title, message) => addToast({ type: 'info', title, message })
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
        {toasts.map(t => {
          let bg = 'bg-slate-900 border-slate-700 text-white';
          let icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;

          if (t.type === 'success') {
            bg = 'bg-gov-900 border-gov-700 text-white shadow-lg shadow-gov-950/20';
            icon = <CheckCircle className="w-5 h-5 text-gov-400 shrink-0" />;
          } else if (t.type === 'error') {
            bg = 'bg-crimson-900 border-crimson-700 text-white shadow-xl shadow-crimson-950/30';
            icon = <AlertCircle className="w-5 h-5 text-crimson-400 shrink-0" />;
          } else if (t.type === 'warning') {
            bg = 'bg-amber-900 border-amber-700 text-white shadow-lg shadow-amber-950/20';
            icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${bg}`}
            >
              {icon}
              <div className="flex-1 text-sm">
                {t.title && <h4 className="font-semibold text-sm leading-tight mb-0.5">{t.title}</h4>}
                <p className="text-slate-200 text-xs leading-relaxed">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}


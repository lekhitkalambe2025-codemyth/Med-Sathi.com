import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', title = '') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type, title }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-brand-600 flex-shrink-0" />;
    }
  };

  const getBg = (type) => {
    switch (type) {
      case 'success':
        return 'bg-white border-emerald-200 shadow-emerald-100/50';
      case 'warning':
        return 'bg-white border-amber-200 shadow-amber-100/50';
      case 'error':
        return 'bg-white border-rose-200 shadow-rose-100/50';
      default:
        return 'bg-white border-brand-200 shadow-brand-100/50';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 transform translate-y-0 ${getBg(toast.type)}`}
          >
            {getIcon(toast.type)}
            <div className="flex-1 min-w-0">
              {toast.title && <h4 className="text-xs font-semibold text-slate-900 mb-0.5">{toast.title}</h4>}
              <p className="text-xs text-slate-700 leading-relaxed break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);


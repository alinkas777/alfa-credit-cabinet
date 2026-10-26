import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

let globalAddToast: ((toast: Omit<Toast, 'id'>) => void) | null = null;

export function showToast(toast: Omit<Toast, 'id'>) {
  if (globalAddToast) {
    globalAddToast(toast);
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    globalAddToast = (toast) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast = { ...toast, id };
      setToasts(prev => [...prev, newToast]);

      const duration = toast.duration || 5000;
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    };

    return () => {
      globalAddToast = null;
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} className="text-green-600" />;
      case 'error': return <AlertCircle size={20} className="text-red-600" />;
      case 'info': return <Info size={20} className="text-blue-600" />;
      case 'warning': return <AlertTriangle size={20} className="text-yellow-600" />;
    }
  };

  const getBgColor = (type: Toast['type']) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-[100] space-y-2 max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${getBgColor(toast.type)} border rounded-xl p-4 shadow-lg animate-slide-in flex items-start gap-3`}
        >
          <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900">{toast.title}</p>
            <p className="text-xs text-gray-600 mt-0.5">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

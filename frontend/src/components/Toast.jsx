import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast.autoClose) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration || 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const Icon = icons[toast.type] || Info;

  return (
    <div
      className={`glass-strong rounded-xl p-4 border-2 ${colors[toast.type]} flex items-start gap-3 min-w-[300px] max-w-md shadow-2xl animate-slide-in`}
    >
      <Icon size={20} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {toast.title && (
          <h4 className="font-semibold text-white mb-1">{toast.title}</h4>
        )}
        <p className="text-sm text-slate-300">{toast.message}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-slate-400 hover:text-white transition-smooth flex-shrink-0"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default Toast;


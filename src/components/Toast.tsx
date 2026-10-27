import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'error';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeStyles = {
    success: 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-500/10',
    info: 'bg-cyan-950/90 border-cyan-500/40 text-cyan-200 shadow-cyan-500/10',
    error: 'bg-rose-950/90 border-rose-500/40 text-rose-200 shadow-rose-500/10',
  };

  const dotColors = {
    success: 'bg-emerald-400',
    info: 'bg-cyan-400',
    error: 'bg-rose-400',
  };

  return (
    <div className="fixed bottom-12 right-6 z-50 flex items-center gap-2 px-3.5 py-2 rounded-xl border shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 text-xs font-medium select-none">
      <div className={`flex items-center gap-2 ${typeStyles[type]}`}>
        <span className={`w-2 h-2 rounded-full ${dotColors[type]} animate-pulse`} />
        <span>{message}</span>
      </div>
    </div>
  );
};

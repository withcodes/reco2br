import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// ── Singleton event bus ─────────────────────────────────────
type ToastListener = (t: ToastItem) => void;
const listeners: ToastListener[] = [];

export const toast = {
  show: (message: string, type: ToastType = 'info', duration = 4000) => {
    const item: ToastItem = { id: Date.now().toString(), type, message, duration };
    listeners.forEach(l => l(item));
  },
  success: (msg: string) => toast.show(msg, 'success'),
  error:   (msg: string) => toast.show(msg, 'error'),
  warning: (msg: string) => toast.show(msg, 'warning'),
  info:    (msg: string) => toast.show(msg, 'info'),
};

const ICONS: Record<ToastType, string> = {
  success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️',
};
const COLORS: Record<ToastType, string> = {
  success: 'border-l-4 border-emerald-500',
  error:   'border-l-4 border-rose-500',
  warning: 'border-l-4 border-amber-500',
  info:    'border-l-4 border-indigo-500',
};

function ToastItem({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setExiting(true), (item.duration ?? 4000) - 350);
    const t2 = setTimeout(() => onRemove(item.id), item.duration ?? 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl glass
        ${COLORS[item.type]} min-w-[280px] max-w-[380px] cursor-pointer
        transition-all duration-300
        ${exiting ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0 animate-slide-down'}
      `}
      onClick={() => { setExiting(true); setTimeout(() => onRemove(item.id), 300); }}
    >
      <span className="text-lg flex-shrink-0 mt-0.5">{ICONS[item.type]}</span>
      <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
        {item.message}
      </p>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (t: ToastItem) =>
      setToasts(prev => [...prev.slice(-4), t]);   // max 5 toasts
    listeners.push(handler);
    return () => { const i = listeners.indexOf(handler); if (i > -1) listeners.splice(i, 1); };
  }, []);

  const remove = (id: string) =>
    setToasts(prev => prev.filter(t => t.id !== id));

  if (!toasts.length) return null;

  return createPortal(
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2">
      {toasts.map(t => <ToastItem key={t.id} item={t} onRemove={remove} />)}
    </div>,
    document.body
  );
}

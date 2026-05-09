'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  /** durée d'affichage en ms — défaut : 4000 */
  duration?: number;
  onDismiss?: () => void;
}

/**
 * Toast non-bloquant avec auto-dismiss.
 * S'affiche en bas à droite de l'écran.
 * Disparaît automatiquement après `duration` ms (défaut : 4 s).
 */
export function Toast({ message, duration = 4000, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg max-w-xs animate-in fade-in slide-in-from-bottom-2"
    >
      <span className="text-base" aria-hidden="true">💾</span>
      <span>{message}</span>
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          onDismiss?.();
        }}
      aria-label="Fermer la notification"
        className="ml-auto text-gray-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white rounded"
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}

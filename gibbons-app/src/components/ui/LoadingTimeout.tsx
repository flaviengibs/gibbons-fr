'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoadingTimeoutProps {
  /** délai avant affichage en ms — défaut : 5000 */
  delay?: number;
  /** URL de retour — défaut : navigation arrière */
  backHref?: string;
}

/**
 * Composant affiché après `delay` ms (défaut : 5 s) si le chargement n'est pas terminé.
 * Propose un bouton "revenir à la sélection" pour ne pas bloquer l'apprenant.
 */
export function LoadingTimeout({ delay = 5000, backHref }: LoadingTimeoutProps) {
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!timedOut) return null;

  function handleBack() {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 p-8 text-center bg-white/90 backdrop-blur-sm"
    >
      <div className="text-4xl" aria-hidden="true">⏳</div>

      <div className="space-y-2">
        <p className="text-base font-medium text-gray-800">
          Le chargement prend plus de temps que prévu…
        </p>
        <p className="text-sm text-gray-500">
          Vérifiez votre connexion ou revenez à la sélection.
        </p>
      </div>

      <button
        type="button"
        onClick={handleBack}
        className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-colors"
        aria-label="Revenir à la sélection de branche"
      >
        Revenir à la sélection
      </button>
    </div>
  );
}

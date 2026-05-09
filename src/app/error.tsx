'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const router = useRouter();

  useEffect(() => {
    // log l'erreur pour le monitoring
    console.error('[gibbons] erreur non gérée :', error);
  }, [error]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 text-center bg-gray-50"
      role="alert"
      aria-live="assertive"
    >
      <div className="text-5xl" aria-hidden="true">⚠️</div>

      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-gray-900">
          Quelque chose s'est mal passé
        </h1>
        <p className="text-sm text-gray-500 max-w-sm">
          Une erreur inattendue est survenue. Vous pouvez réessayer ou revenir à l'accueil.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 font-mono">
            Référence : {error.digest}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-colors"
        >
          Réessayer
        </button>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-colors"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}

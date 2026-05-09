/**
 * SwingScreen — conteneur principal d'un swing.
 * Dispatche vers SwingTypeA/B/C/D selon swing.type.
 * Affiche SwingMeta en haut.
 * Après complétion, affiche SautBranches.
 * Timeout de 5s : indicateur + bouton "revenir".
 * Appelle syncCompletion quand l'apprenant complète un swing.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { SwingScreenPayload, SwingContentTypeA, SwingContentTypeB, SwingContentTypeC, SwingContentTypeD } from '@/types/index';
import { SwingMeta } from './SwingMeta';
import { SwingTypeA } from './SwingTypeA';
import { SwingTypeB } from './SwingTypeB';
import { SwingTypeC } from './SwingTypeC';
import { SwingTypeD } from './SwingTypeD';
import { SautBranches } from '@/components/navigation/SautBranches';
import { syncCompletion } from '@/lib/progressSync';

interface SwingScreenProps {
  payload: SwingScreenPayload;
}

const TIMEOUT_MS = 5000;

export function SwingScreen({ payload }: SwingScreenProps) {
  const { swing, branches } = payload;
  const router = useRouter();

  const [completed, setCompleted] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [loading, setLoading] = useState(true);

  // simuler la fin du chargement initial (le composant est monté = chargé)
  useEffect(() => {
    setLoading(false);
  }, []);

  // timeout de 5s si le chargement n'est pas terminé
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [loading]);

  const handleComplete = useCallback(async () => {
    setCompleted(true);
    // synchronisation optimiste — ne bloque pas l'UI
    await syncCompletion(swing.id);
  }, [swing.id]);

  const handleSelect = useCallback(
    (swingId: string) => {
      router.push(`/swing/${swingId}`);
    },
    [router],
  );

  // indicateur de timeout
  if (timedOut && loading) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 text-center"
        role="alert"
        aria-live="assertive"
      >
        <div className="text-4xl" aria-hidden="true">⏳</div>
        <p className="text-lg text-gray-700">
          Le chargement prend plus de temps que prévu…
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800 text-white font-medium rounded-full transition-colors"
          aria-label="Revenir à la sélection de branche"
        >
          Revenir
        </button>
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      {/* métadonnées en haut */}
      <SwingMeta swing={swing} />

      {/* contenu du swing */}
      <div className="flex-1 flex flex-col">
        {!completed ? (
          <div className="flex-1">
            {swing.type === 'TYPE_A' && (
              <SwingTypeA
                content={swing.content as SwingContentTypeA}
                onComplete={handleComplete}
              />
            )}
            {swing.type === 'TYPE_B' && (
              <SwingTypeB
                content={swing.content as SwingContentTypeB}
                onComplete={handleComplete}
              />
            )}
            {swing.type === 'TYPE_C' && (
              <SwingTypeC
                content={swing.content as SwingContentTypeC}
                onComplete={handleComplete}
              />
            )}
            {swing.type === 'TYPE_D' && (
              <SwingTypeD
                content={swing.content as SwingContentTypeD}
                onComplete={handleComplete}
              />
            )}
          </div>
        ) : (
          /* après complétion : afficher les branches de saut */
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <p className="text-sm text-gray-500 mb-6 text-center">
            Choisissez votre prochaine direction
          </p>
            <SautBranches branches={branches} onSelect={handleSelect} />
          </div>
        )}
      </div>
    </main>
  );
}

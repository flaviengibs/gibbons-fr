'use client';

import { useEffect, useState } from 'react';
import { flushPendingCompletions, getPendingCompletions } from '@/lib/progressSync';
import { Toast } from './Toast';

/**
 * Composant client qui, au montage :
 * 1. Vérifie s'il y a des completions en attente dans localStorage.
 * 2. Si oui, affiche un Toast "sauvegarde en attente…" et tente de les synchroniser.
 * 3. Le Toast disparaît automatiquement après 4 s.
 */
export function PendingSync() {
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const pending = getPendingCompletions();

    if (pending.length > 0) {
      setShowToast(true);
      // tenter la synchronisation en arrière-plan
      flushPendingCompletions().catch(() => {
        // échec silencieux — les données restent dans localStorage
      });
    }
  }, []);

  if (!showToast) return null;

  return (
    <Toast
      message="sauvegarde en attente…"
      duration={4000}
      onDismiss={() => setShowToast(false)}
    />
  );
}

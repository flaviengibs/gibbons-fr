/**
 * progressSync.ts
 *
 * Synchronisation optimiste de la progression apprenant.
 * En cas d'échec réseau, les completions sont stockées dans localStorage
 * sous la clé `gibbons:pendingCompletions` et synchronisées au prochain appel.
 */

const STORAGE_KEY = 'gibbons:pendingCompletions';
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000; // 1s, 2s, 4s (backoff exponentiel)

// ─── Helpers localStorage ─────────────────────────────────────────────────────

/**
 * Lit les swingIds en attente depuis localStorage.
 * Retourne un tableau vide si localStorage n'est pas disponible ou si la clé est absente.
 */
export function getPendingCompletions(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

function setPendingCompletions(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // quota dépassé ou mode privé — on ignore silencieusement
  }
}

function addPendingCompletion(swingId: string): void {
  const current = getPendingCompletions();
  if (!current.includes(swingId)) {
    setPendingCompletions([...current, swingId]);
  }
}

function removePendingCompletion(swingId: string): void {
  const current = getPendingCompletions();
  setPendingCompletions(current.filter((id) => id !== swingId));
}

// ─── Retry avec backoff exponentiel ──────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Tente POST /api/progress avec jusqu'à MAX_RETRIES tentatives.
 * Backoff exponentiel : 1s, 2s, 4s entre les tentatives.
 * Retourne true si la synchronisation a réussi, false sinon.
 */
async function postProgressWithRetry(swingId: string): Promise<boolean> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ swingId }),
      });

      if (response.ok) {
        return true;
      }

      // erreur HTTP non-récupérable (ex : 401, 422) — inutile de réessayer
      if (response.status === 401 || response.status === 422) {
        return false;
      }
    } catch {
      // erreur réseau — on réessaie après délai
    }

    // attendre avant la prochaine tentative (sauf après la dernière)
    if (attempt < MAX_RETRIES - 1) {
      await delay(BASE_DELAY_MS * Math.pow(2, attempt));
    }
  }

  return false;
}

// ─── API publique ─────────────────────────────────────────────────────────────

/**
 * Synchronise la complétion d'un swing avec le serveur.
 *
 * 1. Tente POST /api/progress avec retry (3 tentatives, backoff exponentiel).
 * 2. En cas d'échec, stocke le swingId dans localStorage pour synchronisation ultérieure.
 */
export async function syncCompletion(swingId: string): Promise<void> {
  const success = await postProgressWithRetry(swingId);

  if (!success) {
    addPendingCompletion(swingId);
  }
}

/**
 * Tente de synchroniser toutes les completions en attente dans localStorage.
 *
 * Pour chaque swingId en attente :
 * - Tente POST /api/progress (avec retry).
 * - Si succès, retire le swingId de la liste en attente.
 * - Si échec, conserve le swingId pour la prochaine tentative.
 */
export async function flushPendingCompletions(): Promise<void> {
  const pending = getPendingCompletions();
  if (pending.length === 0) return;

  for (const swingId of pending) {
    const success = await postProgressWithRetry(swingId);
    if (success) {
      removePendingCompletion(swingId);
    }
  }
}

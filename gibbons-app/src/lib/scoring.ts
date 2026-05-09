/**
 * Calcule le Score_Qualité d'un swing.
 *
 * Formule : (moyenne_votes × 0.7) + (score_éditorial × 0.3)
 *
 * - votes          : entiers 1–5 (votes des apprenants)
 * - editorialScore : réel 0.0–5.0 (note éditoriale)
 * - si votes = [], retourner editorialScore × 0.3
 * - résultat toujours dans [0.0, 5.0]
 */
export function computeQualityScore(
  votes: number[],
  editorialScore: number,
): number {
  let score: number;

  if (votes.length === 0) {
    score = editorialScore * 0.3;
  } else {
    const average = votes.reduce((sum, v) => sum + v, 0) / votes.length;
    score = average * 0.7 + editorialScore * 0.3;
  }

  // borner dans [0.0, 5.0]
  return Math.min(5.0, Math.max(0.0, score));
}

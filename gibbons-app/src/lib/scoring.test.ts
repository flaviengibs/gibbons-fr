import { describe, it, expect } from 'vitest';
import { test } from '@fast-check/vitest';
import * as fc from 'fast-check';
import { computeQualityScore } from './scoring';

// ─── Tests unitaires (exemples) ──────────────────────────────────────────────

describe('computeQualityScore — exemples', () => {
  it('retourne editorialScore × 0.3 quand votes = []', () => {
    expect(computeQualityScore([], 4.0)).toBeCloseTo(1.2);
    expect(computeQualityScore([], 0.0)).toBeCloseTo(0.0);
    expect(computeQualityScore([], 5.0)).toBeCloseTo(1.5);
  });

  it('applique la formule (moyenne_votes × 0.7) + (score_éditorial × 0.3)', () => {
    // moyenne = 4, éditorial = 3 → 4×0.7 + 3×0.3 = 2.8 + 0.9 = 3.7
    expect(computeQualityScore([4, 4], 3.0)).toBeCloseTo(3.7);
  });

  it('borne le résultat à 5.0 au maximum', () => {
    expect(computeQualityScore([5, 5, 5], 5.0)).toBeLessThanOrEqual(5.0);
  });

  it('borne le résultat à 0.0 au minimum', () => {
    expect(computeQualityScore([1], 0.0)).toBeGreaterThanOrEqual(0.0);
  });

  it('calcule correctement avec un seul vote', () => {
    // vote = 3, éditorial = 2 → 3×0.7 + 2×0.3 = 2.1 + 0.6 = 2.7
    expect(computeQualityScore([3], 2.0)).toBeCloseTo(2.7);
  });
});

// ─── Propriété 6 : calcul borné du Score_Qualité ─────────────────────────────
// Feature: gibbons-platform, Property 6: calcul borné du Score_Qualité
// Valide : Requirements 7.1, 7.3

test.prop(
  [
    // votes : entiers 1–5
    fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 0, maxLength: 50 }),
    // score éditorial : réel 0.0–5.0
    fc.float({ min: 0.0, max: 5.0, noNaN: true }),
  ],
  { numRuns: 100 },
)(
  'propriété 6 — computeQualityScore retourne toujours une valeur dans [0.0, 5.0] et respecte la formule',
  (votes, editorialScore) => {
    const result = computeQualityScore(votes, editorialScore);

    // borné dans [0.0, 5.0]
    if (result < 0.0 || result > 5.0) return false;

    // respecte la formule
    let expected: number;
    if (votes.length === 0) {
      expected = editorialScore * 0.3;
    } else {
      const average = votes.reduce((sum, v) => sum + v, 0) / votes.length;
      expected = average * 0.7 + editorialScore * 0.3;
    }
    // borner l'attendu aussi
    expected = Math.min(5.0, Math.max(0.0, expected));

    // tolérance flottante
    return Math.abs(result - expected) < 1e-9;
  },
);

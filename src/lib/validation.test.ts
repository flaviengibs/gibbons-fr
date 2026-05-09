import { describe, it, expect } from 'vitest';
import { test } from '@fast-check/vitest';
import * as fc from 'fast-check';
import { validateSwing } from './validation';

// champs obligatoires
const REQUIRED_FIELDS = [
  'type',
  'title',
  'content',
  'branchId',
  'estimatedDuration',
] as const;

type RequiredField = (typeof REQUIRED_FIELDS)[number];

// ─── Tests unitaires (exemples) ──────────────────────────────────────────────

describe('validateSwing — exemples', () => {
  it('retourne success=true quand tous les champs sont présents', () => {
    const result = validateSwing({
      type: 'TYPE_A',
      title: 'Mon swing',
      content: { type: 'TYPE_A', text: 'texte', visualUrl: '', animationData: {} },
      branchId: 'branch-1',
      estimatedDuration: 90,
    });
    expect(result.success).toBe(true);
  });

  it('retourne success=false avec missingFields quand un champ est absent', () => {
    const result = validateSwing({
      type: 'TYPE_A',
      title: 'Mon swing',
      // content manquant
      branchId: 'branch-1',
      estimatedDuration: 90,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.missingFields).toEqual(['content']);
    }
  });

  it('liste tous les champs manquants quand l\'objet est vide', () => {
    const result = validateSwing({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.missingFields).toEqual(expect.arrayContaining([...REQUIRED_FIELDS]));
      expect(result.missingFields).toHaveLength(REQUIRED_FIELDS.length);
    }
  });

  it('retourne success=false avec exactement les champs manquants', () => {
    const result = validateSwing({
      title: 'Titre',
      estimatedDuration: 60,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.missingFields).toEqual(
        expect.arrayContaining(['type', 'content', 'branchId']),
      );
      expect(result.missingFields).toHaveLength(3);
    }
  });
});

// ─── Propriété 7 : validation de publication (double sens) ───────────────────
// Feature: gibbons-platform, Property 7: validation de publication (double sens)
// Valide : Requirements 5.2, 5.3

// arbitraire pour une valeur de champ non nulle
const arbFieldValue = fc.oneof(
  fc.string({ minLength: 1 }),
  fc.integer({ min: 1 }),
  fc.constant({ type: 'TYPE_A', text: 'x', visualUrl: '', animationData: {} }),
);

test.prop(
  [
    // swing complet : tous les champs obligatoires présents
    fc.record({
      type: arbFieldValue,
      title: arbFieldValue,
      content: arbFieldValue,
      branchId: arbFieldValue,
      estimatedDuration: arbFieldValue,
    }),
  ],
  { numRuns: 100 },
)(
  'propriété 7a — tout swing avec tous les champs obligatoires retourne success=true',
  (swing) => {
    const result = validateSwing(swing as Record<RequiredField, unknown>);
    return result.success === true;
  },
);

test.prop(
  [
    // sous-ensemble non vide de champs à omettre
    fc
      .subarray([...REQUIRED_FIELDS] as RequiredField[], { minLength: 1 })
      .chain((missingFields) => {
        // construire un objet avec les champs présents seulement
        const presentFields = REQUIRED_FIELDS.filter(
          (f) => !missingFields.includes(f),
        );
        const presentEntries = presentFields.map((f) =>
          arbFieldValue.map((v) => [f, v] as [RequiredField, unknown]),
        );
        const recordArb =
          presentEntries.length > 0
            ? fc.tuple(...presentEntries).map((entries) =>
                Object.fromEntries(entries) as Partial<Record<RequiredField, unknown>>,
              )
            : fc.constant({} as Partial<Record<RequiredField, unknown>>);
        return fc.tuple(fc.constant(missingFields), recordArb);
      }),
  ],
  { numRuns: 100 },
)(
  'propriété 7b — tout sous-ensemble non vide de champs manquants retourne success=false avec la liste exacte',
  ([expectedMissing, partialSwing]) => {
    const result = validateSwing(partialSwing);

    if (result.success) return false;

    // la liste des champs manquants doit correspondre exactement
    const actualMissing = new Set(result.missingFields);
    const expectedMissingSet = new Set(expectedMissing);

    if (actualMissing.size !== expectedMissingSet.size) return false;
    for (const field of expectedMissingSet) {
      if (!actualMissing.has(field)) return false;
    }

    return true;
  },
);

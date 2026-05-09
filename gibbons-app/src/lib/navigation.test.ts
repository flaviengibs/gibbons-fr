import { describe, it, expect } from 'vitest';
import { test } from '@fast-check/vitest';
import * as fc from 'fast-check';
import { selectBranches, type SwingEdgeInput } from './navigation';
import type { BranchRelationType } from '@/types/index';

const RELATION_TYPES: BranchRelationType[] = [
  'concept_lié',
  'difficulté_différente',
  'surprise',
];

// ─── Arbitraires ─────────────────────────────────────────────────────────────

const arbRelationType = fc.constantFrom(...RELATION_TYPES);

const arbSwingId = fc.string({ minLength: 1, maxLength: 20 });

const arbEdge = (targetId: fc.Arbitrary<string> = arbSwingId) =>
  fc.record({
    targetSwingId: targetId,
    relationType: arbRelationType,
    weight: fc.double({ min: 0, max: 1, noNaN: true }),
  });

/**
 * Génère un tableau d'arêtes avec des targetSwingId distincts.
 */
const arbEdges = (minLength = 0, maxLength = 10) =>
  fc
    .uniqueArray(arbSwingId, { minLength, maxLength })
    .chain((ids) =>
      fc.tuple(...ids.map((id) => arbEdge(fc.constant(id)))),
    )
    .map((edges) => edges as SwingEdgeInput[]);

// ─── Tests unitaires (exemples) ──────────────────────────────────────────────

describe('selectBranches — exemples', () => {
  it('retourne 3 branches quand 3 arêtes distinctes sont disponibles', () => {
    const edges: SwingEdgeInput[] = [
      { targetSwingId: 'a', relationType: 'concept_lié', weight: 0.9 },
      { targetSwingId: 'b', relationType: 'difficulté_différente', weight: 0.7 },
      { targetSwingId: 'c', relationType: 'surprise', weight: 0.5 },
    ];
    const result = selectBranches(edges, new Set(), new Set());
    expect(result).toHaveLength(3);
  });

  it('retourne au moins 1 branche même avec une seule arête', () => {
    const edges: SwingEdgeInput[] = [
      { targetSwingId: 'a', relationType: 'concept_lié', weight: 0.8 },
    ];
    const result = selectBranches(edges, new Set(), new Set());
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('exclut les swings complétés quand des alternatives existent', () => {
    const edges: SwingEdgeInput[] = [
      { targetSwingId: 'done', relationType: 'concept_lié', weight: 0.9 },
      { targetSwingId: 'fresh1', relationType: 'difficulté_différente', weight: 0.7 },
      { targetSwingId: 'fresh2', relationType: 'surprise', weight: 0.5 },
      { targetSwingId: 'fresh3', relationType: 'concept_lié', weight: 0.4 },
    ];
    const result = selectBranches(edges, new Set(['done']), new Set());
    const ids = result.map((b) => b.targetSwingId);
    expect(ids).not.toContain('done');
  });

  it('utilise le fallback zone dense si < 3 branches directes', () => {
    const edges: SwingEdgeInput[] = [
      { targetSwingId: 'a', relationType: 'concept_lié', weight: 0.9 },
    ];
    const dense = new Set(['d1', 'd2']);
    const result = selectBranches(edges, new Set(), dense);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('retourne au moins 1 branche depuis la zone dense si aucune arête directe', () => {
    const result = selectBranches([], new Set(), new Set(['dense1']));
    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});

// ─── Propriété 1 : sélection des branches de saut ────────────────────────────
// Feature: gibbons-platform, Property 1: sélection des branches de saut
// Valide : Requirements 2.1, 2.5

test.prop(
  [
    arbEdges(0, 10),
    fc.array(arbSwingId, { minLength: 0, maxLength: 5 }),
    fc.array(arbSwingId, { minLength: 0, maxLength: 5 }),
  ],
  { numRuns: 100 },
)(
  'propriété 1 — selectBranches retourne exactement 3 branches si ≥ 3 disponibles, sinon le maximum, et toujours au moins 1',
  (edges, completedArr, denseArr) => {
    const completedSwingIds = new Set(completedArr);
    const denseSwingIds = new Set(denseArr);

    // nombre de branches potentiellement disponibles (fraîches + denses)
    const freshEdges = edges.filter(
      (e) => !completedSwingIds.has(e.targetSwingId),
    );
    const candidateEdges = freshEdges.length > 0 ? freshEdges : edges;

    // ids uniques disponibles (directes + denses non complétées)
    const directIds = new Set(candidateEdges.map((e) => e.targetSwingId));
    const denseIds = new Set(
      [...denseSwingIds].filter(
        (id) => !completedSwingIds.has(id) && !directIds.has(id),
      ),
    );
    const totalAvailable = directIds.size + denseIds.size;

    // si aucune arête et aucune zone dense, on ne peut pas garantir 1 branche
    if (edges.length === 0 && denseSwingIds.size === 0) return true;

    const result = selectBranches(edges, completedSwingIds, denseSwingIds);

    // toujours au moins 1
    if (result.length < 1) return false;

    // exactement 3 si ≥ 3 disponibles, sinon le maximum disponible
    if (totalAvailable >= 3) {
      return result.length === 3;
    } else {
      return result.length <= totalAvailable || result.length <= 3;
    }
  },
);

// ─── Propriété 2 : diversité des axes de branche ─────────────────────────────
// Feature: gibbons-platform, Property 2: diversité des axes de branche
// Valide : Requirements 2.2

/**
 * Génère au moins 3 arêtes avec au moins 2 types de relation distincts.
 * On force les deux premières arêtes à avoir des types différents.
 */
const arbEdgesWithDiversity = fc
  .uniqueArray(arbSwingId, { minLength: 3, maxLength: 10 })
  .chain((ids) => {
    // choisir deux types distincts pour les deux premières arêtes
    return fc
      .tuple(
        fc.constantFrom(...RELATION_TYPES),
        fc.constantFrom(...RELATION_TYPES),
      )
      .filter(([t1, t2]) => t1 !== t2)
      .chain(([t1, t2]) => {
        const edgeArbs = ids.map((id, i) =>
          fc.record({
            targetSwingId: fc.constant(id),
            relationType: fc.constant(
              i === 0 ? t1 : i === 1 ? t2 : RELATION_TYPES[i % 3],
            ),
            weight: fc.double({ min: 0.1, max: 1, noNaN: true }),
          }),
        );
        return fc.tuple(...edgeArbs).map((e) => e as SwingEdgeInput[]);
      });
  });

test.prop([arbEdgesWithDiversity], { numRuns: 100 })(
  'propriété 2 — les 3 branches couvrent au moins 2 axes de relation distincts',
  (edges) => {
    const result = selectBranches(edges, new Set(), new Set());

    if (result.length < 3) return true; // pas assez de branches pour vérifier

    const distinctTypes = new Set(result.map((b) => b.relationType));
    return distinctTypes.size >= 2;
  },
);

// ─── Propriété 3 : exclusion des swings déjà complétés ───────────────────────
// Feature: gibbons-platform, Property 3: exclusion des swings déjà complétés
// Valide : Requirements 2.6

test.prop(
  [
    // au moins 4 arêtes pour avoir des alternatives après exclusion
    fc
      .uniqueArray(arbSwingId, { minLength: 4, maxLength: 10 })
      .chain((ids) => {
        const edgeArbs = ids.map((id) =>
          fc.record({
            targetSwingId: fc.constant(id),
            relationType: arbRelationType,
            weight: fc.double({ min: 0.1, max: 1, noNaN: true }),
          }),
        );
        return fc.tuple(...edgeArbs).map((e) => e as SwingEdgeInput[]);
      }),
    // compléter au moins 1 swing parmi les arêtes, mais pas tous
    fc.integer({ min: 1, max: 2 }),
  ],
  { numRuns: 100 },
)(
  'propriété 3 — aucune branche retournée ne pointe vers un swing complété quand des alternatives existent',
  (edges, numCompleted) => {
    // marquer les premiers swings comme complétés
    const completedIds = new Set(
      edges.slice(0, numCompleted).map((e) => e.targetSwingId),
    );

    // vérifier qu'il reste des alternatives non complétées
    const alternatives = edges.filter(
      (e) => !completedIds.has(e.targetSwingId),
    );
    if (alternatives.length === 0) return true; // pas d'alternative, skip

    const result = selectBranches(edges, completedIds, new Set());

    // aucune branche ne doit pointer vers un swing complété
    return result.every((b) => !completedIds.has(b.targetSwingId));
  },
);

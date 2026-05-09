import { describe, it, expect } from 'vitest';
import { test } from '@fast-check/vitest';
import * as fc from 'fast-check';
import { computeZones } from './zones';

// ─── Arbitraires ─────────────────────────────────────────────────────────────

const arbSwingId = fc.string({ minLength: 1, maxLength: 20 });

/**
 * Génère un ensemble de swings publiés avec une liste d'adjacence cohérente.
 */
const arbSwingGraph = fc
  .uniqueArray(arbSwingId, { minLength: 1, maxLength: 15 })
  .chain((ids) => {
    // pour chaque swing, générer une liste de voisins parmi les autres swings
    const adjacencyEntries = ids.map((id) => {
      const others = ids.filter((other) => other !== id);
      const maxLen = Math.min(4, others.length);
      const neighborsArb =
        others.length === 0
          ? fc.constant([] as string[])
          : fc.subarray(others, { maxLength: maxLen });
      return neighborsArb.map(
        (neighbors) => [id, neighbors] as [string, string[]],
      );
    });
    return fc
      .tuple(...adjacencyEntries)
      .map((entries) => ({ ids, adjacency: new Map(entries) }));
  });

// ─── Tests unitaires (exemples) ──────────────────────────────────────────────

describe('computeZones — exemples', () => {
  it('place les swings complétés dans explored', () => {
    const allIds = ['a', 'b', 'c'];
    const adjacency = new Map([['a', ['b']], ['b', ['c']], ['c', []]]);
    const { explored } = computeZones(allIds, ['a'], adjacency);
    expect(explored).toContain('a');
  });

  it('place les voisins non complétés dans dense', () => {
    const allIds = ['a', 'b', 'c'];
    const adjacency = new Map([['a', ['b', 'c']], ['b', []], ['c', []]]);
    const { dense } = computeZones(allIds, ['a'], adjacency);
    expect(dense).toContain('b');
    expect(dense).toContain('c');
  });

  it('place les swings ni explorés ni denses dans unknown', () => {
    const allIds = ['a', 'b', 'c', 'd'];
    const adjacency = new Map([
      ['a', ['b']],
      ['b', []],
      ['c', []],
      ['d', []],
    ]);
    const { unknown } = computeZones(allIds, ['a'], adjacency);
    expect(unknown).toContain('c');
    expect(unknown).toContain('d');
    expect(unknown).not.toContain('a');
    expect(unknown).not.toContain('b');
  });

  it('retourne explored=[], dense=[], unknown=all quand aucun swing complété', () => {
    const allIds = ['a', 'b', 'c'];
    const adjacency = new Map<string, string[]>();
    const result = computeZones(allIds, [], adjacency);
    expect(result.explored).toHaveLength(0);
    expect(result.dense).toHaveLength(0);
    expect(result.unknown).toEqual(expect.arrayContaining(['a', 'b', 'c']));
  });
});

// ─── Propriété 4 : invariant de zone après complétion ────────────────────────
// Feature: gibbons-platform, Property 4: invariant de zone après complétion
// Valide : Requirements 4.1, 4.3

test.prop(
  [
    arbSwingGraph,
    // index du swing à compléter
    fc.integer({ min: 0, max: 14 }),
  ],
  { numRuns: 100 },
)(
  'propriété 4 — après complétion d\'un swing, il est dans explored et absent de dense et unknown',
  ({ ids, adjacency }, idx) => {
    if (ids.length === 0) return true;

    const swingId = ids[idx % ids.length];

    // état initial : quelques swings déjà complétés (pas forcément swingId)
    const initialCompleted = ids.filter((_, i) => i % 3 === 0 && ids[i] !== swingId);

    // ajouter swingId aux complétés
    const completedIds = [...new Set([...initialCompleted, swingId])];

    const { explored, dense, unknown } = computeZones(ids, completedIds, adjacency);

    const inExplored = explored.includes(swingId);
    const inDense = dense.includes(swingId);
    const inUnknown = unknown.includes(swingId);

    return inExplored && !inDense && !inUnknown;
  },
);

// ─── Propriété 5 : partition des zones (cohérence) ───────────────────────────
// Feature: gibbons-platform, Property 5: partition des zones (cohérence)
// Valide : Requirements 4.1, 4.4

test.prop(
  [
    arbSwingGraph,
    // sous-ensemble de swings complétés
    fc.integer({ min: 0, max: 10 }),
  ],
  { numRuns: 100 },
)(
  'propriété 5 — explored ∪ dense ∪ unknown = allSwingIds et les trois ensembles sont deux à deux disjoints',
  ({ ids, adjacency }, numCompleted) => {
    const completedIds = ids.slice(0, numCompleted % (ids.length + 1));

    const { explored, dense, unknown } = computeZones(ids, completedIds, adjacency);

    // union = allSwingIds
    const union = new Set([...explored, ...dense, ...unknown]);
    const allIds = new Set(ids);

    if (union.size !== allIds.size) return false;
    for (const id of allIds) {
      if (!union.has(id)) return false;
    }

    // deux à deux disjoints
    const exploredSet = new Set(explored);
    const denseSet = new Set(dense);
    const unknownSet = new Set(unknown);

    for (const id of exploredSet) {
      if (denseSet.has(id) || unknownSet.has(id)) return false;
    }
    for (const id of denseSet) {
      if (exploredSet.has(id) || unknownSet.has(id)) return false;
    }

    return true;
  },
);

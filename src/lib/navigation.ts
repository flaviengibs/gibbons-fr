import type { SwingBranch, BranchRelationType } from '@/types/index';

// arête sortante du swing courant (entrée de selectBranches)
export interface SwingEdgeInput {
  targetSwingId: string;
  relationType: BranchRelationType;
  weight: number; // 0.0 – 1.0
}

// axes de relation reconnus
const RELATION_TYPES: BranchRelationType[] = [
  'concept_lié',
  'difficulté_différente',
  'surprise',
];

/**
 * Sélectionne les 3 branches de saut à proposer à l'apprenant.
 *
 * Algorithme :
 * 1. Filtrer les swings déjà complétés (sauf si aucune alternative)
 * 2. Sélectionner au moins 2 axes distincts parmi les 3 types de relation
 * 3. Trier par score de pertinence (weight × facteur_fraîcheur, facteur = 1.0 au MVP)
 * 4. Retourner exactement 3 branches (fallback zone dense si < 3 disponibles)
 * 5. Toujours retourner au moins 1 branche
 */
export function selectBranches(
  edges: SwingEdgeInput[],
  completedSwingIds: Set<string>,
  denseSwingIds: Set<string>,
): SwingBranch[] {
  // étape 1 : filtrer les swings déjà complétés
  const freshEdges = edges.filter(
    (e) => !completedSwingIds.has(e.targetSwingId),
  );

  // si aucune alternative fraîche, on utilise toutes les arêtes (fallback)
  const candidateEdges = freshEdges.length > 0 ? freshEdges : edges;

  // étape 2 : construire un pool diversifié (au moins 2 axes distincts en tête)
  const diversePool = buildDiversePool(candidateEdges);

  // étape 3 : le pool est déjà ordonné (diversité en tête, puis par poids)
  // on ne retrie pas pour préserver la diversité garantie par buildDiversePool
  const sorted = diversePool;

  // étape 4 : prendre les 3 premières branches
  let selected = sorted.slice(0, 3);

  // fallback zone dense si < 3 branches disponibles
  if (selected.length < 3) {
    const denseEdges = buildDenseFallback(
      denseSwingIds,
      completedSwingIds,
      selected,
    );
    selected = [...selected, ...denseEdges].slice(0, 3);
  }

  // étape 5 : garantir au moins 1 branche (fallback ultime)
  if (selected.length === 0 && denseSwingIds.size > 0) {
    const firstDense = [...denseSwingIds][0];
    selected = [makeDenseBranch(firstDense)];
  }

  return selected.map(edgeToSwingBranch);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Construit un pool d'arêtes couvrant au moins 2 axes distincts.
 * Stratégie : on prend d'abord les meilleures arêtes de chaque axe (diversité),
 * puis on complète avec les arêtes restantes triées par poids.
 * Les arêtes diversifiées sont toujours placées en tête du pool.
 */
function buildDiversePool(edges: SwingEdgeInput[]): SwingEdgeInput[] {
  if (edges.length === 0) return [];

  // regrouper par type de relation
  const byType = new Map<BranchRelationType, SwingEdgeInput[]>();
  for (const type of RELATION_TYPES) {
    byType.set(type, []);
  }
  for (const edge of edges) {
    byType.get(edge.relationType)?.push(edge);
  }

  // trier chaque groupe par poids décroissant
  for (const [, group] of byType) {
    group.sort((a, b) => b.weight - a.weight);
  }

  const diverseHead: SwingEdgeInput[] = [];
  const used = new Set<string>();

  // prendre la meilleure arête de chaque axe disponible (diversité garantie)
  for (const type of RELATION_TYPES) {
    const group = byType.get(type) ?? [];
    if (group.length > 0) {
      const best = group[0];
      diverseHead.push(best);
      used.add(best.targetSwingId);
    }
  }

  // compléter avec les arêtes restantes (non encore sélectionnées), triées par poids
  const remaining = edges
    .filter((e) => !used.has(e.targetSwingId))
    .sort((a, b) => b.weight - a.weight);

  // les arêtes diversifiées sont toujours en tête, puis les restantes
  return [...diverseHead, ...remaining];
}

/**
 * Génère des branches de fallback depuis la zone dense,
 * en excluant les swings déjà sélectionnés et les swings complétés.
 */
function buildDenseFallback(
  denseSwingIds: Set<string>,
  completedSwingIds: Set<string>,
  alreadySelected: SwingEdgeInput[],
): SwingEdgeInput[] {
  const selectedIds = new Set(alreadySelected.map((e) => e.targetSwingId));
  const result: SwingEdgeInput[] = [];

  for (const id of denseSwingIds) {
    if (!selectedIds.has(id) && !completedSwingIds.has(id)) {
      result.push(makeDenseEdge(id));
    }
  }

  return result;
}

function makeDenseEdge(swingId: string): SwingEdgeInput {
  return { targetSwingId: swingId, relationType: 'concept_lié', weight: 0.5 };
}

function makeDenseBranch(swingId: string): SwingEdgeInput {
  return makeDenseEdge(swingId);
}

function edgeToSwingBranch(edge: SwingEdgeInput): SwingBranch {
  return {
    targetSwingId: edge.targetSwingId,
    targetSwing: {
      id: edge.targetSwingId,
      title: '',
      type: 'TYPE_A',
      estimatedDuration: 60,
      qualityScore: 0,
    },
    relationType: edge.relationType,
    weight: edge.weight,
  };
}

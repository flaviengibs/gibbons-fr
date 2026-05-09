/**
 * Calcule les trois zones de la canopée pour un apprenant donné.
 *
 * - explored  : swings déjà complétés
 * - dense     : swings non complétés adjacents aux zones explorées
 * - unknown   : tout le reste
 */
export function computeZones(
  allSwingIds: string[],
  completedIds: string[],
  adjacencyList: Map<string, string[]>,
): { explored: string[]; dense: string[]; unknown: string[] } {
  const explored = new Set(completedIds);
  const dense = new Set<string>();

  // zone dense = voisins non complétés des swings explorés
  for (const swingId of explored) {
    const neighbors = adjacencyList.get(swingId) ?? [];
    for (const neighbor of neighbors) {
      if (!explored.has(neighbor)) {
        dense.add(neighbor);
      }
    }
  }

  const unknown = allSwingIds.filter(
    (id) => !explored.has(id) && !dense.has(id),
  );

  return {
    explored: [...explored],
    dense: [...dense],
    unknown,
  };
}

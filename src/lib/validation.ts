// champs obligatoires pour la publication d'un swing
const REQUIRED_FIELDS = [
  'type',
  'title',
  'content',
  'branchId',
  'estimatedDuration',
] as const;

type RequiredField = (typeof REQUIRED_FIELDS)[number];

export type ValidationResult =
  | { success: true }
  | { success: false; missingFields: string[] };

/**
 * Valide qu'un objet partiel contient tous les champs obligatoires
 * nécessaires à la publication d'un swing.
 *
 * Retourne { success: true } si tous les champs sont présents,
 * ou { success: false, missingFields: string[] } avec la liste exacte
 * des champs manquants.
 */
export function validateSwing(
  data: Partial<Record<RequiredField, unknown>>,
): ValidationResult {
  const missingFields: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    const value = data[field];
    if (value === undefined || value === null) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    return { success: false, missingFields };
  }

  return { success: true };
}

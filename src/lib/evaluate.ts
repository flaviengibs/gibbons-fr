/**
 * evaluate.ts — correction souple des réponses libres (TYPE_C)
 *
 * Algorithme :
 * 1. Extraire les mots-clés du rubric (mots significatifs > 3 lettres)
 * 2. Calculer le taux de présence de ces mots-clés dans la réponse
 * 3. Retourner un score 0.0–1.0 et un feedback textuel adapté
 *
 * Pas d'IA externe — comparaison lexicale + normalisation.
 */

// Mots vides français à ignorer
const STOP_WORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'mais',
  'donc', 'or', 'ni', 'car', 'que', 'qui', 'quoi', 'dont', 'où', 'ce',
  'cet', 'cette', 'ces', 'mon', 'ton', 'son', 'ma', 'ta', 'sa', 'nos',
  'vos', 'leurs', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles',
  'me', 'te', 'se', 'lui', 'leur', 'y', 'en', 'est', 'sont', 'être', 'avoir',
  'fait', 'plus', 'très', 'bien', 'aussi', 'tout', 'tous', 'toute', 'toutes',
  'par', 'sur', 'sous', 'dans', 'avec', 'sans', 'pour', 'vers', 'chez',
  'entre', 'après', 'avant', 'pendant', 'depuis', 'lors', 'comme', 'même',
  'pas', 'non', 'oui', 'si', 'ne', 'plus', 'moins', 'très', 'peu', 'trop',
  'the', 'and', 'or', 'but', 'for', 'nor', 'yet', 'so', 'is', 'are', 'was',
]);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // supprimer les accents
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractKeywords(text: string): string[] {
  return normalize(text)
    .split(' ')
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));
}

export interface EvaluationResult {
  score: number;        // 0.0–1.0
  level: 'excellent' | 'good' | 'partial' | 'weak';
  feedback: string;
  matchedKeywords: string[];
  missedKeywords: string[];
}

export function evaluateAnswer(
  userAnswer: string,
  rubric: string,
): EvaluationResult {
  if (!userAnswer.trim()) {
    return {
      score: 0,
      level: 'weak',
      feedback: 'Aucune réponse fournie.',
      matchedKeywords: [],
      missedKeywords: extractKeywords(rubric),
    };
  }

  const rubricKeywords = extractKeywords(rubric);
  const answerNormalized = normalize(userAnswer);

  if (rubricKeywords.length === 0) {
    // Pas de mots-clés dans le rubric — on accepte toute réponse substantielle
    const hasContent = userAnswer.trim().split(/\s+/).length >= 5;
    return {
      score: hasContent ? 0.8 : 0.4,
      level: hasContent ? 'good' : 'partial',
      feedback: hasContent
        ? 'Bonne réflexion — votre réponse est développée.'
        : 'Essayez de développer davantage votre réponse.',
      matchedKeywords: [],
      missedKeywords: [],
    };
  }

  // Compter les mots-clés présents dans la réponse
  const matched: string[] = [];
  const missed: string[] = [];

  for (const keyword of rubricKeywords) {
    // Correspondance exacte ou racine commune (3 premiers caractères)
    const stem = keyword.slice(0, 4);
    if (answerNormalized.includes(keyword) || answerNormalized.includes(stem)) {
      matched.push(keyword);
    } else {
      missed.push(keyword);
    }
  }

  // Dédupliquer
  const uniqueMatched = [...new Set(matched)];
  const uniqueMissed = [...new Set(missed)];

  const rawScore = uniqueMatched.length / rubricKeywords.length;

  // Bonus si la réponse est longue et développée
  const wordCount = userAnswer.trim().split(/\s+/).length;
  const lengthBonus = wordCount >= 20 ? 0.1 : wordCount >= 10 ? 0.05 : 0;

  const score = Math.min(1.0, rawScore + lengthBonus);

  let level: EvaluationResult['level'];
  let feedback: string;

  if (score >= 0.75) {
    level = 'excellent';
    feedback = 'Excellente réponse — vous avez bien cerné les éléments clés.';
  } else if (score >= 0.5) {
    level = 'good';
    feedback = 'Bonne réponse — quelques éléments importants pourraient être approfondis.';
  } else if (score >= 0.25) {
    level = 'partial';
    feedback = 'Réponse partielle — vous êtes sur la bonne voie, mais des aspects essentiels manquent.';
  } else {
    level = 'weak';
    feedback = 'Réponse à développer — relisez le rubric pour identifier les points clés.';
  }

  return { score, level, feedback, matchedKeywords: uniqueMatched, missedKeywords: uniqueMissed };
}

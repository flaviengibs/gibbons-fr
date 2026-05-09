/**
 * SwingMeta — métadonnées affichées en haut de chaque swing.
 * Affiche : durée estimée, score qualité, label créateur, type de swing.
 */

import type { Swing, SwingType } from '@/types/index';

interface SwingMetaProps {
  swing: Pick<Swing, 'estimatedDuration' | 'qualityScore' | 'creatorLabel' | 'type'>;
}

const TYPE_LABELS: Record<SwingType, string> = {
  TYPE_A: 'Insight',
  TYPE_B: 'Défi',
  TYPE_C: 'Exercice',
  TYPE_D: 'Réflexion',
};

const TYPE_COLORS: Record<SwingType, string> = {
  TYPE_A: 'bg-blue-100 text-blue-800',
  TYPE_B: 'bg-orange-100 text-orange-800',
  TYPE_C: 'bg-green-100 text-green-800',
  TYPE_D: 'bg-purple-100 text-purple-800',
};

function QualityStars({ score }: { score: number }) {
  const rounded = Math.round(score * 2) / 2; // arrondi au 0.5 le plus proche
  const full = Math.floor(rounded);
  const half = rounded % 1 !== 0;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <span
      className="flex items-center gap-0.5"
      aria-label={`score qualité : ${score.toFixed(1)} sur 5`}
    >
      {Array.from({ length: full }).map((_, i) => (
        <span key={`full-${i}`} className="text-yellow-400" aria-hidden="true">
          ★
        </span>
      ))}
      {half && (
        <span className="text-yellow-400" aria-hidden="true">
          ½
        </span>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`empty-${i}`} className="text-gray-300" aria-hidden="true">
          ★
        </span>
      ))}
      <span className="ml-1 text-xs text-gray-500">{score.toFixed(1)}</span>
    </span>
  );
}

export function SwingMeta({ swing }: SwingMetaProps) {
  const { estimatedDuration, qualityScore, creatorLabel, type } = swing;

  return (
    <div
      className="flex flex-wrap items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm border-b border-gray-100 text-sm"
      role="region"
      aria-label="Métadonnées du swing"
    >
      {/* durée estimée */}
      <span
        className="flex items-center gap-1 text-gray-600"
        aria-label={`durée estimée : environ ${estimatedDuration} secondes`}
      >
        <span aria-hidden="true">⏱</span>
        <span>~{estimatedDuration}s</span>
      </span>

      {/* score qualité */}
      <QualityStars score={qualityScore} />

      {/* label créateur */}
      <span
        className="flex items-center gap-1 text-gray-600"
        aria-label={`créé par ${creatorLabel}`}
      >
        <span aria-hidden="true">✍</span>
        <span>{creatorLabel}</span>
      </span>

      {/* type de swing */}
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[type]}`}
        aria-label={`type : ${TYPE_LABELS[type]}`}
      >
        {type.replace('_', '\u00A0')} — {TYPE_LABELS[type]}
      </span>
    </div>
  );
}

/**
 * BranchCard — carte d'une branche de saut.
 * Affiche : titre, type, durée estimée, relationType (badge coloré).
 * Accessible : role="button", tabIndex, onKeyDown pour Enter/Space.
 */

import type { SwingBranch, BranchRelationType, SwingType } from '@/types/index';

interface BranchCardProps {
  branch: SwingBranch;
  onClick: () => void;
}

const RELATION_LABELS: Record<BranchRelationType, string> = {
  'concept_lié': 'Concept lié',
  'difficulté_différente': 'Difficulté différente',
  'surprise': 'Surprise',
};

const RELATION_COLORS: Record<BranchRelationType, string> = {
  'concept_lié': 'bg-blue-100 text-blue-800',
  'difficulté_différente': 'bg-orange-100 text-orange-800',
  'surprise': 'bg-pink-100 text-pink-800',
};

const TYPE_ICONS: Record<SwingType, string> = {
  TYPE_A: '💡',
  TYPE_B: '🎯',
  TYPE_C: '✏️',
  TYPE_D: '🔍',
};

export function BranchCard({ branch, onClick }: BranchCardProps) {
  const { targetSwing, relationType } = branch;
  const { title, type, estimatedDuration } = targetSwing;

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`aller vers : ${title} — ${RELATION_LABELS[relationType]}, environ ${estimatedDuration} secondes`}
      className="flex flex-col gap-3 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 cursor-pointer transition-all select-none"
    >
      {/* icône du type + titre */}
      <div className="flex items-start gap-2">
        <span className="text-xl flex-shrink-0" aria-hidden="true">
          {TYPE_ICONS[type]}
        </span>
        <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2">
          {title}
        </p>
      </div>

      {/* durée estimée */}
      <p className="text-xs text-gray-500" aria-hidden="true">
        ~{estimatedDuration}s
      </p>

      {/* badge relationType */}
      <span
        className={`self-start inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${RELATION_COLORS[relationType]}`}
        aria-hidden="true"
      >
        {RELATION_LABELS[relationType]}
      </span>
    </div>
  );
}

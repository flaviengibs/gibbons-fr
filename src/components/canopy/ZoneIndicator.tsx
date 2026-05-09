/**
 * ZoneIndicator — badge coloré pour une zone de la canopée.
 * Vert (explored), orange (dense), gris (unknown).
 * Accessible : aria-label descriptif.
 */

import type { ZoneType } from '@/types/index';

interface ZoneIndicatorProps {
  zone: ZoneType;
  count: number;
}

const ZONE_CONFIG: Record<
  ZoneType,
  { label: string; color: string; dot: string; description: string }
> = {
  explored: {
    label: 'Explorée',
    color: 'bg-green-100 text-green-800 border-green-300',
    dot: 'bg-green-500',
    description: 'Swings déjà complétés',
  },
  dense: {
    label: 'Dense',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    dot: 'bg-orange-400',
    description: 'Swings accessibles proches de vos zones explorées',
  },
  unknown: {
    label: 'Inconnue',
    color: 'bg-gray-100 text-gray-600 border-gray-300',
    dot: 'bg-gray-400',
    description: 'Swings non encore accessibles',
  },
};

export function ZoneIndicator({ zone, count }: ZoneIndicatorProps) {
  const config = ZONE_CONFIG[zone];

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${config.color}`}
      aria-label={`zone ${config.label} : ${count} swing${count !== 1 ? 's' : ''} — ${config.description}`}
    >
      {/* point coloré */}
      <span
        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${config.dot}`}
        aria-hidden="true"
      />

      {/* label de la zone */}
      <span className="text-sm font-medium">{config.label}</span>

      {/* compteur */}
      <span
        className="text-sm font-bold"
        aria-hidden="true"
      >
        {count}
      </span>
    </div>
  );
}

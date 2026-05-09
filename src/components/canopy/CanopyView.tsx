/**
 * CanopyView — vue spatiale de la progression apprenant.
 * Affiche les 3 zones avec ZoneIndicator.
 * Ne contient aucun pourcentage de complétion global.
 */

import type { LearnerProgress } from '@/types/index';
import { ZoneIndicator } from './ZoneIndicator';

interface CanopyViewProps {
  progress: LearnerProgress;
}

export function CanopyView({ progress }: CanopyViewProps) {
  const { exploredSwingIds, denseSwingIds } = progress;

  const exploredCount = exploredSwingIds.length;
  const denseCount = denseSwingIds.length;

  // zone inconnue = tous les swings publiés moins explorés et denses
  // (le composant reçoit uniquement LearnerProgress, donc on affiche ce qu'on a)
  // Pour afficher le nombre de swings inconnus, il faudrait le total — on l'omet ici
  // et on affiche uniquement les zones connues avec leurs compteurs.

  return (
    <section
      aria-label="Canopée — votre progression d'exploration"
      className="flex flex-col gap-6 p-6"
    >
      <h2 className="text-xl font-semibold text-gray-800">Votre canopée</h2>

      <p className="text-sm text-gray-500">
        Explorez la forêt à votre rythme — chaque saut ouvre de nouveaux territoires.
      </p>

      {/* indicateurs de zones */}
      <div
        className="flex flex-wrap gap-3"
        role="list"
        aria-label="zones de la canopée"
      >
        <div role="listitem">
          <ZoneIndicator zone="explored" count={exploredCount} />
        </div>
        <div role="listitem">
          <ZoneIndicator zone="dense" count={denseCount} />
        </div>
        <div role="listitem">
          <ZoneIndicator zone="unknown" count={0} />
        </div>
      </div>

      {/* représentation visuelle des zones */}
      <div
        className="relative w-full h-32 rounded-2xl overflow-hidden bg-gradient-to-r from-green-200 via-orange-100 to-gray-200"
        aria-hidden="true"
      >
        {/* zone explorée */}
        <div
          className="absolute inset-y-0 left-0 bg-green-400/60 flex items-center justify-center"
          style={{
            width:
              exploredCount + denseCount > 0
                ? `${Math.max(10, (exploredCount / Math.max(exploredCount + denseCount, 1)) * 60)}%`
                : '10%',
          }}
        >
          <span className="text-white text-xs font-medium drop-shadow">Explorée</span>
        </div>

        {/* zone dense */}
        <div
          className="absolute inset-y-0 bg-orange-300/60 flex items-center justify-center"
          style={{
            left:
              exploredCount + denseCount > 0
                ? `${Math.max(10, (exploredCount / Math.max(exploredCount + denseCount, 1)) * 60)}%`
                : '10%',
            width: denseCount > 0 ? '30%' : '15%',
          }}
        >
          <span className="text-white text-xs font-medium drop-shadow">Dense</span>
        </div>

        {/* zone inconnue (reste) */}
        <div className="absolute inset-y-0 right-0 left-[40%] bg-gray-300/40 flex items-center justify-center">
          <span className="text-gray-600 text-xs font-medium">Inconnue</span>
        </div>
      </div>

      {/* détail textuel accessible */}
      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div className="flex flex-col gap-1 p-3 bg-green-50 rounded-lg border border-green-200">
          <dt className="font-medium text-green-800">Zone explorée</dt>
          <dd className="text-green-700">
            {exploredCount} swing{exploredCount !== 1 ? 's' : ''} complétés
          </dd>
        </div>
        <div className="flex flex-col gap-1 p-3 bg-orange-50 rounded-lg border border-orange-200">
          <dt className="font-medium text-orange-800">Zone dense</dt>
          <dd className="text-orange-700">
            {denseCount} swing{denseCount !== 1 ? 's' : ''} accessibles
          </dd>
        </div>
        <div className="flex flex-col gap-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <dt className="font-medium text-gray-700">Zone inconnue</dt>
          <dd className="text-gray-600">Territoire à découvrir</dd>
        </div>
      </dl>
    </section>
  );
}

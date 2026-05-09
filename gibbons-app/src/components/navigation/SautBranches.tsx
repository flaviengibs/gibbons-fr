/**
 * SautBranches — les 3 choix directionnels après complétion d'un swing.
 * Affiche exactement 3 BranchCard en disposition flex row / grid 3 colonnes.
 * Prefetch au survol, navigation après 300ms.
 */

'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { SwingBranch } from '@/types/index';
import { BranchCard } from './BranchCard';

interface SautBranchesProps {
  branches: SwingBranch[];
  onSelect: (swingId: string) => void;
}

export function SautBranches({ branches, onSelect }: SautBranchesProps) {
  const router = useRouter();

  const handleMouseEnter = useCallback(
    (swingId: string) => {
      router.prefetch(`/swing/${swingId}`);
    },
    [router],
  );

  const handleSelect = useCallback(
    (swingId: string) => {
      // initier la navigation après 300ms (req. 8.2)
      setTimeout(() => {
        onSelect(swingId);
      }, 300);
    },
    [onSelect],
  );

  // on affiche au maximum 3 branches (la spec garantit toujours exactement 3)
  const displayedBranches = branches.slice(0, 3);

  return (
    <nav
      aria-label="Branches de saut disponibles"
      className="w-full max-w-3xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {displayedBranches.map((branch) => (
          <div
            key={branch.targetSwingId}
            onMouseEnter={() => handleMouseEnter(branch.targetSwingId)}
            onFocus={() => handleMouseEnter(branch.targetSwingId)}
          >
            <BranchCard
              branch={branch}
              onClick={() => handleSelect(branch.targetSwingId)}
            />
          </div>
        ))}
      </div>
    </nav>
  );
}

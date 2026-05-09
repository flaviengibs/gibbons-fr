'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';

/**
 * NavFilter — filtre officiel / UGC dans la barre de navigation.
 * Stocke le filtre dans le query param ?filter=official|ugc.
 * La page d'accueil lit ce param pour afficher les bons swings.
 */
export function NavFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get('filter') ?? 'official';

  const setFilter = useCallback(
    (value: 'official' | 'ugc') => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('filter', value);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return (
    <div
      className="flex items-center bg-gray-100 rounded-full p-0.5 gap-0.5"
      role="group"
      aria-label="Filtre de contenu"
    >
      <button
        type="button"
        onClick={() => setFilter('official')}
        aria-pressed={current === 'official'}
        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gray-900 ${
          current === 'official'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Officiel
      </button>
      <button
        type="button"
        onClick={() => setFilter('ugc')}
        aria-pressed={current === 'ugc'}
        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gray-900 ${
          current === 'ugc'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Communauté
      </button>
    </div>
  );
}

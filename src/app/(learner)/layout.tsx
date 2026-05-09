import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { NavFilter } from '@/components/ui/NavFilter';

interface LearnerLayoutProps {
  children: ReactNode;
}

export default async function LearnerLayout({ children }: LearnerLayoutProps) {
  const session = await auth();

  if (!session?.user?.userId) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* barre de navigation */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <nav
          className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4"
          aria-label="Navigation principale"
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center flex-shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
            aria-label="Gibbons — accueil"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/logo5small.png"
              alt="Gibbons"
              height={32}
              style={{ height: '32px', width: 'auto' }}
            />
          </Link>

          {/* Filtre officiel / UGC */}
          <NavFilter />

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/create"
              className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded px-2 py-1"
              aria-label="Créer un swing"
            >
              <span aria-hidden="true">✏️</span>
              <span className="hidden sm:inline">Créer</span>
            </Link>
            <Link
              href="/leaderboard"
              className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded px-2 py-1"
              aria-label="Voir le classement"
            >
              <span aria-hidden="true">🏆</span>
              <span className="hidden sm:inline">Classement</span>
            </Link>
            <Link
              href="/canopy"
              className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded px-2 py-1"
              aria-label="Voir ma canopée"
            >
              <span aria-hidden="true">🌿</span>
              <span className="hidden sm:inline">Canopée</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* contenu principal */}
      <div className="flex-1">{children}</div>
    </div>
  );
}

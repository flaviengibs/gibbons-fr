import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';

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
          className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between"
          aria-label="navigation principale"
        >
          <Link
            href="/"
            className="flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
            aria-label="Gibbons — accueil"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/logo (5).png"
              alt="Gibbons"
              height={32}
              style={{ height: '32px', width: 'auto' }}
            />
          </Link>

          <Link
            href="/canopy"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded px-2 py-1"
            aria-label="Voir ma canopée"
          >
            <span aria-hidden="true">🌿</span>
            <span>Canopée</span>
          </Link>
        </nav>
      </header>

      {/* contenu principal */}
      <div className="flex-1">{children}</div>
    </div>
  );
}

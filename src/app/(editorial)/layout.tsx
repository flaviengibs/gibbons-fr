import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';

interface EditorialLayoutProps {
  children: ReactNode;
}

export default async function EditorialLayout({ children }: EditorialLayoutProps) {
  const session = await auth();

  if (!session?.user?.userId) {
    redirect('/login');
  }

  const role = session.user.role;
  if (role !== 'CREATOR' && role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* barre de navigation éditoriale */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <nav
          className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between"
          aria-label="navigation éditoriale"
        >
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
              aria-label="Gibbons — accueil"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/logo5small.png"
                alt="Gibbons"
                height={28}
                style={{ height: '28px', width: 'auto' }}
              />
            </Link>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Back-office
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded px-2 py-1"
            >
              Tableau de bord
            </Link>
            <Link
              href="/swings/new"
              className="text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded-full px-4 py-1.5 transition-colors"
            >
              + Nouveau swing
            </Link>
          </div>
        </nav>
      </header>

      {/* contenu principal */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">{children}</div>
    </div>
  );
}

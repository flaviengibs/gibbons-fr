import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { CanopyView } from '@/components/canopy/CanopyView';
import type { LearnerProgress } from '@/types/index';

export default async function CanopyPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const res = await fetch(
    `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/api/progress`,
    {
      headers: {
        Cookie: cookieHeader,
      },
      cache: 'no-store',
    },
  );

  if (res.status === 401) {
    redirect('/login');
  }

  if (!res.ok) {
    throw new Error(`Erreur lors du chargement de la progression (${res.status})`);
  }

  const progress = (await res.json()) as LearnerProgress;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <CanopyView progress={progress} />

      {/* lien de retour vers le dernier swing */}
      {progress.lastSwingId && (
        <div className="mt-6 text-center">
          <a
            href={`/swing/${progress.lastSwingId}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
          >
            <span aria-hidden="true">←</span>
            <span>reprendre là où j'en étais</span>
          </a>
        </div>
      )}
    </main>
  );
}

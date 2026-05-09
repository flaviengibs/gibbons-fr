import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';
import type { LearnerProgress } from '@/types/index';

export default async function HomePage() {
  const session = await auth();

  if (!session?.user?.userId) {
    redirect('/login');
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  let lastSwingId: string | null = null;

  try {
    const progressRes = await fetch(
      `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/api/progress`,
      { headers: { Cookie: cookieHeader }, cache: 'no-store' },
    );
    if (progressRes.ok) {
      const progress = (await progressRes.json()) as LearnerProgress;
      lastSwingId = progress.lastSwingId ?? null;
    }
  } catch { /* continue sans progression */ }

  if (lastSwingId) {
    redirect(`/swing/${lastSwingId}`);
  }

  let firstSwingId: string | null = null;

  try {
    const swingsRes = await fetch(
      `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/api/swings?first=true`,
      { headers: { Cookie: cookieHeader }, cache: 'no-store' },
    );
    if (swingsRes.ok) {
      const data = (await swingsRes.json()) as { id: string } | { id: string }[];
      if (Array.isArray(data) && data.length > 0) {
        firstSwingId = data[0].id;
      } else if (!Array.isArray(data) && (data as { id: string }).id) {
        firstSwingId = (data as { id: string }).id;
      }
    }
  } catch { /* continue sans premier swing */ }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center">
      <div className="max-w-md space-y-8">
        <div className="space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/logo (4).png"
            alt="Gibbons"
            style={{ height: '100px', width: 'auto', margin: '0 auto' }}
          />
          <p className="text-gray-600 leading-relaxed">
            La connaissance, sans chemin imposé.<br />
            Chaque swing dure 1 à 3 minutes — un insight, un déclic.
          </p>
        </div>

        {firstSwingId ? (
          <Link
            href={`/swing/${firstSwingId}`}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-colors text-lg"
            aria-label="Commencer votre exploration"
          >
            <span>Commencer</span>
            <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Aucun swing disponible pour le moment.</p>
            <Link
              href="/canopy"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-colors"
            >
              Voir ma canopée
            </Link>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 text-xs text-gray-500 pt-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl" aria-hidden="true">🟢</span>
            <span>Zone explorée</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl" aria-hidden="true">🟠</span>
            <span>Zone dense</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl" aria-hidden="true">⚫</span>
            <span>Zone inconnue</span>
          </div>
        </div>
      </div>
    </main>
  );
}

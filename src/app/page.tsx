import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await auth();

  if (!session?.user?.userId) {
    redirect('/login');
  }

  const learnerId = session.user.userId;
  const { filter } = await searchParams;
  const isUGC = filter === 'ugc';

  // Récupérer le dernier swing visité
  const learnerProgress = await db.learnerProgress.findUnique({
    where: { userId: learnerId },
    select: { lastSwingId: true },
  }).catch(() => null);

  if (learnerProgress?.lastSwingId && !isUGC) {
    redirect(`/swing/${learnerProgress.lastSwingId}`);
  }

  if (isUGC) {
    // Mode UGC : afficher la liste des swings communauté
    const ugcSwings = await db.swing.findMany({
      where: { isPublished: true, isUGC: true },
      orderBy: { publishedAt: 'desc' },
      take: 20,
      select: {
        id: true,
        title: true,
        type: true,
        estimatedDuration: true,
        qualityScore: true,
        creator: { select: { name: true } },
        branch: { select: { name: true } },
      },
    });

    const TYPE_ICONS: Record<string, string> = {
      TYPE_A: '💡', TYPE_B: '🎯', TYPE_C: '✏️', TYPE_D: '🔍',
    };

    return (
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Swings de la communauté</h1>
          <p className="text-sm text-gray-500 mt-1">
            Créés et partagés par les apprenants Gibbons.
          </p>
        </div>

        {ugcSwings.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-4xl" aria-hidden="true">🌱</p>
            <p className="text-gray-600">Aucun swing communauté pour l'instant.</p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-700 transition-colors"
            >
              Créer le premier
            </Link>
          </div>
        ) : (
          <ul className="space-y-3" role="list">
            {ugcSwings.map((swing) => (
              <li key={swing.id}>
                <Link
                  href={`/swing/${swing.id}`}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <span className="text-2xl flex-shrink-0" aria-hidden="true">
                    {TYPE_ICONS[swing.type] ?? '📖'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{swing.title}</p>
                    <p className="text-xs text-gray-500">
                      {swing.branch.name} · ~{swing.estimatedDuration}s
                      {swing.creator.name && ` · par ${swing.creator.name}`}
                    </p>
                  </div>
                  {swing.qualityScore > 0 && (
                    <span className="text-xs text-yellow-600 flex-shrink-0">
                      ★ {swing.qualityScore.toFixed(1)}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-100 transition-colors"
          >
            <span aria-hidden="true">✏️</span>
            Contribuer un swing
          </Link>
        </div>
      </main>
    );
  }

  // Mode officiel : récupérer le premier swing publié
  const firstSwing = await db.swing.findFirst({
    where: { isPublished: true, isUGC: false },
    orderBy: { publishedAt: 'asc' },
    select: { id: true },
  }).catch(() => null);

  const firstSwingId = firstSwing?.id ?? null;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center">
      <div className="max-w-md space-y-8">
        <div className="space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/logo5small.png"
            alt="Gibbons"
            style={{ height: '80px', width: 'auto', margin: '0 auto' }}
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

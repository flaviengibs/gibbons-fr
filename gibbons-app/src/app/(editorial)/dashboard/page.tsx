import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.userId) {
    redirect('/login');
  }

  const { role, userId } = session.user;
  if (role !== 'CREATOR' && role !== 'ADMIN') {
    redirect('/');
  }

  // récupérer les swings du créateur connecté (ou tous si ADMIN)
  const swings = await db.swing.findMany({
    where: role === 'ADMIN' ? {} : { creatorId: userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      type: true,
      isPublished: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      branch: {
        select: { name: true },
      },
    },
  });

  const drafts = swings.filter((s) => !s.isPublished);
  const published = swings.filter((s) => s.isPublished);

  return (
    <div className="space-y-8">
      {/* en-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-sm text-gray-500 mt-1">
            {swings.length} swing{swings.length !== 1 ? 's' : ''} au total
            {role === 'ADMIN' ? ' (vue admin — tous les créateurs)' : ''}
          </p>
        </div>
        <Link
          href="/swings/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-colors"
        >
          <span aria-hidden="true">+</span>
          <span>Nouveau swing</span>
        </Link>
      </div>

      {/* brouillons */}
      <section aria-labelledby="drafts-heading">
        <h2 id="drafts-heading" className="text-lg font-semibold text-gray-800 mb-4">
          Brouillons
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({drafts.length})
          </span>
        </h2>

        {drafts.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Aucun brouillon.</p>
        ) : (
          <ul className="space-y-3" role="list">
            {drafts.map((swing) => (
              <li
                key={swing.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      Brouillon
                    </span>
                    <span className="text-xs text-gray-400">{swing.type}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-900 truncate">
                    {swing.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    Branche : {swing.branch.name}
                  </p>
                </div>
                <Link
                  href={`/swings/${swing.id}/edit`}
                  className="ml-4 text-sm font-medium text-blue-600 hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded"
                  aria-label={`Modifier le swing "${swing.title}"`}
                >
                  Modifier
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* publiés */}
      <section aria-labelledby="published-heading">
        <h2 id="published-heading" className="text-lg font-semibold text-gray-800 mb-4">
          Publiés
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({published.length})
          </span>
        </h2>

        {published.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Aucun swing publié.</p>
        ) : (
          <ul className="space-y-3" role="list">
            {published.map((swing) => (
              <li
                key={swing.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Publié
                    </span>
                    <span className="text-xs text-gray-400">{swing.type}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-900 truncate">
                    {swing.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    Branche : {swing.branch.name}
                    {swing.publishedAt && (
                      <> · Publié le {new Date(swing.publishedAt).toLocaleDateString('fr-FR')}</>
                    )}
                  </p>
                </div>
                {/* les swings publiés ne sont pas modifiables */}
                <span
                  className="ml-4 text-sm text-gray-400"
                  aria-label={`swing "${swing.title}" publié — non modifiable`}
                >
                  publié
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

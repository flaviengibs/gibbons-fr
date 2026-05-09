import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { computeZones } from '@/lib/zones';
import { CanopyView } from '@/components/canopy/CanopyView';
import type { LearnerProgress } from '@/types/index';

export default async function CanopyPage() {
  const session = await auth();

  if (!session?.user?.userId) {
    redirect('/login');
  }

  const learnerId = session.user.userId;

  const [completions, allPublishedSwings, learnerProgress] = await Promise.all([
    db.swingCompletion.findMany({
      where: { userId: learnerId },
      select: { swingId: true },
    }),
    db.swing.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        outgoingBranches: { select: { targetSwingId: true } },
      },
    }),
    db.learnerProgress.findUnique({
      where: { userId: learnerId },
      select: { lastSwingId: true, lastSessionAt: true },
    }),
  ]);

  const completedIds = completions.map((c) => c.swingId);

  const adjacencyList = new Map<string, string[]>();
  for (const s of allPublishedSwings) {
    adjacencyList.set(s.id, s.outgoingBranches.map((e) => e.targetSwingId));
  }

  const zones = computeZones(
    allPublishedSwings.map((s) => s.id),
    completedIds,
    adjacencyList,
  );

  const progress: LearnerProgress = {
    learnerId,
    exploredSwingIds: zones.explored,
    denseSwingIds: zones.dense,
    lastSwingId: learnerProgress?.lastSwingId ?? null,
    lastSessionAt: learnerProgress?.lastSessionAt ?? new Date(),
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <CanopyView progress={progress} />

      {progress.lastSwingId && (
        <div className="mt-6 text-center">
          <a
            href={`/swing/${progress.lastSwingId}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
          >
            <span aria-hidden="true">←</span>
            <span>Reprendre là où j'en étais</span>
          </a>
        </div>
      )}
    </main>
  );
}

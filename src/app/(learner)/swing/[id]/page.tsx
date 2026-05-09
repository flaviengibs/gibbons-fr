import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { selectBranches, type SwingEdgeInput } from '@/lib/navigation';
import { computeZones } from '@/lib/zones';
import { SwingScreen } from '@/components/swing/SwingScreen';
import { PendingSync } from '@/components/ui/PendingSync';
import type { SwingScreenPayload, SwingBranch, BranchRelationType, ZoneType, SwingType } from '@/types/index';

interface SwingPageProps {
  params: Promise<{ id: string }>;
}

function mapRelationType(t: 'CONCEPT_LIE' | 'DIFFICULTE_DIFFERENTE' | 'SURPRISE'): BranchRelationType {
  if (t === 'CONCEPT_LIE') return 'concept_lié';
  if (t === 'DIFFICULTE_DIFFERENTE') return 'difficulté_différente';
  return 'surprise';
}

export default async function SwingPage({ params }: SwingPageProps) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.userId) {
    redirect('/login');
  }

  const learnerId = session.user.userId;

  const swing = await db.swing.findUnique({
    where: { id },
    include: {
      branch: true,
      creator: { select: { id: true, name: true } },
      outgoingBranches: {
        include: {
          targetSwing: {
            select: { id: true, title: true, type: true, estimatedDuration: true, qualityScore: true },
          },
        },
      },
    },
  });

  if (!swing) notFound();

  const [completions, allPublishedSwings] = await Promise.all([
    db.swingCompletion.findMany({ where: { userId: learnerId }, select: { swingId: true } }),
    db.swing.findMany({
      where: { isPublished: true },
      select: { id: true, outgoingBranches: { select: { targetSwingId: true } } },
    }),
  ]);

  const completedIds = new Set(completions.map((c) => c.swingId));
  const adjacencyList = new Map<string, string[]>();
  for (const s of allPublishedSwings) {
    adjacencyList.set(s.id, s.outgoingBranches.map((e) => e.targetSwingId));
  }

  const zones = computeZones(allPublishedSwings.map((s) => s.id), [...completedIds], adjacencyList);
  const denseSwingIds = new Set(zones.dense);

  const edges: SwingEdgeInput[] = swing.outgoingBranches.map((edge) => ({
    targetSwingId: edge.targetSwingId,
    relationType: mapRelationType(edge.relationType),
    weight: edge.weight,
  }));

  const rawBranches = selectBranches(edges, completedIds, denseSwingIds);
  const targetSwingMap = new Map(swing.outgoingBranches.map((e) => [e.targetSwingId, e.targetSwing]));

  const branches: SwingBranch[] = rawBranches.map((branch) => {
    const t = targetSwingMap.get(branch.targetSwingId);
    return {
      ...branch,
      targetSwing: {
        id: branch.targetSwingId,
        title: t?.title ?? '',
        type: (t?.type ?? 'TYPE_A') as SwingType,
        estimatedDuration: t?.estimatedDuration ?? 60,
        qualityScore: t?.qualityScore ?? 0,
      },
    };
  });

  let learnerZone: ZoneType = 'unknown';
  if (zones.explored.includes(id)) learnerZone = 'explored';
  else if (zones.dense.includes(id)) learnerZone = 'dense';

  const payload: SwingScreenPayload = {
    swing: {
      id: swing.id,
      type: swing.type as SwingType,
      title: swing.title,
      content: swing.content as unknown as SwingScreenPayload['swing']['content'],
      branchId: swing.branchId,
      forestId: swing.branch.forestId,
      estimatedDuration: swing.estimatedDuration,
      creatorId: swing.creatorId,
      creatorLabel: swing.creator.name ?? swing.creator.id,
      qualityScore: swing.qualityScore,
      isPublished: swing.isPublished,
      publishedAt: swing.publishedAt,
      createdAt: swing.createdAt,
      updatedAt: swing.updatedAt,
    },
    branches,
    learnerZone,
  };

  return (
    <>
      <PendingSync />
      <SwingScreen payload={payload} />
    </>
  );
}

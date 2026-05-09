import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { selectBranches, type SwingEdgeInput } from '@/lib/navigation';
import { computeZones } from '@/lib/zones';
import type { SwingBranch, BranchRelationType, SwingType } from '@/types/index';

// ─── Mapping enums Prisma → TypeScript ───────────────────────────────────────

function mapRelationType(
  prismaType: 'CONCEPT_LIE' | 'DIFFICULTE_DIFFERENTE' | 'SURPRISE',
): BranchRelationType {
  switch (prismaType) {
    case 'CONCEPT_LIE':
      return 'concept_lié';
    case 'DIFFICULTE_DIFFERENTE':
      return 'difficulté_différente';
    case 'SURPRISE':
      return 'surprise';
  }
}

// ─── GET /api/swings/[id]/branches ───────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.userId) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const { id } = await params;
  const learnerId = session.user.userId;

  try {
    // récupérer le swing avec ses arêtes sortantes
    const swing = await db.swing.findUnique({
      where: { id },
      include: {
        outgoingBranches: {
          include: {
            targetSwing: {
              select: {
                id: true,
                title: true,
                type: true,
                estimatedDuration: true,
                qualityScore: true,
              },
            },
          },
        },
      },
    });

    if (!swing) {
      return NextResponse.json(
        { error: 'Swing introuvable.', code: 'SWING_NOT_FOUND', swingId: id },
        { status: 404 },
      );
    }

    // récupérer la progression de l'apprenant
    const [completions, allPublishedSwings] = await Promise.all([
      db.swingCompletion.findMany({
        where: { userId: learnerId },
        select: { swingId: true },
      }),
      db.swing.findMany({
        where: { isPublished: true },
        select: {
          id: true,
          outgoingBranches: {
            select: { targetSwingId: true },
          },
        },
      }),
    ]);

    const completedIds = new Set(completions.map((c) => c.swingId));

    // construire la liste d'adjacence pour computeZones
    const adjacencyList = new Map<string, string[]>();
    for (const s of allPublishedSwings) {
      adjacencyList.set(
        s.id,
        s.outgoingBranches.map((e) => e.targetSwingId),
      );
    }

    const zones = computeZones(
      allPublishedSwings.map((s) => s.id),
      [...completedIds],
      adjacencyList,
    );

    const denseSwingIds = new Set(zones.dense);

    // construire les arêtes pour selectBranches
    const edges: SwingEdgeInput[] = swing.outgoingBranches.map((edge) => ({
      targetSwingId: edge.targetSwingId,
      relationType: mapRelationType(edge.relationType),
      weight: edge.weight,
    }));

    // calculer les 3 branches
    const rawBranches = selectBranches(edges, completedIds, denseSwingIds);

    // enrichir les branches avec les données réelles des swings cibles
    const targetSwingMap = new Map(
      swing.outgoingBranches.map((e) => [e.targetSwingId, e.targetSwing]),
    );

    const branches: SwingBranch[] = rawBranches.map((branch) => {
      const targetData = targetSwingMap.get(branch.targetSwingId);
      return {
        ...branch,
        targetSwing: {
          id: branch.targetSwingId,
          title: targetData?.title ?? '',
          type: (targetData?.type ?? 'TYPE_A') as SwingType,
          estimatedDuration: targetData?.estimatedDuration ?? 60,
          qualityScore: targetData?.qualityScore ?? 0,
        },
      };
    });

    return NextResponse.json({ branches }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Erreur interne du serveur.' },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { selectBranches, type SwingEdgeInput } from '@/lib/navigation';
import { computeZones } from '@/lib/zones';
import { addPoints, computeSwingPoints } from '@/lib/points';
import type { LearnerProgress, SwingBranch, BranchRelationType, SwingType } from '@/types/index';

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

// ─── POST /api/progress ──────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.userId) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const learnerId = session.user.userId;

  try {
    const body = await request.json();
    const { swingId } = body as { swingId?: string };

    if (!swingId) {
      return NextResponse.json(
        { error: 'Le champ swingId est obligatoire.', missingFields: ['swingId'] },
        { status: 422 },
      );
    }

    // vérifier que le swing existe
    const swing = await db.swing.findUnique({
      where: { id: swingId },
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
        { error: 'Swing introuvable.', code: 'SWING_NOT_FOUND', swingId },
        { status: 404 },
      );
    }

    // upsert SwingCompletion (idempotent)
    const wasAlreadyCompleted = await db.swingCompletion.findUnique({
      where: { userId_swingId: { userId: learnerId, swingId } },
      select: { id: true },
    });

    await db.swingCompletion.upsert({
      where: { userId_swingId: { userId: learnerId, swingId } },
      create: { userId: learnerId, swingId },
      update: {},
    });

    // Attribuer des points seulement si c'est la première complétion
    if (!wasAlreadyCompleted) {
      const pts = computeSwingPoints(swing.type as SwingType);
      await addPoints(learnerId, pts).catch(() => { /* non bloquant */ });
    }

    // upsert LearnerProgress
    await db.learnerProgress.upsert({
      where: { userId: learnerId },
      create: {
        userId: learnerId,
        lastSwingId: swingId,
        lastSessionAt: new Date(),
      },
      update: {
        lastSwingId: swingId,
        lastSessionAt: new Date(),
      },
    });

    // calculer les branches disponibles après complétion
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

    const edges: SwingEdgeInput[] = swing.outgoingBranches.map((edge) => ({
      targetSwingId: edge.targetSwingId,
      relationType: mapRelationType(edge.relationType),
      weight: edge.weight,
    }));

    const rawBranches = selectBranches(edges, completedIds, denseSwingIds);

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

// ─── GET /api/progress ───────────────────────────────────────────────────────

export async function GET(_request: NextRequest) {
  const session = await auth();
  if (!session?.user?.userId) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const learnerId = session.user.userId;

  try {
    // récupérer toutes les completions de l'apprenant
    const [completions, allPublishedSwings, learnerProgress] = await Promise.all([
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
      db.learnerProgress.findUnique({
        where: { userId: learnerId },
        select: { lastSwingId: true, lastSessionAt: true },
      }),
    ]);

    const completedIds = completions.map((c) => c.swingId);

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

    return NextResponse.json(progress, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Erreur interne du serveur.' },
      { status: 500 },
    );
  }
}

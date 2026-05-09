import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { selectBranches, type SwingEdgeInput } from '@/lib/navigation';
import { computeZones } from '@/lib/zones';
import { validateSwing } from '@/lib/validation';
import type {
  SwingScreenPayload,
  SwingBranch,
  BranchRelationType,
  ZoneType,
  SwingType,
} from '@/types/index';

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

// ─── GET /api/swings/[id] ────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.userId) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const { id } = await params;
  const learnerId = session.user.userId;

  // timeout de 5 secondes via AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    // récupérer le swing avec ses relations
    const swing = await db.swing.findUnique({
      where: { id },
      include: {
        branch: true,
        creator: {
          select: { id: true, name: true, isEditorial: true },
        },
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

    clearTimeout(timeoutId);

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

    // déterminer la zone du swing courant pour l'apprenant
    let learnerZone: ZoneType = 'unknown';
    if (zones.explored.includes(id)) {
      learnerZone = 'explored';
    } else if (zones.dense.includes(id)) {
      learnerZone = 'dense';
    }

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

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        {
          error: 'Délai dépassé lors du chargement du swing.',
          code: 'SWING_LOAD_TIMEOUT',
          swingId: id,
          elapsed: 5000,
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: 'Erreur interne du serveur.' },
      { status: 500 },
    );
  }
}

// ─── PUT /api/swings/[id] ────────────────────────────────────────────────────

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.userId) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const { role, userId } = session.user;
  if (role !== 'CREATOR' && role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Accès refusé. Rôle CREATOR ou ADMIN requis.' },
      { status: 403 },
    );
  }

  const { id } = await params;

  try {
    const existing = await db.swing.findUnique({
      where: { id },
      select: { id: true, isPublished: true, creatorId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Swing introuvable.', code: 'SWING_NOT_FOUND', swingId: id },
        { status: 404 },
      );
    }

    if (existing.isPublished) {
      return NextResponse.json(
        {
          error: 'Impossible de modifier un swing déjà publié.',
          code: 'SWING_ALREADY_PUBLISHED',
          swingId: id,
        },
        { status: 403 },
      );
    }

    // vérifier que le créateur est bien le propriétaire (sauf ADMIN)
    if (role !== 'ADMIN' && existing.creatorId !== userId) {
      return NextResponse.json(
        { error: 'Accès refusé. Vous n\'êtes pas le créateur de ce swing.' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { type, title, content, branchId, estimatedDuration } = body as {
      type?: string;
      title?: string;
      content?: unknown;
      branchId?: string;
      estimatedDuration?: number;
    };

    // construire l'objet de mise à jour de façon typée
    type SwingUpdateData = {
      type?: 'TYPE_A' | 'TYPE_B' | 'TYPE_C' | 'TYPE_D';
      title?: string;
      content?: object;
      estimatedDuration?: number;
      branch?: { connect: { id: string } };
    };

    const updateData: SwingUpdateData = {};
    if (type !== undefined) updateData.type = type as 'TYPE_A' | 'TYPE_B' | 'TYPE_C' | 'TYPE_D';
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content as object;
    if (estimatedDuration !== undefined) updateData.estimatedDuration = estimatedDuration;
    if (branchId !== undefined) updateData.branch = { connect: { id: branchId } };

    const updated = await db.swing.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Erreur interne du serveur.' },
      { status: 500 },
    );
  }
}

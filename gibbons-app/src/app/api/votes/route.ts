import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { computeQualityScore } from '@/lib/scoring';

// ─── POST /api/votes ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.userId) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const userId = session.user.userId;

  try {
    const body = await request.json();
    const { swingId, score } = body as { swingId?: string; score?: number };

    // validation des champs obligatoires
    const missingFields: string[] = [];
    if (!swingId) missingFields.push('swingId');
    if (score === undefined || score === null) missingFields.push('score');

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Champs obligatoires manquants.',
          code: 'VALIDATION_ERROR',
          missingFields,
        },
        { status: 422 },
      );
    }

    // valider la plage du score (1–5)
    if (score! < 1 || score! > 5 || !Number.isInteger(score)) {
      return NextResponse.json(
        { error: 'Le score doit être un entier entre 1 et 5.' },
        { status: 422 },
      );
    }

    // vérifier que le swing existe
    const swing = await db.swing.findUnique({
      where: { id: swingId },
      select: { id: true, editorialScore: true },
    });

    if (!swing) {
      return NextResponse.json(
        { error: 'Swing introuvable.', code: 'SWING_NOT_FOUND', swingId },
        { status: 404 },
      );
    }

    // upsert du vote (idempotent)
    await db.swingVote.upsert({
      where: { userId_swingId: { userId, swingId: swingId! } },
      create: { userId, swingId: swingId!, score: score! },
      update: { score: score! },
    });

    // récupérer tous les votes du swing pour recalculer le score
    const allVotes = await db.swingVote.findMany({
      where: { swingId: swingId! },
      select: { score: true },
    });

    const voteScores = allVotes.map((v) => v.score);
    const newQualityScore = computeQualityScore(voteScores, swing.editorialScore);

    // persister le nouveau qualityScore et mettre à jour voteCount
    await db.swing.update({
      where: { id: swingId },
      data: {
        qualityScore: newQualityScore,
        voteCount: voteScores.length,
      },
    });

    return NextResponse.json({ qualityScore: newQualityScore }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Erreur interne du serveur.' },
      { status: 500 },
    );
  }
}

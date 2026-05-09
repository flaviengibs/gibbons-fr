import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { evaluateAnswer } from '@/lib/evaluate';

// ─── POST /api/swings/[id]/evaluate ──────────────────────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.userId) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.userId;

  try {
    const body = await request.json();
    const { answer } = body as { answer?: string };

    if (!answer?.trim()) {
      return NextResponse.json(
        { error: 'La réponse ne peut pas être vide.' },
        { status: 422 },
      );
    }

    // Récupérer le swing et son rubric
    const swing = await db.swing.findUnique({
      where: { id },
      select: { id: true, type: true, content: true },
    });

    if (!swing) {
      return NextResponse.json(
        { error: 'Swing introuvable.', code: 'SWING_NOT_FOUND' },
        { status: 404 },
      );
    }

    if (swing.type !== 'TYPE_C') {
      return NextResponse.json(
        { error: 'Ce swing ne supporte pas l\'évaluation.' },
        { status: 400 },
      );
    }

    const content = swing.content as { rubric?: string };
    const rubric = content.rubric ?? '';

    // Évaluer la réponse
    const evaluation = evaluateAnswer(answer, rubric);

    // Persister la réponse et le feedback
    await db.swingAnswer.create({
      data: {
        userId,
        swingId: id,
        answer,
        feedbackScore: evaluation.score,
        feedbackText: evaluation.feedback,
      },
    });

    return NextResponse.json(
      {
        score: evaluation.score,
        level: evaluation.level,
        feedback: evaluation.feedback,
        rubric,
        matchedKeywords: evaluation.matchedKeywords,
        missedKeywords: evaluation.missedKeywords,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: 'Erreur interne du serveur.' },
      { status: 500 },
    );
  }
}

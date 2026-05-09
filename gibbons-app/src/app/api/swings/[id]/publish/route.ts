import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { validateSwing } from '@/lib/validation';

// ─── POST /api/swings/[id]/publish ───────────────────────────────────────────

export async function POST(
  _request: NextRequest,
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
    const swing = await db.swing.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        title: true,
        content: true,
        branchId: true,
        estimatedDuration: true,
        isPublished: true,
        creatorId: true,
      },
    });

    if (!swing) {
      return NextResponse.json(
        { error: 'Swing introuvable.', code: 'SWING_NOT_FOUND', swingId: id },
        { status: 404 },
      );
    }

    if (swing.isPublished) {
      return NextResponse.json(
        {
          error: 'Ce swing est déjà publié.',
          code: 'SWING_ALREADY_PUBLISHED',
          swingId: id,
        },
        { status: 403 },
      );
    }

    // vérifier que le créateur est bien le propriétaire (sauf ADMIN)
    if (role !== 'ADMIN' && swing.creatorId !== userId) {
      return NextResponse.json(
        { error: 'Accès refusé. Vous n\'êtes pas le créateur de ce swing.' },
        { status: 403 },
      );
    }

    // valider les champs obligatoires avant publication
    const validation = validateSwing({
      type: swing.type,
      title: swing.title,
      content: swing.content,
      branchId: swing.branchId,
      estimatedDuration: swing.estimatedDuration,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Champs obligatoires manquants pour la publication.',
          code: 'VALIDATION_ERROR',
          missingFields: validation.missingFields,
        },
        { status: 422 },
      );
    }

    // publier dans une transaction atomique
    const published = await db.$transaction(async (tx) => {
      return tx.swing.update({
        where: { id },
        data: {
          isPublished: true,
          publishedAt: new Date(),
        },
      });
    });

    return NextResponse.json(published, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Erreur interne du serveur.' },
      { status: 500 },
    );
  }
}

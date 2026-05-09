import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { validateSwing } from '@/lib/validation';

// ─── GET /api/swings ─────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.userId) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const first = searchParams.get('first') === 'true';

  try {
    if (first) {
      // retourner le premier swing publié (par date de publication)
      const swing = await db.swing.findFirst({
        where: { isPublished: true },
        orderBy: { publishedAt: 'asc' },
        select: { id: true, title: true, type: true },
      });

      if (!swing) {
        return NextResponse.json(null, { status: 200 });
      }

      return NextResponse.json(swing, { status: 200 });
    }

    // liste paginée des swings publiés (usage général)
    const swings = await db.swing.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      select: { id: true, title: true, type: true, estimatedDuration: true, qualityScore: true },
      take: 50,
    });

    return NextResponse.json(swings, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Erreur interne du serveur.' },
      { status: 500 },
    );
  }
}

// ─── POST /api/swings ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
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

  try {
    const body = await request.json();
    const { type, title, content, branchId, estimatedDuration } = body as {
      type?: string;
      title?: string;
      content?: unknown;
      branchId?: string;
      estimatedDuration?: number;
    };

    // validation des champs obligatoires
    const validation = validateSwing({
      type: type as string | undefined,
      title,
      content,
      branchId,
      estimatedDuration,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Champs obligatoires manquants.',
          code: 'VALIDATION_ERROR',
          missingFields: validation.missingFields,
        },
        { status: 422 },
      );
    }

    // créer le swing en brouillon
    const swing = await db.swing.create({
      data: {
        type: type as 'TYPE_A' | 'TYPE_B' | 'TYPE_C' | 'TYPE_D',
        title: title!,
        content: content as object,
        branchId: branchId!,
        estimatedDuration: estimatedDuration!,
        creatorId: userId,
        isPublished: false,
      },
    });

    return NextResponse.json(swing, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Erreur interne du serveur.' },
      { status: 500 },
    );
  }
}

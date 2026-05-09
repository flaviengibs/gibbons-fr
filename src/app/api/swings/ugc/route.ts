import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { validateSwing } from '@/lib/validation';

// ─── POST /api/swings/ugc ─────────────────────────────────────────────────────
// Création d'un swing UGC par n'importe quel utilisateur connecté.
// Le swing est créé en brouillon (isPublished: false) et marqué isUGC: true.
// Un admin devra le valider avant publication.

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.userId) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const userId = session.user.userId;

  try {
    const body = await request.json();
    const { type, title, content, estimatedDuration } = body as {
      type?: string;
      title?: string;
      content?: unknown;
      estimatedDuration?: number;
    };

    // Validation des champs obligatoires (sans branchId — assigné par défaut)
    if (!type || !title || !content || !estimatedDuration) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants : type, title, content, estimatedDuration.' },
        { status: 422 },
      );
    }

    // Récupérer la première branche disponible comme branche par défaut pour les UGC
    const defaultBranch = await db.branch.findFirst({
      orderBy: { name: 'asc' },
      select: { id: true },
    });

    if (!defaultBranch) {
      return NextResponse.json(
        { error: 'Aucune branche disponible. Contactez un administrateur.' },
        { status: 500 },
      );
    }

    const validation = validateSwing({
      type,
      title,
      content,
      branchId: defaultBranch.id,
      estimatedDuration,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation échouée.', missingFields: validation.missingFields },
        { status: 422 },
      );
    }

    const swing = await db.swing.create({
      data: {
        type: type as 'TYPE_A' | 'TYPE_B' | 'TYPE_C' | 'TYPE_D',
        title: title!,
        content: content as object,
        estimatedDuration: estimatedDuration!,
        branchId: defaultBranch.id,
        creatorId: userId,
        isPublished: false,  // en attente de validation
        isUGC: true,
        qualityScore: 0,
        editorialScore: 0,
      },
      select: { id: true, title: true, type: true, isUGC: true },
    });

    return NextResponse.json(swing, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Erreur interne du serveur.' },
      { status: 500 },
    );
  }
}

// ─── GET /api/swings/ugc ──────────────────────────────────────────────────────
// Liste les swings UGC publiés (pour le filtre UGC dans la nav).

export async function GET() {
  const session = await auth();
  if (!session?.user?.userId) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  try {
    const swings = await db.swing.findMany({
      where: { isPublished: true, isUGC: true },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        type: true,
        estimatedDuration: true,
        qualityScore: true,
        creator: { select: { name: true } },
        branch: { select: { name: true, forest: { select: { name: true } } } },
      },
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

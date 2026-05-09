import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// ─── GET /api/branches ───────────────────────────────────────────────────────

export async function GET() {
  const session = await auth();
  if (!session?.user?.userId) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  try {
    const branches = await db.branch.findMany({
      include: {
        forest: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ forest: { name: 'asc' } }, { name: 'asc' }],
    });

    return NextResponse.json(branches, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Erreur interne du serveur.' },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// ─── GET /api/leaderboard ─────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.userId) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') ?? 'all'; // 'all' | 'week'

  try {
    const top = await db.userPoints.findMany({
      orderBy: period === 'week' ? { weekPoints: 'desc' } : { totalPoints: 'desc' },
      take: 20,
      select: {
        totalPoints: true,
        weekPoints: true,
        streak: true,
        user: {
          select: { id: true, name: true },
        },
      },
    });

    // Récupérer le rang de l'utilisateur courant
    const myPoints = await db.userPoints.findUnique({
      where: { userId: session.user.userId },
      select: { totalPoints: true, weekPoints: true, streak: true },
    });

    const myRank = myPoints
      ? await db.userPoints.count({
          where:
            period === 'week'
              ? { weekPoints: { gt: myPoints.weekPoints } }
              : { totalPoints: { gt: myPoints.totalPoints } },
        }) + 1
      : null;

    return NextResponse.json(
      {
        leaderboard: top.map((entry, index) => ({
          rank: index + 1,
          userId: entry.user.id,
          name: entry.user.name ?? 'Anonyme',
          points: period === 'week' ? entry.weekPoints : entry.totalPoints,
          streak: entry.streak,
          isCurrentUser: entry.user.id === session.user.userId,
        })),
        me: myPoints
          ? {
              rank: myRank,
              points: period === 'week' ? myPoints.weekPoints : myPoints.totalPoints,
              streak: myPoints.streak,
            }
          : null,
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

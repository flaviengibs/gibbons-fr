/**
 * points.ts — système de points et de streak pour le leaderboard
 *
 * Règles :
 * - Complétion d'un swing TYPE_A : 10 pts
 * - Complétion d'un swing TYPE_B (bonne réponse) : 20 pts, (mauvaise) : 5 pts
 * - Complétion d'un swing TYPE_C : 10–30 pts selon le score de correction
 * - Complétion d'un swing TYPE_D : 10 pts
 * - Bonus streak : +5 pts par jour consécutif (max +50)
 * - Création d'un swing UGC publié : 50 pts
 */

import { db } from '@/lib/db';
import type { SwingType } from '@/types/index';

export const POINTS = {
  TYPE_A: 10,
  TYPE_B_CORRECT: 20,
  TYPE_B_WRONG: 5,
  TYPE_C_BASE: 10,
  TYPE_C_BONUS_MAX: 20,  // bonus selon score de correction (0–20)
  TYPE_D: 10,
  UGC_PUBLISHED: 50,
  STREAK_BONUS: 5,
  STREAK_MAX_BONUS: 50,
} as const;

export function computeSwingPoints(
  type: SwingType,
  options?: { correct?: boolean; evalScore?: number },
): number {
  switch (type) {
    case 'TYPE_A':
      return POINTS.TYPE_A;
    case 'TYPE_B':
      return options?.correct ? POINTS.TYPE_B_CORRECT : POINTS.TYPE_B_WRONG;
    case 'TYPE_C': {
      const bonus = Math.round((options?.evalScore ?? 0.5) * POINTS.TYPE_C_BONUS_MAX);
      return POINTS.TYPE_C_BASE + bonus;
    }
    case 'TYPE_D':
      return POINTS.TYPE_D;
  }
}

/**
 * Ajoute des points à un utilisateur et met à jour son streak.
 * Crée l'entrée UserPoints si elle n'existe pas.
 */
export async function addPoints(userId: string, points: number): Promise<void> {
  const now = new Date();

  const existing = await db.userPoints.findUnique({
    where: { userId },
  });

  if (!existing) {
    await db.userPoints.create({
      data: {
        userId,
        totalPoints: points,
        weekPoints: points,
        weekStart: now,
        streak: 1,
        lastActiveAt: now,
      },
    });
    return;
  }

  // Calculer le streak
  const lastActive = existing.lastActiveAt;
  const diffMs = now.getTime() - lastActive.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let newStreak = existing.streak;
  if (diffDays === 0) {
    // Même jour — streak inchangé
  } else if (diffDays === 1) {
    // Jour suivant — streak +1
    newStreak = existing.streak + 1;
  } else {
    // Rupture du streak
    newStreak = 1;
  }

  // Bonus streak
  const streakBonus = Math.min(newStreak * POINTS.STREAK_BONUS, POINTS.STREAK_MAX_BONUS);
  const totalToAdd = points + (diffDays >= 1 ? streakBonus : 0);

  // Réinitialiser les points hebdomadaires si nouvelle semaine
  const weekStart = existing.weekStart;
  const weekDiff = Math.floor((now.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24 * 7));
  const newWeekPoints = weekDiff >= 1 ? totalToAdd : existing.weekPoints + totalToAdd;
  const newWeekStart = weekDiff >= 1 ? now : weekStart;

  await db.userPoints.update({
    where: { userId },
    data: {
      totalPoints: existing.totalPoints + totalToAdd,
      weekPoints: newWeekPoints,
      weekStart: newWeekStart,
      streak: newStreak,
      lastActiveAt: now,
    },
  });
}

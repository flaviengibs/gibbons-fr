'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Period = 'all' | 'week';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  points: number;
  streak: number;
  isCurrentUser: boolean;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  me: { rank: number | null; points: number; streak: number } | null;
}

const RANK_MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('week');
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?period=${period}`)
      .then((r) => r.json())
      .then((d: LeaderboardData) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Classement</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gagnez des points en complétant des swings chaque jour.
        </p>
      </div>

      {/* Filtre période */}
      <div className="flex gap-2 mb-6">
        {(['week', 'all'] as Period[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            aria-pressed={period === p}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              period === p
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p === 'week' ? 'Cette semaine' : 'Tout temps'}
          </button>
        ))}
      </div>

      {/* Mon rang */}
      {data?.me && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Votre position</p>
              <p className="text-2xl font-bold text-blue-900">
                {data.me.rank ? `#${data.me.rank}` : 'Non classé'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-700">{data.me.points} pts</p>
              <p className="text-xs text-blue-600">
                🔥 {data.me.streak} jour{data.me.streak !== 1 ? 's' : ''} de suite
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tableau */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !data || data.leaderboard.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-4xl" aria-hidden="true">🏆</p>
          <p className="text-gray-600">Aucun classement disponible.</p>
          <p className="text-sm text-gray-400">Complétez des swings pour apparaître ici !</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-700 transition-colors"
          >
            Commencer
          </Link>
        </div>
      ) : (
        <ol className="space-y-2" aria-label="Classement des apprenants">
          {data.leaderboard.map((entry) => (
            <li
              key={entry.userId}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                entry.isCurrentUser
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-white border-gray-200'
              }`}
            >
              {/* Rang */}
              <div className="w-8 text-center flex-shrink-0">
                {RANK_MEDALS[entry.rank] ? (
                  <span className="text-xl" aria-label={`${entry.rank}e place`}>
                    {RANK_MEDALS[entry.rank]}
                  </span>
                ) : (
                  <span className="text-sm font-bold text-gray-400">#{entry.rank}</span>
                )}
              </div>

              {/* Nom */}
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${entry.isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                  {entry.name}
                  {entry.isCurrentUser && (
                    <span className="ml-2 text-xs text-blue-600 font-normal">(vous)</span>
                  )}
                </p>
                {entry.streak > 1 && (
                  <p className="text-xs text-orange-500">
                    🔥 {entry.streak} jours de suite
                  </p>
                )}
              </div>

              {/* Points */}
              <div className="text-right flex-shrink-0">
                <p className={`font-bold ${entry.isCurrentUser ? 'text-blue-800' : 'text-gray-800'}`}>
                  {entry.points}
                </p>
                <p className="text-xs text-gray-400">pts</p>
              </div>
            </li>
          ))}
        </ol>
      )}

      {/* Règles */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-2">Comment gagner des points</p>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>💡 Insight (type A) — 10 pts</li>
          <li>🎯 Défi réussi (type B) — 20 pts · raté — 5 pts</li>
          <li>✏️ Exercice (type C) — 10 à 30 pts selon la correction</li>
          <li>🔍 Réflexion (type D) — 10 pts</li>
          <li>🔥 Bonus streak — +5 pts par jour consécutif (max +50)</li>
        </ul>
      </div>
    </main>
  );
}

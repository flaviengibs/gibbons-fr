import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { SwingScreen } from '@/components/swing/SwingScreen';
import { PendingSync } from '@/components/ui/PendingSync';
import type { SwingScreenPayload } from '@/types/index';

interface SwingPageProps {
  params: Promise<{ id: string }>;
}

export default async function SwingPage({ params }: SwingPageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const res = await fetch(
    `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/api/swings/${id}`,
    {
      headers: {
        Cookie: cookieHeader,
      },
      cache: 'no-store',
    },
  );

  if (res.status === 401) {
    redirect('/login');
  }

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    // erreur serveur ou timeout — on laisse l'error boundary gérer
    throw new Error(`Erreur lors du chargement du swing ${id} (${res.status})`);
  }

  const payload = (await res.json()) as SwingScreenPayload;

  return (
    <>
      {/* synchronise les completions en attente au chargement */}
      <PendingSync />
      <SwingScreen payload={payload} />
    </>
  );
}

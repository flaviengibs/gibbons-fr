import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { EditSwingForm } from './EditSwingForm';

interface EditSwingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSwingPage({ params }: EditSwingPageProps) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.userId) {
    redirect('/login');
  }

  const { role, userId } = session.user;
  if (role !== 'CREATOR' && role !== 'ADMIN') {
    redirect('/');
  }

  const swing = await db.swing.findUnique({
    where: { id },
    include: {
      branch: {
        include: { forest: true },
      },
    },
  });

  if (!swing) {
    notFound();
  }

  // vérifier que le créateur est bien le propriétaire (sauf ADMIN)
  if (role !== 'ADMIN' && swing.creatorId !== userId) {
    redirect('/dashboard');
  }

  // récupérer toutes les branches pour le select
  const branches = await db.branch.findMany({
    include: { forest: true },
    orderBy: [{ forest: { name: 'asc' } }, { name: 'asc' }],
  });

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">modifier le swing</h1>
        {swing.isPublished && (
          <p className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            ce swing est publié — il n'est plus modifiable.
          </p>
        )}
      </div>

      <EditSwingForm
        swing={{
          id: swing.id,
          type: swing.type as 'TYPE_A' | 'TYPE_B' | 'TYPE_C' | 'TYPE_D',
          title: swing.title,
          content: swing.content as object,
          branchId: swing.branchId,
          estimatedDuration: swing.estimatedDuration,
          isPublished: swing.isPublished,
        }}
        branches={branches.map((b) => ({
          id: b.id,
          name: b.name,
          forest: { name: b.forest.name },
        }))}
      />
    </div>
  );
}

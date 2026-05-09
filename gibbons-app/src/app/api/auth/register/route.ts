import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body as {
      email?: string;
      password?: string;
      name?: string;
    };

    // validation des champs obligatoires
    const missingFields: string[] = [];
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants', missingFields },
        { status: 422 },
      );
    }

    // vérification de l'unicité de l'email
    const existing = await db.user.findUnique({
      where: { email: email! },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà.' },
        { status: 409 },
      );
    }

    // hash du mot de passe
    const passwordHash = await bcrypt.hash(password!, 12);

    // création de l'utilisateur avec le rôle LEARNER par défaut
    const user = await db.user.create({
      data: {
        email: email!,
        name: name ?? null,
        passwordHash,
        role: 'LEARNER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Erreur interne du serveur.' },
      { status: 500 },
    );
  }
}

import type { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Gibbons — La connaissance, sans chemin imposé.',
  description:
    'Gibbons est une plateforme de micro-apprentissage par sauts cognitifs. Apprenez en 1 à 3 minutes — un insight, un déclic, à votre rythme.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-bricolage)]">
        {children}
      </body>
    </html>
  );
}

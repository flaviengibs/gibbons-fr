import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 text-center bg-gray-50">
      <div className="text-5xl" aria-hidden="true">🌫️</div>

      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-gray-900">
          Cette page n'existe pas
        </h1>
        <p className="text-sm text-gray-500 max-w-sm">
          Le swing ou la page que vous cherchez est introuvable.
          Il a peut-être été déplacé ou supprimé.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-colors"
        >
          Retour à l'accueil
        </Link>
        <Link
          href="/canopy"
          className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-colors"
        >
          Voir ma canopée
        </Link>
      </div>
    </div>
  );
}

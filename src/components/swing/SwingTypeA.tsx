/**
 * SwingTypeA — insight rapide.
 * Affiche texte, image et une mini animation CSS (fade-in).
 * Bouton "j'ai compris" pour marquer comme complété.
 */

'use client';

import Image from 'next/image';
import type { SwingContentTypeA } from '@/types/index';

interface SwingTypeAProps {
  content: SwingContentTypeA;
  onComplete: () => void;
}

export function SwingTypeA({ content, onComplete }: SwingTypeAProps) {
  const { text, visualUrl } = content;

  return (
    <div className="flex flex-col items-center gap-6 p-6 animate-fadeIn">
      {/* visuel */}
      {visualUrl && (
        <div className="relative w-full max-w-md aspect-video rounded-xl overflow-hidden shadow-md">
          <Image
            src={visualUrl}
            alt="illustration du concept"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 448px"
            priority
          />
        </div>
      )}

      {/* texte de l'insight */}
      <p className="text-lg leading-relaxed text-gray-800 text-center max-w-prose">
        {text}
      </p>

      {/* bouton de complétion */}
      <button
        type="button"
        onClick={onComplete}
        className="mt-4 px-8 py-3 bg-blue-600 hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 text-white font-medium rounded-full transition-colors"
        aria-label="marquer cet insight comme compris et continuer"
      >
        j&apos;ai compris
      </button>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out both;
        }
      `}</style>
    </div>
  );
}

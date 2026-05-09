/**
 * SwingTypeD — réflexion guidée.
 * Question + choix de réponse + feedback d'ancrage mémoriel après sélection.
 */

'use client';

import { useState } from 'react';
import type { SwingContentTypeD } from '@/types/index';

interface SwingTypeDProps {
  content: SwingContentTypeD;
  onComplete: () => void;
}

export function SwingTypeD({ content, onComplete }: SwingTypeDProps) {
  const { question, choices, anchorFeedback } = content;

  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  function handleSelect(choice: string) {
    if (showFeedback) return;
    setSelectedChoice(choice);
    setShowFeedback(true);
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* question */}
      <p className="text-lg font-medium text-gray-800 leading-relaxed">{question}</p>

      {/* choix de réponse */}
      <fieldset>
        <legend className="sr-only">choisissez une réponse</legend>
        <div className="flex flex-col gap-3">
          {choices.map((choice) => {
            let buttonClass =
              'w-full text-left px-4 py-3 rounded-lg border-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600';

            if (!showFeedback) {
              buttonClass += ' border-gray-200 hover:border-purple-400 hover:bg-purple-50 bg-white text-gray-800';
            } else if (choice === selectedChoice) {
              buttonClass += ' border-purple-500 bg-purple-50 text-purple-800';
            } else {
              buttonClass += ' border-gray-200 bg-gray-50 text-gray-400';
            }

            return (
              <button
                key={choice}
                type="button"
                onClick={() => handleSelect(choice)}
                disabled={showFeedback}
                aria-pressed={selectedChoice === choice}
                className={buttonClass}
              >
                {choice}
                {showFeedback && choice === selectedChoice && (
                  <span className="ml-2 text-purple-500" aria-hidden="true">←</span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* feedback d'ancrage mémoriel */}
      {showFeedback && (
        <div
          className="flex flex-col gap-4 p-4 bg-purple-50 border border-purple-200 rounded-lg"
          role="alert"
          aria-live="polite"
        >
          {selectedChoice && (
            <p className="text-sm text-purple-700">
              vous avez répondu : <strong>{selectedChoice}</strong>
            </p>
          )}

          <p className="text-sm text-gray-800 leading-relaxed">{anchorFeedback}</p>

          <button
            type="button"
            onClick={onComplete}
            className="self-start px-6 py-2 bg-purple-600 hover:bg-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 text-white font-medium rounded-full transition-colors"
            aria-label="continuer vers la prochaine étape"
          >
            continuer
          </button>
        </div>
      )}
    </div>
  );
}

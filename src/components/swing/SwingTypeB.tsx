/**
 * SwingTypeB — mini défi interactif.
 * Timer de 90 secondes, options de réponse, feedback après sélection ou timeout.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SwingContentTypeB } from '@/types/index';

interface SwingTypeBProps {
  content: SwingContentTypeB;
  onComplete: () => void;
}

const TIMER_SECONDS = 90;

export function SwingTypeB({ content, onComplete }: SwingTypeBProps) {
  const { problem, options, correctIndex, explanation } = content;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const revealFeedback = useCallback(() => {
    setShowFeedback(true);
  }, []);

  // décompte du timer
  useEffect(() => {
    if (showFeedback) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimedOut(true);
          revealFeedback();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showFeedback, revealFeedback]);

  function handleSelect(index: number) {
    if (showFeedback) return;
    setSelectedIndex(index);
    revealFeedback();
  }

  const progressPercent = (timeLeft / TIMER_SECONDS) * 100;
  const progressColor =
    timeLeft > 30 ? 'bg-green-500' : timeLeft > 10 ? 'bg-orange-400' : 'bg-red-500';

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* énoncé du problème */}
      <p className="text-lg font-medium text-gray-800 leading-relaxed">{problem}</p>

      {/* barre de progression du timer */}
      <div
        className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={timeLeft}
        aria-valuemin={0}
        aria-valuemax={TIMER_SECONDS}
        aria-label={`temps restant : ${timeLeft} secondes`}
      >
        <div
          className={`h-full rounded-full transition-all duration-1000 ${progressColor}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="text-sm text-gray-500 -mt-4" aria-live="polite">
        {timedOut ? 'temps écoulé' : `${timeLeft}s restantes`}
      </p>

      {/* options de réponse */}
      <fieldset>
        <legend className="sr-only">choisissez une réponse</legend>
        <div className="flex flex-col gap-3">
          {options.map((option, index) => {
            let buttonClass =
              'w-full text-left px-4 py-3 rounded-lg border-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';

            if (!showFeedback) {
              buttonClass += ' border-gray-200 hover:border-blue-400 hover:bg-blue-50 bg-white';
            } else if (index === correctIndex) {
              buttonClass += ' border-green-500 bg-green-50 text-green-800';
            } else if (index === selectedIndex) {
              buttonClass += ' border-red-400 bg-red-50 text-red-800';
            } else {
              buttonClass += ' border-gray-200 bg-gray-50 text-gray-500';
            }

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(index)}
                disabled={showFeedback}
                aria-pressed={selectedIndex === index}
                aria-label={`option ${index + 1} : ${option}${showFeedback && index === correctIndex ? ' (bonne réponse)' : ''}`}
                className={buttonClass}
              >
                <span className="font-medium mr-2 text-gray-400">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
                {showFeedback && index === correctIndex && (
                  <span className="ml-2 text-green-600" aria-hidden="true">✓</span>
                )}
                {showFeedback && index === selectedIndex && index !== correctIndex && (
                  <span className="ml-2 text-red-500" aria-hidden="true">✗</span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* feedback après réponse ou timeout */}
      {showFeedback && (
        <div
          className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
          role="alert"
          aria-live="polite"
        >
          {timedOut && selectedIndex === null && (
            <p className="text-sm font-medium text-orange-700 mb-2">
              temps écoulé — la bonne réponse était :{' '}
              <strong>{options[correctIndex]}</strong>
            </p>
          )}
          <p className="text-sm text-blue-800">{explanation}</p>

          <button
            type="button"
            onClick={onComplete}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 text-white font-medium rounded-full transition-colors"
            aria-label="continuer vers la prochaine étape"
          >
            continuer
          </button>
        </div>
      )}
    </div>
  );
}

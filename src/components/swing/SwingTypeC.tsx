/**
 * SwingTypeC — application / micro exercice.
 * Champ de saisie libre (textarea) ou choix (boutons) selon inputType.
 * Bouton "valider" pour soumettre.
 */

'use client';

import { useState } from 'react';
import type { SwingContentTypeC } from '@/types/index';

interface SwingTypeCProps {
  content: SwingContentTypeC;
  onComplete: () => void;
}

export function SwingTypeC({ content, onComplete }: SwingTypeCProps) {
  const { prompt, inputType, rubric } = content;

  const [textValue, setTextValue] = useState('');
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // pour inputType 'choice', on extrait les options depuis rubric (format "option1|option2|...")
  // ou on affiche un champ texte si le format n'est pas reconnu
  const choiceOptions =
    inputType === 'choice'
      ? rubric.split('|').map((s) => s.trim()).filter(Boolean)
      : [];

  function handleSubmit() {
    if (inputType === 'text' && !textValue.trim()) return;
    if (inputType === 'choice' && !selectedChoice) return;
    setSubmitted(true);
  }

  const canSubmit =
    !submitted &&
    (inputType === 'text' ? textValue.trim().length > 0 : selectedChoice !== null);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* énoncé */}
      <p className="text-lg font-medium text-gray-800 leading-relaxed">{prompt}</p>

      {!submitted ? (
        <>
          {inputType === 'text' ? (
            /* champ de saisie libre */
            <div className="flex flex-col gap-2">
              <label htmlFor="swing-c-input" className="text-sm font-medium text-gray-700">
                votre réponse
              </label>
              <textarea
                id="swing-c-input"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                rows={5}
                placeholder="écrivez votre réponse ici…"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400"
                aria-label="champ de saisie de votre réponse"
              />
            </div>
          ) : (
            /* choix parmi des options */
            <fieldset>
              <legend className="text-sm font-medium text-gray-700 mb-3">
                choisissez une option
              </legend>
              <div className="flex flex-col gap-3">
                {choiceOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelectedChoice(option)}
                    aria-pressed={selectedChoice === option}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                      selectedChoice === option
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 bg-white text-gray-800'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="self-start px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 text-white font-medium rounded-full transition-colors"
            aria-label="valider votre réponse"
          >
            valider
          </button>
        </>
      ) : (
        /* confirmation après soumission */
        <div
          className="flex flex-col gap-4 p-4 bg-green-50 border border-green-200 rounded-lg"
          role="alert"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-green-800">réponse enregistrée ✓</p>

          {inputType === 'text' && textValue && (
            <blockquote className="pl-3 border-l-4 border-green-400 text-sm text-gray-700 italic">
              {textValue}
            </blockquote>
          )}

          {inputType === 'choice' && selectedChoice && (
            <p className="text-sm text-gray-700">
              vous avez choisi : <strong>{selectedChoice}</strong>
            </p>
          )}

          <button
            type="button"
            onClick={onComplete}
            className="self-start px-6 py-2 bg-green-600 hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 text-white font-medium rounded-full transition-colors"
            aria-label="continuer vers la prochaine étape"
          >
            continuer
          </button>
        </div>
      )}
    </div>
  );
}

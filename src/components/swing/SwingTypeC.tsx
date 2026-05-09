/**
 * SwingTypeC — application / micro exercice.
 * Correction souple : la réponse est évaluée par similarité sémantique.
 * Feedback gradué : excellent / good / partial / weak.
 */

'use client';

import { useState } from 'react';
import type { SwingContentTypeC } from '@/types/index';

interface SwingTypeCProps {
  content: SwingContentTypeC;
  swingId: string;
  onComplete: () => void;
}

type EvalLevel = 'excellent' | 'good' | 'partial' | 'weak';

interface EvalResult {
  score: number;
  level: EvalLevel;
  feedback: string;
  rubric: string;
  matchedKeywords: string[];
  missedKeywords: string[];
}

const LEVEL_CONFIG: Record<EvalLevel, { color: string; icon: string; label: string }> = {
  excellent: { color: 'bg-green-50 border-green-300 text-green-800', icon: '🎯', label: 'Excellent' },
  good:      { color: 'bg-blue-50 border-blue-300 text-blue-800',   icon: '✓',  label: 'Bien' },
  partial:   { color: 'bg-orange-50 border-orange-300 text-orange-800', icon: '◑', label: 'Partiel' },
  weak:      { color: 'bg-red-50 border-red-300 text-red-800',      icon: '○',  label: 'À développer' },
};

export function SwingTypeC({ content, swingId, onComplete }: SwingTypeCProps) {
  const { prompt, inputType } = content;

  const [textValue, setTextValue] = useState('');
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pour inputType 'choice', extraire les options depuis le rubric (format "option1|option2|...")
  const choiceOptions =
    inputType === 'choice'
      ? content.rubric.split('|').map((s) => s.trim()).filter(Boolean)
      : [];

  const canSubmit =
    !evalResult &&
    !evaluating &&
    (inputType === 'text' ? textValue.trim().length > 0 : selectedChoice !== null);

  async function handleSubmit() {
    const answer = inputType === 'text' ? textValue : selectedChoice ?? '';
    if (!answer.trim()) return;

    setEvaluating(true);
    setError(null);

    try {
      const res = await fetch(`/api/swings/${swingId}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      });

      if (res.ok) {
        const data = (await res.json()) as EvalResult;
        setEvalResult(data);
      } else {
        // En cas d'erreur API, on accepte quand même la réponse sans correction
        setEvalResult({
          score: 0.5,
          level: 'good',
          feedback: 'Réponse enregistrée.',
          rubric: '',
          matchedKeywords: [],
          missedKeywords: [],
        });
      }
    } catch {
      setEvalResult({
        score: 0.5,
        level: 'good',
        feedback: 'Réponse enregistrée.',
        rubric: '',
        matchedKeywords: [],
        missedKeywords: [],
      });
    } finally {
      setEvaluating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto w-full">
      {/* énoncé */}
      <p className="text-lg font-medium text-gray-800 leading-relaxed">{prompt}</p>

      {!evalResult ? (
        <>
          {inputType === 'text' ? (
            <div className="flex flex-col gap-2">
              <label htmlFor="swing-c-input" className="text-sm font-medium text-gray-700">
                Votre réponse
              </label>
              <textarea
                id="swing-c-input"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                rows={5}
                placeholder="Écrivez votre réponse ici…"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400"
                aria-label="Champ de saisie de votre réponse"
              />
              <p className="text-xs text-gray-400">
                {textValue.trim().split(/\s+/).filter(Boolean).length} mot{textValue.trim().split(/\s+/).filter(Boolean).length !== 1 ? 's' : ''}
              </p>
            </div>
          ) : (
            <fieldset>
              <legend className="text-sm font-medium text-gray-700 mb-3">
                Choisissez une option
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

          {error && (
            <p role="alert" className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-busy={evaluating}
            className="self-start px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 text-white font-medium rounded-full transition-colors"
          >
            {evaluating ? 'Correction en cours…' : 'Valider'}
          </button>
        </>
      ) : (
        /* Résultat de la correction */
        <div className="flex flex-col gap-4" role="alert" aria-live="polite">
          {/* Score et niveau */}
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${LEVEL_CONFIG[evalResult.level].color}`}>
            <span className="text-2xl" aria-hidden="true">{LEVEL_CONFIG[evalResult.level].icon}</span>
            <div>
              <p className="font-semibold">{LEVEL_CONFIG[evalResult.level].label}</p>
              <p className="text-sm">{evalResult.feedback}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-2xl font-bold">{Math.round(evalResult.score * 100)}<span className="text-sm font-normal">/100</span></p>
            </div>
          </div>

          {/* Réponse de l'utilisateur */}
          {inputType === 'text' && textValue && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-1">Votre réponse</p>
              <p className="text-sm text-gray-700 italic">{textValue}</p>
            </div>
          )}

          {/* Éléments clés du rubric */}
          {evalResult.rubric && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-2">Éléments attendus</p>
              <p className="text-sm text-gray-700">{evalResult.rubric}</p>
            </div>
          )}

          {/* Mots-clés trouvés / manqués */}
          {(evalResult.matchedKeywords.length > 0 || evalResult.missedKeywords.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {evalResult.matchedKeywords.map((kw) => (
                <span key={kw} className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                  <span aria-hidden="true">✓</span> {kw}
                </span>
              ))}
              {evalResult.missedKeywords.slice(0, 5).map((kw) => (
                <span key={kw} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                  <span aria-hidden="true">○</span> {kw}
                </span>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={onComplete}
            className="self-start px-6 py-2 bg-gray-900 hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 text-white font-medium rounded-full transition-colors"
          >
            Continuer
          </button>
        </div>
      )}
    </div>
  );
}

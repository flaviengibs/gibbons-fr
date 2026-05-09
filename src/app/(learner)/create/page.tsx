'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

type SwingType = 'TYPE_A' | 'TYPE_B' | 'TYPE_C' | 'TYPE_D';

const TYPE_LABELS: Record<SwingType, { label: string; desc: string }> = {
  TYPE_A: { label: 'Insight rapide', desc: 'Un concept expliqué en 20–40 secondes' },
  TYPE_B: { label: 'Mini défi', desc: 'Un problème avec des options et une bonne réponse' },
  TYPE_C: { label: 'Exercice', desc: 'Un exercice avec correction automatique' },
  TYPE_D: { label: 'Réflexion guidée', desc: 'Une question ouverte avec feedback' },
};

export default function CreateSwingPage() {
  const router = useRouter();
  const [type, setType] = useState<SwingType>('TYPE_A');
  const [title, setTitle] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Champs TYPE_A
  const [textA, setTextA] = useState('');

  // Champs TYPE_B
  const [problemB, setProblemB] = useState('');
  const [optionsB, setOptionsB] = useState(['', '', '', '']);
  const [correctIndexB, setCorrectIndexB] = useState(0);
  const [explanationB, setExplanationB] = useState('');

  // Champs TYPE_C
  const [promptC, setPromptC] = useState('');
  const [rubricC, setRubricC] = useState('');

  // Champs TYPE_D
  const [questionD, setQuestionD] = useState('');
  const [choicesD, setChoicesD] = useState(['', '', '', '']);
  const [feedbackD, setFeedbackD] = useState('');

  function buildContent(): object {
    switch (type) {
      case 'TYPE_A':
        return { type: 'TYPE_A', text: textA, visualUrl: '', animationData: {} };
      case 'TYPE_B':
        return { type: 'TYPE_B', problem: problemB, options: optionsB.filter(Boolean), correctIndex: correctIndexB, explanation: explanationB };
      case 'TYPE_C':
        return { type: 'TYPE_C', prompt: promptC, inputType: 'text', rubric: rubricC };
      case 'TYPE_D':
        return { type: 'TYPE_D', question: questionD, choices: choicesD.filter(Boolean), anchorFeedback: feedbackD };
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/swings/ugc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          content: buildContent(),
          estimatedDuration,
        }),
      });

      if (res.ok) {
        router.push('/?created=1');
      } else {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? 'Une erreur est survenue.');
      }
    } catch {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Créer un swing</h1>
      <p className="text-sm text-gray-500 mb-8">
        Partagez vos connaissances avec la communauté. Votre swing sera visible après validation.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Type de swing */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Type de swing</p>
          <div className="grid grid-cols-2 gap-3">
            {(Object.entries(TYPE_LABELS) as [SwingType, { label: string; desc: string }][]).map(([t, info]) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                aria-pressed={type === t}
                className={`text-left p-3 rounded-lg border-2 transition-colors ${
                  type === t
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 bg-white'
                }`}
              >
                <p className="font-medium text-sm text-gray-900">{info.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{info.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Titre */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Titre <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Ex : Le biais de confirmation"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Durée estimée */}
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
            Durée estimée (secondes)
          </label>
          <input
            id="duration"
            type="number"
            min={20}
            max={180}
            value={estimatedDuration}
            onChange={(e) => setEstimatedDuration(Number(e.target.value))}
            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Contenu selon le type */}
        {type === 'TYPE_A' && (
          <div>
            <label htmlFor="text-a" className="block text-sm font-medium text-gray-700 mb-1">
              Texte de l'insight <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <textarea
              id="text-a"
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              rows={4}
              required
              placeholder="Expliquez le concept en 2–3 phrases claires…"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {type === 'TYPE_B' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="problem-b" className="block text-sm font-medium text-gray-700 mb-1">
                Énoncé du problème <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <textarea
                id="problem-b"
                value={problemB}
                onChange={(e) => setProblemB(e.target.value)}
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Options de réponse</p>
              {optionsB.map((opt, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={correctIndexB === i}
                    onChange={() => setCorrectIndexB(i)}
                    aria-label={`Option ${i + 1} est la bonne réponse`}
                    className="text-green-600"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const next = [...optionsB];
                      next[i] = e.target.value;
                      setOptionsB(next);
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              ))}
              <p className="text-xs text-gray-400">Sélectionnez le bouton radio à côté de la bonne réponse.</p>
            </div>
            <div>
              <label htmlFor="explanation-b" className="block text-sm font-medium text-gray-700 mb-1">
                Explication <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <textarea
                id="explanation-b"
                value={explanationB}
                onChange={(e) => setExplanationB(e.target.value)}
                rows={3}
                required
                placeholder="Pourquoi cette réponse est-elle correcte ?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {type === 'TYPE_C' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="prompt-c" className="block text-sm font-medium text-gray-700 mb-1">
                Énoncé de l'exercice <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <textarea
                id="prompt-c"
                value={promptC}
                onChange={(e) => setPromptC(e.target.value)}
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="rubric-c" className="block text-sm font-medium text-gray-700 mb-1">
                Éléments de correction <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <textarea
                id="rubric-c"
                value={rubricC}
                onChange={(e) => setRubricC(e.target.value)}
                rows={3}
                required
                placeholder="Décrivez les éléments clés d'une bonne réponse. La correction automatique s'appuie sur ces mots-clés."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                La correction est souple — les utilisateurs n'ont pas besoin de trouver la réponse mot pour mot.
              </p>
            </div>
          </div>
        )}

        {type === 'TYPE_D' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="question-d" className="block text-sm font-medium text-gray-700 mb-1">
                Question de réflexion <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <textarea
                id="question-d"
                value={questionD}
                onChange={(e) => setQuestionD(e.target.value)}
                rows={2}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Choix de réponse</p>
              {choicesD.map((c, i) => (
                <input
                  key={i}
                  type="text"
                  value={c}
                  onChange={(e) => {
                    const next = [...choicesD];
                    next[i] = e.target.value;
                    setChoicesD(next);
                  }}
                  placeholder={`Choix ${i + 1}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-2"
                />
              ))}
            </div>
            <div>
              <label htmlFor="feedback-d" className="block text-sm font-medium text-gray-700 mb-1">
                Feedback d'ancrage mémoriel <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <textarea
                id="feedback-d"
                value={feedbackD}
                onChange={(e) => setFeedbackD(e.target.value)}
                rows={3}
                required
                placeholder="Message affiché après la réponse pour ancrer l'apprentissage…"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading || !title.trim()}
            aria-busy={loading}
            className="px-8 py-3 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            {loading ? 'Envoi en cours…' : 'Soumettre le swing'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Annuler
          </button>
        </div>
      </form>
    </main>
  );
}

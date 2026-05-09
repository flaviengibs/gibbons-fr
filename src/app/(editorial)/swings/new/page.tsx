'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

type SwingType = 'TYPE_A' | 'TYPE_B' | 'TYPE_C' | 'TYPE_D';

interface Branch {
  id: string;
  name: string;
  forest: { name: string };
}

interface ValidationErrors {
  type?: string;
  title?: string;
  content?: string;
  branchId?: string;
  estimatedDuration?: string;
  [key: string]: string | undefined;
}

export default function NewSwingPage() {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [type, setType] = useState<SwingType>('TYPE_A');

  // charger les branches disponibles
  useEffect(() => {
    fetch('/api/branches')
      .then((r) => r.json())
      .then((data: Branch[]) => setBranches(data))
      .catch(() => {
        // silencieux — les branches resteront vides
      });
  }, []);

  function buildContent(formData: FormData): object {
    switch (type) {
      case 'TYPE_A':
        return {
          type: 'TYPE_A',
          text: formData.get('content_text') as string,
          visualUrl: formData.get('content_visualUrl') as string,
          animationData: {},
        };
      case 'TYPE_B':
        return {
          type: 'TYPE_B',
          problem: formData.get('content_problem') as string,
          options: ((formData.get('content_options') as string) ?? '')
            .split('\n')
            .map((o) => o.trim())
            .filter(Boolean),
          correctIndex: parseInt(formData.get('content_correctIndex') as string, 10) || 0,
          explanation: formData.get('content_explanation') as string,
        };
      case 'TYPE_C':
        return {
          type: 'TYPE_C',
          prompt: formData.get('content_prompt') as string,
          inputType: formData.get('content_inputType') as 'text' | 'choice',
          rubric: formData.get('content_rubric') as string,
        };
      case 'TYPE_D':
        return {
          type: 'TYPE_D',
          question: formData.get('content_question') as string,
          choices: ((formData.get('content_choices') as string) ?? '')
            .split('\n')
            .map((c) => c.trim())
            .filter(Boolean),
          anchorFeedback: formData.get('content_anchorFeedback') as string,
        };
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setGlobalError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const title = formData.get('title') as string;
    const branchId = formData.get('branchId') as string;
    const estimatedDuration = parseInt(formData.get('estimatedDuration') as string, 10);
    const content = buildContent(formData);

    try {
      const res = await fetch('/api/swings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, content, branchId, estimatedDuration }),
      });

      if (res.ok) {
        router.push('/dashboard');
        return;
      }

      const data = (await res.json()) as {
        error?: string;
        missingFields?: string[];
      };

      if (res.status === 422 && data.missingFields) {
        const fieldErrors: ValidationErrors = {};
        for (const field of data.missingFields) {
          fieldErrors[field] = `le champ "${field}" est obligatoire.`;
        }
        setErrors(fieldErrors);
      } else {
        setGlobalError(data.error ?? 'une erreur est survenue.');
      }
    } catch {
      setGlobalError('une erreur réseau est survenue. veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">nouveau swing</h1>

      <form
        onSubmit={handleSubmit}
        noValidate
        aria-label="formulaire de création d'un swing"
        className="space-y-6"
      >
        {/* type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            type de swing <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <select
            id="type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as SwingType)}
            required
            aria-required="true"
            aria-describedby={errors.type ? 'type-error' : undefined}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="TYPE_A">type A — insight rapide</option>
            <option value="TYPE_B">type B — mini défi</option>
            <option value="TYPE_C">type C — application</option>
            <option value="TYPE_D">type D — réflexion guidée</option>
          </select>
          {errors.type && (
            <p id="type-error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.type}
            </p>
          )}
        </div>

        {/* titre */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            titre <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            aria-required="true"
            aria-describedby={errors.title ? 'title-error' : undefined}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ex : le biais de confirmation"
          />
          {errors.title && (
            <p id="title-error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.title}
            </p>
          )}
        </div>

        {/* contenu dynamique selon le type */}
        <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4">
          <legend className="text-sm font-medium text-gray-700 px-1">
            contenu du swing ({type})
          </legend>

          {type === 'TYPE_A' && (
            <>
              <div>
                <label htmlFor="content_text" className="block text-sm font-medium text-gray-700 mb-1">
                  texte <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <textarea
                  id="content_text"
                  name="content_text"
                  rows={4}
                  required
                  aria-required="true"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  placeholder="le texte principal de l'insight…"
                />
              </div>
              <div>
                <label htmlFor="content_visualUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  URL du visuel
                </label>
                <input
                  id="content_visualUrl"
                  name="content_visualUrl"
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://…"
                />
              </div>
            </>
          )}

          {type === 'TYPE_B' && (
            <>
              <div>
                <label htmlFor="content_problem" className="block text-sm font-medium text-gray-700 mb-1">
                  énoncé du problème <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <textarea
                  id="content_problem"
                  name="content_problem"
                  rows={3}
                  required
                  aria-required="true"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  placeholder="quel est le problème à résoudre ?"
                />
              </div>
              <div>
                <label htmlFor="content_options" className="block text-sm font-medium text-gray-700 mb-1">
                  options (une par ligne) <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <textarea
                  id="content_options"
                  name="content_options"
                  rows={4}
                  required
                  aria-required="true"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  placeholder={"option A\noption B\noption C"}
                />
              </div>
              <div>
                <label htmlFor="content_correctIndex" className="block text-sm font-medium text-gray-700 mb-1">
                  index de la bonne réponse (0, 1, 2…) <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <input
                  id="content_correctIndex"
                  name="content_correctIndex"
                  type="number"
                  min={0}
                  defaultValue={0}
                  required
                  aria-required="true"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="content_explanation" className="block text-sm font-medium text-gray-700 mb-1">
                  explication <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <textarea
                  id="content_explanation"
                  name="content_explanation"
                  rows={3}
                  required
                  aria-required="true"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  placeholder="pourquoi cette réponse est-elle correcte ?"
                />
              </div>
            </>
          )}

          {type === 'TYPE_C' && (
            <>
              <div>
                <label htmlFor="content_prompt" className="block text-sm font-medium text-gray-700 mb-1">
                  énoncé de l'exercice <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <textarea
                  id="content_prompt"
                  name="content_prompt"
                  rows={3}
                  required
                  aria-required="true"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  placeholder="décrivez l'exercice à réaliser…"
                />
              </div>
              <div>
                <label htmlFor="content_inputType" className="block text-sm font-medium text-gray-700 mb-1">
                  type de saisie <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <select
                  id="content_inputType"
                  name="content_inputType"
                  required
                  aria-required="true"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="text">texte libre</option>
                  <option value="choice">choix multiple</option>
                </select>
              </div>
              <div>
                <label htmlFor="content_rubric" className="block text-sm font-medium text-gray-700 mb-1">
                  critères d'évaluation <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <textarea
                  id="content_rubric"
                  name="content_rubric"
                  rows={3}
                  required
                  aria-required="true"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  placeholder="comment évaluer la réponse de l'apprenant ?"
                />
              </div>
            </>
          )}

          {type === 'TYPE_D' && (
            <>
              <div>
                <label htmlFor="content_question" className="block text-sm font-medium text-gray-700 mb-1">
                  question <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <textarea
                  id="content_question"
                  name="content_question"
                  rows={3}
                  required
                  aria-required="true"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  placeholder="quelle est la question de réflexion ?"
                />
              </div>
              <div>
                <label htmlFor="content_choices" className="block text-sm font-medium text-gray-700 mb-1">
                  choix de réponse (un par ligne) <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <textarea
                  id="content_choices"
                  name="content_choices"
                  rows={4}
                  required
                  aria-required="true"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  placeholder={"choix A\nchoix B\nchoix C"}
                />
              </div>
              <div>
                <label htmlFor="content_anchorFeedback" className="block text-sm font-medium text-gray-700 mb-1">
                  feedback d'ancrage mémoriel <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <textarea
                  id="content_anchorFeedback"
                  name="content_anchorFeedback"
                  rows={3}
                  required
                  aria-required="true"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  placeholder="quel message ancre la réflexion dans la mémoire ?"
                />
              </div>
            </>
          )}

          {errors.content && (
            <p role="alert" className="text-sm text-red-600">
              {errors.content}
            </p>
          )}
        </fieldset>

        {/* branche */}
        <div>
          <label htmlFor="branchId" className="block text-sm font-medium text-gray-700 mb-1">
            branche <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <select
            id="branchId"
            name="branchId"
            required
            aria-required="true"
            aria-describedby={errors.branchId ? 'branchId-error' : undefined}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">— sélectionner une branche —</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.forest.name} / {branch.name}
              </option>
            ))}
          </select>
          {errors.branchId && (
            <p id="branchId-error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.branchId}
            </p>
          )}
        </div>

        {/* durée estimée */}
        <div>
          <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700 mb-1">
            durée estimée (secondes) <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="estimatedDuration"
            name="estimatedDuration"
            type="number"
            min={20}
            max={180}
            defaultValue={60}
            required
            aria-required="true"
            aria-describedby={errors.estimatedDuration ? 'duration-error' : 'duration-hint'}
            className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p id="duration-hint" className="mt-1 text-xs text-gray-500">
            entre 20 et 180 secondes.
          </p>
          {errors.estimatedDuration && (
            <p id="duration-error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.estimatedDuration}
            </p>
          )}
        </div>

        {/* erreur globale */}
        {globalError && (
          <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3">
            {globalError}
          </p>
        )}

        {/* actions */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'enregistrement…' : 'enregistrer le brouillon'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
          >
            annuler
          </button>
        </div>
      </form>
    </div>
  );
}

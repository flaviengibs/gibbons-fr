# Plan d'implémentation — Gibbons Platform

## Vue d'ensemble

Implémentation de la plateforme Gibbons en TypeScript avec Next.js 15 (App Router), PostgreSQL/Prisma, NextAuth.js v5 et Vitest/fast-check pour les tests PBT. Les tâches suivent un ordre incrémental : fondations → logique métier → API → frontend → back-office → données seed.

## Tâches

- [ ] 1. Initialisation du projet et configuration de l'environnement
  - Créer le projet Next.js 15 avec App Router et TypeScript strict
  - Configurer ESLint, Prettier et les alias de chemins (`@/`)
  - Installer et configurer Prisma avec le provider PostgreSQL
  - Installer NextAuth.js v5 (Auth.js) et ses dépendances
  - Installer Vitest, `@fast-check/vitest` et les utilitaires de test (`@testing-library/react`, `jsdom`)
  - Créer le fichier `.env.local` avec les variables `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
  - Configurer `vitest.config.ts` avec l'environnement jsdom et les alias de chemins
  - _Requirements : 8.1, 8.2_

- [ ] 2. Schéma de base de données et migrations Prisma
  - [ ] 2.1 Écrire le schéma Prisma complet dans `prisma/schema.prisma`
    - Modèles : `Forest`, `Branch`, `Swing`, `SwingEdge`, `User`, `LearnerProgress`, `SwingCompletion`, `SwingVote`
    - Modèles NextAuth : `Account`, `Session`, `VerificationToken`
    - Enums : `SwingType`, `BranchRelationType`, `UserRole`
    - Index sur `branchId`, `isPublished`, `sourceSwingId`, `userId`, `swingId`
    - _Requirements : 3.3, 3.4, 6.1_

  - [ ] 2.2 Générer et appliquer la migration initiale
    - Exécuter `prisma migrate dev --name init`
    - Générer le client Prisma (`prisma generate`)
    - Créer `src/lib/db.ts` avec le singleton Prisma (pattern `globalThis.__prisma`)
    - _Requirements : 3.3, 3.4_

  - [ ]* 2.3 Écrire les tests unitaires du schéma
    - Vérifier les contraintes d'unicité (`@@unique`) sur `SwingEdge` et `SwingCompletion`
    - Vérifier les valeurs par défaut (`qualityScore = 0.0`, `isPublished = false`)
    - _Requirements : 3.3, 3.4_

- [ ] 3. Types TypeScript partagés et types d'erreurs
  - Créer `src/types/index.ts` avec toutes les interfaces : `Swing`, `SwingBranch`, `LearnerProgress`, `SwingScreenPayload`, `SwingContent` (union discriminée par type)
  - Créer `src/types/errors.ts` avec le type union `GibbonsError` et tous ses codes
  - Définir les types `SwingType`, `ZoneType`, `BranchRelationType`
  - _Requirements : 1.1, 2.1, 3.3_

- [ ] 4. Logique métier pure — algorithme de sélection des branches
  - [ ] 4.1 Implémenter `selectBranches` dans `src/lib/navigation.ts`
    - Récupérer les arêtes sortantes du swing courant depuis le graphe
    - Filtrer les swings déjà complétés par l'apprenant
    - Sélectionner au moins 2 axes distincts parmi `CONCEPT_LIE`, `DIFFICULTE_DIFFERENTE`, `SURPRISE`
    - Trier par score de pertinence (`weight × facteur_fraîcheur`)
    - Retourner exactement 3 branches (fallback zone dense si < 3 disponibles)
    - _Requirements : 2.1, 2.2, 2.5, 2.6_

  - [ ]* 4.2 Écrire le test de propriété 1 — sélection des branches
    - **Propriété 1 : sélection des branches de saut**
    - **Valide : Requirements 2.1, 2.5**
    - Générer des graphes arbitraires avec `fc.record` et des apprenants arbitraires
    - Vérifier que le résultat contient exactement 3 branches si ≥ 3 disponibles, sinon le maximum disponible, et toujours au moins 1

  - [ ]* 4.3 Écrire le test de propriété 2 — diversité des axes
    - **Propriété 2 : diversité des axes de branche**
    - **Valide : Requirements 2.2**
    - Vérifier que les `relationType` des 3 branches couvrent au moins 2 valeurs distinctes

  - [ ]* 4.4 Écrire le test de propriété 3 — exclusion des swings complétés
    - **Propriété 3 : exclusion des swings déjà complétés**
    - **Valide : Requirements 2.6**
    - Vérifier qu'aucune branche retournée ne pointe vers un swing présent dans les completions de l'apprenant, lorsque des alternatives existent

- [ ] 5. Logique métier pure — calcul des zones (canopée)
  - [ ] 5.1 Implémenter `computeZones` dans `src/lib/zones.ts`
    - Calculer `explored` à partir des `completedIds`
    - Calculer `dense` : swings non complétés adjacents aux zones explorées (liste d'adjacence)
    - Calculer `unknown` : swings ni explorés ni denses
    - _Requirements : 4.1, 4.3, 4.4_

  - [ ]* 5.2 Écrire le test de propriété 4 — invariant de zone après complétion
    - **Propriété 4 : invariant de zone après complétion**
    - **Valide : Requirements 4.1, 4.3**
    - Vérifier qu'après `recordCompletion(userId, swingId)`, le swing est dans `explored` et absent de `dense` et `unknown`

  - [ ]* 5.3 Écrire le test de propriété 5 — partition des zones
    - **Propriété 5 : partition des zones (cohérence)**
    - **Valide : Requirements 4.1, 4.4**
    - Vérifier que `explored ∪ dense ∪ unknown = allPublishedSwings` et que les trois ensembles sont deux à deux disjoints

- [ ] 6. Logique métier pure — score qualité et validation de swing
  - [ ] 6.1 Implémenter `computeQualityScore` dans `src/lib/scoring.ts`
    - Formule : `(moyenne_votes × 0.7) + (score_éditorial × 0.3)`
    - Gérer le cas `votes = []` (retourner `score_éditorial × 0.3`)
    - _Requirements : 7.1, 7.3_

  - [ ]* 6.2 Écrire le test de propriété 6 — calcul borné du Score_Qualité
    - **Propriété 6 : calcul borné du Score_Qualité**
    - **Valide : Requirements 7.1, 7.3**
    - Générer des votes arbitraires (entiers 1–5) et des scores éditoriaux arbitraires (réels 0.0–5.0)
    - Vérifier que le résultat est toujours dans `[0.0, 5.0]` et respecte la formule

  - [ ] 6.3 Implémenter `validateSwing` dans `src/lib/validation.ts`
    - Vérifier la présence de tous les champs obligatoires : `type`, `title`, `content`, `branchId`, `estimatedDuration`
    - Retourner `{ success: true }` ou `{ success: false, missingFields: string[] }`
    - _Requirements : 5.2, 5.3_

  - [ ]* 6.4 Écrire le test de propriété 7 — validation de publication (double sens)
    - **Propriété 7 : validation de publication (double sens)**
    - **Valide : Requirements 5.2, 5.3**
    - Vérifier que tout swing avec tous les champs obligatoires retourne `success = true`
    - Vérifier que tout sous-ensemble non vide de champs manquants retourne `success = false` avec la liste exacte

- [ ] 7. Checkpoint — logique métier
  - S'assurer que tous les tests de la logique métier passent (`vitest run src/lib`). Poser des questions si des comportements sont ambigus.

- [ ] 8. Configuration de l'authentification NextAuth.js v5
  - Créer `src/lib/auth.ts` avec la configuration NextAuth (providers credentials + OAuth optionnel)
  - Définir les callbacks `session` et `jwt` pour inclure `userId` et `role`
  - Créer `src/app/api/auth/[...nextauth]/route.ts`
  - Créer les pages de connexion et d'inscription dans `src/app/(auth)/`
  - _Requirements : 5.1, 6.1_

- [ ] 9. API routes — swings
  - [ ] 9.1 Implémenter `GET /api/swings/:id` dans `src/app/api/swings/[id]/route.ts`
    - Récupérer le swing avec ses relations (`branch`, `creator`)
    - Appeler `selectBranches` pour calculer les 3 branches de saut
    - Retourner un `SwingScreenPayload` complet
    - Gérer `SWING_NOT_FOUND` (404) et timeout > 5 s (503)
    - _Requirements : 1.1, 2.1, 8.1, 8.4_

  - [ ] 9.2 Implémenter `POST /api/swings` dans `src/app/api/swings/route.ts`
    - Créer un swing en brouillon après validation des champs obligatoires
    - Vérifier l'authentification et le rôle `CREATOR`
    - Retourner 422 si validation échoue avec la liste des champs manquants
    - _Requirements : 5.1, 5.2, 5.3_

  - [ ] 9.3 Implémenter `PUT /api/swings/:id` et `POST /api/swings/:id/publish`
    - `PUT` : modifier un swing non publié (403 si déjà publié)
    - `POST /publish` : appeler `validateSwing`, puis publier dans une transaction atomique
    - Mettre à jour `isPublished = true` et `publishedAt = now()`
    - _Requirements : 5.2, 5.3, 5.4, 5.5_

  - [ ] 9.4 Implémenter `GET /api/swings/:id/branches` dans `src/app/api/swings/[id]/branches/route.ts`
    - Calculer les branches pour l'apprenant authentifié
    - Utiliser `selectBranches` avec l'état de progression de l'apprenant
    - _Requirements : 2.1, 2.2, 2.5, 2.6_

- [ ] 10. API routes — progression et votes
  - [ ] 10.1 Implémenter `POST /api/progress` dans `src/app/api/progress/route.ts`
    - Insérer un `SwingCompletion` (upsert pour idempotence)
    - Mettre à jour `LearnerProgress.lastSwingId` et `lastSessionAt`
    - Retourner les branches de saut disponibles après complétion
    - _Requirements : 6.1, 6.3_

  - [ ] 10.2 Implémenter `GET /api/progress` dans `src/app/api/progress/route.ts`
    - Récupérer toutes les completions de l'apprenant
    - Calculer les zones via `computeZones`
    - Retourner `LearnerProgress` avec `exploredSwingIds`, `denseSwingIds`, `lastSwingId`
    - _Requirements : 6.1, 6.2_

  - [ ] 10.3 Implémenter `POST /api/votes` dans `src/app/api/votes/route.ts`
    - Insérer ou mettre à jour un `SwingVote` (upsert)
    - Recalculer et persister le `qualityScore` du swing via `computeQualityScore`
    - Retourner le nouveau score dans un délai de 5 s
    - _Requirements : 7.1, 7.3_

- [ ] 11. Persistance de la progression — fallback localStorage
  - Créer `src/lib/progressSync.ts` avec la logique de synchronisation optimiste
  - Implémenter le retry automatique (3 tentatives, backoff exponentiel) en cas d'échec de `POST /api/progress`
  - Stocker les completions en attente dans `localStorage` sous la clé `gibbons:pendingCompletions`
  - Synchroniser au prochain chargement de page si des données en attente existent
  - _Requirements : 6.4_

  - [ ]* 11.1 Écrire le test de propriété 8 — round-trip de la progression
    - **Propriété 8 : round-trip de la progression**
    - **Valide : Requirements 6.1, 6.2, 6.3**
    - Générer des ensembles arbitraires de swings complétés
    - Vérifier que `loadProgress(userId)` après `saveProgress(userId, completions)` retourne exactement les mêmes completions

- [ ] 12. Checkpoint — API et persistance
  - S'assurer que toutes les API routes répondent correctement aux cas nominaux et aux cas d'erreur. Poser des questions si des comportements sont ambigus.

- [ ] 13. Composants frontend — SwingScreen et types de swing
  - [ ] 13.1 Créer `src/components/swing/SwingScreen.tsx`
    - Conteneur principal : 1 écran = 1 swing, sans contenu concurrent visible
    - Gérer l'état de chargement, l'affichage du swing et la transition vers `SautBranches`
    - Afficher un indicateur de chargement si le chargement dépasse 5 s avec bouton "Revenir"
    - _Requirements : 1.1, 8.4_

  - [ ] 13.2 Créer `src/components/swing/SwingTypeA.tsx`
    - Afficher texte, visuel (`<Image>`) et mini animation dans un délai de 500 ms
    - _Requirements : 1.2_

  - [ ] 13.3 Créer `src/components/swing/SwingTypeB.tsx`
    - Afficher le problème interactif avec les contrôles de réponse
    - Gérer le timer de 90 secondes avec `useEffect`
    - _Requirements : 1.3_

  - [ ] 13.4 Créer `src/components/swing/SwingTypeC.tsx`
    - Afficher l'énoncé du micro exercice et un champ de saisie (`textarea` ou `input`)
    - _Requirements : 1.4_

  - [ ] 13.5 Créer `src/components/swing/SwingTypeD.tsx`
    - Afficher la question, les choix de réponse et le feedback d'ancrage mémoriel après sélection
    - _Requirements : 1.5_

  - [ ] 13.6 Créer `src/components/swing/SwingMeta.tsx`
    - Afficher `estimatedDuration`, `qualityScore` et `creatorLabel` pour tout swing valide
    - _Requirements : 1.6, 3.5, 7.2_

  - [ ]* 13.7 Écrire le test de propriété 9 — métadonnées affichées sur chaque swing
    - **Propriété 9 : métadonnées affichées sur chaque swing**
    - **Valide : Requirements 1.6, 3.5, 4.2, 7.2**
    - Vérifier que `SwingMeta` affiche `estimatedDuration`, `qualityScore` et `creatorLabel` pour tout swing valide
    - Vérifier que `CanopyView` ne contient aucun texte correspondant au pattern `\d+\s*%`

- [ ] 14. Composants frontend — navigation et canopée
  - [ ] 14.1 Créer `src/components/navigation/BranchCard.tsx`
    - Carte d'une branche de saut avec titre, type, durée estimée et `relationType`
    - _Requirements : 2.3_

  - [ ] 14.2 Créer `src/components/navigation/SautBranches.tsx`
    - Afficher exactement 3 `BranchCard` sous forme de choix directionnels (pas de liste scrollable)
    - Déclencher le prefetch du swing suivant au survol (`router.prefetch`)
    - Initier le chargement dans un délai de 300 ms après sélection
    - _Requirements : 2.3, 2.4, 8.2_

  - [ ] 14.3 Créer `src/components/canopy/ZoneIndicator.tsx`
    - Indicateur visuel pour une zone (`explored`, `dense`, `unknown`) avec styles distincts
    - _Requirements : 4.1, 4.4_

  - [ ] 14.4 Créer `src/components/canopy/CanopyView.tsx`
    - Vue spatiale de la progression avec les 3 zones visuellement distinctes
    - Ne pas afficher de pourcentage de complétion global
    - _Requirements : 4.1, 4.2, 4.4_

- [ ] 15. Pages apprenant (App Router)
  - [ ] 15.1 Créer `src/app/(learner)/swing/[id]/page.tsx`
    - Page serveur : récupérer le `SwingScreenPayload` via `GET /api/swings/:id`
    - Passer les données à `SwingScreen` et gérer l'optimistic update de progression
    - _Requirements : 1.1, 6.3_

  - [ ] 15.2 Créer `src/app/(learner)/canopy/page.tsx`
    - Page serveur : récupérer la progression via `GET /api/progress`
    - Afficher `CanopyView` avec les zones calculées
    - _Requirements : 4.1, 4.2, 4.4_

  - [ ] 15.3 Créer `src/app/(learner)/page.tsx`
    - Landing page : entrée dans la canopée, redirection vers le premier swing ou le dernier swing visité
    - _Requirements : 6.2_

- [ ] 16. Checkpoint — frontend apprenant
  - S'assurer que le flux complet (chargement swing → complétion → sélection branche → chargement suivant) fonctionne. Poser des questions si des comportements sont ambigus.

- [ ] 17. Back-office éditorial — pages et formulaires
  - [ ] 17.1 Créer `src/app/(editorial)/dashboard/page.tsx`
    - Liste des swings avec statut (brouillon / publié), filtrés par créateur
    - _Requirements : 5.1, 5.4_

  - [ ] 17.2 Créer `src/app/(editorial)/swings/new/page.tsx`
    - Formulaire de création d'un swing : type, titre, contenu (champs dynamiques selon le type), branche, durée estimée
    - Appeler `POST /api/swings` à la soumission
    - Afficher les erreurs de validation champ par champ
    - _Requirements : 5.1, 5.2, 5.3_

  - [ ] 17.3 Créer `src/app/(editorial)/swings/[id]/edit/page.tsx`
    - Formulaire de modification d'un swing non publié
    - Bouton "Publier" qui appelle `POST /api/swings/:id/publish`
    - Afficher les erreurs de validation et confirmer la publication réussie
    - _Requirements : 5.2, 5.3, 5.4, 5.5_

  - [ ]* 17.4 Écrire le test de propriété 10 — invariants de création d'un swing
    - **Propriété 10 : invariants de création d'un swing**
    - **Valide : Requirements 3.3, 3.4**
    - Générer des swings arbitraires avec des données valides
    - Vérifier que le swing persisté a exactement un type parmi `TYPE_A`, `TYPE_B`, `TYPE_C`, `TYPE_D`
    - Vérifier que son `branchId` référence une branche existante appartenant à une forêt existante

- [ ] 18. Gestion des erreurs et fallbacks — composants et middleware
  - Créer `src/app/error.tsx` et `src/app/not-found.tsx` pour les erreurs globales
  - Implémenter le timeout côté client avec `AbortController` dans les appels `fetch` (seuil : 5 s)
  - Créer un composant `LoadingTimeout.tsx` affiché après 5 s avec bouton "Revenir à la sélection"
  - Implémenter le toast non-bloquant "Sauvegarde en attente..." lors d'un échec de persistance
  - _Requirements : 6.4, 8.4_

- [ ] 19. Seed de données MVP — 50 swings "Penser mieux"
  - Créer `prisma/seed.ts` avec le script de seed
  - Créer la forêt "Penser mieux" et ses branches (biais cognitifs, logique, décision, persuasion, heuristiques)
  - Créer un utilisateur éditorial de référence (`role: CREATOR`, `isEditorial: true`)
  - Créer 50 swings publiés couvrant les types `TYPE_A`, `TYPE_B` et `TYPE_C` (au moins 10 par type)
  - Créer les `SwingEdge` pour le graphe de navigation (au moins 3 arêtes sortantes par swing)
  - Configurer le script `prisma.seed` dans `package.json`
  - _Requirements : 3.1, 3.2, 3.3, 3.4_

- [ ] 20. Checkpoint final — intégration complète
  - S'assurer que tous les tests passent (`vitest run`).
  - Vérifier le flux complet : seed → connexion apprenant → navigation → complétion → canopée → back-office.
  - Poser des questions si des comportements sont ambigus.

## Notes

- Les tâches marquées `*` sont optionnelles et peuvent être ignorées pour un MVP plus rapide
- Chaque tâche référence les requirements spécifiques pour la traçabilité
- Les tests de propriétés (PBT) utilisent `@fast-check/vitest` avec un minimum de 100 itérations par propriété
- Les tests unitaires et les tests de propriétés sont complémentaires : les tests unitaires couvrent les cas spécifiques, les PBT couvrent les invariants universels
- Les checkpoints garantissent une validation incrémentale à chaque étape majeure

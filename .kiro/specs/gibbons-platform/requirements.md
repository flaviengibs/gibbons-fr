# Document de Requirements — Gibbons Platform

## Introduction

Gibbons (gibbons.fr) est une plateforme de micro-apprentissage fondée sur le concept de "sauts d'attention courts mais intenses". L'unité d'apprentissage atomique, appelée **Swing**, dure 1 à 3 minutes et vise à transmettre un seul insight, une seule compétence ou un seul déclic. La navigation entre swings — le **Saut** — est directionnelle et exploratoire, jamais linéaire. Le domaine de lancement est "Penser mieux" (biais cognitifs, logique, décision, persuasion, heuristiques). Le MVP cible 50 swings, 1 domaine, 3 types de contenu, et une interface à 1 écran = 1 swing avec 3 choix de saut.

---

## Glossaire

- **Swing** : Unité d'apprentissage atomique. Durée : 1 à 3 minutes. Transmet exactement un insight, une compétence ou un déclic.
- **Saut** : Transition cognitive entre deux swings. Présentée sous forme de 3 branches directionnelles choisies par l'apprenant.
- **Canopée** : Représentation métaphorique de l'ensemble de l'univers d'apprentissage.
- **Forêt** : Domaine thématique (ex : "Penser mieux"). Regroupe des branches.
- **Branche** : Concept au sein d'une forêt (ex : "Biais de confirmation").
- **Point d'accroche** : Swing rattaché à une branche.
- **Zone explorée** : Ensemble de swings déjà complétés par un apprenant.
- **Zone dense** : Ensemble de swings disponibles et proches des zones explorées.
- **Zone inconnue** : Ensemble de swings non encore accessibles à l'apprenant.
- **Swing_Type_A** : Insight rapide — 20 à 40 secondes, texte + visuel + mini animation.
- **Swing_Type_B** : Mini défi — 30 à 90 secondes, problème interactif (logique, maths, échecs).
- **Swing_Type_C** : Application — micro exercice concret avec production de l'apprenant.
- **Swing_Type_D** : Réflexion guidée — question + choix + feedback d'ancrage mémoriel.
- **Score_Qualité** : Indicateur numérique calculé à partir des votes et validations éditoriaux d'un swing.
- **Créateur** : Auteur d'un swing (équipe éditoriale en phase 1, contributeur UGC en phase 3).
- **Apprenant** : Utilisateur qui navigue et consomme des swings.
- **Plateforme** : Le système Gibbons dans son ensemble.

---

## Requirements

### Requirement 1 : Affichage d'un Swing

**User Story :** En tant qu'apprenant, je veux voir un swing complet sur un seul écran, afin de me concentrer sur un seul apprentissage à la fois sans distraction.

#### Critères d'acceptation

1. THE Plateforme SHALL afficher exactement un swing par écran, sans contenu concurrent visible.
2. WHEN un Swing_Type_A est affiché, THE Plateforme SHALL présenter le texte, le visuel et la mini animation dans un délai de 500 ms après le chargement de l'écran.
3. WHEN un Swing_Type_B est affiché, THE Plateforme SHALL présenter le problème interactif et activer les contrôles de réponse avant l'expiration du délai de 90 secondes.
4. WHEN un Swing_Type_C est affiché, THE Plateforme SHALL présenter l'énoncé du micro exercice et un champ de saisie permettant à l'apprenant de produire une réponse.
5. WHEN un Swing_Type_D est affiché, THE Plateforme SHALL présenter la question, les choix de réponse et le feedback d'ancrage mémoriel après la sélection de l'apprenant.
6. THE Plateforme SHALL afficher la durée estimée du swing courant avant que l'apprenant commence l'interaction.

---

### Requirement 2 : Navigation par Saut

**User Story :** En tant qu'apprenant, je veux choisir ma prochaine direction d'apprentissage parmi 3 branches proposées, afin de vivre une exploration cognitive plutôt qu'une progression linéaire imposée.

#### Critères d'acceptation

1. WHEN un apprenant complète un swing, THE Plateforme SHALL proposer exactement 3 branches de saut distinctes.
2. THE Plateforme SHALL différencier les 3 branches selon au moins deux des trois axes suivants : concept lié, niveau de difficulté différent, swing surprise.
3. THE Plateforme SHALL présenter les 3 branches sous forme de choix directionnels, sans liste scrollable ni menu hiérarchique.
4. WHEN un apprenant sélectionne une branche de saut, THE Plateforme SHALL charger le swing correspondant dans un délai de 1 seconde.
5. IF aucune branche de saut valide n'est disponible pour un swing donné, THEN THE Plateforme SHALL afficher au minimum 1 branche de saut issue d'une zone dense adjacente.
6. THE Plateforme SHALL ne pas proposer un swing déjà complété par l'apprenant comme branche de saut principale, sauf si aucune alternative n'est disponible.

---

### Requirement 3 : Types de Swing et Contenu MVP

**User Story :** En tant qu'apprenant, je veux accéder à des swings de types variés (insight, quiz, mini défi) dans le domaine "Penser mieux", afin d'activer différentes modalités cognitives lors de chaque session.

#### Critères d'acceptation

1. THE Plateforme SHALL mettre à disposition au minimum 50 swings dans le domaine "Penser mieux" au lancement du MVP.
2. THE Plateforme SHALL inclure des swings de type Swing_Type_A, Swing_Type_B et Swing_Type_C dans le catalogue MVP.
3. WHEN un swing est créé, THE Plateforme SHALL associer ce swing à exactement un type parmi Swing_Type_A, Swing_Type_B, Swing_Type_C et Swing_Type_D.
4. WHEN un swing est créé, THE Plateforme SHALL associer ce swing à exactement une branche dans exactement une forêt.
5. THE Plateforme SHALL afficher le label "Créateur" identifiant l'auteur de chaque swing.

---

### Requirement 4 : Représentation de la Progression (Canopée)

**User Story :** En tant qu'apprenant, je veux visualiser mon exploration sous forme de zones explorées, denses et inconnues, afin de ressentir une progression spatiale sans être réduit à un pourcentage de complétion.

#### Critères d'acceptation

1. THE Plateforme SHALL représenter la progression de l'apprenant en distinguant visuellement les zones explorées, les zones denses et les zones inconnues.
2. THE Plateforme SHALL ne pas afficher de pourcentage de complétion global à l'apprenant.
3. WHEN un apprenant complète un swing, THE Plateforme SHALL mettre à jour la zone explorée de cet apprenant pour inclure ce swing dans un délai de 2 secondes.
4. WHILE un apprenant navigue dans la canopée, THE Plateforme SHALL afficher les zones denses comme accessibles et les zones inconnues comme non accessibles visuellement.

---

### Requirement 5 : Gestion du Catalogue de Swings (Back-office éditorial)

**User Story :** En tant que membre de l'équipe éditoriale, je veux créer, modifier et publier des swings depuis un back-office, afin de contrôler la qualité du contenu en phase 1.

#### Critères d'acceptation

1. THE Plateforme SHALL permettre à un Créateur authentifié de créer un swing en renseignant : type, titre, contenu, branche associée, durée estimée.
2. WHEN un Créateur soumet un swing pour publication, THE Plateforme SHALL valider que tous les champs obligatoires sont renseignés avant de publier le swing.
3. IF un champ obligatoire est absent lors de la soumission d'un swing, THEN THE Plateforme SHALL retourner un message d'erreur identifiant le ou les champs manquants sans publier le swing.
4. THE Plateforme SHALL permettre à un Créateur authentifié de modifier un swing existant avant sa publication.
5. WHEN un swing est publié, THE Plateforme SHALL le rendre accessible aux apprenants dans un délai de 60 secondes.

---

### Requirement 6 : Compte Apprenant et Persistance de la Progression

**User Story :** En tant qu'apprenant, je veux que ma progression et mes zones explorées soient sauvegardées, afin de retrouver mon état d'exploration à chaque reconnexion.

#### Critères d'acceptation

1. THE Plateforme SHALL associer la progression de chaque apprenant à un compte utilisateur unique.
2. WHEN un apprenant se reconnecte, THE Plateforme SHALL restaurer l'état de sa zone explorée tel qu'il était lors de sa dernière session.
3. WHEN un apprenant complète un swing, THE Plateforme SHALL persister cet événement dans le compte de l'apprenant avant de proposer les branches de saut.
4. IF la persistance de la progression échoue, THEN THE Plateforme SHALL notifier l'apprenant d'une erreur de sauvegarde et conserver les données localement jusqu'à la prochaine synchronisation réussie.

---

### Requirement 7 : Score Qualité et Label Créateur

**User Story :** En tant qu'apprenant, je veux voir le score qualité et le label créateur d'un swing, afin d'évaluer la fiabilité du contenu que je consulte.

#### Critères d'acceptation

1. THE Plateforme SHALL calculer un Score_Qualité pour chaque swing publié à partir des votes des apprenants et des validations éditoriales.
2. THE Plateforme SHALL afficher le Score_Qualité et le label Créateur sur chaque swing visible par l'apprenant.
3. WHEN un apprenant soumet un vote sur un swing, THE Plateforme SHALL mettre à jour le Score_Qualité de ce swing dans un délai de 5 secondes.
4. WHERE la contribution UGC est activée (phase 2 et phase 3), THE Plateforme SHALL distinguer visuellement les swings créés par l'équipe éditoriale des swings créés par des contributeurs externes.

---

### Requirement 8 : Performance et Disponibilité

**User Story :** En tant qu'apprenant, je veux que la plateforme réponde rapidement, afin de ne pas briser le rythme de mes sauts cognitifs.

#### Critères d'acceptation

1. WHEN un apprenant charge un swing, THE Plateforme SHALL afficher le contenu complet du swing dans un délai de 2 secondes sur une connexion de 10 Mbps.
2. WHEN un apprenant sélectionne une branche de saut, THE Plateforme SHALL initier le chargement du swing suivant dans un délai de 300 ms.
3. THE Plateforme SHALL maintenir un taux de disponibilité de 99,5 % mesuré sur une période glissante de 30 jours.
4. IF le chargement d'un swing dépasse 5 secondes, THEN THE Plateforme SHALL afficher un indicateur de chargement et proposer à l'apprenant de revenir à la sélection de branche.

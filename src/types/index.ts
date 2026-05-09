// ─── Types de base ────────────────────────────────────────────────────────────

export type SwingType = 'TYPE_A' | 'TYPE_B' | 'TYPE_C' | 'TYPE_D';

export type ZoneType = 'explored' | 'dense' | 'unknown';

export type BranchRelationType =
  | 'concept_lié'
  | 'difficulté_différente'
  | 'surprise';

// ─── Contenu variable selon le type de swing ─────────────────────────────────

export interface SwingContentTypeA {
  type: 'TYPE_A';
  text: string;
  visualUrl: string;
  animationData: object;
}

export interface SwingContentTypeB {
  type: 'TYPE_B';
  problem: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SwingContentTypeC {
  type: 'TYPE_C';
  prompt: string;
  inputType: 'text' | 'choice';
  rubric: string;
}

export interface SwingContentTypeD {
  type: 'TYPE_D';
  question: string;
  choices: string[];
  anchorFeedback: string;
}

// Union discriminée sur le champ `type`
export type SwingContent =
  | SwingContentTypeA
  | SwingContentTypeB
  | SwingContentTypeC
  | SwingContentTypeD;

// ─── Swing complet ────────────────────────────────────────────────────────────

export interface Swing {
  id: string;
  type: SwingType;
  title: string;
  content: SwingContent;
  branchId: string;
  forestId: string;
  estimatedDuration: number; // secondes (60–180)
  creatorId: string;
  creatorLabel: string;
  qualityScore: number; // 0.0 – 5.0
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Branche de saut ─────────────────────────────────────────────────────────

export interface SwingBranch {
  targetSwingId: string;
  targetSwing: Pick<
    Swing,
    'id' | 'title' | 'type' | 'estimatedDuration' | 'qualityScore'
  >;
  relationType: BranchRelationType;
  weight: number; // 0.0 – 1.0
}

// ─── Progression apprenant ───────────────────────────────────────────────────

export interface LearnerProgress {
  learnerId: string;
  exploredSwingIds: string[];
  denseSwingIds: string[];
  lastSwingId: string | null;
  lastSessionAt: Date;
}

// ─── Payload de l'écran Swing (réponse API) ──────────────────────────────────

export interface SwingScreenPayload {
  swing: Swing;
  branches: SwingBranch[]; // toujours exactement 3
  learnerZone: ZoneType;
}

// Type union des erreurs métier de la plateforme Gibbons

export type GibbonsError =
  | { code: 'SWING_NOT_FOUND'; swingId: string }
  | { code: 'NO_BRANCHES_AVAILABLE'; swingId: string }
  | { code: 'PROGRESS_PERSIST_FAILED'; userId: string; swingId: string }
  | { code: 'SWING_LOAD_TIMEOUT'; swingId: string; elapsed: number }
  | { code: 'VALIDATION_ERROR'; fields: string[] }
  | { code: 'UNAUTHORIZED' }
  | { code: 'SWING_ALREADY_PUBLISHED'; swingId: string };

export function getErrorMessage(error: unknown, fallback = 'Erreur'): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return fallback;
}

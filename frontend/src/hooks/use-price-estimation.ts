import { useState, useCallback } from 'react';
import { roomsApi, safesApi } from '@/services/api';

export function usePriceEstimation(
  id: string | undefined,
  type: 'room' | 'safe',
  onComplete?: () => void
) {
  const [estimating, setEstimating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estimate = useCallback(async () => {
    if (!id) return;
    try {
      setEstimating(true);
      setError(null);
      if (type === 'room') {
        await roomsApi.reEstimatePrices(id);
      } else {
        await safesApi.reEstimatePrices(id);
      }
      onComplete?.();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erreur lors de l\'estimation des prix';
      setError(message);
    } finally {
      setEstimating(false);
    }
  }, [id, type, onComplete]);

  return { estimating, error, estimate };
}

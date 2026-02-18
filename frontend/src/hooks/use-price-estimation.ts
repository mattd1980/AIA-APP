import { useState, useCallback } from 'react';
import { createContainerApi } from '@/services/api';
import type { ContainerType } from '@/constants/container-config';

export function usePriceEstimation(
  id: string | undefined,
  type: ContainerType,
  onComplete?: () => void
) {
  const [estimating, setEstimating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estimate = useCallback(async () => {
    if (!id) return;
    try {
      setEstimating(true);
      setError(null);
      const containerApi = createContainerApi(type);
      await containerApi.reEstimatePrices(id);
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

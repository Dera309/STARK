import { useState, useEffect, useCallback } from "react";
import api, { cachedGet, clearCache, ApiError } from "../services/api";
import { FixedDeposit } from "../types";

export const useInvestmentData = () => {
  const [deposits, setDeposits] = useState<FixedDeposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeposits = useCallback(async (useCache: boolean = true) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = useCache
        ? await cachedGet('/investments/fixed-deposit', 30000)
        : await api.get('/investments/fixed-deposit');
      setDeposits(res.data);
    } catch (err: unknown) {
      console.error('Investments fetch error:', err);
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as ApiError).response?.data?.error?.message 
        : 'Failed to fetch investments';
      setError(errorMessage || 'Failed to fetch investments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeposits(true);
  }, [fetchDeposits]);

  const refresh = useCallback(() => {
    clearCache("/investments/fixed-deposit");
    fetchDeposits(false); // Force refresh without cache
  }, [fetchDeposits]);

  return { deposits, isLoading, error, refresh };
};

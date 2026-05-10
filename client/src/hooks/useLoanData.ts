import { useState, useEffect, useCallback } from "react";
import api, { cachedGet, clearCache, ApiError } from "../services/api";
import { Loan, LoanProduct } from "../types";

export const useLoanData = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loanProducts, setLoanProducts] = useState<LoanProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoanData = useCallback(async (useCache: boolean = true) => {
    setIsLoading(true);
    setError(null);
    try {
      const [loansRes, productsRes] = await Promise.all([
        useCache ? cachedGet('/loans', 30000) : api.get('/loans'),
        useCache ? cachedGet('/loans/products', 300000) : api.get('/loans/products'), // Products change rarely
      ]);
      setLoans(loansRes.data);
      setLoanProducts(productsRes.data);
    } catch (err: unknown) {
      console.error('Loan data fetch error:', err);
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as ApiError).response?.data?.error?.message 
        : 'Failed to fetch loan data';
      setError(errorMessage || 'Failed to fetch loan data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoanData(true);
  }, [fetchLoanData]);

  const refresh = useCallback(() => {
    clearCache("/loans");
    fetchLoanData(false); // Force refresh without cache
  }, [fetchLoanData]);

  return { loans, loanProducts, isLoading, error, refresh };
};

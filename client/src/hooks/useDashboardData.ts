import { useState, useEffect, useCallback } from "react";
import api, { cachedGet, clearCache, ApiError } from "../services/api";
import { Account, Transaction, User } from "../types";

export const useDashboardData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (useCache: boolean = true) => {
    setIsLoading(true);
    setError(null);
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      const [accountsRes, transactionsRes] = await Promise.all([
        useCache ? cachedGet("/accounts", 30000) : api.get("/accounts"),
        useCache ? cachedGet("/transactions?limit=5", 15000) : api.get("/transactions?limit=5"),
      ]);

      // /accounts returns a plain array
      setAccounts(Array.isArray(accountsRes.data) ? accountsRes.data : []);
      // /transactions returns { transactions: [...], meta: {...} }
      const txData = transactionsRes.data;
      setTransactions(Array.isArray(txData) ? txData : Array.isArray(txData?.transactions) ? txData.transactions : []);
    } catch (err: unknown) {
      console.error("Dashboard data fetch error:", err);
      const isNetworkError = err instanceof Error && (
        err.message === 'Network Error' ||
        err.message?.includes('ERR_CONNECTION_RESET') ||
        err.message?.includes('ERR_TIMED_OUT') ||
        err.message?.includes('timeout')
      );
      
      const errorMessage = isNetworkError 
        ? "Unable to connect to server. Please check your internet connection and try again."
        : err instanceof Error && 'response' in err 
          ? (err as ApiError).response?.data?.error?.message 
          : "Failed to fetch dashboard data";
      
      setError(errorMessage || "Failed to fetch dashboard data");
      
      // Set empty arrays on network errors to prevent UI crashes
      if (isNetworkError) {
        setAccounts([]);
        setTransactions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  const refresh = useCallback(() => {
    clearCache();
    fetchData(false); // Force refresh without cache
  }, [fetchData]);

  return { user, accounts, transactions, isLoading, error, refresh };
};

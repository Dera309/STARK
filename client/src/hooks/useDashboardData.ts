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

      setAccounts(accountsRes.data);
      setTransactions(transactionsRes.data);
    } catch (err: unknown) {
      console.error("Dashboard data fetch error:", err);
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as ApiError).response?.data?.error?.message 
        : "Failed to fetch dashboard data";
      setError(errorMessage || "Failed to fetch dashboard data");
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

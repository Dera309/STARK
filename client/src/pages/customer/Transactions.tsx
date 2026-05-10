import React, { useState, useEffect } from "react";
import api, { ApiError } from "../../services/api";
import { Transaction, Account } from "../../types";
import TransactionsSkeleton from "../../components/ui/TransactionsSkeleton";
import { formatCurrency, formatTime, formatGroupDate } from "../../utils/formatters";

const getCategoryIcon = (category: string, type: string, status: string = "SUCCESS") => {
  if (status === "FAILED" || status === "VOIDED") return "error";
  if (type === "CREDIT" || type === "ADMIN_CREDIT") return "add_circle";
  if (type === "LOAN_DISBURSEMENT") return "account_balance";
  if (type === "LOAN_REPAYMENT") return "payments";
  if (type === "FD_DEBIT" || type === "FD_CREDIT") return "savings";
  const icons: Record<string, string> = {
    TRANSFER: "swap_horiz",
    BILL_PAY: "receipt",
    AIRTIME: "smartphone",
    LOAN: "account_balance",
    INVESTMENT: "trending_up",
    DEPOSIT: "payments",
    WITHDRAWAL: "account_balance_wallet",
    REFUND: "replay",
  };
  return icons[category] || "shopping_bag";
};

const getTransactionDescription = (tx: Transaction) => {
  if (tx.status === "FAILED" || tx.status === "VOIDED") {
    return tx.failureReason || `${tx.status} Transaction`;
  }

  if (tx.category === "TRANSFER" && tx.counterpartyName) {
    return tx.type === "DEBIT"
      ? `Sent to ${tx.counterpartyName}`
      : `Received from ${tx.counterpartyName}`;
  }

  if (tx.type === "LOAN_DISBURSEMENT") {
    return "Loan Disbursement";
  }

  if (tx.type === "LOAN_REPAYMENT") {
    return "Loan Repayment";
  }

  if (tx.type === "FD_DEBIT") {
    return "Fixed Deposit Withdrawal";
  }

  if (tx.type === "FD_CREDIT") {
    return "Fixed Deposit Interest";
  }

  if (tx.type === "ADMIN_CREDIT") {
    return "Admin Credit";
  }

  return tx.merchantName || tx.category || "Transaction";
};

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filter, setFilter] = useState<"ALL" | "CREDIT" | "DEBIT">("ALL");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTransactions = async (pageNum = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ limit: "20", page: String(pageNum) });
      const [txRes, accRes] = await Promise.all([
        api.get(`/transactions?${params}`),
        accounts.length === 0 ? api.get("/accounts") : Promise.resolve(null),
      ]);
      setTransactions(txRes.data.transactions || txRes.data || []);
      setTotalPages(txRes.data.totalPages || 1);
      if (accRes) setAccounts(accRes.data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as ApiError).response?.data?.message 
        : "Failed to load transactions";
      setError(errorMessage || "Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownloadStatement = async (period: "3m" | "6m" | "1y") => {
    try {
      const accountId = accounts[0]?._id;
      if (!accountId) return alert("No account found.");
      const response = await api.get(
        `/transactions/statement?accountId=${accountId}&period=${period}`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `statement_${period}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Failed to download statement.");
    }
  };

  // Client-side filter + search
  const filtered = transactions.filter((tx) => {
    const matchesFilter =
      filter === "ALL" ||
      tx.type === filter ||
      (filter === "CREDIT" && (tx.type === "CREDIT" || tx.type === "ADMIN_CREDIT")) ||
      (filter === "DEBIT" && (tx.type === "DEBIT" || tx.type === "TRANSFER"));
    const matchesSearch =
      !search ||
      (tx.merchantName || "").toLowerCase().includes(search.toLowerCase()) ||
      tx.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Group by date
  const groups: Record<string, Transaction[]> = {};
  filtered.forEach((tx) => {
    const key = formatGroupDate(tx.createdAt);
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  });

  return (
    <div className="space-y-8 pb-4">
      {/* Search & Filters — matches stitch */}
      <section className="space-y-6">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-12 pr-4 py-3 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-secondary transition-all font-body text-sm placeholder:text-outline-variant outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {(["ALL", "CREDIT", "DEBIT"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === f
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {f === "ALL" ? "All" : f === "CREDIT" ? "Incoming" : "Outgoing"}
            </button>
          ))}
        </div>
      </section>

      {/* Statement Download — matches stitch */}
      <section className="bg-primary-container text-white p-6 rounded-xl space-y-4 shadow-lg overflow-hidden relative">
        <div className="absolute -right-4 -top-4 opacity-10">
          <span className="material-symbols-outlined text-8xl filled">account_balance_wallet</span>
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight">Download Statements</h2>
          <p className="text-xs text-on-primary-container">
            Securely export your history in PDF format
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {[
            { label: "Last 3 Months", period: "3m" as const },
            { label: "Last 6 Months", period: "6m" as const },
            { label: "Full Year", period: "1y" as const },
          ].map(({ label, period }) => (
            <button
              key={period}
              onClick={() => handleDownloadStatement(period)}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/5"
            >
              <span className="text-sm font-medium">{label}</span>
              <span className="material-symbols-outlined text-secondary-fixed-dim">download</span>
            </button>
          ))}
        </div>
      </section>

      {/* Transactions List — matches stitch */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-xl font-extrabold tracking-tight">Recent Activity</h2>
          <span className="text-xs text-secondary font-bold uppercase tracking-widest">
            History
          </span>
        </div>

        {isLoading ? (
          <TransactionsSkeleton />
        ) : error ? (
          <div className="p-8 text-center text-error font-bold">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-on-surface-variant font-medium text-sm">
            No transactions found.
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(groups).map(([group, txs]) => (
              <div key={group} className="space-y-1">
                <p className="text-[10px] font-bold text-outline uppercase tracking-tighter px-1">
                  {group}
                </p>
                <div className="bg-surface-container-lowest rounded-xl p-1">
                  {txs.map((tx) => (
                    <div
                      key={tx._id}
                      className="flex items-center gap-4 p-4 hover:bg-surface-container-low rounded-lg transition-colors"
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          tx.status === "FAILED" || tx.status === "VOIDED"
                            ? "bg-error/10 text-error"
                            : tx.type === "CREDIT" || tx.type === "ADMIN_CREDIT"
                              ? "bg-secondary-container/20 text-secondary"
                              : "bg-surface-container-high text-primary"
                        }`}
                      >
                        <span className="material-symbols-outlined">
                          {getCategoryIcon(tx.category, tx.type, tx.status)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-on-surface truncate">
                          {getTransactionDescription(tx)}
                        </h4>
                        <p className="text-xs text-on-surface-variant">
                          {tx.category === "TRANSFER" && tx.counterpartyAccountNumber
                            ? `Account ${tx.counterpartyAccountNumber}`
                            : tx.category}{" "}
                          &amp; {formatTime(tx.createdAt)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className={`text-sm font-extrabold ${
                            tx.status === "FAILED" || tx.status === "VOIDED"
                              ? "text-error"
                              : tx.type === "DEBIT" || tx.type === "TRANSFER"
                                ? "text-on-surface"
                                : "text-secondary"
                          }`}
                        >
                          {tx.status === "FAILED" || tx.status === "VOIDED"
                            ? "Failed"
                            : `${tx.type === "DEBIT" || tx.type === "TRANSFER" ? "- " : "+ "}${formatCurrency(tx.amount, tx.currency)}`}
                        </p>
                        <p
                          className={`text-[10px] font-medium ${
                            tx.status === "FAILED" || tx.status === "VOIDED"
                              ? "text-error"
                              : "text-on-surface-variant"
                          }`}
                        >
                          {tx.status === "SUCCESS" ? formatTime(tx.createdAt) : tx.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => {
              const p = page - 1;
              setPage(p);
              fetchTransactions(p);
            }}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => {
                setPage(p);
                fetchTransactions(p);
              }}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                p === page
                  ? "bg-primary text-white"
                  : "border border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => {
              const p = page + 1;
              setPage(p);
              fetchTransactions(p);
            }}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;

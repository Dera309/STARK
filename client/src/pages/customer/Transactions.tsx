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
      {/* Search & Filters — matches realistic card design */}
      <section className="rounded-xl p-6 space-y-6 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-700" style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}>
        {/* Card Texture Overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
        }}></div>
        
        {/* Holographic Sheen Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        {/* Decorative Glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-tertiary-fixed rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity duration-700"></div>
        
        <div className="relative z-10 space-y-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/60 text-[20px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-tertiary-fixed transition-all font-body text-sm placeholder:text-white/40 outline-none text-white backdrop-blur-sm"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {(["ALL", "CREDIT", "DEBIT"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  filter === f
                    ? "bg-tertiary-fixed text-on-tertiary-fixed"
                    : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/20"
                }`}
              >
                {f === "ALL" ? "All" : f === "CREDIT" ? "Incoming" : "Outgoing"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Statement Download — matches realistic card design */}
      <section className="rounded-xl p-6 space-y-4 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-700" style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}>
        {/* Card Texture Overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
        }}></div>
        
        {/* Holographic Sheen Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        {/* Decorative Glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-tertiary-fixed rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity duration-700"></div>
        
        <div className="absolute -right-4 -top-4 opacity-10">
          <span className="material-symbols-outlined text-8xl filled text-white">account_balance_wallet</span>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-lg font-bold tracking-tight text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Download Statements</h2>
          <p className="text-xs text-white/80">
            Securely export your history in PDF format
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-1 gap-2">
          {[
            { label: "Last 3 Months", period: "3m" as const },
            { label: "Last 6 Months", period: "6m" as const },
            { label: "Full Year", period: "1y" as const },
          ].map(({ label, period }) => (
            <button
              key={period}
              onClick={() => handleDownloadStatement(period)}
              className="flex items-center justify-between p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-sm"
            >
              <span className="text-sm font-medium text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{label}</span>
              <span className="material-symbols-outlined text-tertiary-fixed">download</span>
            </button>
          ))}
        </div>
      </section>

      {/* Transactions List — matches realistic card design */}
      <section className="rounded-xl p-6 space-y-6 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-700" style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}>
        {/* Card Texture Overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
        }}></div>
        
        {/* Holographic Sheen Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        {/* Decorative Glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-tertiary-fixed rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity duration-700"></div>
        
        <div className="relative z-10 flex justify-between items-end">
          <h2 className="text-xl font-extrabold tracking-tight text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Recent Activity</h2>
          <span className="text-xs text-tertiary-fixed font-bold uppercase tracking-widest" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
            History
          </span>
        </div>

        {isLoading ? (
          <TransactionsSkeleton />
        ) : error ? (
          <div className="relative z-10 p-8 text-center text-error font-bold">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="relative z-10 py-12 text-center text-white/80 font-medium text-sm">
            No transactions found.
          </div>
        ) : (
          <div className="relative z-10 space-y-3">
            {Object.entries(groups).map(([group, txs]) => (
              <div key={group} className="space-y-1">
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-tighter px-1">
                  {group}
                </p>
                <div className="bg-white/5 rounded-xl p-1 backdrop-blur-sm border border-white/10">
                  {txs.map((tx) => (
                    <div
                      key={tx._id}
                      className="flex items-center gap-4 p-4 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          tx.status === "FAILED" || tx.status === "VOIDED"
                            ? "bg-error/20 text-error"
                            : tx.type === "CREDIT" || tx.type === "ADMIN_CREDIT"
                              ? "bg-tertiary-fixed/20 text-tertiary-fixed"
                              : "bg-white/10 text-white"
                        }`}
                      >
                        <span className="material-symbols-outlined">
                          {getCategoryIcon(tx.category, tx.type, tx.status)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                          {getTransactionDescription(tx)}
                        </h4>
                        <p className="text-xs text-white/70">
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
                                ? "text-white"
                                : "text-tertiary-fixed"
                          }`}
                          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                        >
                          {tx.status === "FAILED" || tx.status === "VOIDED"
                            ? "Failed"
                            : `${tx.type === "DEBIT" || tx.type === "TRANSFER" ? "- " : "+ "}${formatCurrency(tx.amount, tx.currency)}`}
                        </p>
                        <p
                          className={`text-[10px] font-medium ${
                            tx.status === "FAILED" || tx.status === "VOIDED"
                              ? "text-error"
                              : "text-white/70"
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
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/20 text-white/80 hover:bg-white/10 transition-colors disabled:opacity-40 backdrop-blur-sm"
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
                  ? "bg-tertiary-fixed text-on-tertiary-fixed"
                  : "border border-white/20 text-white/80 hover:bg-white/10 backdrop-blur-sm"
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
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/20 text-white/80 hover:bg-white/10 transition-colors disabled:opacity-40 backdrop-blur-sm"
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;

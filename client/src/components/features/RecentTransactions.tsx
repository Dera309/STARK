import React, { useMemo } from "react";
import { Transaction } from "../../types";
import { formatCurrency, formatTime, formatGroupDate } from "../../utils/formatters";

interface Props {
  transactions: Transaction[];
  onShowAll?: () => void;
}

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

const RecentTransactions: React.FC<Props> = ({ transactions, onShowAll }) => {
  // Group by date - memoized to prevent recalculation on every render
  const groups = useMemo(() => {
    const grouped: Record<string, Transaction[]> = {};
    if (Array.isArray(transactions)) {
      transactions.forEach((tx) => {
        const key = formatGroupDate(tx.createdAt);
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(tx);
      });
    }
    return grouped;
  }, [transactions]);

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg sm:text-xl font-extrabold font-headline tracking-tight">
          Recent Transactions
        </h2>
        {onShowAll && (
          <button
            onClick={onShowAll}
            className="text-secondary font-semibold text-sm hover:text-on-secondary-container transition-colors"
          >
            Show All
          </button>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="py-10 text-center text-on-surface-variant font-medium text-sm">
          No recent transactions.
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groups).map(([group, txs]) => (
            <div key={group} className="bg-surface-container-lowest rounded-xl p-2 shadow-sm">
              <div className="px-4 py-2">
                <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest">
                  {group}
                </span>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {txs.map((tx) => (
                  <div
                    key={tx._id}
                    className="flex items-center justify-between p-3 sm:p-4 hover:bg-surface-container-low/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          tx.status === "FAILED" || tx.status === "VOIDED"
                            ? "bg-error/10"
                            : tx.type === "CREDIT" || tx.type === "ADMIN_CREDIT"
                              ? "bg-secondary/10"
                              : "bg-surface-container-high"
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-sm ${
                            tx.status === "FAILED" || tx.status === "VOIDED"
                              ? "text-error"
                              : tx.type === "CREDIT" || tx.type === "ADMIN_CREDIT"
                                ? "text-secondary"
                                : "text-primary"
                          }`}
                        >
                          {getCategoryIcon(tx.category, tx.type, tx.status)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-primary truncate">
                          {getTransactionDescription(tx)}
                        </h4>
                        <p className="text-[10px] text-on-surface-variant font-label">
                          {tx.category === "TRANSFER" && tx.counterpartyAccountNumber
                            ? `Account ${tx.counterpartyAccountNumber}`
                            : tx.category}{" "}
                          • {formatTime(tx.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p
                        className={`text-sm font-bold tabular-nums ${
                          tx.status === "FAILED" || tx.status === "VOIDED"
                            ? "text-error"
                            : tx.type === "DEBIT"
                              ? "text-primary"
                              : "text-secondary"
                        }`}
                      >
                        {tx.status === "FAILED" || tx.status === "VOIDED"
                          ? "Failed"
                          : `${tx.type === "DEBIT" ? "-" : "+"}${formatCurrency(tx.amount, tx.currency)}`}
                      </p>
                      <p
                        className={`text-[10px] font-label ${
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
  );
};

export default RecentTransactions;

import React, { useEffect, useState } from "react";
import { Account } from "../../types";
import socketService from "../../services/socket";
import { useUserPreferences } from "../../contexts/UserPreferencesContext";
import BalanceToggle from "./BalanceToggle";
import { formatCurrency } from "../../utils/formatters";

interface Props {
  accounts: Account[];
}

const AccountCarousel: React.FC<Props> = ({ accounts: initialAccounts }) => {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const { preferences } = useUserPreferences();

  useEffect(() => {
    setAccounts(initialAccounts);
  }, [initialAccounts]);

  useEffect(() => {
    const handleBalanceUpdate = ({
      accountId,
      newBalance,
    }: {
      accountId: string;
      newBalance: number;
    }) => {
      setAccounts((prev) =>
        prev.map((acc) => (acc._id === accountId ? { ...acc, balance: newBalance } : acc))
      );
    };

    socketService.on("balance:updated", handleBalanceUpdate);
    return () => {
      socketService.off("balance:updated");
    };
  }, []);

  if (accounts.length === 0) {
    return (
      <div className="h-48 rounded-xl border-2 border-dashed border-outline-variant flex items-center justify-center text-on-surface-variant text-sm font-medium">
        No accounts found.
      </div>
    );
  }

  return (
    <div className="flex overflow-x-auto gap-3 sm:gap-4 no-scrollbar pb-2 snap-x snap-mandatory">
      {accounts.map((account) => {
        const isSavings = account.type === "SAVINGS";
        const isDomiciliary = account.type === "DOMICILIARY";

        if (isSavings) {
          return (
            <div
              key={account._id}
              className="min-w-[260px] sm:min-w-[280px] p-4 sm:p-6 rounded-xl bg-gradient-to-br from-primary-container to-[#000000] text-on-primary flex flex-col justify-between h-48 shadow-lg flex-shrink-0 snap-start"
            >
              <div>
                <p className="text-on-primary-container text-xs font-label uppercase tracking-tighter">
                  Savings Vault
                </p>
                <h3 className="text-3xl font-bold tabular-nums tracking-tight mt-1">
                  {formatCurrency(account.balance, account.currency, preferences.hideBalance)}
                </h3>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-on-primary-container/60 text-[10px] font-mono">
                  {account.accountNumber || "Account Number"}
                </p>
                <div className="flex items-center gap-2">
                  <BalanceToggle />
                  <span className="material-symbols-outlined text-secondary-fixed-dim">shield</span>
                </div>
              </div>
            </div>
          );
        }

        if (isDomiciliary) {
          return (
            <div
              key={account._id}
              className="min-w-[260px] sm:min-w-[280px] p-4 sm:p-6 rounded-xl bg-secondary-container/10 border border-secondary/20 text-on-surface flex flex-col justify-between h-48 flex-shrink-0 snap-start"
            >
              <div>
                <p className="text-secondary text-xs font-label uppercase tracking-tighter">
                  Domiciliary {account.currency}
                </p>
                <h3 className="text-3xl font-bold tabular-nums tracking-tight mt-1">
                  {formatCurrency(account.balance, account.currency, preferences.hideBalance)}
                </h3>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-on-surface-variant/60 text-[10px] font-mono">
                  {account.accountNumber || "Account Number"}
                </p>
                <span className="material-symbols-outlined text-secondary">currency_exchange</span>
              </div>
            </div>
          );
        }

        // CURRENT or other
        return (
          <div
            key={account._id}
            className="min-w-[260px] sm:min-w-[280px] p-4 sm:p-6 rounded-xl bg-surface-container-lowest text-on-surface flex flex-col justify-between h-48 shadow-sm border border-outline-variant/10 flex-shrink-0 snap-start"
          >
            <div>
              <p className="text-on-surface-variant text-xs font-label uppercase tracking-tighter">
                {account.type} Account
              </p>
              <h3 className="text-3xl font-bold tabular-nums tracking-tight mt-1 text-primary">
                {formatCurrency(account.balance, account.currency, preferences.hideBalance)}
              </h3>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-on-surface-variant/60 text-[10px] font-mono">
                {account.accountNumber || "Account Number"}
              </p>
              <span className="material-symbols-outlined text-outline">credit_card</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AccountCarousel;

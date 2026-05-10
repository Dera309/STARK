import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '../../hooks/useDashboardData';
import AccountCarousel from '../../components/features/AccountCarousel';
import RecentTransactions from '../../components/features/RecentTransactions';
import TransferModal from '../../components/features/TransferModal';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import DashboardSkeleton from '../../components/ui/DashboardSkeleton';
import { formatCurrency } from '../../utils/formatters';

const Dashboard: React.FC = () => {
  const { user, accounts, transactions, isLoading, error, refresh } = useDashboardData();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const { preferences } = useUserPreferences();
  const navigate = useNavigate();

  // Savings goal: derive from user's savingsGoalTarget vs total savings balance
  const savingsAccount = accounts.find((a) => a.type === "SAVINGS");
  const savingsBalance = savingsAccount?.balance ?? 0;
  const savingsCurrency = savingsAccount?.currency ?? "USD";
  const savingsTarget = (user as { savingsGoalTarget?: number })?.savingsGoalTarget ?? 0;
  const savingsProgress =
    savingsTarget > 0 ? Math.min(Math.round((savingsBalance / savingsTarget) * 100), 100) : 0;

  // Socket connection is handled by CustomerLayout to avoid duplicates

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <p className="text-error font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-4">
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        accounts={accounts}
        onSuccess={() => refresh()}
      />

      {/* Live Accounts Section — matches stitch */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-on-surface-variant font-label text-sm uppercase tracking-widest font-semibold">
            Live Accounts
          </h2>
          <span
            className="text-secondary font-semibold text-sm cursor-pointer"
            onClick={() => navigate("/transactions")}
          >
            View All
          </span>
        </div>
        <AccountCarousel accounts={accounts} />
      </section>

      {/* Quick Actions Bento Grid — responsive */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <button
          onClick={() => setIsTransferModalOpen(true)}
          className="flex flex-col items-center justify-center p-3 sm:p-4 bg-surface-container-low rounded-xl gap-2 sm:gap-3 transition-all hover:bg-surface-container-high group"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center text-on-primary group-active:scale-90 transition-transform">
            <span className="material-symbols-outlined filled text-sm sm:text-lg">swap_horiz</span>
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-on-surface-variant font-label">
            Transfer
          </span>
        </button>

        <button
          onClick={() => navigate("/transactions")}
          className="flex flex-col items-center justify-center p-3 sm:p-4 bg-surface-container-low rounded-xl gap-2 sm:gap-3 transition-all hover:bg-surface-container-high group"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center text-on-primary group-active:scale-90 transition-transform">
            <span className="material-symbols-outlined filled text-sm sm:text-lg">payments</span>
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-on-surface-variant font-label">
            Pay Bills
          </span>
        </button>

        <button
          onClick={() => navigate("/investments")}
          className="flex flex-col items-center justify-center p-3 sm:p-4 bg-secondary rounded-xl gap-2 sm:gap-3 transition-all hover:bg-secondary/90 group"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-on-secondary/20 flex items-center justify-center text-on-secondary group-active:scale-90 transition-transform">
            <span className="material-symbols-outlined filled text-sm sm:text-lg">
              account_balance_wallet
            </span>
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-on-secondary font-label">
            Deposit
          </span>
        </button>
      </section>

      {/* Savings Goal — matches stitch */}
      {savingsTarget > 0 && (
        <section className="p-6 bg-surface-container-low rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-headline font-bold text-sm">Savings Goal</h3>
            <span className="text-secondary font-bold text-xs">{savingsProgress}%</span>
          </div>
          <div className="h-2 w-full bg-surface-dim rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-secondary-fixed-dim to-secondary transition-all duration-1000"
              style={{ width: `${savingsProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-on-surface-variant font-label">
            {formatCurrency(savingsBalance, savingsCurrency, preferences.hideBalance)} of{" "}
            {formatCurrency(savingsTarget, savingsCurrency, preferences.hideBalance)} target
            reached.
          </p>
        </section>
      )}

      {/* Recent Transactions — matches stitch */}
      <RecentTransactions transactions={transactions} onShowAll={() => navigate("/transactions")} />

      {/* FAB — matches stitch */}
      <div className="fixed bottom-20 right-6 z-40">
        <button
          onClick={() => setIsTransferModalOpen(true)}
          className="w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-xl flex items-center justify-center group active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-2xl filled">qr_code_scanner</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;

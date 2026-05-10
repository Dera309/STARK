import React, { useState } from "react";
import api, { ApiError } from "../../services/api";
import { useInvestmentData } from '../../hooks/useInvestmentData';
import { useDashboardData } from '../../hooks/useDashboardData';
import FixedDepositCard from '../../components/features/FixedDepositCard';
import { FixedDeposit } from '../../types';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import InvestmentsSkeleton from '../../components/ui/InvestmentsSkeleton';

const InvestmentTenures = [
  { months: 3, rate: 12, name: "Short Term Starter" },
  { months: 6, rate: 15, name: "Growth Builder" },
  { months: 12, rate: 18, name: "Wealth Multiplier" },
];

const InvestmentsPage: React.FC = () => {
  const { deposits, isLoading, refresh: refreshInvestments } = useInvestmentData();
  const { accounts, refresh: refreshDash } = useDashboardData();
  const { preferences } = useUserPreferences();

  const [isApplyMode, setIsApplyMode] = useState(false);
  const [selectedTenure, setSelectedTenure] = useState(InvestmentTenures[0]);
  const [amount, setAmount] = useState("");
  const [sourceAccountId, setSourceAccountId] = useState("");
  const [destAccountId, setDestAccountId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [confirmLiquidate, setConfirmLiquidate] = useState<FixedDeposit | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionError(null);
    try {
      await api.post("/investments/fixed-deposit", {
        principalAmount: Math.round(parseFloat(amount) * 100),
        interestRate: selectedTenure.rate,
        tenureMonths: selectedTenure.months,
        sourceAccountId,
        destinationAccountId: destAccountId || sourceAccountId,
      });
      setIsApplyMode(false);
      setAmount("");
      refreshInvestments();
      refreshDash();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as ApiError).response?.data?.error?.message 
        : "Placement failed";
      setActionError(errorMessage || "Placement failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLiquidate = async () => {
    if (!confirmLiquidate) return;
    setIsSubmitting(true);
    try {
      await api.post("/investments/liquidate", { fdId: confirmLiquidate._id });
      setConfirmLiquidate(null);
      refreshInvestments();
      refreshDash();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as ApiError).response?.data?.error?.message 
        : "Liquidation failed";
      setActionError(errorMessage || "Liquidation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <InvestmentsSkeleton />;
  }

  const activeInvestments = deposits.filter((d) => d.status === "ACTIVE");
  const totalInvested = activeInvestments.reduce((acc, d) => acc + d.principalAmount, 0);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Investments</h1>
          <p className="text-on-surface-variant text-sm font-medium">
            Make your money work as hard as you do.
          </p>
        </div>
      </div>

      {/* Asset Allocation Hero */}
      <section className="bg-surface-container-highest shadow-2xl rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 sm:gap-8 border border-outline-variant">
        <div className="relative z-10 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant mb-2">
            Total Managed Assets
          </p>
          <h2 className="text-5xl font-black mb-2">${(totalInvested / 100).toLocaleString()}</h2>
          <div className="flex gap-2 text-xs font-bold text-success mb-6">
            <span>↑ 12.4% yield this year</span>
          </div>
          <button
            onClick={() => {
              setIsApplyMode(true);
              setActionError(null);
            }}
            className="px-8 py-4 bg-primary text-white rounded-full font-black text-sm shadow-xl hover:scale-105 transition-transform"
          >
            Start New Deposit
          </button>
        </div>

        <div className="w-48 h-48 rounded-full border-[16px] border-primary/20 flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-full border-[16px] border-primary border-t-transparent -rotate-45" />
          <span className="text-xl font-black">Invested</span>
        </div>
      </section>

      {/* Active Fixed Deposits */}
      {activeInvestments.length > 0 && (
        <section>
          <h3 className="text-xl font-black uppercase tracking-tight text-on-surface-variant mb-4 sm:mb-6">
            Active Fixed Deposits
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {activeInvestments.map((deposit) => (
              <FixedDepositCard
                key={deposit._id}
                deposit={deposit}
                onLiquidateClick={() => setConfirmLiquidate(deposit)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!deposits.length && (
        <section className="text-center py-20 bg-surface-container-low rounded-[3rem] border border-dashed border-outline-variant">
          <div className="text-6xl mb-6">📈</div>
          <h3 className="text-2xl font-black mb-2">No active investments yet</h3>
          <p className="text-on-surface-variant max-w-sm mx-auto mb-8 font-medium">
            Protect your savings from inflation with our high-yield fixed deposits.
          </p>
          <button
            onClick={() => setIsApplyMode(true)}
            className="text-primary font-black uppercase tracking-widest text-xs hover:underline"
          >
            Explore Tenures
          </button>
        </section>
      )}

      {/* New Deposit Modal */}
      {isApplyMode && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          onClick={() => setIsApplyMode(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-surface w-full max-w-lg rounded-[2.5rem] p-6 sm:p-8 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-extrabold mb-2">New Fixed Deposit</h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Choose a plan that fits your financial goals.
            </p>

            {actionError && (
              <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-xl text-xs font-black">
                {actionError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-6">
              {/* Tenure Picker */}
              <div className="grid grid-cols-3 gap-3">
                {InvestmentTenures.map((t) => (
                  <button
                    key={t.months}
                    type="button"
                    onClick={() => setSelectedTenure(t)}
                    className={`p-4 rounded-2xl border transition-all text-center ${selectedTenure.months === t.months ? "bg-primary border-primary text-white" : "bg-surface-container-low border-outline-variant hover:border-primary/50"}`}
                  >
                    <p className="text-lg font-black">{t.months}M</p>
                    <p className="text-[10px] font-bold opacity-80">{t.rate}%</p>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                  Investment Amount ($)
                </label>
                <input
                  type="number"
                  autoFocus
                  placeholder="Min 1,000.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-surface-container-low p-3 sm:p-5 rounded-2xl border border-outline-variant font-headline text-xl sm:text-3xl font-black outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                    Source Account
                  </label>
                  <select
                    className="w-full bg-surface-container-low p-3 rounded-xl border border-outline-variant font-bold text-sm outline-none"
                    value={sourceAccountId}
                    onChange={(e) => setSourceAccountId(e.target.value)}
                    required
                  >
                    <option value="">Select account</option>
                    {accounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.type} ({acc.accountNumber}) -{" "}
                        {preferences.hideBalance
                          ? "••••••"
                          : `${(acc.balance / 100).toLocaleString()} ${acc.currency}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                    Maturity Account
                  </label>
                  <select
                    className="w-full bg-surface-container-low p-3 rounded-xl border border-outline-variant font-bold text-sm outline-none"
                    value={destAccountId}
                    onChange={(e) => setDestAccountId(e.target.value)}
                  >
                    <option value="">
                      {sourceAccountId ? "Same as source" : "Select account"}
                    </option>
                    {accounts
                      .filter((acc) => acc._id !== sourceAccountId)
                      .map((acc) => (
                        <option key={acc._id} value={acc._id}>
                          {acc.type} ({acc.accountNumber}) -{" "}
                          {preferences.hideBalance
                            ? "••••••"
                            : `${(acc.balance / 100).toLocaleString()} ${acc.currency}`}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="p-5 bg-primary/5 rounded-2xl border border-primary/20 space-y-3">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  Projected Maturity Value
                </p>
                <p className="text-xl font-black text-primary">
                  $
                  {(
                    (parseFloat(amount) || 0) *
                    (1 + (selectedTenure.rate / 100) * (selectedTenure.months / 12))
                  ).toLocaleString()}
                </p>
                <div className="text-xs text-on-surface-variant space-y-1">
                  <p>
                    • Funds will be deposited to:{" "}
                    <span className="font-bold text-primary">
                      {destAccountId
                        ? accounts.find((acc) => acc._id === destAccountId)?.accountNumber
                        : accounts.find((acc) => acc._id === sourceAccountId)?.accountNumber}
                    </span>
                  </p>
                  <p>
                    • Maturity date:{" "}
                    {new Date(
                      Date.now() + selectedTenure.months * 30 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-primary text-white rounded-full font-black text-lg shadow-xl hover:bg-primary-container disabled:opacity-50 transition-all active:scale-95"
              >
                {isSubmitting ? "Securing Funds..." : "Place Deposit"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Liquidation Confirmation */}
      {confirmLiquidate && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setConfirmLiquidate(null)}
          />
          <div className="relative bg-surface w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-scale-in text-center">
            <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              ⚠️
            </div>
            <h3 className="text-2xl font-black mb-2">Liquidate Early?</h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Early withdrawal forfeits{" "}
              <span className="text-error font-extrabold">50% of earned interest</span>. You will
              receive approximately
              <span className="block text-lg font-black text-on-surface mt-2 italic">
                ${((confirmLiquidate.principalAmount / 100) * 1.01).toFixed(2)}
              </span>
            </p>

            <div className="space-y-3">
              <button
                onClick={handleLiquidate}
                disabled={isSubmitting}
                className="w-full py-4 bg-error text-white rounded-full font-black text-sm shadow-lg hover:bg-error/90 active:scale-95 transition-all"
              >
                {isSubmitting ? "Processing..." : "Liquidate Anyway"}
              </button>
              <button
                onClick={() => setConfirmLiquidate(null)}
                className="w-full py-4 bg-surface-container-highest rounded-full font-black text-sm text-on-surface transition-all"
              >
                Keep Investment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentsPage;

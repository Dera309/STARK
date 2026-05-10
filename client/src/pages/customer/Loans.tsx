import React, { useState } from "react";
import api, { ApiError } from "../../services/api";
import { useLoanData } from '../../hooks/useLoanData';
import { useDashboardData } from '../../hooks/useDashboardData';
import LoanCard from '../../components/features/LoanCard';
import LoanProductCard from '../../components/features/LoanProductCard';
import { Loan, LoanProduct } from '../../types';
import LoansSkeleton from '../../components/ui/LoansSkeleton';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';

const LoansPage: React.FC = () => {
  const { loans, loanProducts, isLoading, refresh: refreshLoans } = useLoanData();
  const { accounts, refresh: refreshDash } = useDashboardData();
  const { preferences } = useUserPreferences();

  const [selectedProduct, setSelectedProduct] = useState<LoanProduct | null>(null);
  const [selectedLoanForRepay, setSelectedLoanForRepay] = useState<Loan | null>(null);
  const [amount, setAmount] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionError(null);
    try {
      await api.post("/loans/apply", {
        productType: selectedProduct?.productType,
        amount: Math.round(parseFloat(amount) * 100),
        disbursementAccountId: selectedAccountId || accounts[0]?._id,
      });
      setSelectedProduct(null);
      setAmount("");
      refreshLoans();
      refreshDash();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as ApiError).response?.data?.error?.message 
        : "Application failed";
      setActionError(errorMessage || "Application failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRepay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionError(null);
    try {
      // Auto-select primary account if none selected
      const paymentAccountId = selectedAccountId || accounts[0]?._id;
      if (!paymentAccountId) {
        throw new Error("No account available for repayment");
      }

      await api.post("/loans/repay", {
        loanId: selectedLoanForRepay?._id,
        accountId: paymentAccountId,
        amount: Math.round(parseFloat(amount) * 100),
      });
      setSelectedLoanForRepay(null);
      setAmount("");
      setSelectedAccountId("");
      refreshLoans();
      refreshDash();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as ApiError).response?.data?.error?.message 
        : "Repayment failed";
      setActionError(errorMessage || "Repayment failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoansSkeleton />;
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight">Loans &amp; Credit</h1>
        <p className="text-on-surface-variant text-sm font-medium">
          Smart borrowing for your big moves.
        </p>
      </div>
      {/* Credit Limit Hero */}
      <section className="bg-primary shadow-2xl rounded-[2.5rem] p-8 text-white card-gradient from-primary to-primary-container relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-[0.3em] opacity-80 mb-2">
            Available Credit Limit
          </p>
          <h2 className="text-5xl font-black mb-4">$1,250,000</h2>
          <div className="flex gap-4">
            <span className="px-3 py-1 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
              Tier 3 Verified
            </span>
            <span className="px-3 py-1 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
              Prime Rate
            </span>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
      </section>

      {/* Active Loans */}
      {loans.length > 0 && (
        <section>
          <h3 className="text-xl font-black uppercase tracking-tight text-on-surface-variant mb-4 sm:mb-6">
            Your Active Facilities
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
            {loans
              .filter((l) => l.status === "ACTIVE")
              .map((loan) => (
                <LoanCard
                  key={loan._id}
                  loan={loan}
                  onRepayClick={(l) => {
                    setSelectedLoanForRepay(l);
                    setAmount("");
                    setActionError(null);
                    // Auto-select first available account for repayment
                    setSelectedAccountId(accounts[0]?._id || "");
                  }}
                />
              ))}
          </div>
        </section>
      )}

      {/* Loan Marketplace */}
      <section>
        <h3 className="text-xl font-black uppercase tracking-tight text-on-surface-variant mb-4 sm:mb-6">
          Loan Marketplace
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {loanProducts.map((product: LoanProduct) => (
            <LoanProductCard
              key={product.productType}
              product={product}
              onApplyClick={(p) => {
                setSelectedProduct(p);
                setAmount("");
                setActionError(null);
              }}
            />
          ))}
        </div>
      </section>

      {/* Apply Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedProduct(null)}
          />
          <div className="relative bg-surface w-full max-w-md rounded-[2.5rem] p-6 sm:p-8 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-extrabold mb-2">Apply for {selectedProduct.name}</h3>
            <p className="text-sm text-on-surface-variant mb-6">{selectedProduct.description}</p>

            {actionError && (
              <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-xl text-xs font-black">
                {actionError}
              </div>
            )}

            <form onSubmit={handleApply} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                  Amount ($)
                </label>
                <input
                  type="number"
                  autoFocus
                  placeholder={`Max ${selectedProduct.maxAmount / 100}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-surface-container-low p-5 rounded-2xl border border-outline-variant font-headline text-2xl font-black outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                  Disburse to Account
                </label>
                <select
                  className="w-full bg-surface-container-low p-4 rounded-2xl border border-outline-variant font-bold outline-none"
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  required
                >
                  <option value="">Select Account</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.type} ({acc.accountNumber})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-primary text-white rounded-full font-black text-lg shadow-xl hover:bg-primary-container disabled:opacity-50 transition-all active:scale-95"
              >
                {isSubmitting ? "Processing..." : "Submit Application"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Repay Modal */}
      {selectedLoanForRepay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedLoanForRepay(null)}
          />
          <div className="relative bg-surface w-full max-w-md rounded-[2.5rem] p-6 sm:p-8 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-extrabold mb-2">Loan Repayment</h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Facility: {selectedLoanForRepay.productType.replace("_", " ")}
            </p>

            {actionError && (
              <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-xl text-xs font-black">
                {actionError}
              </div>
            )}

            <form onSubmit={handleRepay} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                  Repayment Amount ($)
                </label>
                <input
                  type="number"
                  autoFocus
                  placeholder={`Outstanding: ${selectedLoanForRepay.outstandingBalance / 100}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-surface-container-low p-5 rounded-2xl border border-outline-variant font-headline text-2xl font-black outline-none focus:border-primary"
                  required
                />
              </div>

              {/* Auto-selected account display (not required to select) */}
              {accounts.length > 0 && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                    Payment From
                  </label>
                  <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant">
                    <div className="font-bold text-primary">
                      {
                        accounts.find((acc) => acc._id === (selectedAccountId || accounts[0]?._id))
                          ?.type
                      }{" "}
                      Account
                    </div>
                    <div className="text-sm text-on-surface-variant">
                      {
                        accounts.find((acc) => acc._id === (selectedAccountId || accounts[0]?._id))
                          ?.accountNumber
                      }
                      {" • "}
                      {preferences.hideBalance
                        ? "••••••"
                        : `${(accounts.find((acc) => acc._id === (selectedAccountId || accounts[0]?._id))?.balance || 0) / 100} ${accounts.find((acc) => acc._id === (selectedAccountId || accounts[0]?._id))?.currency}`}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || accounts.length === 0}
                className="w-full py-5 bg-primary text-white rounded-full font-black text-lg shadow-xl hover:bg-primary-container disabled:opacity-50 transition-all active:scale-95"
              >
                {isSubmitting ? "Confirm Repayment" : "Confirm Repayment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoansPage;

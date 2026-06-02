import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useDashboardData } from "../../hooks/useDashboardData";
import { useLoanData } from '../../hooks/useLoanData';
import { formatCurrencyNoDecimals } from "../../utils/formatters";
import api, { ApiError } from "../../services/api";
import LoanCard from '../../components/features/LoanCard';
import LoanProductCard from '../../components/features/LoanProductCard';
import { Loan, LoanProduct } from '../../types';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';

const Wealth: React.FC = () => {
  const { user } = useAuth();
  const { accounts } = useDashboardData();
  const { loans, loanProducts, isLoading: loansLoading, refresh: refreshLoans } = useLoanData();
  const { preferences } = useUserPreferences();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"Overview" | "Savings" | "Budgeting" | "Loans">("Overview");

  const [selectedProduct, setSelectedProduct] = useState<LoanProduct | null>(null);
  const [selectedLoanForRepay, setSelectedLoanForRepay] = useState<Loan | null>(null);
  const [amount, setAmount] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const totalBalance = accounts.reduce((acc, account) => acc + account.balance, 0);
  const totalBalanceUSD = totalBalance / 100;

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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as ApiError).response?.data?.error?.message 
        : "Repayment failed";
      setActionError(errorMessage || "Repayment failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background antialiased pb-[120px] pt-[80px]">
      {/* Fixed TopAppBar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-surface/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-container-padding-mobile shadow-[0px_10px_30px_rgba(192,192,192,0.05)]">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant flex items-center justify-center hover:opacity-80 transition-opacity"
        >
          <img
            alt="User profile"
            className="w-full h-full object-cover"
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || 'U')}+${encodeURIComponent(user?.lastName || '')}&background=1a1c1c&color=e5e2e1&size=80`}
          />
        </button>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold tracking-[0.2em] text-primary uppercase">
          STARK
        </h1>
        <button className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:opacity-80 transition-opacity relative">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
            notifications
          </span>
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-container-padding-mobile w-full">
        {/* Wealth Header & Balance */}
        <section className="mt-stack-md flex flex-col gap-stack-sm">
          <h2 className="font-body-lg text-body-lg text-on-surface-variant">Wealth Portfolio</h2>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-gutter">
              <span className="font-display-lg text-display-lg text-primary tracking-tight">
                {formatCurrencyNoDecimals(totalBalanceUSD, "USD")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1 bg-surface-container border border-white/10 rounded-full px-3 py-1.5">
                <span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>
                  trending_up
                </span>
                <span className="font-label-caps text-label-caps text-tertiary-fixed-dim uppercase">+4.2%</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">vs last month</span>
            </div>
          </div>
        </section>

        {/* Multi-tab View */}
        <nav className="flex items-center gap-gutter border-b border-surface-container mt-2">
          {(["Overview", "Savings", "Budgeting", "Loans"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 border-b-2 font-body-sm text-body-sm transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Investment Performance Chart */}
        <section className="mt-stack-md relative glass-panel rounded-xl overflow-hidden flex flex-col pt-6 pb-4">
          <div className="px-6 flex justify-between items-end mb-8 z-10">
            <div>
              <h3 className="font-title-md text-title-md text-primary">Performance</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">All Assets</p>
            </div>
            <div className="flex gap-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant px-2 py-1 rounded bg-surface-container-high border border-white/5 cursor-pointer">1W</span>
              <span className="font-label-caps text-label-caps text-primary px-2 py-1 rounded bg-surface-container-high border border-white/10 cursor-pointer">1M</span>
              <span className="font-label-caps text-label-caps text-on-surface-variant px-2 py-1 rounded bg-surface-container-high border border-white/5 cursor-pointer">1Y</span>
            </div>
          </div>
          {/* Abstract Area Chart Representation */}
          <div className="relative h-40 w-full mt-auto">
            <div className="absolute inset-0 bg-gradient-to-t from-tertiary-fixed-dim/20 to-transparent z-0"></div>
            {/* Stylized chart line via border on an absolute element */}
            <div className="absolute bottom-0 left-0 right-0 h-[70%] border-t-[1.5px] border-tertiary-fixed-dim" style={{ clipPath: 'polygon(0 40%, 20% 60%, 40% 30%, 60% 50%, 80% 10%, 100% 0, 100% 100%, 0 100%)' }}></div>
            {/* Vertical grid lines */}
            <div className="absolute inset-0 flex justify-between px-6 opacity-10">
              <div className="h-full w-px bg-white"></div>
              <div className="h-full w-px bg-white"></div>
              <div className="h-full w-px bg-white"></div>
              <div className="h-full w-px bg-white"></div>
            </div>
          </div>
        </section>

        {/* Savings Goals */}
        <section className="mt-stack-md flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-title-md text-title-md text-primary">Strategic Reserves</h3>
            <button className="font-label-caps text-label-caps text-tertiary-fixed-dim uppercase tracking-wider">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Goal Card 1 */}
            <div className="glass-panel rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-surface-container-high flex items-center justify-center border border-white/5">
                    <span className="material-symbols-outlined text-primary text-[20px]">sailing</span>
                  </div>
                  <div>
                    <h4 className="font-body-lg text-body-lg text-primary">New Yacht</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Monaco Delivery</p>
                  </div>
                </div>
                <span className="font-body-sm text-body-sm text-primary">$4.5M / $7M</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-tertiary-fixed-dim w-[64%] rounded-full shadow-[0_0_10px_rgba(233,195,73,0.5)]"></div>
              </div>
            </div>
            {/* Goal Card 2 */}
            <div className="glass-panel rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-surface-container-high flex items-center justify-center border border-white/5">
                    <span className="material-symbols-outlined text-primary text-[20px]">domain</span>
                  </div>
                  <div>
                    <h4 className="font-body-lg text-body-lg text-primary">Global Real Estate</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">London Portfolio</p>
                  </div>
                </div>
                <span className="font-body-sm text-body-sm text-primary">$12M / $30M</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-tertiary-fixed-dim w-[40%] rounded-full shadow-[0_0_10px_rgba(233,195,73,0.5)]"></div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Insights */}
        <section className="mt-stack-md">
          <div className="bg-surface-container-low border border-white/5 rounded-xl p-6 relative overflow-hidden flex flex-col gap-4">
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-tertiary-fixed-dim/10 rounded-full blur-[40px] pointer-events-none"></div>
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <span className="material-symbols-outlined text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              <h3 className="font-title-md text-title-md text-primary">STARK Intelligence</h3>
            </div>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim mt-1">check_circle</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Consider rebalancing tech holdings; current exposure is 8% above optimal risk threshold.</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim mt-1">check_circle</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Tax-loss harvesting opportunities available in secondary equity markets.</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim mt-1">check_circle</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Liquid assets exceed operational requirements. Suggest allocating surplus to high-yield municipal bonds.</p>
              </li>
            </ul>
          </div>
        </section>

        {/* Loans Tab Content */}
        {activeTab === "Loans" && (
          <div className="space-y-8 animate-fade-in pb-12">
            {/* Credit Limit Hero */}
            <section className="rounded-xl p-8 md:p-10 flex flex-col gap-6 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-700" style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
              }}></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-stark-gold rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-700" />
              <div className="relative z-10">
                <p className="font-label-caps text-label-caps text-white/80 uppercase tracking-widest mb-2">
                  Available Credit Limit
                </p>
                <h2 className="font-display-lg text-display-lg text-white tracking-tight tabular-nums mb-4">
                  $1,250,000
                </h2>
                <div className="flex gap-3 flex-wrap">
                  <span className="elite-badge">Tier 3 Verified</span>
                  <span className="elite-badge">Prime Rate</span>
                </div>
              </div>
            </section>

            {/* Active Loans */}
            {loans.length > 0 && (
              <section>
                <h3 className="text-xl font-black uppercase tracking-tight text-white mb-4 sm:mb-6">
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
                          setSelectedAccountId(accounts[0]?._id || "");
                        }}
                      />
                    ))}
                </div>
              </section>
            )}

            {/* Loan Marketplace */}
            <section>
              <h3 className="text-xl font-black uppercase tracking-tight text-white mb-4 sm:mb-6">
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
          </div>
        )}

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
      </main>

      {/* Bottom NavBar — WEALTH active */}
      <nav className="fixed bottom-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-2xl rounded-t-lg border-t border-white/5 shadow-[0px_-10px_40px_rgba(0,0,0,0.5)] transition-all ease-[cubic-bezier(0.2,0.8,0.2,1)] flex justify-around items-center h-24 pb-safe px-4 md:hidden">
        {[
          { path: "/dashboard", icon: "grid_view", label: "Dashboard" },
          { path: "/transfers", icon: "swap_horiz", label: "Transfer" },
          { path: "/transactions", icon: "history", label: "History" },
          { path: "/wealth", icon: "account_balance_wallet", label: "Wealth", active: true },
          { path: "/investments", icon: "trending_up", label: "Invest" },
          { path: "/settings", icon: "person", label: "Profile" },
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center gap-1 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
              item.active
                ? "text-primary scale-110"
                : "text-on-surface-variant/40 hover:text-primary/80"
            }`}
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform duration-300" style={{ fontVariationSettings: item.active ? "'FILL' 1" : "'FILL' 0" }}>
              {item.icon}
            </span>
            <span className="font-label-caps text-label-caps uppercase">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Wealth;

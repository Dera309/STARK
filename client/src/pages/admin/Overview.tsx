import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { formatCurrencyNoDecimals } from "../../utils/formatters";
import AdminOverviewSkeleton from "../../components/ui/AdminOverviewSkeleton";

interface Stats {
  totalUsers: number;
  pendingKycUsers: number;
  totalAssetsValue: number;
  totalLoanValue: number;
  recentTransCount: number;
}

const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((res) => setStats(res.data))
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load stats.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <AdminOverviewSkeleton />;
  }

  if (error || !stats) {
    return (
      <div className="h-96 flex items-center justify-center">
        <p className="text-error font-bold">{error || "Could not load dashboard stats."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <header>
        <h2 className="text-3xl font-black">Bank Executive Overview</h2>
        <p className="text-on-surface-variant text-sm font-medium">
          Real-time health pulse of STARK Digital.
        </p>
      </header>

      {/* Stats Grid - 4 columns on large desktop, 2 on tablet */}
      <section className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6">
        <div className="bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4">
            Total Customers
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-headline font-black">{stats.totalUsers}</h3>
            <span className="text-xs font-bold text-success">↑ 4%</span>
          </div>
        </div>

        <div className="bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4">
            Pending KYC
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-headline font-black text-primary">
              {stats.pendingKycUsers}
            </h3>
            <span className="text-xs font-bold text-on-surface-variant">Review</span>
          </div>
        </div>

        <div className="bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4">
            Total Assets
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-headline font-black">
              {formatCurrencyNoDecimals(stats.totalAssetsValue, "USD")}
            </h3>
          </div>
        </div>

        <div className="bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4">
            Loan Volume
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-headline font-black">
              {formatCurrencyNoDecimals(stats.totalLoanValue, "USD")}
            </h3>
          </div>
        </div>
      </section>

      {/* Activity and Liquidity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 bg-surface-container-low p-8 rounded-[2.5rem] border border-outline-variant">
          <h4 className="text-lg font-black mb-6">Activity Snapshot (24h)</h4>
          <div className="h-64 flex items-end gap-3 px-4">
            {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
              <div key={i} className="flex-1 bg-primary/20 rounded-t-xl relative group">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-xl transition-all duration-1000"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </section>

        <section className="bg-primary shadow-2xl rounded-[2.5rem] p-8 text-white card-gradient from-primary to-primary-container relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <h4 className="text-xl font-black mb-2">Liquidity Score</h4>
            <p className="text-xs opacity-70 mb-8 font-medium italic">
              Your capital adequacy is within optimal range.
            </p>
            <div className="text-6xl font-headline font-black">
              94<span className="text-2xl">/100</span>
            </div>
          </div>
          <div className="relative z-10 mt-12 bg-white/20 p-4 rounded-2xl backdrop-blur-md">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Recent Tx Count</p>
            <p className="text-lg font-black">{stats.recentTransCount} operations</p>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </section>
      </div>
    </div>
  );
};

export default AdminOverview;

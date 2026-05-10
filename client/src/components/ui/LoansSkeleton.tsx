import React from "react";
import Skeleton from "./Skeleton";

const LoansSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton variant="text" width="250" height="40" />
        <Skeleton variant="text" width="350" height="16" />
      </div>

      {/* Credit Limit Hero */}
      <section className="bg-surface-container-low rounded-[2.5rem] p-8 space-y-4">
        <Skeleton variant="text" width="200" height="16" />
        <Skeleton variant="text" width="300" height="48" />
        <div className="flex gap-4">
          <Skeleton variant="rectangular" width="120" height="28" className="rounded-full" />
          <Skeleton variant="rectangular" width="100" height="28" className="rounded-full" />
        </div>
      </section>

      {/* Active Loans */}
      <section className="space-y-4">
        <Skeleton variant="text" width="280" height="24" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-surface-container-low rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-start">
                <Skeleton variant="text" width="150" height="20" />
                <Skeleton variant="rectangular" width="60" height="24" className="rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton variant="text" width="180" height="32" />
                <Skeleton variant="text" width="120" height="16" />
              </div>
              <div className="space-y-2">
                <Skeleton variant="rectangular" width="100%" height="8" className="rounded-full" />
                <Skeleton variant="text" width="200" height="14" />
              </div>
              <Skeleton variant="rectangular" width="100%" height="40" className="rounded-xl" />
            </div>
          ))}
        </div>
      </section>

      {/* Loan Marketplace */}
      <section className="space-y-4">
        <Skeleton variant="text" width="200" height="24" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface-container-low rounded-2xl p-6 space-y-4">
              <Skeleton variant="text" width="140" height="20" />
              <Skeleton variant="text" width="100%" height="16" />
              <div className="space-y-2">
                <Skeleton variant="text" width="80" height="14" />
                <Skeleton variant="text" width="100" height="32" />
              </div>
              <div className="space-y-2">
                <Skeleton variant="text" width="80" height="14" />
                <Skeleton variant="text" width="80" height="16" />
              </div>
              <Skeleton variant="rectangular" width="100%" height="40" className="rounded-xl" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LoansSkeleton;

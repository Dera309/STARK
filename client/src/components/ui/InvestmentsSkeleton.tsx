import React from "react";
import Skeleton from "./Skeleton";

const InvestmentsSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton variant="text" width="200" height="40" />
          <Skeleton variant="text" width="350" height="16" />
        </div>
      </div>

      {/* Asset Allocation Hero */}
      <section className="bg-surface-container-highest rounded-[2.5rem] p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-8 border border-outline-variant">
        <div className="flex-1 space-y-4">
          <Skeleton variant="text" width="200" height="16" />
          <Skeleton variant="text" width="250" height="48" />
          <div className="flex gap-2">
            <Skeleton variant="rectangular" width="120" height="20" className="rounded" />
          </div>
          <Skeleton variant="rectangular" width="180" height="48" className="rounded-full" />
        </div>
        <Skeleton variant="circular" width="192" height="192" />
      </section>

      {/* Active Fixed Deposits */}
      <section className="space-y-4">
        <Skeleton variant="text" width="280" height="24" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface-container-low rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-start">
                <Skeleton variant="text" width="120" height="20" />
                <Skeleton variant="rectangular" width="70" height="24" className="rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton variant="text" width="160" height="32" />
                <Skeleton variant="text" width="100" height="16" />
              </div>
              <div className="space-y-2">
                <Skeleton variant="text" width="80" height="14" />
                <Skeleton variant="text" width="100" height="14" />
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
    </div>
  );
};

export default InvestmentsSkeleton;

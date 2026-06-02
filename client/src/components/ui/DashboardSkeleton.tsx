import React from "react";
import Skeleton from "./Skeleton";
import AccountSkeleton from "./AccountSkeleton";
import TransactionSkeleton from "./TransactionSkeleton";

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 pb-4">
      {/* Hero Balance/Wealth Portfolio Section */}
      <section className="flex flex-col gap-4 mt-4">
        <div className="rounded-xl p-6 md:p-10 flex flex-col gap-6 md:items-center relative overflow-hidden">
          <Skeleton variant="text" width="200" height="20" />
          <Skeleton variant="text" width="300" height="40" />
          <Skeleton variant="rectangular" width="200" height="32" className="rounded-full" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4 md:flex md:justify-center md:gap-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3"
            >
              <Skeleton variant="circular" width="56" height="56" />
              <Skeleton variant="text" width="40" height="12" />
            </div>
          ))}
        </div>
      </section>

      {/* Two Column Layout for Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Virtual Card */}
        <div className="md:col-span-7 flex flex-col gap-8">
          <section className="flex flex-col gap-3">
            <Skeleton variant="text" width="120" height="20" />
            <div className="rounded-xl aspect-[1.586/1]">
              <Skeleton variant="rectangular" width="100%" height="100%" />
            </div>
          </section>
        </div>

        {/* Right Column: Recent Transactions */}
        <div className="md:col-span-5 flex flex-col gap-8">
          <section className="space-y-4">
            <div className="flex justify-between items-end">
              <Skeleton variant="text" width="160" height="16" />
              <Skeleton variant="text" width="60" height="14" />
            </div>
            <div className="space-y-3">
              <TransactionSkeleton />
              <TransactionSkeleton />
              <TransactionSkeleton />
              <TransactionSkeleton />
              <TransactionSkeleton />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;

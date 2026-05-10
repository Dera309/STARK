import React from "react";
import Skeleton from "./Skeleton";
import AccountSkeleton from "./AccountSkeleton";
import TransactionSkeleton from "./TransactionSkeleton";

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 pb-4">
      {/* Accounts Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <Skeleton variant="text" width="120" height="16" />
          <Skeleton variant="text" width="60" height="14" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          <AccountSkeleton />
          <AccountSkeleton />
          <AccountSkeleton />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center p-3 sm:p-4 bg-surface-container-low rounded-xl gap-2 sm:gap-3"
          >
            <Skeleton variant="circular" width="48" height="48" />
            <Skeleton variant="text" width="60" height="12" />
          </div>
        ))}
      </section>

      {/* Savings Goal */}
      <section className="p-6 bg-surface-container-low rounded-xl space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton variant="text" width="100" height="16" />
          <Skeleton variant="text" width="40" height="14" />
        </div>
        <Skeleton variant="rectangular" width="100%" height="8" className="rounded-full" />
        <Skeleton variant="text" width="200" height="12" />
      </section>

      {/* Recent Transactions */}
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
  );
};

export default DashboardSkeleton;

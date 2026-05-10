import React from "react";
import Skeleton from "./Skeleton";

const TransactionsSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 pb-4">
      {/* Search & Filters */}
      <section className="space-y-6">
        <div className="relative">
          <Skeleton variant="rectangular" width="100%" height="48" className="rounded-xl" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[...Array(3)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              width="80"
              height="32"
              className="rounded-full"
            />
          ))}
        </div>
      </section>

      {/* Statement Download */}
      <section className="bg-surface-container-low p-6 rounded-xl space-y-4">
        <div className="space-y-2">
          <Skeleton variant="text" width="200" height="20" />
          <Skeleton variant="text" width="250" height="14" />
        </div>
        <div className="grid grid-cols-1 gap-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              width="100%"
              height="48"
              className="rounded-lg"
            />
          ))}
        </div>
      </section>

      {/* Transactions List */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <Skeleton variant="text" width="180" height="24" />
          <Skeleton variant="text" width="60" height="14" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-xl"
            >
              <Skeleton variant="circular" width="48" height="48" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="140" height="16" />
                <Skeleton variant="text" width="100" height="12" />
              </div>
              <div className="text-right space-y-2">
                <Skeleton variant="text" width="80" height="16" />
                <Skeleton variant="text" width="60" height="12" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TransactionsSkeleton;

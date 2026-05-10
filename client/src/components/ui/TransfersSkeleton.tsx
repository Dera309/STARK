import React from "react";
import Skeleton from "./Skeleton";

const TransfersSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 sm:space-y-8 pb-4">
      {/* Header */}
      <section className="space-y-2 sm:space-y-4">
        <Skeleton variant="text" width="200" height="36" />
        <Skeleton variant="text" width="300" height="16" />
      </section>

      {/* Quick Transfer Actions */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center p-4 sm:p-6 bg-surface-container-low rounded-xl gap-2 sm:gap-3"
          >
            <Skeleton variant="circular" width="56" height="56" />
            <div className="text-center space-y-2">
              <Skeleton variant="text" width="60" height="16" />
              <Skeleton variant="text" width="80" height="12" className="hidden sm:block" />
            </div>
          </div>
        ))}
      </section>

      {/* Recent Recipients */}
      <section className="space-y-3">
        <Skeleton variant="text" width="180" height="16" />
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 min-w-[72px]">
              <Skeleton variant="circular" width="56" height="56" />
              <Skeleton variant="text" width="50" height="12" />
            </div>
          ))}
        </div>
      </section>

      {/* Recent Transfers */}
      <section className="space-y-4">
        <Skeleton variant="text" width="180" height="20" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <Skeleton variant="circular" width="48" height="48" />
                <div className="space-y-2">
                  <Skeleton variant="text" width="120" height="16" />
                  <Skeleton variant="text" width="80" height="12" />
                </div>
              </div>
              <div className="text-right space-y-2">
                <Skeleton variant="text" width="80" height="16" />
                <Skeleton variant="text" width="50" height="12" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TransfersSkeleton;

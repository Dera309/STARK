import React from "react";
import Skeleton from "./Skeleton";

const AdminOverviewSkeleton: React.FC = () => {
  return (
    <div className="space-y-10 animate-fade-in">
      <header className="space-y-2">
        <Skeleton variant="text" width="350" height="40" />
        <Skeleton variant="text" width="400" height="16" />
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant space-y-4"
          >
            <Skeleton variant="text" width="150" height="16" />
            <div className="flex items-baseline gap-2">
              <Skeleton variant="text" width="80" height="40" />
              <Skeleton variant="text" width="40" height="16" />
            </div>
          </div>
        ))}
      </section>

      {/* Activity and Liquidity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 bg-surface-container-low p-8 rounded-[2.5rem] border border-outline-variant space-y-6">
          <Skeleton variant="text" width="180" height="24" />
          <div className="h-64 flex items-end gap-3 px-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex-1 space-y-2">
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={`${40 + Math.random() * 50}%`}
                  className="rounded-t-xl"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between gap-4">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} variant="text" width="30" height="12" />
            ))}
          </div>
        </section>

        <section className="bg-surface-container-low p-8 rounded-[2.5rem] border border-outline-variant space-y-6">
          <Skeleton variant="text" width="150" height="24" />
          <Skeleton variant="text" width="280" height="16" />
          <Skeleton variant="text" width="120" height="64" />
          <div className="bg-surface-container-high p-4 rounded-2xl space-y-2 mt-8">
            <Skeleton variant="text" width="140" height="12" />
            <Skeleton variant="text" width="100" height="20" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminOverviewSkeleton;

import React from "react";

const AppSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface">
      {/* Desktop Navigation Skeleton */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 bg-surface border-b border-outline-variant z-50 px-6">
        <div className="flex-1 flex items-center gap-8">
          <div className="flex items-center gap-3 py-4">
            <div className="w-8 h-8 bg-surface-container-high rounded animate-pulse"></div>
            <div className="w-16 h-6 bg-surface-container-high rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-12 h-8 bg-surface-container-high rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 py-3">
          <div className="w-8 h-8 bg-surface-container-high rounded-full animate-pulse"></div>
          <div className="w-10 h-10 bg-surface-container-high rounded-full animate-pulse"></div>
        </div>
      </nav>

      {/* Mobile Header Skeleton */}
      <header className="lg:hidden bg-surface w-full top-0 sticky z-50">
        <div className="flex justify-between items-center px-6 py-4 w-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-surface-container-high rounded animate-pulse"></div>
            <div className="w-16 h-6 bg-surface-container-high rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-surface-container-high rounded-full animate-pulse"></div>
            <div className="w-10 h-10 bg-surface-container-high rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="px-4 lg:px-6 pt-6 pb-28 lg:pb-8 space-y-8 max-w-2xl lg:max-w-6xl mx-auto lg:pt-24">
        {/* Account Cards Skeleton */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="w-24 h-4 bg-surface-container-high rounded animate-pulse"></div>
            <div className="w-16 h-4 bg-surface-container-high rounded animate-pulse"></div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="min-w-[280px] bg-surface-container-low rounded-2xl p-6 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="w-20 h-5 bg-surface-container-high rounded animate-pulse"></div>
                  <div className="w-10 h-10 bg-surface-container-high rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="w-32 h-8 bg-surface-container-high rounded animate-pulse"></div>
                  <div className="w-20 h-4 bg-surface-container-high rounded animate-pulse"></div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div className="w-16 h-4 bg-surface-container-high rounded animate-pulse"></div>
                  <div className="w-12 h-4 bg-surface-container-high rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center p-3 sm:p-4 bg-surface-container-low rounded-xl gap-2 sm:gap-3"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface-container-high animate-pulse"></div>
              <div className="w-12 h-3 bg-surface-container-high rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Transactions Skeleton */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="w-32 h-4 bg-surface-container-high rounded animate-pulse"></div>
            <div className="w-16 h-4 bg-surface-container-high rounded animate-pulse"></div>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface-container-high rounded-full animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="w-24 h-4 bg-surface-container-high rounded animate-pulse"></div>
                    <div className="w-16 h-3 bg-surface-container-high rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="w-16 h-5 bg-surface-container-high rounded animate-pulse"></div>
                  <div className="w-12 h-3 bg-surface-container-high rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Skeleton */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full flex justify-around items-center py-3 bg-surface/70 backdrop-blur-xl z-50 rounded-t-xl border-t border-outline-variant">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col items-center justify-center gap-1">
            <div className="w-6 h-6 bg-surface-container-high rounded animate-pulse"></div>
            <div className="w-8 h-3 bg-surface-container-high rounded animate-pulse"></div>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default AppSkeleton;

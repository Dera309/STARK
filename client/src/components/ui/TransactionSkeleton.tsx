import React from "react";
import Skeleton from "./Skeleton";

const TransactionSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width="48" height="48" />
        <div className="space-y-2">
          <Skeleton variant="text" width="140" height="16" />
          <Skeleton variant="text" width="100" height="12" />
        </div>
      </div>
      <div className="text-right space-y-2">
        <Skeleton variant="text" width="80" height="18" />
        <Skeleton variant="text" width="60" height="12" />
      </div>
    </div>
  );
};

export default TransactionSkeleton;

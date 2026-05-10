import React from "react";
import Skeleton from "./Skeleton";

const AccountSkeleton: React.FC = () => {
  return (
    <div className="bg-surface-container-low rounded-2xl p-6 space-y-4">
      <div className="flex justify-between items-start">
        <Skeleton variant="text" width="120" height="20" />
        <Skeleton variant="circular" width="40" height="40" />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" width="180" height="32" />
        <Skeleton variant="text" width="100" height="16" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton variant="text" width="80" height="14" />
        <Skeleton variant="text" width="60" height="14" />
      </div>
    </div>
  );
};

export default AccountSkeleton;

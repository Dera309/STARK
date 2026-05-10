import React, { useState, useEffect } from "react";
import { FixedDeposit } from "../../types";
import { formatCurrency } from "../../utils/formatters";

interface Props {
  deposit: FixedDeposit;
  onLiquidateClick: (deposit: FixedDeposit) => void;
}

const FixedDepositCard: React.FC<Props> = ({ deposit, onLiquidateClick }) => {
  const [accrued, setAccrued] = useState(deposit.currentValue);

  // Real-time interest "ticking" animation simulation
  useEffect(() => {
    if (deposit.status !== "ACTIVE") return;

    const interval = setInterval(() => {
      const totalPlannedInterest = deposit.projectedMaturityAmount - deposit.principalAmount;
      const start = new Date(deposit.createdAt).getTime();
      const end = new Date(deposit.maturityDate).getTime();
      const now = Date.now();

      const ratio = Math.min(1, (now - start) / (end - start));
      const currentInterest = Math.round(totalPlannedInterest * ratio);
      setAccrued(deposit.principalAmount + currentInterest);
    }, 1000);

    return () => clearInterval(interval);
  }, [deposit]);

  const daysRemaining = Math.max(
    0,
    Math.ceil((new Date(deposit.maturityDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );
  const progress = Math.min(100, (1 - daysRemaining / (deposit.tenureMonths * 30)) * 100);

  return (
    <div className="bg-surface-container-low rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-outline-variant shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-3 sm:p-4">
        <div
          className={`w-3 h-3 rounded-full ${deposit.status === "ACTIVE" ? "bg-success animate-pulse" : deposit.status === "MATURED" ? "bg-primary" : "bg-outline-variant"}`}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3 sm:mb-4">
        <div>
          <h4 className="text-lg sm:text-xl font-black">{deposit.depositRef}</h4>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            Fixed Deposit • {deposit.tenureMonths} Months
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest italic">
            Est. Maturity
          </p>
          <p className="text-sm font-black text-primary">
            {formatCurrency(deposit.projectedMaturityAmount, "USD")}
          </p>
        </div>
      </div>

      <div className="py-4 sm:py-6 space-y-2">
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-center">
          Current Accrued Value
        </p>
        <p className="text-2xl sm:text-3xl font-black text-center font-headline tabular-nums">
          {formatCurrency(
            deposit.status === "ACTIVE"
              ? accrued
              : deposit.status === "MATURED"
                ? deposit.projectedMaturityAmount
                : deposit.principalAmount,
            "USD"
          )}
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary card-gradient from-primary to-primary-container transition-all duration-1000"
            style={{ width: `${deposit.status === "ACTIVE" ? progress : 100}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-on-surface-variant">
          <span>{deposit.interestRate}% P.A.</span>
          <span>{deposit.status === "ACTIVE" ? `${daysRemaining} Days Left` : deposit.status}</span>
        </div>

        {deposit.status === "ACTIVE" && (
          <button
            onClick={() => onLiquidateClick(deposit)}
            className="w-full py-3 sm:py-4 bg-surface-container-highest text-primary rounded-xl sm:rounded-2xl font-black text-xs hover:bg-error hover:text-white transition-all active:scale-95 shadow-sm"
          >
            Liquidate Early
          </button>
        )}
      </div>
    </div>
  );
};

export default FixedDepositCard;

import React from "react";
import { Loan } from "../../types";
import { formatCurrency } from "../../utils/formatters";

interface Props {
  loan: Loan;
  onRepayClick: (loan: Loan) => void;
}

const LoanCard: React.FC<Props> = ({ loan, onRepayClick }) => {
  const progress = Math.max(
    0,
    100 - (loan.outstandingBalance / (loan.principalAmount * (1 + loan.interestRate / 100))) * 100
  );

  return (
    <div className="bg-surface-container-low rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-outline-variant shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-primary/5 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 group-hover:scale-150 transition-transform duration-700" />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 sm:mb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-2 py-1 rounded">
            {loan.productType.replace("_", " ")}
          </span>
          <h4 className="text-lg sm:text-xl font-black mt-2">Active Facility</h4>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            Outstanding
          </p>
          <p className="text-base sm:text-lg font-black text-primary">
            {formatCurrency(loan.outstandingBalance, "USD")}
          </p>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div>
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-on-surface-variant italic">Repayment Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary card-gradient from-primary to-primary-container transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 py-3 sm:py-4 border-y border-outline-variant/30">
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">
              Monthly Pay
            </p>
            <p className="font-headline font-black text-sm">
              {formatCurrency(loan.monthlyPayment, "USD")}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">
              Interest Rate
            </p>
            <p className="font-headline font-black text-sm">{loan.interestRate}%</p>
          </div>
        </div>

        <button
          onClick={() => onRepayClick(loan)}
          className="w-full py-3 sm:py-4 bg-surface-container-highest text-primary rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm hover:bg-primary hover:text-white transition-all active:scale-95 shadow-sm"
        >
          Repay Now
        </button>
      </div>
    </div>
  );
};

export default LoanCard;

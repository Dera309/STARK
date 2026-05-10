import React from "react";
import { LoanProduct } from "../../types";
import { formatCurrencyNoDecimals } from "../../utils/formatters";

interface Props {
  product: LoanProduct;
  onApplyClick: (product: LoanProduct) => void;
}

const LoanProductCard: React.FC<Props> = ({ product, onApplyClick }) => {
  return (
    <div
      className="bg-surface-container-low rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-outline-variant hover:border-primary/50 transition-all cursor-pointer group flex flex-col justify-between"
      onClick={() => onApplyClick(product)}
    >
      <div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl sm:text-2xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
          {product.productType === "QUICK_LOAN"
            ? "⚡"
            : product.productType === "SALARY_ADVANCE"
              ? "📅"
              : "📱"}
        </div>
        <h4 className="text-lg sm:text-xl font-black mb-2">{product.name}</h4>
        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed line-clamp-3 mb-3 sm:mb-4">
          {product.description}
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div className="flex justify-between items-center py-2 sm:py-3 border-t border-outline-variant/30">
          <span className="text-[10px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-widest">
            Rate
          </span>
          <span className="text-xs sm:text-sm font-black text-primary">
            {product.interestRate}% total
          </span>
        </div>
        <div className="flex justify-between items-center py-2 sm:py-3 border-t border-outline-variant/30">
          <span className="text-[10px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-widest">
            Up to
          </span>
          <span className="text-xs sm:text-sm font-black">
            {formatCurrencyNoDecimals(product.maxAmount, "USD")}
          </span>
        </div>

        <button
          className="w-full py-3 sm:py-4 bg-primary text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm group-hover:bg-primary-container transition-colors active:scale-[0.98]"
          onClick={(e) => {
            e.stopPropagation();
            onApplyClick(product);
          }}
        >
          Check Eligibility
        </button>
      </div>
    </div>
  );
};

export default LoanProductCard;

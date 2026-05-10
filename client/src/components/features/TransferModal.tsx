import React, { useState, useEffect } from "react";
import api, { ApiError } from "../../services/api";
import { Account } from "../../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onSuccess: () => void;
}

const TransferModal: React.FC<Props> = ({ isOpen, onClose, accounts, onSuccess }) => {
  const [sourceAccountId, setSourceAccountId] = useState("");
  const [targetAccountNumber, setTargetAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update source account when accounts prop changes or modal opens
  useEffect(() => {
    if (isOpen && accounts.length > 0) {
      // Always reset to first account when modal opens
      setSourceAccountId(accounts[0]._id);
    }
  }, [isOpen, accounts]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTargetAccountNumber("");
      setAmount("");
      setNote("");
      setCurrency("USD");
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Convert amount to minor units based on currency
      const divisor = ["USD", "EUR", "GBP"].includes(currency) ? 100 : 100;
      const minorAmount = Math.round(parseFloat(amount) * divisor);

      await api.post("/transactions/transfer", {
        sourceAccountId,
        targetAccountNumber,
        amount: minorAmount,
        currency,
        category: "TRANSFER",
        note,
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as ApiError).response?.data?.error?.message 
        : "Transfer failed. Please check details.";
      setError(errorMessage || "Transfer failed. Please check details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal - full width on mobile, responsive sizing */}
      <div className="relative bg-surface w-full sm:max-w-md lg:max-w-xl rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/10 animate-scale-in my-4 sm:my-8 mx-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Transfer Funds</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high text-lg sm:text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container text-xs font-bold rounded-lg border border-error/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Source Account */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              From Account
            </label>
            {accounts.length === 0 ? (
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant text-center">
                <p className="text-sm text-on-surface-variant">No accounts available</p>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={sourceAccountId}
                  onChange={(e) => setSourceAccountId(e.target.value)}
                  className="w-full bg-surface-container-low p-3 sm:p-4 pr-10 rounded-xl border border-outline-variant font-medium outline-none focus:border-primary transition-colors text-sm appearance-none cursor-pointer"
                >
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id} className="py-2">
                      {acc.type} {acc.accountNumber} • {(acc.balance / 100).toLocaleString()}{" "}
                      {acc.currency}
                    </option>
                  ))}
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant text-lg">
                    expand_more
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Target Account */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Recipient Account
            </label>
            <input
              type="text"
              placeholder="Account number"
              maxLength={10}
              value={targetAccountNumber}
              onChange={(e) => setTargetAccountNumber(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-surface-container-low p-3 sm:p-4 rounded-xl border border-outline-variant font-medium outline-none focus:border-primary transition-colors text-sm"
              required
            />
          </div>

          {/* Currency Selector */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Currency
            </label>
            <div className="flex gap-2">
              {["USD", "GBP", "EUR", "CAD", "AUD", "CHF", "JPY"].map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setCurrency(curr)}
                  className={`flex-1 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    currency === curr
                      ? "bg-primary text-white shadow-md"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-base">
                {currency === "USD"
                  ? "$"
                  : currency === "GBP"
                    ? "£"
                    : currency === "EUR"
                      ? "€"
                      : currency === "CAD"
                        ? "C$"
                        : currency === "AUD"
                          ? "A$"
                          : currency === "CHF"
                            ? "CHF"
                            : "¥"}
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-surface-container-low p-3 sm:p-4 pl-8 rounded-xl border border-outline-variant font-headline text-lg sm:text-xl font-black outline-none focus:border-primary transition-colors"
                required
              />
            </div>
          </div>

          {/* Fee Info */}
          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/50">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-on-surface-variant">Transfer Fee</span>
              <span className="font-bold">
                {currency === "USD"
                  ? "$0.50"
                  : currency === "GBP"
                    ? "£0.50"
                    : currency === "EUR"
                      ? "€0.50"
                      : currency === "CAD"
                        ? "C$0.50"
                        : currency === "AUD"
                          ? "A$0.50"
                          : currency === "CHF"
                            ? "CHF0.50"
                            : "¥50"}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm mt-1">
              <span className="text-on-surface-variant">Arrival</span>
              <span className="font-bold text-success">Instant</span>
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="What's this for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-surface-container-low p-3 sm:p-4 rounded-xl border border-outline-variant font-medium outline-none focus:border-primary transition-colors text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 sm:py-4 bg-primary text-white rounded-full font-bold text-sm sm:text-base shadow-xl hover:bg-primary-container transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? "Processing..." : `Send ${currency}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;

import React, { useState, useEffect } from "react";
import { useDashboardData } from "../../hooks/useDashboardData";
import TransferModal from "../../components/features/TransferModal";
import api from "../../services/api";
import { Transaction } from "../../types";
import TransfersSkeleton from "../../components/ui/TransfersSkeleton";
import { formatCurrency, formatTime } from "../../utils/formatters";

const Transfers: React.FC = () => {
  const { accounts, refresh } = useDashboardData();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transfers, setTransfers] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const res = await api.get("/transactions?limit=10&type=TRANSFER");
        setTransfers(res.data.transactions || res.data || []);
      } catch (err) {
        console.error("Failed to load transfers", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransfers();
  }, []);

  const recentRecipients = [
    { name: "Sarah J.", initials: "SJ", color: "bg-secondary" },
    { name: "Marcus L.", initials: "ML", color: "bg-primary" },
    { name: "Elena R.", initials: "ER", color: "bg-tertiary" },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-4">
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        accounts={accounts}
        onSuccess={() => {
          refresh();
          // Refresh transfers
          api
            .get("/transactions?limit=10&type=TRANSFER")
            .then((res) => setTransfers(res.data.transactions || res.data || []))
            .catch(console.error);
        }}
      />

      {/* Header */}
      <section className="space-y-2 sm:space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold font-headline">Transfers</h1>
        <p className="text-on-surface-variant text-sm">
          Send money between your accounts or to other banks
        </p>
      </section>

      {/* Quick Transfer Actions - responsive grid */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4">
        <button
          onClick={() => setIsTransferModalOpen(true)}
          className="flex flex-col items-center justify-center p-4 sm:p-6 bg-surface-container-low rounded-xl gap-2 sm:gap-3 transition-all hover:bg-surface-container-high group active:scale-95"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary flex items-center justify-center text-on-primary transition-transform">
            <span className="material-symbols-outlined text-xl sm:text-2xl filled">swap_horiz</span>
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-xs sm:text-sm">Internal</h3>
            <p className="text-[10px] text-on-surface-variant hidden sm:block">Between accounts</p>
          </div>
        </button>

        <button
          onClick={() => setIsTransferModalOpen(true)}
          className="flex flex-col items-center justify-center p-4 sm:p-6 bg-surface-container-low rounded-xl gap-2 sm:gap-3 transition-all hover:bg-surface-container-high group active:scale-95"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-secondary flex items-center justify-center text-on-secondary transition-transform">
            <span className="material-symbols-outlined text-xl sm:text-2xl filled">send</span>
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-xs sm:text-sm">External</h3>
            <p className="text-[10px] text-on-surface-variant hidden sm:block">To other banks</p>
          </div>
        </button>
      </section>

      {/* Recent Recipients */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-widest text-secondary">
          Recent Recipients
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2">
          {recentRecipients.map((recipient, idx) => (
            <button
              key={idx}
              onClick={() => setIsTransferModalOpen(true)}
              className="flex flex-col items-center gap-2 min-w-[72px] active:scale-95 transition-transform"
            >
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${recipient.color} flex items-center justify-center text-white font-bold text-xs sm:text-sm`}
              >
                {recipient.initials}
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-on-surface truncate w-full text-center">
                {recipient.name}
              </span>
            </button>
          ))}
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex flex-col items-center gap-2 min-w-[72px]"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-surface-container-high flex items-center justify-center border-2 border-dashed border-outline-variant">
              <span className="material-symbols-outlined text-on-surface-variant">add</span>
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-on-surface-variant">New</span>
          </button>
        </div>
      </section>

      {/* Recent Transfers */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold font-headline">Recent Transfers</h2>

        {isLoading ? (
          <TransfersSkeleton />
        ) : transfers.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl p-6 sm:p-8 text-center">
            <span className="material-symbols-outlined text-4xl sm:text-5xl text-on-surface-variant/50 mb-2 sm:mb-3">
              history
            </span>
            <p className="text-on-surface-variant text-sm">No recent transfers</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transfers.slice(0, 5).map((tx) => (
              <div
                key={tx._id}
                className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl hover:bg-surface-container-low transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-lg sm:text-xl">
                      send
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-on-surface">
                      {tx.category === "TRANSFER" && tx.counterpartyName
                        ? tx.type === "DEBIT"
                          ? `Sent to ${tx.counterpartyName}`
                          : `Received from ${tx.counterpartyName}`
                        : tx.merchantName || "Transfer"}
                    </h4>
                    <p className="text-xs text-on-surface-variant">
                      {tx.category === "TRANSFER" && tx.counterpartyAccountNumber
                        ? `Account ${tx.counterpartyAccountNumber}`
                        : tx.category}{" "}
                      • {formatTime(tx.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-on-surface">
                    -{formatCurrency(tx.amount, tx.currency)}
                  </p>
                  <p className="text-[10px] text-on-surface-variant font-medium capitalize">
                    {tx.status.toLowerCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Transfers;

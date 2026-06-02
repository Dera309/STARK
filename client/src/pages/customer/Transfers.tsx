import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useDashboardData } from "../../hooks/useDashboardData";
import TransferModal from "../../components/features/TransferModal";
import { formatCurrencyNoDecimals } from "../../utils/formatters";

const recentRecipients = [
  { name: "Eleanor R.", initials: "ER", color: "bg-gradient-to-br from-stark-gold/30 to-stark-gold-dim/20" },
  { name: "Marcus V.", initials: "MV", color: "bg-gradient-to-br from-white/20 to-surface-bright/20" },
  { name: "Sophia L.", initials: "SL", color: "bg-gradient-to-br from-secondary/20 to-surface-container/20" },
];

const Transfers: React.FC = () => {
  const { user } = useAuth();
  const { accounts, refresh } = useDashboardData();
  const navigate = useNavigate();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [keypadAmount, setKeypadAmount] = useState("");
  const [selectedSourceId, setSelectedSourceId] = useState("");
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const primaryAccount = accounts.find((a) => a.type === "CURRENT") || accounts[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSourceDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (accounts.length > 0 && !selectedSourceId) {
      setSelectedSourceId(accounts[0]._id);
    }
  }, [accounts, selectedSourceId]);

  const handleKeypadInput = (val: string) => {
    let newAmount = keypadAmount;
    if (val === ".") {
      if (!newAmount.includes(".")) {
        newAmount += ".";
      }
    } else if (val === "backspace") {
      newAmount = newAmount.slice(0, -1);
    } else {
      if (!newAmount.includes(".") || (newAmount.split(".")[1] || "").length < 2) {
        newAmount += val;
      }
    }
    setKeypadAmount(newAmount);
  };

  const handleConfirm = () => {
    if (keypadAmount && parseFloat(keypadAmount) > 0 && selectedSourceId) {
      setIsTransferModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background antialiased pb-[120px] pt-[80px]">
      {/* Fixed TopAppBar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-surface/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-container-padding-mobile shadow-[0px_10px_30px_rgba(192,192,192,0.05)]">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant flex items-center justify-center hover:opacity-80 transition-opacity"
        >
          <img
            alt="User profile"
            className="w-full h-full object-cover"
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || 'U')}+${encodeURIComponent(user?.lastName || '')}&background=1a1c1c&color=e5e2e1&size=80`}
          />
        </button>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold tracking-[0.2em] text-primary uppercase">
          STARK
        </h1>
        <button className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:opacity-80 transition-opacity relative">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
            notifications
          </span>
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-container-padding-mobile w-full">
        {/* Page Header */}
        <section className="mt-stack-md space-y-1">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Send Money</h1>
        </section>

        {/* Search Bar */}
        <section className="mt-stack-sm rounded-xl relative overflow-hidden group hover:scale-[1.01] transition-transform duration-700" style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          {/* Card Texture Overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
          }}></div>
          
          {/* Holographic Sheen Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          {/* Decorative Glow */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-tertiary-fixed rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity duration-700"></div>
          
          <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center px-4 py-3 focus-within:border-tertiary-fixed/50 transition-all">
            <span className="material-symbols-outlined text-white/60 mr-3">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts or accounts"
              className="bg-transparent border-none outline-none text-white font-body-lg text-body-lg w-full placeholder:text-white/40 focus:ring-0"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
            />
          </div>
        </section>

        {/* Recent Contacts */}
        <section className="mt-stack-md rounded-xl p-4 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-700" style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          {/* Card Texture Overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
          }}></div>
          
          {/* Holographic Sheen Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          {/* Decorative Glow */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-tertiary-fixed rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity duration-700"></div>
          
          <div className="relative z-10 mb-unit">
            <h2 className="font-label-caps text-label-caps text-white/80 uppercase" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Recent</h2>
          </div>
          <div className="relative z-10 flex gap-gutter overflow-x-auto pb-2 hide-scrollbar">
            {recentRecipients.map((recipient) => (
              <button key={recipient.name} className="flex flex-col items-center gap-2 min-w-[72px] group">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-transparent group-hover:border-tertiary-fixed transition-colors duration-300">
                  <div className={`w-full h-full ${recipient.color} flex items-center justify-center`}>
                    <span className="font-title-md text-title-md text-white font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{recipient.initials}</span>
                  </div>
                </div>
                <span className="font-body-sm text-body-sm text-white/80 group-hover:text-white transition-colors">{recipient.name}</span>
              </button>
            ))}
            <button className="flex flex-col items-center gap-2 min-w-[72px] group">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-tertiary-fixed transition-colors duration-300 flex items-center justify-center bg-white/10">
                <span className="material-symbols-outlined text-white">add</span>
              </div>
              <span className="font-body-sm text-body-sm text-white/60 group-hover:text-white transition-colors">New</span>
            </button>
          </div>
        </section>

        {/* Amount Display */}
        <section className="mt-stack-lg rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden group hover:scale-[1.01] transition-transform duration-700" style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          {/* Card Texture Overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
          }}></div>
          
          {/* Holographic Sheen Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          {/* Decorative Glow */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-tertiary-fixed rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity duration-700"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center">
            <span className="font-body-lg text-body-lg text-white/70 mb-2">Amount (USD)</span>
            <div className="flex items-center justify-center gap-1">
              <span className="font-display-lg text-display-lg text-tertiary-fixed opacity-70">$</span>
              <span className="font-display-lg text-display-lg text-white tracking-tight" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {keypadAmount ? parseFloat(keypadAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
              </span>
            </div>
            <div className="mt-4 bg-white/10 px-4 py-2 rounded-full border border-white/20 flex items-center gap-2 backdrop-blur-sm">
              <span className="material-symbols-outlined text-white/60 text-[16px]">info</span>
              <span className="font-body-sm text-body-sm text-white/80">No transfer fees applied</span>
            </div>
          </div>
        </section>

        {/* Source Account Selector */}
        <section className="mt-stack-lg px-0 rounded-xl relative overflow-hidden group hover:scale-[1.01] transition-transform duration-700" style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          {/* Card Texture Overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
          }}></div>
          
          {/* Holographic Sheen Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          {/* Decorative Glow */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-tertiary-fixed rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity duration-700"></div>
          
          <div className="relative z-10 p-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowSourceDropdown(!showSourceDropdown)}
                className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-4 flex items-center justify-between hover:bg-white/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 rounded bg-gradient-to-br from-gray-800 to-black border border-white/20 flex items-center justify-center relative overflow-hidden">
                    <div className="w-3 h-2 border border-tertiary-fixed/50 rounded-sm absolute left-1 top-1" />
                    <span className="font-label-caps text-[8px] text-white/50 absolute bottom-1 right-1 font-bold">VISA</span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-label-caps text-label-caps text-white/70 uppercase mb-1">From</span>
                    <span className="font-title-md text-title-md text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                      {primaryAccount
                        ? `STARK ${primaryAccount.type.charAt(0) + primaryAccount.type.slice(1).toLowerCase()} •• ${(primaryAccount.accountNumber || '').slice(-4)}`
                        : "Select Account"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-body-sm text-body-sm text-white/70">
                    Balance: {primaryAccount ? formatCurrencyNoDecimals(primaryAccount.balance, primaryAccount.currency) : "—"}
                  </span>
                  <span className="material-symbols-outlined text-white/70">expand_more</span>
                </div>
              </button>
              {showSourceDropdown && accounts.length > 0 && (
                <div className="absolute bottom-full mb-2 left-0 w-full bg-surface border border-white/20 rounded-xl shadow-xl overflow-hidden z-20 backdrop-blur-xl">
                  {accounts.map((acc) => (
                    <button
                      key={acc._id}
                      onClick={() => { setSelectedSourceId(acc._id); setShowSourceDropdown(false); }}
                      className="w-full px-4 py-3 flex justify-between items-center hover:bg-white/10 transition-colors border-b border-white/10 last:border-0"
                    >
                      <span className="font-body-sm text-body-sm text-white">
                        {acc.type} •• {acc.accountNumber.slice(-4)}
                      </span>
                      <span className="font-body-sm text-body-sm text-white/70">
                        {formatCurrencyNoDecimals(acc.balance, acc.currency)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Numeric Keypad */}
        <section className="mt-stack-md flex-grow flex flex-col justify-end px-0 rounded-xl p-4 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          {/* Card Texture Overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
          }}></div>
          
          {/* Holographic Sheen Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700"></div>
          
          {/* Decorative Glow */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-tertiary-fixed rounded-full blur-[100px] opacity-10 hover:opacity-20 transition-opacity duration-700"></div>
          
          <div className="relative z-10 grid grid-cols-3 gap-unit mb-stack-md">
            {[
              ["1", "2", "3"],
              ["4", "5", "6"],
              ["7", "8", "9"],
              [".", "0", "backspace"],
            ].map((row, rowIdx) =>
              row.map((key, colIdx) => {
                const isBackspace = key === "backspace";
                const isDot = key === ".";
                return (
                  <button
                    key={`${rowIdx}-${colIdx}`}
                    onClick={() => handleKeypadInput(key)}
                    className={`h-14 rounded-lg font-title-md text-title-md transition-all duration-200 active:scale-95 ${
                      isBackspace
                        ? "bg-transparent flex items-center justify-center text-white hover:bg-white/10"
                        : isDot
                        ? "bg-transparent flex items-center justify-center text-white hover:bg-white/10"
                        : "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
                    }`}
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    {isBackspace ? (
                      <span className="material-symbols-outlined text-xl">backspace</span>
                    ) : (
                      key
                    )}
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Confirm Button */}
        <section className="mt-stack-md px-0">
          <button
            onClick={handleConfirm}
            disabled={!keypadAmount || parseFloat(keypadAmount) <= 0}
            className="w-full bg-tertiary-fixed text-on-tertiary-fixed font-label-caps text-label-caps uppercase py-5 rounded-lg shadow-[0px_10px_30px_rgba(255,224,136,0.15)] hover:shadow-[0px_15px_40px_rgba(255,224,136,0.25)] hover:bg-tertiary-fixed-dim transition-all ease-[cubic-bezier(0.2,0.8,0.2,1)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Confirm Transfer</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </section>
      </main>

      {/* Bottom NavBar — TRANSFER active */}
      <nav className="fixed bottom-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-2xl rounded-t-lg border-t border-white/5 shadow-[0px_-10px_40px_rgba(0,0,0,0.5)] transition-all ease-[cubic-bezier(0.2,0.8,0.2,1)] flex justify-around items-center h-24 pb-safe px-4 md:hidden">
        {[
          { path: "/dashboard", icon: "grid_view", label: "Dashboard" },
          { path: "/transfers", icon: "swap_horiz", label: "Transfer", active: true },
          { path: "/transactions", icon: "history", label: "History" },
          { path: "/wealth", icon: "account_balance_wallet", label: "Wealth" },
          { path: "/investments", icon: "trending_up", label: "Invest" },
          { path: "/settings", icon: "person", label: "Profile" },
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center gap-1 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
              item.active
                ? "text-primary scale-110"
                : "text-on-surface-variant/40 hover:text-primary/80"
            }`}
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform duration-300" style={{ fontVariationSettings: item.active ? "'FILL' 1" : "'FILL' 0" }}>
              {item.icon}
            </span>
            <span className="font-label-caps text-label-caps uppercase">{item.label}</span>
          </button>
        ))}
      </nav>

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => { setIsTransferModalOpen(false); setKeypadAmount(""); }}
        accounts={accounts}
        onSuccess={() => { refresh(); }}
      />
    </div>
  );
};

export default Transfers;

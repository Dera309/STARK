import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '../../hooks/useDashboardData';
import TransferModal from '../../components/features/TransferModal';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import DashboardSkeleton from '../../components/ui/DashboardSkeleton';
import { formatCurrency } from '../../utils/formatters';

const Dashboard: React.FC = () => {
  const { user, accounts, transactions, isLoading, error, refresh } = useDashboardData();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const { preferences, toggleBalanceVisibility } = useUserPreferences();
  const navigate = useNavigate();

  // Calculate total wealth across all accounts
  const totalWealth = accounts.length > 0 
    ? accounts.reduce((sum, account) => sum + account.balance, 0)
    : 0;
  const primaryCurrency = accounts[0]?.currency || "USD";

  // Calculate weekly growth (mock data for now)
  const weeklyGrowth = totalWealth * 0.024; // 2.4% growth

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <p className="text-error font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-4">
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        accounts={accounts}
        onSuccess={() => refresh()}
      />

      {/* Hero Balance Section */}
      <section className="flex flex-col gap-4 mt-4">
        <div className="rounded-xl p-6 md:p-10 flex flex-col gap-6 md:items-center relative overflow-hidden group hover:scale-[1.01] transition-transform duration-700" style={{
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
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-5 group-hover:opacity-10 transition-opacity duration-700"></div>
          
          <div className="relative z-10 flex flex-col gap-2 md:items-center">
            <span className="font-label-caps text-label-caps text-white/80 uppercase tracking-widest" style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}>
              Total Wealth Portfolio
            </span>
            <div className="flex items-center gap-3">
              <h2 className="font-display-lg text-display-lg text-white tracking-tight" style={{
                textShadow: '0 4px 8px rgba(0,0,0,0.5)'
              }}>
                {preferences.hideBalance ? "••••••" : `$${(totalWealth / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </h2>
              <button
                onClick={toggleBalanceVisibility}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-300"
                aria-label={preferences.hideBalance ? "Show balance" : "Hide balance"}
              >
                <span className="material-symbols-outlined text-white text-lg">
                  {preferences.hideBalance ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 w-max md:mx-auto backdrop-blur-sm">
            <span className="material-symbols-outlined text-tertiary-fixed text-sm" style={{ fontVariationSettings: 'FILL 1' }}>
              trending_up
            </span>
            <span className="font-body-sm text-body-sm text-white font-medium" style={{
              textShadow: '0 1px 2px rgba(0,0,0,0.5)'
            }}>
              +2.4% ({formatCurrency(weeklyGrowth, primaryCurrency, preferences.hideBalance)}) This Week
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4 md:flex md:justify-center md:gap-8">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex flex-col items-center gap-3 group focus:outline-none"
          >
            <div className="w-14 h-14 rounded-full glass-panel flex items-center justify-center text-primary group-hover:bg-surface-container-high group-hover:border-outline-variant transition-all duration-500 shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
              <span className="material-symbols-outlined">send</span>
            </div>
            <span className="font-label-caps text-label-caps text-on-surface-variant group-hover:text-primary transition-colors">
              Send
            </span>
          </button>

          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex flex-col items-center gap-3 group focus:outline-none"
          >
            <div className="w-14 h-14 rounded-full glass-panel flex items-center justify-center text-primary group-hover:bg-surface-container-high group-hover:border-outline-variant transition-all duration-500 shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
              <span className="material-symbols-outlined">download</span>
            </div>
            <span className="font-label-caps text-label-caps text-on-surface-variant group-hover:text-primary transition-colors">
              Request
            </span>
          </button>

          <button
            onClick={() => navigate("/cards")}
            className="flex flex-col items-center gap-3 group focus:outline-none"
          >
            <div className="w-14 h-14 rounded-full glass-panel flex items-center justify-center text-primary group-hover:bg-surface-container-high group-hover:border-outline-variant transition-all duration-500 shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
              <span className="material-symbols-outlined">credit_card</span>
            </div>
            <span className="font-label-caps text-label-caps text-on-surface-variant group-hover:text-primary transition-colors">
              Cards
            </span>
          </button>

          <button
            onClick={() => navigate("/transactions")}
            className="flex flex-col items-center gap-3 group focus:outline-none"
          >
            <div className="w-14 h-14 rounded-full glass-panel flex items-center justify-center text-primary group-hover:bg-surface-container-high group-hover:border-outline-variant transition-all duration-500 shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
              <span className="material-symbols-outlined">history</span>
            </div>
            <span className="font-label-caps text-label-caps text-on-surface-variant group-hover:text-primary transition-colors">
              History
            </span>
          </button>
        </div>
      </section>

      {/* Two Column Layout for Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Virtual Card & Analytics */}
        <div className="md:col-span-7 flex flex-col gap-8">
          {/* Virtual Card Section */}
          <section className="flex flex-col gap-3">
            <h3 className="font-title-md text-title-md text-primary px-2">Primary Card</h3>
            <div className="rounded-xl aspect-[1.586/1] relative overflow-hidden group hover:scale-[1.02] transition-transform duration-700 cursor-pointer" style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
              {/* Card Texture Overlay */}
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
              }}></div>
              
              {/* Holographic Sheen Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              {/* Magnetic Strip */}
              <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 opacity-80"></div>
              <div className="absolute top-12 left-0 right-0 h-1 bg-black/40"></div>
              
              {/* Card Content */}
              <div className="relative z-10 h-full p-6 flex flex-col justify-between">
                {/* Top Row: Bank Logo & Contactless */}
                <div className="flex justify-between items-start pt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-tertiary-fixed to-amber-600 flex items-center justify-center shadow-lg" style={{
                      boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)'
                    }}>
                      <span className="text-on-primary font-bold text-xl tracking-wider">S</span>
                    </div>
                    <div>
                      <span className="font-headline-lg-mobile text-headline-lg-mobile font-bold tracking-[0.2em] text-white uppercase" style={{
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                      }}>
                        STARK
                      </span>
                      <div className="text-[10px] text-tertiary-fixed tracking-widest font-semibold">PREMIUM BANK</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-white/80 text-3xl" style={{ fontVariationSettings: 'FILL 0' }}>
                      nfc
                    </span>
                  </div>
                </div>
                
                {/* EMV Chip */}
                <div className="flex items-center gap-6">
                  <div className="w-14 h-11 rounded-lg border-2 border-yellow-500/40 flex items-center justify-center relative overflow-hidden" style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 50%, #d4af37 100%)',
                    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.3)'
                  }}>
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-px p-1.5">
                      <div className="bg-yellow-600/30 rounded-sm"></div>
                      <div className="bg-yellow-600/40 rounded-sm"></div>
                      <div className="bg-yellow-600/40 rounded-sm"></div>
                      <div className="bg-yellow-600/30 rounded-sm"></div>
                    </div>
                    <div className="absolute inset-2 border border-yellow-400/50 rounded"></div>
                    <div className="absolute inset-3 border border-yellow-300/30 rounded"></div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-white/70 tracking-widest mb-1">DEBIT</div>
                    <div className="text-sm text-white font-semibold tracking-wider" style={{
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                    }}>WORLD ELITE</div>
                  </div>
                </div>
                
                {/* Card Number */}
                <div className="text-center">
                  <div className="font-title-md text-title-md text-white tracking-[0.3em] font-mono text-xl" style={{
                    textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                  }}>
                    {accounts[0]?.accountNumber ? 
                      accounts[0].accountNumber.replace(/(\d{4})/g, '$1 ').trim() : 
                      '4532 •••• •••• 4928'
                    }
                  </div>
                </div>
                
                {/* Bottom Row: Cardholder & Expiry */}
                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-1">
                    <span className="font-label-caps text-label-caps text-white/90 tracking-widest text-[11px]" style={{
                      textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                    }}>
                      {user?.firstName} {user?.lastName}
                    </span>
                    <div className="flex gap-6">
                      <div>
                        <div className="text-[8px] text-white/60 tracking-wider">VALID THRU</div>
                        <div className="text-sm text-white font-mono tracking-wider" style={{
                          textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                        }}>12/28</div>
                      </div>
                      <div>
                        <div className="text-[8px] text-white/60 tracking-wider">CVV</div>
                        <div className="text-sm text-white font-mono tracking-wider" style={{
                          textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                        }}>•••</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Visa Logo */}
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <div className="text-white font-bold text-2xl tracking-tighter" style={{
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                      }}>VISA</div>
                    </div>
                    <div className="text-[9px] text-tertiary-fixed tracking-wider font-semibold">PLATINUM</div>
                  </div>
                </div>
              </div>
              
              {/* Signature Strip (subtle) */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/5 to-transparent"></div>
              <div className="absolute bottom-1 left-6 right-20 h-5 bg-white/10 rounded-sm"></div>
            </div>
          </section>

          {/* Spending Analytics */}
          <section className="rounded-xl p-6 flex flex-col gap-6 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-700" style={{
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
            
            <div className="relative z-10 flex justify-between items-center">
              <h3 className="font-title-md text-title-md text-white" style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
              }}>Wealth Growth</h3>
              <button className="font-label-caps text-label-caps text-white/80 hover:text-white transition-colors flex items-center gap-1" style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}>
                This Month <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>
            </div>
            
            {/* Chart Placeholder Container */}
            <div className="relative z-10 h-48 w-full relative flex items-end">
              {/* Abstract Chart Lines using CSS gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent rounded-lg"></div>
              {/* Smooth Curve SVG Simulation */}
              <svg className="w-full h-full absolute inset-0 drop-shadow-[0_0_10px_rgba(233,195,73,0.3)]" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgba(233,195,73,0.2)"></stop>
                    <stop offset="100%" stopColor="rgba(233,195,73,0)"></stop>
                  </linearGradient>
                </defs>
                <path d="M0 100 L0 60 Q 20 40, 40 50 T 70 30 T 100 10 L100 100 Z" fill="url(#chartGradient)"></path>
                <path className="opacity-80" d="M0 60 Q 20 40, 40 50 T 70 30 T 100 10" fill="none" stroke="#e9c349" strokeWidth="2"></path>
              </svg>
              {/* Data Points */}
              <div className="absolute top-[30%] left-[40%] w-3 h-3 bg-background border-2 border-tertiary-fixed rounded-full shadow-[0_0_10px_rgba(233,195,73,0.8)] z-10"></div>
              <div className="absolute top-[10%] right-[0%] w-3 h-3 bg-background border-2 border-tertiary-fixed rounded-full shadow-[0_0_10px_rgba(233,195,73,0.8)] z-10"></div>
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none opacity-20">
                <div className="w-full border-t border-white/20 border-dashed"></div>
                <div className="w-full border-t border-white/20 border-dashed"></div>
                <div className="w-full border-t border-white/20 border-dashed"></div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Recent Transactions */}
        <div className="md:col-span-5 flex flex-col gap-3">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-title-md text-title-md text-primary">Recent Activity</h3>
            <button
              className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest"
              onClick={() => navigate("/transactions")}
            >
              View All
            </button>
          </div>
          <div className="glass-panel rounded-xl flex flex-col overflow-hidden">
            {transactions.slice(0, 4).map((transaction, index) => (
              <div
                key={transaction._id || index}
                className={`flex items-center justify-between p-4 ${index < transactions.slice(0, 4).length - 1 ? 'border-b border-white/5' : ''} hover:bg-surface-container-low transition-colors duration-300 cursor-pointer`}
                onClick={() => navigate("/transactions")}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${
                    transaction.type === 'CREDIT' 
                      ? 'bg-tertiary-fixed/5 text-tertiary-fixed border-tertiary-fixed/30' 
                      : 'bg-surface-container text-on-surface-variant border-outline-variant/30'
                  }`}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: 'FILL 0' }}>
                      {transaction.type === 'CREDIT' ? 'call_received' : 'payments'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body-lg text-body-lg text-primary font-medium">
                      {transaction.description || transaction.type}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {new Date(transaction.createdAt).toLocaleDateString()} • {new Date(transaction.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <span className={`font-body-lg text-body-lg font-medium ${
                  transaction.type === 'CREDIT' ? 'text-tertiary-fixed' : 'text-primary'
                }`}>
                  {transaction.type === 'CREDIT' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency, preferences.hideBalance)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { useTheme } from '../../contexts/ThemeContext';
import RecentTransactions from '../../components/features/RecentTransactions';
import TransferModal from '../../components/features/TransferModal';
import DashboardSkeleton from '../../components/ui/DashboardSkeleton';
import { formatCurrency } from '../../utils/formatters';

const PremiumDashboard: React.FC = () => {
  const { user, accounts, transactions, isLoading, error, refresh } = useDashboardData();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const { preferences, toggleBalanceVisibility } = useUserPreferences();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Calculate total wealth portfolio
  const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
  const primaryCurrency = accounts[0]?.currency || 'USD';

  // Savings goal calculation
  const savingsAccount = accounts.find((a) => a.type === "SAVINGS");
  const savingsBalance = savingsAccount?.balance ?? 0;
  const savingsCurrency = savingsAccount?.currency ?? "USD";
  const savingsTarget = (user as { savingsGoalTarget?: number })?.savingsGoalTarget ?? 0;
  const savingsProgress = savingsTarget > 0 ? Math.min(Math.round((savingsBalance / savingsTarget) * 100), 100) : 0;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <div className="glass-panel rounded-xl p-8">
          <span className="material-symbols-outlined text-4xl text-error mb-4 block">error</span>
          <p className="text-error font-medium">{error}</p>
          <button 
            onClick={refresh}
            className="btn-stark-ghost mt-4"
          >
            Try Again
          </button>
        </div>
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

      {/* Hero Wealth Portfolio Section */}
      <section className="flex flex-col gap-stack-md mt-4">
        <div className="rounded-xl p-8 md:p-10 flex flex-col gap-6 md:items-center relative overflow-hidden group hover:scale-[1.01] transition-transform duration-700" style={{
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
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-stark-gold rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity duration-700"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-5 group-hover:opacity-10 transition-opacity duration-700"></div>
          
          <div className="relative z-10 flex flex-col gap-2 md:items-center">
            <span className="uppercase tracking-widest text-white/80" style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}>
              Total Wealth Portfolio
            </span>
            <div className="flex items-center gap-3">
              <h2 className={`
                tracking-tight tabular-nums text-white
                ${theme === 'dark'
                  ? 'font-display-lg text-display-lg'
                  : 'font-light-display text-light-display-lg-mobile md:text-light-display-lg'
                }
              `} style={{
                textShadow: '0 4px 8px rgba(0,0,0,0.5)'
              }}>
                {formatCurrency(totalBalance, primaryCurrency, preferences.hideBalance)}
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
          
          {/* Growth Indicator */}
          <div className="relative z-10 flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 w-max md:mx-auto backdrop-blur-sm">
            <span className="material-symbols-outlined text-stark-gold text-sm animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
            <span className={`
              text-white font-medium
              ${theme === 'dark' ? 'font-body-sm text-body-sm' : 'font-light-body text-light-label-lg'}
            `} style={{
              textShadow: '0 1px 2px rgba(0,0,0,0.5)'
            }}>
              +2.4% ($3,420.00) This Week
            </span>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-4 gap-4 md:flex md:justify-center md:gap-8">
          {[
            { icon: 'send', label: 'Send', action: () => setIsTransferModalOpen(true) },
            { icon: 'download', label: 'Request', action: () => navigate('/transactions') },
            { icon: 'credit_card', label: 'Cards', action: () => navigate('/cards') },
            { icon: 'history', label: 'History', action: () => navigate('/transactions') }
          ].map((item, index) => (
            <button
              key={item.label}
              onClick={item.action}
              className="flex flex-col items-center gap-3 group focus:outline-none animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-full glass-panel flex items-center justify-center text-primary group-hover:bg-surface-container-high group-hover:border-outline-variant transition-all duration-500 shadow-silver-glow group-hover:shadow-gold-glow group-hover:scale-110">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>{item.icon}</span>
              </div>
              <span className={`
                group-hover:text-primary transition-colors
                ${theme === 'dark'
                  ? 'font-label-caps text-label-caps text-on-surface-variant'
                  : 'font-light-body text-light-label-md text-on-surface-variant'
                }
              `}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-stack-lg items-start">
        
        {/* Left Column: Virtual Card & Analytics */}
        <div className="md:col-span-7 flex flex-col gap-stack-lg">
          
          {/* Premium Virtual Card */}
          <section className="flex flex-col gap-stack-sm">
            <h3 className={`
              px-2
              ${theme === 'dark'
                ? 'font-title-md text-title-md text-primary'
                : 'font-light-display text-light-headline-md text-primary'
              }
            `}>
              Primary Card
            </h3>
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
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-stark-gold to-amber-600 flex items-center justify-center shadow-lg" style={{
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
                      <div className="text-[10px] text-stark-gold tracking-widest font-semibold">PREMIUM BANK</div>
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
                    <div className="text-[9px] text-stark-gold tracking-wider font-semibold">PLATINUM</div>
                  </div>
                </div>
              </div>
              
              {/* Signature Strip (subtle) */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/5 to-transparent"></div>
              <div className="absolute bottom-1 left-6 right-20 h-5 bg-white/10 rounded-sm"></div>
            </div>
          </section>

          {/* Wealth Analytics */}
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
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-stark-gold rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity duration-700"></div>
            
            <div className="relative z-10 flex justify-between items-center">
              <h3 className={`
                text-white
                ${theme === 'dark'
                  ? 'font-title-md text-title-md'
                  : 'font-light-display text-light-headline-md'
                }
              `} style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
              }}>
                Wealth Growth
              </h3>
              <button className={`
                text-white/80 hover:text-white transition-colors flex items-center gap-1
                ${theme === 'dark'
                  ? 'font-label-caps text-label-caps'
                  : 'font-light-body text-light-label-lg'
                }
              `} style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}>
                This Month <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>
            </div>
            
            {/* Chart Container */}
            <div className="relative z-10 h-48 w-full relative flex items-end">
              <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent rounded-lg"></div>
              
              {/* SVG Chart */}
              <svg className="w-full h-full absolute inset-0 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgba(212,175,55,0.2)"></stop>
                    <stop offset="100%" stopColor="rgba(212,175,55,0)"></stop>
                  </linearGradient>
                </defs>
                <path d="M0 100 L0 60 Q 20 40, 40 50 T 70 30 T 100 10 L100 100 Z" fill="url(#chartGradient)"></path>
                <path className="opacity-80" d="M0 60 Q 20 40, 40 50 T 70 30 T 100 10" fill="none" stroke="#d4af37" strokeWidth="2"></path>
              </svg>
              
              {/* Data Points */}
              <div className="absolute top-[30%] left-[40%] w-3 h-3 bg-background border-2 border-stark-gold rounded-full shadow-gold-glow z-10 animate-pulse"></div>
              <div className="absolute top-[10%] right-[0%] w-3 h-3 bg-background border-2 border-stark-gold rounded-full shadow-gold-glow z-10 animate-pulse"></div>
            </div>
          </section>
        </div>

        {/* Right Column: Recent Transactions */}
        <div className="md:col-span-5 flex flex-col gap-stack-sm">
          <div className="flex justify-between items-center px-2">
            <h3 className={`
              ${theme === 'dark'
                ? 'font-title-md text-title-md text-primary'
                : 'font-light-display text-light-headline-md text-primary'
              }
            `}>
              Recent Activity
            </h3>
            <button 
              onClick={() => navigate('/transactions')}
              className={`
                hover:text-primary transition-colors uppercase tracking-widest
                ${theme === 'dark'
                  ? 'font-label-caps text-label-caps text-on-surface-variant'
                  : 'font-light-body text-light-label-lg text-on-surface-variant'
                }
              `}
            >
              View All
            </button>
          </div>
          
          <div className="glass-panel rounded-xl flex flex-col overflow-hidden">
            {transactions.slice(0, 4).map((transaction, index) => (
              <div 
                key={transaction._id} 
                className="flex items-center justify-between p-4 border-b border-white/5 last:border-b-0 hover:bg-surface-container-low transition-colors duration-300 cursor-pointer group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant border border-outline-variant/30 group-hover:border-stark-gold/30 transition-colors">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                      {transaction.category === 'DINING' ? 'restaurant' : 
                       transaction.category === 'TRAVEL' ? 'flight_takeoff' :
                       transaction.category === 'SHOPPING' ? 'shopping_bag' :
                       transaction.type === 'CREDIT' ? 'call_received' : 'payments'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`
                      font-medium
                      ${theme === 'dark'
                        ? 'font-body-lg text-body-lg text-primary'
                        : 'font-light-body text-light-body-lg text-primary'
                      }
                    `}>
                      {transaction.merchantName || 'Transaction'}
                    </span>
                    <span className={`
                      ${theme === 'dark'
                        ? 'font-body-sm text-body-sm text-on-surface-variant'
                        : 'font-light-body text-light-label-md text-on-surface-variant'
                      }
                    `}>
                      {transaction.category} • {new Date(transaction.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span className={`
                  font-medium tabular-nums
                  ${transaction.type === 'CREDIT' ? 'text-stark-gold' : 'text-primary'}
                  ${theme === 'dark'
                    ? 'font-body-lg text-body-lg'
                    : 'font-light-body text-light-body-lg'
                  }
                `}>
                  {transaction.type === 'CREDIT' ? '+' : '-'}
                  {formatCurrency(Math.abs(transaction.amount), transaction.currency, preferences.hideBalance)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Savings Goal (if exists) */}
      {savingsTarget > 0 && (
        <section className="glass-panel rounded-xl p-6 space-y-4 animate-slide-up">
          <div className="flex justify-between items-center">
            <h3 className={`
              ${theme === 'dark'
                ? 'font-title-md text-title-md text-primary'
                : 'font-light-display text-light-headline-md text-primary'
              }
            `}>
              Savings Goal
            </h3>
            <span className="elite-badge">{savingsProgress}%</span>
          </div>
          <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-stark-gold to-stark-gold-light transition-all duration-1000 rounded-full"
              style={{ width: `${savingsProgress}%` }}
            />
          </div>
          <p className={`
            ${theme === 'dark'
              ? 'font-body-sm text-body-sm text-on-surface-variant'
              : 'font-light-body text-light-label-md text-on-surface-variant'
            }
          `}>
            {formatCurrency(savingsBalance, savingsCurrency, preferences.hideBalance)} of{" "}
            {formatCurrency(savingsTarget, savingsCurrency, preferences.hideBalance)} target reached.
          </p>
        </section>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-20 md:bottom-8 right-6 z-40">
        <button
          onClick={() => setIsTransferModalOpen(true)}
          className="w-16 h-16 bg-gradient-to-br from-stark-gold to-stark-gold-dim text-on-tertiary-fixed rounded-2xl shadow-gold-glow flex items-center justify-center group hover:shadow-gold-glow-lg active:scale-90 transition-all duration-300 animate-float"
        >
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_scanner</span>
        </button>
      </div>
    </div>
  );
};

export default PremiumDashboard;
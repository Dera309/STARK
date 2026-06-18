import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { useTheme } from '../../contexts/ThemeContext';
import DashboardSkeleton from '../../components/ui/DashboardSkeleton';
import { formatCurrency } from '../../utils/formatters';

const Cards: React.FC = () => {
  const { user, accounts, isLoading, error } = useDashboardData();
  const { preferences } = useUserPreferences();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(0);

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

  const cards = accounts.map((account, index) => ({
    id: index,
    number: account.accountNumber || '4532 •••• •••• 4928',
    holder: `${user?.firstName} ${user?.lastName}`,
    expiry: '12/28',
    cvv: '•••',
    balance: account.balance,
    currency: account.currency,
    type: account.type,
    isPrimary: index === 0
  }));

  return (
    <div className="space-y-8 pb-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className={`
          ${theme === 'dark'
            ? 'font-display-lg text-display-lg text-primary'
            : 'font-light-display text-light-display-lg text-primary'
          }
        `}>
          My Cards
        </h1>
        <button className="btn-stark-ghost flex items-center gap-2">
          <span className="material-symbols-outlined">add</span>
          Add Card
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`rounded-xl aspect-[1.586/1] relative overflow-hidden group hover:scale-[1.02] transition-transform duration-700 cursor-pointer ${
              selectedCard === index ? 'ring-2 ring-stark-gold' : ''
            }`}
            onClick={() => setSelectedCard(index)}
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
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
                  {card.isPrimary && (
                    <span className="text-[9px] bg-stark-gold/20 text-stark-gold px-2 py-1 rounded-full tracking-wider font-semibold">
                      PRIMARY
                    </span>
                  )}
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
                  <div className="text-[10px] text-white/70 tracking-widest mb-1">{card.type}</div>
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
                  {card.number.replace(/(\d{4})/g, '$1 ').trim()}
                </div>
              </div>
              
              {/* Bottom Row: Cardholder & Expiry */}
              <div className="flex justify-between items-end">
                <div className="flex flex-col gap-1">
                  <span className="font-label-caps text-label-caps text-white/90 tracking-widest text-[11px]" style={{
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                  }}>
                    {card.holder}
                  </span>
                  <div className="flex gap-6">
                    <div>
                      <div className="text-[8px] text-white/60 tracking-wider">VALID THRU</div>
                      <div className="text-sm text-white font-mono tracking-wider" style={{
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                      }}>{card.expiry}</div>
                    </div>
                    <div>
                      <div className="text-[8px] text-white/60 tracking-wider">CVV</div>
                      <div className="text-sm text-white font-mono tracking-wider" style={{
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                      }}>{card.cvv}</div>
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
        ))}
      </div>

      {/* Card Details */}
      {cards[selectedCard] && (
        <section className="glass-panel rounded-xl p-6">
          <h3 className={`
            mb-6
            ${theme === 'dark'
              ? 'font-title-md text-title-md text-primary'
              : 'font-light-display text-light-headline-md text-primary'
            }
          `}>
            Card Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <span className={`
                text-sm
                ${theme === 'dark'
                  ? 'text-on-surface-variant'
                  : 'text-on-surface-variant'
                }
              `}>
                Available Balance
              </span>
              <span className={`
                font-mono text-xl
                ${theme === 'dark'
                  ? 'text-primary'
                  : 'text-primary'
                }
              `}>
                {formatCurrency(cards[selectedCard].balance, cards[selectedCard].currency, preferences.hideBalance)}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className={`
                text-sm
                ${theme === 'dark'
                  ? 'text-on-surface-variant'
                  : 'text-on-surface-variant'
                }
              `}>
                Card Type
              </span>
              <span className={`
                font-mono text-xl
                ${theme === 'dark'
                  ? 'text-primary'
                  : 'text-primary'
                }
              `}>
                {cards[selectedCard].type}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className={`
                text-sm
                ${theme === 'dark'
                  ? 'text-on-surface-variant'
                  : 'text-on-surface-variant'
                }
              `}>
                Status
              </span>
              <span className="font-mono text-xl text-stark-gold">
                Active
              </span>
            </div>
          </div>
          
          {/* Card Actions */}
          <div className="flex gap-4 mt-6">
            <button 
              className="btn-stark-ghost flex items-center gap-2"
              onClick={() => {
                const account = accounts[selectedCard];
                if (account) {
                  alert(`Freeze functionality for account ${account.accountNumber} is not yet implemented for customers. Please contact support.`);
                }
              }}
            >
              <span className="material-symbols-outlined">lock</span>
              Freeze Card
            </button>
            <button className="btn-stark-ghost flex items-center gap-2">
              <span className="material-symbols-outlined">settings</span>
              Card Settings
            </button>
            <button className="btn-stark-ghost flex items-center gap-2 text-error">
              <span className="material-symbols-outlined">delete</span>
              Remove Card
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Cards;

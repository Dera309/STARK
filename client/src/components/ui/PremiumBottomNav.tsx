import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

interface NavItem {
  path: string;
  icon: string;
  label: string;
  filledIcon?: string;
}

const navItems: NavItem[] = [
  { path: '/dashboard', icon: 'grid_view', filledIcon: 'grid_view', label: 'Dashboard' },
  { path: '/transfers', icon: 'swap_horiz', filledIcon: 'swap_horiz', label: 'Transfer' },
  { path: '/transactions', icon: 'history', filledIcon: 'history', label: 'History' },
  { path: '/wealth', icon: 'account_balance_wallet', filledIcon: 'account_balance_wallet', label: 'Wealth' },
  { path: '/investments', icon: 'trending_up', filledIcon: 'trending_up', label: 'Invest' },
  { path: '/settings', icon: 'person', filledIcon: 'person', label: 'Profile' },
];

const PremiumBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const isActive = (path: string) => {
    return location.pathname === path || 
           (path === '/dashboard' && location.pathname === '/');
  };

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 pb-safe">
      {/* Glass Background */}
      <div className="glass-panel backdrop-blur-2xl rounded-t-lg border-t-0 shadow-[0px_-10px_40px_rgba(0,0,0,0.5)] transition-all duration-500">
        <div className="flex justify-around items-center h-24 px-4 w-full">
          {navItems.map((item, index) => {
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  flex flex-col items-center justify-center gap-1 transition-all duration-500 ease-premium
                  focus:outline-none relative group
                  ${active 
                    ? 'text-primary scale-110 transform' 
                    : 'text-on-surface-variant/40 hover:text-primary/80 hover:scale-105'
                  }
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Icon */}
                <span 
                  className={`
                    material-symbols-outlined transition-all duration-300
                    ${active ? 'animate-pulse' : 'group-hover:animate-bounce'}
                  `}
                  style={{ 
                    fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0"
                  }}
                >
                  {item.icon}
                </span>
                
                {/* Label */}
                <span className={`
                  uppercase transition-all duration-300 text-[10px] font-normal
                  ${active ? 'font-bold' : 'hover:font-bold'}
                `}>
                  {item.label}
                </span>
                
                {/* Ripple Effect */}
                <div className="absolute inset-0 rounded-full opacity-0 group-active:opacity-20 group-active:animate-ping bg-stark-gold transition-opacity" />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default PremiumBottomNav;

import React, { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import NotificationCenter from "../features/NotificationCenter";
import TawkToChat from "../features/TawkToChat";
import ThemeToggle from "../ui/ThemeToggle";
import PremiumBottomNav from "../ui/PremiumBottomNav";
import socketService from "../../services/socket";

const navItems = [
  { to: "/dashboard", icon: "grid_view", label: "Dashboard" },
  { to: "/transfers", icon: "swap_horiz", label: "Transfer" },
  { to: "/transactions", icon: "history", label: "History" },
  { to: "/wealth", icon: "account_balance_wallet", label: "Wealth" },
  { to: "/investments", icon: "trending_up", label: "Invest" },
];

const CustomerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('CustomerLayout mounted, theme:', theme);
    console.log('Window width:', window.innerWidth);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) socketService.connect(user._id);
    return () => { socketService.disconnect(); };
  }, [user]);

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  return (
    <div className="min-h-screen bg-background text-on-background transition-colors duration-300">
      {/* Desktop Top Nav */}
      <header className="hidden xl:flex fixed top-0 left-0 right-0 z-50 h-20 items-center justify-between px-10 glass-panel backdrop-blur-xl border-b-0 shadow-glass transition-all duration-500">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant hover:opacity-80 transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-tertiary-fixed">
              <img
                alt="User Profile"
                className="w-full h-full object-cover"
                src="https://ui-avatars.com/api/?name=STARK&background=d4af37&color=000"
              />
            </div>
            <span className={`
              tracking-[0.2em] uppercase font-bold transition-colors duration-300
              ${theme === 'dark'
                ? 'font-label-caps text-label-caps text-primary'
                : 'font-light-body text-light-label-lg text-primary'
              }
            `}>
              STARK
            </span>
          </button>

          <nav className="flex items-center gap-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-1 py-1 uppercase tracking-widest transition-all duration-300 text-[10px] font-normal ${
                    isActive
                      ? "text-primary border-b-2 border-stark-gold font-bold"
                      : "text-on-surface-variant hover:text-primary hover:font-bold"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <TawkToChat />
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {user?.role === "ADMIN" && (
            <button
              onClick={() => navigate("/admin")}
              className="elite-badge hover:bg-stark-gold/10 transition-all duration-300"
            >
              Admin
            </button>
          )}
          <NotificationCenter />
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-10 h-10 rounded-full glass-card border border-outline-variant/30 overflow-hidden hover:border-outline hover:shadow-glass transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-stark-gold/30"
            >
              <img
                alt="User Profile"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuADYglUMRdg1ayEM7LOA-iM21MY1blqfgG0RTV8UoeYuoBNZwB1Jix0mjMtlCAJIqT0cWCOZDPubwsDWV8OZYB0NCXJpybfzNJd_W9gjAygRWh8e5deDTdn-X8qJLIx4tIkCx6a5BVXucCY0FIl5kbgtA-QwjPMn9i6_SRaaULPLNcz3lYzVwuMLEM_DqvRwdVp2l-ZcFE2ti384kmdwxKfMY6NmhIBIr82xYDtrXz94gqTWipmJIZuODIAhndUXtYkTlkQ2sTn9Os"
              />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-52 glass-card rounded-lg border border-outline-variant/30 shadow-ambient-lg py-2 z-50 animate-scale-in">
                <div className="px-4 py-3 border-b border-outline-variant/20">
                  <p className={`
                    font-semibold
                    ${theme === 'dark'
                      ? 'font-body-sm text-body-sm text-primary'
                      : 'font-light-body text-light-body-md text-primary'
                    }
                  `}>
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className={`
                    mt-0.5
                    ${theme === 'dark'
                      ? 'font-label-caps text-label-caps text-on-surface-variant'
                      : 'font-light-body text-light-label-md text-on-surface-variant'
                    }
                  `}>
                    {user?.email}
                  </p>
                </div>
                <div className="px-4 py-2">
                  <ThemeToggle />
                </div>
                <button
                  onClick={() => { navigate("/settings"); setShowUserMenu(false); }}
                  className={`
                    w-full text-left px-4 py-2.5 text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-3
                    ${theme === 'dark' ? 'font-body-sm text-body-sm' : 'font-light-body text-light-body-md'}
                  `}
                >
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">settings</span>
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className={`
                    w-full text-left px-4 py-2.5 text-error hover:bg-error-container/10 transition-colors flex items-center gap-3
                    ${theme === 'dark' ? 'font-body-sm text-body-sm' : 'font-light-body text-light-body-md'}
                  `}
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Top Bar */}
      <header className="xl:hidden fixed top-0 left-0 right-0 z-[60] h-16 flex items-center justify-between px-6 backdrop-blur-xl border-b-0 bg-surface/80 pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full glass-card flex items-center justify-center border border-outline-variant/30">
            <span className="text-xs font-bold text-stark-gold">S</span>
          </div>
          <span className={`
            tracking-[0.3em] uppercase font-bold
            ${theme === 'dark'
              ? 'font-label-caps text-label-caps text-primary'
              : 'font-light-body text-light-label-lg text-primary'
            }
          `}>
            STARK
          </span>
        </div>
        <div className="flex items-center gap-2 relative z-[70]">
          <NotificationCenter />
          <button
            onClick={() => {
              console.log('Mobile user menu button clicked');
              setShowUserMenu(!showUserMenu);
            }}
            className="w-8 h-8 rounded-full glass-card border border-outline-variant/30 overflow-hidden hover:border-stark-gold/30 transition-colors"
          >
            <img
              alt="User Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuADYglUMRdg1ayEM7LOA-iM21MY1blqfgG0RTV8UoeYuoBNZwB1Jix0mjMtlCAJIqT0cWCOZDPubwsDWV8OZYB0NCXJpybfzNJd_W9gjAygRWh8e5deDTdn-X8qJLIx4tIkCx6a5BVXucCY0FIl5kbgtA-QwjPMn9i6_SRaaULPLNcz3lYzVwuMLEM_DqvRwdVp2l-ZcFE2ti384kmdwxKfMY6NmhIBIr82xYDtrXz94gqTWipmJIZuODIAhndUXtYkTlkQ2sTn9Os"
            />
          </button>
        </div>
        {showUserMenu && (
          <div ref={menuRef} className="absolute top-16 right-4 w-52 glass-card rounded-lg border border-outline-variant/30 shadow-ambient-lg py-2 z-50 animate-scale-in">
            <div className="px-4 py-3 border-b border-outline-variant/20">
              <p className={`
                font-semibold
                ${theme === 'dark'
                  ? 'font-body-sm text-body-sm text-primary'
                  : 'font-light-body text-light-body-md text-primary'
                }
              `}>
                {user?.firstName} {user?.lastName}
              </p>
              <p className={`
                mt-0.5
                ${theme === 'dark'
                  ? 'font-label-caps text-label-caps text-on-surface-variant'
                  : 'font-light-body text-light-label-md text-on-surface-variant'
                }
              `}>
                {user?.email}
              </p>
            </div>
            <div className="px-4 py-2">
              <ThemeToggle />
            </div>
            {user?.role === "ADMIN" && (
              <button 
                onClick={() => { navigate("/admin"); setShowUserMenu(false); }} 
                className={`
                  w-full text-left px-4 py-2.5 text-stark-gold hover:bg-surface-container-low transition-colors flex items-center gap-3
                  ${theme === 'dark' ? 'font-body-sm text-body-sm' : 'font-light-body text-light-body-md'}
                `}
              >
                <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                Admin Panel
              </button>
            )}
            <button 
              onClick={() => { navigate("/settings"); setShowUserMenu(false); }} 
              className={`
                w-full text-left px-4 py-2.5 text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-3
                ${theme === 'dark' ? 'font-body-sm text-body-sm' : 'font-light-body text-light-body-md'}
              `}
            >
              <span className="material-symbols-outlined text-sm text-on-surface-variant">settings</span>
              Settings
            </button>
            <button 
              onClick={handleLogout} 
              className={`
                w-full text-left px-4 py-2.5 text-error hover:bg-error-container/10 transition-colors flex items-center gap-3
                ${theme === 'dark' ? 'font-body-sm text-body-sm' : 'font-light-body text-light-body-md'}
              `}
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Sign Out
            </button>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="pt-16 xl:pt-20 pb-28 xl:pb-12">
        <div className="max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop py-stack-md">
          <Outlet />
        </div>
      </main>

      {/* Premium Mobile Bottom Nav */}
      <PremiumBottomNav />
    </div>
  );
};

export default CustomerLayout;

import React, { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import NotificationCenter from "../features/NotificationCenter";
import TawkToChat from "../features/TawkToChat";
import socketService from "../../services/socket";

const CustomerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize socket connection when user is available
  useEffect(() => {
    if (user) {
      socketService.connect(user._id);
    }
    return () => {
      socketService.disconnect();
    };
  }, [user]);

  const handleLogout = async () => {
    logout();
    navigate("/login", { replace: true });
  };

  const navItems = [
    { to: "/dashboard", icon: "home", label: "Home" },
    { to: "/transfers", icon: "swap_horiz", label: "Transfers" },
    { to: "/transactions", icon: "history", label: "History" },
    { to: "/loans", icon: "account_balance_wallet", label: "Loans" },
    { to: "/investments", icon: "trending_up", label: "Invest" },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Desktop Top Navigation */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 bg-surface border-b border-outline-variant z-50 px-6">
        <div className="flex-1 flex items-center gap-8">
          <div className="flex items-center gap-3 py-4">
            <img
              alt="STARK Financial Brand Logo"
              className="w-8 h-8 object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpM5pAlFfgo2n6RkoPkOlEFaemMZ6ecci7-u3Km86leaxmipq8rYxC7GojB5fjScHc2kXKaO3eTHmUc5V86yawUyizc6TiDyr6aM_4xhafLapweBrnnOFHECcFYHLKUE7sp7Hd4Q5BINpL7TBbOQsAQ0EKIfWYFqXjvmBqx-mVRLMvQQNCof3yhphMDtMFDtXnIuaO9JNFYTIqh4bQaPH6_Z2aEBW_iYlrScfm2CnJGPSkErFsBvGsGuL0yM-s-qlPEtk8Ge443XAO"
            />
            <span className="text-xl font-bold text-[#0A192F] font-['Manrope'] tracking-tight">
              STARK
            </span>
          </div>
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-xl font-black text-sm transition-all ${
                    isActive
                      ? "text-secondary bg-secondary-container/30"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 py-3">
          {user?.role === "ADMIN" && (
            <button
              onClick={() => navigate("/admin")}
              className="text-[10px] font-black uppercase tracking-widest text-secondary bg-secondary-container/30 px-3 py-1.5 rounded-full"
            >
              Admin
            </button>
          )}
          <TawkToChat />
          <NotificationCenter />
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/10 overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all"
            >
              <img
                alt="User Portrait"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLyKHK1bdOOr41Tc0zSN9vdWWwMQ-ixkOa4C7NatfRiooBraWelKjOfj-H1FUj9UK3H2wIrBNqWp4znggcIjf-DmODtDnR-at_og6NkwpnEvfxER8g0p5kcIRoFbWu9bRtgJEcgUWe1lBp8diEaB4LBqrggdanWT-yhjSC07Xb96EvPUxzuSvPUVUYATNEABQaSIaD2TN3uECbDxbascuIBIUpqnfIgrna-xMsfe5f_q3MjhAoQxaTnXQkvXFKCiw3Qgt8gsqy05Y0"
              />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-container-low border border-outline-variant rounded-xl shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-outline-variant/20">
                  <p className="text-sm font-semibold text-on-surface">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-on-surface-variant">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile TopAppBar */}
      <header className="lg:hidden bg-[#f8f9fa] dark:bg-[#0d1c32] w-full top-0 sticky z-50 shadow-none">
        <div className="flex justify-between items-center px-6 py-4 w-full">
          <div className="flex items-center gap-3">
            <img
              alt="STARK Financial Brand Logo"
              className="w-8 h-8 object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpM5pAlFfgo2n6RkoPkOlEFaemMZ6ecci7-u3Km86leaxmipq8rYxC7GojB5fjScHc2kXKaO3eTHmUc5V86yawUyizc6TiDyr6aM_4xhafLapweBrnnOFHECcFYHLKUE7sp7Hd4Q5BINpL7TBbOQsAQ0EKIfWYFqXjvmBqx-mVRLMvQQNCof3yhphMDtMFDtXnIuaO9JNFYTIqh4bQaPH6_Z2aEBW_iYlrScfm2CnJGPSkErFsBvGsGuL0yM-s-qlPEtk8Ge443XAO"
            />
            <span className="text-xl font-bold text-[#0A192F] dark:text-[#ffffff] font-['Manrope'] tracking-tight">
              STARK
            </span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter />
            <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/10 overflow-hidden">
              <img
                alt="User Portrait"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLyKHK1bdOOr41Tc0zSN9vdWWwMQ-ixkOa4C7NatfRiooBraWelKjOfj-H1FUj9UK3H2wIrBNqWp4znggcIjf-DmODtDnR-at_og6NkwpnEvfxER8g0p5kcIRoFbWu9bRtgJEcgUWe1lBp8diEaB4LBqrggdanWT-yhjSC07Xb96EvPUxzuSvPUVUYATNEABQaSIaD2TN3uECbDxbascuIBIUpqnfIgrna-xMsfe5f_q3MjhAoQxaTnXQkvXFKCiw3Qgt8gsqy05Y0"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="px-4 lg:px-6 pt-6 pb-28 lg:pb-8 space-y-8 max-w-2xl lg:max-w-6xl mx-auto lg:pt-24">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation — hidden on desktop */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full flex justify-around items-center py-3 pb-safe bg-[#f8f9fa]/70 dark:bg-[#0d1c32]/70 backdrop-blur-xl z-50 rounded-t-xl border-t border-[#c5c6cd]/15 shadow-[0_-10px_20px_rgba(13,28,50,0.04)]">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center scale-95 active:scale-90 transition-transform ${isActive ? "text-[#775a19] dark:text-[#e9c176] font-semibold" : "text-[#44474d] dark:text-[#c5c6cd] hover:text-[#000000] dark:hover:text-[#ffffff]"}`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`material-symbols-outlined ${isActive ? "filled" : ""}`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                home
              </span>
              <span className="font-['Inter'] text-[10px] font-medium mt-1">Home</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/transfers"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center scale-95 active:scale-90 transition-transform ${isActive ? "text-[#775a19] dark:text-[#e9c176] font-semibold" : "text-[#44474d] dark:text-[#c5c6cd] hover:text-[#000000] dark:hover:text-[#ffffff]"}`
          }
        >
          <span className="material-symbols-outlined">swap_horiz</span>
          <span className="font-['Inter'] text-[10px] font-medium mt-1">Transfers</span>
        </NavLink>

        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center scale-95 active:scale-90 transition-transform ${isActive ? "text-[#775a19] dark:text-[#e9c176] font-semibold" : "text-[#44474d] dark:text-[#c5c6cd] hover:text-[#000000] dark:hover:text-[#ffffff]"}`
          }
        >
          <span className="material-symbols-outlined">history</span>
          <span className="font-['Inter'] text-[10px] font-medium mt-1">History</span>
        </NavLink>

        <NavLink
          to="/loans"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center scale-95 active:scale-90 transition-transform ${isActive ? "text-[#775a19] dark:text-[#e9c176] font-semibold" : "text-[#44474d] dark:text-[#c5c6cd] hover:text-[#000000] dark:hover:text-[#ffffff]"}`
          }
        >
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <span className="font-['Inter'] text-[10px] font-medium mt-1">Loans</span>
        </NavLink>

        <NavLink
          to="/investments"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center scale-95 active:scale-90 transition-transform ${isActive ? "text-[#775a19] dark:text-[#e9c176] font-semibold" : "text-[#44474d] dark:text-[#c5c6cd] hover:text-[#000000] dark:hover:text-[#ffffff]"}`
          }
        >
          <span className="material-symbols-outlined">trending_up</span>
          <span className="font-['Inter'] text-[10px] font-medium mt-1">Invest</span>
        </NavLink>

        <div className="relative" ref={accountMenuRef}>
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className={`flex flex-col items-center justify-center scale-95 active:scale-90 transition-transform ${showAccountMenu ? "text-[#775a19] dark:text-[#e9c176] font-semibold" : "text-[#44474d] dark:text-[#c5c6cd] hover:text-[#000000] dark:hover:text-[#ffffff]"}`}
          >
            <span className="material-symbols-outlined">person</span>
            <span className="font-['Inter'] text-[10px] font-medium mt-1">Account</span>
          </button>
          {showAccountMenu && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-surface-container-low border border-outline-variant rounded-xl shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-outline-variant/20">
                <p className="text-sm font-semibold text-on-surface">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-on-surface-variant">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  navigate("/settings");
                  setShowAccountMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">settings</span>
                Account Settings
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setShowAccountMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default CustomerLayout;

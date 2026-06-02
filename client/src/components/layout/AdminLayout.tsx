import { NavLink, Outlet } from "react-router-dom";
import React, { useEffect, useState } from "react";
import NotificationCenter from "../features/NotificationCenter";
import socketService from "../../services/socket";
import { useAuth } from "../../contexts/AuthContext";

const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      socketService.connect(parsedUser._id);
    }
    return () => { socketService.disconnect(); };
  }, []);

  const navLinks = [
    { to: "/admin/overview", icon: "monitoring", label: "Overview" },
    { to: "/admin/users", icon: "group", label: "Users" },
    { to: "/admin/operations", icon: "settings", label: "Operations" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/20">
        <button onClick={() => setSidebarOpen(true)} className="w-9 h-9 rounded-full glass-card flex items-center justify-center border border-outline-variant/30 hover:border-outline transition-premium">
          <span className="material-symbols-outlined text-sm text-on-surface-variant">menu</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full overflow-hidden border border-outline-variant">
            <img
              alt="User Profile"
              className="w-full h-full object-cover"
              src="https://ui-avatars.com/api/?name=STARK&background=d4af37&color=000"
            />
          </div>
          <span className="text-label-caps text-primary tracking-[0.2em] uppercase font-bold">STARK</span>
          <span className="badge-gold text-[10px] ml-1">STAFF</span>
        </div>
        <NotificationCenter />
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 z-50 flex flex-col bg-surface-container-lowest border-r border-outline-variant/20 transition-transform duration-500 ease-premium ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        {/* Brand */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant">
              <img
                alt="User Profile"
                className="w-full h-full object-cover"
                src="https://ui-avatars.com/api/?name=STARK&background=d4af37&color=000"
              />
            </div>
            <div>
              <span className="text-label-caps text-primary tracking-[0.2em] uppercase font-bold block">STARK</span>
              <span className="text-[10px] text-tertiary-fixed tracking-widest uppercase">Command</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden w-8 h-8 rounded-full glass-card flex items-center justify-center border border-outline-variant/30">
            <span className="material-symbols-outlined text-sm text-on-surface-variant">close</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <p className="text-label-caps text-on-surface-variant/50 uppercase tracking-widest px-3 mb-4">Navigation</p>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-md text-body-sm font-medium transition-premium ${
                  isActive
                    ? "bg-primary/10 border-l-2 border-primary text-primary"
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low/50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="material-symbols-outlined text-sm" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {link.icon}
                  </span>
                  {link.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-6 border-t border-outline-variant/20 space-y-1">
          <NavLink
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-md text-body-sm text-on-surface-variant hover:text-primary hover:bg-surface-container-low/50 transition-premium"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Banking
          </NavLink>
          <button
            onClick={() => { logout(); setSidebarOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-body-sm text-error hover:bg-error-container/10 transition-premium"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0 bg-background">
        <div className="hidden lg:flex items-center justify-between h-20 px-10 border-b border-outline-variant/20 bg-surface/50 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-label-caps text-on-surface-variant uppercase tracking-widest">Live Platform Feed</span>
          </div>
          <NotificationCenter />
        </div>
        <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

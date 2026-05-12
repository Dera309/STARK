import { NavLink, Outlet } from "react-router-dom";
import React, { useEffect, useState } from "react";
import NotificationCenter from "../features/NotificationCenter";
import socketService from "../../services/socket";
import { useAuth } from "../../contexts/AuthContext";

const AdminLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user?._id) {
      socketService.connect(user._id);
    }
    return () => {
      socketService.disconnect();
    };
  }, [user?._id]);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-surface">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface-container-low border-b border-outline-variant h-14 flex items-center justify-between px-3">
        {/* Hamburger — explicit size so it never gets crowded out */}
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container-high active:bg-surface-container-highest transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white font-black italic text-xs">
            S
          </div>
          <span className="text-sm font-black tracking-tighter uppercase">STARK Admin</span>
        </div>

        {/* Compact bell — no border/padding bloat */}
        <div className="flex-shrink-0">
          <NotificationCenter compact />
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={closeSidebar} />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 h-full bg-surface-container-low border-r border-outline-variant p-6 flex flex-col z-50
        transition-transform duration-300 ease-in-out
        w-64
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        <div className="mb-8 flex items-center justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black italic">
              S
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic">
              STARK{" "}
              <span className="text-primary font-black not-italic text-[10px] ml-1 bg-primary/10 px-1 rounded">
                STAFF
              </span>
            </span>
          </div>
          <button
            onClick={closeSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <NavLink
            to="/admin/overview"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${isActive ? "bg-primary text-white shadow-lg" : "text-on-surface-variant hover:bg-surface-container-highest"}`
            }
          >
            📊 Overview
          </NavLink>
          <NavLink
            to="/admin/users"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${isActive ? "bg-primary text-white shadow-lg" : "text-on-surface-variant hover:bg-surface-container-highest"}`
            }
          >
            👥 Users
          </NavLink>
          <NavLink
            to="/admin/operations"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${isActive ? "bg-primary text-white shadow-lg" : "text-on-surface-variant hover:bg-surface-container-highest"}`
            }
          >
            ⚙️ Operations
          </NavLink>
        </nav>

        <div className="pt-6 border-t border-outline-variant space-y-2">
          <button
            onClick={() => {
              logout();
              closeSidebar();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-xs text-on-surface-variant hover:bg-surface-container-highest transition-all"
          >
            🚪 Logout
          </button>
          <NavLink
            to="/dashboard"
            onClick={closeSidebar}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-xs text-on-surface-variant hover:bg-surface-container-highest transition-all"
          >
            🔄 Back to Banking
          </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen px-4 py-6 sm:p-8 bg-surface pt-14 lg:pt-8 overflow-x-hidden">
        <header className="hidden lg:flex justify-end items-center mb-8 gap-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant bg-surface-container-high px-3 py-1.5 rounded-lg border border-outline-variant">
            Live Platform Feed
          </span>
          <NotificationCenter />
        </header>
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

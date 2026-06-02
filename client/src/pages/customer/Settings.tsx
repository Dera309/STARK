import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import api, { ApiError } from "../../services/api";

const Settings: React.FC = () => {
  const { user, login, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);
    try {
      const res = await api.put("/users/profile", formData);
      if (res.data.user && token) {
        login(res.data.user, token);
      }
      setEditingPersonal(false);
      setMessage("Profile updated successfully.");
    } catch (err: unknown) {
      setIsError(true);
      const apiErr = err as ApiError;
      setMessage(
        apiErr.response?.data?.error?.message ||
          apiErr.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User";
  const isPremium = (user?.kycTier || 0) >= 2;

  return (
    <div className="min-h-screen bg-background antialiased pb-[120px] pt-[100px]">
      {/* Fixed TopAppBar — matches design: avatar left, STARK center, bell right */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-surface/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-container-padding-mobile w-full max-w-7xl mx-auto shadow-[0px_10px_30px_rgba(192,192,192,0.05)]">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-10 h-10 rounded-full overflow-hidden border border-white/10 hover:opacity-80 transition-opacity duration-300"
        >
          <img
            alt="User Profile"
            className="w-full h-full object-cover"
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=1a1c1c&color=e5e2e1&size=80`}
          />
        </button>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold tracking-[0.2em] text-primary uppercase">
          STARK
        </h1>
        <button className="text-primary hover:opacity-80 transition-opacity duration-300 flex items-center justify-center w-10 h-10">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
            notifications
          </span>
        </button>
      </header>

      {/* Main Content — max-w-3xl centered */}
      <main className="px-container-padding-mobile md:px-container-padding-desktop max-w-3xl mx-auto space-y-stack-lg">
        {/* ── Profile Header ── */}
        <section className="flex flex-col items-center text-center mt-stack-md rounded-xl p-8 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-700" style={{
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
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="relative mb-6 group">
              <div className="w-24 h-24 rounded-full border-2 border-white/20 object-cover shadow-[0px_10px_30px_rgba(192,192,192,0.1)] transition-transform duration-500 group-hover:scale-105 overflow-hidden">
                <img
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=1a1c1c&color=e5e2e1&size=192`}
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-surface p-1 rounded-full border border-white/20">
                <div className="bg-tertiary-fixed-dim text-on-tertiary-fixed w-8 h-8 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                </div>
              </div>
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-white mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{fullName}</h1>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {isPremium && (
                <span className="font-label-caps text-label-caps text-tertiary-fixed-dim uppercase tracking-widest border border-tertiary-fixed-dim px-3 py-1 rounded-full bg-tertiary-fixed-dim/10">
                  Elite Member
                </span>
              )}
              <span className="font-label-caps text-label-caps text-white/80 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#4ADE80]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                Verified
              </span>
            </div>
          </div>
        </section>

        {/* Status Banner */}
        {message && (
          <div className={`p-4 rounded-xl border text-sm font-medium text-center animate-fade-in ${
            isError
              ? "bg-error-container/20 border-error/20 text-error"
              : "bg-success/10 border-success/20 text-success"
          }`}>
            {message}
          </div>
        )}

        {/* ── Settings Sections ── */}
        <section className="space-y-stack-md">
          {/* Personal Info Card */}
          <div className="rounded-xl p-2 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-700" style={{
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
            
            <div className="relative z-10 px-4 py-3 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors duration-300 rounded-lg"
              onClick={() => setEditingPersonal(!editingPersonal)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white/20 transition-colors">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                    person
                  </span>
                </div>
                <div>
                  <div className="font-body-lg text-body-lg text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Personal Info</div>
                  <div className="font-body-sm text-body-sm text-white/70">Update your details</div>
                </div>
              </div>
              <span className={`material-symbols-outlined text-white/70 group-hover:text-white transition-colors ${editingPersonal ? 'rotate-90' : ''}`}>
                chevron_right
              </span>
            </div>
            {editingPersonal && (
              <div className="relative z-10 px-4 pb-4 pt-2 border-t border-white/10 mt-1 animate-fade-in">
                <form onSubmit={handleSavePersonal} className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tertiary-fixed/40 transition-colors text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tertiary-fixed/40 transition-colors text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white/70 opacity-50 cursor-not-allowed text-sm"
                    />
                    <p className="text-xs text-white/70 mt-1">Email cannot be changed. Contact support if needed.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tertiary-fixed/40 transition-colors text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-gold w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingPersonal(false); setFormData({ firstName: user?.firstName || "", lastName: user?.lastName || "", phone: user?.phone || "" }); }}
                    className="btn-stark-ghost w-full"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Security Card */}
          <div className="rounded-xl p-2 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-700" style={{
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
            
            <div className="relative z-10 px-4 py-3 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors duration-300 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white/20 transition-colors">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                    shield_lock
                  </span>
                </div>
                <div>
                  <div className="font-body-lg text-body-lg text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Security</div>
                  <div className="font-body-sm text-body-sm text-white/70">Biometrics, 2FA, Passwords</div>
                </div>
              </div>
              <span className="material-symbols-outlined text-white/70 group-hover:text-white transition-colors">
                chevron_right
              </span>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="rounded-xl p-2 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-700" style={{
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
            
            <div className="relative z-10 px-4 py-3 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors duration-300 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white/20 transition-colors">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                    notifications_active
                  </span>
                </div>
                <div>
                  <div className="font-body-lg text-body-lg text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Notifications</div>
                  <div className="font-body-sm text-body-sm text-white/70">Manage alerts</div>
                </div>
              </div>
              <span className="material-symbols-outlined text-white/70 group-hover:text-white transition-colors">
                chevron_right
              </span>
            </div>
          </div>

          {/* App Settings & Appearance Card */}
          <div className="rounded-xl p-2 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-700" style={{
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
            
            {/* App Settings row */}
            <div className="relative z-10 px-4 py-3 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors duration-300 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white/20 transition-colors">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                    settings
                  </span>
                </div>
                <div>
                  <div className="font-body-lg text-body-lg text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>App Settings</div>
                  <div className="font-body-sm text-body-sm text-white/70">Preferences &amp; limits</div>
                </div>
              </div>
              <span className="material-symbols-outlined text-white/70 group-hover:text-white transition-colors">
                chevron_right
              </span>
            </div>
            {/* Divider */}
            <div className="relative z-10 w-full h-px bg-white/10 my-1" />
            {/* Dark Mode toggle row */}
            <div className="relative z-10 px-4 py-3 flex items-center justify-between group rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                    dark_mode
                  </span>
                </div>
                <div>
                  <div className="font-body-lg text-body-lg text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Appearance</div>
                  <div className="font-body-sm text-body-sm text-white/70">
                    {theme === "dark" ? "Dark Mode" : "Light Mode"}
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={theme === "dark"}
                  onChange={toggleTheme}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary-fixed"></div>
              </label>
            </div>
          </div>
        </section>

        {/* ── Logout Action ── */}
        <section className="mt-stack-lg flex justify-center">
          <button
            onClick={handleLogout}
            className="font-label-caps text-label-caps text-error border border-error/30 hover:bg-error/10 px-8 py-4 rounded-full transition-all duration-300 uppercase tracking-widest bg-transparent"
          >
            Log Out
          </button>
        </section>
      </main>

      {/* ── Mobile Bottom Nav (Profile active) ── */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-2xl rounded-t-lg border-t border-white/5 shadow-[0px_-10px_40px_rgba(0,0,0,0.5)] transition-all ease-[cubic-bezier(0.2,0.8,0.2,1)] flex justify-around items-center h-24 pb-safe px-4">
        {[
          { path: "/dashboard", icon: "grid_view", label: "Dashboard" },
          { path: "/transfers", icon: "swap_horiz", label: "Transfer" },
          { path: "/transactions", icon: "history", label: "History" },
          { path: "/wealth", icon: "account_balance_wallet", label: "Wealth" },
          { path: "/investments", icon: "trending_up", label: "Invest" },
          { path: "/settings", icon: "person", label: "Profile", active: true },
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
            <span className="material-symbols-outlined" style={{ fontVariationSettings: item.active ? "'FILL' 1" : "'FILL' 0" }}>
              {item.icon}
            </span>
            <span className="font-label-caps text-label-caps uppercase">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Settings;

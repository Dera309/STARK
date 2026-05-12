import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api, { ApiError } from "../../services/api";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Simple device fingerprint for demo purposes
      let deviceFingerprint = localStorage.getItem("device_fingerprint");
      if (!deviceFingerprint) {
        deviceFingerprint = `device-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("device_fingerprint", deviceFingerprint);
      }

      const response = await api.post("/auth/login", {
        email,
        password,
        deviceFingerprint,
      });

      login(response.data.user, response.data.token);

      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as ApiError).response?.data?.message 
        : "Login failed. Please check your credentials.";
      setError(errorMessage || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full animate-pulse delay-1000"></div>

      <div className="w-full max-w-md p-4 sm:p-8 relative z-10">
        <div className="bg-surface-container-low/60 backdrop-blur-3xl border border-outline-variant rounded-[2.5rem] shadow-2xl p-6 sm:p-10">
          <header className="text-center mb-10">
            <h1 className="text-4xl font-black tracking-tighter mb-2 bg-gradient-to-br from-primary to-primary-container bg-clip-text text-transparent italic">
              STARK
            </h1>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-on-surface-variant">
              Wealth Management
            </p>
          </header>

          {error && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-2xl text-xs font-black uppercase text-center border border-error/20 animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface ml-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-14 px-6 rounded-2xl bg-surface-container-highest border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold placeholder:text-outline/50"
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-2 mr-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  id="forgot-password-link"
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-14 px-6 rounded-2xl bg-surface-container-highest border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold placeholder:text-outline/50"
                placeholder="••••••••"
              />
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-primary text-on-primary rounded-2xl font-black uppercase tracking-widest hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></div>
              ) : (
                "Authenticate"
              )}
            </button>
          </form>

          <footer className="mt-10 text-center space-y-4">
            <p className="text-xs font-bold text-on-surface-variant">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                id="create-account-link"
                className="text-primary font-black hover:underline"
              >
                Create Account
              </Link>
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              Encrypted &amp; Protected by STARK Core
            </p>
            <div className="flex justify-center gap-6">
              <span className="w-8 h-[1px] bg-outline-variant"></span>
              <span className="w-8 h-[1px] bg-outline-variant"></span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;

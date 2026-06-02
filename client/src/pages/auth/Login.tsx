import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api, { ApiError } from "../../services/api";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      let deviceFingerprint = localStorage.getItem("device_fingerprint");
      if (!deviceFingerprint) {
        deviceFingerprint = `device-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("device_fingerprint", deviceFingerprint);
      }
      const response = await api.post("/auth/login", { email, password, deviceFingerprint });
      login(response.data.user, response.data.token);
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && "response" in err
        ? (err as ApiError).response?.data?.message
        : "Login failed. Please check your credentials.";
      setError(errorMessage || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-6">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-tertiary-fixed-dim/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-surface-container-high/30 rounded-full blur-[100px]" />
      </div>

      <main className="w-full max-w-md mx-auto relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-stack-lg">
          <div className="w-32 h-32 mb-stack-md rounded-full overflow-hidden glass-card p-1 shadow-gold-glow">
            <img
              alt="STARK Premium Fintech Logo"
              className="w-full h-full object-cover rounded-full mix-blend-screen"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuADYglUMRdg1ayEM7LOA-iM21MY1blqfgG0RTV8UoeYuoBNZwB1Jix0mjMtlCAJIqT0cWCOZDPubwsDWV8OZYB0NCXJpybfzNJd_W9gjAygRWh8e5deDTdn-X8qJLIx4tIkCx6a5BVXucCY0FIl5kbgtA-QwjPMn9i6_SRaaULPLNcz3lYzVwuMLEM_DqvRwdVp2l-ZcFE2ti384kmdwxKfMY6NmhIBIr82xYDtrXz94gqTWipmJIZuODIAhndUXtYkTlkQ2sTn9Os"
            />
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary tracking-[0.2em] uppercase">
            STARK
          </h1>
          <p className="text-label-caps text-on-surface-variant mt-unit tracking-widest uppercase">
            Elite Access
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-lg p-8 relative overflow-hidden">
          <div className="glass-top-glow" />

          {error && (
            <div className="mb-6 p-4 rounded-md bg-error-container/20 border border-error/20 text-error text-body-sm text-center animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-8">
            {/* Email */}
            <div className="input-glass pb-2 pt-5 relative">
              <label className="absolute top-0 left-0 text-label-caps text-on-surface-variant uppercase tracking-widest">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-body-lg text-primary outline-none placeholder-transparent"
                placeholder="email"
              />
              <span className="material-symbols-outlined absolute right-0 bottom-2 text-on-surface-variant text-sm">
                mail
              </span>
            </div>

            {/* Password */}
            <div className="input-glass pb-2 pt-5 relative">
              <label className="absolute top-0 left-0 text-label-caps text-on-surface-variant uppercase tracking-widest">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-body-lg text-primary outline-none placeholder-transparent pr-8"
                placeholder="password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 bottom-2 text-on-surface-variant hover:text-primary transition-colors duration-300"
              >
                <span className="material-symbols-outlined text-sm">
                  {showPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>

            {/* Forgot */}
            <div className="flex justify-end -mt-4">
              <Link
                to="/forgot-password"
                className="text-label-caps text-secondary hover:text-primary transition-colors duration-300 uppercase tracking-widest"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-on-tertiary-fixed/30 border-t-on-tertiary-fixed rounded-full animate-spin" />
              ) : (
                "LOGIN"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <p className="text-label-caps text-on-surface-variant uppercase tracking-widest">
              Or sign in with
            </p>
            <button
              type="button"
              className="w-14 h-14 rounded-full glass-card flex items-center justify-center hover:bg-surface-container-high transition-premium group"
            >
              <span className="material-symbols-outlined text-3xl text-secondary group-hover:text-primary transition-colors duration-300">
                fingerprint
              </span>
            </button>
          </div>
        </div>

        {/* Sign up */}
        <div className="mt-8 text-center">
          <p className="text-body-sm text-on-surface-variant">
            New to STARK?{" "}
            <Link
              to="/register"
              className="text-label-caps text-tertiary-fixed hover:text-primary transition-colors duration-300 uppercase tracking-widest ml-1"
            >
              Sign Up
            </Link>
          </p>
        </div>

        {/* FDIC Notice */}
        <div className="mt-8 text-center">
          <p className="text-label-caps text-on-surface-variant uppercase tracking-widest text-xs">
            N.A. Member. FDIC
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;

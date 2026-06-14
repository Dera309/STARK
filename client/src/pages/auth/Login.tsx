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
    <div className="min-h-screen flex items-center justify-center bg-background relative px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-12">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px] bg-tertiary-fixed-dim/5 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[150px] h-[150px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] bg-surface-container-high/30 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px]" />
      </div>

      <main className="w-full max-w-md mx-auto relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6 sm:mb-8 md:mb-12">
          <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 mb-3 sm:mb-4 md:mb-6 rounded-full overflow-hidden glass-card p-1 shadow-gold-glow">
            <img
              alt="STARK Premium Fintech Logo"
              className="w-full h-full object-cover rounded-full mix-blend-screen"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuADYglUMRdg1ayEM7LOA-iM21MY1blqfgG0RTV8UoeYuoBNZwB1Jix0mjMtlCAJIqT0cWCOZDPubwsDWV8OZYB0NCXJpybfzNJd_W9gjAygRWh8e5deDTdn-X8qJLIx4tIkCx6a5BVXucCY0FIl5kbgtA-QwjPMn9i6_SRaaULPLNcz3lYzVwuMLEM_DqvRwdVp2l-ZcFE2ti384kmdwxKfMY6NmhIBIr82xYDtrXz94gqTWipmJIZuODIAhndUXtYkTlkQ2sTn9Os"
            />
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile sm:font-headline-lg sm:text-headline-lg md:font-headline-lg md:text-headline-lg text-primary tracking-[0.15em] sm:tracking-[0.2em] uppercase text-center">
            STARK
          </h1>
          <p className="text-label-caps text-on-surface-variant mt-1 sm:mt-2 tracking-widest uppercase text-center">
            Elite Access
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-lg p-4 sm:p-6 md:p-8 relative overflow-hidden">
          <div className="glass-top-glow" />

          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-md bg-error-container/20 border border-error/20 text-error text-body-sm text-center animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6 md:space-y-8">
            {/* Email */}
            <div className="input-glass pb-2 pt-4 sm:pt-5 relative">
              <label className="absolute top-0 left-0 text-label-caps text-on-surface-variant uppercase tracking-widest z-10 text-[10px] sm:text-xs">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-body-sm sm:text-body-lg text-primary outline-none placeholder-transparent relative z-0"
                placeholder="email"
                style={{ minHeight: '28px', color: 'var(--color-primary)' }}
              />
              <span className="material-symbols-outlined absolute right-0 bottom-2 text-on-surface-variant text-xs sm:text-sm z-10">
                mail
              </span>
            </div>

            {/* Password */}
            <div className="input-glass pb-2 pt-4 sm:pt-5 relative">
              <label className="absolute top-0 left-0 text-label-caps text-on-surface-variant uppercase tracking-widest z-10 text-[10px] sm:text-xs">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-body-sm sm:text-body-lg text-primary outline-none placeholder-transparent pr-8 relative z-0"
                placeholder="password"
                style={{ minHeight: '28px', color: 'var(--color-primary)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 bottom-2 text-on-surface-variant hover:text-primary transition-colors duration-300 z-10 p-1"
              >
                <span className="material-symbols-outlined text-xs sm:text-sm">
                  {showPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>

            {/* Forgot */}
            <div className="flex justify-end -mt-2 sm:-mt-4">
              <Link
                to="/forgot-password"
                className="text-label-caps text-secondary hover:text-primary transition-colors duration-300 uppercase tracking-widest text-[10px] sm:text-xs"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed py-3 sm:py-4"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-on-tertiary-fixed/30 border-t-on-tertiary-fixed rounded-full animate-spin" />
              ) : (
                <span className="text-sm sm:text-base">LOGIN</span>
              )}
            </button>
          </form>

        </div>

        {/* Sign up */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-body-sm text-on-surface-variant text-sm sm:text-base">
            New to STARK?{" "}
            <Link
              to="/register"
              className="text-label-caps text-tertiary-fixed hover:text-primary transition-colors duration-300 uppercase tracking-widest ml-1 text-[10px] sm:text-xs"
            >
              Sign Up
            </Link>
          </p>
        </div>

        {/* Regulatory Disclosures */}
        <div className="mt-6 sm:mt-8 text-center space-y-2">
          <p className="text-label-caps text-on-surface-variant uppercase tracking-widest text-[10px] sm:text-xs">
            N.A. Member. FDIC
          </p>
          <div className="flex flex-wrap justify-center gap-x-2 sm:gap-x-4 gap-y-1 sm:gap-y-2 text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[8px] sm:text-[10px]">
            <span>CFPB</span>
            <span>•</span>
            <span>FinCEN</span>
            <span>•</span>
            <span>FINRA/SIPC</span>
            <span>•</span>
            <span>NY Dept</span>
            <span>•</span>
            <span>NMLS</span>
            <span>•</span>
            <span>SWIFT</span>
            <span>•</span>
            <span>FHLB</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;

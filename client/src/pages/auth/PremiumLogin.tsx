import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api, { ApiError } from '../../services/api';

const PremiumLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let deviceFingerprint = localStorage.getItem('device_fingerprint');
      if (!deviceFingerprint) {
        deviceFingerprint = `device-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('device_fingerprint', deviceFingerprint);
      }

      const response = await api.post('/auth/login', { email, password, deviceFingerprint });
      login(response.data.user, response.data.token);

      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const message =
        apiErr.response?.data?.error?.message ||
        apiErr.response?.data?.message ||
        'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative p-4 sm:p-6 md:p-8">
      {/* Background radial glow — matches design */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-tertiary-fixed-dim/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] bg-surface-container-high/30 rounded-full blur-[100px]" />
      </div>

      <main className="w-full max-w-md mx-auto relative z-10 animate-fade-in">
        {/* Logo — matches design: w-32 h-32 with actual STARK logo image */}
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

        {/* Form Card — matches design: glass-card with glass-top-glow */}
        <div className="glass-card rounded-lg p-6 sm:p-8 relative overflow-hidden">
          <div className="glass-top-glow" />

          {error && (
            <div className="mb-6 p-4 rounded-md bg-error-container/20 border border-error/20 text-error text-body-sm text-center animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Email — matches design: input-glass with floating label */}
            <div className="relative input-glass pb-2 pt-5">
              <label className="absolute top-0 left-0 text-label-caps text-on-surface-variant uppercase tracking-widest z-10">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-body-lg sm:text-body-lg text-primary outline-none placeholder-transparent relative z-0"
                placeholder="email"
                style={{ minHeight: '32px', color: 'var(--color-primary)' }}
              />
              <span className="material-symbols-outlined absolute right-0 bottom-2 text-on-surface-variant text-sm z-10">
                mail
              </span>
            </div>

            {/* Password — matches design */}
            <div className="relative input-glass pb-2 pt-5">
              <label className="absolute top-0 left-0 text-label-caps text-on-surface-variant uppercase tracking-widest z-10">
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-body-lg sm:text-body-lg text-primary outline-none placeholder-transparent pr-8 relative z-0"
                placeholder="password"
                style={{ minHeight: '32px', color: 'var(--color-primary)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 bottom-2 text-on-surface-variant hover:text-primary transition-colors duration-300 z-10"
              >
                <span className="material-symbols-outlined text-sm">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-label-caps text-secondary hover:text-primary transition-colors duration-300 uppercase tracking-widest"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit — matches design: btn-gold rounded-full */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-gold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-on-tertiary-fixed/30 border-t-on-tertiary-fixed rounded-full animate-spin" />
              ) : (
                'LOGIN'
              )}
            </button>
          </form>

        </div>

        {/* Sign up link */}
        <div className="mt-stack-lg text-center">
          <p className="text-body-sm text-on-surface-variant">
            New to STARK?{' '}
            <Link
              to="/register"
              className="text-label-caps text-tertiary-fixed hover:text-primary transition-colors duration-300 uppercase tracking-widest ml-unit"
            >
              Sign Up
            </Link>
          </p>
        </div>

        {/* Regulatory Disclosures */}
        <div className="mt-stack-lg text-center space-y-2">
          <p className="text-label-caps text-on-surface-variant uppercase tracking-widest text-xs">
            N.A. Member. FDIC
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[10px]">
            <span>CFPB</span>
            <span>•</span>
            <span>FinCEN</span>
            <span>•</span>
            <span>FINRA/SIPC</span>
            <span>•</span>
            <span>NY Dept of Financial Services</span>
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

export default PremiumLogin;

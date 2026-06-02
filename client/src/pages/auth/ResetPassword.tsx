import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { ApiError } from "../../services/api";

type Step = "form" | "success" | "invalid";

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [token, setToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) {
      setStep("invalid");
    } else {
      setToken(t);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password/confirm", { token, newPassword });
      setStep("success");
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const msg =
        apiErr.response?.data?.error?.message ||
        apiErr.response?.data?.message ||
        "Something went wrong. Please try again.";
      if (msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("expired")) {
        setStep("invalid");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Password strength
  const getStrength = (pwd: string) => {
    if (pwd.length >= 12 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) return 4;
    if (pwd.length >= 10 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return 3;
    if (pwd.length >= 8) return 2;
    return 1;
  };
  const strengthColors = ["bg-error", "bg-warning", "bg-secondary", "bg-tertiary-fixed-dim"];
  const strength = getStrength(newPassword);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-container-padding-mobile md:p-container-padding-desktop">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-tertiary-fixed-dim/5 rounded-full blur-[120px]" />
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
            {step === "invalid" ? "Link Expired" : step === "success" ? "Access Restored" : "New Password"}
          </p>
        </div>

        <div className="glass-card rounded-lg p-stack-md relative overflow-hidden">
          <div className="glass-top-glow" />

          {step === "invalid" && (
            <div className="text-center py-stack-sm">
              <p className="text-body-sm text-on-surface-variant leading-relaxed mb-stack-md">
                This password reset link is no longer valid. Reset links expire after 24 hours.
              </p>
              <Link
                to="/forgot-password"
                className="w-full btn-gold flex items-center justify-center gap-3"
              >
                Request New Link
              </Link>
            </div>
          )}

          {step === "form" && (
            <>
              <div className="mb-stack-md text-center">
                <p className="text-body-sm text-on-surface-variant leading-relaxed">
                  Choose a strong password with at least 8 characters.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-md bg-error-container/20 border border-error/20 text-error text-body-sm text-center animate-fade-in">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-stack-md">
                {/* New Password */}
                <div className="relative input-glass pb-2 pt-5">
                  <label className="absolute top-0 left-0 text-label-caps text-on-surface-variant uppercase tracking-widest">
                    New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoFocus
                    minLength={8}
                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-body-lg text-primary outline-none placeholder-transparent pr-8"
                    placeholder="password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-0 bottom-2 text-on-surface-variant hover:text-primary transition-colors duration-300"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>

                {/* Strength bar */}
                {newPassword.length > 0 && (
                  <div className="flex gap-1 -mt-2">
                    {[1, 2, 3, 4].map((lvl) => (
                      <div
                        key={lvl}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${lvl <= strength ? strengthColors[strength - 1] : "bg-outline-variant"}`}
                      />
                    ))}
                  </div>
                )}

                {/* Confirm Password */}
                <div className="relative input-glass pb-2 pt-5">
                  <label className="absolute top-0 left-0 text-label-caps text-on-surface-variant uppercase tracking-widest">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-body-lg text-primary outline-none placeholder-transparent"
                    placeholder="confirm"
                  />
                </div>

                {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                  <p className="text-label-caps text-error -mt-2">Passwords do not match</p>
                )}
                {confirmPassword.length > 0 && newPassword === confirmPassword && (
                  <p className="text-label-caps text-tertiary-fixed-dim -mt-2">✓ Passwords match</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-gold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-on-tertiary-fixed/30 border-t-on-tertiary-fixed rounded-full animate-spin" />
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            </>
          )}

          {step === "success" && (
            <div className="text-center py-stack-sm">
              <div className="w-16 h-16 mx-auto mb-stack-md rounded-full bg-tertiary-fixed/10 border border-tertiary-fixed/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>
              <h2 className="font-title-md text-title-md text-primary mb-unit">Password Reset!</h2>
              <p className="text-body-sm text-on-surface-variant leading-relaxed">
                Your password has been updated. Redirecting to login…
              </p>
              <div className="mt-stack-md">
                <div className="w-8 h-8 border-2 border-tertiary-fixed/30 border-t-tertiary-fixed-dim rounded-full animate-spin mx-auto" />
              </div>
            </div>
          )}
        </div>

        <div className="mt-stack-lg text-center">
          <p className="text-body-sm text-on-surface-variant">
            <Link
              to="/login"
              className="text-label-caps text-tertiary-fixed hover:text-primary transition-colors duration-300 uppercase tracking-widest"
            >
              Back to Login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;

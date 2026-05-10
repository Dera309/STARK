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
      // Redirect to login after 3 seconds
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error && 'response' in err 
        ? (err as ApiError).response?.data?.message 
        : "Something went wrong. Please try again.";
      if (msg && (msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("expired"))) {
        setStep("invalid");
      } else {
        setError(msg || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full animate-pulse delay-1000"></div>

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="bg-surface-container-low/60 backdrop-blur-3xl border border-outline-variant rounded-[2.5rem] shadow-2xl p-10">
          <header className="text-center mb-10">
            <h1 className="text-4xl font-black tracking-tighter mb-2 bg-gradient-to-br from-primary to-primary-container bg-clip-text text-transparent italic">
              STARK
            </h1>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-on-surface-variant">
              Wealth Management
            </p>
          </header>

          {step === "invalid" && (
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 rounded-[1.5rem] bg-error-container border border-error/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-8 h-8 text-error"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-black text-on-surface mb-3">Link Invalid or Expired</h2>
              <p className="text-xs font-bold text-on-surface-variant leading-relaxed mb-6">
                This password reset link is no longer valid. Reset links expire after 24 hours.
              </p>
              <Link
                to="/forgot-password"
                id="request-new-link-btn"
                className="inline-block w-full h-16 bg-primary text-on-primary rounded-2xl font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center"
              >
                Request New Link
              </Link>
            </div>
          )}

          {step === "form" && (
            <>
              {/* Icon */}
              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-8 h-8 text-primary"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-xl font-black text-on-surface mb-2">Set New Password</h2>
                <p className="text-xs font-bold text-on-surface-variant leading-relaxed">
                  Choose a strong password with at least 8 characters.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-2xl text-xs font-black uppercase text-center border border-error/20 animate-shake">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="new-password"
                    className="text-[10px] font-black uppercase tracking-widest text-on-surface ml-2"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      autoFocus
                      minLength={8}
                      className="w-full h-14 px-6 pr-14 rounded-2xl bg-surface-container-highest border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold placeholder:text-outline/50"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      id="toggle-password-visibility"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Password strength bar */}
                  {newPassword.length > 0 && (
                    <div className="flex gap-1 mt-2 px-2">
                      {[1, 2, 3, 4].map((lvl) => {
                        const strength =
                          newPassword.length >= 12 &&
                          /[A-Z]/.test(newPassword) &&
                          /[0-9]/.test(newPassword) &&
                          /[^A-Za-z0-9]/.test(newPassword)
                            ? 4
                            : newPassword.length >= 10 &&
                                /[A-Z]/.test(newPassword) &&
                                /[0-9]/.test(newPassword)
                              ? 3
                              : newPassword.length >= 8
                                ? 2
                                : 1;
                        const colors = ["bg-error", "bg-warning", "bg-secondary", "bg-tertiary"];
                        return (
                          <div
                            key={lvl}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${lvl <= strength ? colors[strength - 1] : "bg-outline-variant"}`}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirm-password"
                    className="text-[10px] font-black uppercase tracking-widest text-on-surface ml-2"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full h-14 px-6 rounded-2xl bg-surface-container-highest border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold placeholder:text-outline/50"
                    placeholder="••••••••"
                  />
                  {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                    <p className="text-[10px] font-black text-error ml-2 mt-1">
                      Passwords do not match
                    </p>
                  )}
                  {confirmPassword.length > 0 && newPassword === confirmPassword && (
                    <p className="text-[10px] font-black text-tertiary ml-2 mt-1">
                      ✓ Passwords match
                    </p>
                  )}
                </div>

                <button
                  id="reset-password-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 bg-primary text-on-primary rounded-2xl font-black uppercase tracking-widest hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-4 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></div>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            </>
          )}

          {step === "success" && (
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 rounded-[1.5rem] bg-tertiary/10 border border-tertiary/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-8 h-8 text-tertiary"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-black text-on-surface mb-3">Password Reset!</h2>
              <p className="text-xs font-bold text-on-surface-variant leading-relaxed">
                Your password has been updated successfully. Redirecting you to login…
              </p>
              <div className="mt-6">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
              </div>
            </div>
          )}

          <footer className="mt-10 text-center space-y-4">
            <p className="text-xs font-bold text-on-surface-variant">
              <Link
                to="/login"
                id="reset-back-to-login"
                className="text-primary font-black hover:underline"
              >
                Back to Login
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

export default ResetPassword;

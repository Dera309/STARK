import React, { useState } from "react";
import { Link } from "react-router-dom";
import api, { ApiError } from "../../services/api";

type Step = "form" | "success";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("form");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/reset-password/request", { email });
      setStep("success");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as ApiError).response?.data?.message 
        : "Something went wrong. Please try again.";
      setError(errorMessage || "Something went wrong. Please try again.");
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

          {step === "form" ? (
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
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-xl font-black text-on-surface mb-2">Reset Your Password</h2>
                <p className="text-xs font-bold text-on-surface-variant leading-relaxed">
                  Enter the email address linked to your account and we&apos;ll send you a secure reset
                  link.
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
                    htmlFor="forgot-email"
                    className="text-[10px] font-black uppercase tracking-widest text-on-surface ml-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full h-14 px-6 rounded-2xl bg-surface-container-highest border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold placeholder:text-outline/50"
                    placeholder="john@example.com"
                  />
                </div>

                <button
                  id="send-reset-link-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 bg-primary text-on-primary rounded-2xl font-black uppercase tracking-widest hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-4 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></div>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
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
              <h2 className="text-xl font-black text-on-surface mb-3">Check Your Inbox</h2>
              <p className="text-xs font-bold text-on-surface-variant leading-relaxed mb-2">
                If an account exists for <span className="text-primary font-black">{email}</span>, a
                secure password reset link has been sent.
              </p>
              <p className="text-xs font-bold text-on-surface-variant leading-relaxed">
                The link expires in <span className="text-on-surface font-black">24 hours</span>.
                Check your spam folder if you don&apos;t see it.
              </p>
            </div>
          )}

          <footer className="mt-10 text-center space-y-4">
            <p className="text-xs font-bold text-on-surface-variant">
              Remembered your password?{" "}
              <Link
                to="/login"
                id="back-to-login-link"
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

export default ForgotPassword;

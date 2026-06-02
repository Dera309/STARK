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
      const apiErr = err as ApiError;
      setError(
        apiErr.response?.data?.error?.message ||
        apiErr.response?.data?.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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
            {step === "form" ? "Reset Access" : "Check Inbox"}
          </p>
        </div>

        <div className="glass-card rounded-lg p-stack-md relative overflow-hidden">
          <div className="glass-top-glow" />

          {step === "form" ? (
            <>
              <div className="mb-stack-md text-center">
                <p className="text-body-sm text-on-surface-variant leading-relaxed">
                  Enter the email address linked to your account and we'll send you a secure reset link.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-md bg-error-container/20 border border-error/20 text-error text-body-sm text-center animate-fade-in">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-stack-md">
                <div className="relative input-glass pb-2 pt-5">
                  <label className="absolute top-0 left-0 text-label-caps text-on-surface-variant uppercase tracking-widest">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-body-lg text-primary outline-none placeholder-transparent"
                    placeholder="email"
                  />
                  <span className="material-symbols-outlined absolute right-0 bottom-2 text-on-surface-variant text-sm">
                    mail
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-gold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-on-tertiary-fixed/30 border-t-on-tertiary-fixed rounded-full animate-spin" />
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-stack-sm">
              <div className="w-16 h-16 mx-auto mb-stack-md rounded-full bg-tertiary-fixed/10 border border-tertiary-fixed/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>
                  mark_email_read
                </span>
              </div>
              <h2 className="font-title-md text-title-md text-primary mb-unit">Check Your Inbox</h2>
              <p className="text-body-sm text-on-surface-variant leading-relaxed mb-unit">
                If an account exists for{" "}
                <span className="text-primary font-semibold">{email}</span>, a secure reset link has been sent.
              </p>
              <p className="text-body-sm text-on-surface-variant leading-relaxed">
                The link expires in <span className="text-primary font-semibold">24 hours</span>. Check your spam folder if you don't see it.
              </p>
            </div>
          )}
        </div>

        <div className="mt-stack-lg text-center">
          <p className="text-body-sm text-on-surface-variant">
            Remembered your password?{" "}
            <Link
              to="/login"
              className="text-label-caps text-tertiary-fixed hover:text-primary transition-colors duration-300 uppercase tracking-widest ml-unit"
            >
              Back to Login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;

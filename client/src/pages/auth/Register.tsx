import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api, { ApiError } from "../../services/api";

const Register: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      const response = await api.post("/auth/register", { firstName, lastName, email, phone, password });
      login(response.data.user, response.data.token);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const errorData = err instanceof Error && "response" in err ? (err as ApiError).response?.data : null;
      setError(errorData?.error?.message || errorData?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-transparent border-none p-0 focus:ring-0 text-body-lg text-primary outline-none placeholder-transparent";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-6 py-12">
      {/* Background */}
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
          <p className="text-label-caps text-on-surface-variant mt-unit tracking-widest uppercase">Create Account</p>
        </div>

        <div className="glass-card rounded-lg p-8 relative overflow-hidden">
          <div className="glass-top-glow" />

          {error && (
            <div className="mb-6 p-4 rounded-md bg-error-container/20 border border-error/20 text-error text-body-sm text-center animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-7">
            {/* Name row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="input-glass pb-2 pt-5 relative">
                <label className="absolute top-0 left-0 text-label-caps text-on-surface-variant uppercase tracking-widest">First Name</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputClass} placeholder="First" />
              </div>
              <div className="input-glass pb-2 pt-5 relative">
                <label className="absolute top-0 left-0 text-label-caps text-on-surface-variant uppercase tracking-widest">Last Name</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className={inputClass} placeholder="Last" />
              </div>
            </div>

            <div className="input-glass pb-2 pt-5 relative">
              <label className="absolute top-0 left-0 text-label-caps text-on-surface-variant uppercase tracking-widest">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className={inputClass} placeholder="email" />
              <span className="material-symbols-outlined absolute right-0 bottom-2 text-on-surface-variant text-sm">mail</span>
            </div>

            <div className="input-glass pb-2 pt-5 relative">
              <label className="absolute top-0 left-0 text-label-caps text-on-surface-variant uppercase tracking-widest">Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className={inputClass} placeholder="phone" />
              <span className="material-symbols-outlined absolute right-0 bottom-2 text-on-surface-variant text-sm">phone</span>
            </div>

            <div className="input-glass pb-2 pt-5 relative">
              <label className="absolute top-0 left-0 text-label-caps text-on-surface-variant uppercase tracking-widest">Password</label>
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className={`${inputClass} pr-8`} placeholder="password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 bottom-2 text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-sm">{showPassword ? "visibility" : "visibility_off"}</span>
              </button>
            </div>

            <div className="input-glass pb-2 pt-5 relative">
              <label className="absolute top-0 left-0 text-label-caps text-on-surface-variant uppercase tracking-widest">Confirm Password</label>
              <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputClass} placeholder="confirm" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-on-tertiary-fixed/30 border-t-on-tertiary-fixed rounded-full animate-spin" />
              ) : "CREATE ACCOUNT"}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-body-sm text-on-surface-variant">
            Already have an account?{" "}
            <Link to="/login" className="text-label-caps text-tertiary-fixed hover:text-primary transition-colors uppercase tracking-widest ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;

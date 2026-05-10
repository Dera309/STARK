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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        firstName,
        lastName,
        email,
        phone,
        password,
      });

      login(response.data.user, response.data.token);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const errorData = err instanceof Error && 'response' in err ? (err as ApiError).response?.data : null;
      const errorMessage = errorData?.error?.message || errorData?.message || "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden font-sans py-10">
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
              Create Account
            </p>
          </header>

          {error && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-2xl text-xs font-black uppercase text-center border border-error/20 animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface ml-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full h-14 px-5 rounded-2xl bg-surface-container-highest border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold placeholder:text-outline/50"
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface ml-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full h-14 px-5 rounded-2xl bg-surface-container-highest border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold placeholder:text-outline/50"
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface ml-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full h-14 px-6 rounded-2xl bg-surface-container-highest border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold placeholder:text-outline/50"
                placeholder="+1 234 567 8900"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface ml-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-14 px-6 rounded-2xl bg-surface-container-highest border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold placeholder:text-outline/50"
                placeholder="Min. 8 characters"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface ml-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full h-14 px-6 rounded-2xl bg-surface-container-highest border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold placeholder:text-outline/50"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-primary text-on-primary rounded-2xl font-black uppercase tracking-widest hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <footer className="mt-8 text-center space-y-3">
            <p className="text-xs font-bold text-on-surface-variant">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-black hover:underline">
                Sign In
              </Link>
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              Encrypted &amp; Protected by STARK Core
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Register;

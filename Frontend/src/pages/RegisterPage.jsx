import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authApi } from "../services/api.js";
import { setAuth } from "../redux/store.js";
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Username validation
    if (username.trim().length < 3) {
      return setError("Username must be at least 3 characters");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return setError("Please enter a valid email address");
    }

    // Password validation
    if (password.length < 8) {
      return setError("Password must be at least 8 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      return setError("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      return setError("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      return setError("Password must contain at least one number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return setError("Password must contain at least one special character (!@#$%^&*)");
    }

    setLoading(true);

    try {
      const res = await authApi.register({
        username,
        email,
        password,
      });

      dispatch(setAuth(res.data));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md my-8">
      <div className="bg-[#0e0e17]/90 backdrop-blur-xl p-8 rounded-3xl shadow-[0_20px_60px_-15px_rgba(239,68,68,0.15)] border border-red-500/20 relative overflow-hidden">
        {/* Subtle top ambient red gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono uppercase tracking-widest mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Instant $1000 Demo Balance
          </div>
          <h2 className="text-3xl font-black italic tracking-tighter text-white">
            CREATE <span className="text-red-500">ACCOUNT</span>
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Join thousands of active Aviator players worldwide
          </p>
        </div>

        {error && (
          <div className="bg-red-500/15 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 relative z-10">
          <div>
            <label className="block text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <User size={16} />
              </div>
              <input
                type="text"
                disabled={loading}
                className="w-full bg-[#151522] border border-gray-800 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-500/70 focus:ring-1 focus:ring-red-500/40 text-sm text-white placeholder-gray-600 transition-all shadow-inner disabled:opacity-50"
                placeholder="Pilot_Ace"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Mail size={16} />
              </div>
              <input
                type="email"
                disabled={loading}
                className="w-full bg-[#151522] border border-gray-800 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-500/70 focus:ring-1 focus:ring-red-500/40 text-sm text-white placeholder-gray-600 transition-all shadow-inner disabled:opacity-50"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                disabled={loading}
                className="w-full bg-[#151522] border border-gray-800 pl-10 pr-12 py-3 rounded-xl focus:outline-none focus:border-red-500/70 focus:ring-1 focus:ring-red-500/40 text-sm text-white placeholder-gray-600 transition-all shadow-inner disabled:opacity-50"
                placeholder="At least 8 chars (A-Z, 0-9, symbol)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-[10px] text-gray-500 mt-1 pl-1">
              Must include 8+ chars, uppercase, lowercase, number, and special character.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black py-3.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-red-600/25 active:scale-[0.98] border-b-4 border-red-800 mt-2 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Creating Account...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>CREATE ACCOUNT</span>
                <ArrowRight size={16} />
              </span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-800/80 text-center">
          <p className="text-xs text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-red-400 hover:text-red-300 font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              Login here
            </Link>
          </p>
          <div className="mt-3">
            <Link
              to="/"
              className="text-[11px] text-gray-500 hover:text-gray-300 font-mono transition-colors"
            >
              ← Back to Live Game
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authApi } from "../services/api.js";
import { setAuth } from "../redux/store.js";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });
      dispatch(setAuth(res.data));
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please verify your email and password."
      );
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono uppercase tracking-widest mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Aviator Arena
          </div>
          <h2 className="text-3xl font-black italic tracking-tighter text-white">
            WELCOME <span className="text-red-500">BACK</span>
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Sign in to start placing bets and cash out big
          </p>
        </div>

        {error && (
          <div className="bg-red-500/15 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
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
                placeholder="••••••••"
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
                <span>Logging In...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>LOGIN</span>
                <ArrowRight size={16} />
              </span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-800/80 text-center">
          <p className="text-xs text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-red-400 hover:text-red-300 font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              Register now
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

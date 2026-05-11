import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { authApi } from "../services/api.js";
import { setAuth } from "../redux/store.js";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await authApi.login({ email, password });
      dispatch(setAuth(res.data));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="w-full max-w-md bg-[#1a1a1a] p-8 rounded-2xl shadow-2xl border border-red-500/20">
        <h2 className="text-3xl font-bold mb-6 text-center text-red-500 italic">
          LOGIN
        </h2>
        {error && (
          <p className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm">
            {error}
          </p>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-xs uppercase mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full bg-[#262626] border border-gray-700 p-3 rounded-lg focus:outline-none focus:border-red-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <label className="block text-gray-400 text-xs uppercase mb-1">
              Password
            </label>

            <input
              type={showPassword ? "text" : "password"}
              className="w-full bg-[#262626] border border-gray-700 p-3 pr-12 rounded-lg focus:outline-none focus:border-red-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all cursor-pointer active:scale-[0.98]">
            LOGIN
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-red-500 hover:text-red-400 transition-colors cursor-pointer"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

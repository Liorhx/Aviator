import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { authApi } from "../services/api.js";
import { setAuth } from "../redux/store.js";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
      return setError("Please enter a valid email");
    }

    // Password validation
    if (password.length < 8) {
      return setError("Password must be at least 8 characters long");
    }

    // Must contain uppercase letter
    if (!/[A-Z]/.test(password)) {
      return setError("Password must contain at least one uppercase letter");
    }

    // Must contain lowercase letter
    if (!/[a-z]/.test(password)) {
      return setError("Password must contain at least one lowercase letter");
    }

    // Must contain number
    if (!/[0-9]/.test(password)) {
      return setError("Password must contain at least one number");
    }

    // Must contain special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return setError("Password must contain at least one special character");
    }

    try {
      const res = await authApi.register({
        username,
        email,
        password,
      });

      dispatch(setAuth(res.data));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="w-full max-w-md bg-[#1a1a1a] p-8 rounded-2xl shadow-2xl border border-red-500/20">
        <h2 className="text-3xl font-bold mb-6 text-center text-red-500 italic">
          REGISTER
        </h2>
        {error && (
          <p className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm">
            {error}
          </p>
        )}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-xs uppercase mb-1">
              Username
            </label>
            <input
              type="text"
              className="w-full bg-[#262626] border border-gray-700 p-3 rounded-lg focus:outline-none focus:border-red-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
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
          <div>
            <label className="block text-gray-400 text-xs uppercase mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full bg-[#262626] border border-gray-700 p-3 rounded-lg focus:outline-none focus:border-red-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all cursor-pointer active:scale-[0.98]">
            REGISTER
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-red-500 hover:text-red-400 transition-colors cursor-pointer"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

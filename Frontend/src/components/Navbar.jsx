import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/store.js";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Shield, Plane, Wallet } from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="h-14 border-b border-gray-800/90 bg-[#0a0a12]/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          to="/"
          className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 px-3 py-1.5 rounded-lg italic font-black text-white tracking-tighter text-sm shadow-md shadow-red-600/30 hover:brightness-110 transition-all"
        >
          <Plane size={15} className="rotate-45" />
          <span>AVIATOR</span>
        </Link>

        {user?.role === "admin" && (
          <Link
            to="/admin"
            className="flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-emerald-400 font-black tracking-widest uppercase transition-colors bg-gray-900/60 border border-gray-800 px-2.5 py-1 rounded-md"
          >
            <Shield size={12} className="text-emerald-400" />
            <span className="hidden sm:inline">Admin Panel</span>
          </Link>
        )}
      </div>

      {isAuthenticated ? (
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="flex flex-col items-end bg-[#07070d] border border-gray-800 px-3 py-1 rounded-xl">
            <span className="text-[9px] text-gray-500 uppercase font-black tracking-wider leading-none">
              Balance
            </span>
            <span className="text-emerald-400 font-mono font-bold text-xs sm:text-sm leading-tight tracking-tight">
              ${user?.balance?.toFixed(2) || "0.00"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-rose-700 border border-red-500/40 flex items-center justify-center text-xs font-black text-white shadow-inner">
              {user?.username?.substring(0, 2).toUpperCase()}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-8 h-8 rounded-lg bg-gray-900 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-gray-800 flex items-center justify-center transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 sm:gap-3 items-center">
          <Link
            to="/login"
            className="text-[11px] sm:text-xs font-bold text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 uppercase tracking-wider transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-3 sm:px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-red-600/30"
          >
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}

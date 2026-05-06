import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/store.js";
import { Link, useNavigate } from "react-router-dom";
import { User as UserIcon, LogOut, Wallet, Shield } from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="h-14 border-b border-gray-800 bg-[#0a0a12] px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Link to="/" className="bg-red-600 px-3 py-1 rounded italic font-black text-white tracking-tighter text-sm">AVIATOR</Link>
        <div className="h-4 w-[1px] bg-gray-700"></div>
        {user?.role === "admin" && (
          <Link 
            to="/admin" 
            className="flex items-center gap-2 text-[10px] text-gray-400 hover:text-emerald-400 font-black tracking-widest uppercase transition-colors"
          >
            <Shield size={12} />
            Admin Panel
          </Link>
        )}
        <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase hidden md:inline">Network: Stable</span>
      </div>
      
      {isAuthenticated ? (
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end mr-4">
            <span className="text-[10px] text-gray-500 uppercase font-bold leading-none mb-1">Total Balance</span>
            <span className="text-emerald-400 font-mono font-bold leading-none tracking-tight">
              ${user?.balance?.toFixed(2)}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
              {user?.username?.substring(0, 2).toUpperCase()}
            </div>
            <button 
              onClick={handleLogout}
              className="text-gray-500 hover:text-white transition-all cursor-pointer hover:scale-110 active:scale-95"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 items-center">
          <Link to="/login" className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider">LOGIN</Link>
          <Link to="/register" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded text-sm font-bold transition shadow-lg shadow-emerald-900/20">REGISTER</Link>
        </div>
      )}
    </nav>
  );
}

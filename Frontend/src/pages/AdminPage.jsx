import { useState, useEffect } from "react";
import { adminApi } from "../services/api.js";
import { motion } from "motion/react";
import { Users, BarChart3, History, Shield, Wallet, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stats");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, roundsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
        adminApi.getRounds()
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setRounds(roundsRes.data);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBalance = async (userId, newBalance) => {
    try {
      await adminApi.updateUserBalance(userId, newBalance);
      setUsers(users.map(u => u._id === userId ? { ...u, balance: newBalance } : u));
    } catch (error) {
      alert("Failed to update balance");
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-gray-200 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-[#0b0b14] p-6 rounded-2xl border border-gray-800 shadow-xl">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-gray-800 rounded-xl transition-all text-gray-400 hover:text-white cursor-pointer active:scale-95 shadow-inner">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <Shield className="text-emerald-500" size={24} />
                Admin Dashboard
              </h1>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                Platform Management & Oversight
              </p>
            </div>
          </div>
          <button 
            onClick={fetchData}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            Refresh Data
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "text-blue-400" },
            { label: "Total Rounds", value: stats?.totalRounds, icon: History, color: "text-purple-400" },
            { label: "Total Bets", value: stats?.totalBets, icon: BarChart3, color: "text-emerald-400" },
            { label: "Total Volume", value: `$${stats?.totalVolume.toFixed(2)}`, icon: Wallet, color: "text-orange-400" },
          ].map((item, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={item.label}
              className="bg-[#0b0b14] p-6 rounded-2xl border border-gray-800 flex items-center gap-6 hover:border-gray-700 transition-colors"
            >
              <div className={`p-4 rounded-xl bg-gray-900/50 ${item.color}`}>
                <item.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{item.label}</p>
                <p className="text-2xl font-mono font-black text-white">{item.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex bg-[#0b0b14] p-1 rounded-2xl border border-gray-800 w-fit">
          {["stats", "users", "rounds"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === tab 
                ? "bg-emerald-500 text-white shadow-lg" 
                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-[#0b0b14] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
          {activeTab === "users" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#05050a] border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-gray-500">Username</th>
                    <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-gray-500">Email</th>
                    <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-gray-500">Balance</th>
                    <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-gray-900/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{u.username}</td>
                      <td className="px-6 py-4 text-gray-400 font-mono text-xs">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className="text-emerald-400 font-mono font-bold">${u.balance.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => {
                            const newBal = prompt("Enter new balance:", u.balance);
                            if (newBal !== null) handleUpdateBalance(u._id, parseFloat(newBal));
                          }}
                          className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-[10px] font-black uppercase tracking-tighter cursor-pointer transition-all active:scale-95"
                        >
                          Modify Balance
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "rounds" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#05050a] border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-gray-500">Round ID</th>
                    <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-gray-500">Crash Point</th>
                    <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-gray-500">Seed</th>
                    <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-gray-500 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {rounds.map(r => (
                    <tr key={r._id} className="hover:bg-gray-900/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-[10px] text-gray-400">{r._id}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-black font-mono ${
                          r.crashPoint >= 2 ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400"
                        }`}>
                          {r.crashPoint.toFixed(2)}x
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px] text-gray-600 truncate max-w-xs">{r.seed}</td>
                      <td className="px-6 py-4 text-right text-gray-500 text-[10px] font-bold">
                        {new Date(r.createdAt || r.startTime).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "stats" && (
            <div className="p-12 text-center flex flex-col items-center">
              <BarChart3 size={64} className="text-emerald-500/20 mb-6" />
              <h3 className="text-xl font-black text-white">Full Analytics Coming Soon</h3>
              <p className="text-gray-500 mt-2 max-w-sm">
                Detailed charts and temporal analysis of platform performance are currently under development.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

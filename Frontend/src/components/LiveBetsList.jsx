import { useSelector } from "react-redux";
import { User, CheckCircle2, History, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { gameApi } from "../services/api.js";

export default function LiveBetsList() {
  const { liveBets, status } = useSelector((state) => state.game);
  const [activeTab, setActiveTab] = useState("all");
  const [myBets, setMyBets] = useState([]);

  useEffect(() => {
    if (activeTab === "my") {
      gameApi.getMyBets().then((res) => {
        setMyBets(res.data);
      });
    }
  }, [activeTab, status]); // Refetch when entering tab or round ends

  return (
    <div className="flex flex-col h-full bg-[#08080e]">
      <div className="flex border-b border-gray-800 bg-[#0a0a14]">
        <button 
          onClick={() => setActiveTab("all")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
            activeTab === "all" ? "text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
          }`}
        >
          <Users size={12} />
          All Bets
        </button>
        <button 
          onClick={() => setActiveTab("my")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
            activeTab === "my" ? "text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
          }`}
        >
          <History size={12} />
          My Bets
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="text-[11px] font-bold text-gray-500 px-4 py-3 grid grid-cols-3 uppercase tracking-tighter border-b border-gray-800/50">
          <span>{activeTab === "all" ? "User" : "Time"}</span>
          <span className="text-center">Bet</span>
          <span className="text-right">Multiplier</span>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 custom-scrollbar no-scrollbar">
          {activeTab === "all" ? (
            liveBets.length === 0 ? (
              <div className="text-center py-12 opacity-10 italic text-[10px] uppercase font-bold tracking-widest">
                Awaiting next round...
              </div>
            ) : (
              liveBets.map((bet, i) => (
                <div 
                  key={`${bet.username}-${bet.betIndex || 0}-${i}`} 
                  className={`grid grid-cols-3 items-center p-2 rounded border text-[12px] font-mono transition-all duration-300 ${
                    bet.isCashout 
                    ? "bg-emerald-900/10 border-emerald-800/30 text-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.05)]" 
                    : "bg-gray-900/40 border-gray-800/50 text-gray-400"
                  }`}
                >
                  <span className="truncate pr-2 text-gray-300 font-sans font-medium">{bet.username}</span>
                  <span className="text-center opacity-70">${bet.amount || 0}</span>
                  <span className={`text-right font-bold ${bet.isCashout ? "text-emerald-400" : "text-gray-600"}`}>
                    {bet.isCashout ? `${bet.multiplier?.toFixed(2)}x` : "---"}
                  </span>
                </div>
              ))
            )
          ) : (
            myBets.length === 0 ? (
              <div className="text-center py-12 opacity-10 italic text-[10px] uppercase font-bold tracking-widest text-gray-400">
                No bets found
              </div>
            ) : (
              myBets.map((bet) => (
                <div 
                  key={bet._id || bet.id} 
                  className="grid grid-cols-3 items-center p-2 rounded border border-gray-800/50 bg-gray-900/20 text-[12px] font-mono hover:bg-gray-800/30 transition-colors"
                >
                  <span className="text-[10px] text-gray-500">
                    {new Date(bet.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}
                  </span>
                  <span className="text-center text-gray-300">${bet.amount}</span>
                  <span className={`text-right font-bold ${bet.cashoutMultiplier ? "text-emerald-400" : "text-red-400"}`}>
                    {bet.cashoutMultiplier ? `${bet.cashoutMultiplier.toFixed(2)}x` : "---"}
                  </span>
                </div>
              ))
            )
          )}
        </div>
      </div>

      <div className="p-4 bg-[#0a0a14] border-t border-gray-800">
        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-gray-500">
          <span>{activeTab === "all" ? "Live Payouts" : "Total Profit"}</span>
          <span className={`${activeTab === "all" || myBets.reduce((acc, b) => acc + (b.profit || 0), 0) >= 0 ? "text-emerald-400" : "text-red-400"} font-mono text-xs`}>
            ${(activeTab === "all" 
              ? liveBets.reduce((acc, b) => acc + (b.profit || 0), 0) 
              : myBets.reduce((acc, b) => acc + (b.profit || 0), 0)
            ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}

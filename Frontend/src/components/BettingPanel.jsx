import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateBalance } from "../redux/store.js";
import { getSocket } from "../socket/socket.js";

function SingleBetPanel({ betIndex, label }) {
  const [betAmount, setBetAmount] = useState(100);
  const [hasBet, setHasBet] = useState(false);
  const [isCashedOut, setIsCashedOut] = useState(false);
  const [mode, setMode] = useState("manual");
  const [autoCashout, setAutoCashout] = useState(2.0);
  
  const { status, multiplier } = useSelector((state) => state.game);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const socket = getSocket();

  // Reset bet state when a new round starts
  useEffect(() => {
    if (status === "WAITING") {
      setHasBet(false);
      setIsCashedOut(false);
      
      if (mode === "auto") {
        // Delay auto-bet slightly to ensure balance is updated if needed
        const timer = setTimeout(() => {
          handlePlaceBet();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [status]); 

  // Handle Auto-Cashout
  useEffect(() => {
    if (status === "FLYING" && hasBet && !isCashedOut && mode === "auto") {
      if (multiplier >= autoCashout) {
        handleCashout();
      }
    }
  }, [multiplier, status, hasBet, isCashedOut, mode, autoCashout]);

  // Listen for bet_placed and bet_result to confirm local state
  useEffect(() => {
    if (!socket) return;

    const onBetPlaced = (data) => {
      if (data.betIndex === betIndex) {
        setHasBet(true);
        setIsCashedOut(false);
      }
    };

    const onBetResult = (data) => {
      if (data.betIndex === betIndex) {
        setIsCashedOut(true);
      }
    };

    socket.on("bet_placed", onBetPlaced);
    socket.on("bet_result", onBetResult);

    return () => {
      socket.off("bet_placed", onBetPlaced);
      socket.off("bet_result", onBetResult);
    };
  }, [socket, betIndex]);

  const handlePlaceBet = () => {
    if (socket && betAmount > 0 && user && user.balance >= betAmount && !hasBet) {
      socket.emit("place_bet", { amount: betAmount, betIndex });
    }
  };

  const handleCashout = () => {
    if (socket && hasBet && !isCashedOut && status === "FLYING") {
      socket.emit("cash_out", { betIndex });
    }
  };

  const isFlying = status === "FLYING";
  const isWaiting = status === "WAITING";

  return (
    <div className="flex-1 bg-[#0b0b14]/80 rounded-2xl border border-gray-800/50 p-4 flex flex-col gap-4 shadow-2xl relative overflow-hidden group backdrop-blur-sm transition-all duration-500">
      <div className="flex justify-between items-center z-10">
        <div className="flex bg-[#05050a]/80 p-1 rounded-xl border border-gray-800/50">
          <button 
            onClick={() => setMode("manual")}
            className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              mode === "manual" 
              ? "bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]" 
              : "text-gray-500 hover:text-gray-400 hover:bg-white/5"
            }`}
          >Manual</button>
          <button 
            onClick={() => setMode("auto")}
            className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              mode === "auto" 
              ? "bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]" 
              : "text-gray-500 hover:text-gray-400 hover:bg-white/5"
            }`}
          >Auto</button>
        </div>
        <div className="flex items-center gap-2">
          {hasBet && !isCashedOut && isFlying && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
          <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">{label}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-4 items-end z-10">
        <div className="flex flex-col gap-1 sm:gap-2">
          <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">Bet Amount</label>
          <div className="relative group/inp">
            <input 
              type="number" 
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="w-full bg-[#050508] border border-gray-800 rounded-xl h-12 text-xl font-mono px-4 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none text-emerald-100 transition-all shadow-inner"
              min={1}
              disabled={hasBet && isFlying}
            />
            <div className="absolute right-2 top-2 flex flex-col gap-1">
              <button 
                onClick={() => setBetAmount(Math.max(1, Math.floor(betAmount / 2)))}
                className="bg-gray-800/80 hover:bg-gray-700 hover:text-white text-[9px] font-black px-3 py-1 rounded-md text-gray-400 transition-all cursor-pointer uppercase active:scale-95"
                disabled={hasBet && isFlying}
              >1/2</button>
              <button 
                onClick={() => setBetAmount(betAmount * 2)}
                className="bg-gray-800/80 hover:bg-gray-700 hover:text-white text-[9px] font-black px-3 py-1 rounded-md text-gray-400 transition-all cursor-pointer uppercase active:scale-95"
                disabled={hasBet && isFlying}
              >x2</button>
            </div>
          </div>
        </div>

        {mode === "auto" ? (
          <div className="flex flex-col gap-1 sm:gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
            <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">Auto Cashout</label>
            <div className="relative">
              <input 
                type="number" 
                step="0.01"
                value={autoCashout}
                onChange={(e) => setAutoCashout(Number(e.target.value))}
                className="w-full bg-[#050508] border border-gray-800 rounded-xl h-12 text-xl font-mono px-4 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none text-emerald-100 transition-all shadow-inner"
                min={1.01}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-xs font-black uppercase">x</div>
            </div>
          </div>
        ) : (
          <div className="hidden sm:block" /> // Spacer
        )}
      </div>

      <div className="z-10 mt-auto">
        {!hasBet ? (
          <button 
            onClick={handlePlaceBet}
            disabled={!isWaiting || !user || (user.balance < betAmount)}
            className={`w-full h-14 sm:h-16 rounded-xl flex flex-col items-center justify-center transition-all transform active:scale-95 border-b-4 group/btn relative overflow-hidden cursor-pointer ${
              isWaiting 
              ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_10px_40px_rgba(16,185,129,0.3)] border-emerald-700" 
              : "bg-gray-800 text-gray-600 cursor-not-allowed opacity-50 border-gray-900"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 z-10 shrink-0">{isWaiting ? "Place Your Bet" : "Waiting"}</span>
            <span className="text-xl sm:text-3xl font-black z-10 tracking-tighter shrink-0">{isWaiting ? "BET" : (isFlying ? "PREPARING..." : "CRASHED")}</span>
          </button>
        ) : (
          <button 
            onClick={handleCashout}
            disabled={!isFlying || isCashedOut}
            className={`w-full h-14 sm:h-16 rounded-xl flex flex-col items-center justify-center transition-all transform active:scale-95 border-b-4 relative overflow-hidden cursor-pointer ${
              isFlying && !isCashedOut
              ? "bg-orange-500 hover:bg-orange-400 text-white shadow-[0_10px_40px_rgba(249,115,22,0.3)] border-orange-700 animate-pulse" 
              : "bg-gray-800 text-gray-500 cursor-not-allowed border-gray-900"
            }`}
          >
            <span className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 z-10 shrink-0">
              {isCashedOut ? "Profit Secured" : (isFlying ? "Cashout" : "Bet Placed")}
            </span>
            <span className="text-xl sm:text-3xl font-black font-mono z-10 tracking-tighter shrink-0">
              {isCashedOut ? `+$${(betAmount * (multiplier - 1)).toFixed(2)}` : (isFlying ? `${multiplier.toFixed(2)}x` : "---")}
            </span>
            {isFlying && !isCashedOut && (
              <div className="absolute bottom-0 left-0 h-1 bg-white opacity-20 w-full animate-progress" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function BettingPanel() {
  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-4">
      <SingleBetPanel betIndex={0} label="Bet Control A" />
      <SingleBetPanel betIndex={1} label="Bet Control B" />
    </div>
  );
}

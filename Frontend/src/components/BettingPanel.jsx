import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateBalance } from "../redux/store.js";
import { getSocket } from "../socket/socket.js";
import { Plus, X, Lock, ArrowRight, Zap, CheckCircle2, TrendingUp } from "lucide-react";

function SingleBetPanel({ betIndex, label, onClose, canClose }) {
  const [betAmount, setBetAmount] = useState(100);
  const [hasBet, setHasBet] = useState(false);
  const [isCashedOut, setIsCashedOut] = useState(false);
  const [cashedMultiplier, setCashedMultiplier] = useState(null);
  const [mode, setMode] = useState("manual");
  const [autoCashout, setAutoCashout] = useState(2.0);

  const { status, multiplier } = useSelector((state) => state.game);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const socket = getSocket();

  // Reset bet state when a new round starts
  useEffect(() => {
    if (status === "WAITING") {
      setHasBet(false);
      setIsCashedOut(false);
      setCashedMultiplier(null);

      if (mode === "auto" && isAuthenticated && user && user.balance >= betAmount) {
        const timer = setTimeout(() => {
          handlePlaceBet();
        }, 400);
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

  // Socket confirmation listeners
  useEffect(() => {
    if (!socket) return;

    const onBetPlaced = (data) => {
      if ((data.betIndex || 0) === betIndex) {
        setHasBet(true);
        setIsCashedOut(false);
      }
    };

    const onBetResult = (data) => {
      if ((data.betIndex || 0) === betIndex) {
        setIsCashedOut(true);
        setCashedMultiplier(data.multiplier || multiplier);
      }
    };

    socket.on("bet_placed", onBetPlaced);
    socket.on("bet_result", onBetResult);

    return () => {
      socket.off("bet_placed", onBetPlaced);
      socket.off("bet_result", onBetResult);
    };
  }, [socket, betIndex, multiplier]);

  const handlePlaceBet = () => {
    // If not logged in, take the user directly to login
    if (!isAuthenticated || !user) {
      navigate("/login");
      return;
    }

    if (socket && betAmount > 0 && user.balance >= betAmount && !hasBet) {
      socket.emit("place_bet", { amount: betAmount, betIndex });
    }
  };

  const handleCashout = () => {
    if (socket && hasBet && !isCashedOut && status === "FLYING") {
      socket.emit("cash_out", { betIndex });
    }
  };

  const quickAmounts = [10, 50, 100, 200, 500];
  const quickMultipliers = [1.2, 1.5, 2.0, 3.0, 5.0];

  const isFlying = status === "FLYING";
  const isWaiting = status === "WAITING";
  const isCrashed = status === "CRASHED";

  return (
    <div className="flex-1 bg-gradient-to-b from-[#10101b]/95 to-[#090912]/95 rounded-2xl border border-gray-800/80 p-3.5 sm:p-4 flex flex-col gap-3 shadow-xl relative overflow-hidden backdrop-blur-md transition-all">
      {/* Top Controls: Mode Switch & Label / Close */}
      <div className="flex justify-between items-center z-10">
        <div className="flex items-center gap-1.5 bg-[#05050a] p-1 rounded-xl border border-gray-800">
          <button
            type="button"
            onClick={() => setMode("manual")}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              mode === "manual"
                ? "bg-emerald-500/20 text-emerald-400 shadow-[inset_0_0_8px_rgba(16,185,129,0.2)] border border-emerald-500/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Manual
          </button>
          <button
            type="button"
            onClick={() => setMode("auto")}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              mode === "auto"
                ? "bg-emerald-500/20 text-emerald-400 shadow-[inset_0_0_8px_rgba(16,185,129,0.2)] border border-emerald-500/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Auto
          </button>
        </div>

        <div className="flex items-center gap-2">
          {hasBet && !isCashedOut && isFlying && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              LIVE
            </div>
          )}
          <span className="text-[10px] font-mono font-bold uppercase text-gray-500 tracking-wider">
            {label}
          </span>
          {canClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-6 h-6 rounded-lg bg-gray-800/80 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-gray-400 transition-colors cursor-pointer"
              title="Remove secondary bet panel"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Inputs Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 z-10 items-stretch">
        {/* Bet Amount Input */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
            <span>Bet Amount</span>
            {user && (
              <span className="text-gray-500 font-mono text-[9px]">
                Bal: ${user.balance?.toFixed(2)}
              </span>
            )}
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-gray-500 font-mono font-bold text-sm">$</span>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
              className="w-full bg-[#07070e] border border-gray-800 rounded-xl h-11 pl-7 pr-24 font-mono text-base font-bold text-white focus:outline-none focus:border-emerald-500/50 shadow-inner"
              min={1}
              disabled={hasBet && isFlying}
            />
            {/* 1/2 and 2x Quick Actions */}
            <div className="absolute right-1.5 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setBetAmount(Math.max(1, Math.floor(betAmount / 2)))}
                disabled={hasBet && isFlying}
                className="bg-gray-800/80 hover:bg-gray-700 text-[10px] font-bold text-gray-300 px-2 py-1 rounded-md transition-colors cursor-pointer disabled:opacity-40"
              >
                ½
              </button>
              <button
                type="button"
                onClick={() =>
                  setBetAmount(user ? Math.min(user.balance || betAmount * 2, betAmount * 2) : betAmount * 2)
                }
                disabled={hasBet && isFlying}
                className="bg-gray-800/80 hover:bg-gray-700 text-[10px] font-bold text-gray-300 px-2 py-1 rounded-md transition-colors cursor-pointer disabled:opacity-40"
              >
                2×
              </button>
            </div>
          </div>

          {/* Quick Amount Chips */}
          <div className="flex gap-1.5 flex-wrap">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setBetAmount(amt)}
                disabled={hasBet && isFlying}
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                  betAmount === amt
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : "bg-gray-900/60 border-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>
        </div>

        {/* Auto Cashout or Quick Action Panel */}
        {mode === "auto" ? (
          <div className="flex flex-col gap-1.5 animate-in fade-in duration-200">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
              Auto Cashout (x)
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                step="0.1"
                min={1.05}
                value={autoCashout}
                onChange={(e) => setAutoCashout(Math.max(1.05, Number(e.target.value)))}
                className="w-full bg-[#07070e] border border-gray-800 rounded-xl h-11 px-3 pr-8 font-mono text-base font-bold text-white focus:outline-none focus:border-emerald-500/50 shadow-inner"
              />
              <span className="absolute right-3 text-gray-500 font-mono font-bold text-sm">×</span>
            </div>

            {/* Quick Multiplier Presets */}
            <div className="flex gap-1.5 flex-wrap">
              {quickMultipliers.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setAutoCashout(m)}
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                    autoCashout === m
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      : "bg-gray-900/60 border-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  {m.toFixed(1)}×
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-end">
            <div className="bg-[#07070e]/80 border border-gray-800/60 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                Target Return
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {isFlying
                  ? `+$${(betAmount * Math.max(0, multiplier - 1)).toFixed(2)}`
                  : `$${(betAmount * 2).toFixed(2)} (2×)`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Action Button */}
      <div className="z-10 mt-auto pt-1">
        {!isAuthenticated || !user ? (
          /* Unauthenticated state: prominent CTA leading directly to Login */
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full h-13 sm:h-14 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black shadow-lg shadow-red-600/25 border-b-4 border-red-800 transition-all cursor-pointer active:scale-[0.98] group"
          >
            <Lock size={16} className="text-red-200 group-hover:scale-110 transition-transform" />
            <span className="text-xs sm:text-sm tracking-wider uppercase font-black">
              LOGIN TO BET
            </span>
            <ArrowRight size={16} className="text-red-200 group-hover:translate-x-1 transition-transform" />
          </button>
        ) : !hasBet ? (
          /* Waiting phase: Ready to bet */
          <button
            type="button"
            onClick={handlePlaceBet}
            disabled={!isWaiting || user.balance < betAmount}
            className={`w-full h-13 sm:h-14 rounded-xl flex flex-col items-center justify-center transition-all border-b-4 active:scale-[0.98] cursor-pointer group ${
              !isWaiting
                ? "bg-gray-800 text-gray-500 cursor-not-allowed border-gray-900"
                : user.balance < betAmount
                ? "bg-red-900/40 text-red-400 border-red-950 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 border-emerald-800"
            }`}
          >
            <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none mb-0.5 opacity-90">
              {user.balance < betAmount
                ? "INSUFFICIENT BALANCE"
                : isWaiting
                ? "PLACE BET"
                : isFlying
                ? "ROUND IN PROGRESS"
                : "ROUND ENDED"}
            </span>
            <span className="text-lg sm:text-xl font-black font-mono leading-none tracking-tight">
              {user.balance < betAmount
                ? `Need $${betAmount}`
                : isWaiting
                ? `BET $${betAmount}`
                : isFlying
                ? "WAITING NEXT"
                : "CRASHED"}
            </span>
          </button>
        ) : (
          /* Bet Placed: Cashout or Secured */
          <button
            type="button"
            onClick={handleCashout}
            disabled={!isFlying || isCashedOut}
            className={`w-full h-13 sm:h-14 rounded-xl flex flex-col items-center justify-center transition-all border-b-4 active:scale-[0.98] ${
              isCashedOut
                ? "bg-emerald-950/80 border-emerald-800 text-emerald-300 cursor-default"
                : isFlying
                ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-xl shadow-orange-500/30 border-orange-700 animate-pulse cursor-pointer"
                : "bg-gray-800 text-gray-400 border-gray-900 cursor-not-allowed"
            }`}
          >
            <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none mb-0.5">
              {isCashedOut
                ? "PROFIT SECURED"
                : isFlying
                ? "CASH OUT NOW"
                : "BET ACCEPTED"}
            </span>
            <span className="text-lg sm:text-xl font-black font-mono leading-none tracking-tight">
              {isCashedOut
                ? `+$${(betAmount * ((cashedMultiplier || multiplier) - 1)).toFixed(2)} (${(cashedMultiplier || multiplier).toFixed(2)}x)`
                : isFlying
                ? `CASHOUT $${(betAmount * multiplier).toFixed(2)} (${multiplier.toFixed(2)}x)`
                : `BET $${betAmount} READY`}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function BettingPanel() {
  const [showSecondBet, setShowSecondBet] = useState(false);

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Header bar for betting area: Option to add second bet */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <Zap size={13} className="text-emerald-400" />
            Betting Console
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowSecondBet(!showSecondBet)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
            showSecondBet
              ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
              : "bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
          }`}
        >
          {showSecondBet ? (
            <>
              <X size={12} />
              Close 2nd Bet
            </>
          ) : (
            <>
              <Plus size={12} className="text-emerald-400" />
              Add 2nd Bet
            </>
          )}
        </button>
      </div>

      {/* Betting Panels Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 transition-all">
        {/* Primary Bet Panel - Always visible */}
        <SingleBetPanel
          betIndex={0}
          label="Bet 1"
          canClose={false}
        />

        {/* Secondary Bet Panel - Cleanly revealed only when toggled */}
        {showSecondBet && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <SingleBetPanel
              betIndex={1}
              label="Bet 2"
              canClose={true}
              onClose={() => setShowSecondBet(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

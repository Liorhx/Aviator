import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  setGameState,
  addHistory,
  addLiveBet,
  clearLiveBets,
  updateBalance,
} from "../redux/store.js";
import { initiateSocket, disconnectSocket } from "../socket/socket.js";
import MultiplierDisplay from "../components/MultiplierDisplay.jsx";
import BettingPanel from "../components/BettingPanel.jsx";
import HistoryList from "../components/HistoryList.jsx";
import LiveBetsList from "../components/LiveBetsList.jsx";
import { gameApi, authApi } from "../services/api.js";
import { Lock, Sparkles, Shield } from "lucide-react";

export default function GamePage() {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const socket = initiateSocket(token);

    socket.on("connect", () => {
      socket.emit("join_room", { token });
    });

    socket.on("game_state", (data) => {
      dispatch(setGameState(data));
    });

    socket.on("round_waiting", (data) => {
      dispatch(
        setGameState({
          status: "WAITING",
          countdown: data.countdown,
          multiplier: 1.0,
        })
      );
    });

    socket.on("round_waiting_start", (data) => {
      dispatch(
        setGameState({
          status: "WAITING",
          countdown: data.countdown,
          multiplier: 1.0,
        })
      );
      dispatch(clearLiveBets());
    });

    socket.on("round_started", () => {
      dispatch(setGameState({ status: "FLYING" }));
    });

    socket.on("multiplier_tick", (data) => {
      dispatch(setGameState({ multiplier: data.multiplier }));
    });

    socket.on("round_crashed", (data) => {
      dispatch(setGameState({ status: "CRASHED", multiplier: data.crashAt }));
      dispatch(addHistory({ crashPoint: data.crashAt, id: Date.now() }));
    });

    socket.on("player_bet", (data) => {
      dispatch(addLiveBet(data));
    });

    socket.on("player_cashout", (data) => {
      dispatch(addLiveBet({ ...data, isCashout: true }));
    });

    socket.on("bet_placed", (data) => {
      dispatch(updateBalance(data.newBalance));
    });

    socket.on("bet_result", (data) => {
      dispatch(updateBalance(data.newBalance));
    });

    // Initial history fetch
    gameApi
      .getHistory()
      .then((res) => {
        dispatch(setGameState({ history: res.data || [] }));
      })
      .catch((err) => {
        console.warn("Could not fetch game history:", err.message);
      });

    // Initial profile fetch only if authenticated
    if (token) {
      authApi
        .getProfile()
        .then((res) => {
          if (res.data?.balance !== undefined) {
            dispatch(updateBalance(res.data.balance));
          }
        })
        .catch((err) => {
          console.warn("Could not fetch user profile:", err.message);
        });
    }

    return () => {
      disconnectSocket();
    };
  }, [dispatch, token]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#050508] text-white">
      {/* Guest Notification Banner */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-red-950/60 via-purple-950/50 to-red-950/60 border-b border-red-500/20 px-4 py-1.5 flex items-center justify-between text-xs z-30 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-gray-300 font-medium text-[11px] sm:text-xs">
              <strong className="text-white">Spectator Mode:</strong> You're watching the live round. Login to place bets and cash out!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-red-400 hover:text-white px-2.5 py-1 rounded-md transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-[10px] sm:text-xs font-black uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-md transition-colors shadow-md shadow-red-600/30"
            >
              Register
            </Link>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Live Bets - Hidden on tablets and below for more room */}
        <aside className="w-64 bg-[#08080e] border-r border-gray-800 flex flex-col hidden xl:flex shrink-0">
          <LiveBetsList />
        </aside>

        {/* Main Game Stage */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* History Strip */}
          <div className="h-10 bg-[#0a0a14] border-b border-gray-800 flex items-center px-4 overflow-x-auto custom-scrollbar no-scrollbar gap-2 z-30 shrink-0">
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mr-2 whitespace-nowrap hidden sm:inline">
              History
            </span>
            <HistoryList />
          </div>

          {/* Display & Animation Stage */}
          <div className="flex-1 min-h-[260px] relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')]">
            <div
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(#2d3748 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <MultiplierDisplay />
          </div>

          {/* Clean Betting Console Section */}
          <div className="bg-[#090912] border-t border-gray-800/90 p-2 sm:p-3 md:p-4 flex flex-col z-20 shrink-0">
            <BettingPanel />
          </div>

          {/* Footer Info Strip */}
          <div className="h-8 bg-black/60 backdrop-blur-md flex items-center px-4 sm:px-6 justify-between text-[10px] text-gray-500 border-t border-white/5 shrink-0 mt-auto">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-bold uppercase text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Provably Fair
              </span>
              <span className="font-mono text-gray-600 hidden sm:inline">
                Algorithm: SHA-256 HMAC
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-gray-500 uppercase tracking-widest hidden md:inline">
                Live Server
              </span>
              <span className="text-gray-400 font-bold uppercase">
                Aviator v2.0
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

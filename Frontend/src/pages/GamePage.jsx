import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setGameState, addHistory, addLiveBet, clearLiveBets, updateBalance } from "../redux/store.js";
import { initiateSocket, disconnectSocket } from "../socket/socket.js";
import MultiplierDisplay from "../components/MultiplierDisplay.jsx";
import BettingPanel from "../components/BettingPanel.jsx";
import HistoryList from "../components/HistoryList.jsx";
import LiveBetsList from "../components/LiveBetsList.jsx";
import { gameApi, authApi } from "../services/api.js";

export default function GamePage() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const socket = initiateSocket(token);

    socket.on("connect", () => {
      socket.emit("join_room", { token });
    });

    socket.on("game_state", (data) => {
      dispatch(setGameState(data));
    });

    socket.on("round_waiting", (data) => {
      dispatch(setGameState({ status: "WAITING", countdown: data.countdown, multiplier: 1.0 }));
    });

    socket.on("round_waiting_start", (data) => {
      dispatch(setGameState({ status: "WAITING", countdown: data.countdown, multiplier: 1.0 }));
      dispatch(clearLiveBets());
    });

    socket.on("round_started", (data) => {
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

    // Initial history and profile fetch
    gameApi.getHistory().then(res => {
      dispatch(setGameState({ history: res.data }));
    });

    authApi.getProfile().then(res => {
      dispatch(updateBalance(res.data.balance));
    });

    return () => {
      disconnectSocket();
    };
  }, [dispatch, token]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#050508] text-white">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Live Bets - Hidden on tablets and below for more room */}
        <aside className="w-64 bg-[#08080e] border-r border-gray-800 flex flex-col hidden xl:flex">
          <LiveBetsList />
        </aside>

        {/* Main Game Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* History Strip */}
          <div className="h-10 bg-[#0a0a14] border-b border-gray-800 flex items-center px-4 overflow-x-auto custom-scrollbar no-scrollbar gap-2 z-30 shrink-0">
            <span className="text-[10px] text-gray-500 font-bold uppercase mr-2 whitespace-nowrap hidden sm:inline">History</span>
            <HistoryList />
          </div>

          {/* Display & Animation area: Takes remaining space but has a minimum height */}
          <div className="flex-1 min-h-[300px] relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')]">
             <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2d3748 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
             <MultiplierDisplay />
          </div>

          {/* Betting Panel area: Adjusts height based on screen size, scrolls if needed */}
          <div className="h-auto md:h-[40%] min-h-[220px] bg-[#0a0a14] border-t border-gray-800 p-3 md:p-4 flex flex-col z-20 overflow-y-auto shrink-0 pb-10 md:pb-4">
            <BettingPanel />
          </div>

          {/* Footer Info Strip */}
          <div className="h-8 bg-black/50 backdrop-blur-md flex items-center px-6 justify-between text-[10px] text-gray-500 border-t border-white/5 shrink-0 mt-auto">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 font-bold uppercase"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Provably Fair</span>
              <span className="font-mono hidden sm:inline">Seed: 8a73...9b21</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono uppercase tracking-widest hidden md:inline">Round: #1,204,952</span>
              <span className="text-gray-400 hover:text-white cursor-pointer transition-colors uppercase font-bold">Help & Rules</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

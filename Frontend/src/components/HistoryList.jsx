import { useSelector } from "react-redux";
import { motion } from "motion/react";

export default function HistoryList() {
  const { history } = useSelector((state) => state.game);

  return (
    <div className="flex gap-2 items-center overflow-x-auto no-scrollbar scroll-smooth">
      {history.map((round, i) => (
        <motion.div
           key={round._id || round.id || i}
           initial={{ scale: 0, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className={`px-2 py-0.5 rounded-full border text-[11px] font-mono whitespace-nowrap transition-all hover:scale-110 cursor-default ${
             round.crashPoint < 2 
             ? "bg-red-900/30 border-red-800/50 text-red-400" 
             : round.crashPoint < 10
             ? "bg-blue-900/30 border-blue-800/50 text-blue-400"
             : "bg-emerald-900/30 border-emerald-800/50 text-emerald-400"
           }`}
        >
          {round.crashPoint.toFixed(2)}x
        </motion.div>
      ))}
    </div>
  );
}

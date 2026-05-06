import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "motion/react";
import { Plane, Rocket, Zap } from "lucide-react";

export default function MultiplierDisplay() {
  const { multiplier, status, countdown } = useSelector((state) => state.game);

  // Dynamic intensity based on multiplier
  const intensity = Math.min(10, 1 + (multiplier - 1) * 0.5);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <AnimatePresence mode="wait">
        {status === "WAITING" && (
          <motion.div 
            key="waiting"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center"
          >
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.3em] mb-4">Round starts in</p>
            <h2 className="text-7xl font-black text-white tracking-tighter">{countdown}s</h2>
            <div className="mt-6 w-48 h-1 bg-gray-900 rounded-full overflow-hidden">
               <motion.div 
                className="h-full bg-emerald-500"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
               />
            </div>
          </motion.div>
        )}

        {status === "FLYING" && (
          <motion.div 
            key="flying"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              x: (multiplier > 2 ? [0, Math.random() * intensity - (intensity/2), 0] : 0),
              y: (multiplier > 2 ? [0, Math.random() * intensity - (intensity/2), 0] : 0),
            }}
            transition={{
              x: { duration: 0.05, repeat: Infinity },
              y: { duration: 0.05, repeat: Infinity },
            }}
            exit={{ 
              opacity: [1, 1, 0.5, 0],
              filter: ["blur(0px)", "blur(10px)", "blur(20px)"],
              transition: { duration: 0.5 }
            }}
            className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
          >
            {/* Ambient Atmosphere */}
            <div className={`absolute inset-0 bg-radial-at-bl from-red-500/10 via-transparent to-transparent opacity-50 transition-opacity duration-1000 ${multiplier > 10 ? 'opacity-80' : 'opacity-40'}`}></div>
            
            <motion.div 
              animate={{ 
                scale: [1, 1 + (multiplier - 1) * 0.005],
                y: [0, Math.sin(multiplier * 5) * (1 + multiplier * 0.5)],
                rotate: [0, (Math.random() - 0.5) * (multiplier * 0.2)]
              }}
              className="relative z-20 text-center -translate-y-12"
            >
              <h1 className="text-[70px] sm:text-[100px] font-black text-white italic leading-none tracking-tighter drop-shadow-[0_0_60px_rgba(255,255,255,0.3)] lg:text-[140px]">
                {multiplier.toFixed(2)}x
              </h1>
              <div className="flex flex-col items-center gap-2">
                <div className="bg-emerald-500/20 border border-emerald-400/40 px-6 sm:px-8 py-2 sm:py-3 rounded-full mx-auto w-max flex items-center gap-2 sm:gap-3 backdrop-blur-md shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <Zap size={12} className="text-emerald-400 animate-pulse sm:w-3.5 sm:h-3.5" />
                  <span className="text-emerald-400 font-black uppercase tracking-[0.4em] text-[9px] sm:text-[11px]">Altitude Climbing</span>
                </div>
                {multiplier > 10 && (
                   <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] text-orange-400 font-bold uppercase tracking-widest animate-bounce"
                   >
                    Extreme Speed!
                   </motion.span>
                )}
              </div>
            </motion.div>

            {/* Cinematic background elements (Clouds/Vapors) */}
            <div className="absolute inset-0 pointer-events-none z-10">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`cloud-${i}`}
                  className="absolute bg-white/5 rounded-full blur-3xl"
                  style={{
                    width: Math.random() * 500 + 300,
                    height: Math.random() * 150 + 50,
                    top: `${Math.random() * 100}%`,
                    left: "120%",
                  }}
                  animate={{ x: "-250vw" }}
                  transition={{
                    duration: (8 / (1 + multiplier * 0.2)) + Math.random() * 4,
                    repeat: Infinity,
                    ease: "linear",
                    delay: Math.random() * 10
                  }}
                />
              ))}
            </div>

            {/* The Flight Path SVG */}
            <svg 
              viewBox="0 0 1000 600"
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0"
            >
              <defs>
                <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
                  <stop offset="60%" stopColor="#ef4444" stopOpacity="0.2" />
                  <stop offset="90%" stopColor="#f59e0b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Dynamic Horizontal Trail */}
              <motion.path 
                d="M -200 450 Q 300 440 800 430 T 2000 420" 
                fill="none" 
                stroke="url(#trailGradient)" 
                strokeWidth={5 + multiplier * 0.4} 
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                filter="url(#glow)"
              />

              {/* The Plane Group - Smaller and Horizontal */}
              <motion.g
                initial={{ x: -200, y: 450, rotate: 0 }}
                animate={{ 
                  x: [-100, 750 + Math.min(250, multiplier * 15)], 
                  y: [450, 440 - Math.min(20, multiplier * 0.5)],
                  rotate: [-2, 2, -1],
                }}
                exit={{ 
                  x: 3000, 
                  y: 350, 
                  rotate: -10,
                  scale: 0.1,
                  transition: { duration: 0.35, ease: "circIn" } 
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Reactive Vibration */}
                <motion.g
                  animate={{
                    x: [0, (multiplier > 1.2 ? (Math.random() - 0.5) * (intensity * 1.5) : 0)],
                    y: [0, (multiplier > 1.2 ? (Math.random() - 0.5) * (intensity * 1.5) : 0)],
                  }}
                  transition={{ duration: 0.03, repeat: Infinity }}
                >
                  <g filter="url(#glow)">
                    <Rocket 
                      size={48} 
                      className="text-white fill-red-600 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] transform rotate-90" 
                    />
                  </g>
                  
                  {/* Horizontal Engine Flame */}
                  <motion.g transform="translate(-10, 24) rotate(180)">
                    <motion.path
                      d="M0,0 Q15,-6 30,0 Q15,6 0,0"
                      fill="#ffffff"
                      animate={{ 
                        scaleX: [1, 2 + (multiplier * 0.2), 1],
                        opacity: [0.9, 1, 0.9],
                      }}
                      transition={{ duration: 0.05, repeat: Infinity }}
                    />
                    <motion.path
                      d="M0,0 Q10,-4 20,0 Q10,4 0,0"
                      fill="#f59e0b"
                      animate={{ 
                        scaleX: [1.2, 2.8 + (multiplier * 0.3), 1.2],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{ duration: 0.07, repeat: Infinity }}
                    />
                  </motion.g>

                  {/* Sonic Boom Rings */}
                  {multiplier > 5 && [...Array(3)].map((_, i) => (
                    <motion.circle
                      key={`boom-${i}`}
                      cx="0" cy="0" r="20"
                      stroke="white"
                      strokeWidth="2"
                      fill="none"
                      initial={{ scale: 0.5, opacity: 0.8 }}
                      animate={{ scale: 4, opacity: 0 }}
                      transition={{ 
                        duration: 0.5, 
                        repeat: Infinity, 
                        delay: i * 0.15,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </motion.g>
              </motion.g>
            </svg>
            
            {/* Hyperspace Speed Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
               {[...Array(40)].map((_, i) => (
                 <motion.div
                  key={i}
                  className="absolute h-[2px] bg-gradient-to-r from-transparent via-white to-transparent"
                  initial={{ x: "-100%", opacity: 0 }}
                  animate={{ 
                    x: "250vw", 
                    opacity: [0, 0.5, 0],
                    width: [50, 400 + (multiplier * 10), 50]
                  }}
                  transition={{ 
                    duration: (0.2 / (1 + multiplier * 0.2)) + Math.random() * 0.1, 
                    repeat: Infinity, 
                    delay: Math.random() * 2,
                    ease: "linear" 
                  }}
                  style={{ top: `${Math.random() * 100}%` }}
                 />
               ))}
            </div>
          </motion.div>
        )}

        {status === "CRASHED" && (
          <motion.div 
            key="crashed"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: [1, 1.1, 1], opacity: 1 }}
            className="text-center px-4"
          >
            <div className="relative inline-block">
              <h2 className="text-4xl sm:text-7xl font-black text-red-600 italic tracking-tighter mb-2 drop-shadow-[0_0_30px_rgba(225,29,72,0.6)]">ROUND CRASHED!</h2>
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-10 sm:-top-12 -right-6 sm:-right-12 bg-white text-black text-[8px] sm:text-[10px] font-black px-3 sm:px-4 py-1 sm:py-2 rounded-full transform rotate-12 shadow-2xl"
              >
                BOOM!
              </motion.div>
            </div>
            <p className="text-3xl sm:text-5xl font-black text-white opacity-60 font-mono tracking-tighter">{multiplier.toFixed(2)}x</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

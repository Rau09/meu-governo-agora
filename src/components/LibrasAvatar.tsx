import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, RotateCcw, FastForward } from "lucide-react";
import { useLibras } from "@/lib/libras-translator";

export function LibrasAvatar() {
  const { 
    isInterpreterVisible, 
    toggleInterpreter, 
    isPaused, 
    setPaused, 
    playbackSpeed, 
    setSpeed,
    currentGloss 
  } = useLibras();

  if (!isInterpreterVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.8 }}
        className="fixed bottom-24 right-4 z-50 w-48 overflow-hidden rounded-3xl bg-white shadow-2xl border border-primary/10"
      >
        <div className="relative aspect-[3/4] bg-slate-50 flex flex-col">
          <div className="absolute top-2 right-2 z-20">
            <button
              onClick={toggleInterpreter}
              className="p-1.5 rounded-full bg-black/5 hover:bg-black/10 text-muted-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 relative overflow-hidden flex items-end justify-center p-4">
            <svg viewBox="0 0 120 150" className="relative w-full h-full z-10 drop-shadow-sm">
              {/* Cabeça */}
              <circle cx="60" cy="35" r="18" fill="#F5D5B8" stroke="#D4A373" strokeWidth="1" />
              
              {/* Cabelo */}
              <path d="M45 25 Q60 15 75 25 Q75 35 60 40 Q45 35 45 25" fill="#4A3728" />
              
              {/* Cabelo Marrom */}
              <path d="M42 28 Q60 12 78 28 L78 35 Q60 25 42 35 Z" fill="#4A3728" />
              <path d="M42 28 Q40 35 45 42" fill="none" stroke="#4A3728" strokeWidth="2" strokeLinecap="round" />
              <path d="M78 28 Q80 35 75 42" fill="none" stroke="#4A3728" strokeWidth="2" strokeLinecap="round" />

              {/* Rosto */}
              <circle cx="53" cy="35" r="1.5" fill="#333" />
              <circle cx="67" cy="35" r="1.5" fill="#333" />
              <path d="M60 37 L60 40" fill="none" stroke="#D4A373" strokeWidth="1" strokeLinecap="round" />
              <path d="M54 44 Q60 48 66 44" fill="none" stroke="#D4A373" strokeWidth="1.2" strokeLinecap="round" />

              {/* Tronco */}
              <path d="M35 60 Q60 55 85 60 L90 130 Q60 135 30 130 Z" fill="#F5D5B8" stroke="#D4A373" strokeWidth="1" />

              {/* Roupas Verdes */}
              <path d="M35 60 Q60 55 85 60 L88 95 Q60 100 32 95 Z" fill="#22C55E" />
              <path d="M38 95 L42 128 L78 128 L82 95 Z" fill="#16A34A" />

              {/* Braços e mãos articuladas sobrepostos */}
              <motion.g
                animate={!isPaused ? { 
                  rotate: [0, -10, 10, 0],
                  y: [0, -2, 2, 0]
                } : {}}
                transition={{ repeat: Infinity, duration: 2 / playbackSpeed }}
                style={{ originX: "60px", originY: "60px" }}
              >
                <path d="M35 65 L20 100" stroke="#F5D5B8" strokeWidth="8" strokeLinecap="round" />
                <path d="M85 65 L100 100" stroke="#F5D5B8" strokeWidth="8" strokeLinecap="round" />
              </motion.g>
            </svg>
          </div>

          <div className="bg-primary/5 p-3 space-y-2">
            <div className="h-6 flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider truncate">
                {currentGloss || "Aguardando..."}
              </span>
            </div>
            
            <div className="flex items-center justify-center gap-4 border-t border-primary/10 pt-2">
              <button 
                onClick={() => setPaused(!isPaused)}
                className="p-1 text-primary hover:scale-110 transition-transform"
              >
                {isPaused ? <Play className="size-4 fill-current" /> : <Pause className="size-4 fill-current" />}
              </button>
              <button className="p-1 text-primary hover:scale-110 transition-transform">
                <RotateCcw className="size-4" />
              </button>
              <button 
                onClick={() => setSpeed(playbackSpeed === 1.25 ? 0.75 : playbackSpeed + 0.25)}
                className="flex items-center text-[9px] font-black text-primary px-1.5 py-0.5 rounded bg-primary/10"
              >
                {playbackSpeed}x
              </button>
            </div>
          </div>
        </div>
        <div className="bg-primary px-3 py-1.5 text-center">
          <p className="text-[8px] font-bold text-white uppercase tracking-[0.2em]">Intérprete NexLine</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

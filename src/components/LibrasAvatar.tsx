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
              
              {/* Personagem Careca */}




              {/* Rosto Simétrico e Centralizado */}
              <circle cx="51.5" cy="35" r="1.5" fill="#333" />
              <circle cx="68.5" cy="35" r="1.5" fill="#333" />
              <path d="M60 37 L60 40" fill="none" stroke="#D4A373" strokeWidth="1" strokeLinecap="round" />
              {/* Sorriso Menor e Delicado */}
              <path d="M55 45 Q60 48 65 45" fill="none" stroke="#D4A373" strokeWidth="1.2" strokeLinecap="round" />
              {/* Covinhas Simétricas */}
              <circle cx="48" cy="44" r="0.5" fill="#D4A373" opacity="0.4" />
              <circle cx="72" cy="44" r="0.5" fill="#D4A373" opacity="0.4" />


              {/* Tronco */}
              <path d="M35 60 Q60 55 85 60 L90 130 Q60 135 30 130 Z" fill="#F5D5B8" stroke="#D4A373" strokeWidth="1" />

              {/* Roupas Verde e Azul */}
              <path d="M35 60 Q60 55 85 60 L88 130 Q60 135 32 130 Z" fill="#3B82F6" stroke="#22C55E" strokeWidth="0.5" />
              <path d="M35 60 Q60 55 85 60 L88 95 Q60 100 32 95 Z" fill="#22C55E" />
              <path d="M50 60 L60 95 L70 60" fill="#3B82F6" opacity="0.3" /> {/* Detalhe gola V Azul */}



              {/* Braços e mãos articuladas funcionais e conectados */}
              <g>
                {/* Braço Esquerdo */}
                <motion.g
                  animate={!isPaused ? { 
                    rotate: [0, -20, 20, 0],
                  } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 / playbackSpeed, ease: "easeInOut" }}
                  style={{ originX: "35px", originY: "65px" }}
                >
                  <path d="M35 65 L25 90" stroke="#F5D5B8" strokeWidth="6" strokeLinecap="round" />
                  <path d="M25 90 L30 110" stroke="#F5D5B8" strokeWidth="6" strokeLinecap="round" />
                  {/* Mão Esquerda Proporcional */}
                  <g transform="translate(30, 110) rotate(15)">
                    <circle r="4" fill="#F5D5B8" />
                    <path d="M-2 0 L-3 5 M0 0 L0 6 M2 0 L3 5 M4 0 L5 4 M-4 0 L-5 3" stroke="#F5D5B8" strokeWidth="1.2" strokeLinecap="round" />
                  </g>
                </motion.g>

                {/* Braço Direito */}
                <motion.g
                  animate={!isPaused ? { 
                    rotate: [0, 20, -20, 0],
                  } : {}}
                  transition={{ repeat: Infinity, duration: 1.2 / playbackSpeed, ease: "easeInOut" }}
                  style={{ originX: "85px", originY: "65px" }}
                >
                  <path d="M85 65 L95 90" stroke="#F5D5B8" strokeWidth="6" strokeLinecap="round" />
                  <path d="M95 90 L90 110" stroke="#F5D5B8" strokeWidth="6" strokeLinecap="round" />
                  {/* Mão Direita Proporcional */}
                  <g transform="translate(90, 110) rotate(-15)">
                    <circle r="4" fill="#F5D5B8" />
                    <path d="M-2 0 L-3 5 M0 0 L0 6 M2 0 L3 5 M4 0 L5 4 M-4 0 L-5 3" stroke="#F5D5B8" strokeWidth="1.2" strokeLinecap="round" />
                  </g>
                </motion.g>
              </g>
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

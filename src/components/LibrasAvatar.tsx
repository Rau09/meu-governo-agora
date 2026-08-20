import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, X, Volume2, Settings2 } from "lucide-react";
import { useLibras } from "@/lib/libras-translator";

export function LibrasAvatar({ onClose }: { onClose: () => void }) {
  const { sinalAtual, textoAtual, velocidade, setVelocidade, pausado, setPausado, traduzir, cancelar } = useLibras();

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 pointer-events-none"
    >
      <div className="w-full max-w-[400px] bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden pointer-events-auto">
        <div className="relative aspect-video bg-[#005fb8] flex items-center justify-center overflow-hidden">
          {/* Avatar SVG */}
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg">
            {/* Tronco */}
            <path d="M60 180 Q100 170 140 180 L145 130 Q100 120 55 130 Z" fill="#3B82F6" />
            
            {/* Braço Esquerdo */}
            <motion.g
              animate={{
                rotate: sinalAtual?.bracos.esquerdo.ombro || 0,
              }}
              originX="70px"
              originY="135px"
            >
              <rect x="55" y="135" width="15" height="40" rx="7" fill="#F5D5B8" />
              <motion.g
                animate={{
                  rotate: sinalAtual?.bracos.esquerdo.cotovelo || 0,
                }}
                originX="62.5px"
                originY="170px"
              >
                <rect x="55" y="170" width="15" height="35" rx="7" fill="#F5D5B8" />
                {/* Mão */}
                <circle cx="62.5" cy="210" r="10" fill="#F5D5B8" />
              </motion.g>
            </motion.g>

            {/* Braço Direito */}
            <motion.g
              animate={{
                rotate: -(sinalAtual?.bracos.direito.ombro || 0),
              }}
              originX="130px"
              originY="135px"
            >
              <rect x="130" y="135" width="15" height="40" rx="7" fill="#F5D5B8" />
              <motion.g
                animate={{
                  rotate: -(sinalAtual?.bracos.direito.cotovelo || 0),
                }}
                originX="137.5px"
                originY="170px"
              >
                <rect x="130" y="170" width="15" height="35" rx="7" fill="#F5D5B8" />
                {/* Mão */}
                <circle cx="137.5" cy="210" r="10" fill="#F5D5B8" />
              </motion.g>
            </motion.g>

            {/* Cabeça (Bald) */}
            <circle cx="100" cy="90" r="35" fill="#F5D5B8" />
            <path d="M85 95 Q100 105 115 95" stroke="#000" strokeWidth="2" fill="none" opacity="0.3" />
            <circle cx="88" cy="85" r="2" fill="#000" opacity="0.6" />
            <circle cx="112" cy="85" r="2" fill="#000" opacity="0.6" />
          </svg>

          {/* Overlay Legendas */}
          <div className="absolute bottom-3 inset-x-4 bg-black/40 backdrop-blur-sm rounded-xl p-2 text-center">
            <p className="text-white text-xs font-medium leading-tight">
              {textoAtual || "Aguardando tradução..."}
            </p>
          </div>

          <button
            onClick={() => {
              cancelar();
              onClose();
            }}
            className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPausado(!pausado)}
                className="size-12 flex items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform"
              >
                {pausado ? <Play className="size-6 fill-current" /> : <Pause className="size-6 fill-current" />}
              </button>
              <button
                onClick={() => traduzir(textoAtual)}
                className="size-12 flex items-center justify-center rounded-2xl bg-secondary text-secondary-foreground shadow-sm active:scale-95 transition-transform"
              >
                <RotateCcw className="size-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-secondary/50 p-1.5 rounded-2xl">
              {[0.75, 1, 1.25].map((v) => (
                <button
                  key={v}
                  onClick={() => setVelocidade(v)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                    velocidade === v ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {v}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <div className="flex items-center gap-2">
              <Volume2 className="size-3" /> Sincronizado
            </div>
            <div className="flex items-center gap-2">
              Sinalize v1.0 <Settings2 className="size-3" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, RotateCcw, FastForward, Info } from "lucide-react";
import { useLibras } from "@/lib/libras-translator";

export function LibrasAvatar() {
  const { isAvatarOpen, setAvatarOpen, currentText, isTranslating, playbackSpeed, setSpeed } = useLibras();
  const [isPlaying, setIsPlaying] = useState(true);

  if (!isAvatarOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <div className="relative w-full max-w-[400px] bg-card rounded-[2.5rem] shadow-float overflow-hidden flex flex-col border border-border">
          {/* Header */}
          <div className="p-5 flex items-center justify-between border-b border-border/50">
            <div>
              <h2 className="text-sm font-bold">Intérprete Virtual</h2>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Acessibilidade NexLine</p>
            </div>
            <button 
              onClick={() => setAvatarOpen(false)}
              className="size-10 rounded-full bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Avatar Container */}
          <div className="relative aspect-[3/4] bg-[#f8fafc] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]" />
            
            {/* SVG Avatar Articulado */}
            <svg viewBox="0 0 120 150" className="w-full h-full max-h-[350px]">
              {/* Corpo / Tronco */}
              <path d="M35 60 Q60 55 85 60 L88 95 Q60 100 32 95 Z" fill="#3b82f6" />
              <path d="M38 95 L42 128 L78 128 L82 95 Z" fill="#2563eb" />
              
              {/* Pescoço */}
              <rect x="54" y="52" width="12" height="10" fill="#F5D5B8" />
              
              {/* Cabeça (Careca conforme solicitado) */}
              <circle cx="60" cy="35" r="18" fill="#F5D5B8" stroke="#D4A373" strokeWidth="0.5" />
              
              {/* Rosto Amigável */}
              <g className="face-features">
                <circle cx="53" cy="33" r="1.5" fill="#333" />
                <circle cx="67" cy="33" r="1.5" fill="#333" />
                <path d="M54 42 Q60 46 66 42" fill="none" stroke="#333" strokeWidth="1" strokeLinecap="round" />
              </g>

              {/* Braços e Mãos Articulados */}
              <motion.g 
                animate={isPlaying && isTranslating ? {
                  rotate: [0, -10, 5, -5, 0],
                  y: [0, -2, 2, -1, 0]
                } : {}}
                transition={{ repeat: Infinity, duration: 1.5 / playbackSpeed }}
                style={{ transformOrigin: "35px 65px" }}
              >
                {/* Braço Esquerdo */}
                <path d="M35 65 L20 90 L25 105" fill="none" stroke="#F5D5B8" strokeWidth="8" strokeLinecap="round" />
                {/* Mão Esquerda (5 dedos simplificados) */}
                <g transform="translate(20, 105) scale(0.6)">
                  <circle cx="8" cy="8" r="7" fill="#F5D5B8" />
                </g>
              </motion.g>

              <motion.g 
                animate={isPlaying && isTranslating ? {
                  rotate: [0, 15, -10, 10, 0],
                  y: [0, 2, -3, 2, 0]
                } : {}}
                transition={{ repeat: Infinity, duration: 1.2 / playbackSpeed }}
                style={{ transformOrigin: "85px 65px" }}
              >
                {/* Braço Direito */}
                <path d="M85 65 L100 90 L95 105" fill="none" stroke="#F5D5B8" strokeWidth="8" strokeLinecap="round" />
                {/* Mão Direita */}
                <g transform="translate(90, 105) scale(0.6)">
                  <circle cx="8" cy="8" r="7" fill="#F5D5B8" />
                </g>
              </motion.g>
            </svg>

            {/* Legenda em tempo real */}
            <div className="absolute bottom-6 left-0 right-0 px-6">
              <div className="bg-black/70 backdrop-blur-md text-white text-xs font-medium py-3 px-4 rounded-2xl text-center shadow-lg border border-white/10 leading-relaxed">
                {currentText || "Aguardando tradução..."}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-6 bg-card flex flex-col gap-4">
            <div className="flex items-center justify-center gap-6">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="size-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg active:scale-90 transition-transform"
              >
                {isPlaying ? <Pause className="size-6" /> : <Play className="size-6" />}
              </button>
              <button className="size-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center active:scale-90 transition-transform">
                <RotateCcw className="size-5" />
              </button>
              <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50">
                <FastForward className="size-3 text-muted-foreground" />
                <select 
                  value={playbackSpeed} 
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="bg-transparent text-[10px] font-bold outline-none cursor-pointer"
                >
                  <option value="0.75">0.75x</option>
                  <option value="1.0">1.0x</option>
                  <option value="1.25">1.25x</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-medium justify-center bg-muted/30 py-2 rounded-xl">
              <Info className="size-3" />
              Tradução gerada via Inteligência Artificial Cantu
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

import React, { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment,
  Html
} from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, RotateCcw } from "lucide-react";
import { useLibras } from "@/lib/libras-translator";

function AvatarModelo({ glosas, velocidade, reproduzindo }: any) {
  const group = useRef<THREE.Group>(null);
  const [glosaAtual, setGlosaAtual] = useState("");
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  
  useFrame((state) => {
    const tempoTotal = state.clock.getElapsedTime();
    
    if (hoveredPart && group.current) {
      const braçoDir = group.current.getObjectByName("BraçoDireito");
      const braçoEsq = group.current.getObjectByName("BraçoEsquerdo");
      
      if (hoveredPart === "BraçoDireito" && braçoDir) {
        braçoDir.rotation.z = Math.sin(tempoTotal * 10) * 0.2;
        braçoDir.rotation.x = -1.2 + Math.cos(tempoTotal * 5) * 0.1;
      } else if (hoveredPart === "BraçoEsquerdo" && braçoEsq) {
        braçoEsq.rotation.z = -Math.sin(tempoTotal * 10) * 0.2;
        braçoEsq.rotation.x = -1.2 + Math.cos(tempoTotal * 5) * 0.1;
      }
      return;
    }

    if (!reproduzindo || glosas.length === 0) return;

    const tempoAnim = tempoTotal * velocidade;
    const duracaoPorGlosa = 1.2; 
    const indice = Math.floor(tempoAnim / duracaoPorGlosa) % glosas.length;
    const glosa = glosas[indice];
    
    if (glosa !== glosaAtual) {
      setGlosaAtual(glosa);
    }

    if (group.current) {
      const braçoDir = group.current.getObjectByName("BraçoDireito");
      const braçoEsq = group.current.getObjectByName("BraçoEsquerdo");
      const cabeça = group.current.getObjectByName("Cabeça");
      
      if (braçoDir && braçoEsq && cabeça) {
        const seed = glosa.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const freq = 3 + (seed % 5);
        
        braçoDir.rotation.x = -0.5 + Math.sin(tempoAnim * freq) * 0.8;
        braçoDir.rotation.y = Math.cos(tempoAnim * freq * 0.5) * 0.4;
        braçoEsq.rotation.x = -0.5 + Math.cos(tempoAnim * freq * 0.8) * 0.6;
        cabeça.rotation.y = Math.sin(tempoAnim * 2) * 0.1;
      }
    }
  });

  return (
    <group ref={group}>
      <mesh position={[0, -0.2, 0]}>
        <capsuleGeometry args={[0.25, 0.6, 4, 16]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      
      <mesh name="Cabeça" position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color="#fcd34d" />
      </mesh>
      
      <group position={[0, 0.4, 0.18]}>
        <mesh position={[-0.05, 0.05, 0]}>
          <circleGeometry args={[0.015, 16]} />
          <meshBasicMaterial color="black" />
        </mesh>
        <mesh position={[0.05, 0.05, 0]}>
          <circleGeometry args={[0.015, 16]} />
          <meshBasicMaterial color="black" />
        </mesh>
        <mesh position={[0, -0.05, 0]} rotation={[0, 0, Math.PI]}>
          <ringGeometry args={[0.04, 0.05, 16, 1, 0, Math.PI]} />
          <meshBasicMaterial color="black" />
        </mesh>
      </group>

      <group 
        name="BraçoDireito" 
        position={[0.25, 0.2, 0]}
        onPointerOver={() => setHoveredPart("BraçoDireito")}
        onPointerOut={() => setHoveredPart(null)}
      >
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={hoveredPart === "BraçoDireito" ? "#3b82f6" : "#fcd34d"} />
        </mesh>
        <mesh position={[0.15, -0.15, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <capsuleGeometry args={[0.06, 0.3, 8, 16]} />
          <meshStandardMaterial color={hoveredPart === "BraçoDireito" ? "#3b82f6" : "#fcd34d"} />
        </mesh>
        <mesh position={[0.3, -0.4, 0.05]} rotation={[0.2, 0, -Math.PI / 3]}>
          <capsuleGeometry args={[0.05, 0.3, 8, 16]} />
          <meshStandardMaterial color={hoveredPart === "BraçoDireito" ? "#3b82f6" : "#fcd34d"} />
        </mesh>
        <group position={[0.45, -0.55, 0.1]} scale={1.2}>
          <mesh>
            <boxGeometry args={[0.08, 0.08, 0.03]} />
            <meshStandardMaterial color={hoveredPart === "BraçoDireito" ? "#3b82f6" : "#fcd34d"} />
          </mesh>
          {[...Array(5)].map((_, i) => (
            <mesh key={i} position={[-0.03 + i * 0.015, 0.05, 0]}>
              <capsuleGeometry args={[0.006, 0.04, 4, 8]} />
              <meshStandardMaterial color={hoveredPart === "BraçoDireito" ? "#3b82f6" : "#fcd34d"} />
            </mesh>
          ))}
        </group>
      </group>

      <group 
        name="BraçoEsquerdo" 
        position={[-0.25, 0.2, 0]}
        onPointerOver={() => setHoveredPart("BraçoEsquerdo")}
        onPointerOut={() => setHoveredPart(null)}
      >
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={hoveredPart === "BraçoEsquerdo" ? "#3b82f6" : "#fcd34d"} />
        </mesh>
        <mesh position={[-0.15, -0.15, 0]} rotation={[0, 0, Math.PI / 4]}>
          <capsuleGeometry args={[0.06, 0.3, 8, 16]} />
          <meshStandardMaterial color={hoveredPart === "BraçoEsquerdo" ? "#3b82f6" : "#fcd34d"} />
        </mesh>
        <mesh position={[-0.3, -0.4, 0.05]} rotation={[0.2, 0, Math.PI / 3]}>
          <capsuleGeometry args={[0.05, 0.3, 8, 16]} />
          <meshStandardMaterial color={hoveredPart === "BraçoEsquerdo" ? "#3b82f6" : "#fcd34d"} />
        </mesh>
        <group position={[-0.45, -0.55, 0.1]} scale={1.2}>
          <mesh>
            <boxGeometry args={[0.08, 0.08, 0.03]} />
            <meshStandardMaterial color={hoveredPart === "BraçoEsquerdo" ? "#3b82f6" : "#fcd34d"} />
          </mesh>
          {[...Array(5)].map((_, i) => (
            <mesh key={i} position={[-0.03 + i * 0.015, 0.05, 0]}>
              <capsuleGeometry args={[0.006, 0.04, 4, 8]} />
              <meshStandardMaterial color={hoveredPart === "BraçoEsquerdo" ? "#3b82f6" : "#fcd34d"} />
            </mesh>
          ))}
        </group>
      </group>

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </group>
  );
}

export function LibrasAvatar() {
  const { 
    ativo, 
    mensagem, 
    glosas, 
    velocidade, 
    reproduzindo, 
    toggleAtivo,
    setReproduzindo,
    setVelocidade,
    setMensagem
  } = useLibras();

  if (!ativo) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.9, x: 20 }}
        className="fixed bottom-24 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      >
        <div className="w-64 h-[480px] bg-[#f8fafc] border-2 border-[#005fb8]/20 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,95,184,0.3)] pointer-events-auto flex flex-col">
          <div className="p-4 flex items-center justify-between border-b border-[#005fb8]/10 bg-[#005fb8] text-white">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                  <path d="M7 10.5V6a2 2 0 0 1 4 0v7a3 3 0 0 1-6 0v-1.5" />
                  <path d="M11 8V5a2 2 0 0 1 4 0v7a3 3 0 0 1-6 0" />
                  <path d="M15 9.5V7a2 2 0 0 1 4 0v7a3 3 0 0 1-6 0" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black leading-none opacity-80">INTÉRPRETE</span>
                <span className="text-xs font-bold leading-tight uppercase tracking-wide">
                  Virtual Cantu
                </span>
              </div>
            </div>
            <button 
              onClick={toggleAtivo}
              className="size-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex-1 relative bg-gradient-to-b from-[#e2e8f0] to-[#f8fafc]">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
               <div className="w-64 h-64 border-[1px] border-[#005fb8]/5 rounded-full" />
               <div className="absolute w-48 h-48 border-[1px] border-[#005fb8]/10 rounded-full" />
            </div>
            
            <Canvas shadows className="cursor-grab active:cursor-grabbing" onClick={() => setReproduzindo(!reproduzindo)}>
              <PerspectiveCamera makeDefault position={[0, 0, 1.8]} />
              <Suspense fallback={<Html center className="text-[#005fb8] text-[10px] font-black animate-pulse">CARREGANDO...</Html>}>
                <AvatarModelo 
                  glosas={glosas} 
                  velocidade={velocidade} 
                  reproduzindo={reproduzindo} 
                />
                <Environment preset="apartment" />
              </Suspense>
              <OrbitControls 
                enableZoom={false} 
                enablePan={false}
                enableRotate={false}
              />
            </Canvas>

            <div className="absolute bottom-4 left-0 right-0 px-4 space-y-3">
              <AnimatePresence mode="wait">
                {glosas.length > 0 && reproduzindo && (
                  <motion.div 
                    key={glosas.join("-")}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex flex-wrap justify-center gap-1"
                  >
                    {glosas.map((g, i) => (
                      <span key={i} className="text-[8px] px-2 py-0.5 rounded-md bg-[#005fb8] text-white font-black shadow-md border border-white/20">
                        {g}
                      </span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 text-center border-t border-white shadow-xl min-h-[80px] flex flex-col justify-center">
                <p className="text-[9px] text-[#005fb8] font-black uppercase tracking-[0.2em] mb-2 opacity-60 italic">Tradução em tempo real</p>
                <p className="text-xs font-bold text-slate-800 leading-snug">
                  {mensagem || "Toque em um texto ou botão para traduzir para LIBRAS"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <button 
                onClick={() => setReproduzindo(!reproduzindo)}
                className="flex-1 flex items-center justify-center gap-3 rounded-2xl bg-[#005fb8] text-white h-14 font-black text-xs shadow-lg shadow-[#005fb8]/20 transition-all active:scale-95 hover:bg-[#004e9a]"
              >
                {reproduzindo ? <Pause className="size-6" fill="currentColor" /> : <Play className="size-6" fill="currentColor" />}
                {reproduzindo ? "PAUSAR" : "REPRODUZIR"}
              </button>
              <button 
                onClick={() => setMensagem(mensagem)} 
                className="size-14 flex items-center justify-center rounded-2xl bg-[#f1f5f9] text-[#005fb8] hover:bg-[#e2e8f0] transition-colors border border-slate-200"
              >
                <RotateCcw className="size-6" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 p-1 bg-[#f1f5f9] rounded-xl border border-slate-200">
              <span className="text-[8px] font-black text-[#005fb8] px-2 uppercase opacity-60">Velocidade</span>
              {[0.75, 1.0, 1.25].map((v) => (
                <button
                  key={v}
                  onClick={() => setVelocidade(v)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                    velocidade === v 
                      ? "bg-white text-[#005fb8] shadow-sm" 
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {v}x
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#005fb8]/10 shadow-sm flex items-center gap-2">
            <span className="text-[8px] font-bold text-slate-400">Powered by</span>
            <span className="text-[9px] font-black text-[#005fb8] tracking-tighter">Cantu Cidadão</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

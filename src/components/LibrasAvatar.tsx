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
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed bottom-24 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      >
        <div className="w-72 h-[420px] bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl pointer-events-auto flex flex-col">
          <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                  <path d="M10 18H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-5" />
                  <path d="m8 22 4-4 4 4" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-800 tracking-tight">
                Acessibilidade LIBRAS
              </span>
            </div>
            <button 
              onClick={toggleAtivo}
              className="size-8 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 relative bg-slate-50">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="w-48 h-48 border-4 border-primary rounded-full" />
            </div>
            
            <Canvas shadows className="cursor-grab active:cursor-grabbing" onClick={() => setReproduzindo(!reproduzindo)}>
              <PerspectiveCamera makeDefault position={[0, 0, 1.8]} />
              <Suspense fallback={<Html center className="text-slate-400 text-xs font-medium">Iniciando...</Html>}>
                <AvatarModelo 
                  glosas={glosas} 
                  velocidade={velocidade} 
                  reproduzindo={reproduzindo} 
                />
                <Environment preset="studio" />
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
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-wrap justify-center gap-1.5"
                  >
                    {glosas.map((g, i) => (
                      <span key={i} className="text-[9px] px-2 py-1 rounded-full bg-primary text-white font-bold shadow-sm">
                        {g}
                      </span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 text-center border border-slate-200 shadow-sm min-h-[72px] flex flex-col justify-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Tradução</p>
                <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                  {mensagem || "Pronto para traduzir..."}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
            <button 
              onClick={() => setReproduzindo(!reproduzindo)}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-primary text-white h-12 font-bold text-sm shadow-lg shadow-primary/20 transition-transform active:scale-95"
            >
              {reproduzindo ? <Pause className="size-5" /> : <Play className="size-5" fill="currentColor" />}
              {reproduzindo ? "PAUSAR" : "REPRODUZIR"}
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => setMensagem(mensagem)} 
                className="size-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors shadow-sm"
              >
                <RotateCcw className="size-5" />
              </button>
              <button 
                onClick={() => setVelocidade(velocidade === 1.25 ? 0.75 : velocidade + 0.25)}
                className="size-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-sm text-xs font-bold"
              >
                {velocidade}x
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

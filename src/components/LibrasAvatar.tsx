import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment,
  Html,
  useAnimations,
  useGLTF
} from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, RotateCcw, FastForward, Rewind } from "lucide-react";
import { useLibras } from "@/lib/libras-translator";

// Componente do Modelo 3D (Placeholder realista)
function AvatarModelo({ glosas, velocidade, reproduzindo }: any) {
  const group = useRef<THREE.Group>(null);
  const [glosaAtual, setGlosaAtual] = useState("");
  const tempoInicioRef = useRef(0);
  
  useFrame((state, delta) => {
    if (!reproduzindo || glosas.length === 0) return;

    const tempoTotal = state.clock.getElapsedTime() * velocidade;
    const duracaoPorGlosa = 1.2; // Segundos por sinal
    const indice = Math.floor(tempoTotal / duracaoPorGlosa) % glosas.length;
    const glosa = glosas[indice];
    
    if (glosa !== glosaAtual) {
      setGlosaAtual(glosa);
    }

    if (group.current) {
      const braçoDir = group.current.getObjectByName("BraçoDireito");
      const braçoEsq = group.current.getObjectByName("BraçoEsquerdo");
      const cabeça = group.current.getObjectByName("Cabeça");
      
      if (braçoDir && braçoEsq && cabeça) {
        // Oscilação baseada na glosa (simulação de sinais diferentes)
        const seed = glosa.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const freq = 3 + (seed % 5);
        
        braçoDir.rotation.x = -0.5 + Math.sin(tempoTotal * freq) * 0.8;
        braçoDir.rotation.y = Math.cos(tempoTotal * freq * 0.5) * 0.4;
        braçoEsq.rotation.x = -0.5 + Math.cos(tempoTotal * freq * 0.8) * 0.6;
        
        // Pequena inclinação da cabeça acompanhando
        cabeça.rotation.y = Math.sin(tempoTotal * 2) * 0.1;
      }
    }
  });


  return (
    <group ref={group}>
      {/* Corpo principal */}
      <mesh position={[0, -0.5, 0]}>
        <capsuleGeometry args={[0.25, 1, 4, 16]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      
      {/* Cabeça */}
      <mesh name="Cabeça" position={[0, 0.4, 0]}>

        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color="#fcd34d" />
      </mesh>

      {/* Braço Direito (Nomeado para animação) */}
      <group name="BraçoDireito" position={[0.25, 0.2, 0]}>
        <mesh position={[0.2, -0.2, 0]}>
          <capsuleGeometry args={[0.06, 0.4, 4, 8]} />
          <meshStandardMaterial color="#fcd34d" />
        </mesh>
        {/* Mão Direita Aumentada */}
        <mesh position={[0.4, -0.4, 0]} scale={1.8}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#fcd34d" />
        </mesh>
      </group>

      {/* Braço Esquerdo */}
      <group name="BraçoEsquerdo" position={[-0.25, 0.2, 0]}>
        <mesh position={[-0.2, -0.2, 0]}>
          <capsuleGeometry args={[0.06, 0.4, 4, 8]} />
          <meshStandardMaterial color="#fcd34d" />
        </mesh>
        {/* Mão Esquerda Aumentada */}
        <mesh position={[-0.4, -0.4, 0]} scale={1.8}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#fcd34d" />
        </mesh>
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
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className="fixed bottom-24 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      >
        <div className="w-64 h-80 bg-slate-900/95 backdrop-blur-xl border-2 border-primary/30 rounded-3xl overflow-hidden shadow-2xl pointer-events-auto flex flex-col">
          {/* Header */}
          <div className="bg-primary/20 p-3 flex items-center justify-between border-b border-white/10">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary-foreground flex items-center gap-2">
              <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              Intérprete Digital
            </span>
            <button 
              onClick={toggleAtivo}
              className="size-6 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-destructive transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Área 3D */}
          <div className="flex-1 relative bg-gradient-to-b from-slate-900 to-slate-800">
            <Canvas shadows className="cursor-grab active:cursor-grabbing" onClick={() => setReproduzindo(!reproduzindo)}>
              <PerspectiveCamera makeDefault position={[0, 0, 1.8]} />
              <Suspense fallback={<Html center className="text-white text-xs font-bold">Carregando Avatar...</Html>}>
                <AvatarModelo 
                  glosas={glosas} 
                  velocidade={velocidade} 
                  reproduzindo={reproduzindo} 
                />
                <Environment preset="city" />
              </Suspense>
              <OrbitControls 
                enableZoom={false} 
                enablePan={false}
                minPolarAngle={Math.PI / 2.5}
                maxPolarAngle={Math.PI / 2}
              />
            </Canvas>

            {/* Legenda das Glosas e Feedback Visual */}
            <div className="absolute bottom-4 left-0 right-0 px-4 space-y-2">
              <AnimatePresence mode="wait">
                {glosas.length > 0 && reproduzindo && (
                  <motion.div 
                    key={glosas.join("-")}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex justify-center gap-1 overflow-hidden"
                  >
                    {glosas.map((g, i) => (
                      <span key={i} className="text-[8px] px-1.5 py-0.5 rounded-md bg-primary/20 text-primary-foreground font-black">
                        {g}
                      </span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {mensagem && (
                <div className="bg-black/60 backdrop-blur-md rounded-xl p-2 text-center border border-white/10 shadow-lg">
                  <p className="text-[9px] text-primary-foreground/60 uppercase font-black mb-1">Tradução em tempo real</p>
                  <p className="text-xs font-bold text-white line-clamp-2 leading-tight">{mensagem}</p>
                </div>
              )}
            </div>

          </div>

          {/* Controles */}
          <div className="p-3 bg-black/40 border-t border-white/10 grid grid-cols-4 gap-2">
            <button 
              onClick={() => setReproduzindo(!reproduzindo)}
              className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground h-10 font-bold text-xs transition-transform active:scale-95"
            >
              {reproduzindo ? <Pause className="size-4" /> : <Play className="size-4" />}
              {reproduzindo ? "PAUSAR" : "REPRODUZIR"}
            </button>
            <button 
              onClick={() => setMensagem(mensagem)} // Reinicia
              className="flex items-center justify-center rounded-xl bg-white/10 text-white h-10 hover:bg-white/20 transition-colors"
            >
              <RotateCcw className="size-4" />
            </button>
            <button 
              onClick={() => setVelocidade(velocidade === 1.25 ? 0.75 : velocidade + 0.25)}
              className="flex items-center justify-center rounded-xl bg-white/10 text-white h-10 hover:bg-white/20 transition-colors text-[10px] font-black"
            >
              {velocidade}x
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { Hand, X, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { DEDOS, POSE_REPOUSO, montarSequencia, type Configuracao, type Pose } from "@/lib/libras";

/**
 * LibrasViewer: O componente principal de acessibilidade que exibe o intérprete
 * e os controles de tradução sincronizada.
 */
export function LibrasViewer({ 
  mensagem, 
  onClose 
}: { 
  mensagem: string; 
  onClose: () => void;
}) {
  const passos = useMemo(() => montarSequencia(mensagem), [mensagem]);
  const [indice, setIndice] = useState(0);
  const [tocando, setTocando] = useState(true);
  const [velocidade, setVelocidade] = useState(1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!tocando || passos.length === 0) return;
    const atual = passos[indice] ?? passos[0]!;
    timer.current = setTimeout(() => {
      setIndice((i) => (i + 1) % passos.length);
    }, atual.duracao / velocidade);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [tocando, indice, passos, velocidade]);

  const passo = passos[indice];
  const pose = passo?.pose ?? POSE_REPOUSO;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background animate-in fade-in duration-300">
      {/* Header Profissional */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Hand className="size-6" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-primary">Libras</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Cantu Conecta Acessível</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground shadow-sm active:scale-90 transition-transform"
        >
          <X className="size-5" />
        </button>
      </header>

      {/* Área do Intérprete - Fundo Limpo e Focado */}
      <div className="relative flex flex-1 flex-col items-center justify-center bg-[#E8EDF2] overflow-hidden px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.8)_0%,_transparent_100%)] opacity-50" />
        
        {/* Personagem de Libras */}
        <div className="relative z-10 w-full max-w-xs aspect-square flex items-center justify-center">
          <LibrasFigure pose={pose} velocidade={velocidade} />
        </div>

        {/* Texto Sincronizado */}
        <div className="relative z-20 w-full max-w-sm mt-8 space-y-4">
          <div className="flex flex-col items-center gap-2">
            {passo && (
              <div className="flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-300">
                <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-black text-primary-foreground uppercase tracking-widest">
                  {passo.datilologia ? "Soletrando" : "Sinal"}
                </span>
                <span className="text-2xl font-black text-primary tracking-tighter uppercase">{passo.glosa}</span>
              </div>
            )}
          </div>
          
          <div className="rounded-[2.5rem] bg-card/80 p-6 shadow-float border border-border/50 backdrop-blur-sm">
            <p className="text-center text-lg font-medium leading-relaxed text-muted-foreground">
              {mensagem.split(/\s+/).map((p, i) => {
                const ativo = passo ? p.replace(/[^\p{L}\p{N}]/gu, "") === passo.palavra : false;
                return (
                  <span
                    key={`${p}-${i}`}
                    className={`inline-block transition-all duration-300 ${
                      ativo 
                        ? "text-primary scale-110 font-bold mx-1" 
                        : "opacity-40"
                    }`}
                  >
                    {p}{" "}
                  </span>
                );
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Controles de Reprodução */}
      <footer className="border-t border-border bg-card px-6 py-8 pb-12">
        <div className="mx-auto flex max-w-md flex-col gap-6">
          <div className="flex items-center justify-between">
            {/* Velocidade */}
            <div className="flex items-center gap-1 rounded-2xl bg-secondary/50 p-1">
              {[0.75, 1, 1.25].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVelocidade(v)}
                  className={`flex min-w-[50px] items-center justify-center rounded-xl py-2 text-[10px] font-black transition-all ${
                    velocidade === v ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {v}x
                </button>
              ))}
            </div>

            {/* Navegação de Sinais */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIndice((i) => (i - 1 + passos.length) % passos.length)}
                className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground shadow-sm active:scale-90"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => setIndice((i) => (i + 1) % passos.length)}
                className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground shadow-sm active:scale-90"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                setIndice(0);
                setTocando(true);
              }}
              className="flex size-14 items-center justify-center rounded-[1.5rem] bg-secondary text-secondary-foreground shadow-sm active:scale-95 transition-transform"
            >
              <RotateCcw className="size-6" />
            </button>
            <button
              type="button"
              onClick={() => setTocando((t) => !t)}
              className="flex size-20 items-center justify-center rounded-[2rem] bg-primary text-primary-foreground shadow-xl active:scale-95 transition-transform"
            >
              {tocando ? <Pause className="size-8 fill-current" /> : <Play className="size-8 fill-current translate-x-0.5" />}
            </button>
            <div className="size-14" /> {/* Espaçador para equilíbrio visual */}
          </div>
        </div>
      </footer>
    </div>
  );
}

function LibrasFigure({ pose, velocidade }: { pose: Pose; velocidade: number }) {
  return (
    <div className="relative h-[450px] w-96 drop-shadow-2xl translate-y-12">
      <div 
        className="relative w-full h-full"
        style={{
          transform: `rotateY(${pose.tronco ?? 0}deg)`,
          transition: `transform ${600 / velocidade}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
        }}
      >
        <svg viewBox="0 0 160 200" className="w-full h-full drop-shadow-lg" preserveAspectRatio="xMidYMin slice">
          {/* Cabeça e Pescoço - Tons de pele profissionais */}
          <rect x="75" y="68" width="10" height="20" fill="#D2B48C" />
          <ellipse cx="80" cy="70" rx="20" ry="26" fill="#D2B48C" stroke="#B89B7E" strokeWidth="0.5" />
          
          {/* Cabelo Adulto Profissional */}
          <path d="M58 45 Q80 30 102 45 L106 58 Q80 50 54 58 Z" fill="#2C1810" />
          
          {/* Rosto Sóbrio */}
          <g className="opacity-90">
            <ellipse cx="72" cy="68" rx="1.8" ry="2.2" fill="#1A1A1A" />
            <ellipse cx="88" cy="68" rx="1.8" ry="2.2" fill="#1A1A1A" />
            <path d="M75 80 Q80 82 85 80" fill="none" stroke="#8B4513" strokeWidth="1.2" strokeLinecap="round" />
            {/* Sobrancelhas sutis */}
            <path d="M68 58 Q72 55 75 57" fill="none" stroke="#2C1810" strokeWidth="1" opacity="0.6" />
            <path d="M85 57 Q88 55 92 58" fill="none" stroke="#2C1810" strokeWidth="1" opacity="0.6" />
          </g>

          {/* Tronco - Camisa Social Lisa (Azul Profissional) */}
          <path d="M35 85 Q80 80 125 85 L140 220 Q80 220 20 220 Z" fill="#2E5077" />
          <path d="M60 85 L80 105 L100 85" fill="none" stroke="#1B365D" strokeWidth="2.5" opacity="0.4" />
        </svg>

        {/* Braços e Mãos - Articulados e em Camada Superior */}
        <svg viewBox="0 0 160 200" className="absolute inset-0" preserveAspectRatio="xMidYMin slice">
          <BracoArticulado
            x={112}
            y={102}
            rotacao={pose.bracoEsq}
            cotovelo={pose.coveloEsq}
            config={pose.maoEsq}
            velocidade={velocidade}
            lado="esq"
          />
          <BracoArticulado
            x={48}
            y={102}
            rotacao={pose.bracoDir}
            cotovelo={pose.coveloDir}
            config={pose.maoDir}
            velocidade={velocidade}
            lado="dir"
          />
        </svg>
      </div>
    </div>
  );
}

function BracoArticulado({ 
  x, y, rotacao, cotovelo, config, velocidade, lado 
}: { 
  x: number; y: number; rotacao: number; cotovelo: number; config: Configuracao; velocidade: number; lado: "dir" | "esq" 
}) {
  const anguloOmbro = rotacao * 1.6;
  const anguloCotovelo = cotovelo * 1.1;
  const transicao = `transform ${650 / velocidade}ms cubic-bezier(0.4, 0, 0.2, 1)`;

  return (
    <g style={{ transform: `translate(${x}px, ${y}px) rotate(${anguloOmbro}deg)`, transition: transicao }}>
      {/* Braço superior */}
      <rect x={-8} y={-5} width={16} height={35} rx={8} fill="#D2B48C" stroke="#A68966" strokeWidth="0.5" />
      
      <g style={{ transform: `translate(0px, 28px) rotate(${anguloCotovelo}deg)`, transition: transicao }}>
        {/* Antebraço Humano Definido */}
        <rect x={-7} y={-4} width={14} height={32} rx={7} fill="#D2B48C" stroke="#A68966" strokeWidth="0.5" />
        
        <g style={{ transform: "translate(0px, 28px)" }}>
          <MaoLibras config={config} velocidade={velocidade} lado={lado} />
        </g>
      </g>
    </g>
  );
}

function MaoLibras({ config, velocidade, lado }: { config: Configuracao; velocidade: number; lado: "dir" | "esq" }) {
  const [polegar, indicador, medio, anelar, minimo] = DEDOS[config];
  const transicao = `transform ${550 / velocidade}ms cubic-bezier(0.4, 0, 0.2, 1), height ${550 / velocidade}ms ease-in-out`;
  
  // Mãos ainda maiores e anatomicamente detalhadas para clareza absoluta
  const escala = 1.8; 
  const color = "#D2B48C";
  const stroke = "#8B6B4A";

  return (
    <g style={{ transform: `scale(${escala}) rotate(${lado === "esq" ? 5 : -5}deg)` }}>
      {/* Palma Humana */}
      <rect x={-9} y={-2} width={18} height={17} rx={4} fill={color} stroke={stroke} strokeWidth="1.2" />
      
      {/* Dedos Principais */}
      {[
        { dx: -5.5, ext: indicador, hMax: 18, a: -5 },
        { dx: -1.8, ext: medio, hMax: 20, a: 0 },
        { dx: 1.8, ext: anelar, hMax: 18, a: 5 },
        { dx: 5.5, ext: minimo, hMax: 15, a: 10 },
      ].map((d, i) => {
        const h = 4 + d.ext * d.hMax;
        return (
          <g key={i} style={{ transform: `translate(${d.dx}px, 8px) rotate(${d.a * (1 - d.ext)}deg)`, transition: transicao }}>
            <rect x={-2.2} y={-h} width={4.4} height={h} rx={2.2} fill={color} stroke={stroke} strokeWidth="1" />
            {d.ext > 0.6 && <line x1="-1.5" y1={-h/2} x2="1.5" y2={-h/2} stroke={stroke} strokeWidth="0.5" opacity="0.4" />}
          </g>
        );
      })}

      {/* Polegar Detalhado */}
      <g style={{ transform: `translate(-9px, 5px) rotate(${20 - polegar * 70}deg)`, transition: transicao }}>
        <rect x={-2} y={-2.5} width={4.5} height={8 + polegar * 11} rx={2.2} fill={color} stroke={stroke} strokeWidth="1" style={{ transform: "rotate(-90deg)" }} />
      </g>
    </g>
  );
}

/**
 * Componente flutuante opcional para acionar o visualizador de Libras.
 */
export function LibrasTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-[10px] font-black text-primary transition-all hover:bg-primary/20 active:scale-95"
    >
      <Hand className="size-4" />
      <span>VER EM LIBRAS</span>
    </button>
  );
}

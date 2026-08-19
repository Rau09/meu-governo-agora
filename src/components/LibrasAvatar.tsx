import { useEffect, useMemo, useRef, useState } from "react";
import { Hand, X, Play, Pause, RotateCcw } from "lucide-react";
import { DEDOS, POSE_REPOUSO, montarSequencia, type Configuracao, type Pose } from "@/lib/libras";


/**
 * Avatar de Libras: assistente de acessibilidade para pessoas surdas.
 */
export function LibrasAvatar({ mensagem }: { mensagem?: string | undefined }) {
  const [aberto, setAberto] = useState(false);
  const texto = mensagem ?? "Estou traduzindo esta tela em Libras para você.";
  const passos = useMemo(() => montarSequencia(texto), [texto]);

  const [indice, setIndice] = useState(0);
  const [tocando, setTocando] = useState(true);
  const [velocidade, setVelocidade] = useState(1);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [arrastado, setArrastado] = useState(false);
  const arrastando = useRef(false);
  const inicio = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  useEffect(() => {
    setIndice(0);
    setTocando(true);
  }, [texto, aberto]);

  useEffect(() => {
    if (!aberto || !tocando || passos.length === 0) return;
    const atual = passos[indice] ?? passos[0]!;
    timer.current = setTimeout(() => {
      setIndice((i) => (i + 1) % passos.length);
    }, atual.duracao / velocidade);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [aberto, tocando, indice, passos, velocidade]);

  const passo = passos[indice];
  const pose = passo?.pose ?? POSE_REPOUSO;

  function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
  }

  function onPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    inicio.current = { x: e.clientX, y: e.clientY, posX: pos.x, posY: pos.y };
    arrastando.current = true;
    setArrastado(false);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!arrastando.current) return;
    const dx = e.clientX - inicio.current.x;
    const dy = e.clientY - inicio.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) setArrastado(true);

    const maxX = typeof window !== "undefined" ? window.innerWidth - 56 - 16 : 0;
    const minX = typeof window !== "undefined" ? -window.innerWidth + 56 + 16 : 0;
    
    const currentFromTop = typeof window !== "undefined" ? window.innerHeight - 96 - 56 : 0;
    const minY = -currentFromTop + 16;
    const maxY = 96 - 16;

    setPos({
      x: clamp(inicio.current.posX + dx, minX, 16),
      y: clamp(inicio.current.posY + dy, minY, maxY),
    });
  }

  function onPointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    arrastando.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  }

  function onClick() {
    if (arrastado) {
      setArrastado(false);
      return;
    }
    setAberto((v) => !v);
  }

  return (
    <div
      className="fixed bottom-24 right-4 z-50"
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
      }}
    >
      <button
        type="button"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={onClick}
        aria-label={aberto ? "Fechar intérprete de Libras" : "Abrir intérprete de Libras"}
        className="flex size-14 items-center justify-center rounded-full bg-accent-gradient text-accent-foreground shadow-float transition-transform cursor-grab active:cursor-grabbing active:scale-95"
        style={{ touchAction: "none" }}
      >
        {aberto ? <X className="size-6" /> : <Hand className="size-6" />}
      </button>

      {aberto && (
        <div 
          className={`absolute z-50 w-64 overflow-hidden rounded-3xl border border-border bg-card shadow-float ${
            typeof window !== 'undefined' && (window.innerWidth - 16 + pos.x) < window.innerWidth / 2
              ? "left-0" 
              : "right-0"
          } ${
            typeof window !== 'undefined' && (window.innerHeight - 96 + pos.y) < window.innerHeight / 2
              ? "top-[72px]" 
              : "bottom-[72px]"
          }`}
        >
          <div className="flex flex-col border-b border-border bg-primary-soft/50 px-4 py-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary">
              Intérprete de Libras
            </h2>
            <p className="text-[10px] text-muted-foreground">
              Entenda os conteúdos do Cantu Conecta em Libras.
            </p>
          </div>

          <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg bg-card/70 px-1.5 py-0.5">
                {[0.75, 1, 1.25].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVelocidade(v)}
                    className={`px-1.5 py-0.5 text-[9px] font-bold transition-colors ${
                      velocidade === v ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {v}x
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setTocando((v) => !v)}
                aria-label={tocando ? "Pausar sinalização" : "Continuar sinalização"}
                className="flex size-8 items-center justify-center rounded-full bg-card/70 text-secondary-foreground transition-transform active:scale-90"
              >
                {tocando ? <Pause className="size-4" /> : <Play className="size-4" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIndice(0);
                  setTocando(true);
                }}
                aria-label="Repetir do início"
                className="flex size-8 items-center justify-center rounded-full bg-card/70 text-secondary-foreground transition-transform active:scale-90"
              >
                <RotateCcw className="size-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center bg-linear-to-b from-primary/10 to-primary/5 py-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_80%)]" />
            
            <SignerFigure pose={pose} velocidade={velocidade} />
          </div>

          {passo && (
            <div className="bg-primary-soft/30 border-b border-border px-4 py-3 text-center">
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary mb-1 uppercase tracking-tighter">
                {passo.datilologia ? "Soletrando" : "Sinal de"}
              </span>
              <p className="font-display text-2xl font-black text-primary leading-none">{passo.glosa}</p>
            </div>
          )}

          <div className="max-h-32 overflow-y-auto px-4 py-3 bg-secondary/20">
            <p className="text-xs leading-relaxed text-muted-foreground">
              {texto.split(/\s+/).map((p, i) => {
                const ativo = passo ? p.replace(/[^\p{L}\p{N}]/gu, "") === passo.palavra : false;
                return (
                  <span
                    key={`${p}-${i}`}
                    className={ativo ? "rounded bg-primary-soft px-1 font-semibold text-primary" : undefined}
                  >
                    {p}{" "}
                  </span>
                );
              })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function SignerFigure({ pose, velocidade }: { pose: Pose; velocidade: number }) {
  return (
    <div className="relative h-64 w-56 drop-shadow-2xl perspective-1000">
      <div 
        className="relative w-full h-full preserve-3d"
        style={{
          transform: `rotateY(${pose.tronco ?? 0}deg)`,
          transition: `transform ${480 / velocidade}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
        }}
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black/15 blur-xl rounded-[100%] z-0" />
        
        <svg viewBox="0 0 140 180" className="relative w-full h-full z-10 drop-shadow-lg">
          <circle cx="70" cy="45" r="26" fill="#FAD1AF" />
          <path d="M42 35 Q70 10 98 35 L102 55 Q70 40 38 55 Z" fill="#4E342E" />
          
          <g>
            <circle cx="60" cy="45" r="3.5" fill="#1A1A1A" />
            <circle cx="80" cy="45" r="3.5" fill="#1A1A1A" />
            <path d="M58 65 Q70 72 82 65" fill="none" stroke="#E74C3C" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          <path d="M30 75 Q70 70 110 75 L120 175 Q70 180 20 175 Z" fill="#2ECC71" />
          <path d="M35 75 Q70 85 105 75" fill="none" stroke="#27AE60" strokeWidth="3" />
        </svg>

        <svg
          viewBox="0 0 140 180"
          className="absolute inset-0 z-20 pointer-events-none"
        >
          <g
            style={{
              transformOrigin: "70px 140px",
              transition: `transform ${480 / velocidade}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
            }}
          >
            <Braco
              x={105}
              y={90}
              rotacao={pose.bracoEsq}
              cotovelo={pose.coveloEsq}
              config={pose.maoEsq}
              velocidade={velocidade}
              color="#F5D5B8"
            />
            <Braco
              x={35}
              y={90}
              rotacao={pose.bracoDir}
              cotovelo={pose.coveloDir}
              config={pose.maoDir}
              velocidade={velocidade}
              color="#F5D5B8"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Braco({
  x,
  y,
  rotacao,
  cotovelo,
  config,
  velocidade,
  color = "#F5D5B8",
}: {
  x: number;
  y: number;
  rotacao: number;
  cotovelo: number;
  config: Configuracao;
  velocidade: number;
  color?: string;
}) {
  const ombro = rotacao * 1.6;
  const flexao = cotovelo * 1.1;
  const transicao = `transform ${500 / velocidade}ms cubic-bezier(0.4, 0, 0.2, 1)`;
  return (
    <g
      style={{
        transform: `translate(${x}px, ${y}px) rotate(${ombro}deg)`,
        transition: transicao,
      }}
    >
      {/* ombro → cotovelo */}
      <rect x={-7} y={-4} width={14} height={32} rx={7} fill={color} stroke="#E59866" strokeWidth="0.5" />
      <g
        style={{
          transform: `translate(0px, 24px) rotate(${flexao}deg)`,
          transition: transicao,
        }}
      >
        {/* antebraço */}
        <rect x={-6} y={-3} width={12} height={26} rx={6} fill={color} stroke="#E59866" strokeWidth="0.5" />
        <g style={{ transform: "translate(0px, 22px)" }}>
          <Mao config={config} velocidade={velocidade} color={color} />
        </g>
      </g>
    </g>
  );
}

/** Mão com palma e cinco dedos detalhados que abrem/fecham conforme a configuração. */
function Mao({ config, velocidade, color = "#FAD1AF" }: { config: Configuracao; velocidade: number; color?: string }) {
  const [polegar, indicador, medio, anelar, minimo] = DEDOS[config];
  const transicao = `transform ${450 / velocidade}ms cubic-bezier(0.34, 1.56, 0.64, 1), height ${450 / velocidade}ms ease-in-out`;

  // Aumentamos o tamanho base da mão para melhor legibilidade
  const escalaMao = 1.15;
  const strokeColor = "#C8855F";

  const dedos: { dx: number; ext: number; alturaMax: number; angulo: number }[] = [
    { dx: -4.5, ext: indicador, alturaMax: 11, angulo: -2 },
    { dx: -1.5, ext: medio, alturaMax: 12, angulo: 0 },
    { dx: 1.5, ext: anelar, alturaMax: 11, angulo: 2 },
    { dx: 4.5, ext: minimo, alturaMax: 9, angulo: 5 },
  ];

  return (
    <g style={{ transform: `scale(${escalaMao})` }}>
      {/* Palma da mão */}
      <rect x={-8} y={-2} width={16} height={14} rx={7} fill={color} stroke={strokeColor} strokeWidth="0.8" />
      
      {/* Dedos (Indicador ao Mínimo) */}
      {dedos.map((d, i) => {
        const h = 4 + d.ext * 14;
        return (
          <g key={i} style={{ transform: `translate(${d.dx}px, 6px) rotate(${d.angulo * (1 - d.ext)}deg)`, transition: transicao }}>
            <rect
              x={-2}
              y={-h}
              width={4}
              height={h}
              rx={2}
              fill={color} 
              stroke={strokeColor} 
              strokeWidth="0.7"
              style={{ transition: transicao }}
            />
          </g>
        );
      })}

      {/* Polegar */}
      <g
        style={{
          transform: `translate(-8px, 4px) rotate(${25 - polegar * 60}deg)`,
          transformOrigin: "center left",
          transition: transicao,
        }}
      >
        <rect
          x={-1.5}
          y={-2}
          width={4}
          height={6 + polegar * 7}
          rx={2}
          fill={color} 
          stroke={strokeColor} 
          strokeWidth="0.7"
          style={{ transition: transicao, transform: "rotate(-90deg)" }}
        />
      </g>
    </g>
  );
}

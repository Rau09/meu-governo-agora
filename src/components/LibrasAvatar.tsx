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
    }, atual.duracao);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [aberto, tocando, indice, passos]);

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
          <div className="flex items-center justify-between bg-primary-soft px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
              Intérprete de Libras
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTocando((v) => !v)}
                aria-label={tocando ? "Pausar sinalização" : "Continuar sinalização"}
                className="flex size-7 items-center justify-center rounded-full bg-card/70 text-secondary-foreground"
              >
                {tocando ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIndice(0);
                  setTocando(true);
                }}
                aria-label="Repetir do início"
                className="flex size-7 items-center justify-center rounded-full bg-card/70 text-secondary-foreground"
              >
                <RotateCcw className="size-3.5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center bg-linear-to-b from-primary/10 to-primary/5 py-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_70%)]" />
            
            <SignerFigure pose={pose} />
          </div>

          {passo && (
            <div className="border-t border-border px-4 py-2 text-center">
              <p className="font-display text-base font-bold leading-none text-primary">{passo.glosa}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                {passo.datilologia ? `soletrando "${passo.palavra}"` : `sinal de "${passo.palavra}"`}
              </p>
            </div>
          )}

          <p className="px-4 py-3 text-sm leading-snug text-muted-foreground">
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
      )}
    </div>
  );
}

function SignerFigure({ pose }: { pose: Pose }) {
  return (
    <div className="relative h-56 w-44 drop-shadow-xl perspective-1000">
      <div 
        className="relative w-full h-full preserve-3d"
        style={{
          transform: `rotateY(${pose.tronco ?? 0}deg)`,
          transition: "transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Sombra no chão */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-black/10 blur-md rounded-[100%] z-0" />
        
        {/* Tronco Humano Estilizado (SVG) */}
        <svg viewBox="0 0 120 150" className="relative w-full h-full z-10 drop-shadow-md">
          {/* Cabeça */}
          <circle cx="60" cy="35" r="18" fill="#FAD1AF" stroke="#C8855F" strokeWidth="0.5" />
          
          {/* Cabelo Marrom com mais volume e estilo */}
          <path d="M42 28 Q60 5 78 28 L82 38 Q60 30 38 38 Z" fill="#4E342E" />
          <path d="M42 28 Q36 38 45 48" fill="none" stroke="#4E342E" strokeWidth="3" strokeLinecap="round" />
          <path d="M78 28 Q84 38 75 48" fill="none" stroke="#4E342E" strokeWidth="3" strokeLinecap="round" />
          
          {/* Rosto expressivo e amigável */}
          <g>
            {/* Olhos com brilho */}
            <circle cx="53" cy="35" r="2.2" fill="#2C3E50" />
            <circle cx="53.8" cy="34" r="0.8" fill="white" />
            <circle cx="67" cy="35" r="2.2" fill="#2C3E50" />
            <circle cx="67.8" cy="34" r="0.8" fill="white" />
            
            {/* Sobrancelhas suaves */}
            <path d="M49 30 Q53 28 57 30" fill="none" stroke="#4E342E" strokeWidth="1" strokeLinecap="round" />
            <path d="M63 30 Q67 28 71 30" fill="none" stroke="#4E342E" strokeWidth="1" strokeLinecap="round" />
          </g>
          
          {/* Nariz sutil */}
          <path d="M60 37 L60 40" fill="none" stroke="#D35400" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
          
          {/* Sorriso gentil e empático */}
          <path d="M52 46 Q60 52 68 46" fill="none" stroke="#E74C3C" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />

          {/* Pescoço */}
          <rect x="54" y="50" width="12" height="12" rx="2" fill="#FAD1AF" />

          {/* Tronco / Camiseta - Verde Cantu Conecta */}
          <path d="M30 62 Q60 58 90 62 L98 135 Q60 142 22 135 Z" fill="#2ECC71" />
          {/* Detalhes da roupa para volume */}
          <path d="M50 62 Q60 72 70 62" fill="none" stroke="#27AE60" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M30 85 Q60 88 90 85" fill="none" stroke="#27AE60" strokeWidth="0.5" opacity="0.3" />
          
          {/* Calça Sóbria */}
          <path d="M32 132 L40 148 L80 148 L88 132 Z" fill="#273746" />
        </svg>

        {/* Braços e mãos articuladas sobrepostos */}
        <svg
          viewBox="0 0 120 150"
          className="absolute inset-0 z-20 pointer-events-none"
        >
          <g
            style={{
              transformOrigin: "60px 120px",
              transition: "transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {/* Braço esquerdo (à direita na tela) */}
            <Braco
              x={90}
              y={70}
              rotacao={pose.bracoEsq}
              cotovelo={pose.coveloEsq}
              config={pose.maoEsq}
              color="#F5D5B8"
            />
            {/* Braço direito (à esquerda na tela) */}
            <Braco
              x={30}
              y={70}
              rotacao={pose.bracoDir}
              cotovelo={pose.coveloDir}
              config={pose.maoDir}
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
  color = "#F5D5B8",
}: {
  x: number;
  y: number;
  rotacao: number;
  cotovelo: number;
  config: Configuracao;
  color?: string;
}) {
  const ombro = rotacao * 1.6;
  const flexao = cotovelo * 1.1;
  const transicao = "transform 500ms cubic-bezier(0.4, 0, 0.2, 1)";
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
          <Mao config={config} color={color} />
        </g>
      </g>
    </g>
  );
}

/** Mão com palma e cinco dedos detalhados que abrem/fecham conforme a configuração. */
function Mao({ config, color = "#FAD1AF" }: { config: Configuracao; color?: string }) {
  const [polegar, indicador, medio, anelar, minimo] = DEDOS[config];
  const transicao = "transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1), height 450ms ease-in-out";

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
      {/* Sombra da palma */}
      <rect x={-7.5} y={-1.5} width={15} height={13} rx={6} fill="black" opacity="0.05" transform="translate(1, 1)" />
      {/* Palma da mão */}
      <rect x={-7.5} y={-2} width={15} height={13} rx={6} fill={color} stroke={strokeColor} strokeWidth="0.6" />
      
      {/* Dedos (Indicador ao Mínimo) */}
      {dedos.map((d, i) => {
        const h = 3.5 + d.ext * d.alturaMax;
        return (
          <g key={i} style={{ transform: `translate(${d.dx}px, 6px) rotate(${d.angulo * (1 - d.ext)}deg)`, transition: transicao }}>
            <rect
              x={-1.6}
              y={-h}
              width={3.2}
              height={h}
              rx={1.6}
              fill={color} 
              stroke={strokeColor} 
              strokeWidth="0.5"
              style={{ transition: transicao }}
            />
            {/* Detalhe da articulação do dedo (falange) */}
            {d.ext > 0.5 && (
              <line x1="-0.8" y1={-h/2} x2="0.8" y2={-h/2} stroke={strokeColor} strokeWidth="0.3" opacity="0.4" />
            )}
          </g>
        );
      })}

      {/* Polegar - Mais articulado e visível */}
      <g
        style={{
          transform: `translate(-7.5px, 3px) rotate(${20 - polegar * 50}deg)`,
          transformOrigin: "center left",
          transition: transicao,
        }}
      >
        <rect
          x={-1}
          y={-1.8}
          width={3.5}
          height={4 + polegar * 9}
          rx={1.75}
          fill={color} 
          stroke={strokeColor} 
          strokeWidth="0.5"
          style={{ transition: transicao, transform: "rotate(-90deg)" }}
        />
      </g>
    </g>
  );
}



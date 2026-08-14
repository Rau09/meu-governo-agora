import { useEffect, useMemo, useRef, useState } from "react";
import { Hand, X, Play, Pause, RotateCcw } from "lucide-react";
import { DEDOS, POSE_REPOUSO, montarSequencia, type Configuracao, type Pose } from "@/lib/libras";
import avatarAsset from "@/assets/monkey_avatar.jpg.asset.json";


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
    <div className="relative h-44 w-36 drop-shadow-lg perspective-1000">
      <div 
        className="relative w-full h-full preserve-3d"
        style={{
          transform: `rotateY(${pose.tronco ?? 0}deg)`,
          transition: "transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Sombra no chão */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-black/10 blur-md rounded-[100%] z-0" />
        
        {/* Imagem do Macaco */}
        <div className="relative w-full h-full z-10 overflow-hidden rounded-2xl border-2 border-white/50">
          <img 
            src={avatarAsset.url} 
            alt="Macaco Intérprete" 
            className="w-full h-full object-cover scale-110"
          />
        </div>

        {/* Braços e mãos articuladas sobrepostos */}
        <svg
          viewBox="0 0 120 150"
          className="absolute inset-0 z-20 pointer-events-none"
        >
          <g
            style={{
              transform: `rotate(${pose.tronco ?? 0}deg)`,
              transformOrigin: "60px 120px",
              transition: "transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {/* Braço esquerdo (à direita na tela) - Tons mais escuros para o macaco */}
            <Braco
              x={95}
              y={80}
              rotacao={pose.bracoEsq}
              cotovelo={pose.coveloEsq}
              config={pose.maoEsq}
              color="#5D4037"
            />
            {/* Braço direito (à esquerda na tela) */}
            <Braco
              x={25}
              y={80}
              rotacao={pose.bracoDir}
              cotovelo={pose.coveloDir}
              config={pose.maoDir}
              color="#5D4037"
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
  const transicao = "transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1)";
  return (
    <g
      style={{
        transform: `translate(${x}px, ${y}px) rotate(${ombro}deg)`,
        transition: transicao,
      }}
    >
      {/* ombro → cotovelo */}
      <rect x={-6} y={-4} width={12} height={28} rx={6} fill={color} />
      <g
        style={{
          transform: `translate(0px, 24px) rotate(${flexao}deg)`,
          transition: transicao,
        }}
      >
        {/* antebraço */}
        <rect x={-5.5} y={-3} width={11} height={24} rx={5.5} fill={color} />
        <g style={{ transform: "translate(0px, 22px)" }}>
          <Mao config={config} color={color} />
        </g>
      </g>
    </g>
  );
}

/** Mão com palma e cinco dedos que abrem/fecham conforme a configuração. */
function Mao({ config, color = "#F5D5B8" }: { config: Configuracao; color?: string }) {
  const [polegar, indicador, medio, anelar, minimo] = DEDOS[config];
  const transicao = "transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1), height 350ms ease-in-out";

  const dedos: { dx: number; ext: number; alturaMax: number }[] = [
    { dx: -4, ext: indicador, alturaMax: 10 },
    { dx: -1.4, ext: medio, alturaMax: 11 },
    { dx: 1.4, ext: anelar, alturaMax: 10 },
    { dx: 4, ext: minimo, alturaMax: 8.5 },
  ];

  const strokeColor = color === "#5D4037" ? "#3E2723" : "#D4A373";

  return (
    <g>
      {/* palma */}
      <rect x={-6} y={-2} width={12} height={10} rx={4} fill={color} stroke={strokeColor} strokeWidth="0.5" />
      {/* dedos */}
      {dedos.map((d, i) => {
        const h = 2.8 + d.ext * d.alturaMax;
        return (
          <rect
            key={i}
            x={d.dx - 1.25}
            y={5 - h + 2.5}
            width={2.5}
            height={h}
            rx={1.25}
            fill={color} stroke={strokeColor} strokeWidth="0.4"
            style={{ transition: transicao }}
          />
        );
      })}
      {/* polegar */}
      <rect
        x={-9}
        y={0}
        width={2.8}
        height={2.8 + polegar * 7.5}
        rx={1.4}
        fill={color} stroke={strokeColor} strokeWidth="0.4"
        style={{
          transform: `rotate(${25 - polegar * 45}deg)`,
          transformOrigin: "-7px 2px",
          transition: transicao,
        }}
      />
    </g>
  );
}



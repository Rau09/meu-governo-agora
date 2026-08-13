import { useEffect, useMemo, useRef, useState } from "react";
import { Hand, X, Play, Pause, RotateCcw } from "lucide-react";
import { DEDOS, POSE_REPOUSO, montarSequencia, type Configuracao, type Pose } from "@/lib/libras";

/**
 * Avatar de Libras: assistente de acessibilidade para pessoas surdas.
 * Fica flutuando sobre a interface e sinaliza o conteúdo da tela, seguindo
 * a sequência de sinais/datilologia montada em `src/lib/libras.ts`.
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
    // Mudamos o maxY para permitir o movimento para cima, calculando a partir do topo
    // O botão está fixado em bottom-24 (96px). 
    // Para subir, dy é negativo. O limite superior é quando o topo do botão toca o topo da tela.
    // O botão está a (window.innerHeight - 96 - 56) do topo.
    const currentFromTop = typeof window !== "undefined" ? window.innerHeight - 96 - 56 : 0;
    const minY = -currentFromTop + 16; // Mantém 16px de margem do topo
    const maxY = 96 - 16; // Mantém 16px de margem do fundo (bottom-24 é 96px, queremos evitar que suma pra baixo também)

    setPos({
      x: clamp(inicio.current.posX + dx, -maxX, 16),
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
          className={`absolute right-0 z-50 w-64 overflow-hidden rounded-3xl border border-border bg-card shadow-float ${
            // Se o botão estiver na metade superior da tela, mostra o popup abaixo dele.
            // pos.y negativo significa que subiu.
            // O botão está em bottom-24 (96px). Metade da tela é innerHeight / 2.
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

          <div className="flex justify-center bg-linear-to-b from-primary/10 to-primary/5 py-4 relative overflow-hidden">
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
    <svg
      viewBox="0 0 120 150"
      className="h-44 w-36 drop-shadow-md"
      role="img"
      aria-label="Avatar sinalizando em Libras"
    >
      <ellipse cx="60" cy="142" rx="30" ry="5" fill="currentColor" className="text-muted-foreground/25" />

      <g
        style={{
          transform: `rotate(${pose.tronco ?? 0}deg)`,
          transformOrigin: "60px 120px",
          transition: "transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Camisa */}
        <path d="M34 138 Q34 82 60 82 Q86 82 86 138 Z" className="fill-primary" />
        <path d="M47 82h26v8a13 13 0 0 1-26 0z" className="fill-white/20" />
        
        {/* Pescoço e Rosto (Traços humanos de animação) */}
        <rect x="55" y="68" width="10" height="14" rx="5" className="fill-[#F5D5B8]" />
        <circle cx="60" cy="48" r="23" className="fill-[#F5D5B8]" />
        
        {/* Cabelo */}
        <path d="M37 45a23 23 0 0 1 46 0c0-15-9-23-23-23S37 30 37 45z" className="fill-[#4A3728]" />
        
        {/* Olhos e Expressão */}
        <circle cx="52" cy="48" r="3" className="fill-[#333]" />
        <circle cx="68" cy="48" r="3" className="fill-[#333]" />
        <path d="M54 58q6 4 12 0" className="stroke-[#333]" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Braço esquerdo (à direita na tela) */}
        <Braco
          x={78}
          y={86}
          rotacao={pose.bracoEsq}
          cotovelo={pose.coveloEsq}
          config={pose.maoEsq}
        />
        {/* Braço direito (à esquerda na tela) */}
        <Braco
          x={42}
          y={86}
          rotacao={pose.bracoDir}
          cotovelo={pose.coveloDir}
          config={pose.maoDir}
        />
      </g>
    </svg>
  );
}

function Braco({
  x,
  y,
  rotacao,
  cotovelo,
  config,
}: {
  x: number;
  y: number;
  rotacao: number;
  cotovelo: number;
  config: Configuracao;
}) {
  // O braço em repouso aponta para baixo; ampliamos o ângulo para que os sinais
  // aconteçam na altura do peito e do rosto, como na sinalização real.
  // Ajuste de ângulos para que a sinalização aconteça na região da barriga/peito
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
      <rect x={-5} y={-4} width={10} height={26} rx={5} fill="#F5D5B8" />
      <g
        style={{
          transform: `translate(0px, 22px) rotate(${flexao}deg)`,
          transition: transicao,
        }}
      >
        {/* antebraço */}
        <rect x={-4.5} y={-3} width={9} height={22} rx={4.5} fill="#F5D5B8" />
        <g style={{ transform: "translate(0px, 20px)" }}>
          <Mao config={config} />
        </g>
      </g>
    </g>
  );
}

/** Mão com palma e cinco dedos que abrem/fecham conforme a configuração. */
function Mao({ config }: { config: Configuracao }) {
  const [polegar, indicador, medio, anelar, minimo] = DEDOS[config];
  const transicao = "transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1), height 350ms ease-in-out";

  const dedos: { dx: number; ext: number; alturaMax: number }[] = [
    { dx: -3.6, ext: indicador, alturaMax: 9 },
    { dx: -1.2, ext: medio, alturaMax: 10 },
    { dx: 1.2, ext: anelar, alturaMax: 9 },
    { dx: 3.6, ext: minimo, alturaMax: 7.5 },
  ];

  return (
    <g>
      {/* palma */}
      <rect x={-5} y={-2} width={10} height={9} rx={3.5} fill="#F5D5B8" stroke="#D4A373" strokeWidth="0.5" />
      {/* dedos */}
      {dedos.map((d, i) => {
        const h = 2.4 + d.ext * d.alturaMax;
        return (
          <rect
            key={i}
            x={d.dx - 1.1}
            y={5 - h + 2}
            width={2.2}
            height={h}
            rx={1.1}
            fill="#F5D5B8" stroke="#D4A373" strokeWidth="0.3"
            style={{ transition: transicao }}
          />
        );
      })}
      {/* polegar */}
      <rect
        x={-8.2}
        y={0}
        width={2.4}
        height={2.4 + polegar * 6.5}
        rx={1.2}
        fill="#F5D5B8" stroke="#D4A373" strokeWidth="0.3"
        style={{
          transform: `rotate(${25 - polegar * 45}deg)`,
          transformOrigin: "-7px 2px",
          transition: transicao,
        }}
      />
    </g>
  );
}

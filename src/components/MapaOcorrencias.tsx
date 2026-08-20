import { useMemo, useState } from "react";
import { MapPin, X } from "lucide-react";
import {
  BAIRROS,
  FILTROS_MAPA,
  NIVEIS,
  atrasada,
  concentracao,
  diasAberto,
  metaCategoria,
  nivel,
  type OcorrenciaGestao,
} from "@/lib/cantu-gestao";
import { STATUS_OCORRENCIA } from "@/lib/cantu-store";

/**
 * Mapa de ocorrências (mapa esquemático da cidade, sem dependências externas).
 * Os marcadores vêm da mesma lista usada pelo resto do painel.
 */
export function MapaOcorrencias({
  lista,
  filtroInicial = "todos",
  destaque,
}: {
  lista: OcorrenciaGestao[];
  filtroInicial?: string;
  destaque?: string[];
}) {
  const [filtro, setFiltro] = useState(filtroInicial);
  const [sel, setSel] = useState<OcorrenciaGestao | null>(null);

  const ativos = useMemo(() => lista.filter((o) => o.status !== "resolvido"), [lista]);
  const visiveis = useMemo(
    () => (filtro === "todos" ? ativos : ativos.filter((o) => metaCategoria(o.categoria).filtro === filtro)),
    [ativos, filtro],
  );

  const limites = useMemo(() => {
    const lats = BAIRROS.map((b) => b.lat);
    const lngs = BAIRROS.map((b) => b.lng);
    return {
      minLat: Math.min(...lats) - 0.012,
      maxLat: Math.max(...lats) + 0.012,
      minLng: Math.min(...lngs) - 0.014,
      maxLng: Math.max(...lngs) + 0.014,
    };
  }, []);

  const pos = (o: { lat: number; lng: number }) => ({
    left: `${((o.lng - limites.minLng) / (limites.maxLng - limites.minLng)) * 100}%`,
    top: `${(1 - (o.lat - limites.minLat) / (limites.maxLat - limites.minLat)) * 100}%`,
  });

  const conc = useMemo(() => {
    const cat = filtro === "todos" ? undefined : visiveis[0]?.categoria;
    const base = concentracao(
      visiveis.map((o) => o),
      cat,
    );
    return base[0];
  }, [visiveis, filtro]);

  return (
    <section className="rounded-[2.5rem] border border-border bg-card p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground">Mapa Regional de Operação</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Visão Estratégica Cantuquiriguaçu</p>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-black">{visiveis.length}</span>
      </div>

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTROS_MAPA.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              setFiltro(f.id);
              setSel(null);
            }}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 active:scale-95 ${
              filtro === f.id
                ? "bg-primary text-primary-foreground shadow-card"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {f.emoji} {f.rotulo}
          </button>
        ))}
      </div>

      <div className="relative mt-3 aspect-[16/9] w-full overflow-hidden rounded-[2rem] border border-border bg-[#f8f9fa] shadow-inner">
        {/* Google Maps inspired base style */}
        <div className="absolute inset-0">
          <svg viewBox="0 0 100 56" className="size-full" preserveAspectRatio="none">
            {/* Soft Green areas (Parks/Nature) */}
            <path d="M0 0 L40 0 L35 15 L0 20 Z M70 0 L100 0 L100 30 L80 25 Z" fill="#e8f5e9" />
            
            {/* Water areas (Lakes/Rivers) */}
            <path d="M-10 45 C 20 42, 40 48, 60 43 S 80 47, 110 44 L 110 56 L -10 56 Z" fill="#c6e2ff" />
          </svg>
        </div>

        {/* Street Network (Modern Google Maps aesthetic) */}
        <svg viewBox="0 0 100 56" className="absolute inset-0 size-full" aria-hidden="true" preserveAspectRatio="none">
          {/* Secondary Roads (White) */}
          <g className="stroke-white" fill="none" strokeWidth="0.8" strokeLinecap="round">
            <path d="M10 0 V56 M20 0 V56 M40 0 V56 M60 0 V56 M80 0 V56 M90 0 V56" />
            <path d="M0 10 H100 M0 20 H100 M0 40 H100 M0 50 H100" />
          </g>

          {/* Main Arteries (Soft Yellow/Orange) */}
          <path d="M0 30 C 25 29, 50 31, 100 30" className="fill-none stroke-[#fff9c4]" strokeWidth="3" strokeLinecap="round" />
          <path d="M30 0 C 29 25, 31 50, 30 56" className="fill-none stroke-[#fff9c4]" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Highway outlines for depth */}
          <path d="M0 30 C 25 29, 50 31, 100 30" className="fill-none stroke-[#fdd835]/30" strokeWidth="4" />
        </svg>

        {/* Nomes dos Bairros com Estética Clean */}
        {BAIRROS.map((b) => (
          <div
            key={b.nome}
            style={pos(b)}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
          >
            <span className="whitespace-nowrap rounded-md bg-background/60 px-1.5 py-0.5 text-[8px] font-bold tracking-widest text-muted-foreground/80 backdrop-blur-[2px]">
              {b.nome.toUpperCase()}
            </span>
          </div>
        ))}

        {/* Halo de concentração (Heatmap effect) */}
        {conc && conc.qtd >= 3 && (
          <div
            style={pos(BAIRROS.find((b) => b.nome === conc.bairro) ?? BAIRROS[0]!)}
            className="pointer-events-none absolute size-32 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-destructive/10 blur-xl"
          />
        )}

        {/* Marcadores Estilizados */}
        {visiveis.map((o) => {
          const n = nivel(o);
          const realce = destaque?.includes(o.protocolo);
          return (
            <button
              key={o.protocolo}
              type="button"
              onClick={() => setSel(o)}
              aria-label={`${o.categoria} em ${o.bairro}`}
              style={pos(o)}
              className={`absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border-2 shadow-lg transition-all duration-300 hover:scale-125 hover:z-10 active:scale-95 ${
                o.status === "resolvido"
                  ? "border-success/50 bg-success/20 opacity-60"
                  : n === "critico"
                    ? "border-destructive bg-destructive/20 animate-bounce shadow-destructive/20"
                    : n === "alta"
                      ? "border-accent bg-accent/20"
                      : "border-primary/40 bg-card/90"
              } ${realce ? "ring-2 ring-primary ring-offset-2 ring-offset-background z-20" : ""} ${sel?.protocolo === o.protocolo ? "scale-125 ring-2 ring-primary z-20" : ""}`}
            >
              <span className="text-base">{metaCategoria(o.categoria).emoji}</span>
              {n === "critico" && (
                <span className="absolute -right-1 -top-1 flex size-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex size-3 rounded-full bg-destructive"></span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {conc && conc.qtd >= 2 && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-secondary/50 p-2.5">
          <div className="flex size-6 items-center justify-center rounded-lg bg-destructive/20 text-destructive text-[10px] font-bold">
            !
          </div>
          <p className="text-[11px] font-semibold text-secondary-foreground">
            Alta densidade em <span className="text-primary font-bold">{conc.bairro}</span> — {conc.pct}% do total filtrado.
          </p>
        </div>
      )}

      {sel && <DetalheMarcador ocorrencia={sel} onFechar={() => setSel(null)} />}
    </section>
  );
}

function DetalheMarcador({ ocorrencia, onFechar }: { ocorrencia: OcorrenciaGestao; onFechar: () => void }) {
  const st = STATUS_OCORRENCIA.find((s) => s.id === ocorrencia.status)!;
  const n = NIVEIS[nivel(ocorrencia)];
  return (
    <div className="animate-in mt-3 rounded-2xl border border-border bg-background p-3 fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold leading-tight">
            {metaCategoria(ocorrencia.categoria).emoji} {ocorrencia.categoria}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {ocorrencia.bairro} · {new Date(ocorrencia.criadoEm).toLocaleDateString("pt-BR")} ·{" "}
            {diasAberto(ocorrencia)} dias em aberto
          </p>
        </div>
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar detalhes"
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${n.classe}`}>
          {n.emoji} {n.rotulo}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${st.classe}`}>
          {st.emoji} {st.rotulo}
        </span>
        {atrasada(ocorrencia) && (
          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
            ⏰ Atrasada
          </span>
        )}
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold">
          {ocorrencia.reclamacoes} reclamações
        </span>
      </div>

      {ocorrencia.foto && (
        <img
          src={ocorrencia.foto}
          alt={`Foto da ocorrência ${ocorrencia.protocolo}`}
          className="mt-2 h-32 w-full rounded-xl object-cover"
        />
      )}

      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{ocorrencia.descricao}</p>

      <a
        href={`https://www.google.com/maps?q=${ocorrencia.lat},${ocorrencia.lng}`}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary"
      >
        <MapPin className="size-3.5" /> {ocorrencia.lat.toFixed(5)}, {ocorrencia.lng.toFixed(5)}
      </a>
    </div>
  );
}

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
    <section className="rounded-3xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold">🗺️ Mapa Regional</h2>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold">{visiveis.length}</span>
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

      <div className="relative mt-3 aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-secondary/50">
        {/* malha viária esquemática */}
        <svg viewBox="0 0 100 75" className="absolute inset-0 size-full" aria-hidden="true">
          <rect width="100" height="75" className="fill-success/5" />
          <path d="M0 26 H100 M0 50 H100 M28 0 V75 M62 0 V75" className="stroke-border" strokeWidth="1.6" />
          <path d="M12 0 L44 75 M100 12 L40 75" className="stroke-border/60" strokeWidth="1" />
          <path d="M0 62 C25 58 40 70 100 64" className="fill-none stroke-primary/25" strokeWidth="2.5" />
        </svg>

        {/* nomes dos bairros */}
        {BAIRROS.map((b) => (
          <span
            key={b.nome}
            style={pos(b)}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-[9px] font-bold uppercase tracking-wide text-muted-foreground/70"
          >
            {b.nome}
          </span>
        ))}

        {/* halo de concentração */}
        {conc && conc.qtd >= 3 && (
          <span
            style={pos(BAIRROS.find((b) => b.nome === conc.bairro) ?? BAIRROS[0]!)}
            className="pointer-events-none absolute size-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-destructive/15 blur-[6px]"
          />
        )}

        {/* marcadores */}
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
              className={`absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[12px] shadow-card transition-transform duration-200 hover:scale-125 active:scale-95 ${
                n === "critico"
                  ? "border-destructive bg-destructive/15"
                  : n === "alta"
                    ? "border-accent bg-accent-soft"
                    : "border-border bg-card"
              } ${realce ? "ring-2 ring-primary" : ""} ${sel?.protocolo === o.protocolo ? "scale-125 ring-2 ring-primary" : ""}`}
            >
              {metaCategoria(o.categoria).emoji}
            </button>
          );
        })}
      </div>

      {conc && conc.qtd >= 2 && (
        <p className="mt-2 rounded-2xl bg-secondary p-2.5 text-[11px] font-medium">
          📍 {conc.bairro} — {conc.pct}% das ocorrências deste filtro ({conc.qtd} de {visiveis.length}).
        </p>
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

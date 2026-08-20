import { useMemo, useState, useEffect } from "react";
import { MapPin, X } from "lucide-react";
import {
  BAIRROS,
  FILTROS_MAPA,
  NIVEIS,
  atrasada,
  metaCategoria,
  nivel,
  diasAberto,
  concentracao,
  type OcorrenciaGestao,
} from "@/lib/cantu-gestao";
import { STATUS_OCORRENCIA } from "@/lib/cantu-store";

// Importação dinâmica do Leaflet para evitar problemas de SSR
let MapContainer: any;
let TileLayer: any;
let Marker: any;
let useMap: any;
let L: any;

/**
 * Componente de Mapa Real usando Leaflet.
 * Renderizado apenas no cliente para evitar erros de SSR.
 */
function RealMap({
  visiveis,
  destaque,
  onSelect,
  selProtocolo,
}: {
  visiveis: OcorrenciaGestao[];
  destaque?: string[];
  onSelect: (o: OcorrenciaGestao) => void;
  selProtocolo?: string;
}) {
  const center: [number, number] = [-25.4581, -52.9122]; // Quedas do Iguaçu / Cantu
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Carrega o Leaflet apenas no lado do cliente
    Promise.all([
      import("react-leaflet"),
      import("leaflet")
    ]).then(([ReactLeaflet, Leaflet]) => {
      MapContainer = ReactLeaflet.MapContainer;
      TileLayer = ReactLeaflet.TileLayer;
      Marker = ReactLeaflet.Marker;
      useMap = ReactLeaflet.useMap;
      L = Leaflet.default;
      setIsLoaded(true);
    });
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex size-full items-center justify-center bg-secondary/20">
        <span className="text-xs font-bold text-muted-foreground animate-pulse uppercase tracking-widest">
          Carregando Base Geográfica...
        </span>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={14}
      scrollWheelZoom={true}
      className="size-full z-0"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      
      {visiveis.map((o) => {
        const n = nivel(o);
        const meta = metaCategoria(o.categoria);
        const isSelected = selProtocolo === o.protocolo;
        const isHighlighted = destaque?.includes(o.protocolo);
        
        // Custom marker using divIcon for NexLine style
        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class="relative flex size-8 items-center justify-center rounded-xl border-2 shadow-lg transition-all duration-300 ${
              o.status === "resolvido"
                ? "border-green-500/50 bg-green-500/20 opacity-60"
                : n === "critico"
                  ? "border-red-500 bg-red-500/20 animate-bounce shadow-red-500/20"
                  : n === "alta"
                    ? "border-amber-500 bg-amber-500/20"
                    : "border-primary/40 bg-white/90"
            } ${isSelected ? "scale-125 ring-2 ring-primary z-50" : ""} ${isHighlighted ? "ring-2 ring-primary ring-offset-2 z-40" : ""}">
              <span class="text-base">${meta.emoji}</span>
              ${n === "critico" ? `
                <span class="absolute -right-1 -top-1 flex size-3">
                  <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                  <span class="relative inline-flex size-3 rounded-full bg-red-500"></span>
                </span>
              ` : ''}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        return (
          <Marker
            key={o.protocolo}
            position={[o.lat, o.lng]}
            icon={icon}
            eventHandlers={{
              click: () => onSelect(o),
            }}
          />
        );
      })}
    </MapContainer>
  );
}

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

      <div className="relative mt-3 aspect-[16/9] w-full overflow-hidden rounded-[2rem] border border-border bg-[#f8f9fa] shadow-inner isolate">
        <RealMap 
          visiveis={visiveis} 
          destaque={destaque} 
          onSelect={setSel} 
          selProtocolo={sel?.protocolo}
        />
        
        {/* Nomes dos Bairros - Apenas como Labels fixos ou podemos deixar o Leaflet lidar com isso */}
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 space-y-1">
          {BAIRROS.slice(0, 3).map((b) => (
             <div key={b.nome} className="inline-block mr-2">
                <span className="whitespace-nowrap rounded-md bg-white/80 px-1.5 py-0.5 text-[8px] font-bold tracking-widest text-muted-foreground/80 backdrop-blur-[2px] border border-border/50">
                  {b.nome.toUpperCase()}
                </span>
             </div>
          ))}
        </div>
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

import { useMemo, useState, useEffect, useRef } from "react";
import { X, MapPin, Loader2, AlertCircle } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  FILTROS_MAPA,
  NIVEIS,
  atrasada,
  diasAberto,
  metaCategoria,
  nivel,
  type OcorrenciaGestao,
} from "@/lib/cantu-gestao";
import { STATUS_OCORRENCIA } from "@/lib/cantu-store";

// O token deve ser configurado no painel da Lovable ou via variável de ambiente VITE_MAPBOX_ACCESS_TOKEN
const MAPBOX_TOKEN = (import.meta.env as any)['VITE_MAPBOX_ACCESS_TOKEN'] || "";

/**
 * Mapa de ocorrências REAL usando Mapbox.
 * Centralizado em Quedas do Iguaçu, PR.
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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  
  const [filtro, setFiltro] = useState(filtroInicial);
  const [sel, setSel] = useState<OcorrenciaGestao | null>(null);
  const [tokenMissing, setTokenMissing] = useState(!MAPBOX_TOKEN);

  const ativos = useMemo(() => lista.filter((o) => o.status !== "resolvido"), [lista]);
  const visiveis = useMemo(
    () => (filtro === "todos" ? ativos : ativos.filter((o) => metaCategoria(o.categoria).filtro === filtro)),
    [ativos, filtro],
  );

  // Inicializar Mapa
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11", // Estilo clean similar ao anterior
      center: [-52.9122, -25.4581], // Quedas do Iguaçu, PR
      zoom: 14,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true
    }));

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Atualizar Marcadores
  useEffect(() => {
    if (!map.current) return;

    // Remover marcadores que não estão mais visíveis
    const visiveisIds = new Set(visiveis.map(v => v.protocolo));
    Object.keys(markers.current).forEach(id => {
      if (!visiveisIds.has(id)) {
        markers.current[id].remove();
        delete markers.current[id];
      }
    });

    // Adicionar/Atualizar marcadores
    visiveis.forEach(o => {
      if (!o.lat || !o.lng) return;

      if (markers.current[o.protocolo]) {
        // Marcador já existe, atualizar posição ou realce se necessário
        markers.current[o.protocolo].setLngLat([o.lng, o.lat]);
      } else {
        // Criar elemento do marcador customizado
        const el = document.createElement("div");
        el.className = "custom-marker";
        
        // Cores baseadas no status/nível solicitado
        const n = nivel(o);
        let colorClass = "bg-primary";
        if (o.status === "resolvido") colorClass = "bg-success";
        else if (n === "critico") colorClass = "bg-destructive animate-pulse";
        else if (atrasada(o)) colorClass = "bg-accent";
        else if (o.status === "analise") colorClass = "bg-yellow-500";
        else if (o.status === "execucao") colorClass = "bg-blue-500";

        el.innerHTML = `
          <div class="relative flex items-center justify-center size-8 rounded-xl border-2 border-white shadow-lg text-white font-bold cursor-pointer transition-transform hover:scale-125 ${colorClass}">
            <span class="text-xs">${metaCategoria(o.categoria).emoji}</span>
          </div>
        `;

        el.addEventListener("click", () => setSel(o));

        const marker = new mapboxgl.Marker(el)
          .setLngLat([o.lng, o.lat])
          .addTo(map.current!);
        
        markers.current[o.protocolo] = marker;
      }
    });

    // Se houver destaque, centralizar
    if (destaque && destaque.length > 0) {
      const primeiro = visiveis.find(v => v.protocolo === destaque[0]);
      if (primeiro) {
        map.current.flyTo({ center: [primeiro.lng, primeiro.lat], zoom: 16 });
        setSel(primeiro);
      }
    }
  }, [visiveis, destaque]);

  if (tokenMissing) {
    return (
      <section className="rounded-[2.5rem] border border-border bg-card p-8 shadow-card text-center">
        <AlertCircle className="mx-auto size-12 text-destructive mb-4" />
        <h2 className="text-lg font-bold">Mapbox Token Faltando</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Para visualizar o mapa real, configure a variável <code className="bg-secondary px-1.5 py-0.5 rounded text-primary">VITE_MAPBOX_ACCESS_TOKEN</code> no arquivo <code className="bg-secondary px-1.5 py-0.5 rounded text-primary">.env</code> ou nas configurações do projeto.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-lg"
        >
          Tentar novamente
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-[2.5rem] border border-border bg-card p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground">Mapa Georreferenciado Cantu</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Operação Real Mapbox</p>
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

      <div className="relative mt-3 aspect-[16/9] w-full overflow-hidden rounded-[2rem] border border-border shadow-inner bg-secondary/20">
        <div ref={mapContainer} className="absolute inset-0 size-full" />
      </div>

      {sel && <DetalheMarcador ocorrencia={sel} onFechar={() => setSel(null)} />}
    </section>
  );
}

function DetalheMarcador({ ocorrencia, onFechar }: { ocorrencia: OcorrenciaGestao; onFechar: () => void }) {
  const st = STATUS_OCORRENCIA.find((s) => s.id === ocorrencia.status)!;
  const n = NIVEIS[nivel(ocorrencia)];
  
  return (
    <div className="animate-in mt-3 rounded-2xl border border-border bg-background p-4 fade-in slide-in-from-bottom-2 duration-300 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold leading-tight">
            {metaCategoria(ocorrencia.categoria).emoji} {ocorrencia.categoria}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {ocorrencia.bairro} · {new Date(ocorrencia.criadoEm).toLocaleDateString("pt-BR")} ·{" "}
            {diasAberto(ocorrencia)} dias em aberto
          </p>
        </div>
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar detalhes"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${n.classe}`}>
          {n.emoji} {n.rotulo}
        </span>
        <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${st.classe}`}>
          {st.emoji} {st.rotulo}
        </span>
        {atrasada(ocorrencia) && (
          <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-destructive border border-destructive/20">
            ⏰ Atrasada
          </span>
        )}
      </div>

      {ocorrencia.foto && (
        <img
          src={ocorrencia.foto}
          alt={`Foto da ocorrência ${ocorrencia.protocolo}`}
          className="mt-3 h-32 w-full rounded-xl object-cover border border-border shadow-sm"
        />
      )}

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground font-medium">{ocorrencia.descricao}</p>

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/50">
        <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg">
          {ocorrencia.protocolo}
        </span>
        <a
          href={`https://www.google.com/maps?q=${ocorrencia.lat},${ocorrencia.lng}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary hover:underline"
        >
          <MapPin className="size-3.5" /> Abrir no Google Maps
        </a>
      </div>
    </div>
  );
}

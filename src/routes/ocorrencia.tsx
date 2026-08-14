import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, MapPin, Send, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { AppShell, TopBar } from "@/components/AppShell";
import { CATEGORIAS_OCORRENCIA, useOcorrencias, type Ocorrencia } from "@/lib/cantu-store";

export const Route = createFileRoute("/ocorrencia")({
  head: () => ({
    meta: [
      { title: "Comunicar Problema — Cantu Conecta" },
      {
        name: "description",
        content:
          "Comunique buracos, iluminação, entulho e outros problemas urbanos na região Cantuquiriguaçu com foto e localização.",
      },
      { property: "og:title", content: "Comunicar Problema — Cantu Conecta" },
      {
        property: "og:description",
        content: "Envie o problema com foto e GPS e acompanhe o protocolo até a solução na sua cidade.",
      },
    ],
  }),
  component: ComunicarProblema,
});

function ComunicarProblema() {
  const { criar, ocorrencias } = useOcorrencias();
  const [categoria, setCategoria] = useState<string>(CATEGORIAS_OCORRENCIA[0]);
  const [descricao, setDescricao] = useState("");
  const [foto, setFoto] = useState<string | undefined>();
  const [local, setLocal] = useState<{ lat: number; lng: number } | undefined>();
  const [buscandoGps, setBuscandoGps] = useState(false);
  const [erro, setErro] = useState("");
  const [enviada, setEnviada] = useState<Ocorrencia | null>(null);
  const inputFoto = useRef<HTMLInputElement>(null);

  function escolherFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => setFoto(String(leitor.result));
    leitor.readAsDataURL(arquivo);
  }

  function pegarLocal() {
    if (!("geolocation" in navigator)) {
      setErro("Seu aparelho não permite localização automática. Descreva o endereço no texto.");
      return;
    }
    setBuscandoGps(true);
    setErro("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocal({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setBuscandoGps(false);
      },
      () => {
        setBuscandoGps(false);
        setErro("Não conseguimos pegar sua localização. Descreva o endereço no texto.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (descricao.trim().length < 10) {
      setErro("Descreva o problema com pelo menos 10 caracteres.");
      return;
    }
    setErro("");
    const nova = criar({
      categoria,
      descricao: descricao.trim(),
      ...(foto ? { foto } : {}),
      local,
    });
    setEnviada(nova);
  }

  if (enviada) {
    return (
      <AppShell librasMensagem="Solicitação enviada. Guarde o número do protocolo para acompanhar.">
        <TopBar titulo="Solicitação enviada" subtitulo="A equipe Cantu Conecta já recebeu seu chamado" />
        <div className="-mt-5 space-y-4 px-4 pb-10">
          <div className="animate-in rounded-3xl border border-border bg-card p-5 text-center shadow-card fade-in zoom-in-95 duration-500">
            <CheckCircle2 className="mx-auto size-12 text-success" />
            <h2 className="mt-3 text-base font-bold">Protocolo gerado</h2>
            <p className="mt-1 font-display text-2xl font-bold text-primary">{enviada.protocolo}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {enviada.categoria} · enviado em{" "}
              {new Date(enviada.criadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
            </p>
            <p className="mt-3 rounded-2xl bg-secondary p-3 text-xs text-muted-foreground">
              Status atual: 🔴 Pendente. A equipe técnica vai analisar e atualizar o andamento no 
              painel de gestão.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEnviada(null);
              setDescricao("");
              setFoto(undefined);
              setLocal(undefined);
            }}
            className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-card active:scale-[0.98]"
          >
            Comunicar outro problema
          </button>

          <MinhasSolicitacoes ocorrencias={ocorrencias} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell librasMensagem="Comunicar problema: escolha o tipo, tire uma foto, use o GPS e descreva o que está acontecendo.">
      <TopBar titulo="Comunicar Problema" subtitulo="Foto, localização e envio em um minuto" />

      <form onSubmit={enviar} className="-mt-5 space-y-4 px-4">
        <section className="rounded-3xl border border-border bg-card p-4 shadow-card">
          <h2 className="text-sm font-bold">Tipo de problema</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {CATEGORIAS_OCORRENCIA.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategoria(c)}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition-all duration-200 active:scale-95 ${
                  categoria === c
                    ? "bg-primary text-primary-foreground shadow-card"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-4 shadow-card">
          <h2 className="text-sm font-bold">Foto do local</h2>
          <input
            ref={inputFoto}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={escolherFoto}
            className="sr-only"
          />
          {foto ? (
            <div className="relative mt-3">
              <img src={foto} alt="Foto do problema comunicado" className="w-full rounded-2xl object-cover" />
              <button
                type="button"
                onClick={() => setFoto(undefined)}
                aria-label="Remover foto"
                className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-card/90 shadow-card"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputFoto.current?.click()}
              className="mt-3 flex min-h-24 w-full flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border bg-secondary/60 text-xs font-semibold text-muted-foreground"
            >
              <Camera className="size-6 text-primary" />
              Tirar ou escolher foto
            </button>
          )}
        </section>

        <section className="rounded-3xl border border-border bg-card p-4 shadow-card">
          <h2 className="text-sm font-bold">Localização</h2>
          <button
            type="button"
            onClick={pegarLocal}
            className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-secondary text-sm font-semibold active:scale-[0.98]"
          >
            <MapPin className="size-4 text-primary" />
            {buscandoGps ? "Buscando GPS..." : local ? "Atualizar localização" : "Usar minha localização"}
          </button>
          {local && (
            <p className="mt-2 text-xs text-muted-foreground">
              📍 {local.lat.toFixed(5)}, {local.lng.toFixed(5)}
            </p>
          )}
        </section>

        <section className="rounded-3xl border border-border bg-card p-4 shadow-card">
          <label htmlFor="descricao" className="text-sm font-bold">
            Descrição
          </label>
          <textarea
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={4}
            placeholder="Conte o que está acontecendo e onde fica (rua, número, bairro)."
            className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
          />
        </section>

        {erro && (
          <p className="flex items-center gap-2 rounded-2xl bg-destructive/10 p-3 text-xs font-medium text-destructive">
            <AlertTriangle className="size-4" /> {erro}
          </p>
        )}

        <button
          type="submit"
          className="flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-card active:scale-[0.98]"
        >
          <Send className="size-4" /> Enviar solicitação
        </button>

        <MinhasSolicitacoes ocorrencias={ocorrencias} />
      </form>
    </AppShell>
  );
}

function MinhasSolicitacoes({ ocorrencias }: { ocorrencias: Ocorrencia[] }) {
  if (ocorrencias.length === 0) return null;
  return (
    <section className="pb-4">
      <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
        Minhas solicitações
      </h2>
      <ul className="space-y-2">
        {ocorrencias.slice(0, 5).map((o) => (
          <li key={o.protocolo} className="rounded-2xl border border-border bg-card p-3 shadow-card">
            <Link to="/atendimento" search={{ protocolo: o.protocolo }} className="block">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{o.categoria}</span>
                <span className="rounded-full bg-primary-soft px-2 py-1 text-[10px] font-bold text-primary">
                  {o.protocolo}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{o.descricao}</p>
              <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                {new Date(o.criadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

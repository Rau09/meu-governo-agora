import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { Camera, MapPin, Send, CheckCircle2, AlertTriangle, X, Loader2, WifiOff } from "lucide-react";
import { AppShell, TopBar } from "@/components/AppShell";
import { CATEGORIAS_OCORRENCIA, useOcorrencias, type Ocorrencia, STATUS_OCORRENCIA } from "@/lib/cantu-store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/ocorrencia")({
  head: () => ({
    meta: [
      { title: "Comunicar Problema — NexLine" },
      {
        name: "description",
        content:
          "Comunique buracos, iluminação, entulho e outros problemas urbanos na região Cantuquiriguaçu com foto e localização.",
      },
      { property: "og:title", content: "Comunicar Problema — NexLine" },
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
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | undefined>();
  const [local, setLocal] = useState<{ lat: number; lng: number } | undefined>();
  const [enderecoManual, setEnderecoManual] = useState("");
  const [buscandoGps, setBuscandoGps] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [online, setOnline] = useState(true);
  const [enviada, setEnviada] = useState<Ocorrencia | null>(null);
  const inputFoto = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updateOnlineStatus = () => setOnline(navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  function escolherFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    
    // Validar tamanho (ex: 5MB)
    if (arquivo.size > 5 * 1024 * 1024) {
      setErro("A foto deve ter no máximo 5MB.");
      return;
    }

    setFoto(arquivo);
    const leitor = new FileReader();
    leitor.onload = () => setFotoPreview(String(leitor.result));
    leitor.readAsDataURL(arquivo);
  }

  function pegarLocal() {
    if (!("geolocation" in navigator)) {
      setErro("Seu aparelho não permite localização automática.");
      return;
    }
    setBuscandoGps(true);
    setErro("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocal({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setBuscandoGps(false);
      },
      (error) => {
        setBuscandoGps(false);
        if (error.code === error.PERMISSION_DENIED) {
          setErro("Acesso ao GPS negado. Por favor, informe o endereço manualmente.");
        } else {
          setErro("Localização indisponível no momento.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!online) {
      setErro("Sem conexão com a internet. Verifique seu sinal.");
      return;
    }
    if (descricao.trim().length < 10) {
      setErro("Descreva o problema com pelo menos 10 caracteres.");
      return;
    }
    if (!local && !enderecoManual.trim()) {
      setErro("Por favor, informe a localização via GPS ou endereço manual.");
      return;
    }

    setEnviando(true);
    setErro("");

    try {
      let fotoUrl = null;

      // 1. Upload da foto se existir (armazenada na pasta privada do usuário)
      if (foto) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Sessão expirada");

        const fileExt = foto.name.split('.').pop();
        const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('ocorrencias')
          .upload(filePath, foto);

        if (uploadError) throw uploadError;

        fotoUrl = filePath;
      }

      // 2. Criar ocorrência
      const nova = await criar({
        categoria,
        descricao: descricao.trim(),
        foto: fotoUrl,
        local: local || null,
        endereco: enderecoManual.trim() || null,
      });

      setEnviada(nova);
    } catch (err: any) {
      console.error(err);
      setErro("Ocorreu um erro ao enviar sua solicitação. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviada) {
    return (
      <AppShell>
        <TopBar titulo="Solicitação enviada" subtitulo="O NexLine já recebeu seu chamado" />
        <div className="-mt-5 space-y-4 px-4 pb-10">
          <div className="animate-in rounded-[2rem] border border-border bg-card p-6 text-center shadow-card fade-in zoom-in-95 duration-500">
            <div className="mx-auto size-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="size-10 text-success" />
            </div>
            <h2 className="text-lg font-bold">Sucesso!</h2>
            <p className="mt-1 text-sm text-muted-foreground">Sua ocorrência foi registrada com sucesso.</p>
            
            <div className="mt-6 p-4 rounded-2xl bg-secondary/50 border border-border/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Protocolo</p>
              <p className="mt-1 font-display text-2xl font-bold text-primary">{enviada.protocolo}</p>
            </div>

            <p className="mt-6 text-xs text-muted-foreground leading-relaxed">
              Você pode acompanhar o andamento desta solicitação no menu de "Minhas Solicitações" abaixo.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEnviada(null);
              setDescricao("");
              setFoto(null);
              setFotoPreview(undefined);
              setLocal(undefined);
              setEnderecoManual("");
            }}
            className="w-full rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-card active:scale-[0.98] transition-transform"
          >
            Comunicar outro problema
          </button>

          <MinhasSolicitacoes ocorrencias={ocorrencias} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <TopBar titulo="Comunicar Problema" subtitulo="Relate falhas urbanas em segundos" />

      {!online && (
        <div className="mx-4 -mt-4 mb-4 flex items-center gap-3 rounded-2xl bg-destructive/10 p-4 text-xs font-bold text-destructive animate-in fade-in slide-in-from-top-2">
          <WifiOff className="size-5" />
          Você está offline. Algumas funções podem não funcionar.
        </div>
      )}

      <form onSubmit={enviar} className="-mt-5 space-y-4 px-4 pb-10">
        <section className="rounded-[2rem] border border-border bg-card p-5 shadow-card">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">1. Categoria</h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS_OCORRENCIA.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategoria(c)}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
                  categoria === c
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-secondary text-secondary-foreground border border-transparent hover:border-primary/20"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-border bg-card p-5 shadow-card">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">2. Foto do local</h2>
          <input
            ref={inputFoto}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={escolherFoto}
            className="sr-only"
          />
          {fotoPreview ? (
            <div className="relative mt-2">
              <img src={fotoPreview} alt="Preview" className="w-full rounded-2xl aspect-video object-cover border border-border" />
              <button
                type="button"
                onClick={() => {
                  setFoto(null);
                  setFotoPreview(undefined);
                }}
                className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-lg text-destructive active:scale-90 transition-transform"
              >
                <X className="size-5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputFoto.current?.click()}
              className="mt-2 flex min-h-[140px] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-secondary/40 text-xs font-bold text-muted-foreground hover:bg-secondary/60 transition-colors"
            >
              <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Camera className="size-7" />
              </div>
              Tirar ou anexar foto
            </button>
          )}
        </section>

        <section className="rounded-[2rem] border border-border bg-card p-5 shadow-card">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">3. Localização</h2>
          
          <div className="space-y-3">
            <button
              type="button"
              onClick={pegarLocal}
              disabled={buscandoGps}
              className={`flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-secondary text-xs font-bold transition-all active:scale-[0.98] ${buscandoGps ? 'opacity-70' : 'hover:bg-secondary/80'}`}
            >
              {buscandoGps ? (
                <Loader2 className="size-4 animate-spin text-primary" />
              ) : (
                <MapPin className="size-4 text-primary" />
              )}
              {local ? "Localização atualizada" : "Usar meu GPS"}
            </button>
            
            {local && (
              <div className="flex items-center gap-2 px-1 text-[10px] font-bold text-success animate-in fade-in zoom-in-95">
                <CheckCircle2 className="size-3" />
                GPS: {local.lat.toFixed(6)}, {local.lng.toFixed(6)}
              </div>
            )}

            <div className="relative pt-2">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-border/50"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold">
                <span className="bg-card px-2 text-muted-foreground/60">Ou informe o endereço</span>
              </div>
            </div>

            <input 
              type="text"
              value={enderecoManual}
              onChange={(e) => setEnderecoManual(e.target.value)}
              placeholder="Rua, número, bairro..."
              className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-primary/50 transition-all"
            />
          </div>
        </section>

        <section className="rounded-[2rem] border border-border bg-card p-5 shadow-card">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">4. Descrição</h2>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={4}
            placeholder="Descreva detalhadamente o problema encontrado..."
            className="w-full rounded-2xl border border-border bg-background p-4 text-sm outline-none focus:border-primary/50 transition-all resize-none"
          />
        </section>

        {erro && (
          <div className="flex items-center gap-3 rounded-2xl bg-destructive/10 p-4 text-xs font-bold text-destructive animate-in shake-1">
            <AlertTriangle className="size-5 shrink-0" />
            <p>{erro}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-[1.5rem] bg-primary text-sm font-bold text-primary-foreground shadow-float transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70"
        >
          {enviando ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Enviando solicitação...
            </>
          ) : (
            <>
              <Send className="size-5" />
              Enviar Solicitação
            </>
          )}
        </button>

        <MinhasSolicitacoes ocorrencias={ocorrencias} />
      </form>
    </AppShell>
  );
}

function MinhasSolicitacoes({ ocorrencias }: { ocorrencias: Ocorrencia[] }) {
  if (ocorrencias.length === 0) return null;
  
  return (
    <section className="pt-6">
      <h2 className="mb-4 px-1 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
        Minhas Solicitações
      </h2>
      <div className="space-y-3">
        {ocorrencias.map((o) => {
          const statusConfig = STATUS_OCORRENCIA.find(s => s.id === o.status);
          
          return (
            <Link 
              key={o.protocolo} 
              to="/atendimento" 
              search={{ protocolo: o.protocolo }}
              className="block group active:scale-[0.98] transition-transform"
            >
              <div className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <MapPin className="size-4" />
                    </div>
                    <span className="text-sm font-bold">{o.categoria}</span>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border ${statusConfig?.classe}`}>
                    {statusConfig?.rotulo || o.status}
                  </span>
                </div>
                
                <p className="line-clamp-2 text-xs text-muted-foreground font-medium leading-relaxed">
                  {o.descricao}
                </p>
                
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/50">
                  <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-lg">
                    {o.protocolo}
                  </span>
                  <span className="text-[9px] font-bold text-muted-foreground/60">
                    {new Date(o.criadoEm).toLocaleDateString("pt-BR", { 
                      day: "2-digit", 
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

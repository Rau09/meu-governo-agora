import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { Camera, MapPin, Send, CheckCircle2, AlertTriangle, X, Loader2, WifiOff } from "lucide-react";
import { AppShell, TopBar } from "@/components/AppShell";
import { CATEGORIAS_OCORRENCIA_ANIMAL, useOcorrenciasAnimais, type OcorrenciaAnimal } from "@/lib/cantu-store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/ocorrencia-animal")({
  head: () => ({
    meta: [
      { title: "Comunicar Problema Animal — NexLine" },
      {
        name: "description",
        content: "Relate animais perdidos, feridos ou maus-tratos na região Cantuquiriguaçu com foto e localização.",
      },
      { property: "og:title", content: "Causa Animal — NexLine" },
      {
        property: "og:description",
        content: "Envie a ocorrência com foto e GPS e acompanhe o protocolo até a solução.",
      },
    ],
  }),
  component: ComunicarProblemaAnimal,
});

function ComunicarProblemaAnimal() {
  const { criar, ocorrencias } = useOcorrenciasAnimais();
  const [categoria, setCategoria] = useState<string>(CATEGORIAS_OCORRENCIA_ANIMAL[0]);
  const [descricao, setDescricao] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | undefined>();
  const [local, setLocal] = useState<{ lat: number; lng: number } | undefined>();
  const [enderecoManual, setEnderecoManual] = useState("");
  const [buscandoGps, setBuscandoGps] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [online, setOnline] = useState(true);
  const [enviada, setEnviada] = useState<OcorrenciaAnimal | null>(null);
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
        setErro("Acesso ao GPS negado ou indisponível.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!online) {
      setErro("Sem conexão com a internet.");
      return;
    }
    if (descricao.trim().length < 10) {
      setErro("Descreva a situação com pelo menos 10 caracteres.");
      return;
    }
    if (!local && !enderecoManual.trim()) {
      setErro("Informe a localização.");
      return;
    }

    setEnviando(true);
    setErro("");

    try {
      let fotoUrl = null;
      if (foto) {
        const fileExt = foto.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `animais/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('ocorrencias').upload(filePath, foto);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('ocorrencias').getPublicUrl(filePath);
        fotoUrl = publicUrl;
      }

      const nova = await criar({
        categoria,
        descricao: descricao.trim(),
        foto: fotoUrl,
        local: local || null,
        endereco: enderecoManual.trim() || null,
      });

      setEnviada(nova);
    } catch (err: any) {
      setErro("Erro ao enviar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviada) {
    return (
      <AppShell>
        <TopBar titulo="Ocorrência registrada" subtitulo="Equipe de proteção animal notificada" />
        <div className="-mt-5 space-y-4 px-4 pb-10">
          <div className="rounded-[2rem] border border-border bg-card p-6 text-center shadow-card">
            <div className="mx-auto size-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="size-10 text-success" />
            </div>
            <h2 className="text-lg font-bold">Protocolo Gerado</h2>
            <div className="mt-6 p-4 rounded-2xl bg-secondary/50 border border-border/50">
              <p className="mt-1 font-display text-2xl font-bold text-primary">{enviada.protocolo}</p>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">Acompanhe pelo assistente 24h.</p>
          </div>
          <Link to="/causa-animal" className="w-full block text-center rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-card">
            Voltar para Causa Animal
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <TopBar titulo="Causa Animal" subtitulo="Relate maus-tratos ou animal perdido" />
      <form onSubmit={enviar} className="-mt-5 space-y-4 px-4 pb-10">
        <section className="rounded-[2rem] border border-border bg-card p-5 shadow-card">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Categoria</h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS_OCORRENCIA_ANIMAL.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategoria(c)}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${categoria === c ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-border bg-card p-5 shadow-card">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Foto</h2>
          <input ref={inputFoto} type="file" accept="image/*" capture="environment" onChange={escolherFoto} className="sr-only" />
          {fotoPreview ? (
            <div className="relative mt-2">
              <img src={fotoPreview} alt="Preview" className="w-full rounded-2xl aspect-video object-cover" />
              <button type="button" onClick={() => { setFoto(null); setFotoPreview(undefined); }} className="absolute right-3 top-3 size-10 rounded-full bg-white/90 text-destructive flex items-center justify-center">
                <X className="size-5" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => inputFoto.current?.click()} className="mt-2 flex min-h-[140px] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-secondary/40 text-xs font-bold text-muted-foreground">
              <Camera className="size-7 text-primary" />
              Tirar ou anexar foto
            </button>
          )}
        </section>

        <section className="rounded-[2rem] border border-border bg-card p-5 shadow-card">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Localização</h2>
          <div className="space-y-3">
            <button type="button" onClick={pegarLocal} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-secondary text-xs font-bold">
              {buscandoGps ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4 text-primary" />}
              {local ? "GPS Capturado" : "Usar meu GPS"}
            </button>
            <input 
              type="text" 
              value={enderecoManual} 
              onChange={(e) => setEnderecoManual(e.target.value)} 
              placeholder="Ou informe o endereço manualmente..." 
              className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm" 
            />
          </div>
        </section>

        <section className="rounded-[2rem] border border-border bg-card p-5 shadow-card">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Descrição</h2>
          <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={4} placeholder="Conte o que aconteceu..." className="w-full rounded-2xl border border-border bg-background p-4 text-sm resize-none" />
        </section>

        {erro && <div className="p-4 rounded-2xl bg-destructive/10 text-destructive text-xs font-bold flex gap-2"><AlertTriangle className="size-4 shrink-0" /> {erro}</div>}

        <button type="submit" disabled={enviando} className="h-14 w-full rounded-[1.5rem] bg-primary text-sm font-bold text-primary-foreground shadow-float disabled:opacity-70 flex items-center justify-center gap-2">
          {enviando ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
          Registrar Ocorrência
        </button>
      </form>
    </AppShell>
  );
}

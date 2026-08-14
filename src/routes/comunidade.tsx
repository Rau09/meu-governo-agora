import { createFileRoute } from "@tanstack/react-router";
import { AppShell, TopBar } from "@/components/AppShell";
import { MapPin, Camera, AlertCircle, MessageSquare, History, CheckCircle2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useOcorrencias } from "@/lib/cantu-store";

export const Route = createFileRoute("/comunidade")({
  component: ComunidadePage,
});

function ComunidadePage() {
  const { ocorrencias } = useOcorrencias();

  return (
    <AppShell librasMensagem="Módulo Comunidade: registre problemas na sua rua, como iluminação ou buracos, e acompanhe a resolução pela prefeitura.">
      <TopBar titulo="Comunidade" subtitulo="Cuide do seu bairro e da sua rua." />
      
      <div className="px-5 py-6 space-y-8">
        <section>
          <Link to="/ocorrencia" className="flex items-center gap-4 p-6 rounded-[2rem] bg-primary text-primary-foreground shadow-lg active:scale-[0.98] transition-transform">
            <div className="size-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <Camera className="size-8" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg">Registrar Problema</h2>
              <p className="text-xs opacity-80">Buracos, iluminação, lixo, etc.</p>
            </div>
          </Link>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Minhas Solicitações</h2>
            <Link to="/perfil" className="text-[10px] font-bold text-primary">Ver histórico</Link>
          </div>
          
          <div className="space-y-3">
            {ocorrencias.length > 0 ? (
              ocorrencias.slice(0, 3).map((o) => (
                <div key={o.protocolo} className="p-4 rounded-2xl border border-border bg-card flex items-center gap-4">
                  <div className={`size-10 rounded-xl flex items-center justify-center ${
                    o.status === 'resolvido' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                  }`}>
                    {o.status === 'resolvido' ? <CheckCircle2 className="size-5" /> : <History className="size-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{o.categoria}</p>
                    <p className="text-[10px] text-muted-foreground">Protocolo: {o.protocolo}</p>
                  </div>
                  <div className="text-[10px] font-bold px-2 py-1 rounded-full bg-secondary text-muted-foreground uppercase">
                    {o.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 rounded-3xl border border-dashed border-border bg-secondary/20">
                <p className="text-xs text-muted-foreground">Você ainda não registrou ocorrências.</p>
              </div>
            )}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <Link 
            to="/gestao" 
            className="p-5 rounded-3xl bg-secondary border border-border flex flex-col gap-3 active:scale-95 transition-transform"
          >
            <MapPin className="size-6 text-primary" />
            <span className="font-bold text-sm">Mapa da Cidade</span>
          </Link>
          <Link 
            to="/atendimento" 
            className="p-5 rounded-3xl bg-secondary border border-border flex flex-col gap-3 active:scale-95 transition-transform"
          >
            <MessageSquare className="size-6 text-primary" />
            <span className="font-bold text-sm">Sugestões</span>
          </Link>
        </section>

        <Link 
          to="/atendimento" 
          className="p-5 rounded-3xl bg-accent-gradient text-accent-foreground flex items-center gap-4 active:scale-[0.98] transition-transform"
        >
          <AlertCircle className="size-8 opacity-50" />
          <div>
            <p className="font-bold text-sm">Prevenção Cantu</p>
            <p className="text-[10px] opacity-90">Participe dos mutirões de limpeza no seu bairro.</p>
          </div>
        </Link>
      </div>
    </AppShell>
  );
}

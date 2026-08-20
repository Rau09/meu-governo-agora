import { createFileRoute } from "@tanstack/react-router";
import { AppShell, TopBar } from "@/components/AppShell";
import { Stethoscope, CalendarPlus, Pill, Activity, ClipboardList, Clock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAgendamentos } from "@/lib/cantu-store";

export const Route = createFileRoute("/saude")({
  component: SaudePage,
});

function SaudePage() {
  const { agendamentos } = useAgendamentos();

  return (
    <AppShell >
      <TopBar titulo="Minha Saúde" subtitulo="Agendamentos, exames e vacinação." />
      
      <div className="px-5 py-6 space-y-8">
        <section>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/agendamento" className="flex flex-col gap-3 p-5 rounded-3xl bg-success/10 border border-success/20 text-success active:scale-95 transition-transform">
              <CalendarPlus className="size-8" />
              <span className="font-bold text-sm">Novo Agendamento</span>
            </Link>
            <Link to="/medicamentos" className="flex flex-col gap-3 p-5 rounded-3xl bg-primary/10 border border-primary/20 text-primary active:scale-95 transition-transform">
              <Pill className="size-8" />
              <span className="font-bold text-sm">Medicamentos</span>
            </Link>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Meus Agendamentos</h2>
          <div className="space-y-3">
            {agendamentos.length > 0 ? (
              agendamentos.map((a) => (
                <div key={a.id} className="p-4 rounded-2xl border border-border bg-card flex items-center gap-4">
                  <div className={`size-10 rounded-xl flex items-center justify-center ${a.status === 'concluido' ? 'bg-muted text-muted-foreground' : 'bg-success/10 text-success'}`}>
                    {a.status === 'concluido' ? <ClipboardList className="size-5" /> : <Clock className="size-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{a.servico}</p>
                    <p className="text-xs text-muted-foreground">{a.unidade} · {a.hora} · {new Date(a.data).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                    a.status === 'concluido' ? 'bg-muted text-muted-foreground' : 'bg-success/10 text-success'
                  }`}>
                    {a.status}
                  </div>
                </div>

              ))
            ) : (
              <div className="text-center py-10 rounded-3xl border border-dashed border-border">
                <Activity className="size-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Nenhum agendamento futuro.</p>
              </div>
            )}
          </div>
        </section>

        <section className="p-6 rounded-[2rem] bg-accent-gradient text-accent-foreground">
          <div className="flex items-center gap-3 mb-4">
            <ClipboardList className="size-6" />
            <h2 className="font-bold">Campanhas Ativas</h2>
          </div>
          <div className="space-y-3">
            <Link to="/agendamento" className="block p-4 rounded-2xl bg-white/10 backdrop-blur-sm active:scale-95 transition-transform">
              <p className="font-bold text-sm">Vacinação contra Gripe</p>
              <p className="text-xs opacity-80">Disponível em todas as UBS do município.</p>
            </Link>
            <Link to="/agendamento" className="block p-4 rounded-2xl bg-white/10 backdrop-blur-sm active:scale-95 transition-transform">
              <p className="font-bold text-sm">Prevenção: Saúde Bucal</p>
              <p className="text-xs opacity-80">Mutirão de limpeza no Centro Odontológico.</p>
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

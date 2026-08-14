import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Stethoscope,
  PawPrint,
  MapPin,
  MessageCircle,
  CalendarPlus,
  ArrowRight,
  UserRound,
  Search,
  Activity,
  ShieldCheck,
  Bell,
  Building2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAgendamentos, useCidadao, useOcorrencias } from "@/lib/cantu-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cantu Conecta — Saúde e Causa Animal na Cantuquiriguaçu" },
      {
        name: "description",
        content:
          "Sua cidade, sua saúde, seu cuidado. Plataforma de tecnologia cívica para aproximar o cidadão do poder público.",
      },
      { property: "og:title", content: "Cantu Conecta — Sua cidade, sua saúde, seu cuidado" },
      {
        property: "og:description",
        content: "Agende consultas, acompanhe a causa animal e participe da sua comunidade.",
      },
    ],
  }),
  component: Inicio,
});

const atalhosPrincipais = [
  { to: "/saude", label: "Minha Saúde", icon: Stethoscope, tone: "bg-success text-success-foreground", desc: "Agendamentos e exames" },
  { to: "/causa-animal", label: "Causa Animal", icon: PawPrint, tone: "bg-accent-gradient text-accent-foreground", desc: "Adoção e ocorrências" },
] as const;

const acoesRapidas = [
  { to: "/agendamento", label: "Agendar", icon: CalendarPlus },
  { to: "/atendimento", label: "Assistente", icon: MessageCircle },
  { to: "/ocorrencia", label: "Problemas", icon: MapPin },
  { to: "/medicamentos", label: "Remédios", icon: Search },
  { to: "/comunidade", label: "Cidade", icon: Building2 },
] as const;

function Inicio() {
  const { cidadao } = useCidadao();
  const { agendamentos } = useAgendamentos();
  const { ocorrencias } = useOcorrencias();
  const proximo = agendamentos[0];

  return (
    <AppShell librasMensagem="Bem-vindo ao Cantu Conecta. Aqui você acessa serviços de saúde, cuida da causa animal e participa da melhoria da sua cidade.">
      <header className="bg-hero px-5 pb-12 pt-10 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="size-8 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg">C</div>
             <span className="font-display text-xl font-bold tracking-tight">Cantu Conecta</span>
          </div>
          <button 
            type="button"
            className="relative p-2 rounded-full bg-white/10 opacity-50 cursor-default"
            disabled
          >
            <Bell className="size-5" />
            <span className="absolute top-1 right-1 size-2 rounded-full bg-destructive border-2 border-primary" />
          </button>
        </div>

        <h1 className="mt-8 text-3xl font-bold leading-tight">
          {cidadao ? `Olá, ${cidadao.nome.split(" ")[0]}!` : "Sua cidade, seu cuidado."}
        </h1>
        <p className="mt-2 max-w-[30ch] text-sm opacity-90">
          Aproximando você dos serviços públicos de forma inteligente e humana.
        </p>

        {!cidadao && (
          <Link
            to="/registro"
            className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-white px-6 text-sm font-bold text-primary shadow-lg active:scale-95 transition-transform"
          >
            Criar meu acesso <ArrowRight className="size-4" />
          </Link>
        )}
      </header>

      <section className="-mt-8 px-5">
        <div className="grid grid-cols-2 gap-4">
          {atalhosPrincipais.map(({ to, label, icon: Icon, tone, desc }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col justify-between rounded-[2rem] p-5 shadow-float aspect-square transition-transform active:scale-95 ${tone}`}
            >
              <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Icon className="size-7" />
              </div>
              <div>
                <span className="block text-lg font-bold leading-tight">{label}</span>
                <span className="text-[10px] opacity-80 font-medium">{desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 px-5">
        <div className="grid grid-cols-5 gap-1.5">
          {acoesRapidas.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border border-border/50 shadow-sm active:bg-secondary transition-colors"
            >
              <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                <Icon className="size-5" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {proximo && (
        <section className="mt-8 px-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Saúde: Próxima Consulta</h2>
            <Link to="/saude" className="text-[10px] font-bold text-primary">Ver todos</Link>
          </div>
          <Link
            to="/agendamento"
            className="group flex items-center gap-4 rounded-[2rem] border border-success/20 bg-success/5 p-5 transition-all hover:bg-success/10"
          >
            <div className="size-12 rounded-2xl bg-success/10 flex items-center justify-center text-success">
              <Activity className="size-6" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">{proximo.servico}</p>
              <p className="text-xs text-muted-foreground">
                {proximo.unidade} · {proximo.hora}
              </p>
            </div>
            <div className="size-8 rounded-full bg-white flex items-center justify-center text-success shadow-sm group-active:scale-90 transition-transform">
              <ArrowRight className="size-4" />
            </div>
          </Link>
        </section>
      )}

      <section className="mt-8 px-5 pb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Notificações da Cidade</h2>
        </div>
        <div className="space-y-3">
          {ocorrencias.slice(0, 2).map((o) => (
            <div key={o.protocolo} className="p-4 rounded-2xl bg-card border border-border/50 flex gap-3">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <MapPin className="size-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold">{o.categoria}</h3>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{o.descricao}</p>
                <p className="text-[9px] font-medium text-primary">Protocolo: {o.protocolo}</p>
              </div>
            </div>
          ))}
          {ocorrencias.length === 0 && (
            <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border/50 flex gap-4">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <ShieldCheck className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold">Cidade Tranquila</h3>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Não há ocorrências críticas registradas no momento. Continue participando para manter nossa cidade segura.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}


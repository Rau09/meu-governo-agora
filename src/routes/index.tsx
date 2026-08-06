import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Stethoscope,
  GraduationCap,
  Truck,
  FileText,
  CalendarPlus,
  MessageCircle,
  ShieldCheck,
  Clock,
  ArrowRight,
  UserRound,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAgendamentos, useCidadao } from "@/lib/city-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QI Cidadão — App da Prefeitura de Quedas do Iguaçu" },
      {
        name: "description",
        content:
          "Agende consultas, resolva serviços urbanos e fale com a prefeitura 24/7 pelo app QI Cidadão de Quedas do Iguaçu.",
      },
      { property: "og:title", content: "QI Cidadão — App da Prefeitura de Quedas do Iguaçu" },
      {
        property: "og:description",
        content: "Saúde, educação e serviços urbanos na palma da mão, sem fila e com atendimento 24 horas.",
      },
    ],
  }),
  component: Inicio,
});

const atalhos = [
  { to: "/agendamento", label: "Agendar consulta", icon: CalendarPlus, tone: "bg-primary text-primary-foreground" },
  { to: "/atendimento", label: "Atendimento 24/7", icon: MessageCircle, tone: "bg-accent-gradient text-accent-foreground" },
  { to: "/servicos", label: "Serviços da cidade", icon: Truck, tone: "bg-card text-foreground" },
  { to: "/registro", label: "Meu cadastro", icon: UserRound, tone: "bg-card text-foreground" },
] as const;

const areas = [
  { icon: Stethoscope, nome: "Saúde", desc: "Consultas, vacinas e exames" },
  { icon: GraduationCap, nome: "Educação", desc: "Matrícula, creche e transporte" },
  { icon: Truck, nome: "Urbanos", desc: "Coleta, iluminação e obras" },
  { icon: FileText, nome: "Cidadania", desc: "IPTU, alvarás e social" },
];

function Inicio() {
  const { cidadao } = useCidadao();
  const { agendamentos } = useAgendamentos();
  const proximo = agendamentos[0];

  return (
    <AppShell librasMensagem="Tela inicial: aqui você agenda consultas, acessa serviços da cidade e fala com a prefeitura a qualquer hora.">
      <header className="bg-hero px-5 pb-10 pt-10 text-primary-foreground">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold">
            <span className="size-2 animate-pulse rounded-full bg-success" />
            Sistema ativo 24/7
          </span>
          <span className="font-display text-lg font-bold">QI</span>
        </div>

        <h1 className="mt-6 text-3xl font-bold leading-tight">
          {cidadao ? `Olá, ${cidadao.nome.split(" ")[0]}!` : "Sua cidade na palma da mão"}
        </h1>
        <p className="mt-2 max-w-[28ch] text-sm opacity-90">
          Atendimento público sem fila, sem deslocamento e sem espera.
        </p>

        {!cidadao && (
          <Link
            to="/registro"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-card px-5 text-sm font-semibold text-primary shadow-card"
          >
            Criar meu acesso <ArrowRight className="size-4" />
          </Link>
        )}
      </header>

      <section className="-mt-6 px-4">
        <div className="grid grid-cols-2 gap-3">
          {atalhos.map(({ to, label, icon: Icon, tone }) => (
            <Link
              key={to}
              to={to}
              className={`flex min-h-24 flex-col justify-between rounded-3xl p-4 shadow-card transition-transform active:scale-[0.97] ${tone}`}
            >
              <Icon className="size-6" />
              <span className="text-sm font-semibold leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {proximo && (
        <section className="mt-6 px-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Próximo agendamento
          </h2>
          <Link
            to="/agendamento"
            className="flex items-center gap-3 rounded-3xl border border-primary/20 bg-primary-soft p-4"
          >
            <Clock className="size-8 text-primary" />
            <div className="flex-1">
              <p className="font-semibold">{proximo.servico}</p>
              <p className="text-xs text-muted-foreground">
                {proximo.unidade} · {new Date(proximo.data + "T00:00").toLocaleDateString("pt-BR")} às {proximo.hora}
              </p>
            </div>
            <ArrowRight className="size-4 text-primary" />
          </Link>
        </section>
      )}

      <section className="mt-6 px-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Áreas de atendimento
        </h2>
        <ul className="space-y-2">
          {areas.map(({ icon: Icon, nome, desc }) => (
            <li key={nome}>
              <Link
                to="/servicos"
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card"
              >
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <Icon className="size-5" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{nome}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 px-4">
        <div className="flex items-start gap-3 rounded-3xl bg-secondary p-4">
          <ShieldCheck className="size-6 text-primary" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Acessibilidade real: intérprete de Libras em todas as telas, linguagem simples e canais
            alternativos de atendimento para todos os cidadãos.
          </p>
        </div>
      </section>
    </AppShell>
  );
}

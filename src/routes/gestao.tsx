import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { TrendingDown, Users, BarChart3, Clock3, CheckCircle2 } from "lucide-react";
import { AppShell, TopBar } from "@/components/AppShell";
import { AREAS, useAgendamentos } from "@/lib/city-store";

export const Route = createFileRoute("/gestao")({
  head: () => ({
    meta: [
      { title: "Painel de Gestão — QI Cidadão" },
      {
        name: "description",
        content: "Painel da Prefeitura de Quedas do Iguaçu com demanda por área, fila de atendimentos e indicadores em tempo real.",
      },
      { property: "og:title", content: "Painel de Gestão — QI Cidadão" },
      { property: "og:description", content: "Gestão por dados: demanda, tempo de espera e produtividade das equipes." },
    ],
  }),
  component: Gestao,
});

function Gestao() {
  const { agendamentos } = useAgendamentos();

  const porArea = useMemo(() => {
    const base = AREAS.map((a) => ({ nome: a.nome, total: 0 }));
    for (const ag of agendamentos) {
      const item = base.find((b) => b.nome === ag.area);
      if (item) item.total += 1;
    }
    const max = Math.max(1, ...base.map((b) => b.total));
    return base.map((b) => ({ ...b, pct: Math.round((b.total / max) * 100) }));
  }, [agendamentos]);

  const kpis = [
    { icon: TrendingDown, label: "Tempo de espera", valor: "−70%", nota: "vs. atendimento presencial" },
    { icon: Users, label: "Atendimentos no app", valor: String(agendamentos.length), nota: "agendamentos ativos" },
    { icon: Clock3, label: "Disponibilidade", valor: "24/7", nota: "canal digital sempre aberto" },
    { icon: BarChart3, label: "Gestão por dados", valor: "100%", nota: "relatórios automáticos" },
  ];

  return (
    <AppShell librasMensagem="Painel de gestão da prefeitura, com indicadores e fila de atendimentos.">
      <TopBar titulo="Painel de Gestão" subtitulo="Uso interno da Prefeitura · dados em tempo real" />

      <div className="-mt-5 space-y-6 px-4">
        <section className="grid grid-cols-2 gap-3">
          {kpis.map(({ icon: Icon, label, valor, nota }) => (
            <div key={label} className="rounded-3xl border border-border bg-card p-4 shadow-card">
              <Icon className="size-5 text-primary" />
              <p className="mt-2 font-display text-2xl font-bold">{valor}</p>
              <p className="text-xs font-semibold">{label}</p>
              <p className="text-[11px] text-muted-foreground">{nota}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-border bg-card p-4 shadow-card">
          <h2 className="text-sm font-bold">Demanda por área</h2>
          <ul className="mt-3 space-y-3">
            {porArea.map((a) => (
              <li key={a.nome}>
                <div className="flex justify-between text-xs font-medium">
                  <span>{a.nome}</span>
                  <span className="text-muted-foreground">{a.total}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-secondary">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${a.pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Fila de atendimentos
          </h2>
          {agendamentos.length === 0 ? (
            <p className="rounded-3xl bg-secondary p-4 text-xs text-muted-foreground">
              Nenhum agendamento na fila. Novos pedidos aparecem aqui automaticamente.
            </p>
          ) : (
            <ul className="space-y-2">
              {agendamentos.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card"
                >
                  <CheckCircle2 className="size-5 text-success" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{a.servico}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.nome} · {a.unidade} · {new Date(a.data + "T00:00").toLocaleDateString("pt-BR")} {a.hora}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary-soft px-2 py-1 text-[10px] font-bold text-primary">
                    #{a.id}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}

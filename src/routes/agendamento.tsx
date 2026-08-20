import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarCheck, CheckCircle2, Trash2, MapPin, Clock, Eye } from "lucide-react";
import { AppShell, TopBar } from "@/components/AppShell";

import { AREAS, HORARIOS, useAgendamentos, useCidadao } from "@/lib/cantu-store";


type Busca = { servico?: string };

export const Route = createFileRoute("/agendamento")({
  validateSearch: (search: Record<string, unknown>): Busca =>
    typeof search['servico'] === "string" ? { servico: search['servico'] } : {},
  head: () => ({
    meta: [
      { title: "Agendar Atendimento — NexLine" },
      {
        name: "description",
        content: "Agende consultas de saúde, serviços para animais e solicitações urbanas na região Cantuquiriguaçu.",
      },
      { property: "og:title", content: "Agendar Atendimento — NexLine" },
      { property: "og:description", content: "Escolha o serviço, a unidade e o horário. Sem fila, sem espera na sua cidade." },
    ],
  }),
  component: Agendamento,
});

function Agendamento() {
  const { servico: servicoInicial } = Route.useSearch();
  const { cidadao } = useCidadao();
  
  const { agendamentos, criar, cancelar } = useAgendamentos();


  const areaInicial = useMemo(
    () => AREAS.find((a) => a.servicos.some((s) => s === servicoInicial))?.id ?? AREAS[0].id,
    [servicoInicial],
  );

  const [areaId, setAreaId] = useState<string>(areaInicial);
  const area = AREAS.find((a) => a.id === areaId) ?? AREAS[0];
  const [servico, setServico] = useState<string>(servicoInicial ?? area.servicos[0]);
  const [unidade, setUnidade] = useState<string>(
    cidadao?.municipio ? `${area.unidades[0]} (${cidadao.municipio})` : area.unidades[0]
  );
  const [data, setData] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [hora, setHora] = useState<string>("");
  const [feito, setFeito] = useState<string | null>(null);

  function trocarArea(id: string) {
    const nova = AREAS.find((a) => a.id === id) ?? AREAS[0];
    setAreaId(id);
    setServico(nova.servicos[0]);
    setUnidade(nova.unidades[0]);
  }

  function confirmar() {
    if (!hora) return;
    const novo = criar({
      area: area.nome,
      servico,
      unidade,
      data,
      hora,
      nome: cidadao?.nome ?? "Cidadão",
    });
    setFeito(novo.id);
    setHora("");
  }

  return (
    <AppShell >
      <TopBar titulo="Agendar" subtitulo="Escolha o serviço e o melhor horário para você" />

      {feito && (
        <div className="mx-4 -mt-5 flex items-start gap-3 rounded-3xl border border-success/30 bg-card p-4 shadow-card">
          <CheckCircle2 className="size-6 text-success" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Agendamento confirmado!</p>
            <p className="text-xs text-muted-foreground">
              Protocolo {feito}. Você receberá o lembrete pelo WhatsApp.
            </p>
          </div>
        </div>
      )}

      <div className={`space-y-6 px-4 ${feito ? "mt-6" : "-mt-5"}`}>
        <section className="rounded-3xl border border-border bg-card p-4 shadow-card">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">1. Área</h2>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {AREAS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => trocarArea(a.id)}
                className={`min-h-11 rounded-full px-4 text-xs font-semibold transition-colors ${
                  a.id === areaId
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {a.nome}
              </button>
            ))}
          </div>

          <h2 className="mt-5 text-xs font-bold uppercase tracking-wide text-muted-foreground">2. Serviço</h2>
          <select
            value={servico}
            onChange={(e) => setServico(e.target.value)}
            className="mt-2 min-h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm"
          >
            {area.servicos.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <h2 className="mt-5 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <MapPin className="size-3" /> 3. Unidade
          </h2>
          <select
            value={unidade}
            onChange={(e) => setUnidade(e.target.value)}
            className="mt-2 min-h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm"
          >
            {area.unidades.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </section>

        <section className="rounded-3xl border border-border bg-card p-4 shadow-card">
          <h2 className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <Clock className="size-3" /> 4. Data e horário
          </h2>
          <input
            type="date"
            value={data}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setData(e.target.value)}
            className="mt-2 min-h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm"
          />
          <div className="mt-3 grid grid-cols-4 gap-2">
            {HORARIOS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHora(h)}
                className={`min-h-11 rounded-xl text-xs font-semibold transition-colors ${
                  hora === h ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </section>

        {!cidadao && (
          <p className="text-center text-xs text-muted-foreground">
            Dica:{" "}
            <Link to="/registro" className="font-semibold text-primary underline">
              crie seu acesso
            </Link>{" "}
            para receber lembretes no WhatsApp.
          </p>
        )}

        <button
          type="button"
          onClick={confirmar}
          disabled={!hora}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-card transition-opacity disabled:opacity-40"
        >
          <CalendarCheck className="size-5" />
          Confirmar agendamento
        </button>

        {agendamentos.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Meus agendamentos
            </h2>
            <ul className="space-y-2">
              {agendamentos.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card"
                >
                  <div className="flex size-12 flex-col items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <span className="text-sm font-bold">{a.data.slice(8, 10)}</span>
                    <span className="text-[10px]">{a.data.slice(5, 7)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{a.servico}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.unidade} · {a.hora} · #{a.id}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Cancelar agendamento ${a.servico}`}
                    onClick={() => cancelar(a.id)}
                    className="flex size-11 items-center justify-center rounded-xl text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </AppShell>
  );
}

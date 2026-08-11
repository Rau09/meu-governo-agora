import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { TrendingDown, Users, Clock3, CheckCircle2, Lock, LogOut, MapPin, AlertTriangle } from "lucide-react";
import { AppShell, TopBar } from "@/components/AppShell";
import {
  AREAS,
  STATUS_OCORRENCIA,
  useAgendamentos,
  useOcorrencias,
  type Ocorrencia,
  type StatusOcorrencia,
} from "@/lib/city-store";

export const Route = createFileRoute("/gestao")({
  head: () => ({
    meta: [
      { title: "Painel de Gestão — QI Cidadão" },
      {
        name: "description",
        content: "Painel restrito da Prefeitura de Quedas do Iguaçu: demanda por área e fila de atendimentos.",
      },
      { property: "og:title", content: "Painel de Gestão — QI Cidadão" },
      { property: "og:description", content: "Acesso restrito da equipe da Prefeitura para gestão dos atendimentos." },
    ],
  }),
  component: Gestao,
});

const CHAVE = "qi-gestao-sessao";
const USUARIO = "prefeitura";
const SENHA = "quedas2026";

function Gestao() {
  const [logado, setLogado] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    setLogado(sessionStorage.getItem(CHAVE) === "1");
    setPronto(true);
  }, []);

  if (!pronto) {
    return (
      <AppShell>
        <TopBar titulo="Painel de Gestão" subtitulo="Acesso restrito" />
      </AppShell>
    );
  }

  if (!logado) {
    return (
      <Login
        onEntrar={() => {
          sessionStorage.setItem(CHAVE, "1");
          setLogado(true);
        }}
      />
    );
  }

  return (
    <Painel
      onSair={() => {
        sessionStorage.removeItem(CHAVE);
        setLogado(false);
      }}
    />
  );
}

function Login({ onEntrar }: { onEntrar: () => void }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (usuario.trim().toLowerCase() === USUARIO && senha === SENHA) {
      setErro("");
      onEntrar();
    } else {
      setErro("Usuário ou senha inválidos.");
    }
  }

  return (
    <AppShell librasMensagem="Área restrita da prefeitura. Faça login para ver o painel de gestão.">
      <TopBar titulo="Painel de Gestão" subtitulo="Acesso restrito da equipe da Prefeitura" />
      <div className="-mt-5 px-4">
        <form
          onSubmit={submit}
          className="animate-in rounded-3xl border border-border bg-card p-5 shadow-card fade-in slide-in-from-bottom-3 duration-500"
        >
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft">
            <Lock className="size-5 text-primary" />
          </div>
          <h2 className="mt-3 text-base font-bold">Entrar no painel</h2>
          <p className="text-xs text-muted-foreground">Use as credenciais fornecidas pela Prefeitura.</p>

          <label className="mt-4 block text-xs font-semibold" htmlFor="usuario">
            Usuário
          </label>
          <input
            id="usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoComplete="username"
            className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            placeholder="prefeitura"
          />

          <label className="mt-3 block text-xs font-semibold" htmlFor="senha">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            placeholder="••••••••"
          />

          {erro && <p className="mt-2 text-xs font-medium text-destructive">{erro}</p>}

          <button
            type="submit"
            className="mt-4 w-full rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all duration-200 hover:shadow-float active:scale-[0.98]"
          >
            Entrar
          </button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Demonstração: prefeitura / quedas2026
          </p>
        </form>
      </div>
    </AppShell>
  );
}

function Painel({ onSair }: { onSair: () => void }) {
  const { agendamentos } = useAgendamentos();
  const { ocorrencias, atualizarStatus } = useOcorrencias();
  const [filtro, setFiltro] = useState<string>("todas");
  const [animar, setAnimar] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimar(true), 60);
    return () => clearTimeout(t);
  }, []);

  const porArea = useMemo(() => {
    const base = AREAS.map((a) => ({ nome: a.nome, total: 0 }));
    for (const ag of agendamentos) {
      const item = base.find((b) => b.nome === ag.area);
      if (item) item.total += 1;
    }
    const max = Math.max(1, ...base.map((b) => b.total));
    return base.map((b) => ({ ...b, pct: Math.round((b.total / max) * 100) }));
  }, [agendamentos]);

  const lista = useMemo(
    () => (filtro === "todas" ? agendamentos : agendamentos.filter((a) => a.area === filtro)),
    [agendamentos, filtro],
  );

  const kpis = [
    { icon: Users, label: "Atendimentos", valor: String(agendamentos.length), nota: "na fila" },
    { icon: TrendingDown, label: "Espera", valor: "−70%", nota: "vs. presencial" },
    {
      icon: AlertTriangle,
      label: "Solicitações",
      valor: String(ocorrencias.filter((o) => o.status !== "resolvido").length),
      nota: "em aberto",
    },
  ];

  return (
    <AppShell librasMensagem="Painel de gestão da prefeitura, com indicadores e fila de atendimentos.">
      <TopBar titulo="Painel de Gestão" subtitulo="Uso interno da Prefeitura" />

      <div className="-mt-5 space-y-5 px-4">
        <div className="flex justify-end">
          <button
            onClick={onSair}
            className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:bg-primary-soft hover:text-primary active:scale-95"
          >
            <LogOut className="size-3.5" /> Sair
          </button>
        </div>

        <section className="grid grid-cols-3 gap-3">
          {kpis.map(({ icon: Icon, label, valor, nota }, i) => (
            <div
              key={label}
              style={{ transitionDelay: `${i * 70}ms` }}
              className={`rounded-3xl border border-border bg-card p-3 shadow-card transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-float ${
                animar ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              }`}
            >
              <Icon className="size-4 text-primary" />
              <p className="mt-1.5 font-display text-xl font-bold">{valor}</p>
              <p className="text-[11px] font-semibold leading-tight">{label}</p>
              <p className="text-[10px] text-muted-foreground">{nota}</p>
            </div>
          ))}
        </section>

        <section
          style={{ transitionDelay: "220ms" }}
          className={`rounded-3xl border border-border bg-card p-4 shadow-card transition-all duration-500 ease-out ${
            animar ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <h2 className="text-sm font-bold">Demanda por área</h2>
          <ul className="mt-3 space-y-3">
            {porArea.map((a, i) => (
              <li key={a.nome}>
                <div className="flex justify-between text-xs font-medium">
                  <span>{a.nome}</span>
                  <span className="text-muted-foreground">{a.total}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-2 rounded-full bg-primary transition-[width] duration-700 ease-out"
                    style={{ width: animar ? `${a.pct}%` : "0%", transitionDelay: `${300 + i * 90}ms` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Solicitações dos cidadãos
            </h2>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold">
              {ocorrencias.length}
            </span>
          </div>

          {ocorrencias.length === 0 ? (
            <p className="rounded-3xl bg-secondary p-4 text-xs text-muted-foreground">
              Nenhum problema comunicado até o momento.
            </p>
          ) : (
            <ul className="space-y-3">
              {ocorrencias.map((o, i) => (
                <CardOcorrencia key={o.protocolo} ocorrencia={o} indice={i} onStatus={atualizarStatus} />
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Fila de atendimentos
            </h2>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold">{lista.length}</span>
          </div>

          <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[{ id: "todas", nome: "Todas" }, ...AREAS.map((a) => ({ id: a.nome, nome: a.nome }))].map((f) => (
              <button
                key={f.id}
                onClick={() => setFiltro(f.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 active:scale-95 ${
                  filtro === f.id
                    ? "bg-primary text-primary-foreground shadow-card"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {f.nome}
              </button>
            ))}
          </div>

          {lista.length === 0 ? (
            <p className="rounded-3xl bg-secondary p-4 text-xs text-muted-foreground">
              Nenhum agendamento nesta fila.
            </p>
          ) : (
            <ul className="space-y-2">
              {lista.map((a, i) => (
                <li
                  key={a.id}
                  style={{ animationDelay: `${i * 45}ms` }}
                  className="flex animate-in items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card fade-in slide-in-from-bottom-2 duration-500 transition-transform hover:-translate-y-0.5"
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


function CardOcorrencia({
  ocorrencia,
  indice,
  onStatus,
}: {
  ocorrencia: Ocorrencia;
  indice: number;
  onStatus: (protocolo: string, status: StatusOcorrencia) => void;
}) {
  const atual = STATUS_OCORRENCIA.find((s) => s.id === ocorrencia.status)!;

  return (
    <li
      style={{ animationDelay: `${indice * 45}ms` }}
      className="animate-in rounded-3xl border border-border bg-card p-3 shadow-card fade-in slide-in-from-bottom-2 duration-500"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold leading-tight">{ocorrencia.categoria}</p>
          <p className="text-[11px] text-muted-foreground">
            {new Date(ocorrencia.criadoEm).toLocaleString("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary-soft px-2 py-1 text-[10px] font-bold text-primary">
          {ocorrencia.protocolo}
        </span>
      </div>

      {ocorrencia.foto && (
        <img
          src={ocorrencia.foto}
          alt={`Foto enviada na solicitação ${ocorrencia.protocolo}`}
          className="mt-2 h-36 w-full rounded-2xl object-cover"
        />
      )}

      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{ocorrencia.descricao}</p>

      {ocorrencia.local && (
        <a
          href={`https://www.google.com/maps?q=${ocorrencia.local.lat},${ocorrencia.local.lng}`}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary"
        >
          <MapPin className="size-3.5" />
          {ocorrencia.local.lat.toFixed(5)}, {ocorrencia.local.lng.toFixed(5)}
        </a>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${atual.classe}`}>
          {atual.emoji} {atual.rotulo}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {STATUS_OCORRENCIA.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onStatus(ocorrencia.protocolo, s.id)}
            className={`rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-200 active:scale-95 ${
              s.id === ocorrencia.status
                ? "bg-primary text-primary-foreground shadow-card"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {s.emoji} {s.rotulo}
          </button>
        ))}
      </div>
    </li>
  );
}

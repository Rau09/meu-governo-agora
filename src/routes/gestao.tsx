import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { TrendingDown, Users, Clock3, CheckCircle2, Lock, LogOut } from "lucide-react";
import { AppShell, TopBar } from "@/components/AppShell";
import { AREAS, useAgendamentos } from "@/lib/city-store";

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
        <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-5 shadow-card">
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
            className="mt-4 w-full rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground"
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
    { icon: Users, label: "Atendimentos", valor: String(agendamentos.length), nota: "na fila" },
    { icon: TrendingDown, label: "Espera", valor: "−70%", nota: "vs. presencial" },
    { icon: Clock3, label: "Canal", valor: "24/7", nota: "sempre aberto" },
  ];

  return (
    <AppShell librasMensagem="Painel de gestão da prefeitura, com indicadores e fila de atendimentos.">
      <TopBar titulo="Painel de Gestão" subtitulo="Uso interno da Prefeitura" />

      <div className="-mt-5 space-y-5 px-4">
        <div className="flex justify-end">
          <button
            onClick={onSair}
            className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold"
          >
            <LogOut className="size-3.5" /> Sair
          </button>
        </div>

        <section className="grid grid-cols-3 gap-3">
          {kpis.map(({ icon: Icon, label, valor, nota }) => (
            <div key={label} className="rounded-3xl border border-border bg-card p-3 shadow-card">
              <Icon className="size-4 text-primary" />
              <p className="mt-1.5 font-display text-xl font-bold">{valor}</p>
              <p className="text-[11px] font-semibold leading-tight">{label}</p>
              <p className="text-[10px] text-muted-foreground">{nota}</p>
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
              Nenhum agendamento na fila.
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

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Users,
  Clock3,
  CheckCircle2,
  Lock,
  LogOut,
  MapPin,
  Inbox,
  ChevronRight,
  Sparkles,
  X,
  AlertTriangle,
} from "lucide-react";
import { AppShell, TopBar } from "@/components/AppShell";
import { MapaOcorrencias } from "@/components/MapaOcorrencias";
import {
  AREAS,
  STATUS_OCORRENCIA,
  useAgendamentos,
  useOcorrencias,
  type Ocorrencia,
  type StatusOcorrencia,
} from "@/lib/cantu-store";
import {
  NIVEIS,
  PERGUNTAS_IA,
  alertas,
  analisar,
  atrasada,
  diasAberto,
  indicadores,
  metaCategoria,
  nivel as nivelOcorrencia,
  prioridades,
  responderIA,
  resumir,
  unificar,
  type OcorrenciaGestao,
} from "@/lib/cantu-gestao";


export const Route = createFileRoute("/gestao")({
  head: () => ({
    meta: [
      { title: "Painel de Gestão — Cantu Conecta" },
      {
        name: "description",
        content: "Painel restrito da região Cantuquiriguaçu: demanda por área e inteligência de gestão pública.",
      },
      { property: "og:title", content: "Painel de Gestão — Cantu Conecta" },
      { property: "og:description", content: "Acesso restrito para gestão inteligente dos serviços regionais." },
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
    <AppShell librasMensagem="Área restrita da prefeitura. Faça login para acessar o Portal de Gestão Cantu Conecta.">
      <TopBar titulo="Portal da Gestão" subtitulo="Espaço administrativo Cantu Conecta" />
      <div className="-mt-6 px-4">
        <form
          onSubmit={submit}
          className="animate-in rounded-3xl border border-border bg-card p-8 shadow-card fade-in slide-in-from-bottom-3 duration-500"
        >
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft">
            <Lock className="size-6 text-primary" />
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-foreground">Acesso Administrativo</h2>
          <p className="mt-1 text-sm font-medium text-muted-foreground">Bem-vindo à área de gestão regional.</p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="text-xs font-bold text-muted-foreground" htmlFor="usuario">
                Usuário
              </label>
              <input
                id="usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                autoComplete="username"
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="Identificador do servidor"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground" htmlFor="senha">
                Senha de Acesso
              </label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="••••••••"
              />
            </div>
          </div>

          {erro && (
            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-destructive/10 p-4 text-xs font-bold text-destructive">
              <AlertTriangle className="size-4" />
              {erro}
            </div>
          )}

          <button
            type="submit"
            className="mt-8 w-full rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-float transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            Entrar no Sistema
          </button>
          <p className="mt-5 text-center text-[11px] font-medium text-muted-foreground/60 italic">
            Acesso restrito a servidores autorizados da Cantuquiriguaçu.
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
  const [detalhe, setDetalhe] = useState<{ titulo: string; nota?: string; itens: OcorrenciaGestao[] } | null>(null);
  const [mapaFiltro, setMapaFiltro] = useState("todos");
  const [destaque, setDestaque] = useState<string[]>([]);
  const [respostaIA, setRespostaIA] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  function setAcao(texto: string) {
    setAviso(texto);
    setTimeout(() => setAviso(null), 3200);
  }

  const [verRecomendacao, setVerRecomendacao] = useState(false);
  const mapaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimar(true), 60);
    return () => clearTimeout(t);
  }, []);

  const lista = useMemo(() => unificar(ocorrencias), [ocorrencias]);
  const resumo = useMemo(() => resumir(lista), [lista]);
  const alertasAtivos = useMemo(() => alertas(lista), [lista]);
  const focos = useMemo(() => prioridades(lista).slice(0, 4), [lista]);
  const indices = useMemo(() => indicadores(lista), [lista]);
  const analise = useMemo(() => analisar(lista), [lista]);

  const ativos = useMemo(() => lista.filter((o) => o.status !== "resolvido"), [lista]);

  function irParaMapa(itens: OcorrenciaGestao[], filtroMapa = "todos") {
    setMapaFiltro(filtroMapa);
    setDestaque(itens.map((o) => o.protocolo));
    setDetalhe(null);
    setTimeout(() => mapaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }

  const porArea = useMemo(() => {
    const base = AREAS.map((a) => ({ nome: a.nome, total: 0 }));
    for (const ag of agendamentos) {
      const item = base.find((b) => b.nome === ag.area);
      if (item) item.total += 1;
    }
    const max = Math.max(1, ...base.map((b) => b.total));
    return base.map((b) => ({ ...b, pct: Math.round((b.total / max) * 100) }));
  }, [agendamentos]);

  const fila = useMemo(
    () => (filtro === "todas" ? agendamentos : agendamentos.filter((a) => a.area === filtro)),
    [agendamentos, filtro],
  );

  const cards = [
    {
      icon: Inbox,
      valor: resumo.abertas,
      label: "Solicitações abertas",
      nota: `${resumo.variacaoAbertas >= 0 ? "↑" : "↓"} ${Math.abs(resumo.variacaoAbertas)}% vs. mês anterior`,
      tom: "text-primary",
      itens: ativos.filter((o) => o.status === "recebido" || o.status === "analise"),
    },
    {
      icon: Users,
      valor: resumo.execucao,
      label: "Em execução",
      nota: "equipes em campo",
      tom: "text-primary",
      itens: ativos.filter((o) => o.status === "andamento"),
    },
    {
      icon: Clock3,
      valor: resumo.atrasadas,
      label: "Atrasadas",
      nota: "⚠️ precisam de atenção",
      tom: "text-destructive font-bold",
      itens: ativos.filter(atrasada),
    },
    {
      icon: AlertTriangle,
      valor: resumo.criticas,
      label: "Gravidade Alta",
      nota: "prioridade total",
      tom: "text-destructive",
      itens: ativos.filter((o) => nivelOcorrencia(o) === "critico"),
    },
    {
      icon: CheckCircle2,
      valor: resumo.resolvidas,
      label: "Resolvidas no mês",
      nota: "−70% de espera",
      tom: "text-success",
      itens: lista.filter((o) => o.status === "resolvido").slice(0, 30),
    },
  ];

  return (
    <AppShell librasMensagem="Painel de gestão regional, com alertas, prioridades, mapa e análise da inteligência artificial para a Cantuquiriguaçu.">
      <TopBar titulo="Portal da Gestão" subtitulo="Acompanhamento em tempo real Cantu Conecta" />

      <div className="-mt-6 space-y-6 px-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
            Sessão Administrativa · {new Date().toLocaleDateString('pt-BR')}
          </p>
          <button
            onClick={onSair}
            className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary transition-all hover:bg-primary/20 active:scale-95"
          >
            <LogOut className="size-3" /> Sair
          </button>
        </div>

        {/* 1. Resumo superior */}
        <section className="grid grid-cols-2 gap-4">
          {cards.map(({ icon: Icon, valor, label, nota, tom, itens }, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setDetalhe({ titulo: label, nota, itens })}
              style={{ transitionDelay: `${i * 70}ms` }}
              className={`relative overflow-hidden rounded-3xl border border-border bg-card p-5 text-left shadow-card transition-all duration-300 hover:border-primary/50 hover:shadow-float active:scale-[0.98] ${
                animar ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex size-9 items-center justify-center rounded-2xl bg-primary-soft">
                  <Icon className={`size-4.5 ${tom.includes("destructive") ? "text-destructive" : tom.includes("success") ? "text-success" : "text-primary"}`} />
                </div>
                <div className={`size-2 rounded-full ${tom.includes("destructive") ? "bg-destructive animate-pulse" : tom.includes("success") ? "bg-success" : "bg-primary"} opacity-60`} />
              </div>
              <p className="mt-4 font-display text-3xl font-bold tracking-tight">{valor}</p>
              <p className="mt-0.5 text-[11px] font-bold text-muted-foreground">{label}</p>
              <p className={`mt-2 text-[10px] font-bold ${tom.includes("destructive") ? "text-destructive" : "text-muted-foreground/80"}`}>
                {nota}
              </p>
            </button>
          ))}
        </section>

        {/* 2. Central de atenção */}
        <section
          style={{ transitionDelay: "220ms" }}
          className={`rounded-3xl border border-warning/20 bg-warning/5 p-6 shadow-card transition-all duration-500 ease-out ${
            animar ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-warning/10">
              <AlertTriangle className="size-5 text-warning" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Atenção Necessária</h2>
              <p className="text-[11px] font-medium text-muted-foreground">Protocolos que requerem despacho ou análise imediata.</p>
            </div>
          </div>
          <ul className="mt-5 space-y-3">
            {alertasAtivos.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => setDetalhe({ titulo: a.titulo, nota: a.detalhe, itens: a.itens })}
                  className="w-full rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-float active:scale-[0.99]"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl leading-none">{a.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-foreground">{a.titulo}</p>
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground/50" />
                      </div>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{a.detalhe}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${NIVEIS[a.nivel].classe}`}>
                          {NIVEIS[a.nivel].rotulo}
                        </span>
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          {a.acao}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* 3. Prioridades */}
        <section>
          <div className="mb-4 flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-foreground">Focos de Monitoramento</h2>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Semanal</span>
          </div>
          <ul className="space-y-4">
            {focos.map((p, i) => (
              <li
                key={p.id}
                style={{ animationDelay: `${i * 60}ms` }}
                className="animate-in rounded-3xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-base font-bold text-foreground">
                      {p.categoria} — {p.bairro}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
                       <span className="flex items-center gap-1"><Inbox className="size-3" /> {p.total} total</span>
                       <span className="flex items-center gap-1 text-destructive"><Clock3 className="size-3" /> {p.atrasadas} atrasos</span>
                       <span className="flex items-center gap-1 text-primary"><Sparkles className="size-3" /> +{p.variacao}%</span>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-wider ${NIVEIS[p.nivel].classe}`}>
                    {NIVEIS[p.nivel].rotulo}
                  </span>
                </div>
                
                <div className="mt-4 rounded-2xl bg-secondary/50 p-4 text-[12px] font-medium leading-relaxed text-muted-foreground italic">
                  “{p.resumo}”
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setDetalhe({ titulo: `${p.categoria} — ${p.bairro}`, nota: p.resumo, itens: p.itens })}
                    className="rounded-full border border-border bg-background px-4 py-2 text-[10px] font-bold text-foreground hover:bg-secondary active:scale-95 transition-all"
                  >
                    Detalhes
                  </button>
                  <button
                    type="button"
                    onClick={() => irParaMapa(p.itens, metaCategoria(p.categoria).filtro)}
                    className="rounded-full border border-border bg-background px-4 py-2 text-[10px] font-bold text-foreground hover:bg-secondary active:scale-95 transition-all"
                  >
                    Localização
                  </button>
                  <button
                    type="button"
                    onClick={() => setAcao(`Equipe designada para ${p.categoria} em ${p.bairro}.`)}
                    className="ml-auto rounded-full bg-primary px-5 py-2 text-[10px] font-bold text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-float transition-all"
                  >
                    Despachar Equipe
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 4. Mapa */}
        <div ref={mapaRef} className="scroll-mt-4">
          <MapaOcorrencias key={mapaFiltro} lista={lista} filtroInicial={mapaFiltro} destaque={destaque} />
        </div>

        {/* 5. Análise da IA */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16 blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.25em] text-primary">
            <Sparkles className="size-4 animate-pulse" /> 
            <span>Inteligência Analítica Cantu</span>
          </div>
          
          <div className="mt-5 flex flex-col gap-5">
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary/20 rounded-full" />
              <p className="pl-5 text-sm font-medium leading-relaxed text-foreground italic">
                "{analise.texto}"
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-success/5 p-4 border border-success/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-success/70 mb-1">Status Global</p>
                <p className="text-xs font-bold text-success flex items-center gap-2">
                  <span className="size-2 rounded-full bg-success animate-pulse" />
                  Operação Estável
                </p>
              </div>
              <div className="rounded-2xl bg-primary/5 p-4 border border-primary/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary/70 mb-1">Processamento</p>
                <p className="text-xs font-bold text-primary">Inteligência em Tempo Real</p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border-l-4 border-primary bg-primary-soft p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Recomendação Estratégica</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground">{analise.recomendacao}</p>
            {verRecomendacao && (
              <ul className="mt-4 space-y-3 border-t border-primary/10 pt-4 text-[12px] font-medium text-muted-foreground">
                <li className="flex gap-3">
                  <span className="font-bold text-primary">01.</span>
                  <span>Mobilizar unidade técnica para {analise.bairroFoco}.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">02.</span>
                  <span>Priorizar auditoria dos {resumo.atrasadas} processos em atraso.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">03.</span>
                  <span>Monitorar KPI de {analise.categoriaFoco.toLowerCase()} no próximo ciclo.</span>
                </li>
              </ul>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setVerRecomendacao((v) => !v)}
              className="rounded-full border border-border bg-background px-4 py-2 text-[10px] font-bold hover:bg-secondary active:scale-95 transition-all"
            >
              {verRecomendacao ? "Recolher Relatório" : "Ver Relatório"}
            </button>
            <button
              type="button"
              onClick={() =>
                setDetalhe({
                  titulo: analise.categoriaFoco,
                  nota: `${analise.pctCategoria}% da demanda ativa`,
                  itens: ativos.filter((o) => o.categoria === analise.categoriaFoco),
                })
              }
              className="rounded-full border border-border bg-background px-4 py-2 text-[10px] font-bold hover:bg-secondary active:scale-95 transition-all"
            >
              Auditar Dados
            </button>
          </div>

          <div className="-mx-6 mt-6 flex gap-2 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {PERGUNTAS_IA.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setRespostaIA(responderIA(p.id, lista))}
                className="shrink-0 rounded-full border border-border bg-background px-4 py-2 text-[11px] font-bold text-muted-foreground transition-all hover:border-primary/30 hover:text-primary active:scale-95"
              >
                {p.texto}
              </button>
            ))}
          </div>

          {respostaIA && (
            <div className="animate-in mt-4 rounded-3xl bg-primary-soft p-5 text-sm font-medium leading-relaxed text-primary-foreground/90 shadow-sm fade-in slide-in-from-bottom-2 duration-300">
              🤖 {respostaIA}
            </div>
          )}
        </section>

        {/* 6. Indicadores */}
        <section>
          <h2 className="mb-4 text-sm font-bold text-foreground px-1">📊 Indicadores Regionais</h2>
          <ul className="grid grid-cols-2 gap-4">
            {indices.map((ind) => (
              <li key={ind.grupo}>
                <button
                  type="button"
                  onClick={() =>
                    setDetalhe({
                      titulo: ind.grupo,
                      nota: `${ind.abertas} abertas · ${ind.execucao} em execução · ${ind.atrasadas} atrasadas`,
                      itens: ind.itens,
                    })
                  }
                  className="h-full w-full rounded-[2rem] border border-border bg-card p-5 text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-float active:scale-[0.98]"
                >
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">{ind.grupo}</p>
                  <p className="mt-2 font-display text-2xl font-bold text-foreground">{ind.abertas}</p>
                  <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Solicitações</p>
                  
                  <div className="mt-4 space-y-1.5">
                    <p className="text-[10px] font-semibold text-muted-foreground">
                      {ind.execucao} em execução
                    </p>
                    <p className={`text-[10px] font-bold ${ind.atrasadas > 0 ? "text-destructive" : "text-success"}`}>
                      {ind.atrasadas} em atraso
                    </p>
                    <p className={`text-[10px] font-black ${ind.tendencia >= 0 ? "text-destructive" : "text-success"}`}>
                      {ind.tendencia >= 0 ? "↑" : "↓"} {Math.abs(ind.tendencia)}% vs. anterior
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-border bg-card p-4 shadow-card">
          <h2 className="text-sm font-bold">Demanda por área (agendamentos)</h2>
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
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold">{fila.length}</span>
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

          {fila.length === 0 ? (
            <p className="rounded-3xl bg-secondary p-4 text-xs text-muted-foreground">
              Nenhum agendamento nesta fila.
            </p>
          ) : (
            <ul className="space-y-2">
              {fila.map((a, i) => (
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

      {detalhe && (
        <DetalheLista
          titulo={detalhe.titulo}
          {...(detalhe.nota ? { nota: detalhe.nota } : {})}
          itens={detalhe.itens}
          onFechar={() => setDetalhe(null)}
          onMapa={(itens) => irParaMapa(itens)}
        />
      )}

      {aviso && (
        <div className="fixed inset-x-0 bottom-24 z-50 mx-auto w-[min(92%,26rem)] animate-in rounded-2xl bg-primary p-3 text-center text-xs font-semibold text-primary-foreground shadow-float fade-in slide-in-from-bottom-2 duration-300">
          ✅ {aviso}
        </div>
      )}
    </AppShell>
  );
}

function DetalheLista({
  titulo,
  nota,
  itens,
  onFechar,
  onMapa,
}: {
  titulo: string;
  nota?: string;
  itens: OcorrenciaGestao[];
  onFechar: () => void;
  onMapa: (itens: OcorrenciaGestao[]) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center">
      <div className="animate-in max-h-[80vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-border bg-background p-4 shadow-float slide-in-from-bottom-4 duration-300 sm:rounded-3xl">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold">{titulo}</h3>
            {nota && <p className="text-[11px] text-muted-foreground">{nota}</p>}
            <p className="text-[11px] font-semibold text-primary">{itens.length} registros</p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary"
          >
            <X className="size-4" />
          </button>
        </div>

        {itens.length > 0 && (
          <button
            type="button"
            onClick={() => onMapa(itens)}
            className="mt-3 w-full rounded-2xl bg-primary py-2.5 text-xs font-bold text-primary-foreground active:scale-[0.98]"
          >
            🗺️ Ver no mapa
          </button>
        )}

        <ul className="mt-3 space-y-2 pb-2">
          {itens.slice(0, 40).map((o) => {
            const st = STATUS_OCORRENCIA.find((s) => s.id === o.status)!;
            const n = NIVEIS[nivelOcorrencia(o)];
            return (
              <li key={o.protocolo} className="rounded-2xl border border-border bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold leading-tight">
                    {metaCategoria(o.categoria).emoji} {o.categoria}
                  </p>
                  <span className="shrink-0 text-[10px] font-bold text-muted-foreground">{o.protocolo}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {o.bairro} · {diasAberto(o)} dias · {o.reclamacoes} reclamações
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${n.classe}`}>
                    {n.emoji} {n.rotulo}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${st.classe}`}>
                    {st.emoji} {st.rotulo}
                  </span>
                  {atrasada(o) && (
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
                      ⏰ Atrasada
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
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

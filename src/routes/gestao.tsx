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
  LayoutDashboard,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  Filter,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  alertas,
  analisar,
  atrasada,
  diasAberto,
  indicadores,
  metaCategoria,
  nivel as nivelOcorrencia,
  prioridades,
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
      <AppShell >
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
    <AppShell >
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
    <AppShell>
      <TopBar titulo="Painel de Gestão" subtitulo="Inteligência Regional Cantuquiriguaçu" />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="-mt-6 space-y-6 px-4 pb-24">
        {/* Barra de Pesquisa */}
        <section className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Pesquisar protocolo..." className="h-12 w-full rounded-2xl border border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-primary/50 transition-all" />
          </div>
          <button onClick={onSair} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card border border-border text-destructive active:scale-95 transition-all shadow-sm" title="Sair">
            <LogOut className="size-5" />
          </button>
        </section>

        {/* Resumo */}
        <section className="grid grid-cols-2 gap-4">
          {cards.slice(2, 4).map(({ icon: Icon, valor, label, nota, tom, itens }, i) => (
            <motion.button key={label} onClick={() => setDetalhe({ titulo: label, nota, itens })} className="rounded-[2rem] border border-border bg-card p-5 shadow-sm text-left relative overflow-hidden">
              <div className={`flex size-10 items-center justify-center rounded-2xl mb-3 ${tom.includes("destructive") ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                <Icon className="size-5" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-black text-foreground">{valor}</p>
            </motion.button>
          ))}
        </section>

        <DetalhesEmergencia alertasAtivos={alertasAtivos} setDetalhe={setDetalhe} animar={animar} />
        <MonitoramentoSetor focos={focos} setDetalhe={setDetalhe} setAcao={setAcao} animar={animar} />

        <div className="grid grid-cols-1 gap-6">
          <section className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-2">Ocorrências Recentes</h2>
            {ocorrencias.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-border bg-card/50 p-10 text-center">
                <p className="text-xs font-bold text-muted-foreground italic">Nenhum registro.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {ocorrencias.slice(0, 5).map((o, i) => (
                  <CardOcorrencia key={o.protocolo} ocorrencia={o} indice={i} onStatus={atualizarStatus} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </motion.div>

      {detalhe && (
        <DetalheLista titulo={detalhe.titulo} nota={detalhe.nota} itens={detalhe.itens} onFechar={() => setDetalhe(null)} onMapa={(itens: OcorrenciaGestao[]) => irParaMapa(itens)} />
      )}
    </AppShell>
  );
}

function DetalhesEmergencia({ alertasAtivos, setDetalhe, animar }: { alertasAtivos: any[], setDetalhe: any, animar: boolean }) {
  return (
    <section
      style={{ transitionDelay: "550ms" }}
      className={`rounded-[2.5rem] border border-destructive/20 bg-destructive/5 p-7 shadow-card transition-all duration-500 ease-out ${
        animar ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle className="size-6 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">Protocolos de Emergência</h2>
            <p className="text-[11px] font-medium text-muted-foreground">Intervenção imediata recomendada pela IA Cantu.</p>
          </div>
        </div>
        <span className="rounded-full bg-destructive px-3 py-1 text-[10px] font-black text-white shadow-sm">
          {alertasAtivos.length} CRÍTICOS
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {alertasAtivos.map((a) => (
          <div key={a.id} className="group relative">
            <button
              type="button"
              onClick={() => setDetalhe({ titulo: a.titulo, nota: a.detalhe, itens: a.itens })}
              className="w-full rounded-[2rem] border border-border bg-card p-5 text-left shadow-sm transition-all duration-300 hover:border-destructive/40 hover:shadow-float active:scale-[0.99]"
            >
              <div className="flex items-start gap-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-secondary/50 text-2xl leading-none">{a.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">{a.titulo}</p>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground/30 transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground font-medium">{a.detalhe}</p>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${NIVEIS[a.nivel as keyof typeof NIVEIS].classe}`}>
                        {NIVEIS[a.nivel as keyof typeof NIVEIS].rotulo}
                      </span>
                      <span className="text-[10px] font-bold text-destructive/80 flex items-center gap-1">
                         <Clock3 className="size-3" /> {a.acao}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-primary underline underline-offset-2">Resolver agora</span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function MonitoramentoSetor({ focos, setDetalhe, setAcao, animar }: { focos: any[], setDetalhe: any, setAcao: any, animar: boolean }) {
  return (
    <section className={animar ? "opacity-100" : "opacity-0"}>
      <h2 className="text-base font-bold mb-5">Monitoramento por Setor</h2>
      <div className="space-y-4">
        {focos.map((p, i) => (
          <div key={p.id} className="rounded-[2rem] border border-border bg-card p-6">
            <p className="font-bold">{p.categoria}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DetalheLista({ titulo, nota, itens, onFechar, onMapa }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="w-full max-w-md bg-background rounded-3xl p-6 shadow-float">
        <h3 className="font-bold text-lg mb-4">{titulo}</h3>
        <button onClick={onFechar} className="mt-4 w-full bg-primary text-white py-3 rounded-2xl">Fechar</button>
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
      className="animate-in rounded-[2rem] border border-border bg-card p-5 shadow-card fade-in slide-in-from-bottom-2 duration-500"
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

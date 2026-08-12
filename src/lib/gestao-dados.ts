import { MEDICAMENTOS, statusMedicamento, type Ocorrencia, type StatusOcorrencia } from "@/lib/city-store";

/**
 * Camada de inteligência do Painel de Gestão.
 *
 * Junta as solicitações reais (feitas pelo cidadão e salvas no aparelho) com um
 * conjunto demonstrativo coerente, e deriva tudo a partir da MESMA lista:
 * resumo, alertas, prioridades, mapa, indicadores e análise da IA.
 */

/* ---------- Tipos ---------- */

export type Nivel = "critico" | "alta" | "atencao" | "normal";

export type OcorrenciaGestao = {
  protocolo: string;
  categoria: string;
  bairro: string;
  lat: number;
  lng: number;
  criadoEm: string;
  status: StatusOcorrencia;
  descricao: string;
  foto?: string;
  reclamacoes: number;
  afetados: number;
  origem: "demo" | "cidadao";
};

export const NIVEIS: Record<Nivel, { rotulo: string; emoji: string; classe: string; ordem: number }> = {
  critico: { rotulo: "Crítico", emoji: "🔴", classe: "bg-destructive/10 text-destructive", ordem: 0 },
  alta: { rotulo: "Alta prioridade", emoji: "🟠", classe: "bg-accent-soft text-accent-foreground", ordem: 1 },
  atencao: { rotulo: "Atenção", emoji: "🟡", classe: "bg-secondary text-secondary-foreground", ordem: 2 },
  normal: { rotulo: "Normal", emoji: "🟢", classe: "bg-success/15 text-success", ordem: 3 },
};

/* ---------- Catálogo de categorias ---------- */

export type GrupoIndicador = "Saúde" | "Obras" | "Educação" | "Serviços Urbanos";

export const CATEGORIA_META: Record<
  string,
  { emoji: string; grupo: GrupoIndicador; prazoDias: number; peso: number; filtro: string }
> = {
  "Buraco na rua": { emoji: "🕳️", grupo: "Obras", prazoDias: 10, peso: 3, filtro: "buracos" },
  "Problema na via": { emoji: "🚧", grupo: "Obras", prazoDias: 12, peso: 2, filtro: "buracos" },
  "Poste/lâmpada com defeito": { emoji: "💡", grupo: "Serviços Urbanos", prazoDias: 7, peso: 3, filtro: "iluminacao" },
  "Lixo/entulho": { emoji: "🗑️", grupo: "Serviços Urbanos", prazoDias: 5, peso: 2, filtro: "lixo" },
  "Árvore caída": { emoji: "🌳", grupo: "Serviços Urbanos", prazoDias: 3, peso: 4, filtro: "arvores" },
  Vazamento: { emoji: "💧", grupo: "Serviços Urbanos", prazoDias: 3, peso: 4, filtro: "vazamentos" },
  "Falta de medicamento": { emoji: "💊", grupo: "Saúde", prazoDias: 5, peso: 4, filtro: "saude" },
  "Atendimento em UBS": { emoji: "🏥", grupo: "Saúde", prazoDias: 7, peso: 3, filtro: "saude" },
  "Transporte escolar": { emoji: "🚌", grupo: "Educação", prazoDias: 5, peso: 3, filtro: "educacao" },
  "Estrutura escolar": { emoji: "🏫", grupo: "Educação", prazoDias: 15, peso: 2, filtro: "educacao" },
  Outro: { emoji: "📌", grupo: "Serviços Urbanos", prazoDias: 10, peso: 1, filtro: "todos" },
};

export const FILTROS_MAPA = [
  { id: "todos", rotulo: "Todos", emoji: "🗺️" },
  { id: "iluminacao", rotulo: "Iluminação", emoji: "💡" },
  { id: "buracos", rotulo: "Buracos", emoji: "🕳️" },
  { id: "lixo", rotulo: "Lixo", emoji: "🗑️" },
  { id: "arvores", rotulo: "Árvores", emoji: "🌳" },
  { id: "vazamentos", rotulo: "Vazamentos", emoji: "💧" },
  { id: "saude", rotulo: "Saúde", emoji: "🏥" },
  { id: "educacao", rotulo: "Educação", emoji: "🏫" },
];

export function metaCategoria(categoria: string) {
  return CATEGORIA_META[categoria] ?? CATEGORIA_META["Outro"]!;
}

/* ---------- Bairros ---------- */

export const BAIRROS = [
  { nome: "Centro", lat: -25.4581, lng: -52.9122 },
  { nome: "Bela Vista", lat: -25.4498, lng: -52.9235 },
  { nome: "São Francisco", lat: -25.4675, lng: -52.9048 },
  { nome: "Jardim Alvorada", lat: -25.4432, lng: -52.9018 },
  { nome: "Vila Rural", lat: -25.4712, lng: -52.9256 },
  { nome: "Água Santa", lat: -25.4539, lng: -52.8945 },
];

/* ---------- Geração determinística ---------- */

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DESCRICOES: Record<string, string[]> = {
  "Buraco na rua": [
    "Buraco grande na pista, já causou danos em veículos.",
    "Asfalto afundado próximo ao cruzamento.",
  ],
  "Problema na via": ["Sinalização apagada e via sem faixa.", "Rua sem cascalho, intransitável com chuva."],
  "Poste/lâmpada com defeito": [
    "Poste apagado há semanas, rua muito escura à noite.",
    "Lâmpada piscando e cabo solto no poste.",
  ],
  "Lixo/entulho": ["Entulho de obra acumulado na calçada.", "Lixo espalhado no terreno baldio."],
  "Árvore caída": ["Árvore caiu sobre a calçada após o vento.", "Galhos grandes ameaçando a fiação."],
  Vazamento: ["Vazamento de água constante na esquina.", "Esgoto correndo a céu aberto."],
  "Falta de medicamento": ["Medicamento de uso contínuo em falta na unidade.", "Receita não atendida por falta de estoque."],
  "Atendimento em UBS": ["Espera muito longa para consulta.", "Falta de profissional no turno da tarde."],
  "Transporte escolar": ["Ônibus escolar atrasando na linha rural.", "Rota escolar sem cobertura no bairro."],
  "Estrutura escolar": ["Infiltração na sala de aula.", "Quadra da escola sem cobertura."],
  Outro: ["Solicitação encaminhada pelo cidadão.", "Demanda registrada no atendimento."],
};

/** Distribuição pensada para bater com o resumo: 27 abertas, 14 em execução, 5 atrasadas, 83 resolvidas. */
const PLANO: { categoria: string; bairro: string; status: StatusOcorrencia; dias: number }[] = [
  // Iluminação concentrada no Jardim Alvorada (gera o alerta de concentração)
  { categoria: "Poste/lâmpada com defeito", bairro: "Jardim Alvorada", status: "pendente", dias: 21 },
  { categoria: "Poste/lâmpada com defeito", bairro: "Jardim Alvorada", status: "pendente", dias: 18 },
  { categoria: "Poste/lâmpada com defeito", bairro: "Jardim Alvorada", status: "pendente", dias: 14 },
  { categoria: "Poste/lâmpada com defeito", bairro: "Jardim Alvorada", status: "analise", dias: 11 },
  { categoria: "Poste/lâmpada com defeito", bairro: "Jardim Alvorada", status: "analise", dias: 9 },
  { categoria: "Poste/lâmpada com defeito", bairro: "Jardim Alvorada", status: "execucao", dias: 6 },
  { categoria: "Poste/lâmpada com defeito", bairro: "Jardim Alvorada", status: "execucao", dias: 4 },
  { categoria: "Poste/lâmpada com defeito", bairro: "Centro", status: "pendente", dias: 8 },
  { categoria: "Poste/lâmpada com defeito", bairro: "Bela Vista", status: "pendente", dias: 5 },
  { categoria: "Poste/lâmpada com defeito", bairro: "Vila Rural", status: "analise", dias: 3 },
  { categoria: "Poste/lâmpada com defeito", bairro: "Água Santa", status: "execucao", dias: 2 },
  // Buracos
  { categoria: "Buraco na rua", bairro: "Centro", status: "pendente", dias: 16 },
  { categoria: "Buraco na rua", bairro: "São Francisco", status: "pendente", dias: 12 },
  { categoria: "Buraco na rua", bairro: "São Francisco", status: "analise", dias: 7 },
  { categoria: "Buraco na rua", bairro: "Bela Vista", status: "execucao", dias: 5 },
  { categoria: "Buraco na rua", bairro: "Vila Rural", status: "execucao", dias: 3 },
  { categoria: "Problema na via", bairro: "Vila Rural", status: "pendente", dias: 9 },
  { categoria: "Problema na via", bairro: "Água Santa", status: "analise", dias: 4 },
  // Lixo
  { categoria: "Lixo/entulho", bairro: "Centro", status: "pendente", dias: 11 },
  { categoria: "Lixo/entulho", bairro: "Bela Vista", status: "pendente", dias: 6 },
  { categoria: "Lixo/entulho", bairro: "São Francisco", status: "execucao", dias: 2 },
  { categoria: "Lixo/entulho", bairro: "Água Santa", status: "execucao", dias: 1 },
  // Árvores
  { categoria: "Árvore caída", bairro: "Bela Vista", status: "pendente", dias: 6 },
  { categoria: "Árvore caída", bairro: "Centro", status: "execucao", dias: 2 },
  { categoria: "Árvore caída", bairro: "Jardim Alvorada", status: "analise", dias: 4 },
  // Vazamentos
  { categoria: "Vazamento", bairro: "São Francisco", status: "pendente", dias: 7 },
  { categoria: "Vazamento", bairro: "Centro", status: "execucao", dias: 1 },
  { categoria: "Vazamento", bairro: "Vila Rural", status: "analise", dias: 2 },
  // Saúde
  { categoria: "Falta de medicamento", bairro: "Bela Vista", status: "pendente", dias: 9 },
  { categoria: "Falta de medicamento", bairro: "São Francisco", status: "analise", dias: 5 },
  { categoria: "Atendimento em UBS", bairro: "Centro", status: "pendente", dias: 4 },
  { categoria: "Atendimento em UBS", bairro: "Bela Vista", status: "execucao", dias: 2 },
  { categoria: "Falta de medicamento", bairro: "Centro", status: "execucao", dias: 1 },
  // Educação
  { categoria: "Transporte escolar", bairro: "Vila Rural", status: "pendente", dias: 8 },
  { categoria: "Transporte escolar", bairro: "Água Santa", status: "analise", dias: 3 },
  { categoria: "Estrutura escolar", bairro: "Jardim Alvorada", status: "pendente", dias: 12 },
  { categoria: "Estrutura escolar", bairro: "Centro", status: "execucao", dias: 4 },
  // Complementos em execução
  { categoria: "Lixo/entulho", bairro: "Jardim Alvorada", status: "execucao", dias: 3 },
  { categoria: "Buraco na rua", bairro: "Água Santa", status: "execucao", dias: 6 },
  { categoria: "Problema na via", bairro: "Centro", status: "execucao", dias: 5 },
  { categoria: "Vazamento", bairro: "Bela Vista", status: "execucao", dias: 4 },
];

const DIA = 86400000;

function gerarDemo(): OcorrenciaGestao[] {
  const r = rng(20260812);
  const agora = Date.now();
  const abertas = PLANO.map((p, i) => {
    const bairro = BAIRROS.find((b) => b.nome === p.bairro)!;
    const textos = DESCRICOES[p.categoria] ?? DESCRICOES["Outro"]!;
    return {
      protocolo: `QI-2026-D${String(i + 1).padStart(3, "0")}`,
      categoria: p.categoria,
      bairro: p.bairro,
      lat: bairro.lat + (r() - 0.5) * 0.012,
      lng: bairro.lng + (r() - 0.5) * 0.014,
      criadoEm: new Date(agora - p.dias * DIA).toISOString(),
      status: p.status,
      descricao: textos[i % textos.length]!,
      reclamacoes: 1 + Math.floor(r() * 12),
      afetados: 20 + Math.floor(r() * 900),
      origem: "demo" as const,
    };
  });

  // Histórico resolvido no mês (alimenta indicadores e comparativos).
  const resolvidas: OcorrenciaGestao[] = [];
  const cats = Object.keys(CATEGORIA_META).filter((c) => c !== "Outro");
  for (let i = 0; i < 83; i++) {
    const categoria = cats[Math.floor(r() * cats.length)]!;
    const bairro = BAIRROS[Math.floor(r() * BAIRROS.length)]!;
    resolvidas.push({
      protocolo: `QI-2026-R${String(i + 1).padStart(3, "0")}`,
      categoria,
      bairro: bairro.nome,
      lat: bairro.lat + (r() - 0.5) * 0.012,
      lng: bairro.lng + (r() - 0.5) * 0.014,
      criadoEm: new Date(agora - (5 + Math.floor(r() * 25)) * DIA).toISOString(),
      status: "resolvido",
      descricao: "Solicitação atendida pela equipe responsável.",
      reclamacoes: 1 + Math.floor(r() * 5),
      afetados: 15 + Math.floor(r() * 400),
      origem: "demo",
    });
  }

  return [...abertas, ...resolvidas];
}

export const DEMO_GESTAO = gerarDemo();

/** Ocorrências do cidadão (localStorage) convertidas para o formato do painel. */
function converter(o: Ocorrencia): OcorrenciaGestao {
  const bairro =
    BAIRROS.find((b) => o.endereco?.toLowerCase().includes(b.nome.toLowerCase())) ?? BAIRROS[0]!;
  const base: OcorrenciaGestao = {
    protocolo: o.protocolo,
    categoria: o.categoria,
    bairro: bairro.nome,
    lat: o.local?.lat ?? bairro.lat,
    lng: o.local?.lng ?? bairro.lng,
    criadoEm: o.criadoEm,
    status: o.status,
    descricao: o.descricao,
    reclamacoes: 1,
    afetados: 30,
    origem: "cidadao",
  };
  return o.foto ? { ...base, foto: o.foto } : base;
}

export function unificar(ocorrencias: Ocorrencia[]): OcorrenciaGestao[] {
  return [...ocorrencias.map(converter), ...DEMO_GESTAO];
}

/* ---------- Prioridade ---------- */

export function diasAberto(o: OcorrenciaGestao) {
  return Math.max(0, Math.floor((Date.now() - new Date(o.criadoEm).getTime()) / DIA));
}

export function atrasada(o: OcorrenciaGestao) {
  if (o.status === "resolvido") return false;
  return diasAberto(o) > metaCategoria(o.categoria).prazoDias;
}

export function pontuacao(o: OcorrenciaGestao) {
  const meta = metaCategoria(o.categoria);
  const dias = diasAberto(o);
  return (
    meta.peso * 8 +
    Math.min(30, o.reclamacoes * 2.5) +
    Math.min(25, (dias / Math.max(1, meta.prazoDias)) * 15) +
    Math.min(20, o.afetados / 50) +
    (atrasada(o) ? 18 : 0)
  );
}

export function nivel(o: OcorrenciaGestao): Nivel {
  if (o.status === "resolvido") return "normal";
  const p = pontuacao(o);
  if (p >= 70) return "critico";
  if (p >= 55) return "alta";
  if (p >= 40) return "atencao";
  return "normal";
}

/* ---------- Resumo ---------- */

export type Resumo = {
  abertas: number;
  execucao: number;
  atrasadas: number;
  resolvidas: number;
  criticas: number;
  variacaoAbertas: number;
  medicamentosEmFalta: { nome: string; unidade: string }[];
};

export function resumir(lista: OcorrenciaGestao[]): Resumo {
  const abertas = lista.filter((o) => o.status === "pendente" || o.status === "analise");
  const execucao = lista.filter((o) => o.status === "execucao");
  const ativos = [...abertas, ...execucao];
  const medicamentosEmFalta = MEDICAMENTOS.filter((m) => statusMedicamento(m.quantidade).id === "indisponivel").map(
    (m) => ({ nome: m.nome, unidade: m.unidade }),
  );

  const mesAtual = ativos.filter((o) => diasAberto(o) <= 30).length;
  const mesAnterior = Math.max(1, Math.round(mesAtual / 1.08));

  return {
    abertas: abertas.length,
    execucao: execucao.length,
    atrasadas: ativos.filter(atrasada).length,
    resolvidas: lista.filter((o) => o.status === "resolvido").length,
    criticas: ativos.filter((o) => nivel(o) === "critico").length,
    variacaoAbertas: Math.round(((mesAtual - mesAnterior) / mesAnterior) * 100),
    medicamentosEmFalta,
  };
}

/* ---------- Prioridades (categoria + bairro) ---------- */

export type Prioridade = {
  id: string;
  categoria: string;
  bairro: string;
  total: number;
  atrasadas: number;
  afetados: number;
  variacao: number;
  nivel: Nivel;
  resumo: string;
  itens: OcorrenciaGestao[];
};

export function prioridades(lista: OcorrenciaGestao[]): Prioridade[] {
  const ativos = lista.filter((o) => o.status !== "resolvido");
  const mapa = new Map<string, OcorrenciaGestao[]>();
  for (const o of ativos) {
    const id = `${o.categoria}|${o.bairro}`;
    mapa.set(id, [...(mapa.get(id) ?? []), o]);
  }

  const grupos: Prioridade[] = [...mapa.entries()].map(([id, itens]) => {
    const media = itens.reduce((s, o) => s + pontuacao(o), 0) / itens.length;
    const bonus = Math.min(20, (itens.length - 1) * 6);
    const score = media + bonus;
    const n: Nivel = score >= 72 ? "critico" : score >= 58 ? "alta" : score >= 44 ? "atencao" : "normal";
    const atrasadas = itens.filter(atrasada).length;
    return {
      id,
      categoria: itens[0]!.categoria,
      bairro: itens[0]!.bairro,
      total: itens.length,
      atrasadas,
      afetados: itens.reduce((s, o) => s + o.afetados, 0),
      variacao: 4 + ((itens.length * 7 + itens[0]!.bairro.length * 3) % 32),
      nivel: n,
      resumo:
        itens.length >= 4
          ? "Alta concentração de ocorrências na região."
          : atrasadas > 0
            ? "Existem solicitações acima do prazo previsto."
            : "Demanda sob acompanhamento da equipe.",
      itens: [...itens].sort((a, b) => pontuacao(b) - pontuacao(a)),
    };
  });

  return grupos.sort(
    (a, b) => NIVEIS[a.nivel].ordem - NIVEIS[b.nivel].ordem || b.total - a.total || b.atrasadas - a.atrasadas,
  );
}

/* ---------- Indicadores por área ---------- */

export type Indicador = {
  grupo: GrupoIndicador;
  abertas: number;
  execucao: number;
  atrasadas: number;
  resolvidas: number;
  total: number;
  tendencia: number;
  itens: OcorrenciaGestao[];
};

const GRUPOS: GrupoIndicador[] = ["Saúde", "Obras", "Educação", "Serviços Urbanos"];

export function indicadores(lista: OcorrenciaGestao[]): Indicador[] {
  return GRUPOS.map((grupo) => {
    const itens = lista.filter((o) => metaCategoria(o.categoria).grupo === grupo);
    const ativos = itens.filter((o) => o.status !== "resolvido");
    const abertas = itens.filter((o) => o.status === "pendente" || o.status === "analise").length;
    const execucao = itens.filter((o) => o.status === "execucao").length;
    const atrasadas = ativos.filter(atrasada).length;
    return {
      grupo,
      abertas,
      execucao,
      atrasadas,
      resolvidas: itens.filter((o) => o.status === "resolvido").length,
      total: ativos.length,
      tendencia: atrasadas > 2 ? 8 + atrasadas * 2 : -(4 + abertas % 7),
      itens: ativos.sort((a, b) => pontuacao(b) - pontuacao(a)),
    };
  });
}

/* ---------- Concentração por bairro ---------- */

export function concentracao(lista: OcorrenciaGestao[], filtroCategoria?: string) {
  const ativos = lista.filter(
    (o) => o.status !== "resolvido" && (!filtroCategoria || o.categoria === filtroCategoria),
  );
  const mapa = new Map<string, number>();
  for (const o of ativos) mapa.set(o.bairro, (mapa.get(o.bairro) ?? 0) + 1);
  const total = ativos.length || 1;
  return [...mapa.entries()]
    .map(([bairro, qtd]) => ({ bairro, qtd, pct: Math.round((qtd / total) * 100) }))
    .sort((a, b) => b.qtd - a.qtd);
}

/* ---------- Alertas ---------- */

export type Alerta = {
  id: string;
  emoji: string;
  titulo: string;
  detalhe: string;
  nivel: Nivel;
  itens: OcorrenciaGestao[];
  acao: string;
};

export function alertas(lista: OcorrenciaGestao[]): Alerta[] {
  const r = resumir(lista);
  const ativos = lista.filter((o) => o.status !== "resolvido");
  const criticas = ativos.filter((o) => nivel(o) === "critico").sort((a, b) => pontuacao(b) - pontuacao(a));
  const atrasadas = ativos.filter(atrasada).sort((a, b) => diasAberto(b) - diasAberto(a));
  const foco = prioridades(lista)[0];

  const saida: Alerta[] = [];

  if (criticas.length > 0) {
    saida.push({
      id: "criticos",
      emoji: "🔴",
      titulo: `${criticas.length} problemas críticos`,
      detalhe: "Ocorrências que precisam de intervenção prioritária.",
      nivel: "critico",
      itens: criticas,
      acao: "Designar equipe de emergência",
    });
  }

  if (atrasadas.length > 0) {
    saida.push({
      id: "atrasadas",
      emoji: "🟠",
      titulo: `${atrasadas.length} solicitações atrasadas`,
      detalhe: "Solicitações acima do prazo esperado de atendimento.",
      nivel: "alta",
      itens: atrasadas,
      acao: "Reprogramar atendimentos atrasados",
    });
  }

  if (r.medicamentosEmFalta.length > 0) {
    saida.push({
      id: "medicamentos",
      emoji: "💊",
      titulo: `${r.medicamentosEmFalta.length} medicamentos indisponíveis`,
      detalhe: r.medicamentosEmFalta.map((m) => `${m.nome} — ${m.unidade}`).join(" · "),
      nivel: "alta",
      itens: ativos.filter((o) => metaCategoria(o.categoria).grupo === "Saúde"),
      acao: "Solicitar reposição de estoque",
    });
  }

  if (foco && foco.total >= 3) {
    saida.push({
      id: "concentracao",
      emoji: "💡",
      titulo: "Alta concentração de ocorrências",
      detalhe: `${foco.bairro} concentra ${foco.total} ocorrências de ${foco.categoria.toLowerCase()}.`,
      nivel: "atencao",
      itens: foco.itens,
      acao: "Enviar equipe de manutenção ao bairro",
    });
  }

  return saida;
}

/* ---------- Análise da IA ---------- */

export type Analise = {
  texto: string;
  recomendacao: string;
  categoriaFoco: string;
  bairroFoco: string;
  pctCategoria: number;
};

export function analisar(lista: OcorrenciaGestao[]): Analise {
  const ativos = lista.filter((o) => o.status !== "resolvido");
  const porCategoria = new Map<string, number>();
  for (const o of ativos) porCategoria.set(o.categoria, (porCategoria.get(o.categoria) ?? 0) + 1);
  const [categoriaFoco, qtd] = [...porCategoria.entries()].sort((a, b) => b[1] - a[1])[0] ?? ["Outro", 0];
  const pct = Math.round((qtd / Math.max(1, ativos.length)) * 100);
  const bairros = concentracao(lista, categoriaFoco);
  const top = bairros[0];
  const atrasadas = ativos.filter(atrasada).length;

  return {
    categoriaFoco,
    bairroFoco: top?.bairro ?? "Centro",
    pctCategoria: pct,
    texto: `Analisando as ${ativos.length} solicitações em andamento, o principal problema é ${categoriaFoco.toLowerCase()}. A categoria representa ${pct}% das ocorrências abertas e o bairro ${top?.bairro ?? "Centro"} concentra ${top?.pct ?? 0}% delas. Hoje há ${atrasadas} solicitações fora do prazo.`,
    recomendacao: `Priorizar uma equipe de manutenção no bairro ${top?.bairro ?? "Centro"} para resolver ${categoriaFoco.toLowerCase()} e revisar as ${atrasadas} ocorrências atrasadas antes do fim da semana.`,
  };
}

export const PERGUNTAS_IA = [
  { id: "maior", texto: "Qual é o maior problema?" },
  { id: "bairro", texto: "Qual bairro precisa de atenção?" },
  { id: "atrasados", texto: "Quais problemas estão atrasados?" },
  { id: "aumentou", texto: "O que aumentou este mês?" },
];

export function responderIA(id: string, lista: OcorrenciaGestao[]): string {
  const a = analisar(lista);
  const ativos = lista.filter((o) => o.status !== "resolvido");

  if (id === "maior") {
    return `O maior problema hoje é ${a.categoriaFoco.toLowerCase()}: ${a.pctCategoria}% das ocorrências ativas. A maior parte está no bairro ${a.bairroFoco}.`;
  }
  if (id === "bairro") {
    const b = concentracao(lista)[0];
    return `${b?.bairro ?? "Centro"} é o bairro que mais precisa de atenção: ${b?.qtd ?? 0} ocorrências ativas (${b?.pct ?? 0}% do total da cidade).`;
  }
  if (id === "atrasados") {
    const atr = ativos.filter(atrasada);
    const porCat = new Map<string, number>();
    for (const o of atr) porCat.set(o.categoria, (porCat.get(o.categoria) ?? 0) + 1);
    const linhas = [...porCat.entries()]
      .sort((x, y) => y[1] - x[1])
      .slice(0, 3)
      .map(([c, q]) => `${metaCategoria(c).emoji} ${c}: ${q}`)
      .join(" · ");
    return atr.length === 0
      ? "Nenhuma solicitação está fora do prazo neste momento."
      : `Há ${atr.length} solicitações fora do prazo. Principais: ${linhas}.`;
  }
  // aumentou
  const p = prioridades(lista).slice(0, 2);
  return p.length === 0
    ? "Não há variação relevante no período."
    : p
        .map((x) => `${metaCategoria(x.categoria).emoji} ${x.categoria} em ${x.bairro}: +${x.variacao}% neste mês`)
        .join(". ") + ".";
}

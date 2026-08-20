import { MEDICAMENTOS, statusMedicamento, type Ocorrencia, type StatusOcorrencia } from "@/lib/cantu-store";

/**
 * Camada de inteligência regional do Cantu Conecta.
 *
 * Consolida solicitações reais e dados demonstrativos para a região Cantuquiriguaçu,
 * derivando análises inteligentes para gestão pública eficiente.
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
  alta: { rotulo: "Alta prioridade", emoji: "🟠", classe: "bg-accent-soft text-accent", ordem: 1 },
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

/** Distribuição pensada para bater com o resumo. */
const PLANO: { categoria: string; bairro: string; status: StatusOcorrencia; dias: number }[] = [
  // Iluminação concentrada no Jardim Alvorada
  { categoria: "Poste/lâmpada com defeito", bairro: "Jardim Alvorada", status: "recebido", dias: 21 },
  { categoria: "Poste/lâmpada com defeito", bairro: "Jardim Alvorada", status: "recebido", dias: 18 },
  { categoria: "Poste/lâmpada com defeito", bairro: "Jardim Alvorada", status: "recebido", dias: 14 },
  { categoria: "Poste/lâmpada com defeito", bairro: "Jardim Alvorada", status: "analise", dias: 11 },
  { categoria: "Poste/lâmpada com defeito", bairro: "Jardim Alvorada", status: "analise", dias: 9 },
  { categoria: "Poste/lâmpada com defeito", bairro: "Jardim Alvorada", status: "execucao", dias: 6 },
  { categoria: "Poste/lâmpada com defeito", bairro: "Jardim Alvorada", status: "execucao", dias: 4 },
  { categoria: "Poste/lâmpada com defeito", bairro: "Centro", status: "recebido", dias: 8 },
  { categoria: "Poste/lâmpada com defeito", bairro: "Bela Vista", status: "recebido", dias: 5 },
  { categoria: "Poste/lâmpada com defeito", bairro: "Vila Rural", status: "analise", dias: 3 },
  { categoria: "Poste/lâmpada com defeito", bairro: "Água Santa", status: "execucao", dias: 2 },
  // Buracos
  { categoria: "Buraco na rua", bairro: "Centro", status: "recebido", dias: 16 },
  { categoria: "Buraco na rua", bairro: "São Francisco", status: "recebido", dias: 12 },
  { categoria: "Buraco na rua", bairro: "São Francisco", status: "analise", dias: 7 },
  { categoria: "Buraco na rua", bairro: "Bela Vista", status: "execucao", dias: 5 },
  { categoria: "Buraco na rua", bairro: "Vila Rural", status: "execucao", dias: 3 },
  { categoria: "Problema na via", bairro: "Vila Rural", status: "recebido", dias: 9 },
  { categoria: "Problema na via", bairro: "Água Santa", status: "analise", dias: 4 },
  // Lixo
  { categoria: "Lixo/entulho", bairro: "Centro", status: "recebido", dias: 11 },
  { categoria: "Lixo/entulho", bairro: "Bela Vista", status: "recebido", dias: 6 },
  { categoria: "Lixo/entulho", bairro: "São Francisco", status: "execucao", dias: 2 },
  { categoria: "Lixo/entulho", bairro: "Água Santa", status: "execucao", dias: 1 },
  // Árvores
  { categoria: "Árvore caída", bairro: "Bela Vista", status: "recebido", dias: 6 },
  { categoria: "Árvore caída", bairro: "Centro", status: "execucao", dias: 2 },
  { categoria: "Árvore caída", bairro: "Jardim Alvorada", status: "analise", dias: 4 },
  // Vazamentos
  { categoria: "Vazamento", bairro: "São Francisco", status: "recebido", dias: 7 },
  { categoria: "Vazamento", bairro: "Centro", status: "execucao", dias: 1 },
  { categoria: "Vazamento", bairro: "Vila Rural", status: "analise", dias: 2 },
  // Saúde
  { categoria: "Falta de medicamento", bairro: "Bela Vista", status: "recebido", dias: 9 },
  { categoria: "Falta de medicamento", bairro: "São Francisco", status: "analise", dias: 5 },
  { categoria: "Atendimento em UBS", bairro: "Centro", status: "recebido", dias: 4 },
  { categoria: "Atendimento em UBS", bairro: "Bela Vista", status: "execucao", dias: 2 },
  { categoria: "Falta de medicamento", bairro: "Centro", status: "execucao", dias: 1 },
  // Educação
  { categoria: "Transporte escolar", bairro: "Vila Rural", status: "recebido", dias: 8 },
  { categoria: "Transporte escolar", bairro: "Água Santa", status: "analise", dias: 3 },
  { categoria: "Estrutura escolar", bairro: "Jardim Alvorada", status: "recebido", dias: 12 },
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
      protocolo: `CANTU-2026-D${String(i + 1).padStart(3, "0")}`,
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

  const resolvidas: OcorrenciaGestao[] = [];
  const cats = Object.keys(CATEGORIA_META).filter((c) => c !== "Outro");
  for (let i = 0; i < 83; i++) {
    const categoria = cats[Math.floor(r() * cats.length)]!;
    const bairro = BAIRROS[Math.floor(r() * BAIRROS.length)]!;
    resolvidas.push({
      protocolo: `CANTU-2026-R${String(i + 1).padStart(3, "0")}`,
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
  const abertas = lista.filter((o) => o.status === "recebido" || o.status === "analise");
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
    const n: Nivel =
      score >= 72 && itens.length >= 3
        ? "critico"
        : score >= 58 && itens.length >= 2
          ? "alta"
          : score >= 44
            ? "atencao"
            : "normal";
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
    const abertas = itens.filter((o) => o.status === "recebido" || o.status === "analise").length;
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
  const ativos = lista.filter((o) => o.status !== "resolvido");
  const a: Alerta[] = [];

  const ilumAlvorada = ativos.filter((o) => o.categoria === "Poste/lâmpada com defeito" && o.bairro === "Jardim Alvorada");
  if (ilumAlvorada.length >= 3) {
    a.push({
      id: "concentracao-iluminacao",
      emoji: "💡",
      titulo: "Concentração: Iluminação",
      detalhe: `${ilumAlvorada.length} postes apagados concentrados no Jardim Alvorada.`,
      nivel: "critico",
      itens: ilumAlvorada,
      acao: "Enviar Equipe",
    });
  }

  const atrasosSaude = ativos.filter((o) => metaCategoria(o.categoria).grupo === "Saúde" && atrasada(o));
  if (atrasosSaude.length > 0) {
    a.push({
      id: "atraso-saude",
      emoji: "🏥",
      titulo: "Atraso: Área da Saúde",
      detalhe: `${atrasosSaude.length} solicitações fora do prazo de atendimento.`,
      nivel: "alta",
      itens: atrasosSaude,
      acao: "Revisar Fluxo",
    });
  }

  const buracos = ativos.filter((o) => o.categoria === "Buraco na rua" && diasAberto(o) > 5);
  if (buracos.length >= 2) {
    a.push({
      id: "obra-emergencia",
      emoji: "🚧",
      titulo: "Obras: Tapa-buraco",
      detalhe: "Vias com buracos críticos aguardando execução há mais de 5 dias.",
      nivel: "alta",
      itens: buracos,
      acao: "Programar",
    });
  }

  return a.sort((x, y) => NIVEIS[x.nivel].ordem - NIVEIS[y.nivel].ordem);
}

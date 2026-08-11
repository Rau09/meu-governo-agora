/**
 * Base de sinais para o intérprete de Libras do app.
 *
 * Importante: este módulo NÃO é um tradutor automático de Libras. Ele monta uma
 * sequência de poses (configuração de mão + movimento de braço) a partir de um
 * pequeno vocabulário de sinais revisado manualmente. Palavras fora desse
 * vocabulário são apresentadas em datilologia (soletração manual), que é o
 * recurso correto quando não existe sinal mapeado — nunca um movimento aleatório.
 */

/** Configurações de mão: dedos na ordem polegar, indicador, médio, anelar, mínimo. */
export type Configuracao =
  | "aberta"
  | "punho"
  | "apontar"
  | "dois"
  | "tres"
  | "joia"
  | "garra"
  | "c"
  | "pinca"
  | "mindinho";

export const DEDOS: Record<Configuracao, [number, number, number, number, number]> = {
  //        polegar, indic, médio, anelar, mínimo   (1 = estendido, 0 = dobrado)
  aberta: [1, 1, 1, 1, 1],
  punho: [0, 0, 0, 0, 0],
  apontar: [0, 1, 0, 0, 0],
  dois: [0, 1, 1, 0, 0],
  tres: [1, 1, 1, 0, 0],
  joia: [1, 0, 0, 0, 0],
  garra: [0.6, 0.6, 0.6, 0.6, 0.6],
  c: [0.8, 0.8, 0.8, 0.8, 0.8],
  pinca: [0.4, 0.4, 0, 0, 0],
  mindinho: [0, 0, 0, 0, 1],
};

export type Pose = {
  /** Rotação do braço direito (graus, positivo = subindo à frente). */
  bracoDir: number;
  /** Rotação do braço esquerdo. */
  bracoEsq: number;
  /** Flexão do cotovelo direito/esquerdo. */
  coveloDir: number;
  coveloEsq: number;
  maoDir: Configuracao;
  maoEsq: Configuracao;
  /** Leve inclinação do tronco/cabeça, dá naturalidade ao movimento. */
  tronco?: number;
};

export type Sinal = {
  /** Rótulo em glosa (como se escreve o sinal em Libras). */
  glosa: string;
  poses: Pose[];
  /** Duração de cada pose em ms. */
  ritmo?: number;
};

const repouso: Pose = {
  bracoDir: 4,
  bracoEsq: -4,
  coveloDir: 6,
  coveloEsq: -6,
  maoDir: "aberta",
  maoEsq: "aberta",
};

export const POSE_REPOUSO = repouso;

/** Vocabulário de sinais usado nas telas do app (glosas em LIBRAS). */
export const SINAIS: Record<string, Sinal> = {
  ola: {
    glosa: "OLÁ",
    poses: [
      { ...repouso, bracoDir: -70, coveloDir: -30, maoDir: "aberta" },
      { ...repouso, bracoDir: -85, coveloDir: -55, maoDir: "aberta", tronco: 2 },
      { ...repouso, bracoDir: -70, coveloDir: -25, maoDir: "aberta" },
    ],
  },
  voce: {
    glosa: "VOCÊ",
    poses: [
      { ...repouso, bracoDir: -55, coveloDir: -40, maoDir: "apontar" },
      { ...repouso, bracoDir: -62, coveloDir: -20, maoDir: "apontar" },
    ],
  },
  eu: {
    glosa: "EU",
    poses: [{ ...repouso, bracoDir: -40, coveloDir: -80, maoDir: "apontar", tronco: -1 }],
  },
  ajudar: {
    glosa: "AJUDAR",
    poses: [
      { ...repouso, bracoDir: -35, bracoEsq: 30, coveloDir: -50, coveloEsq: 45, maoDir: "joia", maoEsq: "aberta" },
      { ...repouso, bracoDir: -60, bracoEsq: 34, coveloDir: -35, coveloEsq: 40, maoDir: "joia", maoEsq: "aberta" },
    ],
  },
  saude: {
    glosa: "SAÚDE",
    poses: [
      { ...repouso, bracoDir: -50, coveloDir: -60, maoDir: "garra", tronco: 1 },
      { ...repouso, bracoDir: -30, coveloDir: -70, maoDir: "punho" },
    ],
  },
  remedio: {
    glosa: "REMÉDIO",
    poses: [
      { ...repouso, bracoDir: -45, bracoEsq: 25, coveloDir: -55, coveloEsq: 50, maoDir: "pinca", maoEsq: "aberta" },
      { ...repouso, bracoDir: -52, bracoEsq: 25, coveloDir: -40, coveloEsq: 50, maoDir: "pinca", maoEsq: "aberta" },
    ],
  },
  agendar: {
    glosa: "MARCAR",
    poses: [
      { ...repouso, bracoDir: -40, bracoEsq: 28, coveloDir: -60, coveloEsq: 48, maoDir: "dois", maoEsq: "aberta" },
      { ...repouso, bracoDir: -48, bracoEsq: 28, coveloDir: -42, coveloEsq: 48, maoDir: "dois", maoEsq: "aberta" },
    ],
  },
  problema: {
    glosa: "PROBLEMA",
    poses: [
      { ...repouso, bracoDir: -55, bracoEsq: 45, coveloDir: -45, coveloEsq: 40, maoDir: "punho", maoEsq: "punho" },
      { ...repouso, bracoDir: -45, bracoEsq: 55, coveloDir: -55, coveloEsq: 30, maoDir: "punho", maoEsq: "punho", tronco: 2 },
    ],
  },
  cidade: {
    glosa: "CIDADE",
    poses: [
      { ...repouso, bracoDir: -50, bracoEsq: 50, coveloDir: -55, coveloEsq: 55, maoDir: "c", maoEsq: "c" },
      { ...repouso, bracoDir: -62, bracoEsq: 62, coveloDir: -40, coveloEsq: 40, maoDir: "c", maoEsq: "c" },
    ],
  },
  prefeitura: {
    glosa: "PREFEITURA",
    poses: [
      { ...repouso, bracoDir: -60, bracoEsq: 60, coveloDir: -50, coveloEsq: 50, maoDir: "aberta", maoEsq: "aberta" },
      { ...repouso, bracoDir: -35, bracoEsq: 35, coveloDir: -70, coveloEsq: 70, maoDir: "aberta", maoEsq: "aberta" },
    ],
  },
  atendimento: {
    glosa: "ATENDER",
    poses: [
      { ...repouso, bracoDir: -58, coveloDir: -45, maoDir: "tres" },
      { ...repouso, bracoDir: -40, coveloDir: -62, maoDir: "tres" },
    ],
  },
  foto: {
    glosa: "FOTO",
    poses: [
      { ...repouso, bracoDir: -62, bracoEsq: 58, coveloDir: -55, coveloEsq: 52, maoDir: "c", maoEsq: "c" },
      { ...repouso, bracoDir: -62, bracoEsq: 58, coveloDir: -58, coveloEsq: 55, maoDir: "pinca", maoEsq: "c" },
    ],
  },
  local: {
    glosa: "LUGAR",
    poses: [
      { ...repouso, bracoDir: -30, coveloDir: -75, maoDir: "apontar" },
      { ...repouso, bracoDir: -20, coveloDir: -85, maoDir: "apontar" },
    ],
  },
  tela: {
    glosa: "TELA",
    poses: [
      { ...repouso, bracoDir: -55, bracoEsq: 55, coveloDir: -50, coveloEsq: 50, maoDir: "aberta", maoEsq: "aberta" },
    ],
  },
  aqui: {
    glosa: "AQUI",
    poses: [
      { ...repouso, bracoDir: -35, coveloDir: -70, maoDir: "apontar" },
      { ...repouso, bracoDir: -32, coveloDir: -60, maoDir: "apontar" },
    ],
  },
  obrigado: {
    glosa: "OBRIGADO",
    poses: [
      { ...repouso, bracoDir: -75, coveloDir: -55, maoDir: "aberta" },
      { ...repouso, bracoDir: -50, coveloDir: -35, maoDir: "aberta", tronco: 3 },
    ],
  },
};

/** Sinônimos → chave do vocabulário. */
const SINONIMOS: Record<string, string> = {
  ola: "ola",
  oi: "ola",
  bemvindo: "ola",
  voce: "voce",
  seu: "voce",
  sua: "voce",
  eu: "eu",
  ajuda: "ajudar",
  ajudar: "ajudar",
  ajudamos: "ajudar",
  saude: "saude",
  consulta: "saude",
  consultas: "saude",
  medico: "saude",
  vacina: "saude",
  remedio: "remedio",
  remedios: "remedio",
  medicamento: "remedio",
  medicamentos: "remedio",
  farmacia: "remedio",
  agendar: "agendar",
  agendamento: "agendamento" in SINAIS ? "agendamento" : "agendar",
  marcar: "agendar",
  horario: "agendar",
  problema: "problema",
  problemas: "problema",
  buraco: "problema",
  reclamacao: "problema",
  comunicar: "problema",
  cidade: "cidade",
  municipio: "cidade",
  prefeitura: "prefeitura",
  gestao: "prefeitura",
  painel: "prefeitura",
  atendimento: "atendimento",
  atender: "atendimento",
  servico: "atendimento",
  servicos: "atendimento",
  foto: "foto",
  fotografia: "foto",
  local: "local",
  localizacao: "local",
  gps: "local",
  endereco: "local",
  tela: "tela",
  aqui: "aqui",
  obrigado: "obrigado",
  obrigada: "obrigado",
};

export function normalizar(p: string) {
  return p
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/** Configuração de mão aproximada por letra, para datilologia. */
const LETRAS: Record<string, Configuracao> = {
  a: "punho",
  b: "aberta",
  c: "c",
  d: "apontar",
  e: "garra",
  f: "pinca",
  g: "apontar",
  h: "dois",
  i: "mindinho",
  j: "mindinho",
  k: "dois",
  l: "joia",
  m: "punho",
  n: "punho",
  o: "c",
  p: "dois",
  q: "pinca",
  r: "dois",
  s: "punho",
  t: "punho",
  u: "dois",
  v: "dois",
  w: "tres",
  x: "apontar",
  y: "joia",
  z: "apontar",
};

export type Passo = {
  /** Palavra do texto original que está sendo sinalizada. */
  palavra: string;
  /** Glosa do sinal, ou a letra em datilologia. */
  glosa: string;
  /** Verdadeiro quando é soletração manual (sem sinal no vocabulário). */
  datilologia: boolean;
  pose: Pose;
  duracao: number;
};

/** Converte uma frase em uma sequência de passos sinalizáveis. */
export function montarSequencia(texto: string): Passo[] {
  const palavras = texto
    .split(/\s+/)
    .map((p) => p.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean)
    .slice(0, 24);

  const passos: Passo[] = [];

  for (const palavra of palavras) {
    const chave = SINONIMOS[normalizar(palavra)];
    const sinal = chave ? SINAIS[chave] : undefined;

    if (sinal) {
      const ritmo = sinal.ritmo ?? 480;
      for (const pose of sinal.poses) {
        passos.push({ palavra, glosa: sinal.glosa, datilologia: false, pose, duracao: ritmo });
      }
      continue;
    }

    // Sem sinal mapeado: soletra a palavra (datilologia), letra por letra.
    const letras = normalizar(palavra).slice(0, 8).split("");
    if (letras.length === 0) continue;
    letras.forEach((l, i) => {
      const config = LETRAS[l] ?? "aberta";
      passos.push({
        palavra,
        glosa: l.toUpperCase(),
        datilologia: true,
        duracao: 340,
        pose: {
          ...repouso,
          bracoDir: -58 + (i % 2 === 0 ? 0 : 4),
          coveloDir: -48 - (i % 2 === 0 ? 0 : 5),
          maoDir: config,
          maoEsq: "aberta",
        },
      });
    });
  }

  return passos;
}

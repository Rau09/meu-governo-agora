import { useCallback, useEffect, useState } from "react";

export type Agendamento = {
  id: string;
  area: string;
  servico: string;
  unidade: string;
  data: string;
  hora: string;
  nome: string;
  criadoEm: string;
  status: "confirmado" | "concluido";
};

export type Cidadao = {
  nome: string;
  cpf: string;
  telefone: string;
  bairro: string;
  municipio?: string;
  /** Hash SHA-256 do PIN + salt. O PIN nunca é guardado em texto puro. */
  pinHash?: string;
  salt?: string;
  consentimentoEm?: string;
};

const KEY_USER = "cantu.cidadao";
const KEY_AGENDA = "cantu.agendamentos";
const KEY_SESSAO = "cantu.sessao";
const KEY_TENTATIVAS = "cantu.tentativas";
const KEY_OCOR = "cantu.ocorrencias";
const KEY_ANIMAIS = "cantu.animais";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("cantu-store"));
}

/* ---------- Segurança ---------- */

export function validarCpf(valor: string) {
  const cpf = valor.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const digito = (base: number) => {
    let soma = 0;
    for (let i = 0; i < base; i++) soma += Number(cpf[i]) * (base + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(9) === Number(cpf[9]) && digito(10) === Number(cpf[10]);
}

export function validarTelefone(valor: string) {
  const d = valor.replace(/\D/g, "");
  return d.length >= 10 && d.length <= 11 && !/^(\d)\1+$/.test(d);
}

export function forcaPin(pin: string) {
  const d = pin.replace(/\D/g, "");
  if (d.length !== 6) return "O PIN precisa ter 6 dígitos.";
  if (/^(\d)\1{5}$/.test(d)) return "Evite PIN com todos os dígitos iguais.";
  const seq = "0123456789";
  const inv = "9876543210";
  if (seq.includes(d) || inv.includes(d)) return "Evite sequências como 123456.";
  return null;
}

export function gerarSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPin(pin: string, salt: string) {
  const dados = new TextEncoder().encode(`cantu:${salt}:${pin}`);
  const buf = await crypto.subtle.digest("SHA-256", dados);
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Mostra apenas os dígitos finais: ***.***.789-01 */
export function ocultarCpf(cpf: string) {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11) return "•••";
  return `•••.•••.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function ocultarTelefone(tel: string) {
  const d = tel.replace(/\D/g, "");
  if (d.length < 10) return "•••";
  return `(${d.slice(0, 2)}) ••••-${d.slice(-4)}`;
}

type Tentativas = { erros: number; bloqueadoAte: number };

export function lerTentativas(): Tentativas {
  return read<Tentativas>(KEY_TENTATIVAS, { erros: 0, bloqueadoAte: 0 });
}

export function registrarErroPin() {
  const t = lerTentativas();
  const erros = t.erros + 1;
  const bloqueadoAte = erros >= 5 ? Date.now() + 5 * 60 * 1000 : 0;
  write(KEY_TENTATIVAS, { erros: erros >= 5 ? 0 : erros, bloqueadoAte });
  return { erros, bloqueadoAte };
}

export function limparTentativas() {
  write(KEY_TENTATIVAS, { erros: 0, bloqueadoAte: 0 });
}

export function useCidadao() {
  const [cidadao, setCidadao] = useState<Cidadao | null>(null);
  const [desbloqueado, setDesbloqueado] = useState(false);

  useEffect(() => {
    const sync = () => {
      setCidadao(read<Cidadao | null>(KEY_USER, null));
      setDesbloqueado(window.sessionStorage.getItem(KEY_SESSAO) === "1");
    };
    sync();
    window.addEventListener("cantu-store", sync);
    return () => window.removeEventListener("cantu-store", sync);
  }, []);

  const salvar = useCallback((c: Cidadao) => {
    window.sessionStorage.setItem(KEY_SESSAO, "1");
    write(KEY_USER, c);
  }, []);

  const desbloquear = useCallback(async (pin: string) => {
    const atual = read<Cidadao | null>(KEY_USER, null);
    if (!atual?.pinHash || !atual.salt) return false;
    const ok = (await hashPin(pin, atual.salt)) === atual.pinHash;
    if (ok) {
      window.sessionStorage.setItem(KEY_SESSAO, "1");
      limparTentativas();
      window.dispatchEvent(new Event("cantu-store"));
    }
    return ok;
  }, []);

  const bloquear = useCallback(() => {
    window.sessionStorage.removeItem(KEY_SESSAO);
    window.dispatchEvent(new Event("cantu-store"));
  }, []);

  const sair = useCallback(() => {
    window.sessionStorage.removeItem(KEY_SESSAO);
    limparTentativas();
    write(KEY_USER, null);
  }, []);

  return { cidadao, desbloqueado, salvar, sair, desbloquear, bloquear };
}


export function useAgendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

  useEffect(() => {
    const sync = () => setAgendamentos(read<Agendamento[]>(KEY_AGENDA, []));
    sync();
    window.addEventListener("cantu-store", sync);
    return () => window.removeEventListener("cantu-store", sync);
  }, []);

  const criar = useCallback((a: Omit<Agendamento, "id" | "criadoEm" | "status">) => {
    const atual = read<Agendamento[]>(KEY_AGENDA, []);
    const novo: Agendamento = {
      ...a,
      id: Math.random().toString(36).slice(2, 9).toUpperCase(),
      criadoEm: new Date().toISOString(),
      status: "confirmado",
    };
    write(KEY_AGENDA, [novo, ...atual]);
    return novo;
  }, []);

  const cancelar = useCallback((id: string) => {
    const atual = read<Agendamento[]>(KEY_AGENDA, []);
    write(
      KEY_AGENDA,
      atual.filter((a) => a.id !== id),
    );
  }, []);

  return { agendamentos, criar, cancelar };
}

export const AREAS = [
  {
    id: "saude",
    nome: "Saúde",
    cor: "text-success",
    servicos: [
      "Consulta clínico geral",
      "Consulta odontológica",
      "Vacinação",
      "Exames laboratoriais",
      "Consulta pediátrica",
      "Saúde da mulher",
    ],
    unidades: ["UBS Central", "UBS Bela Vista", "UBS São Francisco", "Centro Odontológico"],
  },
  {
    id: "educacao",
    nome: "Educação",
    cor: "text-primary",
    servicos: [
      "Matrícula escolar",
      "Vaga em creche",
      "Transporte escolar",
      "Reunião pedagógica",
      "Solicitação de histórico",
    ],
    unidades: ["Secretaria de Educação", "Escola Municipal Centro", "CMEI Girassol"],
  },
  {
    id: "urbanos",
    nome: "Serviços Urbanos",
    cor: "text-accent",
    servicos: [
      "Coleta de entulho",
      "Iluminação pública",
      "Tapa-buraco",
      "Poda de árvore",
      "Limpeza de terreno",
    ],
    unidades: ["Secretaria de Obras", "Garagem Municipal"],
  },
  {
    id: "cidadania",
    nome: "Cidadania e Tributos",
    cor: "text-primary",
    servicos: ["Segunda via de IPTU", "Alvará de funcionamento", "Assistência social", "Protocolo geral"],
    unidades: ["Paço Municipal", "CRAS Quedas do Iguaçu"],
  },
] as const;

export const HORARIOS = [
  "08:00",
  "08:40",
  "09:20",
  "10:00",
  "10:40",
  "13:00",
  "13:40",
  "14:20",
  "15:00",
  "15:40",
  "16:20",
];

/* ---------- Medicamentos (dados simulados) ---------- */

export type Medicamento = {
  nome: string;
  unidade: string;
  quantidade: number;
};

export function statusMedicamento(qtd: number) {
  if (qtd <= 0) return { id: "indisponivel", rotulo: "Indisponível", emoji: "🔴" } as const;
  if (qtd <= 30) return { id: "baixo", rotulo: "Estoque baixo", emoji: "🟡" } as const;
  return { id: "disponivel", rotulo: "Disponível", emoji: "🟢" } as const;
}

export const MEDICAMENTOS: Medicamento[] = [
  { nome: "Dipirona 500mg", unidade: "UBS Central", quantidade: 420 },
  { nome: "Dipirona 500mg", unidade: "UBS Bela Vista", quantidade: 18 },
  { nome: "Paracetamol 750mg", unidade: "UBS Central", quantidade: 260 },
  { nome: "Paracetamol 750mg", unidade: "UBS São Francisco", quantidade: 0 },
  { nome: "Amoxicilina 500mg", unidade: "UBS Central", quantidade: 75 },
  { nome: "Amoxicilina 500mg", unidade: "UBS Bela Vista", quantidade: 12 },
  { nome: "Ibuprofeno 600mg", unidade: "UBS São Francisco", quantidade: 145 },
  { nome: "Omeprazol 20mg", unidade: "UBS Central", quantidade: 310 },
  { nome: "Omeprazol 20mg", unidade: "UBS Bela Vista", quantidade: 0 },
  { nome: "Losartana 50mg", unidade: "UBS Central", quantidade: 520 },
  { nome: "Losartana 50mg", unidade: "UBS São Francisco", quantidade: 24 },
  { nome: "Metformina 850mg", unidade: "UBS Bela Vista", quantidade: 180 },
  { nome: "Captopril 25mg", unidade: "UBS São Francisco", quantidade: 96 },
  { nome: "Insulina NPH", unidade: "UBS Central", quantidade: 28 },
  { nome: "Salbutamol spray", unidade: "UBS Bela Vista", quantidade: 0 },
  { nome: "Soro fisiológico", unidade: "UBS Central", quantidade: 640 },
  { nome: "Anticoncepcional oral", unidade: "UBS São Francisco", quantidade: 210 },
  { nome: "Ácido fólico", unidade: "UBS Central", quantidade: 22 },
  { nome: "Sinvastatina 20mg", unidade: "UBS Bela Vista", quantidade: 155 },
  { nome: "Prednisona 20mg", unidade: "UBS São Francisco", quantidade: 8 },
];

/* ---------- Comunicar problema (ocorrências) ---------- */

export const CATEGORIAS_OCORRENCIA = [
  "Buraco na rua",
  "Poste/lâmpada com defeito",
  "Árvore caída",
  "Lixo/entulho",
  "Problema na via",
  "Vazamento",
  "Outro",
] as const;

export type StatusOcorrencia = "pendente" | "analise" | "execucao" | "resolvido";

export const STATUS_OCORRENCIA: {
  id: StatusOcorrencia;
  rotulo: string;
  emoji: string;
  classe: string;
}[] = [
  { id: "pendente", rotulo: "Pendente", emoji: "🔴", classe: "bg-destructive/10 text-destructive" },
  { id: "analise", rotulo: "Em análise", emoji: "🟡", classe: "bg-accent-soft text-accent-foreground" },
  { id: "execucao", rotulo: "Em execução", emoji: "🔵", classe: "bg-primary-soft text-primary" },
  { id: "resolvido", rotulo: "Resolvido", emoji: "🟢", classe: "bg-success/15 text-success" },
];

export type Ocorrencia = {
  protocolo: string;
  categoria: string;
  descricao: string;
  foto?: string;
  local?: { lat: number; lng: number } | undefined;
  endereco?: string;
  criadoEm: string;
  status: StatusOcorrencia;
};

export function useOcorrencias() {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);

  useEffect(() => {
    const sync = () => setOcorrencias(read<Ocorrencia[]>(KEY_OCOR, []));
    sync();
    window.addEventListener("cantu-store", sync);
    return () => window.removeEventListener("cantu-store", sync);
  }, []);

  const criar = useCallback((o: Omit<Ocorrencia, "protocolo" | "criadoEm" | "status">) => {
    const atual = read<Ocorrencia[]>(KEY_OCOR, []);
    const ano = new Date().getFullYear();
    const nova: Ocorrencia = {
      ...o,
      protocolo: `CANTU-${ano}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      criadoEm: new Date().toISOString(),
      status: "pendente",
    };
    write(KEY_OCOR, [nova, ...atual]);
    return nova;
  }, []);

  const atualizarStatus = useCallback((protocolo: string, status: StatusOcorrencia) => {
    const atual = read<Ocorrencia[]>(KEY_OCOR, []);
    write(
      KEY_OCOR,
      atual.map((o) => (o.protocolo === protocolo ? { ...o, status } : o)),
    );
  }, []);

  return { ocorrencias, criar, atualizarStatus };
}

export function lerOcorrencias(): Ocorrencia[] {
  return read<Ocorrencia[]>(KEY_OCOR, []);
}

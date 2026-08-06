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
};

const KEY_USER = "qi.cidadao";
const KEY_AGENDA = "qi.agendamentos";

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
  window.dispatchEvent(new Event("qi-store"));
}

export function useCidadao() {
  const [cidadao, setCidadao] = useState<Cidadao | null>(null);

  useEffect(() => {
    const sync = () => setCidadao(read<Cidadao | null>(KEY_USER, null));
    sync();
    window.addEventListener("qi-store", sync);
    return () => window.removeEventListener("qi-store", sync);
  }, []);

  const salvar = useCallback((c: Cidadao) => write(KEY_USER, c), []);
  const sair = useCallback(() => write(KEY_USER, null), []);

  return { cidadao, salvar, sair };
}

export function useAgendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

  useEffect(() => {
    const sync = () => setAgendamentos(read<Agendamento[]>(KEY_AGENDA, []));
    sync();
    window.addEventListener("qi-store", sync);
    return () => window.removeEventListener("qi-store", sync);
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

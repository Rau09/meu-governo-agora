import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

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
  municipio: string;
  estado: string;
  preferencias: string[];
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
  const [session, setSession] = useState<Session | null>(null);
  const [desbloqueado, setDesbloqueado] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Sincronizar sessão do Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // 2. Sincronizar dados do perfil do LocalStorage (Preservando app atual)
    const sync = () => {
      setCidadao(read<Cidadao | null>(KEY_USER, null));
      setDesbloqueado(window.sessionStorage.getItem(KEY_SESSAO) === "1");
    };
    sync();
    window.addEventListener("cantu-store", sync);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("cantu-store", sync);
    };
  }, []);

  // Sincronizar Perfil do Banco quando logado
  useEffect(() => {
    if (!session?.user) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (data && !error) {
        // Se temos dados no banco, priorizamos eles sobre o localStorage
        const profileData: Cidadao = {
          nome: data.nome,
          cpf: data.cpf || "",
          telefone: data.telefone || "",
          bairro: data.bairro || "",
          municipio: data.municipio || "Quedas do Iguaçu",
          estado: data.estado || "PR",
          preferencias: data.preferencias || [],
        };
        write(KEY_USER, profileData);
      }
    };

    fetchProfile();
  }, [session]);

  const salvar = useCallback(async (c: Cidadao) => {
    // Salvar localmente para manter UX fluida
    window.sessionStorage.setItem(KEY_SESSAO, "1");
    write(KEY_USER, c);

    // Se estiver logado no Supabase, salvar no banco também
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('profiles').upsert({
        id: session.user.id,
        nome: c.nome,
        cpf: c.cpf,
        telefone: c.telefone,
        bairro: c.bairro,
        municipio: c.municipio,
        estado: c.estado,
        preferencias: c.preferencias,
      } as any);
    }
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

  const sair = useCallback(async () => {
    await supabase.auth.signOut();
    window.sessionStorage.removeItem(KEY_SESSAO);
    limparTentativas();
    write(KEY_USER, null);
  }, []);

  return { cidadao, session, desbloqueado, loading, salvar, sair, desbloquear, bloquear };
}


export function useAgendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const { session } = useCidadao();

  useEffect(() => {
    // Sincronizar local
    const syncLocal = () => setAgendamentos(read<Agendamento[]>(KEY_AGENDA, []));
    syncLocal();
    window.addEventListener("cantu-store", syncLocal);

    // Sincronizar remoto se logado
    if (session?.user) {
      const fetchRemoto = async () => {
        const { data, error } = await supabase
          .from('agendamentos')
          .select('*')
          .eq('user_id', session.user.id)
          .order('criado_em', { ascending: false });

        if (data && !error) {
          const remoteAgendas: Agendamento[] = data.map(d => ({
            id: d.protocolo, // Usamos protocolo como ID visual
            area: d.area,
            servico: d.servico,
            unidade: d.unidade,
            data: d.data,
            hora: d.hora,
            nome: d.nome_paciente,
            criadoEm: d.criado_em || new Date().toISOString(),
            status: d.status as any,
          }));
          setAgendamentos(remoteAgendas);
          write(KEY_AGENDA, remoteAgendas);
        }
      };
      fetchRemoto();
    }

    return () => window.removeEventListener("cantu-store", syncLocal);
  }, [session]);

  const criar = useCallback(async (a: Omit<Agendamento, "id" | "criadoEm" | "status">) => {
    const atual = read<Agendamento[]>(KEY_AGENDA, []);
    const protocolo = Math.random().toString(36).slice(2, 9).toUpperCase();
    
    const novo: Agendamento = {
      ...a,
      id: protocolo,
      criadoEm: new Date().toISOString(),
      status: "confirmado",
    };

    // Salvar local
    write(KEY_AGENDA, [novo, ...atual]);

    // Salvar remoto se logado
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('agendamentos').insert({
        user_id: session.user.id,
        protocolo: protocolo,
        area: a.area,
        servico: a.servico,
        unidade: a.unidade,
        data: a.data,
        hora: a.hora,
        nome_paciente: a.nome,
        status: "confirmado"
      });
    }

    return novo;
  }, []);

  const cancelar = useCallback(async (id: string) => {
    const atual = read<Agendamento[]>(KEY_AGENDA, []);
    write(
      KEY_AGENDA,
      atual.filter((a) => a.id !== id),
    );

    // Cancelar remoto (usando protocolo que mapeamos para ID)
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('agendamentos').delete().eq('protocolo', id).eq('user_id', session.user.id);
    }
  }, []);

  return { agendamentos, criar, cancelar };
}

export const MUNICIPIOS_CANTU = [
  "Cantagalo",
  "Catanduvas",
  "Espigão Alto do Iguaçu",
  "Foz do Jordão",
  "Goioxim",
  "Guaraniaçu",
  "Laranjeiras do Sul",
  "Marquinho",
  "Nova Laranjeiras",
  "Pinhão",
  "Porto Barreiro",
  "Quedas do Iguaçu",
  "Reserva do Iguaçu",
  "Rio Bonito do Iguaçu",
  "Virmond",
];

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
  // Dados oficiais de referência (Quedas do Iguaçu - 08/12/2025)
  { nome: "Albendazol 400 mg", unidade: "Farmácia Municipal", quantidade: 2163 },
  { nome: "Carvedilol 3,125 mg", unidade: "Farmácia Municipal", quantidade: 27450 },
  { nome: "Amoxicilina 250 mg/5 ml", unidade: "Farmácia Municipal", quantidade: 923 },
  { nome: "Levotiroxina 100 mcg", unidade: "Farmácia Municipal", quantidade: 6390 },
  { nome: "Levotiroxina 50 mcg", unidade: "Farmácia Municipal", quantidade: 16850 },
  { nome: "Rivaroxabana 20 mg", unidade: "Farmácia Municipal", quantidade: 3810 },
  
  // Dados de acompanhamento simulados para outras unidades
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
  "Causa Animal / Maus-tratos",
  "Problema na via",
  "Vazamento",
  "Outro",
] as const;

export type StatusOcorrencia = "recebido" | "analise" | "encaminhado" | "andamento" | "resolvido";

export type Ocorrencia = {
  protocolo: string;
  categoria: string;
  descricao: string;
  foto?: string | null;
  local?: { lat: number; lng: number } | null;
  endereco?: string | null;
  criadoEm: string;
  status: StatusOcorrencia;
};

export const STATUS_OCORRENCIA: {
  id: StatusOcorrencia;
  rotulo: string;
  emoji: string;
  classe: string;
  gravidade: number; // 1 (Normal) a 4 (Emergência)
}[] = [
  { id: "recebido", rotulo: "Recebido", emoji: "📥", classe: "bg-secondary text-muted-foreground", gravidade: 1 },
  { id: "analise", rotulo: "Em análise", emoji: "🟡", classe: "bg-accent-soft text-accent-foreground", gravidade: 2 },
  { id: "encaminhado", rotulo: "Encaminhado", emoji: "📤", classe: "bg-primary-soft text-primary", gravidade: 2 },
  { id: "andamento", rotulo: "Em andamento", emoji: "🔵", classe: "bg-info text-white", gravidade: 3 },
  { id: "resolvido", rotulo: "Resolvido", emoji: "🟢", classe: "bg-success/15 text-success", gravidade: 0 },
];

export function useOcorrencias() {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const { session } = useCidadao();

  useEffect(() => {
    // Sincronizar local
    const syncLocal = () => setOcorrencias(read<Ocorrencia[]>(KEY_OCOR, []));
    syncLocal();
    window.addEventListener("cantu-store", syncLocal);

    // Sincronizar remoto se logado
    if (session?.user) {
      const fetchRemoto = async () => {
        const { data, error } = await supabase
          .from('ocorrencias')
          .select('*')
          .order('criado_em', { ascending: false });

        if (data && !error) {
          const remoteOcor: Ocorrencia[] = data.map(d => ({
            protocolo: d.protocolo,
            categoria: d.categoria,
            descricao: d.descricao,
            foto: d.foto_url || undefined,
            local: d.lat && d.lng ? { lat: d.lat, lng: d.lng } : undefined,
            endereco: d.endereco || undefined,
            criadoEm: d.criado_em || new Date().toISOString(),
            status: d.status as StatusOcorrencia,
          }));
          setOcorrencias(remoteOcor);
          write(KEY_OCOR, remoteOcor);
        }
      };
      fetchRemoto();
    }

    return () => window.removeEventListener("cantu-store", syncLocal);
  }, [session]);

  const criar = useCallback(async (o: Omit<Ocorrencia, "protocolo" | "criadoEm" | "status">) => {
    const atual = read<Ocorrencia[]>(KEY_OCOR, []);
    const ano = new Date().getFullYear();
    const protocolo = `CANTU-${ano}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    
    const nova: Ocorrencia = {
      ...o,
      protocolo: protocolo,
      criadoEm: new Date().toISOString(),
      status: "recebido",
    };

    // Salvar local
    write(KEY_OCOR, [nova, ...atual]);

    // Salvar remoto se logado
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('ocorrencias').insert({
        user_id: session.user.id,
        protocolo: protocolo,
        categoria: o.categoria,
        descricao: o.descricao,
        foto_url: o.foto,
        lat: o.local?.lat,
        lng: o.local?.lng,
        endereco: o.endereco,
        status: "recebido"
      });
    }

    return nova;
  }, []);

  const atualizarStatus = useCallback(async (protocolo: string, status: StatusOcorrencia) => {
    const atual = read<Ocorrencia[]>(KEY_OCOR, []);
    write(
      KEY_OCOR,
      atual.map((o) => (o.protocolo === protocolo ? { ...o, status } : o)),
    );

    // Atualizar remoto se logado
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('ocorrencias').update({ status }).eq('protocolo', protocolo);
    }
  }, []);

  return { ocorrencias, criar, atualizarStatus };
}

export function lerOcorrencias(): Ocorrencia[] {
  return read<Ocorrencia[]>(KEY_OCOR, []);
}

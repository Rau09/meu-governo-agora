import { MEDICAMENTOS, STATUS_OCORRENCIA, lerOcorrencias, statusMedicamento, type Medicamento, type Ocorrencia } from "@/lib/cantu-store";
import { normalizar } from "@/lib/libras";

/**
 * Inteligência Cantu Conecta.
 * IA Municipal Digital de Quedas do Iguaçu, PR.
 */

export type TipoResposta = "texto" | "medicamento" | "protocolo" | "opcoes" | "servico";

export type Resposta = {
  tipo: TipoResposta;
  texto: string;
  dados?: any;
  acao?: { rotulo: string; para: string };
  opcoes?: { rotulo: string; valor: string }[];
};

function tokens(p: string) {
  return p
    .split(/\s+/)
    .map(normalizar)
    .filter((t) => t.length > 1);
}

const REGRAS: { chaves: string[]; resposta: Resposta }[] = [
  {
    chaves: ["saude", "ubs", "posto", "dentista", "exame", "medico"],
    resposta: {
      tipo: "servico",
      texto: "Entendi que você precisa de serviços de saúde. Como posso ajudar?",
      opcoes: [
        { rotulo: "🏥 Unidades Próximas", valor: "Onde tem posto?" },
        { rotulo: "📅 Agendar Consulta", valor: "Quero marcar consulta" },
        { rotulo: "💊 Remédios", valor: "Tem remédio?" },
      ],
      acao: { rotulo: "Ver Área de Saúde", para: "/saude" }
    }
  },
  {
    chaves: ["buraco", "lixo", "iluminacao", "poste", "rua", "vazamento"],
    resposta: {
      tipo: "servico",
      texto: "Posso ajudar você a comunicar um problema na cidade. O que aconteceu?",
      opcoes: [
        { rotulo: "🕳️ Buraco na Via", valor: "Tem um buraco aqui" },
        { rotulo: "💡 Poste sem Luz", valor: "Luz do poste queimou" },
        { rotulo: "🗑️ Acúmulo de Lixo", valor: "Tem lixo na rua" },
      ],
      acao: { rotulo: "Abrir Ocorrência", para: "/ocorrencia" }
    }
  },
  {
    chaves: ["animal", "cachorro", "gato", "maustratos", "adocao"],
    resposta: {
      tipo: "servico",
      texto: "A Causa Animal é prioridade em Quedas do Iguaçu. Como quer ajudar hoje?",
      opcoes: [
        { rotulo: "🐕 Quero Adotar", valor: "Como adotar um pet?" },
        { rotulo: "🚨 Denunciar Maus-tratos", valor: "Maus-tratos animais" },
        { rotulo: "📍 Mapa Animal", valor: "Onde estão os pets?" },
      ],
      acao: { rotulo: "Causa Animal", para: "/causa-animal" }
    }
  },
  {
    chaves: ["transparencia", "gasto", "prefeitura", "contas", "dados"],
    resposta: {
      tipo: "servico",
      texto: "A transparência é fundamental. O que você deseja consultar?",
      opcoes: [
        { rotulo: "💰 Gastos Públicos", valor: "Quanto a prefeitura gastou?" },
        { rotulo: "📄 Diário Oficial", valor: "Ver diário oficial" },
        { rotulo: "📊 Dados Abertos", valor: "Portal da Transparência" },
      ],
      acao: { rotulo: "Portal da Transparência", para: "/transparencia" }
    }
  }
];

const CHAVES_MEDICAMENTO = ["remedio", "remedios", "medicamento", "medicamentos", "farmacia", "estoque"];
const CHAVES_PROTOCOLO = ["protocolo", "solicitacao", "chamado", "andamento", "status", "acompanhar"];

function buscarMedicamento(pergunta: string): Resposta | null {
  const p = normalizar(pergunta);
  const nomes = [...new Set(MEDICAMENTOS.map((m) => m.nome))];
  const achado = nomes.find((n) => {
    const base = normalizar(n.split(" ")[0]!);
    return base.length > 3 && p.includes(base);
  });

  if (!achado) return null;

  const itens = MEDICAMENTOS.filter((m) => m.nome === achado);
  
  return {
    tipo: "medicamento",
    texto: `Localizei a disponibilidade de ${achado} nas farmácias de Quedas do Iguaçu.`,
    dados: itens,
    acao: { rotulo: "Ver Detalhes", para: "/medicamentos" }
  };
}

function consultarProtocolo(pergunta: string): Resposta | null {
  const ocorrencias = lerOcorrencias();
  const codigo = pergunta.match(/CANTU-\d{4}-[A-Z0-9]{4,6}/i)?.[0]?.toUpperCase();

  if (codigo) {
    const o = ocorrencias.find((x) => x.protocolo.toUpperCase() === codigo);
    if (!o) {
      return {
        tipo: "texto",
        texto: `Não encontrei o protocolo ${codigo} neste aparelho. Verifique se o código está correto.`,
      };
    }
    return {
      tipo: "protocolo",
      texto: `Aqui está o andamento da sua solicitação ${o.protocolo}:`,
      dados: [o]
    };
  }

  if (!tokens(pergunta).some((t) => CHAVES_PROTOCOLO.includes(t))) return null;

  if (ocorrencias.length === 0) {
    return {
      tipo: "texto",
      texto: "Você ainda não possui solicitações registradas. Posso te ajudar a comunicar um problema agora.",
      acao: { rotulo: "Comunicar Problema", para: "/ocorrencia" }
    };
  }

  return {
    tipo: "protocolo",
    texto: `Encontrei ${ocorrencias.length} ${ocorrencias.length === 1 ? 'solicitação vinculada' : 'solicitações vinculadas'} ao seu aparelho:`,
    dados: ocorrencias.slice(0, 5)
  };
}

export function responder(pergunta: string): Resposta {
  const t = tokens(pergunta);
  if (t.length === 0) {
    return { 
      tipo: "texto",
      texto: "Olá! Sou o Assistente do Cidadão. Como posso ajudar você hoje?",
      opcoes: [
        { rotulo: "💊 Medicamentos", valor: "Tem remédio?" },
        { rotulo: "📍 Problemas Urbanos", valor: "Denunciar buraco" },
        { rotulo: "🏥 Agendar Saúde", valor: "Marcar consulta" }
      ]
    };
  }

  const protocolo = consultarProtocolo(pergunta);
  if (protocolo) return protocolo;

  const medicamento = buscarMedicamento(pergunta);
  if (medicamento) return medicamento;

  if (t.some((x) => CHAVES_MEDICAMENTO.includes(x))) {
    return {
      tipo: "texto",
      texto: "Qual medicamento você está procurando? Posso verificar o estoque agora mesmo.",
      opcoes: [
        { rotulo: "Albendazol", valor: "Tem Albendazol?" },
        { rotulo: "Amoxicilina", valor: "Tem Amoxicilina?" },
        { rotulo: "Dipirona", valor: "Tem Dipirona?" }
      ]
    };
  }

  // Busca por regras de serviço
  for (const regra of REGRAS) {
    if (t.some((x) => regra.chaves.some((c) => x === c || (x.length > 4 && c.includes(x))))) {
      return regra.resposta;
    }
  }

  return {
    tipo: "texto",
    texto: "Ainda não tenho essa informação, mas posso te encaminhar para o atendimento responsável ou ajudar com outros serviços.",
    opcoes: [
      { rotulo: "🏛️ Contato Prefeitura", valor: "Falar com a prefeitura" },
      { rotulo: "📊 Transparência", valor: "Portal da Transparência" },
      { rotulo: "🔙 Voltar ao Início", valor: "Olá" }
    ]
  };
}

import { MEDICAMENTOS, STATUS_OCORRENCIA, lerOcorrencias, statusMedicamento, useCidadao } from "@/lib/cantu-store";

/**
 * Inteligência Artificial Cantu Conecta (NexLine).
 * 
 * Motor de processamento de linguagem natural otimizado para a região
 * da Cantuquiriguaçu, PR. Especializada em triagem de saúde, 
 * gestão de causa animal, serviços urbanos e suporte ao cidadão.
 */

export type Resposta = { texto: string; acao?: { rotulo: string; para: string }; generico?: boolean };

function normalizar(p: string) {
  return p
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function tokens(p: string) {
  return p
    .split(/\s+/)
    .map(normalizar)
    .filter((t) => t.length > 1);
}

type Regra = {
  chaves: string[];
  resposta: Resposta;
};

const REGRAS: Regra[] = [
  {
    chaves: ["oi", "ola", "bom", "dia", "tarde", "noite", "saudacoes", "tudo", "bem"],
    resposta: {
      texto: "Olá! Tudo bem por aqui, e com você? Sou a inteligência do NexLine. Como posso ser útil para você hoje na região Cantuquiriguaçu?",
    }
  },
  {
    chaves: ["quem", "voce", "oque", "faz", "ajuda", "funcao", "ia", "bot"],
    resposta: {
      texto: "Eu sou o assistente digital integrado da Cantuquiriguaçu. Minha função é facilitar sua vida: posso agendar consultas, verificar remédios nas UBS, acompanhar protocolos de obras e até ajudar na causa animal. O que precisa agora?",
    }
  },
  {
    chaves: ["obrigado", "valeu", "tchau", "ate", "agradecido", "ajudou"],
    resposta: {
      texto: "Imagina, estou aqui para isso! Se precisar de mais alguma coisa, é só me chamar. Tenha um excelente dia!",
    }
  },
  {
    chaves: ["consulta", "consultar", "medico", "clinico", "saude", "ubs", "posto", "dentista", "odonto", "exame", "pediatra", "especialista", "cardiologista", "ginecologista"],
    resposta: {
      texto:
        "O sistema de agendamento permite marcar consultas com clínicos gerais, dentistas e especialistas disponíveis na rede. Para exames laboratoriais ou de imagem, você deve anexar a guia médica digitalizada ou informar o código da requisição.",
      acao: { rotulo: "Iniciar Agendamento", para: "/agendamento" },
    },
  },
  {
    chaves: ["vacina", "vacinacao", "imunizacao", "dose", "gripe", "covid", "campanha"],
    resposta: {
      texto:
        "As campanhas de vacinação seguem o cronograma nacional. Você pode verificar o estoque de doses e as unidades com vacinadores ativos agora. Lembre-se de levar sua Carteira de Vacinação e o Cartão SUS.",
      acao: { rotulo: "Ver Calendário/Vagas", para: "/agendamento" },
    },
  },
  {
    chaves: ["iptu", "imposto", "boleto", "tributo", "segunda", "via", "alvara", "divida", "ativa", "certidao", "negativa"],
    resposta: {
      texto:
        "Para emissão de tributos, o NexLine integra com o Portal do Contribuinte. Você pode emitir guias de IPTU, ISS e Certidões Negativas utilizando seu CPF ou Inscrição Imobiliária.",
      acao: { rotulo: "Portal de Tributos", para: "/servicos" },
    },
  },
  {
    chaves: ["matricula", "escola", "creche", "transporte", "escolar", "cmei", "educacao", "historico", "vaga", "transferencia"],
    resposta: {
      texto:
        "A gestão educacional inclui solicitação de vagas em CMEIs, renovação de matrículas e consulta ao itinerário do transporte escolar. Os editais de convocação são atualizados semanalmente.",
      acao: { rotulo: "Educação e Vagas", para: "/servicos" },
    },
  },
  {
    chaves: ["horario", "funcionamento", "aberto", "atende", "expediente", "feriado", "plantao"],
    resposta: {
      texto: "Os serviços digitais NexLine operam 24/7. Unidades Administrativas atendem das 08h às 17h. Unidades de Pronto Atendimento (PA) e hospitais operam em regime de plantão 24h.",
    },
  },
  {
    chaves: ["cadastro", "acesso", "conta", "pin", "senha", "registrar", "cadastrar", "biometria", "perfil"],
    resposta: {
      texto:
        "Sua Identidade Digital NexLine é protegida por criptografia de ponta a ponta. O PIN de 6 dígitos é armazenado localmente no hardware de segurança do seu dispositivo (Enclave Seguro/TEE).",
      acao: { rotulo: "Gerenciar Identidade", para: "/registro" },
    },
  },
  {
    chaves: ["agendamento", "agendar", "marcar", "remarcar", "cancelar", "horarios", "confirmar", "minhas", "consultas"],
    resposta: {
      texto:
        "No painel de agendamentos você visualiza o histórico completo, status das solicitações e pode realizar o cancelamento com até 24h de antecedência para liberar a vaga a outro cidadão.",
      acao: { rotulo: "Meus Agendamentos", para: "/agendamento" },
    },
  },
];

const CHAVES_MEDICAMENTO = [
  "remedio", "remedios", "medicamento", "medicamentos", "farmacia", "estoque", "comprimido", "receita",
];

const CHAVES_PROBLEMA = [
  "buraco", "lixo", "entulho", "poste", "lampada", "luz", "iluminacao", "poda", "arvore", "vazamento",
  "esgoto", "rua", "via", "problema", "reclamar", "reclamacao", "denunciar", "comunicar", "asfalto",
];

const CHAVES_PROTOCOLO = ["protocolo", "solicitacao", "chamado", "andamento", "status", "acompanhar"];

function buscarMedicamento(pergunta: string): Resposta | null {
  const p = normalizar(pergunta);
  const nomes = [...new Set(MEDICAMENTOS.map((m) => m.nome))];
  const achado = nomes.find((n) => {
    const firstWord = n.split(" ")[0];
    if (!firstWord) return false;
    const base = normalizar(firstWord);
    return base.length > 3 && p.includes(base);
  });

  if (!achado) return null;

  const itens = MEDICAMENTOS.filter((m) => m.nome === achado);
  const linhas = itens.map((m) => {
    const st = statusMedicamento(m.quantidade);
    return `${st.emoji} ${m.unidade}: ${st.rotulo} (${m.quantidade} unid.)`;
  });

  return {
    texto: `${achado} nas unidades de saúde:\n${linhas.join("\n")}`,
    acao: { rotulo: "Ver medicamentos", para: "/medicamentos" },
  };
}

function consultarProtocolo(pergunta: string): Resposta | null {
  const ocorrencias = lerOcorrencias();
  const codigo = pergunta.match(/CANTU-\d{4}-[A-Z0-9]{4,6}/i)?.[0]?.toUpperCase();

  if (codigo) {
    const o = ocorrencias.find((x) => x.protocolo.toUpperCase() === codigo);
    if (!o) {
      return {
        texto: `O sistema de rastreamento não localizou o protocolo ${codigo} neste dispositivo. Por favor, verifique se o código está correto ou se a sincronização com a Central de Atendimento foi concluída.`,
      };
    }
    const st = STATUS_OCORRENCIA.find((s) => s.id === o.status)!;
    return {
      texto: `Análise do Protocolo ${o.protocolo}:\n• Categoria: ${o.categoria}\n• Status Atual: ${st.emoji} ${st.rotulo}\n• Data de Abertura: ${new Date(
        o.criadoEm,
      ).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" })}\n\nA equipe técnica está processando sua solicitação de acordo com o nível de prioridade estabelecido.`,
    };
  }

  if (!tokens(pergunta).some((t) => CHAVES_PROTOCOLO.includes(t))) return null;

  if (ocorrencias.length === 0) {
    return {
      texto:
        "Não identifiquei registros de solicitações ou ocorrências vinculadas a este perfil no momento. Se você deseja reportar um novo incidente, utilize o botão abaixo.",
      acao: { rotulo: "Abrir Novo Chamado", para: "/ocorrencia" },
    };
  }

  const linhas = ocorrencias.slice(0, 3).map((o) => {
    const st = STATUS_OCORRENCIA.find((s) => s.id === o.status)!;
    return `• ${o.protocolo} [${o.categoria}]: ${st.rotulo}`;
  });

  return {
    texto: `Encontrei as seguintes interações recentes no seu histórico:\n\n${linhas.join("\n")}\n\nDeseja detalhar alguma dessas solicitações ou registrar um novo evento?`,
    acao: { rotulo: "Nova Ocorrência", para: "/ocorrencia" },
  };
}

export function responder(pergunta: string): Resposta {
  const t = tokens(pergunta);
  const pLower = pergunta.toLowerCase();
  
  // Respostas de conversação fluida e natural
  if (t.some(x => ["oi", "ola", "bom", "dia", "tarde", "noite", "saudacoes"].includes(x)) && t.length <= 3) {
    const cumprimentos = [
      "Olá! É um prazer falar com você. Como posso tornar seu dia na Cantuquiriguaçu melhor hoje?",
      "Oi! Tudo bem? Sou sua assistente NexLine. Em que posso te ajudar agora?",
      "Olá! Estou aqui para facilitar sua vida. O que você precisa resolver hoje?"
    ];
    const selecionado = cumprimentos[Math.floor(Math.random() * cumprimentos.length)];
    return { texto: selecionado || cumprimentos[0]! };
  }

  if (pLower.includes("tudo bem") || pLower.includes("como vai") || pLower.includes("tudo certo")) {
    return { 
      texto: "Por aqui está tudo ótimo, trabalhando para deixar nossa cidade cada vez mais conectada! E com você, como está sendo o seu dia?" 
    };
  }

  if (pLower.includes("quem e voce") || pLower.includes("o que voce faz") || pLower.includes("ajuda")) {
    return {
      texto: "Eu sou a inteligência artificial da NexLine, focada em ajudar a comunidade da Cantuquiriguaçu. Posso te ajudar com agendamentos de saúde, informações sobre medicamentos, registro de ocorrências urbanas e suporte na causa animal. O que gostaria de explorar?"
    };
  }

  if (pLower.includes("legal") || pLower.includes("entendi") || pLower.includes("bacana") || pLower.includes("show")) {
    return { texto: "Fico feliz que tenha entendido! Há algo mais específico que você gostaria de saber ou fazer agora?" };
  }

  if (t.length === 0) {
    return { 
      texto: "Estou te ouvindo! Poderia me contar um pouco mais sobre sua dúvida ou o que você está procurando? Assim consigo te dar uma resposta bem precisa." 
    };
  }

  // Lógica de Prioridade: Protocolos e Solicitações
  const protocolo = consultarProtocolo(pergunta);
  if (protocolo) return protocolo;

  // Lógica de Farmácia e Medicamentos
  if (t.some((x) => CHAVES_MEDICAMENTO.includes(x))) {
    const especifico = buscarMedicamento(pergunta);
    if (especifico) return especifico;
    return {
      texto:
        "Entendi que você tem interesse em medicamentos. Posso verificar o estoque das nossas unidades de saúde agora mesmo. Qual medicamento você gostaria de consultar?",
      acao: { rotulo: "Consultar Medicamentos", para: "/medicamentos" },
    };
  }

  const medicamento = buscarMedicamento(pergunta);
  if (medicamento) return medicamento;

  // Lógica de Ocorrências e Zeladoria Urbana
  if (t.some((x) => CHAVES_PROBLEMA.includes(x))) {
    return {
      texto:
        "Sinto muito pelo transtorno na sua região. Para que possamos resolver isso o quanto antes, você pode registrar uma ocorrência com fotos e localização exata. Quer fazer isso agora?",
      acao: { rotulo: "Relatar Ocorrência", para: "/ocorrencia" },
    };
  }

  // Motor de Busca por Contexto (NLP Simplificado)
  let melhor: { regra: Regra; pontos: number } | null = null;
  for (const regra of REGRAS) {
    const pontos = t.filter((x) => 
      regra.chaves.some((c) => x === c || (x.length > 4 && c.includes(x)))
    ).length;
    if (pontos > 0 && (!melhor || pontos > melhor.pontos)) melhor = { regra, pontos };
  }
  
  if (melhor) return melhor.regra.resposta;

  // Resposta de fallback fluida
  return {
    texto:
      "Ainda estou aprendendo a conversar sobre alguns assuntos, mas conheço tudo sobre os serviços da NexLine na nossa região! Posso te ajudar com saúde, zeladoria urbana ou causa animal. O que acha de começarmos por um desses?",
  };
}

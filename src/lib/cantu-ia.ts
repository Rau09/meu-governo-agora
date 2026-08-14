import { MEDICAMENTOS, STATUS_OCORRENCIA, lerOcorrencias, statusMedicamento } from "@/lib/cantu-store";
import { normalizar } from "@/lib/libras";

/**
 * Inteligência Cantu Conecta.
 *
 * Especializada em triagem de saúde, causa animal e serviços urbanos regionais.
 * Focada na região da Cantuquiriguaçu, PR.
 */

export type Resposta = { texto: string; acao?: { rotulo: string; para: string } };

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
    chaves: ["consulta", "consultar", "medico", "clinico", "saude", "ubs", "posto", "dentista", "odonto", "exame", "pediatra"],
    resposta: {
      texto:
        "Consultas e exames ficam em Agendar > Saúde: você escolhe a UBS, o dia e o horário. Em caso de urgência, procure o Pronto Atendimento ou ligue 192.",
      acao: { rotulo: "Agendar consulta", para: "/agendamento" },
    },
  },
  {
    chaves: ["vacina", "vacinacao", "imunizacao"],
    resposta: {
      texto:
        "A vacinação é por ordem de chegada nas UBS, das 08h às 16h. Você também pode reservar horário pelo app.",
      acao: { rotulo: "Agendar vacinação", para: "/agendamento" },
    },
  },
  {
    chaves: ["iptu", "imposto", "boleto", "tributo", "segunda", "via", "alvara"],
    resposta: {
      texto:
        "Segunda via de IPTU, alvarás e protocolos ficam em Serviços > Cidadania e Tributos. Tenha em mãos o número do cadastro do imóvel.",
      acao: { rotulo: "Ver serviços", para: "/servicos" },
    },
  },
  {
    chaves: ["matricula", "escola", "creche", "transporte", "escolar", "cmei", "educacao", "historico"],
    resposta: {
      texto:
        "Matrícula, vaga em creche e transporte escolar estão em Serviços > Educação. Leve RG, CPF e comprovante de residência no dia do atendimento.",
      acao: { rotulo: "Ver serviços", para: "/servicos" },
    },
  },
  {
    chaves: ["horario", "funcionamento", "aberto", "atende", "expediente"],
    resposta: {
      texto: "O app funciona 24 horas por dia. O atendimento presencial no Paço Municipal é das 08h às 17h.",
    },
  },
  {
    chaves: ["cadastro", "acesso", "conta", "pin", "senha", "registrar", "cadastrar"],
    resposta: {
      texto:
        "Seu acesso é criado em Meu Cadastro, com CPF, telefone e um PIN de 6 dígitos. O PIN fica guardado só em forma de código protegido no próprio aparelho.",
      acao: { rotulo: "Meu cadastro", para: "/registro" },
    },
  },
  {
    chaves: ["agendamento", "agendar", "marcar", "remarcar", "cancelar", "horarios"],
    resposta: {
      texto:
        "Para marcar, cancelar ou ver seus horários, use a aba Agendar. Ali aparecem também os atendimentos já confirmados.",
      acao: { rotulo: "Ir para Agendar", para: "/agendamento" },
    },
  },
  {
    chaves: ["animal", "animais", "cachorro", "cao", "gato", "pet", "adocao", "maus", "tratos", "denuncia", "castracao", "vacinacao", "animal", "protecao"],
    resposta: {
      texto:
        "O Cantu Conecta apoia a Causa Animal! Na aba Animal você pode ver pets para adoção, registrar animais perdidos ou denunciar maus-tratos. Denúncias geram um protocolo para acompanhamento da prefeitura.",
      acao: { rotulo: "Causa Animal", para: "/causa-animal" },
    },
  },
];

const CHAVES_MEDICAMENTO = [
  "remedio", "remedios", "medicamento", "medicamentos", "farmacia", "estoque", "comprimido", "receita",
];

const CHAVES_PROBLEMA = [
  "buraco", "lixo", "entulho", "poste", "lampada", "luz", "iluminacao", "poda", "arvore", "vazamento",
  "esgoto", "rua", "via", "problema", "reclamar", "reclamacao", "denunciar", "comunicar", "asfalto",
  "animal", "maus-tratos", "cachorro", "gato", "pet",
];

const CHAVES_ANIMAL = ["animal", "animais", "cachorro", "cao", "gato", "pet", "adocao", "maus", "tratos", "denuncia", "castracao", "protecao"];

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
        texto: `Não encontrei o protocolo ${codigo} neste aparelho. Confira o número ou consulte a Central da Cantuquiriguaçu.`,
      };
    }
    const st = STATUS_OCORRENCIA.find((s) => s.id === o.status)!;
    return {
      texto: `Protocolo ${o.protocolo} — ${o.categoria}. Status: ${st.emoji} ${st.rotulo}. Aberto em ${new Date(
        o.criadoEm,
      ).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}.`,
    };
  }

  if (!tokens(pergunta).some((t) => CHAVES_PROTOCOLO.includes(t))) return null;

  if (ocorrencias.length === 0) {
    return {
      texto:
        "Não tenho nenhuma solicitação registrada neste aparelho ainda. Assim que você comunicar um problema, o protocolo aparece aqui.",
      acao: { rotulo: "Comunicar problema", para: "/ocorrencia" },
    };
  }

  const linhas = ocorrencias.slice(0, 3).map((o) => {
    const st = STATUS_OCORRENCIA.find((s) => s.id === o.status)!;
    return `${st.emoji} ${o.protocolo} — ${o.categoria}: ${st.rotulo}`;
  });

  return {
    texto: `Suas solicitações mais recentes:\n${linhas.join("\n")}`,
    acao: { rotulo: "Comunicar problema", para: "/ocorrencia" },
  };
}

export function responder(pergunta: string): Resposta {
  const t = tokens(pergunta);
  if (t.length === 0) {
    return { texto: "Pode escrever sua dúvida com um pouco mais de detalhe? Assim consigo te ajudar melhor." };
  }

  const protocolo = consultarProtocolo(pergunta);
  if (protocolo) return protocolo;

  if (t.some((x) => CHAVES_MEDICAMENTO.includes(x))) {
    const especifico = buscarMedicamento(pergunta);
    if (especifico) return especifico;
    return {
      texto:
        "Dá para consultar o estoque de medicamentos por unidade de saúde na tela Medicamentos. Se me disser o nome do remédio, eu verifico agora.",
      acao: { rotulo: "Ver medicamentos", para: "/medicamentos" },
    };
  }

  const medicamento = buscarMedicamento(pergunta);
  if (medicamento) return medicamento;

  if (t.some((x) => CHAVES_PROBLEMA.includes(x))) {
    return {
      texto:
        "Use Comunicar Problema: escolha o tipo (buraco, poste, árvore caída, lixo, via, vazamento ou outro), tire uma foto, ative o GPS e descreva. Você recebe um protocolo na hora.",
      acao: { rotulo: "Comunicar problema", para: "/ocorrencia" },
    };
  }

  if (t.some((x) => CHAVES_ANIMAL.includes(x))) {
    return {
      texto:
        "Para assuntos animais, você pode:\n1. Adotar um pet em Causa Animal.\n2. Denunciar maus-tratos em Comunicar Problema (selecione Causa Animal).\n3. Ver campanhas de castração e vacinação regional.",
      acao: { rotulo: "Causa Animal", para: "/causa-animal" },
    };
  }

  // Melhor regra por número de palavras coincidentes.
  let melhor: { regra: Regra; pontos: number } | null = null;
  for (const regra of REGRAS) {
    const pontos = t.filter((x) => regra.chaves.some((c) => x === c || (x.length > 4 && c.includes(x)))).length;
    if (pontos > 0 && (!melhor || pontos > melhor.pontos)) melhor = { regra, pontos };
  }
  if (melhor) return melhor.regra.resposta;

  return {
    texto:
      "Ainda estou aprendendo sobre este assunto. Posso te ajudar com agendamento de saúde, proteção animal, estoque de medicamentos e acompanhamento de protocolos na região Cantu.",
  };
}

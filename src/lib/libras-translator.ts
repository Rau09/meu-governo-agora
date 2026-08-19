
/**
 * Dicionário simplificado para mapeamento de texto para glosas de Libras.
 * Em um cenário real, isso seria integrado a uma API de tradução mais complexa.
 */
const dicionarioGlosas: Record<string, string> = {
  saúde: "SAUDE",
  agendamento: "AGENDAR",
  consulta: "CONSULTA",
  animal: "ANIMAL",
  cachorro: "CACHORRO",
  gato: "GATO",
  prefeitura: "GOVERNO-MUNICIPAL",
  atendimento: "ATENDER",
  ajuda: "AJUDA",
  protocolo: "NUMERO-REGISTRO",
  remédio: "MEDICAMENTO",
  disponível: "TER",
  inexistente: "NAO-TER",
  urgência: "EMERGENCIA",
  "bem-vindo": "OI-TUDO-BEM",
};

/**
 * Tradutor de texto simples para sequências de glosas.
 */
export function traduzirParaLibras(texto: string): string[] {
  // Mapeamento de frases comuns para glosas específicas
  const frasesProntas: Record<string, string[]> = {
    "escolha a área do serviço: saúde, animal ou serviços urbanos.": ["ESCOLHER", "AREA", "SERVIÇO", "SAUDE", "ANIMAL", "CIDADE"],
    "como posso ajudar você hoje? selecione uma opção acima para começarmos.": ["OI", "AJUDA", "VOCE", "ESCOLHER", "OPÇÃO"],
  };

  const textoLimpo = texto.toLowerCase().trim();
  if (frasesProntas[textoLimpo]) return frasesProntas[textoLimpo];

  const palavras = textoLimpo.replace(/[.,!?;:]/g, "").split(/\s+/);
  const glosas: string[] = [];

  palavras.forEach((palavra) => {
    // Tenta encontrar a palavra no dicionário
    if (dicionarioGlosas[palavra]) {
      glosas.push(dicionarioGlosas[palavra]);
    } else if (palavra.length > 3) {
      // Para palavras longas não mapeadas, tenta encontrar substrings ou simplifica
      const radical = palavra.substring(0, 4);
      const keys = Object.keys(dicionarioGlosas);
      const match = keys.find(k => k.startsWith(radical));
      if (match) {
        glosas.push(dicionarioGlosas[match]);
      } else {


        // Soletra as 3 primeiras letras se for desconhecida
        palavra.substring(0, 3).split("").forEach(l => glosas.push(l.toUpperCase()));
      }
    }
  });

  return glosas.length > 0 ? glosas : ["SINAL"];
}


/**
 * Hook para gerenciar o estado global de tradução de Libras.
 */
import { create } from "zustand";

interface LibrasState {
  ativo: boolean;
  mensagem: string | null;
  glosas: string[];
  velocidade: number;
  reproduzindo: boolean;
  toggleAtivo: () => void;
  setMensagem: (msg: string | null) => void;
  setVelocidade: (v: number) => void;
  setReproduzindo: (r: boolean) => void;
}

export const useLibras = create<LibrasState>((set) => ({
  ativo: false,
  mensagem: null,
  glosas: [],
  velocidade: 1.0,
  reproduzindo: false,
  toggleAtivo: () => set((state) => ({ ativo: !state.ativo, mensagem: null, glosas: [] })),
  setMensagem: (msg) => set({ mensagem: msg, glosas: msg ? traduzirParaLibras(msg) : [], reproduzindo: !!msg }),
  setVelocidade: (v) => set({ velocidade: v }),
  setReproduzindo: (r) => set({ reproduzindo: r }),
}));

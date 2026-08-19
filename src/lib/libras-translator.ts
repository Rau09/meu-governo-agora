
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
  const palavras = texto.toLowerCase().replace(/[.,!?;:]/g, "").split(/\s+/);
  const glosas: string[] = [];

  palavras.forEach((palavra) => {
    if (dicionarioGlosas[palavra]) {
      glosas.push(dicionarioGlosas[palavra]);
    } else if (palavra.length > 0) {
      // Caso não encontre a palavra, soletra (Datilologia simplificada)
      palavra.split("").forEach((letra) => {
        glosas.push(letra.toUpperCase());
      });
    }
  });

  return glosas;
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

import { create } from "zustand";

export interface Sinal {
  bracos: {
    esquerdo: { ombro: number; cotovelo: number; mao: string };
    direito: { ombro: number; cotovelo: number; mao: string };
  };
  duracao: number;
}

const DICIONARIO: Record<string, Sinal[]> = {
  "ola": [
    { bracos: { esquerdo: { ombro: 0, cotovelo: 0, mao: "aberta" }, direito: { ombro: 45, cotovelo: 90, mao: "aberta" } }, duracao: 300 },
    { bracos: { esquerdo: { ombro: 0, cotovelo: 0, mao: "aberta" }, direito: { ombro: 45, cotovelo: 110, mao: "aberta" } }, duracao: 300 },
  ],
  "tudo-bem": [
    { bracos: { esquerdo: { ombro: 0, cotovelo: 0, mao: "fechada" }, direito: { ombro: 90, cotovelo: 0, mao: "joia" } }, duracao: 500 },
  ],
  "obrigado": [
    { bracos: { esquerdo: { ombro: 0, cotovelo: 0, mao: "aberta" }, direito: { ombro: 10, cotovelo: 140, mao: "aberta" } }, duracao: 400 },
    { bracos: { esquerdo: { ombro: 0, cotovelo: 0, mao: "aberta" }, direito: { ombro: 10, cotovelo: 90, mao: "aberta" } }, duracao: 400 },
  ],
  "saude": [
    { bracos: { esquerdo: { ombro: 45, cotovelo: 45, mao: "aberta" }, direito: { ombro: 45, cotovelo: 45, mao: "aberta" } }, duracao: 500 },
  ],
};

const ALFABETO: Record<string, Sinal> = {
  a: { bracos: { esquerdo: { ombro: 0, cotovelo: 0, mao: "aberta" }, direito: { ombro: 20, cotovelo: 40, mao: "fechada" } }, duracao: 200 },
  // ... outras letras seriam adicionadas aqui
};

interface LibrasState {
  traduzindo: boolean;
  textoAtual: string;
  sinalAtual: Sinal | null;
  velocidade: number;
  pausado: boolean;
  progresso: number;
  traduzir: (texto: string) => Promise<void>;
  setVelocidade: (v: number) => void;
  setPausado: (p: boolean) => void;
  cancelar: () => void;
}

export const useLibras = create<LibrasState>((set, get) => ({
  traduzindo: false,
  textoAtual: "",
  sinalAtual: null,
  velocidade: 1,
  pausado: false,
  progresso: 0,

  setVelocidade: (velocidade) => set({ velocidade }),
  setPausado: (pausado) => set({ pausado }),
  cancelar: () => set({ traduzindo: false, textoAtual: "", sinalAtual: null, progresso: 0 }),

  traduzir: async (texto) => {
    const palavras = texto.toLowerCase().split(/\s+/);
    set({ traduzindo: true, textoAtual: texto, progresso: 0, pausado: false });

    for (const palavra of palavras) {
      if (!get().traduzindo) break;
      
      const sinais = DICIONARIO[palavra] || palavra.split("").map(l => ALFABETO[l] || ALFABETO["a"]);
      
      for (const sinal of sinais) {
        while (get().pausado) {
          await new Promise(r => setTimeout(r, 100));
          if (!get().traduzindo) return;
        }

        set({ sinalAtual: sinal });
        await new Promise(r => setTimeout(r, sinal.duracao / get().velocidade));
      }
    }

    set({ traduzindo: false, sinalAtual: null });
  }
}));

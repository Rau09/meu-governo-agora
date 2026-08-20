import { create } from "zustand";

interface LibrasState {
  isAvatarOpen: boolean;
  isTranslating: boolean;
  currentText: string;
  playbackSpeed: number;
  setAvatarOpen: (open: boolean) => void;
  translate: (text: string) => void;
  setSpeed: (speed: number) => void;
}

export const useLibras = create<LibrasState>((set) => ({
  isAvatarOpen: false,
  isTranslating: false,
  currentText: "",
  playbackSpeed: 1.0,
  setAvatarOpen: (open) => set({ isAvatarOpen: open }),
  translate: (text) => {
    set({ isTranslating: true, currentText: text, isAvatarOpen: true });
    // Simulando tempo de tradução/sinalização
    setTimeout(() => set({ isTranslating: false }), text.length * 200);
  },
  setSpeed: (speed) => set({ playbackSpeed: speed }),
}));

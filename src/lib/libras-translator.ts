import { create } from 'zustand';

interface LibrasState {
  isInterpreterVisible: boolean;
  currentText: string;
  isPaused: boolean;
  playbackSpeed: number;
  currentGloss: string;
  toggleInterpreter: () => void;
  setText: (text: string) => void;
  setPaused: (paused: boolean) => void;
  setSpeed: (speed: number) => void;
  setGloss: (gloss: string) => void;
}

export const useLibras = create<LibrasState>((set) => ({
  isInterpreterVisible: false,
  currentText: "",
  isPaused: false,
  playbackSpeed: 1.0,
  currentGloss: "",
  toggleInterpreter: () => set((state) => ({ isInterpreterVisible: !state.isInterpreterVisible })),
  setText: (text) => set({ currentText: text }),
  setPaused: (paused) => set({ isPaused: paused }),
  setSpeed: (speed) => set({ playbackSpeed: speed }),
  setGloss: (gloss) => set({ currentGloss: gloss }),
}));

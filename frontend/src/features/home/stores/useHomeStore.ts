import { create } from "zustand";

type HomeStore = {
  activeSegment: string;
  setActiveSegment: (s: HomeStore["activeSegment"]) => void;
};

export const useHomeStore = create<HomeStore>((set) => ({
  activeSegment: "Inbox",
  setActiveSegment: (s) => set({ activeSegment: s }),
}));

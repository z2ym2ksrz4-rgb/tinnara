import { create } from "zustand";

export type SheetMode = "quick" | "live" | "journey" | "full";
export type InfoSheet = "redFlags" | "widget" | "plan" | "pressure" | "loudness" | null;

/** Cross-screen UI state: which spike sheet is open (and in which mode), info sheets, and a bump counter so screens reload after writes. */
type Ui = {
  episodeSheetId: string | null;
  episodeSheetMode: SheetMode;
  medsOpen: boolean;
  infoSheet: InfoSheet;
  version: number;
  openEpisode: (id: string, mode?: SheetMode) => void;
  closeEpisode: () => void;
  setMode: (mode: SheetMode) => void;
  setMedsOpen: (v: boolean) => void;
  openInfo: (which: InfoSheet) => void;
  bump: () => void;
};
export const useUi = create<Ui>((set) => ({
  episodeSheetId: null,
  episodeSheetMode: "full",
  medsOpen: false,
  infoSheet: null,
  version: 0,
  openEpisode: (id, mode = "full") => set({ episodeSheetId: id, episodeSheetMode: mode }),
  closeEpisode: () => set({ episodeSheetId: null }),
  setMode: (episodeSheetMode) => set({ episodeSheetMode }),
  setMedsOpen: (medsOpen) => set({ medsOpen }),
  openInfo: (infoSheet) => set({ infoSheet }),
  bump: () => set((s) => ({ version: s.version + 1 })),
}));

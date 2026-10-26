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
export declare const useUi: import("zustand").UseBoundStore<import("zustand").StoreApi<Ui>>;
export {};

import type { TFunction } from "i18next";
import type { Contrast, Patterns } from "@/core/diary";
type Freq = {
    groupKey: string;
    labelKey: string | null;
    label: string | null;
    n: number;
    total: number;
}[];
/**
 * "What it looks like" in plain sentences. Phrased as observations about the user's own log ("on days after…
 * your tinnitus averaged…"), never as a cause, a diagnosis or advice. Shown on Insights and in the PDF.
 */
export declare function learningSentences(d: {
    trend30: {
        now: number | null;
        before: number | null;
        nNow: number;
    };
    contrasts: Contrast[];
    pat: Patterns | null;
    freq: Freq;
}, t: TFunction, lang: string): string[];
export {};

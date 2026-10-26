import { jsPDF } from "jspdf";
import type { TFunction } from "i18next";
export type WeekRow = {
    from: string;
    loud: number | null;
    distress: number | null;
    sleep: number | null;
    stress: number | null;
    noise: number | null;
    days: number;
    spikes: number;
};
/**
 * The ENT/GP report: who (profile line), the period at a glance (average loudness and distress, hard days, spikes),
 * loudness per week as a chart and a table, plain-word observations, the user's own notes, one row per spike,
 * then shares of sounds, triggers, symptoms and what helped. Plain facts only – no scores, no interpretation.
 */
export declare function buildReport(fromIso: string, toIso: string, t: TFunction, lang: string, opts: {
    name?: string | null;
    profile?: string | null;
    notes?: string | null;
    weeks: WeekRow[];
    day: {
        loud: number | null;
        distress: number | null;
        logged: number;
        hard: number;
    };
    learning?: string[];
    pressure?: Map<string, {
        p: number;
        delta: number | null;
    }>;
}): Promise<jsPDF>;
export declare function sharePdf(doc: jsPDF, filename: string, title: string): Promise<void>;

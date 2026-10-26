import type { DiaryConfig } from "@/core/diary";
/**
 * Tinnitus is always there, so the daily check-in carries the main number (loudness 0–10, 0 = not noticeable).
 * Episodes are "spikes": a period where it is clearly louder or more intrusive than usual.
 * No medication-day thresholds (that is a migraine concept); medication/aids are logged, never counted against a limit.
 */
export declare const tinnaraConfig: DiaryConfig;
/** Fields shown as small 1–5 scales under the loudness picker (loudness itself has its own big control). */
export declare const sideFields: readonly ["distress", "sleep", "stress", "noise"];
/** Loudness → the engine's day status (drives the calendar tint and the "hard day" count). */
export declare const statusFor: (loudness: number) => "none" | "mild" | "attack";
/** Which contrasts the insights look for: sleep/stress/distress same day, noise exposure the day before. */
export declare const contrastFields: ({
    key: string;
    lag: 0;
} | {
    key: string;
    lag: 1;
})[];

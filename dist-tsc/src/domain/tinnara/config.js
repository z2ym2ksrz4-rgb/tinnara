import { tinnitusTagGroups } from "./tagsets";
/**
 * Tinnitus is always there, so the daily check-in carries the main number (loudness 0–10, 0 = not noticeable).
 * Episodes are "spikes": a period where it is clearly louder or more intrusive than usual.
 * No medication-day thresholds (that is a migraine concept); medication/aids are logged, never counted against a limit.
 */
export const tinnaraConfig = {
    slug: "tinnara",
    episodeKind: "spike",
    tagGroups: tinnitusTagGroups,
    checkinFields: [
        { key: "loudness", kind: "scale", min: 0, max: 10 },
        { key: "distress", kind: "scale", max: 5 },
        { key: "sleep", kind: "scale", max: 5 },
        { key: "stress", kind: "scale", max: 5 },
        { key: "noise", kind: "scale", max: 5 },
    ],
    medicationDayThresholds: [],
    freeHistoryDays: 90,
};
/** Fields shown as small 1–5 scales under the loudness picker (loudness itself has its own big control). */
export const sideFields = ["distress", "sleep", "stress", "noise"];
/** Loudness → the engine's day status (drives the calendar tint and the "hard day" count). */
export const statusFor = (loudness) => (loudness <= 3 ? "none" : loudness <= 6 ? "mild" : "attack");
/** Which contrasts the insights look for: sleep/stress/distress same day, noise exposure the day before. */
export const contrastFields = [
    { key: "sleep", lag: 0 },
    { key: "stress", lag: 0 },
    { key: "noise", lag: 1 },
];

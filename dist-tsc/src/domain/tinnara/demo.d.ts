/**
 * Demo data for screenshots and smoke tests (dev builds only; wired to window.__seedDemo in main.tsx).
 * Deterministic: same days every run so screenshots are reproducible. 100 days of check-ins where bad nights,
 * stress and loud days the day before nudge loudness up, plus ~12 spikes.
 */
export declare function seedDemo(): Promise<void>;

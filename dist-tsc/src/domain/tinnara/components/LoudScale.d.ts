/**
 * The day's loudness, 0–10. Eleven tappable cells with a warm ramp, the chosen value shown big with a word.
 * 0 = not noticeable, 10 = as loud as it ever gets. Words come from loud.level.<0-10 bucket>.
 */
export declare const loudWord: (v: number) => "silent" | "low" | "noticeable" | "loud" | "veryLoud";
export declare function LoudScale({ value, onChange }: {
    value: number | null;
    onChange: (v: number) => void;
}): import("react").JSX.Element;

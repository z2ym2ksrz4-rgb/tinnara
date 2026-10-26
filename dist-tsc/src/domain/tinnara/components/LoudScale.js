import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from "react-i18next";
import { haptics } from "@/core/ui";
/**
 * The day's loudness, 0–10. Eleven tappable cells with a warm ramp, the chosen value shown big with a word.
 * 0 = not noticeable, 10 = as loud as it ever gets. Words come from loud.level.<0-10 bucket>.
 */
export const loudWord = (v) => (v === 0 ? "silent" : v <= 3 ? "low" : v <= 6 ? "noticeable" : v <= 8 ? "loud" : "veryLoud");
export function LoudScale({ value, onChange }) {
    const { t } = useTranslation();
    return (_jsxs("div", { className: "loud", children: [_jsxs("div", { className: "loud-head", children: [_jsx("span", { className: "loud-n", children: value ?? "–" }), _jsx("span", { className: "loud-w", children: value == null ? t("loud.pick") : t(`loud.level.${loudWord(value)}`) })] }), _jsx("div", { className: "loud-scale", role: "radiogroup", "aria-label": t("loud.question"), children: Array.from({ length: 11 }, (_, v) => (_jsx("button", { type: "button", role: "radio", "aria-checked": value === v, className: `l${v} ${value === v ? "on" : ""}`, onClick: () => { haptics.tap(); onChange(v); }, children: v }, v))) }), _jsxs("div", { className: "row between small muted", children: [_jsx("span", { children: t("loud.min") }), _jsx("span", { children: t("loud.max") })] })] }));
}

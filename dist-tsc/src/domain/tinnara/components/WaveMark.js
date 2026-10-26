import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * The tone mark from the app icon: a dot (the ear canal) and a high-pitched wave growing out of it.
 * Used on the "Louder now" button and the widget preview.
 */
const pts = Array.from({ length: 61 }, (_, i) => {
    const x = 22 + i * 1.25, amp = 2 + i * 0.32;
    return `${x.toFixed(1)},${(50 + amp * Math.sin(i / 2.2)).toFixed(1)}`;
}).join(" ");
export function WaveMark({ size = 48, color = "currentColor", core = "var(--accent)" }) {
    return (_jsxs("svg", { width: size, height: size, viewBox: "0 0 100 100", "aria-hidden": "true", fill: "none", children: [_jsx("circle", { cx: "16", cy: "50", r: "9", fill: core }), _jsx("polyline", { points: pts, stroke: color, strokeWidth: "6.5", strokeLinecap: "round", strokeLinejoin: "round" })] }));
}

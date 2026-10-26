import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** The sound-wave mark from the app icon: a dot with three arcs. Used on the "louder now" button and the widget preview. */
export function WaveMark({ size = 48, color = "currentColor", core = "var(--accent)" }) {
    return (_jsxs("svg", { width: size, height: size, viewBox: "0 0 100 100", "aria-hidden": "true", fill: "none", children: [_jsx("circle", { cx: "26", cy: "50", r: "10", fill: core }), _jsx("path", { d: "M44 32 a26 26 0 0 1 0 36", stroke: color, strokeWidth: "7", strokeLinecap: "round" }), _jsx("path", { d: "M58 21 a40 40 0 0 1 0 58", stroke: color, strokeWidth: "7", strokeLinecap: "round", opacity: ".8" }), _jsx("path", { d: "M72 11 a54 54 0 0 1 0 78", stroke: color, strokeWidth: "7", strokeLinecap: "round", opacity: ".55" })] }));
}

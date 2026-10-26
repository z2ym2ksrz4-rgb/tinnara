import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { listEpisodes, listCheckins, diaryConfig } from "@/core/diary";
import { fmtTime, localDay, hours } from "@/core/ui";
import { useProGate } from "@/core/purchases";
import { useUi } from "../store";
import { sideFields } from "../config";
import { loudWord } from "../components/LoudScale";
/** Month heatmap: colour = the day's loudness (0–10 → 4 steps); a dot marks days with a spike. */
export function Calendar() {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;
    const version = useUi((s) => s.version);
    const openSheet = useUi((s) => s.openEpisode);
    const gate = useProGate();
    const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
    const [eps, setEps] = useState([]);
    const [checkins, setCheckins] = useState([]);
    const [sel, setSel] = useState(null);
    const cursorKey = cursor.getTime();
    const { first, last } = useMemo(() => ({ first: new Date(cursorKey), last: new Date(new Date(cursorKey).getFullYear(), new Date(cursorKey).getMonth() + 1, 0) }), [cursorKey]);
    const load = useCallback(async () => {
        const from = new Date(first.getFullYear(), first.getMonth(), 1 - 7).toISOString();
        const to = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1).toISOString();
        setEps(await listEpisodes(from, to));
        setCheckins(await listCheckins(localDay(first), localDay(last)));
    }, [first, last]);
    useEffect(() => { void load(); }, [load, version]);
    const byDay = useMemo(() => {
        const m = new Map();
        const get = (k) => m.get(k) ?? { loud: null, extra: {}, eps: [] };
        for (const e of eps) {
            const start = new Date(e.startedAt), end = new Date(e.endedAt ?? new Date().toISOString());
            for (let d = new Date(start.getFullYear(), start.getMonth(), start.getDate()); d <= end; d.setDate(d.getDate() + 1)) {
                const k = localDay(d);
                const cur = get(k);
                if (!cur.eps.includes(e))
                    cur.eps.push(e);
                m.set(k, cur);
            }
        }
        for (const c of checkins) {
            const cur = get(c.date);
            let ex = {};
            try {
                ex = c.extra ? JSON.parse(c.extra) : {};
            }
            catch { /* ignore */ }
            cur.extra = ex;
            cur.loud = typeof ex.loudness === "number" ? ex.loudness : null;
            m.set(c.date, cur);
        }
        return m;
    }, [eps, checkins]);
    const freeFloor = new Date();
    freeFloor.setDate(freeFloor.getDate() - diaryConfig().freeHistoryDays);
    const monthLocked = !gate.isPro && last < freeFloor;
    const go = (delta) => {
        const next = new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1);
        const nextLast = new Date(next.getFullYear(), next.getMonth() + 1, 0);
        if (!gate.isPro && nextLast < freeFloor && !gate.allow("history"))
            return;
        setCursor(next);
        setSel(null);
    };
    const dow = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, i + 1).toLocaleDateString(lang, { weekday: "short" }).slice(0, 2)); // Mon-first
    const lead = (first.getDay() + 6) % 7;
    const today = localDay();
    const cls = (k) => {
        const d = byDay.get(k);
        if (!d)
            return "";
        const heat = d.loud == null ? "" : d.loud <= 2 ? "h1" : d.loud <= 5 ? "h2" : d.loud <= 7 ? "h3" : "h4";
        return `${heat} ${d.eps.length ? "spike" : ""}`;
    };
    const selData = sel ? byDay.get(sel) : undefined;
    return (_jsxs("section", { className: "screen", children: [_jsxs("div", { className: "cal-head", children: [_jsx("button", { onClick: () => go(-1), "aria-label": "prev", children: "\u2039" }), _jsx("h1", { children: cursor.toLocaleDateString(lang, { month: "long", year: "numeric" }) }), _jsx("button", { onClick: () => go(1), "aria-label": "next", children: "\u203A" })] }), _jsxs("div", { className: "cal", children: [dow.map((d, i) => _jsx("div", { className: "dow", children: d }, i)), Array.from({ length: lead }, (_, i) => _jsx("div", { className: "day blank" }, `b${i}`)), Array.from({ length: last.getDate() }, (_, i) => {
                        const k = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
                        return (_jsx("button", { className: `day ${cls(k)} ${k === today ? "today" : ""} ${sel === k ? "sel" : ""} ${monthLocked ? "locked" : ""}`, onClick: () => { if (monthLocked && !gate.allow("history"))
                                return; setSel(sel === k ? null : k); }, children: i + 1 }, k));
                    })] }), _jsxs("div", { className: "legend", children: [_jsxs("span", { children: [_jsx("i", { style: { background: "var(--heat-1)" } }), "0\u20132"] }), _jsxs("span", { children: [_jsx("i", { style: { background: "var(--heat-2)" } }), "3\u20135"] }), _jsxs("span", { children: [_jsx("i", { style: { background: "var(--heat-3)" } }), "6\u20137"] }), _jsxs("span", { children: [_jsx("i", { style: { background: "var(--heat-4)" } }), "8\u201310"] }), _jsxs("span", { children: [_jsx("i", { className: "dot" }), t("calendar.spike")] })] }), sel && (_jsxs(_Fragment, { children: [_jsx("h2", { children: new Date(sel + "T12:00:00").toLocaleDateString(lang, { weekday: "long", day: "numeric", month: "long" }) }), selData?.loud != null ? (_jsxs("div", { className: "card col", children: [_jsx("strong", { children: t("calendar.loudness", { n: selData.loud, word: t(`loud.level.${loudWord(selData.loud)}`).toLowerCase() }) }), _jsxs("span", { className: "muted small", children: [sideFields.filter((k) => typeof selData.extra[k] === "number").map((k) => `${t(`home.fields.${k}`)} ${selData.extra[k]}`).join(" · "), selData.extra.period ? ` · ${t("home.periodShort")}` : ""] })] })) : _jsx("p", { className: "muted small", children: t("calendar.noCheckin") }), selData?.eps.length ? (_jsx("ul", { className: "list", children: selData.eps.map((e) => (_jsxs("li", { className: "tap", onClick: () => openSheet(e.id), children: [_jsxs("div", { children: [_jsxs("strong", { children: [t("episode.title"), " \u00B7 ", fmtTime(e.startedAt, lang), e.endedAt ? ` – ${fmtTime(e.endedAt, lang)}` : ""] }), _jsxs("small", { children: [e.endedAt ? t("episode.duration", { h: hours(e.startedAt, e.endedAt).toFixed(1) }) : t("home.ongoing"), e.intensity != null ? ` · ${e.intensity}/10` : ""] })] }), _jsx("span", { className: "muted", children: "\u203A" })] }, e.id))) })) : null] }))] }));
}

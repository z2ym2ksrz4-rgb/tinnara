import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { episodeSummary, tagFrequency, monthRange, patterns as loadPatterns, checkinSeries, checkinMonthly, checkinContrast, checkinTrend, } from "@/core/diary";
import { localDay } from "@/core/ui";
import { useProGate } from "@/core/purchases";
import { useUi } from "../store";
import { ReportSheet } from "./Report";
import { learningSentences } from "../learning";
import { Spark } from "../components/Spark";
import { contrastFields } from "../config";
const avgOf = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
/** Descriptive statistics only: averages, counts and shares of what the user logged. No scoring, no classification, no advice. */
export function Insights() {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;
    const gate = useProGate();
    const version = useUi((s) => s.version);
    const openInfo = useUi((s) => s.openInfo);
    const [range, setRange] = useState("3m");
    const [reportOpen, setReportOpen] = useState(false);
    const [daily, setDaily] = useState([]);
    const [monthly, setMonthly] = useState([]);
    const [sum, setSum] = useState(null);
    const [day, setDay] = useState({ loud: null, distress: null, logged: 0, hard: 0 });
    const [freq, setFreq] = useState([]);
    const [pat, setPat] = useState(null);
    const [contrasts, setContrasts] = useState([]);
    const [trend30, setTrend30] = useState({ now: null, before: null, nNow: 0 });
    const load = useCallback(async () => {
        if (!gate.isPro)
            return;
        const now = new Date();
        const months = range === "month" ? 1 : range === "3m" ? 3 : 12;
        const from = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
        const fromIso = from.toISOString(), toIso = monthRange(now).toIso;
        const d90 = new Date();
        d90.setDate(d90.getDate() - 89);
        setDaily(await checkinSeries("loudness", localDay(d90), localDay()));
        setMonthly(await checkinMonthly("loudness", 12));
        setSum(await episodeSummary(fromIso, toIso));
        const loud = await checkinSeries("loudness", localDay(from), localDay());
        const dis = await checkinSeries("distress", localDay(from), localDay());
        setDay({ loud: avgOf(loud.map((x) => x.v)), distress: avgOf(dis.map((x) => x.v)), logged: loud.length, hard: loud.filter((x) => x.v >= 7).length });
        setFreq(await tagFrequency(fromIso, toIso));
        setPat(await loadPatterns());
        setContrasts(await checkinContrast("loudness", contrastFields));
        setTrend30(await checkinTrend("loudness", 30));
    }, [gate.isPro, range]);
    useEffect(() => { void load(); }, [load, version]);
    if (!gate.isPro) {
        return (_jsxs("section", { className: "screen", children: [_jsx("h1", { children: t("insights.title") }), _jsxs("div", { className: "card col", children: [_jsx("strong", { children: t("insights.lockedTitle") }), _jsx("p", { className: "muted", children: t("insights.lockedBody") }), _jsx("button", { onClick: () => gate.allow("insights"), children: t("plan.upgrade") })] })] }));
    }
    const f1 = (n) => (n == null ? "–" : n.toLocaleString(lang, { maximumFractionDigits: 1 }));
    const Freq = ({ group }) => {
        const rows = freq.filter((f) => f.groupKey === group).slice(0, 5);
        if (!rows.length)
            return _jsx("p", { className: "muted small", children: t("insights.noData") });
        return (_jsx("div", { className: "freq", children: rows.map((f) => {
                const pct = f.total ? Math.round((f.n / f.total) * 100) : 0;
                return (_jsxs("div", { className: "f", children: [_jsx("span", { children: f.labelKey ? t(f.labelKey) : f.label }), _jsxs("span", { className: "muted", children: [pct, "%"] }), _jsx("div", { className: "track", children: _jsx("div", { className: "fill", style: { width: `${pct}%` } }) })] }, f.tagId));
            }) }));
    };
    const lines = learningSentences({ trend30, contrasts, pat, freq }, t, lang);
    const shown = contrasts.filter((c) => Math.abs(c.hi - c.lo) >= 0.7);
    return (_jsxs("section", { className: "screen", children: [_jsx("h1", { children: t("insights.title") }), _jsxs("button", { className: "cta report-btn", style: { marginTop: 4 }, onClick: () => setReportOpen(true), children: ["\uD83D\uDCC4 ", t("report.cta")] }), _jsx("h2", { children: t("insights.loud90") }), daily.length >= 2 ? _jsx("div", { className: "card spark-card", children: _jsx(Spark, { data: daily, days: 90, height: 140, lang: lang }) }) : _jsx("p", { className: "muted small", children: t("insights.noData") }), _jsx("p", { className: "muted small", children: t("insights.loud90Hint") }), _jsx("h2", { children: t("insights.monthly") }), _jsx("div", { className: "bars", children: monthly.map((m, i) => _jsx("div", { className: `bar ${i === monthly.length - 1 ? "cur" : ""} ${m.avg == null ? "none" : ""}`, style: { height: `${((m.avg ?? 0) / 10) * 100}%` }, title: `${m.month}: ${f1(m.avg)}` }, m.month)) }), _jsx("div", { className: "barlbl", children: monthly.map((m) => _jsx("span", { children: new Date(m.month + "-01T12:00:00").toLocaleDateString(lang, { month: "narrow" }) }, m.month)) }), _jsx("div", { className: "segment", style: { margin: "16px 0 8px" }, children: ["month", "3m", "12m"].map((r) => _jsx("button", { className: range === r ? "active" : "", onClick: () => setRange(r), children: t(`insights.range.${r}`) }, r)) }), _jsxs("div", { className: "stats", children: [_jsxs("div", { className: "stat", children: [_jsx("div", { className: "n", children: f1(day.loud) }), _jsx("div", { className: "l", children: t("insights.avgLoud") })] }), _jsxs("div", { className: "stat", children: [_jsx("div", { className: "n", children: f1(day.distress) }), _jsx("div", { className: "l", children: t("insights.avgDistress") })] }), _jsxs("div", { className: "stat", children: [_jsx("div", { className: "n", children: day.hard }), _jsx("div", { className: "l", children: t("insights.hardDays", { n: day.logged }) })] }), _jsxs("div", { className: "stat", children: [_jsx("div", { className: "n", children: sum?.episodes ?? 0 }), _jsx("div", { className: "l", children: t("insights.spikes") })] }), sum?.avgHours != null && _jsxs("div", { className: "stat", style: { gridColumn: "1 / -1" }, children: [_jsx("div", { className: "n", children: f1(sum.avgHours) }), _jsx("div", { className: "l", children: t("insights.avgSpikeHours") })] })] }), _jsx("h2", { children: t("insights.learnTitle") }), lines.length
                ? _jsxs("div", { className: "card col learn", children: [lines.map((l, i) => _jsx("p", { children: l }, i)), _jsx("span", { className: "muted small", children: t("insights.learnNote") })] })
                : _jsx("p", { className: "muted small", children: t("insights.learnEmpty") }), _jsx("h2", { children: t("insights.patterns") }), shown.length || pat?.weekday || pat?.timeOfDay || pat?.pressure || pat?.period ? (_jsxs("div", { className: "stack", children: [shown.map((c) => (_jsxs("div", { className: "card col", children: [_jsx("strong", { children: t(`insights.contrast.${c.key}`, { hi: f1(c.hi), lo: f1(c.lo) }) }), _jsx("span", { className: "muted small", children: t("insights.contrastBasis", { hi: c.nHi, lo: c.nLo }) })] }, c.key))), pat?.weekday && _jsxs("div", { className: "card col", children: [_jsx("strong", { children: t("insights.patWeekday", { day: new Date(2024, 0, 7 + pat.weekday.day).toLocaleDateString(lang, { weekday: "long" }), pct: Math.round(pat.weekday.share * 100) }) }), _jsx("span", { className: "muted small", children: t("insights.patBasis", { n: pat.attacks }) })] }), pat?.timeOfDay && _jsxs("div", { className: "card col", children: [_jsx("strong", { children: t("insights.patTime", { part: t(`insights.part.${pat.timeOfDay.part}`), pct: Math.round(pat.timeOfDay.share * 100) }) }), _jsx("span", { className: "muted small", children: t("insights.patBasis", { n: pat.attacks }) })] }), pat?.pressure && _jsxs("div", { className: "card col", children: [_jsx("strong", { children: t("insights.patPressure", { pct: Math.round((pat.pressure.attacksOnDrop / pat.pressure.attacks) * 100), all: Math.round(pat.pressure.dropShareAll * 100), hpa: pat.pressure.threshold }) }), _jsxs("span", { className: "muted small", children: [t("insights.patBasis", { n: pat.pressure.attacks }), " \u00B7 ", _jsx("button", { type: "button", className: "linklike small", onClick: () => openInfo("pressure"), children: t("weather.whatIsIt") })] })] }), pat?.period && _jsxs("div", { className: "card col", children: [_jsx("strong", { children: t("insights.patPeriod", { pct: Math.round(pat.period.share * 100) }) }), _jsx("span", { className: "muted small", children: t("insights.patBasis", { n: pat.attacks }) })] }), _jsx("p", { className: "muted small", children: t("insights.patNote") })] })) : _jsx("p", { className: "muted small", children: t("insights.patNeed") }), _jsxs("h2", { children: [t("diary.groups.sound"), " ", _jsxs("span", { className: "muted", style: { textTransform: "none", letterSpacing: 0 }, children: ["\u00B7 ", t("insights.shareOfSpikes")] })] }), _jsx(Freq, { group: "sound" }), _jsx("h2", { children: t("diary.groups.trigger") }), _jsx(Freq, { group: "trigger" }), _jsx("h2", { children: t("diary.groups.symptom") }), _jsx(Freq, { group: "symptom" }), _jsx("h2", { children: t("diary.groups.relief") }), _jsx(Freq, { group: "relief" }), _jsx("p", { className: "disclaimer", children: t("insights.disclaimer") }), _jsx(ReportSheet, { open: reportOpen, onClose: () => setReportOpen(false) })] }));
}

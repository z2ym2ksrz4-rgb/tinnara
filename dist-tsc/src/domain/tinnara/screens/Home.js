import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { openEpisode, startEpisode, listEpisodes, monthRange, getCheckin, setCheckin, checkinSeries, checkinTrend, pressureToday, } from "@/core/diary";
import { haptics, fmtDateTime, fmtTime, localDay, hours } from "@/core/ui";
import { useSettings } from "@/core/settings";
import { usePurchases } from "@/core/purchases";
import { useUi } from "../store";
import { WaveMark } from "../components/WaveMark";
import { LoudScale, loudWord } from "../components/LoudScale";
import { Spark } from "../components/Spark";
import { publishWidget } from "../widget";
import { maybeRefreshWeather } from "../weather";
import { applyOnboardingWishes } from "../wishes";
import { sideFields, statusFor } from "../config";
/**
 * Home: the day's loudness is the hero (tinnitus is always there – the daily number is the diary),
 * then "Louder now" for spikes, the 7-day picture and recent spikes.
 */
export function Home() {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;
    const version = useUi((s) => s.version);
    const openSheet = useUi((s) => s.openEpisode);
    const openInfo = useUi((s) => s.openInfo);
    const bump = useUi((s) => s.bump);
    const isPro = usePurchases((s) => s.isPro);
    const userName = useSettings((s) => s.userName);
    const cycleTracking = useSettings((s) => s.cycleTracking);
    const weatherEnabled = useSettings((s) => s.weatherEnabled);
    const weatherPlace = useSettings((s) => s.weatherPlace);
    const [pressure, setPressure] = useState(null);
    const [open, setOpen] = useState(null);
    const [recent, setRecent] = useState([]);
    const [spikesMonth, setSpikesMonth] = useState(0);
    const [trend, setTrend] = useState({ now: null, before: null, nNow: 0 });
    const [series, setSeries] = useState([]);
    const [today, setToday] = useState(null);
    const [editing, setEditing] = useState(false);
    const [extra, setExtra] = useState({});
    const day = localDay();
    const load = useCallback(async () => {
        const { fromIso, toIso } = monthRange();
        const o = await openEpisode();
        setOpen(o);
        setRecent((await listEpisodes()).slice(0, 5));
        const nSpikes = (await listEpisodes(fromIso, toIso)).length;
        setSpikesMonth(nSpikes);
        const tr = await checkinTrend("loudness", 7);
        setTrend(tr);
        const from = new Date();
        from.setDate(from.getDate() - 13);
        setSeries(await checkinSeries("loudness", localDay(from), day));
        const c = await getCheckin(day);
        setToday(c);
        const ex = c?.extra ? JSON.parse(c.extra) : {};
        setExtra(ex);
        void publishWidget({ open: !!o, today: typeof ex.loudness === "number" ? ex.loudness : null, avg7: tr.now, spikes: nSpikes, t, lang });
        if (isPro)
            await applyOnboardingWishes();
        if (weatherEnabled) {
            await maybeRefreshWeather();
            setPressure(await pressureToday());
        }
        else
            setPressure(null);
    }, [day, t, lang, weatherEnabled, isPro]);
    useEffect(() => { void load(); }, [load, version]);
    const loud = typeof extra.loudness === "number" ? extra.loudness : null;
    const onLouderNow = async () => { const e = await startEpisode(); haptics.thud(); bump(); openSheet(e.id, "quick"); };
    const saveDay = async () => {
        if (loud == null)
            return;
        await setCheckin(day, statusFor(loud), extra, today?.note ?? null);
        haptics.success();
        setEditing(false);
        bump();
    };
    const saved = !!today && !editing && loud != null;
    const f1 = (n) => n.toLocaleString(lang, { maximumFractionDigits: 1 });
    const delta = trend.now != null && trend.before != null ? trend.now - trend.before : null;
    const summary = () => {
        const parts = [];
        for (const k of sideFields)
            if (typeof extra[k] === "number")
                parts.push(`${t(`home.fields.${k}`)} ${extra[k]}`);
        if (extra.period)
            parts.push(t("home.periodShort"));
        return parts.join(" · ");
    };
    return (_jsxs("section", { className: "screen", children: [_jsxs("div", { className: "hero", children: [_jsx("p", { className: "eyebrow", children: new Date().toLocaleDateString(lang, { weekday: "long", day: "numeric", month: "long" }) }), _jsx("h1", { children: userName ? t("home.greeting", { name: userName }) : t("home.title") })] }), saved ? (_jsxs("div", { className: "card today-saved", children: [_jsx("div", { className: "today-n", children: loud }), _jsxs("div", { className: "grow", children: [_jsx("strong", { children: t("home.todayIs", { word: t(`loud.level.${loudWord(loud)}`).toLowerCase() }) }), _jsx("div", { className: "muted small", children: summary() || t("home.savedDay") })] }), _jsx("button", { className: "ghost", onClick: () => setEditing(true), children: t("common.edit") })] })) : (_jsxs("div", { className: "card col checkin-card", children: [_jsxs("div", { className: "row between", children: [_jsx("strong", { className: "q", children: t("loud.question") }), _jsx("button", { type: "button", className: "linklike small", onClick: () => openInfo("loudness"), "aria-label": t("loud.infoTitle"), children: "\u24D8" })] }), _jsx(LoudScale, { value: loud, onChange: (v) => setExtra({ ...extra, loudness: v }) }), sideFields.map((k) => (_jsxs("div", { className: "field", children: [_jsxs("span", { children: [t(`home.fields.${k}`), " ", _jsx("em", { className: "muted scale-hint", children: t(`home.fieldHint.${k}`) })] }), _jsx("div", { className: "scale", children: [1, 2, 3, 4, 5].map((v) => (_jsx("button", { className: extra[k] === v ? "on" : "", onClick: () => { haptics.tap(); setExtra({ ...extra, [k]: v }); }, children: v }, v))) })] }, k))), _jsx("button", { className: "cta", style: { marginTop: 6 }, disabled: loud == null, onClick: saveDay, children: t("home.saveDay") })] })), cycleTracking && (_jsxs("div", { className: "period-row", children: [_jsxs("button", { type: "button", className: `chip ${extra.period ? "on" : ""}`, onClick: async () => {
                            const n = { ...extra, period: !extra.period };
                            setExtra(n);
                            haptics.tap();
                            if (today && typeof n.loudness === "number") {
                                await setCheckin(day, statusFor(n.loudness), n, today.note);
                                bump();
                            }
                        }, children: [extra.period ? "✓ " : "", t("home.periodToday")] }), _jsx("span", { className: "muted small", children: t("home.periodHint") })] })), open ? (_jsxs("button", { type: "button", className: "louder live", onClick: () => openSheet(open.id, "live"), children: [_jsx("span", { className: "louder-mark", children: _jsx(WaveMark, { size: 34, color: "#fff", core: "#fff" }) }), _jsxs("span", { className: "col-text", children: [_jsx("strong", { children: t("home.openSince", { time: fmtTime(open.startedAt, lang) }) }), _jsx("span", { className: "small", children: t("home.tapToEdit") })] })] })) : (_jsxs("button", { type: "button", className: "louder", onClick: onLouderNow, children: [_jsx("span", { className: "louder-mark", children: _jsx(WaveMark, { size: 34, color: "#fff", core: "#fff" }) }), _jsxs("span", { className: "col-text", children: [_jsx("strong", { children: t("home.louderNow") }), _jsx("span", { className: "small", children: t("home.louderHint") })] })] })), _jsx("h2", { children: t("home.weekTitle") }), _jsxs("div", { className: "stats", children: [_jsxs("div", { className: "stat", children: [_jsx("div", { className: "n", children: trend.now != null ? f1(trend.now) : "–" }), _jsx("div", { className: "l", children: t("home.avg7") })] }), _jsxs("div", { className: `stat ${delta != null && delta <= -0.4 ? "ok" : ""}`, children: [_jsx("div", { className: "n", children: delta == null ? "–" : `${delta > 0.05 ? "↑" : delta < -0.05 ? "↓" : "→"} ${f1(Math.abs(delta))}` }), _jsx("div", { className: "l", children: t("home.vsLastWeek") })] }), _jsxs("div", { className: "stat", style: { gridColumn: "1 / -1" }, children: [_jsx("div", { className: "n", children: spikesMonth }), _jsx("div", { className: "l", children: t("home.spikesMonth", { count: spikesMonth }) })] })] }), series.length >= 2 ? _jsx("div", { className: "card spark-card", children: _jsx(Spark, { data: series, days: 14, height: 90, lang: lang }) })
                : _jsx("p", { className: "muted small", children: t("home.sparkEmpty") }), weatherEnabled && (_jsxs("div", { className: "card pressure", children: [_jsxs("div", { children: [_jsx("strong", { children: pressure ? t("weather.pressureNow", { p: pressure.pressure }) : t("weather.noData") }), _jsx("div", { className: "muted small", children: pressure?.delta != null ? t(pressure.delta <= -5 ? "weather.falling" : pressure.delta >= 5 ? "weather.rising" : "weather.stable", { d: Math.abs(pressure.delta) }) : weatherPlace ?? "" })] }), _jsx("button", { type: "button", className: "linklike small", style: { marginRight: 8 }, onClick: () => openInfo("pressure"), children: "\u24D8" }), _jsx("span", { className: `pill ${pressure?.delta != null && pressure.delta <= -5 ? "warnpill" : ""}`, children: pressure?.delta != null ? `${pressure.delta > 0 ? "↑" : pressure.delta < 0 ? "↓" : "→"} ${Math.abs(pressure.delta)} hPa` : "–" })] })), _jsx("h2", { children: t("home.recent") }), recent.length === 0 ? _jsx("p", { className: "empty", children: t("home.empty") }) : (_jsx("ul", { className: "list", children: recent.map((e) => (_jsxs("li", { className: "tap", onClick: () => openSheet(e.id, "full"), children: [_jsxs("div", { children: [_jsx("strong", { children: fmtDateTime(e.startedAt, lang) }), _jsxs("small", { children: [e.endedAt ? t("episode.duration", { h: hours(e.startedAt, e.endedAt).toFixed(1) }) : t("home.ongoing"), e.intensity != null ? ` · ${e.intensity}/10` : ""] })] }), _jsx("span", { className: "muted", children: "\u203A" })] }, e.id))) })), _jsxs("button", { type: "button", className: "card tap redflag-link", onClick: () => openInfo("redFlags"), children: [_jsx("span", { children: t("redFlags.link") }), _jsx("span", { className: "muted", children: "\u203A" })] }), _jsx("p", { className: "disclaimer", children: t("common.disclaimer") })] }));
}

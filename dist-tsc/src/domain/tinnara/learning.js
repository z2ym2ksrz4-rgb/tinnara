/**
 * "What it looks like" in plain sentences. Phrased as observations about the user's own log ("on days after…
 * your tinnitus averaged…"), never as a cause, a diagnosis or advice. Shown on Insights and in the PDF.
 */
export function learningSentences(d, t, lang) {
    const out = [];
    const fmt = (n) => n.toLocaleString(lang, { maximumFractionDigits: 1 });
    const pct = (x) => Math.round(x * 100);
    const { trend30, contrasts, pat, freq } = d;
    if (trend30.now != null && trend30.before != null && trend30.nNow >= 10) {
        const diff = trend30.now - trend30.before;
        out.push(t(Math.abs(diff) < 0.4 ? "learn.trendSame" : diff < 0 ? "learn.trendDown" : "learn.trendUp", { now: fmt(trend30.now), before: fmt(trend30.before) }));
    }
    for (const c of contrasts) {
        if (Math.abs(c.hi - c.lo) < 0.7)
            continue;
        out.push(t(`learn.contrast.${c.key}`, { hi: fmt(c.hi), lo: fmt(c.lo) }));
    }
    if (pat?.weekday)
        out.push(t("learn.weekday", { day: new Date(2024, 0, 7 + pat.weekday.day).toLocaleDateString(lang, { weekday: "long" }), pct: pct(pat.weekday.share) }));
    if (pat?.timeOfDay)
        out.push(t("learn.time", { part: t(`insights.part.${pat.timeOfDay.part}`), pct: pct(pat.timeOfDay.share) }));
    if (pat?.period && pat.period.share >= 0.25)
        out.push(t("learn.period", { pct: pct(pat.period.share) }));
    if (pat?.pressure && pat.pressure.attacks >= 5) {
        const share = pat.pressure.attacksOnDrop / pat.pressure.attacks;
        out.push(t(share >= pat.pressure.dropShareAll + 0.15 ? "learn.pressureYes" : "learn.pressureNo", { pct: pct(share), all: pct(pat.pressure.dropShareAll), hpa: pat.pressure.threshold }));
    }
    const top = (g) => freq.filter((f) => f.groupKey === g && f.total >= 4).sort((a, b) => b.n - a.n)[0];
    const tr = top("trigger");
    if (tr && tr.n / tr.total >= 0.3)
        out.push(t("learn.trigger", { tag: tr.labelKey ? t(tr.labelKey) : tr.label ?? "", pct: pct(tr.n / tr.total) }));
    const re = top("relief");
    if (re && re.n / re.total >= 0.3)
        out.push(t("learn.relief", { tag: re.labelKey ? t(re.labelKey) : re.label ?? "", pct: pct(re.n / re.total) }));
    return out;
}

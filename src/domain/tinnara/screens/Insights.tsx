import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  episodeSummary, tagFrequency, monthRange, patterns as loadPatterns, checkinSeries, checkinMonthly, checkinContrast, checkinTrend,
  type Patterns, type Contrast,
} from "@/core/diary";
import { localDay } from "@/core/ui";
import { useProGate } from "@/core/purchases";
import { useUi } from "../store";
import { ReportSheet } from "./Report";
import { learningSentences } from "../learning";
import { Spark } from "../components/Spark";
import { contrastFields } from "../config";

const avgOf = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

/** Descriptive statistics only: averages, counts and shares of what the user logged. No scoring, no classification, no advice. */
export function Insights() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const gate = useProGate();
  const version = useUi((s) => s.version);
  const openInfo = useUi((s) => s.openInfo);
  const [range, setRange] = useState<"month" | "3m" | "12m">("3m");
  const [reportOpen, setReportOpen] = useState(false);
  const [daily, setDaily] = useState<{ date: string; v: number }[]>([]);
  const [monthly, setMonthly] = useState<{ month: string; avg: number | null; n: number }[]>([]);
  const [sum, setSum] = useState<Awaited<ReturnType<typeof episodeSummary>> | null>(null);
  const [day, setDay] = useState<{ loud: number | null; distress: number | null; logged: number; hard: number }>({ loud: null, distress: null, logged: 0, hard: 0 });
  const [freq, setFreq] = useState<Awaited<ReturnType<typeof tagFrequency>>>([]);
  const [pat, setPat] = useState<Patterns | null>(null);
  const [contrasts, setContrasts] = useState<Contrast[]>([]);
  const [trend30, setTrend30] = useState<{ now: number | null; before: number | null; nNow: number }>({ now: null, before: null, nNow: 0 });

  const load = useCallback(async () => {
    if (!gate.isPro) return;
    const now = new Date();
    const months = range === "month" ? 1 : range === "3m" ? 3 : 12;
    const from = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
    const fromIso = from.toISOString(), toIso = monthRange(now).toIso;
    const d90 = new Date(); d90.setDate(d90.getDate() - 89);
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
    return (
      <section className="screen">
        <h1>{t("insights.title")}</h1>
        <div className="card col">
          <strong>{t("insights.lockedTitle")}</strong>
          <p className="muted">{t("insights.lockedBody")}</p>
          <button onClick={() => gate.allow("insights")}>{t("plan.upgrade")}</button>
        </div>
      </section>
    );
  }

  const f1 = (n: number | null) => (n == null ? "–" : n.toLocaleString(lang, { maximumFractionDigits: 1 }));
  const Freq = ({ group }: { group: string }) => {
    const rows = freq.filter((f) => f.groupKey === group).slice(0, 5);
    if (!rows.length) return <p className="muted small">{t("insights.noData")}</p>;
    return (
      <div className="freq">
        {rows.map((f) => {
          const pct = f.total ? Math.round((f.n / f.total) * 100) : 0;
          return (
            <div className="f" key={f.tagId}>
              <span>{f.labelKey ? t(f.labelKey) : f.label}</span><span className="muted">{pct}%</span>
              <div className="track"><div className="fill" style={{ width: `${pct}%` }} /></div>
            </div>
          );
        })}
      </div>
    );
  };
  const lines = learningSentences({ trend30, contrasts, pat, freq }, t, lang);
  const shown = contrasts.filter((c) => Math.abs(c.hi - c.lo) >= 0.7);

  return (
    <section className="screen">
      <h1>{t("insights.title")}</h1>
      <button className="cta report-btn" style={{ marginTop: 4 }} onClick={() => setReportOpen(true)}>📄 {t("report.cta")}</button>

      <h2>{t("insights.loud90")}</h2>
      {daily.length >= 2 ? <div className="card spark-card"><Spark data={daily} days={90} height={140} lang={lang} /></div> : <p className="muted small">{t("insights.noData")}</p>}
      <p className="muted small">{t("insights.loud90Hint")}</p>

      <h2>{t("insights.monthly")}</h2>
      <div className="bars">
        {monthly.map((m, i) => <div key={m.month} className={`bar ${i === monthly.length - 1 ? "cur" : ""} ${m.avg == null ? "none" : ""}`} style={{ height: `${((m.avg ?? 0) / 10) * 100}%` }} title={`${m.month}: ${f1(m.avg)}`} />)}
      </div>
      <div className="barlbl">{monthly.map((m) => <span key={m.month}>{new Date(m.month + "-01T12:00:00").toLocaleDateString(lang, { month: "narrow" })}</span>)}</div>

      <div className="segment" style={{ margin: "16px 0 8px" }}>
        {(["month", "3m", "12m"] as const).map((r) => <button key={r} className={range === r ? "active" : ""} onClick={() => setRange(r)}>{t(`insights.range.${r}`)}</button>)}
      </div>
      <div className="stats">
        <div className="stat"><div className="n">{f1(day.loud)}</div><div className="l">{t("insights.avgLoud")}</div></div>
        <div className="stat"><div className="n">{f1(day.distress)}</div><div className="l">{t("insights.avgDistress")}</div></div>
        <div className="stat"><div className="n">{day.hard}</div><div className="l">{t("insights.hardDays", { n: day.logged })}</div></div>
        <div className="stat"><div className="n">{sum?.episodes ?? 0}</div><div className="l">{t("insights.spikes")}</div></div>
        {sum?.avgHours != null && <div className="stat" style={{ gridColumn: "1 / -1" }}><div className="n">{f1(sum.avgHours)}</div><div className="l">{t("insights.avgSpikeHours")}</div></div>}
      </div>

      <h2>{t("insights.learnTitle")}</h2>
      {lines.length
        ? <div className="card col learn">{lines.map((l, i) => <p key={i}>{l}</p>)}<span className="muted small">{t("insights.learnNote")}</span></div>
        : <p className="muted small">{t("insights.learnEmpty")}</p>}

      <h2>{t("insights.patterns")}</h2>
      {shown.length || pat?.weekday || pat?.timeOfDay || pat?.pressure || pat?.period ? (
        <div className="stack">
          {shown.map((c) => (
            <div className="card col" key={c.key}>
              <strong>{t(`insights.contrast.${c.key}`, { hi: f1(c.hi), lo: f1(c.lo) })}</strong>
              <span className="muted small">{t("insights.contrastBasis", { hi: c.nHi, lo: c.nLo })}</span>
            </div>
          ))}
          {pat?.weekday && <div className="card col"><strong>{t("insights.patWeekday", { day: new Date(2024, 0, 7 + pat.weekday.day).toLocaleDateString(lang, { weekday: "long" }), pct: Math.round(pat.weekday.share * 100) })}</strong><span className="muted small">{t("insights.patBasis", { n: pat.attacks })}</span></div>}
          {pat?.timeOfDay && <div className="card col"><strong>{t("insights.patTime", { part: t(`insights.part.${pat.timeOfDay.part}`), pct: Math.round(pat.timeOfDay.share * 100) })}</strong><span className="muted small">{t("insights.patBasis", { n: pat.attacks })}</span></div>}
          {pat?.pressure && <div className="card col"><strong>{t("insights.patPressure", { pct: Math.round((pat.pressure.attacksOnDrop / pat.pressure.attacks) * 100), all: Math.round(pat.pressure.dropShareAll * 100), hpa: pat.pressure.threshold })}</strong><span className="muted small">{t("insights.patBasis", { n: pat.pressure.attacks })} · <button type="button" className="linklike small" onClick={() => openInfo("pressure")}>{t("weather.whatIsIt")}</button></span></div>}
          {pat?.period && <div className="card col"><strong>{t("insights.patPeriod", { pct: Math.round(pat.period.share * 100) })}</strong><span className="muted small">{t("insights.patBasis", { n: pat.attacks })}</span></div>}
          <p className="muted small">{t("insights.patNote")}</p>
        </div>
      ) : <p className="muted small">{t("insights.patNeed")}</p>}

      <h2>{t("diary.groups.sound")} <span className="muted" style={{ textTransform: "none", letterSpacing: 0 }}>· {t("insights.shareOfSpikes")}</span></h2>
      <Freq group="sound" />
      <h2>{t("diary.groups.trigger")}</h2>
      <Freq group="trigger" />
      <h2>{t("diary.groups.symptom")}</h2>
      <Freq group="symptom" />
      <h2>{t("diary.groups.relief")}</h2>
      <Freq group="relief" />
      <p className="disclaimer">{t("insights.disclaimer")}</p>
      <ReportSheet open={reportOpen} onClose={() => setReportOpen(false)} />
    </section>
  );
}

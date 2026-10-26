import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  openEpisode, startEpisode, listEpisodes, monthRange, getCheckin, setCheckin, checkinSeries, checkinTrend, pressureToday,
  type Episode, type DailyCheckin,
} from "@/core/diary";
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

type Extra = Record<string, number | boolean>;

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
  const [pressure, setPressure] = useState<{ pressure: number; delta: number | null } | null>(null);
  const [open, setOpen] = useState<Episode | null>(null);
  const [recent, setRecent] = useState<Episode[]>([]);
  const [spikesMonth, setSpikesMonth] = useState(0);
  const [trend, setTrend] = useState<{ now: number | null; before: number | null; nNow: number }>({ now: null, before: null, nNow: 0 });
  const [series, setSeries] = useState<{ date: string; v: number }[]>([]);
  const [today, setToday] = useState<DailyCheckin | null>(null);
  const [editing, setEditing] = useState(false);
  const [extra, setExtra] = useState<Extra>({});
  const day = localDay();

  const load = useCallback(async () => {
    const { fromIso, toIso } = monthRange();
    const o = await openEpisode(); setOpen(o);
    setRecent((await listEpisodes()).slice(0, 5));
    const nSpikes = (await listEpisodes(fromIso, toIso)).length; setSpikesMonth(nSpikes);
    const tr = await checkinTrend("loudness", 7); setTrend(tr);
    const from = new Date(); from.setDate(from.getDate() - 13);
    setSeries(await checkinSeries("loudness", localDay(from), day));
    const c = await getCheckin(day); setToday(c);
    const ex: Extra = c?.extra ? (JSON.parse(c.extra) as Extra) : {};
    setExtra(ex);
    void publishWidget({ open: !!o, today: typeof ex.loudness === "number" ? ex.loudness : null, avg7: tr.now, spikes: nSpikes, t, lang });
    if (isPro) await applyOnboardingWishes();
    if (weatherEnabled) { await maybeRefreshWeather(); setPressure(await pressureToday()); } else setPressure(null);
  }, [day, t, lang, weatherEnabled, isPro]);
  useEffect(() => { void load(); }, [load, version]);

  const loud = typeof extra.loudness === "number" ? extra.loudness : null;
  const onLouderNow = async () => { const e = await startEpisode(); haptics.thud(); bump(); openSheet(e.id, "quick"); };
  const saveDay = async () => {
    if (loud == null) return;
    await setCheckin(day, statusFor(loud), extra, today?.note ?? null);
    haptics.success(); setEditing(false); bump();
  };
  const saved = !!today && !editing && loud != null;
  const f1 = (n: number) => n.toLocaleString(lang, { maximumFractionDigits: 1 });
  const delta = trend.now != null && trend.before != null ? trend.now - trend.before : null;
  const summary = () => {
    const parts: string[] = [];
    for (const k of sideFields) if (typeof extra[k] === "number") parts.push(`${t(`home.fields.${k}`)} ${extra[k]}`);
    if (extra.period) parts.push(t("home.periodShort"));
    return parts.join(" · ");
  };

  return (
    <section className="screen">
      <div className="hero">
        <p className="eyebrow">{new Date().toLocaleDateString(lang, { weekday: "long", day: "numeric", month: "long" })}</p>
        <h1>{userName ? t("home.greeting", { name: userName }) : t("home.title")}</h1>
      </div>

      {saved ? (
        <div className="card today-saved">
          <div className="today-n">{loud}</div>
          <div className="grow"><strong>{t("home.todayIs", { word: t(`loud.level.${loudWord(loud!)}`).toLowerCase() })}</strong>
            <div className="muted small">{summary() || t("home.savedDay")}</div></div>
          <button className="ghost" onClick={() => setEditing(true)}>{t("common.edit")}</button>
        </div>
      ) : (
        <div className="card col checkin-card">
          <div className="row between"><strong className="q">{t("loud.question")}</strong>
            <button type="button" className="linklike small" onClick={() => openInfo("loudness")} aria-label={t("loud.infoTitle")}>ⓘ</button></div>
          <LoudScale value={loud} onChange={(v) => setExtra({ ...extra, loudness: v })} />
          {sideFields.map((k) => (
            <div className="field" key={k}>
              <span>{t(`home.fields.${k}`)} <em className="muted scale-hint">{t(`home.fieldHint.${k}`)}</em></span>
              <div className="scale">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button key={v} className={extra[k] === v ? "on" : ""} onClick={() => { haptics.tap(); setExtra({ ...extra, [k]: v }); }}>{v}</button>
                ))}
              </div>
            </div>
          ))}
          <button className="cta" style={{ marginTop: 6 }} disabled={loud == null} onClick={saveDay}>{t("home.saveDay")}</button>
        </div>
      )}

      {cycleTracking && (
        <div className="period-row">
          <button type="button" className={`chip ${extra.period ? "on" : ""}`} onClick={async () => {
            const n: Extra = { ...extra, period: !extra.period }; setExtra(n); haptics.tap();
            if (today && typeof n.loudness === "number") { await setCheckin(day, statusFor(n.loudness), n, today.note); bump(); }
          }}>{extra.period ? "✓ " : ""}{t("home.periodToday")}</button>
          <span className="muted small">{t("home.periodHint")}</span>
        </div>
      )}

      {open ? (
        <button type="button" className="louder live" onClick={() => openSheet(open.id, "live")}>
          <span className="louder-mark"><WaveMark size={34} color="#fff" core="#fff" /></span>
          <span className="col-text"><strong>{t("home.openSince", { time: fmtTime(open.startedAt, lang) })}</strong><span className="small">{t("home.tapToEdit")}</span></span>
        </button>
      ) : (
        <button type="button" className="louder" onClick={onLouderNow}>
          <span className="louder-mark"><WaveMark size={34} color="#fff" core="#fff" /></span>
          <span className="col-text"><strong>{t("home.louderNow")}</strong><span className="small">{t("home.louderHint")}</span></span>
        </button>
      )}

      <h2>{t("home.weekTitle")}</h2>
      <div className="stats">
        <div className="stat"><div className="n">{trend.now != null ? f1(trend.now) : "–"}</div><div className="l">{t("home.avg7")}</div></div>
        <div className={`stat ${delta != null && delta <= -0.4 ? "ok" : ""}`}>
          <div className="n">{delta == null ? "–" : `${delta > 0.05 ? "↑" : delta < -0.05 ? "↓" : "→"} ${f1(Math.abs(delta))}`}</div>
          <div className="l">{t("home.vsLastWeek")}</div>
        </div>
        <div className="stat" style={{ gridColumn: "1 / -1" }}><div className="n">{spikesMonth}</div><div className="l">{t("home.spikesMonth", { count: spikesMonth })}</div></div>
      </div>
      {series.length >= 2 ? <div className="card spark-card"><Spark data={series} days={14} height={90} lang={lang} /></div>
        : <p className="muted small">{t("home.sparkEmpty")}</p>}

      {weatherEnabled && (
        <div className="card pressure">
          <div><strong>{pressure ? t("weather.pressureNow", { p: pressure.pressure }) : t("weather.noData")}</strong>
            <div className="muted small">{pressure?.delta != null ? t(pressure.delta <= -5 ? "weather.falling" : pressure.delta >= 5 ? "weather.rising" : "weather.stable", { d: Math.abs(pressure.delta) }) : weatherPlace ?? ""}</div></div>
          <button type="button" className="linklike small" style={{ marginRight: 8 }} onClick={() => openInfo("pressure")}>ⓘ</button>
          <span className={`pill ${pressure?.delta != null && pressure.delta <= -5 ? "warnpill" : ""}`}>{pressure?.delta != null ? `${pressure.delta > 0 ? "↑" : pressure.delta < 0 ? "↓" : "→"} ${Math.abs(pressure.delta)} hPa` : "–"}</span>
        </div>
      )}

      <h2>{t("home.recent")}</h2>
      {recent.length === 0 ? <p className="empty">{t("home.empty")}</p> : (
        <ul className="list">
          {recent.map((e) => (
            <li key={e.id} className="tap" onClick={() => openSheet(e.id, "full")}>
              <div><strong>{fmtDateTime(e.startedAt, lang)}</strong>
                <small>{e.endedAt ? t("episode.duration", { h: hours(e.startedAt, e.endedAt).toFixed(1) }) : t("home.ongoing")}{e.intensity != null ? ` · ${e.intensity}/10` : ""}</small></div>
              <span className="muted">›</span>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="card tap redflag-link" onClick={() => openInfo("redFlags")}>
        <span>{t("redFlags.link")}</span><span className="muted">›</span>
      </button>
      <p className="disclaimer">{t("common.disclaimer")}</p>
    </section>
  );
}

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Sheet, localDay } from "@/core/ui";
import { monthRange, patterns, tagFrequency, weatherDays, listCheckins, listEpisodes, checkinContrast, checkinTrend } from "@/core/diary";
import { learningSentences } from "../learning";
import { useSettings } from "@/core/settings";
import { maybeAskForReview } from "@/core/review";
import appConfig from "../../../../app.config.json";
import { contrastFields } from "../config";
import type { WeekRow } from "../report";

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

/** Monday-based weeks covering [from, to), each with the averages of the five check-in fields and the spike count. */
async function weekRows(fromIso: string, toIso: string): Promise<WeekRow[]> {
  const from = new Date(fromIso); const to = new Date(toIso);
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate() - ((from.getDay() + 6) % 7));
  const checkins = await listCheckins(localDay(start), localDay(new Date(to.getTime() - 1)));
  const eps = await listEpisodes(start.toISOString(), toIso);
  const out: WeekRow[] = [];
  for (let w = new Date(start); w < to; w.setDate(w.getDate() + 7)) {
    const a = localDay(w); const e = new Date(w); e.setDate(e.getDate() + 7); const b = localDay(e);
    const days = checkins.filter((c) => c.date >= a && c.date < b).map((c) => { try { return JSON.parse(c.extra ?? "{}") as Record<string, number>; } catch { return {}; } });
    const col = (k: string) => avg(days.map((d) => d[k]).filter((v): v is number => typeof v === "number"));
    out.push({ from: new Date(w).toISOString(), loud: col("loudness"), distress: col("distress"), sleep: col("sleep"), stress: col("stress"), noise: col("noise"), days: days.filter((d) => typeof d.loudness === "number").length, spikes: eps.filter((x) => x.startedAt >= w.toISOString() && x.startedAt < e.toISOString()).length });
  }
  return out;
}

export function ReportSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const settings = useSettings();
  const [preset, setPreset] = useState<"month" | "last" | "3m" | "custom">("3m");
  const [from, setFrom] = useState(() => localDay(new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1)));
  const [to, setTo] = useState(() => localDay());
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState("");

  const range = () => {
    const now = new Date();
    if (preset === "month") return monthRange(now);
    if (preset === "last") return monthRange(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    if (preset === "3m") return { fromIso: new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString(), toIso: monthRange(now).toIso };
    return { fromIso: new Date(from + "T00:00:00").toISOString(), toIso: new Date(new Date(to + "T00:00:00").getTime() + 864e5).toISOString() };
  };
  const profileLine = () => {
    if (!settings.conditionProfile) return null;
    try {
      const p = JSON.parse(settings.conditionProfile) as { since?: string; side?: string; sounds?: string[] };
      const parts: string[] = [];
      if (p.since) parts.push(`${t("onboarding.sinceQShort")}: ${t(`onboarding.since.${p.since}`)}`);
      if (p.side) parts.push(`${t("diary.groups.location")}: ${t(`diary.tags.location.${p.side}`)}`);
      if (p.sounds?.length) parts.push(`${t("diary.groups.sound")}: ${p.sounds.map((s) => t(`diary.tags.sound.${s}`)).join(", ")}`);
      return parts.join(" · ") || null;
    } catch { return null; }
  };
  const make = async () => {
    setBusy(true);
    try {
      const { buildReport, sharePdf } = await import("../report");
      const { fromIso, toIso } = range();
      const weeks = await weekRows(fromIso, toIso);
      const cs = await listCheckins(fromIso.slice(0, 10), localDay(new Date(new Date(toIso).getTime() - 1)));
      const louds = cs.map((c) => { try { return (JSON.parse(c.extra ?? "{}") as Record<string, number>); } catch { return {}; } });
      const lv = louds.map((x) => x.loudness).filter((v): v is number => typeof v === "number");
      const day = { loud: avg(lv), distress: avg(louds.map((x) => x.distress).filter((v): v is number => typeof v === "number")), logged: lv.length, hard: lv.filter((v) => v >= 7).length };
      const freq = await tagFrequency(fromIso, toIso);
      const learning = learningSentences({ trend30: await checkinTrend("loudness", 30), contrasts: await checkinContrast("loudness", contrastFields), pat: await patterns(), freq }, t, i18n.language);
      const wd = await weatherDays(fromIso.slice(0, 10), toIso.slice(0, 10)); const byDate = new Map(wd.map((w) => [w.date, w.pressureMean]));
      const pressure = new Map<string, { p: number; delta: number | null }>();
      for (const w of wd) { if (w.pressureMean == null) continue; const d = new Date(w.date + "T12:00:00"); d.setDate(d.getDate() - 1); const prev = byDate.get(d.toISOString().slice(0, 10)); pressure.set(w.date, { p: Math.round(w.pressureMean), delta: prev != null ? Math.round(w.pressureMean - prev) : null }); }
      const doc = await buildReport(fromIso, toIso, t, i18n.language, { name: settings.userName, profile: profileLine(), notes, weeks, day, learning, pressure: settings.weatherEnabled ? pressure : undefined });
      await sharePdf(doc, `${appConfig.appSlug}-${fromIso.slice(0, 10)}-${toIso.slice(0, 10)}.pdf`, t("report.title"));
      await settings.set("successEvents", settings.successEvents + 1); void maybeAskForReview();
      onClose();
    } finally { setBusy(false); }
  };
  return (
    <Sheet open={open} onClose={onClose} title={t("report.title")}>
      <p className="muted small">{t("report.sub")}</p>
      <div className="stack" style={{ margin: "10px 0" }}>
        {(["month", "last", "3m", "custom"] as const).map((p) => (
          <button key={p} className={`chip ${preset === p ? "on" : ""}`} style={{ textAlign: "left" }} onClick={() => setPreset(p)}>{t(`report.preset.${p}`)}</button>
        ))}
      </div>
      {preset === "custom" && (
        <div className="row">
          <label className="field"><span>{t("report.from")}</span><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
          <label className="field"><span>{t("report.to")}</span><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
        </div>
      )}
      <label className="field"><span>{t("report.notesTitle")}</span>
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("report.notesPh")} />
      </label>
      <button className="cta" onClick={make} disabled={busy}>{busy ? "…" : t("report.make")}</button>
      <p className="disclaimer">{t("report.footer", { app: appConfig.appName })}</p>
    </Sheet>
  );
}

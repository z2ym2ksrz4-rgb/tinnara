import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/core/settings";
import { ensurePermission } from "@/core/notifications";
import { usePaywall } from "@/core/purchases";
import i18n, { SUPPORTED, type Lang } from "@/core/i18n";
import { haptics } from "@/core/ui";
import { searchPlaces, type Place } from "@/core/diary";
import { WidgetPreview } from "@/domain/tinnara/components/WidgetPreview";
import { tinnitusTagGroups } from "@/domain/tinnara/tagsets";

/**
 * Onboarding: (0) language + first name, (1-3) three short intro screens, widget intro, (setup) how long, which side,
 * how it sounds – printed on the doctor's report – plus when to see a doctor quickly, (extras) Pro wishes.
 * Then notification permission and the paywall (user can always close it and use the free tier).
 */
export function Onboarding() {
  const { t } = useTranslation();
  const settings = useSettings();
  const showPaywall = usePaywall((s) => s.show);
  const [step, setStep] = useState(0);
  const [name, setName] = useState(settings.userName ?? "");
  const [since, setSince] = useState<string | null>(null);
  const [side, setSide] = useState<string | null>(null);
  const [sounds, setSounds] = useState<Set<string>>(new Set());
  const [flagsOpen, setFlagsOpen] = useState(false);
  const [wantCycle, setWantCycle] = useState(false);
  const [placeQ, setPlaceQ] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [place, setPlace] = useState<Place | null>(null);
  const [placeBusy, setPlaceBusy] = useState(false);
  const intro = t("onboarding.steps", { returnObjects: true }) as { title: string; body: string }[];
  const soundKeys = tinnitusTagGroups.find((g) => g.key === "sound")!.tags.filter((k) => k !== "several");
  const sideKeys = tinnitusTagGroups.find((g) => g.key === "location")!.tags;
  const total = intro.length + 4; // name, intro…, widget, setup, extras
  const SETUP = total - 2, EXTRAS = total - 1, WIDGET = intro.length + 1;
  const Dots = () => <div className="dots">{Array.from({ length: total }, (_, i) => <span key={i} className={i === step ? "on" : ""} />)}</div>;

  const finish = async () => {
    await settings.set("userName", name.trim() || null);
    const profile = { since: since ?? undefined, side: side ?? undefined, sounds: [...sounds] };
    await settings.set("conditionProfile", since || side || sounds.size ? JSON.stringify(profile) : null);
    if (place) { await settings.set("weatherPlace", [place.name, place.admin, place.country].filter(Boolean).join(", ")); await settings.set("weatherLat", place.lat); await settings.set("weatherLon", place.lon); }
    const wishes = { cycle: wantCycle, weather: !!place };
    await settings.set("onboardingWishes", wishes.cycle || wishes.weather ? JSON.stringify(wishes) : null);
    await ensurePermission();
    await settings.set("onboardingDone", true);
    showPaywall("onboarding");
  };
  const next = () => { haptics.tap(); setStep(step + 1); };

  if (step === 0) {
    return (
      <section className="screen onboarding">
        <Dots />
        <h1>{t("onboarding.welcome")}</h1>
        <p>{t("onboarding.welcomeBody")}</p>
        <label className="field"><span>{t("settings.language")}</span>
          <select value={settings.language} onChange={async (e) => { const l = e.target.value as Lang; await settings.set("language", l); await i18n.changeLanguage(l); }}>
            {SUPPORTED.map((l) => <option key={l} value={l}>{t(`lang.${l}`)}</option>)}
          </select>
        </label>
        <label className="field"><span>{t("onboarding.name")}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("onboarding.namePh")} autoComplete="given-name" maxLength={40} />
        </label>
        <div className="row" style={{ marginTop: 10 }}>
          <button className="cta" onClick={next}>{t("onboarding.next")}</button>
        </div>
      </section>
    );
  }

  if (step === WIDGET) {
    const steps = t("widget.stepsIos", { returnObjects: true }) as string[];
    return (
      <section className="screen onboarding">
        <Dots />
        <h1>{t("onboarding.widgetTitle")}</h1>
        <p>{t("onboarding.widgetBody")}</p>
        <WidgetPreview />
        <ol className="steps">{steps.map((x, i) => <li key={i}>{x}</li>)}</ol>
        <p className="muted small">{t("onboarding.widgetLater")}</p>
        <div className="row">
          <button className="ghost" onClick={() => setStep(SETUP)}>{t("onboarding.skip")}</button>
          <button className="cta" onClick={next}>{t("onboarding.next")}</button>
        </div>
      </section>
    );
  }

  if (step === SETUP) {
    return (
      <section className="screen onboarding">
        <Dots />
        <h1>{t("onboarding.setupTitle", { name: name.trim() || "" }).trim()}</h1>
        <p className="muted small">{t("onboarding.setupBody")}</p>
        <div className="field"><span>{t("onboarding.sinceQ")}</span>
          <div className="chips">
            {["lt3m", "3to12m", "1to5y", "gt5y"].map((b) => <button key={b} type="button" className={`chip ${since === b ? "on" : ""}`} onClick={() => setSince(since === b ? null : b)}>{t(`onboarding.since.${b}`)}</button>)}
          </div>
        </div>
        <div className="field"><span>{t("onboarding.sideQ")}</span>
          <div className="chips">
            {sideKeys.map((k) => <button key={k} type="button" className={`chip ${side === k ? "on" : ""}`} onClick={() => setSide(side === k ? null : k)}>{t(`diary.tags.location.${k}`)}</button>)}
          </div>
        </div>
        <div className="field"><span>{t("onboarding.soundQ")}</span>
          <div className="chips">
            {soundKeys.map((k) => <button key={k} type="button" className={`chip ${sounds.has(k) ? "on" : ""}`} onClick={() => { const n = new Set(sounds); if (n.has(k)) n.delete(k); else n.add(k); setSounds(n); }}>{t(`diary.tags.sound.${k}`)}</button>)}
          </div>
        </div>
        <button type="button" className={`card col tap ${since === "lt3m" ? "warn" : ""}`} style={{ width: "100%", textAlign: "left" }} onClick={() => setFlagsOpen(!flagsOpen)}>
          <strong>{t("redFlags.link")}</strong>
          {since === "lt3m" && <span className="small">{t("onboarding.newHint")}</span>}
          {flagsOpen && <ul className="plain small">{(t("redFlags.urgent", { returnObjects: true }) as string[]).concat(t("redFlags.soon", { returnObjects: true }) as string[]).map((x, i) => <li key={i}>{x}</li>)}</ul>}
        </button>
        <div className="row" style={{ marginTop: 10 }}>
          <button className="cta" onClick={next}>{t("onboarding.next")}</button>
        </div>
      </section>
    );
  }

  if (step === EXTRAS) {
    const search = async (e: FormEvent) => { e.preventDefault(); if (placeQ.trim().length < 2) return; setPlaceBusy(true); try { setPlaces(await searchPlaces(placeQ, settings.language)); } catch { setPlaces([]); } finally { setPlaceBusy(false); } };
    return (
      <section className="screen onboarding">
        <Dots />
        <h1>{t("onboarding.extrasTitle")}</h1>
        <p className="muted">{t("onboarding.extrasBody")}</p>
        <div className="field"><span>{t("weather.title")} <span className="pill pro">PRO</span></span>
          {place ? (
            <div className="card"><div><strong>{place.name}</strong><div className="muted small">{[place.admin, place.country].filter(Boolean).join(", ")}</div></div><button type="button" className="ghost" onClick={() => { setPlace(null); setPlaces([]); }}>{t("weather.changePlace")}</button></div>
          ) : (
            <>
              <form className="row tight" onSubmit={search}>
                <input style={{ flex: 1 }} value={placeQ} onChange={(e) => setPlaceQ(e.target.value)} placeholder={t("weather.placePh")} />
                <button type="submit" className="ghost" disabled={placeBusy}>{t("common.search")}</button>
              </form>
              {places.length > 0 && <ul className="list" style={{ marginTop: 8 }}>{places.map((p, i) => <li key={i} className="tap" onClick={() => { setPlace(p); setPlaces([]); haptics.tap(); }}><div><strong>{p.name}</strong><small>{[p.admin, p.country].filter(Boolean).join(", ")}</small></div><span className="muted">›</span></li>)}</ul>}
            </>
          )}
          <small className="muted">{t("weather.hint")}</small>
        </div>
        <label className="check"><input type="checkbox" checked={wantCycle} onChange={(e) => setWantCycle(e.target.checked)} /> {t("settings.cycleTracking")} <span className="pill pro">PRO</span></label>
        <small className="muted" style={{ display: "block", marginTop: -4, marginBottom: 10 }}>{t("settings.cycleHint")}</small>
        <p className="muted small" style={{ marginTop: 12 }}>{t("onboarding.extrasNote")}</p>
        <div className="row" style={{ marginTop: 10 }}>
          <button className="cta" onClick={() => void finish()}>{t("onboarding.start")}</button>
        </div>
      </section>
    );
  }

  const s = intro[step - 1]!;
  return (
    <section className="screen onboarding">
      <Dots />
      <h1>{s.title}</h1>
      <p>{s.body}</p>
      <div className="row">
        <button className="ghost" onClick={() => setStep(SETUP)}>{t("onboarding.skip")}</button>
        <button className="cta" onClick={next}>{t("onboarding.next")}</button>
      </div>
    </section>
  );
}

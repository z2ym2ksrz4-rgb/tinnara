import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/core/settings";
import { ensurePermission } from "@/core/notifications";
import { usePaywall } from "@/core/purchases";
import i18n, { SUPPORTED } from "@/core/i18n";
import { haptics } from "@/core/ui";
import { searchPlaces } from "@/core/diary";
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
    const [since, setSince] = useState(null);
    const [side, setSide] = useState(null);
    const [sounds, setSounds] = useState(new Set());
    const [flagsOpen, setFlagsOpen] = useState(false);
    const [wantCycle, setWantCycle] = useState(false);
    const [placeQ, setPlaceQ] = useState("");
    const [places, setPlaces] = useState([]);
    const [place, setPlace] = useState(null);
    const [placeBusy, setPlaceBusy] = useState(false);
    const intro = t("onboarding.steps", { returnObjects: true });
    const soundKeys = tinnitusTagGroups.find((g) => g.key === "sound").tags.filter((k) => k !== "several");
    const sideKeys = tinnitusTagGroups.find((g) => g.key === "location").tags;
    const total = intro.length + 4; // name, intro…, widget, setup, extras
    const SETUP = total - 2, EXTRAS = total - 1, WIDGET = intro.length + 1;
    const Dots = () => _jsx("div", { className: "dots", children: Array.from({ length: total }, (_, i) => _jsx("span", { className: i === step ? "on" : "" }, i)) });
    const finish = async () => {
        await settings.set("userName", name.trim() || null);
        const profile = { since: since ?? undefined, side: side ?? undefined, sounds: [...sounds] };
        await settings.set("conditionProfile", since || side || sounds.size ? JSON.stringify(profile) : null);
        if (place) {
            await settings.set("weatherPlace", [place.name, place.admin, place.country].filter(Boolean).join(", "));
            await settings.set("weatherLat", place.lat);
            await settings.set("weatherLon", place.lon);
        }
        const wishes = { cycle: wantCycle, weather: !!place };
        await settings.set("onboardingWishes", wishes.cycle || wishes.weather ? JSON.stringify(wishes) : null);
        await ensurePermission();
        await settings.set("onboardingDone", true);
        showPaywall("onboarding");
    };
    const next = () => { haptics.tap(); setStep(step + 1); };
    if (step === 0) {
        return (_jsxs("section", { className: "screen onboarding", children: [_jsx(Dots, {}), _jsx("h1", { children: t("onboarding.welcome") }), _jsx("p", { children: t("onboarding.welcomeBody") }), _jsxs("label", { className: "field", children: [_jsx("span", { children: t("settings.language") }), _jsx("select", { value: settings.language, onChange: async (e) => { const l = e.target.value; await settings.set("language", l); await i18n.changeLanguage(l); }, children: SUPPORTED.map((l) => _jsx("option", { value: l, children: t(`lang.${l}`) }, l)) })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: t("onboarding.name") }), _jsx("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: t("onboarding.namePh"), autoComplete: "given-name", maxLength: 40 })] }), _jsx("div", { className: "row", style: { marginTop: 10 }, children: _jsx("button", { className: "cta", onClick: next, children: t("onboarding.next") }) })] }));
    }
    if (step === WIDGET) {
        const steps = t("widget.stepsIos", { returnObjects: true });
        return (_jsxs("section", { className: "screen onboarding", children: [_jsx(Dots, {}), _jsx("h1", { children: t("onboarding.widgetTitle") }), _jsx("p", { children: t("onboarding.widgetBody") }), _jsx(WidgetPreview, {}), _jsx("ol", { className: "steps", children: steps.map((x, i) => _jsx("li", { children: x }, i)) }), _jsx("p", { className: "muted small", children: t("onboarding.widgetLater") }), _jsxs("div", { className: "row", children: [_jsx("button", { className: "ghost", onClick: () => setStep(SETUP), children: t("onboarding.skip") }), _jsx("button", { className: "cta", onClick: next, children: t("onboarding.next") })] })] }));
    }
    if (step === SETUP) {
        return (_jsxs("section", { className: "screen onboarding", children: [_jsx(Dots, {}), _jsx("h1", { children: t("onboarding.setupTitle", { name: name.trim() || "" }).trim() }), _jsx("p", { className: "muted small", children: t("onboarding.setupBody") }), _jsxs("div", { className: "field", children: [_jsx("span", { children: t("onboarding.sinceQ") }), _jsx("div", { className: "chips", children: ["lt3m", "3to12m", "1to5y", "gt5y"].map((b) => _jsx("button", { type: "button", className: `chip ${since === b ? "on" : ""}`, onClick: () => setSince(since === b ? null : b), children: t(`onboarding.since.${b}`) }, b)) })] }), _jsxs("div", { className: "field", children: [_jsx("span", { children: t("onboarding.sideQ") }), _jsx("div", { className: "chips", children: sideKeys.map((k) => _jsx("button", { type: "button", className: `chip ${side === k ? "on" : ""}`, onClick: () => setSide(side === k ? null : k), children: t(`diary.tags.location.${k}`) }, k)) })] }), _jsxs("div", { className: "field", children: [_jsx("span", { children: t("onboarding.soundQ") }), _jsx("div", { className: "chips", children: soundKeys.map((k) => _jsx("button", { type: "button", className: `chip ${sounds.has(k) ? "on" : ""}`, onClick: () => { const n = new Set(sounds); if (n.has(k))
                                    n.delete(k);
                                else
                                    n.add(k); setSounds(n); }, children: t(`diary.tags.sound.${k}`) }, k)) })] }), _jsxs("button", { type: "button", className: `card col tap ${since === "lt3m" ? "warn" : ""}`, style: { width: "100%", textAlign: "left" }, onClick: () => setFlagsOpen(!flagsOpen), children: [_jsx("strong", { children: t("redFlags.link") }), since === "lt3m" && _jsx("span", { className: "small", children: t("onboarding.newHint") }), flagsOpen && _jsx("ul", { className: "plain small", children: t("redFlags.urgent", { returnObjects: true }).concat(t("redFlags.soon", { returnObjects: true })).map((x, i) => _jsx("li", { children: x }, i)) })] }), _jsx("div", { className: "row", style: { marginTop: 10 }, children: _jsx("button", { className: "cta", onClick: next, children: t("onboarding.next") }) })] }));
    }
    if (step === EXTRAS) {
        const search = async (e) => { e.preventDefault(); if (placeQ.trim().length < 2)
            return; setPlaceBusy(true); try {
            setPlaces(await searchPlaces(placeQ, settings.language));
        }
        catch {
            setPlaces([]);
        }
        finally {
            setPlaceBusy(false);
        } };
        return (_jsxs("section", { className: "screen onboarding", children: [_jsx(Dots, {}), _jsx("h1", { children: t("onboarding.extrasTitle") }), _jsx("p", { className: "muted", children: t("onboarding.extrasBody") }), _jsxs("div", { className: "field", children: [_jsxs("span", { children: [t("weather.title"), " ", _jsx("span", { className: "pill pro", children: "PRO" })] }), place ? (_jsxs("div", { className: "card", children: [_jsxs("div", { children: [_jsx("strong", { children: place.name }), _jsx("div", { className: "muted small", children: [place.admin, place.country].filter(Boolean).join(", ") })] }), _jsx("button", { type: "button", className: "ghost", onClick: () => { setPlace(null); setPlaces([]); }, children: t("weather.changePlace") })] })) : (_jsxs(_Fragment, { children: [_jsxs("form", { className: "row tight", onSubmit: search, children: [_jsx("input", { style: { flex: 1 }, value: placeQ, onChange: (e) => setPlaceQ(e.target.value), placeholder: t("weather.placePh") }), _jsx("button", { type: "submit", className: "ghost", disabled: placeBusy, children: t("common.search") })] }), places.length > 0 && _jsx("ul", { className: "list", style: { marginTop: 8 }, children: places.map((p, i) => _jsxs("li", { className: "tap", onClick: () => { setPlace(p); setPlaces([]); haptics.tap(); }, children: [_jsxs("div", { children: [_jsx("strong", { children: p.name }), _jsx("small", { children: [p.admin, p.country].filter(Boolean).join(", ") })] }), _jsx("span", { className: "muted", children: "\u203A" })] }, i)) })] })), _jsx("small", { className: "muted", children: t("weather.hint") })] }), _jsxs("label", { className: "check", children: [_jsx("input", { type: "checkbox", checked: wantCycle, onChange: (e) => setWantCycle(e.target.checked) }), " ", t("settings.cycleTracking"), " ", _jsx("span", { className: "pill pro", children: "PRO" })] }), _jsx("small", { className: "muted", style: { display: "block", marginTop: -4, marginBottom: 10 }, children: t("settings.cycleHint") }), _jsx("p", { className: "muted small", style: { marginTop: 12 }, children: t("onboarding.extrasNote") }), _jsx("div", { className: "row", style: { marginTop: 10 }, children: _jsx("button", { className: "cta", onClick: () => void finish(), children: t("onboarding.start") }) })] }));
    }
    const s = intro[step - 1];
    return (_jsxs("section", { className: "screen onboarding", children: [_jsx(Dots, {}), _jsx("h1", { children: s.title }), _jsx("p", { children: s.body }), _jsxs("div", { className: "row", children: [_jsx("button", { className: "ghost", onClick: () => setStep(SETUP), children: t("onboarding.skip") }), _jsx("button", { className: "cta", onClick: next, children: t("onboarding.next") })] })] }));
}

"""Builds src/locales/<lang>.json from the shared base (inherited from Migrano) + scripts/i18n/<lang>.json overrides.
Migraine-only sections are dropped first. Run: python3 scripts/i18n/build.py"""
import json, os, sys
ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
DROP = {"medDays": None, "health": None,
        "home": ["attackNow", "endAttack", "attackDays", "medDays", "medWarnTitle", "medWarnBody", "attackHint", "streak_one", "streak_other"],
        "insights": ["attackDaysPerMonth", "attacks", "avgHours", "avgIntensity", "medDays", "shareOfAttacks", "attackDays", "patField", "patFieldBasis", "mohTitle", "mohAlert", "mohBody", "mohShareBtn", "mohShare", "mohHint"],
        "report": ["medDays", "attacks", "intensityShort"], "calendar": ["noAttacks"],
        "learn": ["fieldLower", "fieldHigher", "symptom", "medDays"],
        "settings": ["medThreshold", "daysPerMonth", "medThresholdHint"],
        "widget": ["attackNow", "openAttack"],
        "onboarding": ["attacksQ", "attacks", "medsQ", "meds", "medsOther", "medsHint"],
        "paywall.reasons": ["health"], "diary": ["tags"]}
def merge(a, b):
    for k, v in b.items():
        if isinstance(v, dict) and isinstance(a.get(k), dict): merge(a[k], v)
        else: a[k] = v
for lang in ["en", "da", "de", "sv", "nb"]:
    p = os.path.join(ROOT, "src", "locales", f"{lang}.json")
    base = json.load(open(os.path.join(ROOT, "scripts", "i18n", "base", f"{lang}.json")))
    for sec, keys in DROP.items():
        node = base
        parts = sec.split(".")
        for part in parts[:-1]: node = node.get(part, {})
        if keys is None: node.pop(parts[-1], None)
        else:
            for k in keys: node.get(parts[-1], {}).pop(k, None)
    merge(base, json.load(open(os.path.join(ROOT, "scripts", "i18n", f"{lang}.json"))))
    s = json.dumps(base, ensure_ascii=False, indent=2)
    if "igrano" in s or "igräne" in s or "igræne" in s or "igrene" in s or "igrän" in s: print(f"WARN {lang}: migraine word left:", [l.strip()[:90] for l in s.splitlines() if "igr" in l][:8])
    open(p, "w").write(s + "\n")
    print(lang, "ok", len(s))

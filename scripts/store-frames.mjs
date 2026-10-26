// Compose App Store / Play marketing screenshots from the raw captures in store/screenshots/<lang>/.
// Usage: node scripts/store-frames.mjs [lang...]   (run scripts/screenshots.mjs first)
// Output: store/screenshots/<lang>/store-<device>-<n>.png — exact store pixel sizes, no paywall shot.
import { chromium } from "playwright";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const LANGS = process.argv.slice(2).length ? process.argv.slice(2) : ["en", "da", "de", "sv", "nb"];
const DEVICES = { "iphone-6.7": { w: 1290, h: 2796, radius: 150 }, "iphone-6.1": { w: 1179, h: 2556, radius: 140 }, "android": { w: 1080, h: 2400, radius: 110 } };
const SHOTS = ["home", "spike", "calendar", "insights", "patterns", "report"]; // settings/paywall intentionally excluded
const COPY = {
  en: ["One number a day", "One tap when it gets louder", "Your month at a glance", "See your curve over time", "What makes it louder", "A PDF for your doctor"],
  da: ["Ét tal om dagen", "Ét tryk, når den bliver højere", "Din måned på ét blik", "Se din kurve over tid", "Hvad der gør den højere", "En PDF til lægen"],
  de: ["Eine Zahl pro Tag", "Ein Tipp, wenn es lauter wird", "Ihr Monat auf einen Blick", "Ihre Kurve über die Zeit", "Was ihn lauter macht", "Ein PDF für die HNO-Praxis"],
  sv: ["En siffra om dagen", "Ett tryck när den blir starkare", "Din månad på en blick", "Se din kurva över tid", "Vad som gör den starkare", "En PDF till läkaren"],
  nb: ["Ett tall om dagen", "Ett trykk når den blir sterkere", "Måneden din på ett blikk", "Se kurven din over tid", "Hva som gjør den sterkere", "En PDF til legen"],
};
const SUB = { en: "No account. Your diary stays on your phone.", da: "Ingen konto. Din dagbog bliver på din telefon.", de: "Kein Konto. Ihr Tagebuch bleibt auf dem Handy.", sv: "Inget konto. Din dagbok stannar i telefonen.", nb: "Ingen konto. Dagboken din blir på telefonen." };

const html = ({ w, h, radius, title, sub, img, last }) => `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden}
  body{font-family:-apple-system,Inter,"Segoe UI",Roboto,sans-serif;background:linear-gradient(160deg,#3B4B6B 0%,#1E2738 100%);color:#FFF8EC;position:relative}
  .copy{position:absolute;top:${Math.round(h*0.055)}px;left:0;right:0;text-align:center;padding:0 ${Math.round(w*0.08)}px}
  h1{margin:0;font-size:${Math.round(w*0.082)}px;line-height:1.1;font-weight:800;letter-spacing:-0.02em}
  p{margin:${Math.round(w*0.02)}px 0 0;font-size:${Math.round(w*0.036)}px;opacity:.85;font-weight:500}
  .device{position:absolute;left:50%;transform:translateX(-50%);top:${Math.round(h*0.235)}px;width:${Math.round(w*0.80)}px;height:${Math.round(w*0.80*(h/w))}px;border-radius:${radius}px;background:#111;padding:${Math.round(w*0.018)}px;box-sizing:border-box;box-shadow:0 ${Math.round(w*0.05)}px ${Math.round(w*0.12)}px rgba(0,0,0,.35)}
  .device img{width:100%;height:100%;object-fit:cover;object-position:top;border-radius:${radius-Math.round(w*0.018)}px;display:block}
  .mark{position:absolute;right:${Math.round(w*0.06)}px;bottom:${Math.round(h*0.03)}px;width:${Math.round(w*0.10)}px;opacity:.4}
</style></head><body>
  <div class="copy"><h1>${title}</h1><p>${last ? sub : ""}</p></div>
  <div class="device"><img src="${img}"></div>
  <svg class="mark" viewBox="0 0 1024 1024"><g fill="none" stroke="#F2A94B" stroke-linecap="round"><path d="M250 440 C250 255 380 165 495 165 C635 165 720 272 720 400 C720 505 656 552 614 598 C572 645 582 712 528 774 C480 830 388 836 344 780" stroke-width="88"/><path d="M378 438 C378 343 432 293 500 293 C570 293 612 347 606 410 C600 474 536 486 509 530" stroke-width="70"/><path d="M778 322 a130 130 0 0 1 0 184" stroke-width="56"/><path d="M856 248 a230 230 0 0 1 0 332" stroke-width="56" opacity=".7"/></g></svg>
</body></html>`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? "/opt/pw-browsers/chromium" });
for (const lang of LANGS) {
  for (const [device, d] of Object.entries(DEVICES)) {
    const page = await browser.newPage({ viewport: { width: d.w, height: d.h }, deviceScaleFactor: 1 });
    let n = 0;
    for (const [i, shot] of SHOTS.entries()) {
      const src = resolve(`store/screenshots/${lang}/${device}-${i + 1}-${shot}.png`);
      if (!existsSync(src)) { console.warn("missing", src); continue; }
      const img = `data:image/png;base64,${readFileSync(src).toString("base64")}`;
      await page.setContent(html({ ...d, title: COPY[lang][i], sub: SUB[lang], img, last: i === 0 }));
      await page.screenshot({ path: `store/screenshots/${lang}/store-${device}-${++n}.png`, clip: { x: 0, y: 0, width: d.w, height: d.h } });
    }
    await page.close(); console.log(`${lang}/${device}: ${n} store images`);
  }
}
await browser.close();

// Smoke test for the whole chain on web (sql.js). Dev build required (window.__seedDemo exists there).
// Run: RELEASE=0 NODE_ENV=development npx vite build --mode development && (npx vite preview --port 4173 &) && node smoke.mjs
import { chromium } from "playwright";
const SHOTS = process.env.SHOTS ?? "/tmp";
const b = await chromium.launch({ executablePath: process.env.CHROMIUM ?? "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errors = []; const out = {};
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
p.on("dialog", (d) => d.accept());
const shot = (n) => p.screenshot({ path: `${SHOTS}/smoke-${n}.png` });
const clickText = async (sel, text) => { for (const el of await p.$$(sel)) if ((await el.textContent())?.trim().startsWith(text)) { await el.click(); return true; } return false; };
await p.goto("http://localhost:4173/", { waitUntil: "networkidle" }); await p.waitForSelector("h1", { timeout: 15000 });

// 0) Onboarding: language+name → 3 intro → widget → setup (since/side/sound + red flags) → extras → paywall
out.onboardingTitle = await p.textContent("h1");
await p.fill(".onboarding input[autocomplete=given-name]", "Steffen");
await p.click(".onboarding .cta");
for (let i = 0; i < 3; i++) await p.click(".onboarding .cta");
out.widgetStep = (await p.$$(".onboarding .steps li")).length;              // 3
await p.click(".onboarding .cta");
out.setupTitle = await p.textContent("h1");
await p.locator(".onboarding .field").nth(0).locator(".chips button").nth(2).click();   // 1–5 years
await p.locator(".onboarding .field").nth(1).locator(".chips button").nth(1).click();   // right ear
await p.locator(".onboarding .field").nth(2).locator(".chips button").nth(0).click();   // ringing
await p.click(".onboarding button.card"); out.redFlagsInline = (await p.$$(".onboarding ul.plain li")).length; // 8
await p.click(".onboarding .cta");                                              // → extras
await p.click(".onboarding .check input");                                      // want cycle tracking
await p.click(".onboarding .cta");                                              // start
await p.waitForSelector(".sheet h2", { timeout: 5000 });
out.paywallTitle = await p.textContent(".sheet h2");
await p.click(".sheet-close"); await p.waitForTimeout(300);                    // stay FREE first
await p.waitForSelector(".loud-scale");
out.greeting = await p.textContent("h1");

// 1) Daily loudness check-in: save disabled until a number is chosen, then saved summary
out.saveDisabled = await p.$eval(".checkin-card .cta", (e) => e.disabled);
await p.click(".loud-scale button.l4"); await p.locator(".checkin-card .field").nth(0).locator(".scale button").nth(1).click();
out.loudWord = await p.textContent(".loud-w");
await p.click(".checkin-card .cta"); await p.waitForTimeout(300);
out.todayN = await p.textContent(".today-n");                                   // "4"

// 2) Louder now → quick (how loud?) → closes. Live → full → tags + own tag → end → journey (sound first)
await p.click("button.louder");
await p.waitForSelector(".sheet .bigchoice", { timeout: 5000 });
await p.click(".sheet .bigchoice .big.moderate"); await p.waitForTimeout(300);
out.quickClosed = (await p.$(".sheet")) === null;
await p.click("button.louder.live"); await p.waitForSelector(".sheet .cta");
out.liveNoRepeat = (await p.$(".sheet .bigchoice")) === null;
await p.click(".sheet .linklike"); await p.waitForSelector(".sheet input[type=range]");
const chips = await p.$$(".sheet .chip:not(.other)");
await chips[0].click(); await chips[1].click();
await p.click(".sheet .chip.other"); await p.fill(".sheet input[placeholder]", "Leaf blower"); await p.keyboard.press("Enter");
await p.waitForTimeout(300);
out.chipsOn = (await p.$$(".sheet .chip.on")).length;                          // 3
await p.click(".sheet .cta");                                                   // end → journey
await p.waitForSelector(".sheet .bigchips", { timeout: 5000 });
out.journeyQ = await p.textContent(".sheet h3");                                // "How does it sound?"
for (let i = 0; i < 7; i++) { await p.click(".sheet .row.between .row.tight button:last-child"); await p.waitForTimeout(250); }
out.journeyClosed = (await p.$(".sheet")) === null;
out.recentCount = (await p.$$(".list li.tap")).length;                          // 1
await shot("home-free");

// 3) Free gate: Insights locked → mock purchase → Pro
await p.click(".tabbar button:nth-child(3)"); await p.waitForTimeout(300);
out.insightsLocked = await p.textContent(".card strong");
await p.click(".card button"); await p.waitForSelector(".sheet h2");
out.gateReason = await p.textContent(".sheet .muted");
await p.click(".sheet .cta"); await p.waitForTimeout(500);

// 4) Demo data (German – the main market) → Home, calendar, insights, PDF
await p.evaluate(() => window.__seedDemo("de")); await p.waitForTimeout(3000);
await p.waitForSelector("button.louder", { timeout: 15000 });
out.deLouder = await p.textContent("button.louder strong");
out.avg7 = await p.$eval(".stats .stat .n", (e) => e.textContent);
out.sparkPts = (await p.$$(".spark .pt")).length;                              // ~12
out.periodChip = (await p.$(".period-row .chip")) !== null;                    // cycle wish applied after Pro
await p.click(".redflag-link"); await p.waitForSelector(".sheet .card.bad");
out.redFlagsSheet = await p.textContent(".sheet h2"); await p.click(".sheet .cta"); await p.waitForTimeout(200);
await shot("home-de");
await p.click(".tabbar button:nth-child(2)"); await p.waitForSelector(".cal");
out.heatCells = (await p.$$(".cal .day.h1, .cal .day.h2, .cal .day.h3, .cal .day.h4")).length;
out.spikeDots = (await p.$$(".cal .day.spike")).length;
await p.click(".cal .day.spike"); await p.waitForTimeout(200);
out.calDetail = await p.textContent(".screen .card.col strong").catch(() => null);
await shot("calendar-de");
await p.click(".tabbar button:nth-child(3)"); await p.waitForSelector(".bars");
out.bars = (await p.$$(".bars .bar")).length;                                  // 12
out.spark90 = (await p.$$(".spark .pt")).length;                               // ~90
out.freqRows = (await p.$$(".freq .f")).length;
out.learnLines = (await p.$$(".learn p")).length;
out.contrastCards = (await p.textContent(".screen")).includes("Nach guten Nächten");
out.patPressure = (await p.textContent(".screen")).toLowerCase().includes("luftdruck");
await shot("insights-de");
const dl = p.waitForEvent("download", { timeout: 20000 });
await p.click(".report-btn"); await p.waitForSelector(".sheet .cta");
await p.fill(".sheet textarea", "Frage: Hörgerät sinnvoll?");
await p.click(".sheet .cta");
const d = await dl; out.pdfName = d.suggestedFilename();
await d.saveAs(`${SHOTS}/smoke-report.pdf`);

// 5) Settings: plan sheet, widget guide, red flags link, place picker
await p.click(".tabbar button:nth-child(4)"); await p.waitForSelector("h1");
out.settingsTitle = await p.textContent("h1");
out.noMedThreshold = !(await p.textContent(".screen")).includes("Medikamententage");
await p.click(".card.tap"); await p.waitForSelector(".sheet h2"); out.planSheet = await p.textContent(".sheet h2"); await p.click(".sheet-close");
await p.waitForTimeout(200);
await clickText("button.ghost", "Hinzufügen");
await p.waitForSelector(".sheet .steps li", { timeout: 3000 }).catch(() => null);
out.widgetGuideSteps = (await p.$$(".sheet .steps li")).length;               // 3
await p.click(".sheet-close"); await p.waitForTimeout(200);
await clickText("button.ghost", "Ort wählen");
await p.waitForSelector(".sheet input[placeholder]", { timeout: 3000 }).catch(() => null);
out.placeSheet = (await p.$(".sheet input[placeholder]")) !== null;
await p.click(".sheet-close"); await p.waitForTimeout(200);
await shot("settings-de");
out.errors = errors;
console.log(JSON.stringify(out, null, 1));
await b.close();
const ok = errors.length === 0 && out.saveDisabled && out.todayN === "4" && out.quickClosed && out.liveNoRepeat && out.chipsOn === 3 && out.journeyClosed && out.recentCount === 1
  && out.redFlagsInline === 8 && out.bars === 12 && out.freqRows > 0 && out.heatCells > 0 && out.spikeDots > 0 && out.sparkPts > 5 && out.spark90 > 50
  && out.widgetGuideSteps === 3 && out.widgetStep === 3 && out.learnLines > 0 && out.periodChip && out.patPressure && out.placeSheet && out.noMedThreshold && /\.pdf$/.test(out.pdfName ?? "");
process.exit(ok ? 0 : 1);

import { getDb, persist, newId } from "@/core/db";
import { listTags, addMedication, setEpisodeTags, logIntake, setCheckin } from "@/core/diary";
import { localDay } from "@/core/ui";
import { statusFor } from "./config";

/**
 * Demo data for screenshots and smoke tests (dev builds only; wired to window.__seedDemo in main.tsx).
 * Deterministic: same days every run so screenshots are reproducible. 100 days of check-ins where bad nights,
 * stress and loud days the day before nudge loudness up, plus ~12 spikes.
 */
export async function seedDemo() {
  const db = getDb();
  await db.execute(`DELETE FROM episodeTag; DELETE FROM medicationIntake; DELETE FROM episode; DELETE FROM medication; DELETE FROM dailyCheckin; DELETE FROM report; DELETE FROM weatherDay;`);
  const tags = await listTags();
  const byKey = (g: string, k: string) => tags.find((t) => t.groupKey === g && t.key === k)!.id;
  const mel = await addMedication("Melatonin 1 mg", "acute");
  await addMedication("Sound generator", "preventive");

  const now = new Date();
  const spikes = [1, 5, 9, 16, 22, 27, 35, 41, 50, 58, 71, 86];
  const noisy = new Set([4, 15, 21, 34, 49, 70, 85]); // loud day before most spikes
  for (let d = 100; d >= 1; d--) {
    if (d % 11 === 6) continue; // a few missed days, like real life
    const date = localDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - d));
    const sleep = [4, 3, 4, 2, 4, 5, 3][d % 7]!, stress = [2, 3, 2, 4, 3, 1, 2][d % 7]!;
    const noise = noisy.has(d) ? 5 : [1, 2, 1, 2, 3, 1, 2][d % 7]!;
    const drift = d > 60 ? 0.8 : d > 30 ? 0.4 : 0; // slowly getting a bit better
    const loud = Math.max(1, Math.min(10, Math.round(3 + drift + (sleep <= 2 ? 2 : 0) + (stress >= 4 ? 1 : 0) + (noisy.has(d + 1) ? 2 : 0) + (spikes.includes(d) ? 2 : 0))));
    const distress = Math.max(1, Math.min(5, Math.round(loud / 2)));
    await setCheckin(date, statusFor(loud), { loudness: loud, distress, sleep, stress, noise });
  }
  for (const [i, daysAgo] of spikes.entries()) {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo, [22, 7, 18, 23, 13][i % 5]!, 10);
    const end = new Date(start.getTime() + [3, 6, 2, 9, 4][i % 5]! * 36e5);
    const id = newId(); const intensity = [7, 8, 6, 9, 7, 8][i % 6]!;
    await db.run(`INSERT INTO episode(id,kind,startedAt,endedAt,intensity,note,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?)`,
      [id, "spike", start.toISOString(), end.toISOString(), intensity, i === 0 ? "After the concert on Saturday" : null, start.toISOString(), end.toISOString()], false);
    const trig = [["loud_noise", "poor_sleep"], ["stress", "caffeine"], ["quiet_room", "fatigue"], ["concert", "alcohol"], ["headphones"], ["jaw_clench", "stress"]][i % 6]!;
    const sym = [["sleep_trouble", "concentration"], ["hyperacusis"], ["ear_fullness", "irritability"], ["anxiety", "sleep_trouble"]][i % 4]!;
    await setEpisodeTags(id, [...trig.map((k) => byKey("trigger", k)), ...sym.map((k) => byKey("symptom", k)), byKey("sound", i % 3 ? "ringing" : "hissing"), byKey("location", i % 2 ? "left" : "both"), byKey("relief", i % 2 ? "masking" : "nature_sounds")]);
    if (start.getHours() >= 22) await logIntake(mel, id, new Date(start.getTime() + 30 * 6e4).toISOString());
  }
  for (let d = 0; d <= 100; d++) {
    const date = localDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - d));
    const mean = Math.round((1013 + 9 * Math.sin(d / 5) + (spikes.includes(d) && d % 2 ? -6 : 0)) * 10) / 10;
    await db.run(`INSERT INTO weatherDay(id,date,pressureMean,pressureMin,pressureMax,tempMax,updatedAt) VALUES(?,?,?,?,?,?,?)`, [newId(), date, mean, mean - 3, mean + 3, 12, now.toISOString()], false);
  }
  await persist();
}

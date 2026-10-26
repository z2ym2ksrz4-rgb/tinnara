import { useTranslation } from "react-i18next";
import { haptics } from "@/core/ui";

/**
 * The day's loudness, 0–10. Eleven tappable cells with a warm ramp, the chosen value shown big with a word.
 * 0 = not noticeable, 10 = as loud as it ever gets. Words come from loud.level.<0-10 bucket>.
 */
export const loudWord = (v: number) => (v === 0 ? "silent" : v <= 3 ? "low" : v <= 6 ? "noticeable" : v <= 8 ? "loud" : "veryLoud");

export function LoudScale({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  const { t } = useTranslation();
  return (
    <div className="loud">
      <div className="loud-head">
        <span className="loud-n">{value ?? "–"}</span>
        <span className="loud-w">{value == null ? t("loud.pick") : t(`loud.level.${loudWord(value)}`)}</span>
      </div>
      <div className="loud-scale" role="radiogroup" aria-label={t("loud.question")}>
        {Array.from({ length: 11 }, (_, v) => (
          <button key={v} type="button" role="radio" aria-checked={value === v} className={`l${v} ${value === v ? "on" : ""}`}
            onClick={() => { haptics.tap(); onChange(v); }}>{v}</button>
        ))}
      </div>
      <div className="row between small muted"><span>{t("loud.min")}</span><span>{t("loud.max")}</span></div>
    </div>
  );
}

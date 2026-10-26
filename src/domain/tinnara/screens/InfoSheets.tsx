import { useTranslation } from "react-i18next";
import { Capacitor } from "@capacitor/core";
import { Sheet } from "@/core/ui";
import { useUi } from "../store";
import { WidgetPreview } from "../components/WidgetPreview";

/** Explainers opened from several places: when to see a doctor quickly, the loudness scale, air pressure, the widget. */
export function InfoSheets() {
  const { t } = useTranslation();
  const which = useUi((s) => s.infoSheet);
  const openInfo = useUi((s) => s.openInfo);
  const close = () => openInfo(null);
  const ios = Capacitor.getPlatform() !== "android";
  const list = (k: string) => (t(k, { returnObjects: true }) as string[]).map((x, i) => <li key={i}>{x}</li>);

  return (
    <>
      <Sheet open={which === "redFlags"} onClose={close} title={t("redFlags.title")}>
        <p>{t("redFlags.intro")}</p>
        <div className="card bad col"><strong>{t("redFlags.urgentTitle")}</strong><ul className="plain">{list("redFlags.urgent")}</ul></div>
        <div className="card warn col"><strong>{t("redFlags.soonTitle")}</strong><ul className="plain">{list("redFlags.soon")}</ul></div>
        <p className="muted small">{t("redFlags.routine")}</p>
        <p className="disclaimer">{t("redFlags.disclaimer")}</p>
        <button className="cta" onClick={close}>{t("common.done")}</button>
      </Sheet>

      <Sheet open={which === "loudness"} onClose={close} title={t("loud.infoTitle")}>
        <p>{t("loud.infoWhat")}</p>
        <ul className="plain">{list("loud.infoScale")}</ul>
        <p className="muted small">{t("loud.infoTip")}</p>
        <button className="cta" onClick={close}>{t("common.done")}</button>
      </Sheet>

      <Sheet open={which === "pressure"} onClose={close} title={t("weather.infoTitle")}>
        <p>{t("weather.infoWhat")}</p>
        <p>{t("weather.infoWhy")}</p>
        <p>{t("weather.infoApp")}</p>
        <p className="disclaimer">{t("weather.infoDisclaimer")}</p>
        <button className="cta" onClick={close}>{t("common.done")}</button>
      </Sheet>

      <Sheet open={which === "widget"} onClose={close} title={t("widget.title")}>
        <WidgetPreview />
        <p className="muted">{t("widget.intro")}</p>
        <ol className="steps">{list(ios ? "widget.stepsIos" : "widget.stepsAndroid")}</ol>
        {ios && <p className="muted small">{t("widget.lockscreen")}</p>}
        <button className="cta" onClick={close}>{t("common.done")}</button>
      </Sheet>
    </>
  );
}

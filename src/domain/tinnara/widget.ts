import { Capacitor } from "@capacitor/core";
import type { TFunction } from "i18next";
import appConfig from "../../../app.config.json";

/**
 * Snapshot the home-screen / lock-screen widgets render. Strings are pre-localised here so the native side stays dumb.
 * Published after every Home load (cheap: one JSON write into the app group).
 */
export async function publishWidget(d: { open: boolean; today: number | null; avg7: number | null; spikes: number; t: TFunction; lang: string }) {
  if (Capacitor.getPlatform() !== "ios") return;
  try {
    const { WidgetBridge } = await import("widget-bridge");
    const f1 = (n: number) => n.toLocaleString(d.lang, { maximumFractionDigits: 1 });
    const data = {
      cta: d.open ? d.t("widget.openSpike") : d.t("widget.louderNow"),
      open: d.open,
      line1: d.open ? d.t("widget.ongoing") : d.today == null ? d.t("widget.notLogged") : d.t("widget.today", { n: d.today }),
      line2: `${d.avg7 != null ? d.t("widget.avg7", { n: f1(d.avg7) }) : d.t("widget.noData")} · ${d.t("widget.spikes", { count: d.spikes })}`,
      url: d.open ? "tinnara://episode/open" : "tinnara://episode/new",
      updatedAt: new Date().toISOString(),
    };
    await WidgetBridge.setData({ json: JSON.stringify(data), group: `group.${appConfig.appId}`, widgetClass: `${appConfig.appId}.AttackWidget` });
  } catch (e) { console.warn("[widget] publish failed", e); }
}

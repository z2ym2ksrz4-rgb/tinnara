import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
    const list = (k) => t(k, { returnObjects: true }).map((x, i) => _jsx("li", { children: x }, i));
    return (_jsxs(_Fragment, { children: [_jsxs(Sheet, { open: which === "redFlags", onClose: close, title: t("redFlags.title"), children: [_jsx("p", { children: t("redFlags.intro") }), _jsxs("div", { className: "card bad col", children: [_jsx("strong", { children: t("redFlags.urgentTitle") }), _jsx("ul", { className: "plain", children: list("redFlags.urgent") })] }), _jsxs("div", { className: "card warn col", children: [_jsx("strong", { children: t("redFlags.soonTitle") }), _jsx("ul", { className: "plain", children: list("redFlags.soon") })] }), _jsx("p", { className: "muted small", children: t("redFlags.routine") }), _jsx("p", { className: "disclaimer", children: t("redFlags.disclaimer") }), _jsx("button", { className: "cta", onClick: close, children: t("common.done") })] }), _jsxs(Sheet, { open: which === "loudness", onClose: close, title: t("loud.infoTitle"), children: [_jsx("p", { children: t("loud.infoWhat") }), _jsx("ul", { className: "plain", children: list("loud.infoScale") }), _jsx("p", { className: "muted small", children: t("loud.infoTip") }), _jsx("button", { className: "cta", onClick: close, children: t("common.done") })] }), _jsxs(Sheet, { open: which === "pressure", onClose: close, title: t("weather.infoTitle"), children: [_jsx("p", { children: t("weather.infoWhat") }), _jsx("p", { children: t("weather.infoWhy") }), _jsx("p", { children: t("weather.infoApp") }), _jsx("p", { className: "disclaimer", children: t("weather.infoDisclaimer") }), _jsx("button", { className: "cta", onClick: close, children: t("common.done") })] }), _jsxs(Sheet, { open: which === "widget", onClose: close, title: t("widget.title"), children: [_jsx(WidgetPreview, {}), _jsx("p", { className: "muted", children: t("widget.intro") }), _jsx("ol", { className: "steps", children: list(ios ? "widget.stepsIos" : "widget.stepsAndroid") }), ios && _jsx("p", { className: "muted small", children: t("widget.lockscreen") }), _jsx("button", { className: "cta", onClick: close, children: t("common.done") })] })] }));
}

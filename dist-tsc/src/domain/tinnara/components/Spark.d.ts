/**
 * Small inline line chart for daily loudness: points per logged day, a 7-day rolling mean as the line.
 * Days without a value leave a gap in the dots but the rolling mean bridges them. Pure SVG, theme-aware via CSS vars.
 */
export declare function Spark({ data, days, height, showAxis, lang }: {
    data: {
        date: string;
        v: number;
    }[];
    days: number;
    height?: number;
    showAxis?: boolean;
    lang: string;
}): import("react").JSX.Element;

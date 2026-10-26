/**
 * The tone mark from the app icon: a dot (the ear canal) and a high-pitched wave growing out of it.
 * Used on the "Louder now" button and the widget preview.
 */
const pts = Array.from({ length: 61 }, (_, i) => {
  const x = 22 + i * 1.25, amp = 2 + i * 0.32;
  return `${x.toFixed(1)},${(50 + amp * Math.sin(i / 2.2)).toFixed(1)}`;
}).join(" ");

export function WaveMark({ size = 48, color = "currentColor", core = "var(--accent)" }: { size?: number; color?: string; core?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" fill="none">
      <circle cx="16" cy="50" r="9" fill={core} />
      <polyline points={pts} stroke={color} strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

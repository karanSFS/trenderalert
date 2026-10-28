import { PREVIEW_TRENDS } from "@/content/landing";
import { PreviewTrendCard } from "./PreviewTrendCard";
import styles from "./HeroRadar.module.css";

const SIGNALS = [
  { label: "Spark", x: 26, y: 30, size: "sm" },
  { label: "Rising", x: 70, y: 24, size: "md" },
  { label: "Hot", x: 62, y: 62, size: "lg" },
  { label: "Rising", x: 30, y: 70, size: "md" },
  { label: "Spark", x: 82, y: 46, size: "sm" },
] as const;

const featured = PREVIEW_TRENDS.find((trend) => trend.id === "pv-03") ?? PREVIEW_TRENDS[0];

/** Decorative radar artwork with one illustrative Trend Card. */
export function HeroRadar() {
  return (
    <figure className={styles.figure} aria-label="Illustrative example of the TrenderAlert Radar">
      <div className={styles.radar} aria-hidden="true">
        <span className={`${styles.ring} ${styles.ring1}`} />
        <span className={`${styles.ring} ${styles.ring2}`} />
        <span className={`${styles.ring} ${styles.ring3}`} />
        <span className={`${styles.ring} ${styles.ring4}`} />
        <span className={styles.sweep} />
        <span className={styles.center}>
          <span className={styles.centerDot} />
        </span>
        {SIGNALS.map((signal, index) => (
          <span
            key={index}
            className={`${styles.signal} ${styles[signal.size]}`}
            style={{ left: `${signal.x}%`, top: `${signal.y}%` }}
          >
            <span className={styles.signalLabel}>{signal.label}</span>
          </span>
        ))}
      </div>
      <div className={styles.card}>
        <PreviewTrendCard trend={featured} headingAs="p" compact />
      </div>
      <figcaption className={styles.caption}>Illustrative example. Not live data.</figcaption>
    </figure>
  );
}

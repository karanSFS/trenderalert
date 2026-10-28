import {
  EnvironmentOutlined,
  FieldTimeOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  ThunderboltOutlined,
} from "./icons";
import type { LifecycleStage, PreviewTrend } from "@/content/landing";
import styles from "./PreviewTrendCard.module.css";

const stageClass: Record<LifecycleStage, string> = {
  Spark: styles.stageSpark,
  Rising: styles.stageRising,
  Hot: styles.stageHot,
  Peaking: styles.stagePeaking,
  Cooling: styles.stageCooling,
};

interface PreviewTrendCardProps {
  trend: PreviewTrend;
  /** Use "p" when the card sits inside decorative artwork without its own section heading. */
  headingAs?: "h3" | "p";
  compact?: boolean;
}

export function PreviewTrendCard({
  trend,
  headingAs = "h3",
  compact = false,
}: PreviewTrendCardProps) {
  const Heading = headingAs;
  return (
    <article className={`${styles.card} ${compact ? styles.compact : ""}`}>
      <div className={styles.topRow}>
        <span className={`${styles.stage} ${stageClass[trend.stage]}`}>
          <span className={styles.stageDot} aria-hidden="true" />
          {trend.stage}
        </span>
        <span className={styles.score} aria-label={`TrendScore ${trend.trendScore} out of 100`}>
          <ThunderboltOutlined aria-hidden="true" /> {trend.trendScore}
        </span>
      </div>

      {compact ? null : (
        <div className={styles.media} aria-hidden="true">
          {trend.media === "Video" ? <PlayCircleOutlined /> : <PictureOutlined />}
          <span>{trend.media}</span>
        </div>
      )}

      <Heading className={styles.topic}>{trend.topic}</Heading>
      {compact ? null : <p className={styles.caption}>{trend.caption}</p>}

      <div className={styles.meter} aria-hidden="true">
        <span style={{ width: `${trend.trendScore}%` }} />
      </div>

      <p className={styles.reason}>{trend.reason}</p>

      <ul className={styles.meta}>
        <li>
          <EnvironmentOutlined aria-hidden="true" />
          {trend.location}
        </li>
        <li>
          <FieldTimeOutlined aria-hidden="true" />
          {trend.timeLeft}
        </li>
      </ul>

      <div className={styles.footer}>
        <span>
          Origin <strong>{trend.originCredit}</strong>
        </span>
        {compact ? null : <span>{trend.activity}</span>}
      </div>
    </article>
  );
}

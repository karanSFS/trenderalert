import type { ReactNode } from "react";
import styles from "./section.module.css";

interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "start" | "center";
}

/** Heading block shared by every landing-page section. `id` labels the parent section. */
export function SectionHeading({ id, eyebrow, title, lead, align = "start" }: SectionHeadingProps) {
  return (
    <div className={`${styles.heading} ${align === "center" ? styles.headingCenter : ""}`}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      {lead ? <p className={styles.lead}>{lead}</p> : null}
    </div>
  );
}

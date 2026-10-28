import Link from "next/link";
import { APP_OPENING_LINE } from "@/lib/constants/app";
import styles from "./landing.module.css";

export function HeroSection() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.heroInner}>
        <p className={styles.eyebrow}>{APP_OPENING_LINE}</p>
        <h1 id="hero-title" className={styles.heroTitle}>
          Discover What&apos;s Trending. <span>Understand Why It Matters.</span>
        </h1>
        <p className={styles.heroText}>
          TrenderAlert helps people spot rising trends early, see how topics develop across
          locations and communities, and give lasting credit to the people who start them.
        </p>
        <div className={styles.heroActions}>
          <Link href="/support" className={styles.ctaPrimary}>
            Contact us
          </Link>
          <Link href="/privacy" className={styles.ctaSecondary}>
            How we handle privacy
          </Link>
        </div>
      </div>
    </section>
  );
}

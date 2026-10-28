import { ArrowRightOutlined } from "./icons";
import Link from "next/link";
import { APP_OPENING_LINE } from "@/lib/constants/app";
import { HeroRadar } from "./HeroRadar";
import styles from "./landing.module.css";

export function HeroSection() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{APP_OPENING_LINE}</p>
          <h1 id="hero-title" className={styles.heroTitle}>
            Discover What&apos;s Trending. <span>Understand Why It Matters.</span>
          </h1>
          <p className={styles.heroText}>
            TrenderAlert helps people spot rising trends early, see how topics develop across
            locations and communities, and give lasting credit to the people who start them.
          </p>
          <div className={styles.heroActions}>
            <Link href="#product" className={styles.ctaPrimary}>
              Explore What&apos;s Next <ArrowRightOutlined aria-hidden="true" />
            </Link>
            <Link href="#how-it-works" className={styles.ctaSecondary}>
              How it works
            </Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <HeroRadar />
        </div>
      </div>
    </section>
  );
}

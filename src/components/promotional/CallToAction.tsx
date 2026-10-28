import { ArrowRightOutlined } from "./icons";
import Link from "next/link";
import { APP_OPENING_LINE } from "@/lib/constants/app";
import { CONTACT_PATH } from "@/lib/constants/publicSite";
import { AppAvailability } from "./AppAvailability";
import styles from "./CallToAction.module.css";

export function CallToAction() {
  return (
    <section className={styles.section} aria-labelledby="cta-title">
      <div className={styles.panel}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{APP_OPENING_LINE}</p>
          <h2 id="cta-title" className={styles.title}>
            Discover rising trends, join what&apos;s next, and connect with people who share your
            interests.
          </h2>
          <AppAvailability />
        </div>
        <div className={styles.actions}>
          <Link href={CONTACT_PATH} className={styles.primary}>
            Contact us <ArrowRightOutlined aria-hidden="true" />
          </Link>
          <Link href="#features" className={styles.secondary}>
            Explore features
          </Link>
        </div>
      </div>
    </section>
  );
}

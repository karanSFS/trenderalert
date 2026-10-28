import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import styles from "./status-page.module.css";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className={styles.page}>
      <Link href="/" aria-label="TrenderAlert home" className={styles.logo}>
        <BrandLogo />
      </Link>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>This page isn&apos;t trending anywhere.</h1>
      <p className={styles.text}>The address may be mistyped, or the page has moved.</p>
      <div className={styles.actions}>
        <Link href="/" className={styles.primary}>
          Go to homepage
        </Link>
        <Link href="/support" className={styles.secondary}>
          Get support
        </Link>
      </div>
    </main>
  );
}

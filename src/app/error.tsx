"use client";

import Link from "next/link";
import { useEffect } from "react";
import styles from "./status-page.module.css";

export default function AppError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className={styles.page} role="alert">
      <p className={styles.code}>ERROR</p>
      <h1 className={styles.title}>Something went wrong.</h1>
      <p className={styles.text}>The page could not be displayed. Please try again.</p>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={() => retry()}>
          Try again
        </button>
        <Link href="/" className={styles.secondary}>
          Go to homepage
        </Link>
      </div>
    </main>
  );
}

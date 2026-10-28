import type { Metadata } from "next";
import { PlaceholderNotice } from "@/components/promotional/PlaceholderNotice";
import styles from "@/components/promotional/public.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How TrenderAlert approaches privacy. Placeholder pending approved policy text.",
};

export default function PrivacyPage() {
  return (
    <article className={styles.article}>
      <h1>Privacy Policy</h1>
      <p className={styles.lede}>
        This page will describe what information TrenderAlert collects, why, and the choices you
        have.
      </p>
      <PlaceholderNotice subject="privacy policy" />
      <h2>Sections to be completed</h2>
      <ul>
        <li>Information we collect and how it is used</li>
        <li>Location information and approximate-area behavior</li>
        <li>Content visibility, sharing and expiration controls</li>
        <li>Account deletion and data retention</li>
        <li>Children and age requirements</li>
        <li>Contacting us about privacy</li>
      </ul>
    </article>
  );
}

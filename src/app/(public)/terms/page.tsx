import type { Metadata } from "next";
import { PlaceholderNotice } from "@/components/promotional/PlaceholderNotice";
import styles from "@/components/promotional/public.module.css";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "TrenderAlert terms of service. Placeholder pending approved legal text.",
};

export default function TermsPage() {
  return (
    <article className={styles.article}>
      <h1>Terms of Service</h1>
      <p className={styles.lede}>
        This page will contain the terms that govern use of TrenderAlert.
      </p>
      <PlaceholderNotice subject="terms of service" />
      <h2>Sections to be completed</h2>
      <ul>
        <li>Eligibility and accounts</li>
        <li>Community rules and content ownership</li>
        <li>Subscriptions and billing</li>
        <li>Contests and official rules</li>
        <li>Reporting, enforcement and appeals</li>
        <li>Changes to these terms</li>
      </ul>
    </article>
  );
}

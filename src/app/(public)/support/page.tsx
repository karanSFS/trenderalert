import type { Metadata } from "next";
import { PlaceholderNotice } from "@/components/promotional/PlaceholderNotice";
import styles from "@/components/promotional/public.module.css";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with TrenderAlert. Placeholder pending approved support details.",
};

export default function SupportPage() {
  return (
    <article className={styles.article}>
      <h1>Support</h1>
      <p className={styles.lede}>
        Find help with your account, content, safety reports and subscriptions.
      </p>
      <PlaceholderNotice subject="support contact information" />
      <h2>Planned help topics</h2>
      <ul>
        <li>Signing in with any email provider and recovering your password</li>
        <li>Creating Trends and Profile Posts</li>
        <li>Reporting content and blocking accounts</li>
        <li>Appealing a moderation decision</li>
        <li>Managing a subscription through the app store</li>
      </ul>
    </article>
  );
}

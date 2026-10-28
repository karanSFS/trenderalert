import styles from "./public.module.css";

/** Marks public copy that still needs approved legal or support content. */
export function PlaceholderNotice({ subject }: { subject: string }) {
  return (
    <div className={styles.placeholderNotice} role="note">
      <strong>Placeholder content.</strong> The approved {subject} has not been supplied yet. This
      page only outlines the expected sections and must be replaced before launch.
    </div>
  );
}

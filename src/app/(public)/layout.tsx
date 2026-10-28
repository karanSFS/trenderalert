import { PublicFooter } from "@/components/promotional/PublicFooter";
import { PublicHeader } from "@/components/promotional/PublicHeader";
import styles from "@/components/promotional/public.module.css";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a className="ta-skip-link" href="#main-content">
        Skip to content
      </a>
      <PublicHeader />
      <main id="main-content" className={styles.main}>
        {children}
      </main>
      <PublicFooter />
    </>
  );
}

import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { APP_OPENING_LINE } from "@/lib/constants/app";
import { PUBLIC_FOOTER_LINKS } from "./publicNav";
import styles from "./public.module.css";

export function PublicFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div>
          <BrandLogo tone="onDark" />
          <p className={styles.footerTagline}>{APP_OPENING_LINE}</p>
        </div>
        <nav aria-label="Footer">
          <ul className={styles.footerLinks}>
            {PUBLIC_FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.footerLink}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.footerMeta}>
          <span>© 2026 TrenderAlert. All rights reserved.</span>
          <Link href="/admin/login">Admin portal (demo)</Link>
        </div>
      </div>
    </footer>
  );
}

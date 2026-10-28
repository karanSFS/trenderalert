import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { APP_OPENING_LINE } from "@/lib/constants/app";
import { PUBLIC_FOOTER_LINKS, PUBLIC_FOOTER_PRODUCT_LINKS, type PublicNavLink } from "./publicNav";
import styles from "./public.module.css";

function FooterColumn({ id, title, links }: { id: string; title: string; links: PublicNavLink[] }) {
  return (
    <nav aria-labelledby={id} className={styles.footerColumn}>
      <h2 id={id} className={styles.footerHeading}>
        {title}
      </h2>
      <ul className={styles.footerLinks}>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={styles.footerLink}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function PublicFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerBrand}>
          <BrandLogo tone="onDark" />
          <p className={styles.footerTagline}>{APP_OPENING_LINE}</p>
        </div>
        <div className={styles.footerColumns}>
          <FooterColumn id="footer-product" title="Product" links={PUBLIC_FOOTER_PRODUCT_LINKS} />
          <FooterColumn id="footer-legal" title="Legal and help" links={PUBLIC_FOOTER_LINKS} />
        </div>
        <div className={styles.footerMeta}>
          <span>© 2026 TrenderAlert. All rights reserved.</span>
          <Link href="/admin/login">Admin portal (demo)</Link>
        </div>
      </div>
    </footer>
  );
}

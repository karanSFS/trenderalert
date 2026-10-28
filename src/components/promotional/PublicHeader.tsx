import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { PublicMobileNav } from "./PublicMobileNav";
import { PUBLIC_NAV_LINKS } from "./publicNav";
import styles from "./public.module.css";

export function PublicHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.brandLink} aria-label="TrenderAlert home">
          <BrandLogo />
        </Link>
        <nav className={styles.nav} aria-label="Main">
          <ul className={styles.navList}>
            {PUBLIC_NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.navLink}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.headerActions}>
          <ThemeSwitcher />
          <Link href="/support" className={styles.primaryCta}>
            Contact us
          </Link>
          <div className={styles.mobileOnly}>
            <PublicMobileNav links={PUBLIC_NAV_LINKS} />
          </div>
        </div>
      </div>
    </header>
  );
}

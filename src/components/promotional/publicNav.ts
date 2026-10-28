export interface PublicNavLink {
  label: string;
  href: string;
}

export const PUBLIC_NAV_LINKS: PublicNavLink[] = [
  { label: "Product", href: "/#product" },
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Privacy", href: "/#privacy" },
  { label: "Support", href: "/support" },
];

export const PUBLIC_FOOTER_PRODUCT_LINKS: PublicNavLink[] = [
  { label: "Product preview", href: "/#product" },
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Privacy and trust", href: "/#privacy" },
];

export const PUBLIC_FOOTER_LINKS: PublicNavLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Support", href: "/support" },
];

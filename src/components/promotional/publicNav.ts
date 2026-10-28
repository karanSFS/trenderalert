export interface PublicNavLink {
  label: string;
  href: string;
}

export const PUBLIC_NAV_LINKS: PublicNavLink[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Support", href: "/support" },
];

export const PUBLIC_FOOTER_LINKS: PublicNavLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Support", href: "/support" },
];

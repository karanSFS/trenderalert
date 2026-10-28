import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  FlagOutlined,
  LockOutlined,
  SafetyOutlined,
  TeamOutlined,
} from "./icons";
import Link from "next/link";
import type { ReactNode } from "react";
import { TRUST_POINTS, type TrustIcon } from "@/content/landing";
import { PRIVACY_PATH } from "@/lib/constants/publicSite";
import { SectionHeading } from "./SectionHeading";
import section from "./section.module.css";
import styles from "./PrivacyTrustSection.module.css";

const icons: Record<TrustIcon, ReactNode> = {
  location: <EnvironmentOutlined />,
  audience: <TeamOutlined />,
  expiry: <ClockCircleOutlined />,
  report: <FlagOutlined />,
  permissions: <LockOutlined />,
  honest: <SafetyOutlined />,
};

export function PrivacyTrustSection() {
  return (
    <section
      id="privacy"
      className={`${section.section} ${section.sectionMuted}`}
      aria-labelledby="privacy-title"
    >
      <div className={section.container}>
        <SectionHeading
          id="privacy-title"
          eyebrow="Privacy and trust"
          title="Discovery that respects people"
          lead="TrenderAlert is built for shared interests, activities and communities. It is not a dating app, and it is designed to keep you in control of what you share."
        />
        <ul className={section.grid}>
          {TRUST_POINTS.map((point) => (
            <li key={point.title} className={section.tile}>
              <span className={`${section.tileIcon} ${section.tileIconOutline}`} aria-hidden="true">
                {icons[point.icon]}
              </span>
              <h3 className={section.tileTitle}>{point.title}</h3>
              <p className={section.tileText}>{point.description}</p>
            </li>
          ))}
        </ul>
        <p className={styles.policyNote}>
          The full details will be in our <Link href={PRIVACY_PATH}>Privacy Policy</Link>, which is
          being finalized.
        </p>
      </div>
    </section>
  );
}

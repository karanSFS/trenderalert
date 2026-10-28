import {
  BellOutlined,
  CommentOutlined,
  DashboardOutlined,
  FlagOutlined,
  NodeIndexOutlined,
  RadarChartOutlined,
} from "./icons";
import type { ReactNode } from "react";
import { LANDING_FEATURES, type FeatureIcon } from "@/content/landing";
import { SectionHeading } from "./SectionHeading";
import section from "./section.module.css";

const icons: Record<FeatureIcon, ReactNode> = {
  radar: <RadarChartOutlined />,
  first: <FlagOutlined />,
  score: <DashboardOutlined />,
  journey: <NodeIndexOutlined />,
  alerts: <BellOutlined />,
  rooms: <CommentOutlined />,
};

export function FeatureSection() {
  return (
    <section
      id="features"
      className={`${section.section} ${section.sectionMuted}`}
      aria-labelledby="features-title"
    >
      <div className={section.container}>
        <SectionHeading
          id="features-title"
          eyebrow="Features"
          title="See it first. Get credit for it."
          lead="TrenderAlert is built around early discovery, origin credit and momentum you can understand."
        />
        <ul className={section.grid}>
          {LANDING_FEATURES.map((feature) => (
            <li key={feature.title} className={section.tile}>
              <span className={section.tileIcon} aria-hidden="true">
                {icons[feature.icon]}
              </span>
              <h3 className={section.tileTitle}>{feature.title}</h3>
              <p className={section.tileText}>{feature.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

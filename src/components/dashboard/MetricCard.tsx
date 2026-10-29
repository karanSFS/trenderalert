"use client";

import { ArrowDownOutlined, ArrowRightOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Skeleton } from "antd";
import Link from "next/link";
import type { ReactNode } from "react";
import styled, { css } from "styled-components";
import { DemoDataTag } from "@/components/ui/DemoDataTag";
import { useDelayedFlag } from "@/lib/hooks/useDelayedFlag";
import { formatSignedPercent } from "@/lib/formatters/number";

export interface MetricChange {
  /** Ratio, e.g. 0.052 for +5.2%. */
  value: number;
  /** Comparison period, e.g. "vs previous 7 days". */
  label: string;
  /** Set false for metrics where a decrease is good (e.g. pending cases). */
  higherIsBetter?: boolean;
}

interface MetricCardProps {
  label: string;
  /** Already formatted, e.g. "12,840" or "$48.2K". */
  value: ReactNode;
  change?: MetricChange;
  helper?: ReactNode;
  icon?: ReactNode;
  /** Makes the whole card a link to the related admin page. */
  href?: string;
  loading?: boolean;
  /** Shows the "Demo data" tag for figures that are not from the backend. */
  demo?: boolean;
}

type Tone = "good" | "bad" | "neutral";

const cardStyles = css`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space(2)};
  min-height: 132px;
  padding: ${({ theme }) => theme.space(5)};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.card};
  box-shadow: ${({ theme }) => theme.shadows.card};
  color: inherit;
  text-decoration: none;
`;

const Card = styled.div`
  ${cardStyles}
`;

const LinkCard = styled(Link)`
  ${cardStyles}
  transition: border-color var(--ta-transition-fast);

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }

  &:hover .ta-metric-go {
    opacity: 1;
  }
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space(2)};
`;

const Label = styled.span`
  font-size: ${({ theme }) => theme.font.sizeSm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const IconBox = styled.span`
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.primarySoft};
`;

const Value = styled.div`
  font-size: 28px;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-variant-numeric: tabular-nums;
`;

const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.space(2)};
  margin-top: auto;
  font-size: ${({ theme }) => theme.font.sizeSm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Change = styled.span<{ $tone: Tone }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 650;
  color: ${({ $tone, theme }) =>
    $tone === "good"
      ? theme.colors.success
      : $tone === "bad"
        ? theme.colors.error
        : theme.colors.textSecondary};
`;

const Go = styled(ArrowRightOutlined)`
  margin-left: auto;
  opacity: 0.4;
  transition: opacity var(--ta-transition-fast);
`;

function toneFor(change: MetricChange): Tone {
  if (change.value === 0) return "neutral";
  const up = change.value > 0;
  return up === (change.higherIsBetter ?? true) ? "good" : "bad";
}

export function MetricCard({
  label,
  value,
  change,
  helper,
  icon,
  href,
  loading = false,
  demo = false,
}: MetricCardProps) {
  const showSkeleton = useDelayedFlag(loading);

  if (loading) {
    return (
      <Card aria-busy="true">
        <span className="ta-visually-hidden">Loading {label}</span>
        {showSkeleton ? (
          <Skeleton
            active
            title={{ width: "45%" }}
            paragraph={{ rows: 2, width: ["60%", "35%"] }}
          />
        ) : null}
      </Card>
    );
  }

  const content = (
    <>
      <Top>
        <Label>{label}</Label>
        {icon ? <IconBox aria-hidden="true">{icon}</IconBox> : demo ? <DemoDataTag /> : null}
      </Top>
      <Value>{value}</Value>
      <Footer>
        {change ? (
          <Change $tone={toneFor(change)}>
            {change.value > 0 ? (
              <ArrowUpOutlined aria-hidden="true" />
            ) : change.value < 0 ? (
              <ArrowDownOutlined aria-hidden="true" />
            ) : null}
            {formatSignedPercent(change.value)}
          </Change>
        ) : null}
        {change ? <span>{change.label}</span> : null}
        {helper ? <span>{helper}</span> : null}
        {icon && demo ? <DemoDataTag /> : null}
        {href ? <Go className="ta-metric-go" aria-hidden="true" /> : null}
      </Footer>
    </>
  );

  return href ? <LinkCard href={href}>{content}</LinkCard> : <Card>{content}</Card>;
}

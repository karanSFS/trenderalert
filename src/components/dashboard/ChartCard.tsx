"use client";

import { Skeleton } from "antd";
import type { ReactNode } from "react";
import styled from "styled-components";
import { DemoDataTag } from "@/components/ui/DemoDataTag";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useDelayedFlag } from "@/lib/hooks/useDelayedFlag";
import type { AsyncStatus, ServiceError } from "@/types/api";

interface ChartCardProps {
  title: string;
  subtitle?: ReactNode;
  /** Header controls, e.g. a range switcher. */
  extra?: ReactNode;
  status: AsyncStatus;
  error?: ServiceError | null;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyDescription?: ReactNode;
  /** Chart area height in px; also the minimum height of every state. */
  height?: number;
  demo?: boolean;
  /** Short text alternative describing what the chart shows. */
  summary?: string;
  children?: ReactNode;
}

const Card = styled.section`
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: ${({ theme }) => theme.space(5)};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.card};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const Header = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space(3)};
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

const Titles = styled.div`
  min-width: 0;

  h2 {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.space(2)};
    margin: 0;
    font-size: ${({ theme }) => theme.font.sizeLg};
    font-weight: 650;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  p {
    margin: 2px 0 0;
    font-size: ${({ theme }) => theme.font.sizeSm};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Body = styled.div<{ $height: number }>`
  position: relative;
  min-height: ${({ $height }) => $height}px;
  height: ${({ $height }) => $height}px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  > * {
    flex: 1;
    min-width: 0;
  }

  .ant-skeleton.ant-skeleton-element,
  .ant-skeleton-node {
    width: 100% !important;
    height: 100% !important;
  }
`;

export function ChartCard({
  title,
  subtitle,
  extra,
  status,
  error,
  onRetry,
  isEmpty = false,
  emptyDescription = "There is no data for the selected period.",
  height = 280,
  demo = true,
  summary,
  children,
}: ChartCardProps) {
  const loading = status === "loading" || status === "idle";
  const showSkeleton = useDelayedFlag(loading);

  let body: ReactNode;
  if (loading) body = showSkeleton ? <Skeleton.Node active /> : null;
  else if (status === "failed")
    body = (
      <ErrorState
        compact
        title="Chart could not be loaded"
        message={error?.message}
        onRetry={onRetry}
      />
    );
  else if (isEmpty) body = <EmptyState compact title="No data" description={emptyDescription} />;
  else body = children;

  return (
    <Card aria-label={title} aria-busy={loading}>
      <Header>
        <Titles>
          <h2>
            {title}
            {demo ? <DemoDataTag /> : null}
          </h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </Titles>
        {extra}
      </Header>
      <Body $height={height}>{body}</Body>
      {summary && status === "succeeded" && !isEmpty ? (
        <p className="ta-visually-hidden">{summary}</p>
      ) : null}
    </Card>
  );
}

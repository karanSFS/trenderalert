"use client";

import { ArrowRightOutlined } from "@ant-design/icons";
import { Skeleton } from "antd";
import Link from "next/link";
import type { ReactNode } from "react";
import styled from "styled-components";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDelayedFlag } from "@/lib/hooks/useDelayedFlag";

const Card = styled.section`
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 260px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.card};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space(2)};
  padding: ${({ theme }) => theme.space(4)} ${({ theme }) => theme.space(5)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  h2 {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.space(2)};
    margin: 0;
    font-size: ${({ theme }) => theme.font.sizeBase};
    font-weight: 650;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  a {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: ${({ theme }) => theme.font.sizeSm};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.accentText};
    text-decoration: none;
    white-space: nowrap;
  }
`;

const Body = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.space(2)} ${({ theme }) => theme.space(5)}
    ${({ theme }) => theme.space(4)};
`;

const SkeletonBody = styled.div`
  padding: ${({ theme }) => theme.space(4)} ${({ theme }) => theme.space(5)};
`;

interface PanelProps {
  title: string;
  /** Badge or tag beside the title, e.g. "Simulated status". */
  badge?: ReactNode;
  viewAllHref?: string;
  viewAllLabel?: string;
  loading?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  children?: ReactNode;
}

/** Card shell shared by the dashboard's operational panels. */
export function Panel({
  title,
  badge,
  viewAllHref,
  viewAllLabel = "View all",
  loading = false,
  isEmpty = false,
  emptyTitle = "Nothing here",
  emptyDescription,
  children,
}: PanelProps) {
  const showSkeleton = useDelayedFlag(loading);

  let body: ReactNode;
  if (loading)
    body = (
      <SkeletonBody>
        {showSkeleton ? <Skeleton active paragraph={{ rows: 5 }} title={false} /> : null}
      </SkeletonBody>
    );
  else if (isEmpty) body = <EmptyState compact title={emptyTitle} description={emptyDescription} />;
  else body = <Body>{children}</Body>;

  return (
    <Card aria-label={title} aria-busy={loading}>
      <Header>
        <h2>
          {title}
          {badge}
        </h2>
        {viewAllHref && !loading ? (
          <Link href={viewAllHref}>
            {viewAllLabel} <ArrowRightOutlined aria-hidden="true" />
          </Link>
        ) : null}
      </Header>
      {body}
    </Card>
  );
}

/** Row list used inside panels. Rows with `href` are links. */
export const PanelList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  > li + li {
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

export const PanelRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space(3)};
  padding: ${({ theme }) => theme.space(3)} 0;
  color: inherit;
  text-decoration: none;

  &[href] {
    margin: 0 calc(-1 * ${({ theme }) => theme.space(2)});
    padding-left: ${({ theme }) => theme.space(2)};
    padding-right: ${({ theme }) => theme.space(2)};
    border-radius: 6px;
    transition: background-color var(--ta-transition-fast);
  }

  &[href]:hover {
    background: ${({ theme }) => theme.colors.surfaceMuted};
  }
`;

export const RowMain = styled.div`
  min-width: 0;

  strong {
    display: block;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  span {
    display: block;
    margin-top: 2px;
    font-size: ${({ theme }) => theme.font.sizeSm};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const RowAside = styled.div`
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  font-size: ${({ theme }) => theme.font.sizeSm};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: right;
`;

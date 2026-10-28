"use client";

import { Descriptions, Drawer } from "antd";
import type { ReactNode } from "react";
import styled from "styled-components";
import type { AsyncStatus, ServiceError } from "@/types/api";
import { ErrorState } from "./ErrorState";
import { DetailSkeleton } from "./LoadingSkeleton";

interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Usually a StatusBadge. */
  status?: ReactNode;
  /** Actions such as "Suspend" or "Open full page", shown in a toolbar above the content. */
  actions?: ReactNode;
  loadStatus?: AsyncStatus;
  error?: ServiceError | null;
  onRetry?: () => void;
  width?: number;
  children?: ReactNode;
}

const Heading = styled.div`
  min-width: 0;
`;

const TitleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.space(2)};
  font-size: ${({ theme }) => theme.font.h4};
  font-weight: 650;
`;

const Subtitle = styled.div`
  margin-top: 2px;
  font-size: ${({ theme }) => theme.font.sizeSm};
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ActionBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space(2)};
  margin: calc(-1 * ${({ theme }) => theme.space(2)}) 0 ${({ theme }) => theme.space(5)};
  padding-bottom: ${({ theme }) => theme.space(4)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:empty {
    display: none;
  }
`;

/** Side panel for inspecting a record without leaving the list. */
export function DetailDrawer({
  open,
  onClose,
  title,
  subtitle,
  status,
  actions,
  loadStatus = "succeeded",
  error,
  onRetry,
  width = 560,
  children,
}: DetailDrawerProps) {
  let body: ReactNode = (
    <>
      {actions ? <ActionBar aria-label="Actions">{actions}</ActionBar> : null}
      {children}
    </>
  );
  if (loadStatus === "loading" || loadStatus === "idle") body = <DetailSkeleton />;
  else if (loadStatus === "failed")
    body = (
      <ErrorState
        compact
        title="Details could not be loaded"
        message={error?.message}
        onRetry={onRetry}
      />
    );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      size={width}
      rootClassName="ta-detail-drawer"
      destroyOnHidden
      title={
        <Heading>
          <TitleRow>
            {title}
            {status}
          </TitleRow>
          {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
        </Heading>
      }
    >
      {body}
    </Drawer>
  );
}

const Section = styled.section`
  & + & {
    margin-top: ${({ theme }) => theme.space(6)};
    padding-top: ${({ theme }) => theme.space(6)};
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space(2)};
  margin-bottom: ${({ theme }) => theme.space(3)};

  h3 {
    margin: 0;
    font-size: ${({ theme }) => theme.font.sizeBase};
    font-weight: 650;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

interface DetailSectionProps {
  title: string;
  extra?: ReactNode;
  children: ReactNode;
}

export function DetailSection({ title, extra, children }: DetailSectionProps) {
  return (
    <Section aria-label={title}>
      <SectionHeader>
        <h3>{title}</h3>
        {extra}
      </SectionHeader>
      {children}
    </Section>
  );
}

export interface DetailListItem {
  key: string;
  label: string;
  value: ReactNode;
  /** Spans the full row, e.g. for long text. */
  wide?: boolean;
}

interface DetailListProps {
  items: DetailListItem[];
  columns?: 1 | 2;
}

const List = styled(Descriptions)`
  .ant-descriptions-item-label {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: ${({ theme }) => theme.font.sizeSm};
  }

  .ant-descriptions-item-content {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

/** Label and value pairs. Missing values should be passed as an em dash, not left blank. */
export function DetailList({ items, columns = 2 }: DetailListProps) {
  return (
    <List
      size="small"
      layout="vertical"
      colon={false}
      column={{ xs: 1, sm: columns }}
      items={items.map((item) => ({
        key: item.key,
        label: item.label,
        children: item.value,
        span: item.wide ? ("filled" as const) : 1,
      }))}
    />
  );
}

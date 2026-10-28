"use client";

import styled, { css } from "styled-components";
import { formatDateTime } from "@/lib/formatters/date";
import type { StatusTone, TimelineEntry } from "@/types/common";
import { EmptyState } from "./EmptyState";

const List = styled.ol`
  position: relative;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Item = styled.li`
  position: relative;
  padding: 0 0 ${({ theme }) => theme.space(5)} ${({ theme }) => theme.space(6)};

  &::before {
    content: "";
    position: absolute;
    left: 5px;
    top: 14px;
    bottom: 0;
    width: 1px;
    background: ${({ theme }) => theme.colors.border};
  }

  &:last-child {
    padding-bottom: 0;
  }

  &:last-child::before {
    display: none;
  }
`;

const Dot = styled.span<{ $tone: StatusTone }>`
  position: absolute;
  left: 0;
  top: 4px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.surface};
  ${({ $tone, theme }) => {
    const color = {
      success: theme.colors.success,
      warning: theme.colors.warning,
      error: theme.colors.error,
      info: theme.colors.info,
      brand: theme.colors.primary,
      neutral: theme.colors.textTertiary,
    }[$tone];
    return css`
      background: ${color};
      box-shadow: 0 0 0 1px ${color};
    `;
  }}
`;

const Title = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Detail = styled.div`
  margin-top: 2px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Meta = styled.div`
  margin-top: 2px;
  font-size: ${({ theme }) => theme.font.sizeSm};
  color: ${({ theme }) => theme.colors.textTertiary};
`;

interface TimelineProps {
  entries: TimelineEntry[];
  /** Newest first by default. */
  order?: "newest" | "oldest";
  emptyText?: string;
}

/** Chronological history for cases, decisions and resolutions. */
export function Timeline({
  entries,
  order = "newest",
  emptyText = "No history yet.",
}: TimelineProps) {
  if (entries.length === 0) return <EmptyState compact title={emptyText} />;
  const sorted = [...entries].sort((a, b) =>
    order === "newest" ? b.at.localeCompare(a.at) : a.at.localeCompare(b.at),
  );
  return (
    <List>
      {sorted.map((entry) => (
        <Item key={entry.id}>
          <Dot $tone={entry.tone ?? "neutral"} aria-hidden="true" />
          <Title>{entry.title}</Title>
          {entry.detail ? <Detail>{entry.detail}</Detail> : null}
          <Meta>
            {entry.actor} · {formatDateTime(entry.at)}
          </Meta>
        </Item>
      ))}
    </List>
  );
}

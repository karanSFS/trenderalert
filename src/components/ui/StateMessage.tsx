"use client";

import type { ReactNode } from "react";
import styled from "styled-components";

export interface StateMessageProps {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  role?: "status" | "alert";
  compact?: boolean;
}

const Wrapper = styled.div<{ $compact: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: ${({ theme }) => theme.space(3)};
  padding: ${({ $compact, theme }) => ($compact ? theme.space(6) : theme.space(12))}
    ${({ theme }) => theme.space(6)};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const IconBubble = styled.div`
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 22px;
  background: ${({ theme }) => theme.colors.surfaceMuted};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Title = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.font.h4};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Description = styled.div`
  max-width: 52ch;
`;

/** Shared layout for empty, error and access-denied states. */
export function StateMessage({
  icon,
  title,
  description,
  action,
  role,
  compact = false,
}: StateMessageProps) {
  return (
    <Wrapper $compact={compact} role={role}>
      <IconBubble aria-hidden="true">{icon}</IconBubble>
      <Title>{title}</Title>
      {description ? <Description>{description}</Description> : null}
      {action}
    </Wrapper>
  );
}

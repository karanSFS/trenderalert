"use client";

import {
  CheckCircleFilled,
  ClockCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
  MinusCircleFilled,
} from "@ant-design/icons";
import type { ReactNode } from "react";
import styled, { css } from "styled-components";
import type { StatusTone } from "@/types/common";

interface StatusBadgeProps {
  tone: StatusTone;
  /** Visible text is required so status is never conveyed by color alone. */
  label: string;
  icon?: ReactNode;
}

const defaultIcons: Record<StatusTone, ReactNode> = {
  success: <CheckCircleFilled />,
  warning: <ExclamationCircleFilled />,
  error: <CloseCircleFilled />,
  info: <InfoCircleFilled />,
  neutral: <MinusCircleFilled />,
  brand: <ClockCircleFilled />,
};

const Badge = styled.span<{ $tone: StatusTone }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: ${({ theme }) => theme.font.sizeSm};
  font-weight: 600;
  line-height: 20px;
  white-space: nowrap;
  border: 1px solid transparent;

  .anticon {
    font-size: 12px;
  }

  ${({ $tone, theme }) => {
    switch ($tone) {
      case "success":
        return css`
          color: ${theme.colors.success};
          background: ${theme.colors.successSoft};
        `;
      case "warning":
        return css`
          color: ${theme.colors.warning};
          background: ${theme.colors.warningSoft};
        `;
      case "error":
        return css`
          color: ${theme.colors.error};
          background: ${theme.colors.errorSoft};
        `;
      case "info":
        return css`
          color: ${theme.colors.info};
          background: ${theme.colors.infoSoft};
        `;
      case "brand":
        return css`
          color: ${theme.colors.textPrimary};
          background: ${theme.colors.primarySoft};
          border-color: ${theme.colors.primary};
        `;
      default:
        return css`
          color: ${theme.colors.textSecondary};
          background: ${theme.colors.surfaceMuted};
          border-color: ${theme.colors.border};
        `;
    }
  }}
`;

export function StatusBadge({ tone, label, icon }: StatusBadgeProps) {
  return (
    <Badge $tone={tone}>
      <span aria-hidden="true">{icon ?? defaultIcons[tone]}</span>
      {label}
    </Badge>
  );
}

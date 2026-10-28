"use client";

import styled, { css, useTheme } from "styled-components";
import { APP_NAME } from "@/lib/constants/app";

type LogoSize = "sm" | "md" | "lg";
type LogoTone = "onDark" | "onLight" | "auto";

interface BrandLogoProps {
  size?: LogoSize;
  /** `auto` follows the current appearance mode. */
  tone?: LogoTone;
  /** Shows the short "TA" form, e.g. in a collapsed sidebar. */
  compact?: boolean;
  className?: string;
}

const fontSizes: Record<LogoSize, string> = { sm: "16px", md: "19px", lg: "26px" };

const Wordmark = styled.span<{ $size: LogoSize; $onDark: boolean }>`
  display: inline-flex;
  align-items: baseline;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1;
  white-space: nowrap;
  font-size: ${({ $size }) => fontSizes[$size]};
  color: ${({ $onDark }) => ($onDark ? "#ffffff" : "#111111")};
`;

const Accent = styled.span<{ $onDark: boolean }>`
  ${({ $onDark, theme }) =>
    $onDark
      ? css`
          color: ${theme.colors.primary};
        `
      : css`
          color: #111111;
          background: ${theme.colors.primary};
          padding: 0 3px;
          margin-left: 1px;
          border-radius: 3px;
        `}
`;

/**
 * PLACEHOLDER wordmark. The specification requires the owner's original TrenderAlert logo
 * artwork, which has not been supplied yet. Replace the contents of this component with the
 * approved asset; do not redraw or restyle the real logo.
 */
export function BrandLogo({
  size = "md",
  tone = "auto",
  compact = false,
  className,
}: BrandLogoProps) {
  const theme = useTheme();
  const onDark = tone === "onDark" || (tone === "auto" && theme.mode === "dark");

  return (
    <Wordmark
      $size={size}
      $onDark={onDark}
      className={className}
      data-logo-placeholder="true"
      role="img"
      aria-label={APP_NAME}
    >
      {compact ? "T" : "Trender"}
      <Accent $onDark={onDark}>{compact ? "A" : "Alert"}</Accent>
    </Wordmark>
  );
}

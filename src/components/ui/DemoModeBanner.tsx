"use client";

import { ExperimentOutlined } from "@ant-design/icons";
import styled from "styled-components";

const Banner = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(2)};
  padding: ${({ theme }) => theme.space(2)} ${({ theme }) => theme.space(4)};
  font-size: ${({ theme }) => theme.font.sizeSm};
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.primarySoft};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  strong {
    font-weight: 700;
  }
`;

interface DemoModeBannerProps {
  message?: string;
}

export function DemoModeBanner({
  message = "All data is fictional sample data and no action reaches a real account, payment or service.",
}: DemoModeBannerProps) {
  return (
    <Banner role="note" aria-label="Demo mode notice">
      <ExperimentOutlined aria-hidden="true" />
      <span>
        <strong>Demo mode.</strong> {message}
      </span>
    </Banner>
  );
}

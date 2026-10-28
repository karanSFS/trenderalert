"use client";

import styled from "styled-components";

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0 6px;
  border-radius: 4px;
  border: 1px dashed ${({ theme }) => theme.colors.borderStrong};
  font-size: 11px;
  font-weight: 600;
  line-height: 18px;
  letter-spacing: 0.02em;
  color: ${({ theme }) => theme.colors.textTertiary};
  white-space: nowrap;
`;

/** Marks figures as fictional sample data. */
export function DemoDataTag({ label = "Demo data" }: { label?: string }) {
  return <Tag title="Fictional sample data, not live platform activity">{label}</Tag>;
}

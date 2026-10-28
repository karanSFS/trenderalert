"use client";

import type { ReactNode } from "react";
import styled from "styled-components";

const Card = styled.section`
  min-width: 0;
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
    margin: 0;
    font-size: ${({ theme }) => theme.font.sizeBase};
    font-weight: 650;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const Body = styled.div`
  padding: ${({ theme }) => theme.space(4)} ${({ theme }) => theme.space(5)};
`;

interface SectionCardProps {
  title: string;
  extra?: ReactNode;
  children: ReactNode;
}

/** Titled card used on detail pages. */
export function SectionCard({ title, extra, children }: SectionCardProps) {
  return (
    <Card aria-label={title}>
      <Header>
        <h2>{title}</h2>
        {extra}
      </Header>
      <Body>{children}</Body>
    </Card>
  );
}

/** Two-column detail layout that stacks below 1100px. */
export const DetailGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.space(4)};
  grid-template-columns: 1fr;
  align-items: start;

  @media (min-width: 1100px) {
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  }
`;

export const DetailColumn = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.space(4)};
  min-width: 0;
`;

"use client";

import type { ReactNode } from "react";
import styled from "styled-components";

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Primary and secondary page actions, rendered on the right. */
  actions?: ReactNode;
  /** Small label above the title, e.g. a section name or a demo-data tag. */
  eyebrow?: ReactNode;
}

const Wrapper = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space(4)};
  margin-bottom: ${({ theme }) => theme.space(6)};
`;

const Titles = styled.div`
  min-width: 0;
  flex: 1 1 320px;
`;

const Eyebrow = styled.div`
  margin-bottom: ${({ theme }) => theme.space(2)};
  font-size: ${({ theme }) => theme.font.sizeSm};
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textTertiary};
`;

const Title = styled.h1`
  margin: 0;
  font-size: ${({ theme }) => theme.font.h2};
  line-height: 1.25;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Subtitle = styled.p`
  margin: ${({ theme }) => theme.space(2)} 0 0;
  max-width: 72ch;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space(2)};
`;

export function PageHeader({ title, subtitle, actions, eyebrow }: PageHeaderProps) {
  return (
    <Wrapper>
      <Titles>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <Title>{title}</Title>
        {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
      </Titles>
      {actions ? <Actions>{actions}</Actions> : null}
    </Wrapper>
  );
}

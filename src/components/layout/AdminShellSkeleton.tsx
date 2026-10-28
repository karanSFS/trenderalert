"use client";

import { Skeleton } from "antd";
import styled from "styled-components";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";

const Shell = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`;

const Rail = styled.div`
  display: none;
  flex: none;
  width: var(--ta-sidebar-width);
  background: ${({ theme }) => theme.colors.sidebarBackground};
  padding: 0 ${({ theme }) => theme.space(6)};

  @media ${({ theme }) => theme.breakpoints.lg} {
    display: block;
  }
`;

const RailLogo = styled.div`
  display: flex;
  align-items: center;
  height: var(--ta-header-height);
`;

const Main = styled.div`
  flex: 1;
  min-width: 0;
`;

const Bar = styled.div`
  height: var(--ta-header-height);
  display: flex;
  align-items: center;
  padding: 0 ${({ theme }) => theme.space(6)};
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Body = styled.div`
  padding: ${({ theme }) => theme.space(6)};
`;

/** Matches the admin shell's geometry so the layout does not jump once the session loads. */
export function AdminShellSkeleton() {
  return (
    <Shell>
      <Rail aria-hidden="true">
        <RailLogo>
          <BrandLogo tone="onDark" />
        </RailLogo>
      </Rail>
      <Main>
        <Bar>
          <Skeleton.Input active size="small" />
        </Bar>
        <Body>
          <PageSkeleton />
        </Body>
      </Main>
    </Shell>
  );
}

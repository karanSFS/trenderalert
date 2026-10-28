"use client";

import { ToolOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ADMIN_ROUTES, type AdminRouteKey } from "@/lib/constants/adminRoutes";

const Panel = styled.section`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.card};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const Code = styled.code`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.font.sizeSm};
  padding: 1px 6px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.surfaceMuted};
`;

/** Interim screen for admin routes whose module is scheduled for a later build phase. */
export function ModulePlaceholder({ routeKey }: { routeKey: AdminRouteKey }) {
  const route = ADMIN_ROUTES[routeKey];

  return (
    <>
      <PageHeader
        eyebrow={`Scheduled for phase ${route.phase}`}
        title={route.label}
        subtitle={route.description}
        actions={<StatusBadge tone="neutral" label="Not built yet" />}
      />
      <Panel aria-labelledby="placeholder-title">
        <EmptyState
          icon={<ToolOutlined />}
          title={`${route.label} arrives in phase ${route.phase}`}
          description={
            <>
              Navigation, breadcrumbs and role access for this page are already wired. Its screens,
              mock data and Redux state will be added in phase {route.phase}. Required permission:{" "}
              <Code>{route.permission}</Code>
            </>
          }
        />
      </Panel>
    </>
  );
}

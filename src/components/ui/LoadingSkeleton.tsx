"use client";

import { Skeleton } from "antd";
import type { ReactNode } from "react";
import styled from "styled-components";

const Surface = styled.div<{ $minHeight?: number }>`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.card};
  padding: ${({ theme }) => theme.space(5)};
  min-height: ${({ $minHeight }) => ($minHeight ? `${$minHeight}px` : "auto")};

  & + & {
    margin-top: ${({ theme }) => theme.space(4)};
  }
`;

const Grid = styled.div<{ $min: number }>`
  display: grid;
  gap: ${({ theme }) => theme.space(4)};
  grid-template-columns: repeat(auto-fill, minmax(${({ $min }) => $min}px, 1fr));
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space(6)};
`;

const TableRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space(4)};
  align-items: center;
  padding: ${({ theme }) => theme.space(3)} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:first-of-type {
    margin-top: ${({ theme }) => theme.space(4)};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ChartArea = styled.div<{ $height: number }>`
  margin-top: ${({ theme }) => theme.space(4)};

  .ant-skeleton,
  .ant-skeleton-node {
    width: 100% !important;
    height: ${({ $height }) => $height}px !important;
  }
`;

const FormField = styled.div`
  & + & {
    margin-top: ${({ theme }) => theme.space(5)};
  }

  .ta-skeleton-label {
    width: 120px !important;
    min-width: 120px !important;
    margin-bottom: ${({ theme }) => theme.space(2)};
  }
`;

/** Marks a region as loading for assistive technology. */
function BusyRegion({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="ta-visually-hidden">{label}</span>
      {children}
    </div>
  );
}

export function MetricCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <BusyRegion label="Loading metrics">
      <Grid $min={220}>
        {Array.from({ length: count }, (_, index) => (
          <Surface key={index} $minHeight={124}>
            <Skeleton
              active
              title={{ width: "45%" }}
              paragraph={{ rows: 2, width: ["70%", "35%"] }}
            />
          </Surface>
        ))}
      </Grid>
    </BusyRegion>
  );
}

export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <BusyRegion label="Loading chart">
      <Surface>
        <Skeleton active title={{ width: "30%" }} paragraph={false} />
        <ChartArea $height={height}>
          <Skeleton.Node active />
        </ChartArea>
      </Surface>
    </BusyRegion>
  );
}

export function TableSkeleton({ rows = 8, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <BusyRegion label="Loading table">
      <Surface>
        <Skeleton.Input active block />
        {Array.from({ length: rows }, (_, row) => (
          <TableRow key={row}>
            {Array.from({ length: columns }, (_, column) => (
              <Skeleton.Input key={column} active size="small" block />
            ))}
          </TableRow>
        ))}
      </Surface>
    </BusyRegion>
  );
}

export function DetailSkeleton({ sections = 2 }: { sections?: number }) {
  return (
    <BusyRegion label="Loading details">
      <Surface>
        <Skeleton active avatar title={{ width: "40%" }} paragraph={{ rows: 2 }} />
      </Surface>
      {Array.from({ length: sections }, (_, index) => (
        <Surface key={index}>
          <Skeleton active paragraph={{ rows: 4 }} />
        </Surface>
      ))}
    </BusyRegion>
  );
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <BusyRegion label="Loading form">
      <Surface>
        {Array.from({ length: fields }, (_, index) => (
          <FormField key={index}>
            <Skeleton.Input active size="small" className="ta-skeleton-label" />
            <Skeleton.Input active block />
          </FormField>
        ))}
      </Surface>
    </BusyRegion>
  );
}

/** Generic page placeholder: header, KPI row and a table. */
export function PageSkeleton() {
  return (
    <BusyRegion label="Loading page">
      <Stack>
        <Skeleton active title={{ width: "28%" }} paragraph={{ rows: 1, width: "48%" }} />
        <MetricCardsSkeleton />
        <TableSkeleton rows={5} />
      </Stack>
    </BusyRegion>
  );
}

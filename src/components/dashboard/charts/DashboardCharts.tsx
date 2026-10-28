"use client";

import { Column, Line, Pie } from "@ant-design/charts";
import type { BreakdownItem, SeriesPoint } from "@/features/dashboard/dashboardTypes";
import { formatCompact, formatCurrency, formatNumber } from "@/lib/formatters/number";
import type { ChartTheme } from "@/styles/chartTheme";

/**
 * Chart implementations. Import through `./index` (lazy, client-only); never import this file
 * from a Server Component, because the chart library needs the browser.
 */

const shortDate = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  day: "numeric",
});

interface TimeSeriesProps {
  data: SeriesPoint[];
  theme: ChartTheme;
  height: number;
}

function timeAxes(theme: ChartTheme, yFormatter: (value: number) => string) {
  return {
    x: {
      ...theme.axis,
      labelFormatter: (value: Date | string) => shortDate.format(new Date(value)),
      labelAutoHide: true,
      grid: false,
    },
    y: {
      ...theme.axis,
      labelFormatter: (value: number) => yFormatter(value),
      grid: true,
      gridLineDash: [3, 3],
    },
  };
}

function legend(theme: ChartTheme, position: "top" | "right" | "bottom" = "top") {
  return {
    color: {
      position,
      itemLabelFill: theme.colors.text,
      itemMarker: "circle",
    },
  };
}

const toDates = (data: SeriesPoint[]) =>
  data.map((point) => ({ ...point, date: new Date(point.date) }));

export function RegistrationsChart({ data, theme, height }: TimeSeriesProps) {
  return (
    <Line
      data={toDates(data)}
      xField="date"
      yField="value"
      colorField="series"
      height={height}
      autoFit
      theme={theme.g2Theme}
      scale={{ color: { range: [theme.colors.primary] }, y: { nice: true, zero: false } }}
      axis={timeAxes(theme, formatCompact)}
      legend={false}
      style={{ lineWidth: 2.5 }}
      tooltip={{
        title: (datum: { date: Date }) => shortDate.format(datum.date),
        items: [
          {
            channel: "y",
            name: "Registrations",
            valueFormatter: (value: number) => formatNumber(value),
          },
        ],
      }}
    />
  );
}

export function TrendActivityChart({ data, theme, height }: TimeSeriesProps) {
  return (
    <Line
      data={toDates(data)}
      xField="date"
      yField="value"
      colorField="series"
      height={height}
      autoFit
      theme={theme.g2Theme}
      scale={{ color: { range: [theme.palette[1]] }, y: { nice: true, zero: false } }}
      axis={timeAxes(theme, formatCompact)}
      legend={false}
      style={{ lineWidth: 2.5 }}
      tooltip={{
        title: (datum: { date: Date }) => shortDate.format(datum.date),
        items: [
          {
            channel: "y",
            name: "Active Trends",
            valueFormatter: (value: number) => formatNumber(value),
          },
        ],
      }}
    />
  );
}

export function TransactionsChart({ data, theme, height }: TimeSeriesProps) {
  const rows = data.map((point) => ({ ...point, label: shortDate.format(new Date(point.date)) }));
  return (
    <Column
      data={rows}
      xField="label"
      yField="value"
      colorField="series"
      group
      height={height}
      autoFit
      theme={theme.g2Theme}
      scale={{ color: { range: [theme.colors.primary, theme.palette[5]] } }}
      axis={{
        x: { ...theme.axis, labelAutoHide: true },
        y: {
          ...theme.axis,
          labelFormatter: (value: number) => `$${formatCompact(value / 100)}`,
          grid: true,
          gridLineDash: [3, 3],
        },
      }}
      legend={legend(theme)}
      style={{ radiusTopLeft: 3, radiusTopRight: 3, maxWidth: 28 }}
      tooltip={{
        items: [{ channel: "y", valueFormatter: (value: number) => formatCurrency(value) }],
      }}
    />
  );
}

interface DonutProps {
  data: BreakdownItem[];
  theme: ChartTheme;
  height: number;
  centerLabel: string;
}

export function DonutChart({ data, theme, height, centerLabel }: DonutProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  return (
    <Pie
      data={data}
      angleField="value"
      colorField="label"
      height={height}
      autoFit
      theme={theme.g2Theme}
      innerRadius={0.64}
      radius={0.92}
      scale={{ color: { range: theme.palette } }}
      label={false}
      legend={legend(theme, "right")}
      style={{ stroke: theme.colors.surface, lineWidth: 2 }}
      tooltip={{
        title: (datum: BreakdownItem) => datum.label,
        items: [
          {
            channel: "y",
            valueFormatter: (value: number) =>
              `${formatNumber(value)} (${total ? Math.round((value / total) * 100) : 0}%)`,
          },
        ],
      }}
      annotations={[
        {
          type: "text",
          style: {
            text: formatNumber(total),
            x: "50%",
            y: "46%",
            textAlign: "center",
            fontSize: 22,
            fontWeight: 700,
            fill: theme.colors.text,
          },
        },
        {
          type: "text",
          style: {
            text: centerLabel,
            x: "50%",
            y: "56%",
            textAlign: "center",
            fontSize: 12,
            fill: theme.colors.textSecondary,
          },
        },
      ]}
    />
  );
}

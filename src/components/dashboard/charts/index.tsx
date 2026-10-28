"use client";

import { Skeleton } from "antd";
import dynamic from "next/dynamic";

const ChartLoading = () => <Skeleton.Node active />;

/** Lazily loaded, browser-only chart components. */
export const RegistrationsChart = dynamic(
  () => import("./DashboardCharts").then((module) => module.RegistrationsChart),
  { ssr: false, loading: ChartLoading },
);

export const TrendActivityChart = dynamic(
  () => import("./DashboardCharts").then((module) => module.TrendActivityChart),
  { ssr: false, loading: ChartLoading },
);

export const TransactionsChart = dynamic(
  () => import("./DashboardCharts").then((module) => module.TransactionsChart),
  { ssr: false, loading: ChartLoading },
);

export const DonutChart = dynamic(
  () => import("./DashboardCharts").then((module) => module.DonutChart),
  { ssr: false, loading: ChartLoading },
);

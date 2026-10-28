"use client";

import {
  AlertOutlined,
  CreditCardOutlined,
  DollarOutlined,
  ExceptionOutlined,
  ReloadOutlined,
  RiseOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { Alert, Button, Segmented } from "antd";
import { useEffect, type ReactNode } from "react";
import styled from "styled-components";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePermissionChecker } from "@/features/auth/usePermission";
import {
  selectDashboard,
  selectRecentActivity,
  selectVisibleKpis,
} from "@/features/dashboard/dashboardSelectors";
import { fetchDashboard, setDashboardRange } from "@/features/dashboard/dashboardSlice";
import {
  DASHBOARD_RANGE_DAYS,
  type DashboardRange,
  type DashboardSummary,
  type KpiKey,
  type KpiMetric,
} from "@/features/dashboard/dashboardTypes";
import { selectVisibleNotifications } from "@/features/notifications/notificationsSelectors";
import { fetchNotifications } from "@/features/notifications/notificationsSlice";
import { formatDate } from "@/lib/formatters/date";
import { formatCompactCurrency, formatNumber } from "@/lib/formatters/number";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useChartTheme, type ChartTheme } from "@/styles/chartTheme";
import type { Permission } from "@/types/auth";
import { ChartCard } from "./ChartCard";
import { DonutChart, RegistrationsChart, TransactionsChart, TrendActivityChart } from "./charts";
import { MetricCard } from "./MetricCard";
import {
  FinancialExceptionsPanel,
  PendingModerationPanel,
  RecentActivityPanel,
  RecentAlertsPanel,
  SystemHealthPanel,
} from "./panels/OperationalPanels";

const RANGE_OPTIONS: { label: string; value: DashboardRange }[] = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
];

const KPI_ICONS: Record<KpiKey, ReactNode> = {
  registeredUsers: <TeamOutlined />,
  newRegistrations: <UserAddOutlined />,
  activeTrends: <RiseOutlined />,
  pendingModeration: <AlertOutlined />,
  activeContests: <TrophyOutlined />,
  premiumSubscriptions: <CreditCardOutlined />,
  transactionVolume: <DollarOutlined />,
  financialExceptions: <ExceptionOutlined />,
};

const CHART_HEIGHT = 260;

interface ChartDefinition {
  key: string;
  title: string;
  subtitle: string;
  permission: Permission;
  isEmpty: (summary: DashboardSummary) => boolean;
  summaryText: (summary: DashboardSummary) => string;
  render: (summary: DashboardSummary, theme: ChartTheme) => ReactNode;
}

const sumValues = (items: { value: number }[]) =>
  items.reduce((total, item) => total + item.value, 0);

const CHARTS: ChartDefinition[] = [
  {
    key: "registrations",
    title: "User registrations",
    subtitle: "New accounts per day",
    permission: "users:view",
    isEmpty: (summary) => summary.registrations.length === 0,
    summaryText: (summary) =>
      `${formatNumber(sumValues(summary.registrations))} registrations in the selected period.`,
    render: (summary, theme) => (
      <RegistrationsChart data={summary.registrations} theme={theme} height={CHART_HEIGHT} />
    ),
  },
  {
    key: "trendActivity",
    title: "Active Trends",
    subtitle: "Trends inside their discovery window, per day",
    permission: "trends:view",
    isEmpty: (summary) => summary.trendActivity.length === 0,
    summaryText: (summary) => {
      const points = summary.trendActivity;
      return points.length
        ? `Active Trends went from ${formatNumber(points[0].value)} to ${formatNumber(points[points.length - 1].value)} in the selected period.`
        : "";
    },
    render: (summary, theme) => (
      <TrendActivityChart data={summary.trendActivity} theme={theme} height={CHART_HEIGHT} />
    ),
  },
  {
    key: "moderation",
    title: "Open moderation cases",
    subtitle: "Current queue by report category",
    permission: "moderation:view",
    isEmpty: (summary) => sumValues(summary.moderationByCategory) === 0,
    summaryText: (summary) =>
      summary.moderationByCategory.map((item) => `${item.label}: ${item.value}`).join(", "),
    render: (summary, theme) => (
      <DonutChart
        data={summary.moderationByCategory}
        theme={theme}
        height={CHART_HEIGHT}
        centerLabel="open cases"
      />
    ),
  },
  {
    key: "subscriptions",
    title: "Premium subscriptions",
    subtitle: "Active subscriptions by plan and store",
    permission: "subscriptions:view",
    isEmpty: (summary) => sumValues(summary.subscriptionsByPlan) === 0,
    summaryText: (summary) =>
      summary.subscriptionsByPlan
        .map((item) => `${item.label}: ${formatNumber(item.value)}`)
        .join(", "),
    render: (summary, theme) => (
      <DonutChart
        data={summary.subscriptionsByPlan}
        theme={theme}
        height={CHART_HEIGHT}
        centerLabel="subscriptions"
      />
    ),
  },
  {
    key: "transactions",
    title: "Transaction summary",
    subtitle:
      "Simulated subscription charges and refunds. Paid contests are not activated, so there are no contest payouts.",
    permission: "finance:view",
    isEmpty: (summary) => summary.transactions.length === 0,
    summaryText: (summary) => {
      const charges = sumValues(
        summary.transactions.filter((point) => point.series === "Subscriptions"),
      );
      const refunds = sumValues(summary.transactions.filter((point) => point.series === "Refunds"));
      return `${formatCompactCurrency(charges)} in subscription charges and ${formatCompactCurrency(refunds)} in refunds.`;
    },
    render: (summary, theme) => (
      <TransactionsChart data={summary.transactions} theme={theme} height={CHART_HEIGHT} />
    ),
  },
];

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.space(2)};
`;

const Section = styled.section`
  & + & {
    margin-top: ${({ theme }) => theme.space(6)};
  }
`;

const KpiGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.space(4)};
  grid-template-columns: 1fr;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const ChartGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.space(4)};
  grid-template-columns: 1fr;

  @media (min-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  /* An odd last chart spans the full row. */
  @media (min-width: 1100px) {
    > :last-child:nth-child(odd) {
      grid-column: 1 / -1;
    }
  }
`;

const PanelGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.space(4)};
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 1280px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const InlineAlert = styled(Alert)`
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

const ErrorSurface = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.card};
`;

function formatKpiValue(kpi: KpiMetric): string {
  return kpi.format === "currency" ? formatCompactCurrency(kpi.value) : formatNumber(kpi.value);
}

function changeRatio(kpi: KpiMetric): number {
  return kpi.previousValue ? (kpi.value - kpi.previousValue) / kpi.previousValue : 0;
}

export function DashboardScreen() {
  const dispatch = useAppDispatch();
  const { range, summary, status, error } = useAppSelector(selectDashboard);
  const kpis = useAppSelector(selectVisibleKpis);
  const recentActivity = useAppSelector(selectRecentActivity);
  const alerts = useAppSelector(selectVisibleNotifications);
  const notificationsStatus = useAppSelector((state) => state.notifications.status);
  const can = usePermissionChecker();
  const chartTheme = useChartTheme();

  useEffect(() => {
    dispatch(fetchDashboard(range));
  }, [dispatch, range]);

  useEffect(() => {
    if (notificationsStatus === "idle") dispatch(fetchNotifications());
  }, [dispatch, notificationsStatus]);

  const initialLoading = !summary && (status === "loading" || status === "idle");
  const refreshing = Boolean(summary) && status === "loading";
  const days = DASHBOARD_RANGE_DAYS[range];
  const visibleCharts = CHARTS.filter((chart) => can(chart.permission));

  const subtitle = summary
    ? `Demo data as of ${formatDate(summary.asOf)}, covering ${formatDate(summary.periodStart)} onward (${days} days).`
    : `Demo data for the last ${days} days.`;

  const header = (
    <PageHeader
      eyebrow="Overview"
      title="Dashboard"
      subtitle={subtitle}
      actions={
        <Toolbar>
          <Segmented<DashboardRange>
            aria-label="Date range"
            options={RANGE_OPTIONS}
            value={range}
            onChange={(value) => dispatch(setDashboardRange(value))}
          />
          <Button
            icon={<ReloadOutlined />}
            loading={status === "loading" && !initialLoading}
            onClick={() => dispatch(fetchDashboard(range))}
          >
            Refresh
          </Button>
        </Toolbar>
      }
    />
  );

  if (!summary && status === "failed") {
    return (
      <>
        {header}
        <ErrorSurface>
          <ErrorState
            title="The dashboard could not be loaded"
            message={error?.message}
            onRetry={() => dispatch(fetchDashboard(range))}
          />
        </ErrorSurface>
      </>
    );
  }

  const kpiCards = initialLoading
    ? Array.from({ length: 4 }, (_, index) => (
        <MetricCard key={index} label="Metric" value="" loading />
      ))
    : kpis.map((kpi) => (
        <MetricCard
          key={kpi.key}
          label={kpi.label}
          value={formatKpiValue(kpi)}
          icon={KPI_ICONS[kpi.key]}
          href={kpi.href}
          helper={kpi.helper}
          change={{
            value: changeRatio(kpi),
            label: `vs previous ${days} days`,
            higherIsBetter: kpi.higherIsBetter,
          }}
        />
      ));

  return (
    <div aria-busy={initialLoading || refreshing}>
      {header}

      {summary && status === "failed" ? (
        <InlineAlert
          type="error"
          showIcon
          title={error?.message ?? "The latest refresh failed."}
          description="Showing the previously loaded demo data."
          action={
            <Button size="small" onClick={() => dispatch(fetchDashboard(range))}>
              Try again
            </Button>
          }
        />
      ) : null}

      {kpiCards.length > 0 ? (
        <Section aria-label="Key metrics">
          <KpiGrid>{kpiCards}</KpiGrid>
        </Section>
      ) : null}

      {visibleCharts.length > 0 ? (
        <Section aria-label="Charts">
          <ChartGrid>
            {visibleCharts.map((chart) => (
              <ChartCard
                key={chart.key}
                title={chart.title}
                subtitle={chart.subtitle}
                status={summary ? "succeeded" : status}
                height={CHART_HEIGHT}
                isEmpty={summary ? chart.isEmpty(summary) : false}
                summary={summary ? chart.summaryText(summary) : undefined}
              >
                {summary ? chart.render(summary, chartTheme) : null}
              </ChartCard>
            ))}
          </ChartGrid>
        </Section>
      ) : null}

      <Section aria-label="Operations">
        <PanelGrid>
          {can("moderation:view") ? (
            <PendingModerationPanel
              items={summary?.pendingModeration ?? []}
              loading={initialLoading}
            />
          ) : null}
          {can("finance:view") ? (
            <FinancialExceptionsPanel
              items={summary?.financialExceptions ?? []}
              loading={initialLoading}
            />
          ) : null}
          {can("audit:view") ? (
            <RecentActivityPanel items={recentActivity} loading={initialLoading} />
          ) : null}
          <RecentAlertsPanel
            items={alerts}
            loading={notificationsStatus === "loading" || notificationsStatus === "idle"}
          />
          <SystemHealthPanel
            items={summary?.systemHealth ?? []}
            loading={initialLoading}
            canOpenOperations={can("operations:view")}
          />
        </PanelGrid>
      </Section>
    </div>
  );
}

"use client";

import {
  AlertOutlined,
  AuditOutlined,
  CreditCardOutlined,
  DollarOutlined,
  ExceptionOutlined,
  FieldTimeOutlined,
  PoweroffOutlined,
  ReloadOutlined,
  RiseOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { Alert, Button, Segmented } from "antd";
import { useCallback, useEffect, type ReactNode } from "react";
import styled from "styled-components";
import { DemoDataTag } from "@/components/ui/DemoDataTag";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { usePermissionChecker } from "@/features/auth/usePermission";
import { selectDashboard, selectVisibleKpis } from "@/features/dashboard/dashboardSelectors";
import { fetchDashboard, setDashboardRange } from "@/features/dashboard/dashboardSlice";
import {
  DASHBOARD_RANGE_DAYS,
  type BreakdownItem,
  type DashboardRange,
  type DashboardSummary,
  type KpiKey,
  type KpiMetric,
} from "@/features/dashboard/dashboardTypes";
import {
  selectOpenReports,
  selectPlatformHealth,
  selectPlatformMetrics,
  selectRecentAudit,
} from "@/features/moduleSelectors";
import type { ModerationReport } from "@/features/moderation/moderationTypes";
import { selectVisibleNotifications } from "@/features/notifications/notificationsSelectors";
import { fetchNotifications } from "@/features/notifications/notificationsSlice";
import {
  fetchOpenReports,
  fetchPlatformHealth,
  fetchPlatformMetrics,
  fetchRecentAudit,
} from "@/features/platform/platformSlices";
import { categoryLabel } from "@/lib/constants/moderationLabels";
import { formatDate } from "@/lib/formatters/date";
import { formatCompactCurrency, formatNumber } from "@/lib/formatters/number";
import { humanizeCode } from "@/lib/formatters/text";
import { useAdminLabel } from "@/lib/hooks/useAdminLabel";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useChartTheme, type ChartTheme } from "@/styles/chartTheme";
import type { Permission } from "@/types/auth";
import { ChartCard } from "./ChartCard";
import { DonutChart, RegistrationsChart, TransactionsChart, TrendActivityChart } from "./charts";
import { MetricCard } from "./MetricCard";
import {
  FinancialExceptionsPanel,
  OpenReportsPanel,
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
  newRegistrations: <UserAddOutlined />,
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

const SectionHeading = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.space(2)};
  margin-bottom: ${({ theme }) => theme.space(4)};

  h2 {
    margin: 0;
    font-size: ${({ theme }) => theme.font.h4};
  }
`;

const Spacer = styled.span`
  flex: 1;
`;

const SectionNote = styled.p`
  margin: -${({ theme }) => theme.space(2)} 0 ${({ theme }) => theme.space(4)};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Section = styled.section`
  & + & {
    margin-top: ${({ theme }) => theme.space(8)};
  }

  > * + * {
    margin-top: ${({ theme }) => theme.space(4)};
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

function formatKpiValue(kpi: KpiMetric): string {
  return kpi.format === "currency" ? formatCompactCurrency(kpi.value) : formatNumber(kpi.value);
}

function changeRatio(kpi: KpiMetric): number {
  return kpi.previousValue ? (kpi.value - kpi.previousValue) / kpi.previousValue : 0;
}

function countByCategory(reports: ModerationReport[]): BreakdownItem[] {
  const counts = new Map<string, number>();
  for (const report of reports) {
    const label = categoryLabel(report.category);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function DashboardScreen() {
  const dispatch = useAppDispatch();
  const { range, summary, status, error } = useAppSelector(selectDashboard);
  const kpis = useAppSelector(selectVisibleKpis);
  const alerts = useAppSelector(selectVisibleNotifications);
  const notificationsStatus = useAppSelector((state) => state.notifications.status);
  const metrics = useAppSelector(selectPlatformMetrics);
  const health = useAppSelector(selectPlatformHealth);
  const openReports = useAppSelector(selectOpenReports);
  const recentAudit = useAppSelector(selectRecentAudit);
  const can = usePermissionChecker();
  const adminLabel = useAdminLabel();
  const chartTheme = useChartTheme();
  const canModerate = can("moderation:view");
  const canAudit = can("audit:view");

  const loadLive = useCallback(() => {
    dispatch(fetchPlatformMetrics());
    dispatch(fetchPlatformHealth());
    if (canModerate) dispatch(fetchOpenReports());
    if (canAudit) dispatch(fetchRecentAudit());
  }, [dispatch, canModerate, canAudit]);

  useEffect(() => {
    loadLive();
  }, [loadLive]);

  useEffect(() => {
    dispatch(fetchDashboard(range));
  }, [dispatch, range]);

  useEffect(() => {
    if (notificationsStatus === "idle") dispatch(fetchNotifications());
  }, [dispatch, notificationsStatus]);

  const initialLoading = !summary && (status === "loading" || status === "idle");
  const days = DASHBOARD_RANGE_DAYS[range];
  const visibleCharts = CHARTS.filter((chart) => can(chart.permission));
  const live = metrics.data;
  const liveLoading = !live && metrics.status !== "failed";
  const liveRefreshing = metrics.status === "loading" || health.status === "loading";
  const reports = openReports.data ?? [];

  const liveCards: { key: string; permission?: Permission; card: ReactNode }[] = [
    {
      key: "users",
      card: (
        <MetricCard
          label="Total users"
          value={formatNumber(live?.totalUsers)}
          icon={<TeamOutlined />}
          helper="Registered accounts"
          loading={liveLoading}
        />
      ),
    },
    {
      key: "reports",
      permission: "moderation:view",
      card: (
        <MetricCard
          label="Open reports"
          value={formatNumber(live?.openReports)}
          icon={<AlertOutlined />}
          helper="Waiting in the moderation queue"
          href="/admin/moderation"
          loading={liveLoading}
        />
      ),
    },
    {
      key: "sla",
      permission: "moderation:view",
      card: (
        <MetricCard
          label="SLA breaches"
          value={formatNumber(live?.slaBreaches)}
          icon={<FieldTimeOutlined />}
          helper="High-priority reports past their deadline"
          href="/admin/moderation"
          loading={liveLoading}
        />
      ),
    },
    {
      key: "appeals",
      permission: "appeals:view",
      card: (
        <MetricCard
          label="Active appeals"
          value={formatNumber(live?.activeAppeals)}
          icon={<AuditOutlined />}
          helper="Submitted or in review"
          href="/admin/appeals"
          loading={liveLoading}
        />
      ),
    },
    {
      key: "trends",
      permission: "trends:view",
      card: (
        <MetricCard
          label="Active Trends"
          value={formatNumber(health.data?.activeTrends)}
          icon={<RiseOutlined />}
          helper="Inside their discovery window"
          href="/admin/trends"
          loading={!health.data && health.status !== "failed"}
        />
      ),
    },
    {
      key: "kill",
      card: (
        <MetricCard
          label="Kill switches active"
          value={formatNumber(live?.activeKillSwitches.length)}
          icon={<PoweroffOutlined />}
          helper={
            live?.activeKillSwitches.length
              ? live.activeKillSwitches.map(humanizeCode).join(", ")
              : "No features switched off"
          }
          href={can("configuration:view") ? "/admin/configuration/feature-flags" : undefined}
          loading={liveLoading}
        />
      ),
    },
  ];

  return (
    <div aria-busy={liveLoading || initialLoading}>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        subtitle="Live platform status from the TrenderAlert backend, followed by business metrics that still use demo data."
        actions={
          <Button
            icon={<ReloadOutlined />}
            loading={liveRefreshing}
            onClick={() => {
              loadLive();
              dispatch(fetchDashboard(range));
            }}
          >
            Refresh
          </Button>
        }
      />

      <Section aria-label="Live platform status">
        <SectionHeading>
          <h2>Live platform status</h2>
          {health.data ? (
            <StatusBadge
              label={
                health.data.status.toLowerCase() === "healthy"
                  ? "Backend healthy"
                  : humanizeCode(health.data.status)
              }
              tone={health.data.status.toLowerCase() === "healthy" ? "success" : "warning"}
            />
          ) : null}
        </SectionHeading>
        {metrics.status === "failed" ? (
          <InlineAlert
            type="error"
            showIcon
            title={metrics.error?.message ?? "Live metrics could not be loaded."}
            action={
              <Button size="small" onClick={loadLive}>
                Try again
              </Button>
            }
          />
        ) : null}
        <KpiGrid>
          {liveCards
            .filter((item) => !item.permission || can(item.permission))
            .map((item) => (
              <div key={item.key}>{item.card}</div>
            ))}
        </KpiGrid>
      </Section>

      <Section aria-label="Live operations">
        <PanelGrid>
          {canModerate ? (
            <OpenReportsPanel
              items={reports}
              loading={!openReports.data && openReports.status !== "failed"}
              error={openReports.status === "failed" ? openReports.error?.message : null}
            />
          ) : null}
          {canModerate ? (
            <ChartCard
              title="Open reports by category"
              subtitle="Open and in-review reports"
              status={openReports.data ? "succeeded" : openReports.status}
              height={CHART_HEIGHT}
              isEmpty={reports.length === 0}
              summary={countByCategory(reports)
                .map((item) => `${item.label}: ${item.value}`)
                .join(", ")}
            >
              <DonutChart
                data={countByCategory(reports)}
                theme={chartTheme}
                height={CHART_HEIGHT}
                centerLabel="open reports"
              />
            </ChartCard>
          ) : null}
          {canAudit ? (
            <RecentActivityPanel
              items={recentAudit.data ?? []}
              loading={!recentAudit.data && recentAudit.status !== "failed"}
              error={recentAudit.status === "failed" ? recentAudit.error?.message : null}
              adminLabel={adminLabel}
            />
          ) : null}
          <SystemHealthPanel
            health={health.data}
            metrics={live}
            loading={
              !health.data && !live && (health.status !== "failed" || metrics.status !== "failed")
            }
            error={health.error?.message ?? metrics.error?.message}
            canOpenOperations={can("operations:view")}
          />
        </PanelGrid>
      </Section>

      <Section aria-label="Business metrics (demo data)">
        <SectionHeading>
          <h2>Business metrics</h2>
          <DemoDataTag />
          <Spacer />
          <Segmented<DashboardRange>
            aria-label="Date range"
            options={RANGE_OPTIONS}
            value={range}
            onChange={(value) => dispatch(setDashboardRange(value))}
          />
        </SectionHeading>
        <SectionNote>
          {summary
            ? `Fictional sample data as of ${formatDate(summary.asOf)}, covering ${formatDate(summary.periodStart)} onward (${days} days). These areas have no backend API yet.`
            : `Fictional sample data for the last ${days} days. These areas have no backend API yet.`}
        </SectionNote>

        {status === "failed" ? (
          <InlineAlert
            type="error"
            showIcon
            title={error?.message ?? "The demo metrics could not be loaded."}
            action={
              <Button size="small" onClick={() => dispatch(fetchDashboard(range))}>
                Try again
              </Button>
            }
          />
        ) : null}

        {kpis.length > 0 || initialLoading ? (
          <KpiGrid>
            {initialLoading
              ? Array.from({ length: 4 }, (_, index) => (
                  <MetricCard key={index} label="Metric" value="" loading />
                ))
              : kpis.map((kpi) => (
                  <MetricCard
                    key={kpi.key}
                    demo
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
                ))}
          </KpiGrid>
        ) : null}

        {visibleCharts.length > 0 ? (
          <ChartGrid>
            {visibleCharts.map((chart) => (
              <ChartCard
                key={chart.key}
                demo
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
        ) : null}

        <PanelGrid>
          {can("finance:view") ? (
            <FinancialExceptionsPanel
              items={summary?.financialExceptions ?? []}
              loading={initialLoading}
            />
          ) : null}
          <RecentAlertsPanel
            items={alerts}
            loading={notificationsStatus === "loading" || notificationsStatus === "idle"}
          />
        </PanelGrid>
      </Section>
    </div>
  );
}

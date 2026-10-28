"use client";

import { ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Table } from "antd";
import Link from "next/link";
import { useEffect } from "react";
import styled from "styled-components";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { Identity } from "@/components/ui/Identity";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { DetailColumn, DetailGrid, SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { selectOperations } from "@/features/moduleSelectors";
import { acknowledgeIncident, fetchOperations } from "@/features/operations/operationsSlice";
import type {
  Incident,
  QueueStatus,
  ServiceObjective,
} from "@/features/operations/operationsTypes";
import {
  HEALTH_STATUS,
  INCIDENT_SEVERITY,
  INCIDENT_STATUS,
} from "@/lib/constants/operationalLabels";
import { formatDateTime } from "@/lib/formatters/date";
import { formatNumber } from "@/lib/formatters/number";
import { useDemoAction } from "@/lib/hooks/useDemoAction";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const Banner = styled(Alert)`
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

const Metrics = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.space(4)};
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

const Over = styled.span<{ $over: boolean }>`
  font-variant-numeric: tabular-nums;
  font-weight: ${({ $over }) => ($over ? 700 : 400)};
  color: ${({ $over, theme }) => ($over ? theme.colors.error : theme.colors.textPrimary)};
`;

const Incidents = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  li + li {
    margin-top: ${({ theme }) => theme.space(4)};
    padding-top: ${({ theme }) => theme.space(4)};
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }

  p {
    margin: ${({ theme }) => theme.space(1)} 0;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  small {
    display: block;
    margin-bottom: ${({ theme }) => theme.space(2)};
    color: ${({ theme }) => theme.colors.textTertiary};
  }
`;

const Badges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space(2)};
  margin-top: ${({ theme }) => theme.space(1)};
`;

const percent = (value: number) => `${value.toFixed(2)}%`;
const latency = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${ms} ms`);

export function OperationsScreen() {
  const dispatch = useAppDispatch();
  const { data, status, error, save } = useAppSelector(selectOperations);
  const { runWithToast } = useDemoAction();

  useEffect(() => {
    dispatch(fetchOperations());
  }, [dispatch]);

  if (!data) {
    if (status === "failed")
      return (
        <ErrorState
          title="Operations data could not be loaded"
          message={error?.message}
          onRetry={() => dispatch(fetchOperations())}
        />
      );
    return <PageSkeleton />;
  }

  const acknowledge = (incident: Incident) =>
    runWithToast(dispatch(acknowledgeIncident(incident.id)).unwrap(), {
      success: `${incident.id} acknowledged`,
      audit: () => ({
        action: "operations.acknowledge_incident",
        targetType: "incident",
        targetId: incident.id,
        summary: `Acknowledged incident ${incident.id} (${incident.title})`,
      }),
    });

  const { backlog } = data;

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Operations"
        subtitle={`Service objectives, queues and incidents. Simulated snapshot as of ${formatDateTime(data.asOf)}.`}
        actions={
          <Button
            icon={<ReloadOutlined />}
            loading={status === "loading"}
            onClick={() => dispatch(fetchOperations())}
          >
            Refresh
          </Button>
        }
      />
      <Banner
        type="warning"
        showIcon
        title="Simulated data"
        description="No monitoring system is connected. Values are static demo data that match the dashboard health panel; backlog counts come from the demo records."
      />
      <Metrics>
        <MetricCard
          demo
          label="Open moderation cases"
          value={formatNumber(backlog.openModerationCases)}
          href="/admin/moderation"
        />
        <MetricCard
          demo
          label="Open support cases"
          value={formatNumber(backlog.openSupportCases)}
          href="/admin/support"
        />
        <MetricCard
          demo
          label="Unresolved financial exceptions"
          value={formatNumber(backlog.openFinancialExceptions)}
          href="/admin/finance/reconciliation"
        />
        <MetricCard
          demo
          label="Abuse signals (24h)"
          value={formatNumber(backlog.abuseSignals)}
          helper="Simulated rate-limit and spam signals"
        />
      </Metrics>
      <DetailGrid>
        <DetailColumn>
          <SectionCard title="Incidents">
            <Incidents>
              {data.incidents.map((incident) => (
                <li key={incident.id}>
                  <strong>
                    {incident.id} · {incident.title}
                  </strong>
                  <Badges>
                    <StatusBadge {...INCIDENT_SEVERITY[incident.severity]} />
                    <StatusBadge {...INCIDENT_STATUS[incident.status]} />
                  </Badges>
                  <p>{incident.summary}</p>
                  <small>
                    Started {formatDateTime(incident.startedAt)} ·{" "}
                    {incident.acknowledgedBy
                      ? `Acknowledged by ${incident.acknowledgedBy}`
                      : "Not acknowledged"}
                  </small>
                  {incident.status !== "resolved" && !incident.acknowledgedBy ? (
                    <Button
                      size="small"
                      loading={save.status === "loading" && save.action === "acknowledge"}
                      onClick={() => acknowledge(incident)}
                    >
                      Acknowledge
                    </Button>
                  ) : null}
                </li>
              ))}
            </Incidents>
          </SectionCard>
          <SectionCard title="Scheduled maintenance">
            {data.maintenance.map((window) => (
              <Identity key={window.id}>
                <strong>{window.title}</strong>
                <span>
                  {formatDateTime(window.startsAt)} to {formatDateTime(window.endsAt)} ·{" "}
                  {window.impact}
                </span>
              </Identity>
            ))}
            <p>
              <Link href="/admin/configuration">Manage the member announcement</Link>
            </p>
          </SectionCard>
        </DetailColumn>
        <DetailColumn>
          <SectionCard title="Service objectives">
            <Table<ServiceObjective>
              size="small"
              rowKey="service"
              pagination={false}
              dataSource={data.objectives}
              scroll={{ x: 620 }}
              columns={[
                {
                  key: "service",
                  title: "Service",
                  render: (_, row) => <strong>{row.service}</strong>,
                },
                {
                  key: "status",
                  title: "Status",
                  render: (_, row) => <StatusBadge {...HEALTH_STATUS[row.status]} />,
                },
                {
                  key: "availability",
                  title: "Availability",
                  render: (_, row) => (
                    <Over $over={row.availability.actual < row.availability.target}>
                      {percent(row.availability.actual)} / {percent(row.availability.target)}
                    </Over>
                  ),
                },
                {
                  key: "latency",
                  title: "p95 latency",
                  render: (_, row) => (
                    <Over $over={row.p95LatencyMs.actual > row.p95LatencyMs.target}>
                      {latency(row.p95LatencyMs.actual)} / {latency(row.p95LatencyMs.target)}
                    </Over>
                  ),
                },
                {
                  key: "errors",
                  title: "Error rate",
                  render: (_, row) => (
                    <Over $over={row.errorRate.actual > row.errorRate.target}>
                      {percent(row.errorRate.actual)} / {percent(row.errorRate.target)}
                    </Over>
                  ),
                },
              ]}
            />
          </SectionCard>
          <SectionCard title="Queues">
            <Table<QueueStatus>
              size="small"
              rowKey="name"
              pagination={false}
              dataSource={data.queues}
              scroll={{ x: 560 }}
              columns={[
                { key: "name", title: "Queue", render: (_, row) => <strong>{row.name}</strong> },
                {
                  key: "status",
                  title: "Status",
                  render: (_, row) => <StatusBadge {...HEALTH_STATUS[row.status]} />,
                },
                {
                  key: "depth",
                  title: "Depth",
                  align: "right",
                  render: (_, row) => formatNumber(row.depth),
                },
                {
                  key: "age",
                  title: "Oldest / target",
                  render: (_, row) => (
                    <Over $over={row.oldestAgeMinutes > row.targetAgeMinutes}>
                      {row.oldestAgeMinutes} / {row.targetAgeMinutes} min
                    </Over>
                  ),
                },
                {
                  key: "dlq",
                  title: "Dead letter",
                  align: "right",
                  render: (_, row) => formatNumber(row.deadLetter),
                },
              ]}
            />
          </SectionCard>
        </DetailColumn>
      </DetailGrid>
    </>
  );
}

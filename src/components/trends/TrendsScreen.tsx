"use client";

import { ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Progress, type TableColumnsType } from "antd";
import { useEffect } from "react";
import styled from "styled-components";
import { DataTable } from "@/components/ui/DataTable";
import { DetailDrawer, DetailList, DetailSection } from "@/components/ui/DetailDrawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterBar } from "@/components/ui/FilterBar";
import { Identity } from "@/components/ui/Identity";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowActions } from "@/components/ui/RowActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Timeline } from "@/components/ui/Timeline";
import { trendsSelectors } from "@/features/moduleSelectors";
import {
  fetchTrend,
  fetchTrendInsights,
  fetchTrends,
  trendsActions,
} from "@/features/trends/trendsSlice";
import type {
  TrendFilters,
  TrendInsights,
  TrendPost,
  TrendScoreBreakdown,
} from "@/features/trends/trendsTypes";
import {
  toOptions,
  TREND_CATEGORY_OPTIONS,
  TREND_STAGE,
  trendStageBadge,
} from "@/lib/constants/statusLabels";
import { formatDate, formatDateTime } from "@/lib/formatters/date";
import { useDirectoryList } from "@/lib/hooks/useDirectoryList";
import { useOpenParam } from "@/lib/hooks/useOpenParam";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { TimelineEntry } from "@/types/common";

const Score = styled.span`
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`;

const Notice = styled(Alert)`
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

const Factors = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.space(3)};
`;

const Factor = styled.div`
  display: grid;
  gap: 2px;

  header {
    display: flex;
    justify-content: space-between;
    gap: ${({ theme }) => theme.space(2)};
    font-size: ${({ theme }) => theme.font.sizeSm};
  }

  small {
    color: ${({ theme }) => theme.colors.textTertiary};
  }
`;

const Prediction = styled.p`
  margin: ${({ theme }) => theme.space(3)} 0 0;
  font-weight: 600;
`;

/** Max points per factor, from the backend's documented weights. */
const FACTORS: { key: keyof TrendScoreBreakdown; label: string; max: number; penalty?: boolean }[] =
  [
    { key: "growthVelocity", label: "Growth velocity", max: 30 },
    { key: "qualifiedReach", label: "Qualified reach", max: 25 },
    { key: "geographicSpread", label: "Geographic spread", max: 20 },
    { key: "originality", label: "Originality", max: 15 },
    { key: "riskPenalty", label: "Risk penalty (bots, spam)", max: 10, penalty: true },
  ];

export function TrendsScreen() {
  const { table, search, filterBar, refetch } = useDirectoryList(
    trendsSelectors,
    fetchTrends,
    trendsActions,
  );
  const [openId, setOpenId] = useOpenParam();

  const columns: TableColumnsType<TrendPost> = [
    {
      key: "topic",
      title: "Trend",
      render: (_, trend) => (
        <Identity>
          <strong>{trend.topicTitle}</strong>
          <span>
            @{trend.creator} · {trend.city}
          </span>
        </Identity>
      ),
    },
    { key: "category", title: "Category", render: (_, trend) => trend.category },
    {
      key: "stage",
      title: "Stage",
      render: (_, trend) => <StatusBadge {...trendStageBadge(trend.stage)} />,
    },
    {
      key: "trendScore",
      title: "TrendScore",
      sorter: true,
      align: "right",
      render: (_, trend) => <Score>{trend.trendScore.toFixed(0)}</Score>,
    },
    {
      key: "createdAt",
      title: "Published",
      sorter: true,
      render: (_, trend) => formatDate(trend.createdAt),
    },
    {
      key: "expiresAt",
      title: "Expires",
      sorter: true,
      render: (_, trend) => (
        <Identity>
          <strong>{formatDate(trend.expiresAt)}</strong>
          <span>{trend.daysLeft === 1 ? "1 day left" : `${trend.daysLeft} days left`}</span>
        </Identity>
      ),
    },
    {
      key: "actions",
      title: <span className="ta-visually-hidden">Actions</span>,
      width: 56,
      render: (_, trend) => (
        <RowActions
          ariaLabel={`Actions for ${trend.topicTitle}`}
          items={[{ key: "view", label: "View Trend", onSelect: () => setOpenId(trend.id) }]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Discovery"
        title="Trends"
        subtitle="Active Trends from the TrenderAlert backend, with the explainable TrendScore and the cross-city journey."
        actions={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={table.status === "loading"}
          >
            Refresh
          </Button>
        }
      />
      <Notice
        type="info"
        showIcon
        title="Read-only"
        description="The backend has no admin actions for Trends yet. To act on a reported Trend, use Suppress content on its moderation report."
      />
      <DataTable<TrendPost>
        ariaLabel="Trends"
        columns={columns}
        rowKey="id"
        {...table}
        onRowClick={(trend) => setOpenId(trend.id)}
        emptyTitle="No Trends match"
        toolbar={
          <FilterBar<TrendFilters>
            search={{
              ...search,
              ariaLabel: "Search Trends",
              placeholder: "Search topic, caption, creator or city",
            }}
            filters={[
              { type: "select", key: "stage", label: "Stage", options: toOptions(TREND_STAGE) },
              {
                type: "select",
                key: "category",
                label: "Category",
                options: TREND_CATEGORY_OPTIONS,
              },
            ]}
            {...filterBar}
          />
        }
      />
      <TrendDrawer id={openId} onClose={() => setOpenId(null)} />
    </>
  );
}

function ScoreBreakdown({ score }: { score: TrendScoreBreakdown }) {
  return (
    <>
      <Factors>
        {FACTORS.map((factor) => {
          const value = score[factor.key] as number;
          return (
            <Factor key={factor.key}>
              <header>
                <span>{factor.label}</span>
                <strong>
                  {factor.penalty ? "−" : ""}
                  {value.toFixed(1)} / {factor.max}
                </strong>
              </header>
              <Progress
                percent={Math.min(100, (value / factor.max) * 100)}
                showInfo={false}
                size="small"
                status={factor.penalty ? "exception" : "normal"}
                aria-label={`${factor.label}: ${value} of ${factor.max} points`}
              />
            </Factor>
          );
        })}
      </Factors>
      <Prediction>
        {score.predictionLabel} · {score.confidencePct}% confidence
      </Prediction>
    </>
  );
}

function journeyEntries(insights: TrendInsights): TimelineEntry[] {
  return (insights.journey?.stops ?? []).map((stop, index) => ({
    id: `${index}-${stop.city}`,
    // The backend sends display dates such as "Mar 3, 2025"; read them as UTC days.
    at: new Date(Date.parse(`${stop.dateReached} UTC`) || 0).toISOString(),
    actor: `${stop.city}${stop.region ? `, ${stop.region}` : ""}`,
    title: `${trendStageBadge(stop.stage).label} · ${stop.velocityMultiplier}x velocity`,
    detail: stop.description || undefined,
    tone: "brand",
  }));
}

function TrendDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const trend = useAppSelector((state) => trendsSelectors.selectById(state, id));
  const detail = useAppSelector(trendsSelectors.selectDetail);
  const context = useAppSelector(trendsSelectors.selectContext);
  const insights = context.id === id ? context.data : null;

  useEffect(() => {
    if (!id) return;
    dispatch(fetchTrend(id));
    dispatch(fetchTrendInsights(id));
  }, [dispatch, id]);

  return (
    <DetailDrawer
      open={Boolean(id)}
      onClose={onClose}
      width={620}
      title={trend?.topicTitle ?? id ?? ""}
      subtitle={trend ? `${trend.id} · ${trend.category} · ${trend.city}` : undefined}
      status={trend ? <StatusBadge {...trendStageBadge(trend.stage)} /> : null}
      loadStatus={trend ? "succeeded" : detail.id === id ? detail.status : "loading"}
      error={detail.error}
      onRetry={() => id && dispatch(fetchTrend(id))}
    >
      {trend ? (
        <>
          <DetailSection title="Trend">
            <DetailList
              items={[
                { key: "caption", label: "Caption", value: trend.caption, wide: true },
                { key: "creator", label: "Creator", value: `@${trend.creator}` },
                {
                  key: "score",
                  label: "TrendScore",
                  value: <Score>{trend.trendScore.toFixed(1)}</Score>,
                },
                { key: "published", label: "Published", value: formatDateTime(trend.createdAt) },
                {
                  key: "expires",
                  label: "Expires (fixed at publication)",
                  value: `${formatDateTime(trend.expiresAt)} · ${trend.daysLeft} days left`,
                },
                {
                  key: "duration",
                  label: "Discovery window",
                  value: `${Math.round(trend.durationHours / 24)} days`,
                },
                { key: "cell", label: "Approximate area (H3 cell)", value: trend.h3Cell },
                {
                  key: "badge",
                  label: "First spotter badge",
                  value: trend.firstSpotterBadge ?? "—",
                },
              ]}
            />
          </DetailSection>
          <DetailSection title="TrendScore breakdown">
            {insights?.score ? (
              <ScoreBreakdown score={insights.score} />
            ) : (
              <EmptyState
                compact
                title={context.status === "loading" ? "Loading…" : "Breakdown not available"}
              />
            )}
          </DetailSection>
          <DetailSection title="Journey across cities">
            {insights?.journey && insights.journey.stops.length > 0 ? (
              <Timeline entries={journeyEntries(insights)} order="oldest" />
            ) : (
              <EmptyState
                compact
                title={context.status === "loading" ? "Loading…" : "No journey recorded yet"}
              />
            )}
          </DetailSection>
        </>
      ) : null}
    </DetailDrawer>
  );
}

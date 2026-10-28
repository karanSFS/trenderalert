"use client";

import { Button, Tag, Tooltip, type TableColumnsType } from "antd";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Can } from "@/components/auth/Can";
import { DataTable } from "@/components/ui/DataTable";
import { DetailDrawer, DetailList, DetailSection } from "@/components/ui/DetailDrawer";
import { EntityLink } from "@/components/ui/EntityLink";
import { FilterBar } from "@/components/ui/FilterBar";
import { Identity } from "@/components/ui/Identity";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowActions, type RowActionItem } from "@/components/ui/RowActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Timeline } from "@/components/ui/Timeline";
import { useConfirm } from "@/components/ui/useConfirm";
import { DEMO_AS_OF } from "@/data/mock/seed";
import { trendsSelectors } from "@/features/moduleSelectors";
import {
  fetchTrend,
  fetchTrendContext,
  fetchTrends,
  trendsActions,
} from "@/features/trends/trendsSlice";
import type { TrendFilters, TrendRecord } from "@/features/trends/trendsTypes";
import {
  CONTENT_STATUS,
  GEO_SCOPE_LABELS,
  toOptions,
  TREND_STAGE,
} from "@/lib/constants/statusLabels";
import { formatDate, formatDateTime, formatRelativeDays } from "@/lib/formatters/date";
import { formatNumber } from "@/lib/formatters/number";
import { useDirectoryList } from "@/lib/hooks/useDirectoryList";
import { useOpenParam } from "@/lib/hooks/useOpenParam";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { TrendDialogs } from "./TrendDialogs";
import { isTrendActive, useTrendActions, type TrendDialog } from "./useTrendActions";

const Flags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;

  .ant-tag {
    margin: 0;
  }
`;

const Score = styled.span`
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`;

const DrawerActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space(2)};
`;

const FLAG_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "suppressed", label: "Suppressed" },
  { value: "merged", label: "Merged" },
];

function expiryText(trend: TrendRecord) {
  if (trend.stage === "ended_early") return "Ended early";
  return isTrendActive(trend) || trend.mergedInto
    ? formatRelativeDays(trend.expiresAt, DEMO_AS_OF)
    : "Expired";
}

function TrendFlags({ trend }: { trend: TrendRecord }) {
  return (
    <Flags>
      {trend.featured ? <Tag color="gold">Featured</Tag> : null}
      {trend.suppressed ? <Tag color="orange">Suppressed</Tag> : null}
      {trend.mergedInto ? <Tag>Merged</Tag> : null}
      {!trend.featured && !trend.suppressed && !trend.mergedInto ? "—" : null}
    </Flags>
  );
}

export function TrendsScreen() {
  const dispatch = useAppDispatch();
  const { table, search, filterBar, refetch } = useDirectoryList(
    trendsSelectors,
    fetchTrends,
    trendsActions,
  );
  const [openId, setOpenId] = useOpenParam();
  const [formDialog, setFormDialog] = useState<TrendDialog>(null);
  const { confirm, dialog } = useConfirm();

  const after = () => {
    refetch();
    if (openId) {
      dispatch(fetchTrend(openId));
      dispatch(fetchTrendContext(openId));
    }
  };
  const { actionItems } = useTrendActions(confirm, setFormDialog, after);

  const columns: TableColumnsType<TrendRecord> = [
    {
      key: "topic",
      title: "Trend",
      render: (_, trend) => (
        <Identity>
          <strong>{trend.topic}</strong>
          <span>
            {trend.id} · @{trend.creatorUsername}
          </span>
        </Identity>
      ),
    },
    {
      key: "stage",
      title: "Lifecycle",
      render: (_, trend) => <StatusBadge {...TREND_STAGE[trend.stage]} />,
    },
    {
      key: "trendScore",
      title: "TrendScore",
      sorter: true,
      align: "right",
      render: (_, trend) => <Score>{trend.trendScore}</Score>,
    },
    {
      key: "scope",
      title: "Scope",
      render: (_, trend) => (
        <Identity>
          <strong>{GEO_SCOPE_LABELS[trend.geoScope]}</strong>
          <span>{trend.locationLabel}</span>
        </Identity>
      ),
    },
    {
      key: "publishedAt",
      title: "Published",
      sorter: true,
      render: (_, trend) => formatDate(trend.publishedAt),
    },
    {
      key: "expiresAt",
      title: "Expires",
      sorter: true,
      render: (_, trend) => (
        <Identity>
          <strong>{formatDate(trend.expiresAt)}</strong>
          <span>{expiryText(trend)}</span>
        </Identity>
      ),
    },
    { key: "flags", title: "Flags", render: (_, trend) => <TrendFlags trend={trend} /> },
    {
      key: "actions",
      title: <span className="ta-visually-hidden">Actions</span>,
      width: 56,
      render: (_, trend) => (
        <RowActions
          ariaLabel={`Actions for ${trend.id}`}
          items={actionItems(trend, () => setOpenId(trend.id))}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Trends"
        subtitle="TrendScore, lifecycle, geographic scope and discovery windows. Expiration is fixed at publication and cannot be extended."
      />
      <DataTable<TrendRecord>
        ariaLabel="Trend directory"
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
              placeholder: "Search topic, tag, creator or id",
            }}
            filters={[
              { type: "select", key: "stage", label: "Lifecycle", options: toOptions(TREND_STAGE) },
              {
                type: "select",
                key: "geoScope",
                label: "Scope",
                options: toOptions(GEO_SCOPE_LABELS),
              },
              { type: "select", key: "flag", label: "Flag", options: FLAG_OPTIONS },
            ]}
            {...filterBar}
          />
        }
      />
      <TrendDrawer id={openId} onClose={() => setOpenId(null)} actionItems={actionItems} />
      <TrendDialogs dialog={formDialog} onClose={() => setFormDialog(null)} after={after} />
      {dialog}
    </>
  );
}

function TrendDrawer({
  id,
  onClose,
  actionItems,
}: {
  id: string | null;
  onClose: () => void;
  actionItems: (trend: TrendRecord) => RowActionItem[];
}) {
  const dispatch = useAppDispatch();
  const trend = useAppSelector((state) => trendsSelectors.selectById(state, id));
  const detail = useAppSelector(trendsSelectors.selectDetail);
  const context = useAppSelector(trendsSelectors.selectContext);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchTrend(id));
    dispatch(fetchTrendContext(id));
  }, [dispatch, id]);

  const related = context.id === id ? context.data : null;

  return (
    <DetailDrawer
      open={Boolean(id)}
      onClose={onClose}
      width={600}
      title={trend?.topic ?? id ?? ""}
      subtitle={trend ? `${trend.id} · Demo record` : undefined}
      status={trend ? <StatusBadge {...TREND_STAGE[trend.stage]} /> : null}
      loadStatus={trend ? "succeeded" : detail.id === id ? detail.status : "loading"}
      error={detail.error}
      onRetry={() => id && dispatch(fetchTrend(id))}
      actions={
        trend ? (
          <Can permission="trends:manage">
            <DrawerActions>
              {actionItems(trend).map((action) => (
                <Tooltip
                  key={action.key}
                  title={action.disabled ? action.disabledReason : undefined}
                >
                  <Button
                    size="small"
                    danger={action.danger}
                    disabled={action.disabled}
                    onClick={action.onSelect}
                  >
                    {action.label}
                  </Button>
                </Tooltip>
              ))}
            </DrawerActions>
          </Can>
        ) : null
      }
    >
      {trend ? (
        <>
          <DetailSection title="Discovery">
            <DetailList
              items={[
                {
                  key: "creator",
                  label: "Original creator",
                  value: (
                    <EntityLink kind="user" id={trend.creatorId}>
                      @{trend.creatorUsername}
                    </EntityLink>
                  ),
                },
                { key: "score", label: "TrendScore", value: trend.trendScore },
                {
                  key: "scope",
                  label: "Geographic scope",
                  value: GEO_SCOPE_LABELS[trend.geoScope],
                },
                { key: "location", label: "Location label", value: trend.locationLabel },
                { key: "published", label: "Published", value: formatDateTime(trend.publishedAt) },
                {
                  key: "expires",
                  label: "Expires (fixed at publication)",
                  value: `${formatDateTime(trend.expiresAt)} · ${trend.durationDays}-day window, cannot be extended`,
                  wide: true,
                },
                {
                  key: "tags",
                  label: "Tags",
                  value: trend.tags.length ? trend.tags.join(", ") : "—",
                  wide: true,
                },
                { key: "flags", label: "Flags", value: <TrendFlags trend={trend} />, wide: true },
                ...(trend.mergedInto
                  ? [
                      {
                        key: "merged",
                        label: "Merged into",
                        value: <EntityLink kind="trend" id={trend.mergedInto} />,
                        wide: true,
                      },
                    ]
                  : []),
              ]}
            />
          </DetailSection>
          <DetailSection title="Activity (demo figures)">
            <DetailList
              items={[
                {
                  key: "shares",
                  label: "Qualified shares",
                  value: formatNumber(trend.activity.qualifiedShares),
                },
                {
                  key: "participants",
                  label: "Participants",
                  value: formatNumber(trend.activity.participants),
                },
                {
                  key: "creators",
                  label: "Contributing creators",
                  value: formatNumber(trend.activity.creators),
                },
                { key: "saves", label: "Saves", value: formatNumber(trend.activity.saves) },
              ]}
            />
          </DetailSection>
          <DetailSection title="Related content">
            <DetailList
              items={[
                {
                  key: "post",
                  label: "Trend post",
                  value: related?.content ? (
                    <>
                      <EntityLink kind="content" id={related.content.id} />{" "}
                      <StatusBadge {...CONTENT_STATUS[related.content.moderationStatus]} />
                    </>
                  ) : (
                    "—"
                  ),
                  wide: true,
                },
                {
                  key: "mergedFrom",
                  label: "Merged duplicates",
                  value: related?.mergedFrom.length
                    ? related.mergedFrom.map((source) => (
                        <EntityLink key={source.id} kind="trend" id={source.id} />
                      ))
                    : "None",
                  wide: true,
                },
              ]}
            />
          </DetailSection>
          <DetailSection title="History">
            <Timeline entries={trend.history} />
          </DetailSection>
        </>
      ) : null}
    </DetailDrawer>
  );
}

"use client";

import { Alert, Button, InputNumber, Select, Switch, Table, Tabs } from "antd";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { usePermission } from "@/features/auth/usePermission";
import { fetchDiscovery, updateDiscovery } from "@/features/discovery/discoverySlice";
import type {
  DiscoveryConfig,
  FeaturedLocation,
  Market,
  MarketStatus,
  RelevanceRadius,
} from "@/features/discovery/discoveryTypes";
import { selectDiscovery } from "@/features/moduleSelectors";
import type { DiscoveryUpdate } from "@/services/contracts/operationalServices";
import { MARKET_STATUS } from "@/lib/constants/operationalLabels";
import { toOptions } from "@/lib/constants/statusLabels";
import { useDemoAction } from "@/lib/hooks/useDemoAction";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { RankingWeightsTab } from "./RankingWeightsTab";

const Banner = styled(Alert)`
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

const FormActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.space(3)};
  margin-top: ${({ theme }) => theme.space(4)};

  small {
    color: ${({ theme }) => theme.colors.textTertiary};
  }
`;

const TabStack = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.space(4)};
`;

const Muted = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SOURCE_SUMMARY: Record<DiscoveryUpdate["type"], string> = {
  market: "market status",
  location: "featured location",
  source: "discovery source",
  relevance: "relevance radius",
};

export function DiscoveryScreen() {
  const dispatch = useAppDispatch();
  const { data, status, error } = useAppSelector(selectDiscovery);
  const canManage = usePermission("discovery:manage");
  const { run, runWithToast } = useDemoAction();

  useEffect(() => {
    dispatch(fetchDiscovery());
  }, [dispatch]);

  const save = (update: DiscoveryUpdate, summary: string, withDialog = false) =>
    (withDialog ? run : runWithToast)(dispatch(updateDiscovery(update)).unwrap(), {
      success: summary,
      audit: () => ({
        action: `discovery.${update.type}`,
        targetType: "discovery",
        targetId: "id" in update ? update.id : update.scope,
        summary: `Updated ${SOURCE_SUMMARY[update.type]}: ${summary}`,
      }),
    });

  if (!data) {
    if (status === "failed")
      return (
        <ErrorState
          title="Discovery settings could not be loaded"
          message={error?.message}
          onRetry={() => dispatch(fetchDiscovery())}
        />
      );
    return <PageSkeleton />;
  }

  return (
    <>
      <PageHeader
        eyebrow="Discovery"
        title="Discovery"
        subtitle="Markets, featured locations, sources, freshness, relevance and ranking. Locations are approximate areas; exact member positions are never used here."
      />
      {canManage ? null : (
        <Banner
          type="info"
          showIcon
          title="Read-only"
          description="Your role can view discovery settings but not change them."
        />
      )}
      <Tabs
        items={[
          {
            key: "markets",
            label: "Markets",
            children: <MarketsTab config={data} canManage={canManage} save={save} />,
          },
          {
            key: "locations",
            label: "Featured locations",
            children: <LocationsTab config={data} canManage={canManage} save={save} />,
          },
          {
            key: "sources",
            label: "Sources",
            children: <SourcesTab config={data} canManage={canManage} save={save} />,
          },
          {
            key: "freshness",
            label: "Freshness and relevance",
            children: <FreshnessTab config={data} canManage={canManage} save={save} />,
          },
          {
            key: "ranking",
            label: "Ranking",
            children: <RankingWeightsTab canManage={canManage} />,
          },
        ]}
      />
    </>
  );
}

interface TabProps {
  config: DiscoveryConfig;
  canManage: boolean;
  save: (update: DiscoveryUpdate, summary: string, withDialog?: boolean) => Promise<unknown>;
}

function MarketsTab({ config, canManage, save }: TabProps) {
  return (
    <SectionCard title="Markets">
      <Table<Market>
        size="small"
        rowKey="id"
        pagination={false}
        dataSource={config.markets}
        scroll={{ x: 640 }}
        columns={[
          { key: "name", title: "Market", render: (_, market) => <strong>{market.name}</strong> },
          { key: "region", title: "Region", dataIndex: "region" },
          {
            key: "status",
            title: "Status",
            render: (_, market) =>
              canManage ? (
                <Select<MarketStatus>
                  aria-label={`Status for ${market.name}`}
                  size="small"
                  value={market.status}
                  options={toOptions(MARKET_STATUS)}
                  onChange={(next) =>
                    save(
                      { type: "market", id: market.id, status: next },
                      `${market.name} set to ${MARKET_STATUS[next].label}`,
                    )
                  }
                  popupMatchSelectWidth={false}
                />
              ) : (
                <StatusBadge {...MARKET_STATUS[market.status]} />
              ),
          },
          {
            key: "paid",
            title: "Paid contests",
            render: (_, market) =>
              market.paidContestsAllowed ? (
                <StatusBadge label="Approved" tone="success" />
              ) : (
                <Muted>Requires jurisdiction approval</Muted>
              ),
          },
        ]}
      />
    </SectionCard>
  );
}

function LocationsTab({ config, canManage, save }: TabProps) {
  const marketName = (id: string) => config.markets.find((market) => market.id === id)?.name ?? id;
  return (
    <SectionCard title="Featured locations">
      <Table<FeaturedLocation>
        size="small"
        rowKey="id"
        pagination={false}
        dataSource={config.featuredLocations}
        scroll={{ x: 560 }}
        columns={[
          {
            key: "name",
            title: "Location",
            render: (_, location) => <strong>{location.name}</strong>,
          },
          {
            key: "market",
            title: "Market",
            render: (_, location) => marketName(location.marketId),
          },
          {
            key: "kind",
            title: "Kind",
            render: (_, location) => location.kind.charAt(0).toUpperCase() + location.kind.slice(1),
          },
          {
            key: "active",
            title: "Featured",
            render: (_, location) => (
              <Switch
                aria-label={`Feature ${location.name}`}
                checked={location.active}
                disabled={!canManage}
                onChange={(active) =>
                  save(
                    { type: "location", id: location.id, active },
                    `${location.name} ${active ? "featured" : "no longer featured"}`,
                  )
                }
              />
            ),
          },
        ]}
      />
    </SectionCard>
  );
}

function SourcesTab({ config, canManage, save }: TabProps) {
  return (
    <SectionCard title="Discovery sources">
      <Table
        size="small"
        rowKey="id"
        pagination={false}
        dataSource={config.sources}
        columns={[
          {
            key: "name",
            title: "Source",
            render: (_, source) => (
              <>
                <strong>{source.name}</strong>
                <div>
                  <Muted>{source.description}</Muted>
                </div>
              </>
            ),
          },
          {
            key: "enabled",
            title: "Included",
            width: 120,
            render: (_, source) => (
              <Switch
                aria-label={`Include ${source.name}`}
                checked={source.enabled}
                disabled={!canManage}
                onChange={(enabled) =>
                  save(
                    { type: "source", id: source.id, enabled },
                    `${source.name} ${enabled ? "included" : "excluded"}`,
                  )
                }
              />
            ),
          },
        ]}
      />
    </SectionCard>
  );
}

function FreshnessTab({ config, canManage, save }: TabProps) {
  const [radii, setRadii] = useState<Record<string, number | null>>({});
  const value = (radius: RelevanceRadius) => radii[radius.scope] ?? radius.radiusKm;
  return (
    <TabStack>
      <SectionCard title="Freshness windows">
        <Table
          size="small"
          rowKey="id"
          pagination={false}
          dataSource={config.freshness}
          columns={[
            { key: "label", title: "Window", dataIndex: "label" },
            {
              key: "hours",
              title: "Covers",
              render: (_, window) =>
                window.hours >= 48 ? `${window.hours / 24} days` : `${window.hours} hours`,
            },
          ]}
        />
        <FormActions>
          <small>Freshness windows follow the product specification and are read-only.</small>
        </FormActions>
      </SectionCard>
      <SectionCard title="Relevance radius">
        <Table<RelevanceRadius>
          size="small"
          rowKey="scope"
          pagination={false}
          dataSource={config.relevance}
          columns={[
            { key: "label", title: "Scope", dataIndex: "label" },
            {
              key: "radius",
              title: "Approximate radius",
              render: (_, radius) =>
                radius.radiusKm === null ? (
                  <Muted>Not distance-based</Muted>
                ) : (
                  <InputNumber
                    aria-label={`${radius.label} radius in km`}
                    size="small"
                    min={1}
                    max={500}
                    precision={0}
                    suffix="km"
                    disabled={!canManage}
                    value={value(radius)}
                    onChange={(next) =>
                      setRadii((current) => ({ ...current, [radius.scope]: next }))
                    }
                  />
                ),
            },
            {
              key: "save",
              title: <span className="ta-visually-hidden">Save</span>,
              width: 90,
              render: (_, radius) =>
                canManage && radius.radiusKm !== null ? (
                  <Button
                    size="small"
                    disabled={value(radius) === radius.radiusKm}
                    onClick={async () => {
                      const next = value(radius);
                      if (next === null) return;
                      const result = await save(
                        { type: "relevance", scope: radius.scope, radiusKm: next },
                        `${radius.label} radius set to ${next} km`,
                      );
                      if (result) setRadii((current) => ({ ...current, [radius.scope]: null }));
                    }}
                  >
                    Save
                  </Button>
                ) : null,
            },
          ]}
        />
      </SectionCard>
    </TabStack>
  );
}

"use client";

import { Alert, type TableColumnsType } from "antd";
import { useEffect } from "react";
import styled from "styled-components";
import { DataTable } from "@/components/ui/DataTable";
import { DetailDrawer, DetailList, DetailSection } from "@/components/ui/DetailDrawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { EntityLink } from "@/components/ui/EntityLink";
import { FilterBar } from "@/components/ui/FilterBar";
import { Identity } from "@/components/ui/Identity";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowActions } from "@/components/ui/RowActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Timeline } from "@/components/ui/Timeline";
import { subscriptionsSelectors } from "@/features/moduleSelectors";
import {
  fetchSubscription,
  fetchSubscriptions,
  fetchSubscriptionTransactions,
  subscriptionsActions,
} from "@/features/subscriptions/subscriptionsSlice";
import type {
  Subscription,
  SubscriptionFilters,
} from "@/features/subscriptions/subscriptionsTypes";
import {
  ENTITLEMENT_STATUS,
  STORE_LABELS,
  SUBSCRIPTION_STATUS,
} from "@/lib/constants/operationalLabels";
import { PLAN_LABELS, toOptions } from "@/lib/constants/statusLabels";
import { formatDate } from "@/lib/formatters/date";
import { useDirectoryList } from "@/lib/hooks/useDirectoryList";
import { useOpenParam } from "@/lib/hooks/useOpenParam";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { TransactionList } from "./TransactionList";

const Notice = styled(Alert)`
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

const PREMIUM_PLANS = {
  premium_monthly: PLAN_LABELS.premium_monthly,
  premium_yearly: PLAN_LABELS.premium_yearly,
};

export function SubscriptionsScreen() {
  const { table, search, filterBar } = useDirectoryList(
    subscriptionsSelectors,
    fetchSubscriptions,
    subscriptionsActions,
  );
  const [openId, setOpenId] = useOpenParam();

  const columns: TableColumnsType<Subscription> = [
    {
      key: "member",
      title: "Member",
      render: (_, item) => (
        <Identity>
          <strong>
            <EntityLink kind="user" id={item.userId}>
              @{item.username}
            </EntityLink>
          </strong>
          <span>{item.id}</span>
        </Identity>
      ),
    },
    { key: "plan", title: "Plan", render: (_, item) => PLAN_LABELS[item.plan] },
    { key: "store", title: "Store", render: (_, item) => STORE_LABELS[item.store] },
    {
      key: "status",
      title: "Status",
      render: (_, item) => <StatusBadge {...SUBSCRIPTION_STATUS[item.status]} />,
    },
    {
      key: "entitlement",
      title: "Entitlement",
      render: (_, item) => <StatusBadge {...ENTITLEMENT_STATUS[item.entitlement]} />,
    },
    {
      key: "currentPeriodEnd",
      title: "Period ends",
      sorter: true,
      render: (_, item) => (
        <Identity>
          <strong>{formatDate(item.currentPeriodEnd)}</strong>
          <span>{item.autoRenew ? "Auto-renew on" : "Auto-renew off"}</span>
        </Identity>
      ),
    },
    {
      key: "actions",
      title: <span className="ta-visually-hidden">Actions</span>,
      width: 56,
      render: (_, item) => (
        <RowActions
          ariaLabel={`Actions for ${item.id}`}
          items={[{ key: "view", label: "View subscription", onSelect: () => setOpenId(item.id) }]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Revenue"
        title="Subscriptions"
        subtitle="A sample of Premium subscriptions with store, renewal and entitlement status. Prices and billing are managed by the App Store and Google Play."
      />
      <Notice
        type="info"
        showIcon
        title="Read-only view"
        description="Cancellations, refunds and renewals happen in the stores. This portal shows their status; it never stores payment details."
      />
      <DataTable<Subscription>
        ariaLabel="Subscriptions"
        columns={columns}
        rowKey="id"
        {...table}
        onRowClick={(item) => setOpenId(item.id)}
        emptyTitle="No subscriptions match"
        toolbar={
          <FilterBar<SubscriptionFilters>
            search={{
              ...search,
              ariaLabel: "Search subscriptions",
              placeholder: "Search member, id or store reference",
            }}
            filters={[
              {
                type: "select",
                key: "status",
                label: "Status",
                options: toOptions(SUBSCRIPTION_STATUS),
              },
              { type: "select", key: "plan", label: "Plan", options: toOptions(PREMIUM_PLANS) },
              { type: "select", key: "store", label: "Store", options: toOptions(STORE_LABELS) },
            ]}
            {...filterBar}
          />
        }
      />
      <SubscriptionDrawer id={openId} onClose={() => setOpenId(null)} />
    </>
  );
}

function SubscriptionDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const item = useAppSelector((state) => subscriptionsSelectors.selectById(state, id));
  const detail = useAppSelector(subscriptionsSelectors.selectDetail);
  const context = useAppSelector(subscriptionsSelectors.selectContext);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchSubscription(id));
    dispatch(fetchSubscriptionTransactions(id));
  }, [dispatch, id]);

  const transactions = context.id === id ? context.data : null;

  return (
    <DetailDrawer
      open={Boolean(id)}
      onClose={onClose}
      width={600}
      title={id ?? ""}
      subtitle={
        item ? `${PLAN_LABELS[item.plan]} · ${STORE_LABELS[item.store]} · Demo record` : undefined
      }
      status={item ? <StatusBadge {...SUBSCRIPTION_STATUS[item.status]} /> : null}
      loadStatus={item ? "succeeded" : detail.id === id ? detail.status : "loading"}
      error={detail.error}
      onRetry={() => id && dispatch(fetchSubscription(id))}
    >
      {item ? (
        <>
          <DetailSection title="Subscription">
            <DetailList
              items={[
                {
                  key: "member",
                  label: "Member",
                  value: (
                    <EntityLink kind="user" id={item.userId}>
                      @{item.username}
                    </EntityLink>
                  ),
                },
                {
                  key: "entitlement",
                  label: "Entitlement",
                  value: <StatusBadge {...ENTITLEMENT_STATUS[item.entitlement]} />,
                },
                { key: "started", label: "Started", value: formatDate(item.startedAt) },
                {
                  key: "period",
                  label: "Current period ends",
                  value: formatDate(item.currentPeriodEnd),
                },
                { key: "renew", label: "Auto-renew", value: item.autoRenew ? "On" : "Off" },
                { key: "reference", label: "Store reference", value: item.storeReference },
              ]}
            />
          </DetailSection>
          <DetailSection title="Transactions">
            {transactions ? (
              <TransactionList items={transactions} />
            ) : (
              <EmptyState
                compact
                title={
                  context.status === "failed" ? "Transactions could not be loaded" : "Loading…"
                }
              />
            )}
          </DetailSection>
          <DetailSection title="Store events">
            <Timeline entries={item.history} />
          </DetailSection>
        </>
      ) : null}
    </DetailDrawer>
  );
}

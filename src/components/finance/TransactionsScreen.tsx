"use client";

import { Alert, type TableColumnsType } from "antd";
import { useEffect } from "react";
import styled from "styled-components";
import { ActionButtons } from "@/components/ui/ActionButtons";
import { DataTable } from "@/components/ui/DataTable";
import { DetailDrawer, DetailList, DetailSection } from "@/components/ui/DetailDrawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { EntityLink } from "@/components/ui/EntityLink";
import { FilterBar } from "@/components/ui/FilterBar";
import { Identity } from "@/components/ui/Identity";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowActions, type RowActionItem } from "@/components/ui/RowActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useConfirm, type ConfirmSpec } from "@/components/ui/useConfirm";
import type { Transaction, TransactionFilters } from "@/features/finance/financeTypes";
import {
  fetchTransaction,
  fetchTransactionContext,
  fetchTransactions,
  requestRefund,
  transactionsActions,
} from "@/features/finance/transactionsSlice";
import { transactionsSelectors } from "@/features/moduleSelectors";
import {
  RECONCILIATION_STATE,
  RECONCILIATION_STATUS,
  STORE_LABELS,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE_LABELS,
} from "@/lib/constants/operationalLabels";
import { toOptions } from "@/lib/constants/statusLabels";
import { formatDateTime } from "@/lib/formatters/date";
import { formatCurrency } from "@/lib/formatters/number";
import { useDemoAction } from "@/lib/hooks/useDemoAction";
import { useDirectoryList } from "@/lib/hooks/useDirectoryList";
import { useOpenParam } from "@/lib/hooks/useOpenParam";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { TransactionList } from "./TransactionList";

const Amount = styled.span<{ $negative: boolean }>`
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: ${({ $negative, theme }) => ($negative ? theme.colors.error : theme.colors.textPrimary)};
`;

const Note = styled(Alert)`
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

function refundBlock(item: Transaction): string | null {
  if (item.type !== "subscription_purchase" && item.type !== "renewal")
    return "Only purchases and renewals can be refunded.";
  if (item.status !== "succeeded") return "Only settled transactions can be refunded.";
  if (item.refundedBy) return `Refund ${item.refundedBy} is already linked.`;
  return null;
}

function useTransactionActions(confirm: (spec: ConfirmSpec) => void, after: () => void) {
  const dispatch = useAppDispatch();
  const { run } = useDemoAction();

  const refund = (item: Transaction) =>
    confirm({
      title: `Request refund for ${item.id}`,
      description: `${TRANSACTION_TYPE_LABELS[item.type]} of ${formatCurrency(item.amount)} via ${STORE_LABELS[item.provider]} by @${item.username}.`,
      consequences: [
        "Creates a new, linked refund record with status Pending. The original amount is never changed.",
        "Store refunds are completed by the store; this demo moves no money.",
      ],
      confirmLabel: "Record refund request",
      danger: true,
      requireReason: true,
      onConfirm: (reason) =>
        run(dispatch(requestRefund({ id: item.id, reason: reason ?? "" })).unwrap(), {
          success: `${item.id}: refund request recorded`,
          audit: (updated) => ({
            action: "transaction.refund_request",
            targetType: "transaction",
            targetId: updated.id,
            summary: `Recorded a simulated refund request ${updated.refundedBy} for ${updated.id}`,
            reason,
          }),
          after,
        }),
    });

  const actionItems = (item: Transaction): RowActionItem[] => {
    const blocked = refundBlock(item);
    return [
      {
        key: "refund",
        label: "Request refund (simulated)",
        permission: "finance:manage",
        danger: true,
        disabled: blocked !== null,
        disabledReason: blocked ?? undefined,
        onSelect: () => refund(item),
      },
    ];
  };

  return { actionItems };
}

export function TransactionsScreen() {
  const dispatch = useAppDispatch();
  const { table, search, filterBar, refetch } = useDirectoryList(
    transactionsSelectors,
    fetchTransactions,
    transactionsActions,
  );
  const [openId, setOpenId] = useOpenParam();
  const { confirm, dialog } = useConfirm();
  const { actionItems } = useTransactionActions(confirm, () => {
    refetch();
    if (openId) {
      dispatch(fetchTransaction(openId));
      dispatch(fetchTransactionContext(openId));
    }
  });

  const columns: TableColumnsType<Transaction> = [
    {
      key: "id",
      title: "Transaction",
      render: (_, item) => (
        <Identity>
          <strong>{item.id}</strong>
          <span>{TRANSACTION_TYPE_LABELS[item.type]}</span>
        </Identity>
      ),
    },
    {
      key: "member",
      title: "Member",
      render: (_, item) => (
        <EntityLink kind="user" id={item.userId}>
          @{item.username}
        </EntityLink>
      ),
    },
    {
      key: "amount",
      title: "Amount",
      sorter: true,
      align: "right",
      render: (_, item) => (
        <Amount $negative={item.amount < 0}>{formatCurrency(item.amount)}</Amount>
      ),
    },
    { key: "provider", title: "Provider", render: (_, item) => STORE_LABELS[item.provider] },
    {
      key: "status",
      title: "Status",
      render: (_, item) => <StatusBadge {...TRANSACTION_STATUS[item.status]} />,
    },
    {
      key: "reconciliation",
      title: "Reconciliation",
      render: (_, item) => <StatusBadge {...RECONCILIATION_STATE[item.reconciliation]} />,
    },
    {
      key: "occurredAt",
      title: "Date",
      sorter: true,
      render: (_, item) => formatDateTime(item.occurredAt),
    },
    {
      key: "actions",
      title: <span className="ta-visually-hidden">Actions</span>,
      width: 56,
      render: (_, item) => (
        <RowActions
          ariaLabel={`Actions for ${item.id}`}
          items={[
            { key: "view", label: "View transaction", onSelect: () => setOpenId(item.id) },
            ...actionItems(item),
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Finance"
        title="Transactions"
        subtitle="Purchases, renewals, refunds and chargebacks reported by the stores. The ledger is append-only: corrections are new linked records."
      />
      <Note
        type="warning"
        showIcon
        title="Demo ledger"
        description="Amounts are illustrative demo values. No payment provider is connected and no money moves."
      />
      <DataTable<Transaction>
        ariaLabel="Transactions"
        columns={columns}
        rowKey="id"
        {...table}
        onRowClick={(item) => setOpenId(item.id)}
        emptyTitle="No transactions match"
        toolbar={
          <FilterBar<TransactionFilters>
            search={{
              ...search,
              ariaLabel: "Search transactions",
              placeholder: "Search id, member or provider reference",
            }}
            filters={[
              {
                type: "select",
                key: "type",
                label: "Type",
                options: toOptions(TRANSACTION_TYPE_LABELS),
              },
              {
                type: "select",
                key: "status",
                label: "Status",
                options: toOptions(TRANSACTION_STATUS),
              },
              {
                type: "select",
                key: "provider",
                label: "Provider",
                options: toOptions(STORE_LABELS),
              },
              {
                type: "select",
                key: "reconciliation",
                label: "Reconciliation",
                options: toOptions(RECONCILIATION_STATE),
              },
            ]}
            {...filterBar}
          />
        }
      />
      <TransactionDrawer id={openId} onClose={() => setOpenId(null)} actionItems={actionItems} />
      {dialog}
    </>
  );
}

function TransactionDrawer({
  id,
  onClose,
  actionItems,
}: {
  id: string | null;
  onClose: () => void;
  actionItems: (item: Transaction) => RowActionItem[];
}) {
  const dispatch = useAppDispatch();
  const item = useAppSelector((state) => transactionsSelectors.selectById(state, id));
  const detail = useAppSelector(transactionsSelectors.selectDetail);
  const context = useAppSelector(transactionsSelectors.selectContext);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchTransaction(id));
    dispatch(fetchTransactionContext(id));
  }, [dispatch, id]);

  const related = context.id === id ? context.data : null;

  return (
    <DetailDrawer
      open={Boolean(id)}
      onClose={onClose}
      width={600}
      title={id ?? ""}
      subtitle={item ? `${TRANSACTION_TYPE_LABELS[item.type]} · Demo record` : undefined}
      status={item ? <StatusBadge {...TRANSACTION_STATUS[item.status]} /> : null}
      loadStatus={item ? "succeeded" : detail.id === id ? detail.status : "loading"}
      error={detail.error}
      onRetry={() => id && dispatch(fetchTransaction(id))}
      actions={item ? <ActionButtons items={actionItems(item)} /> : null}
    >
      {item ? (
        <>
          <DetailSection title="Transaction">
            <DetailList
              items={[
                {
                  key: "amount",
                  label: "Amount",
                  value: <Amount $negative={item.amount < 0}>{formatCurrency(item.amount)}</Amount>,
                },
                { key: "date", label: "Date", value: formatDateTime(item.occurredAt) },
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
                  key: "subscription",
                  label: "Subscription",
                  value: item.subscriptionId ? (
                    <EntityLink kind="subscription" id={item.subscriptionId} />
                  ) : (
                    "—"
                  ),
                },
                { key: "provider", label: "Provider", value: STORE_LABELS[item.provider] },
                { key: "reference", label: "Provider reference", value: item.providerReference },
                {
                  key: "reconciliation",
                  label: "Reconciliation",
                  value: <StatusBadge {...RECONCILIATION_STATE[item.reconciliation]} />,
                },
                {
                  key: "refundedBy",
                  label: "Refunded by",
                  value: item.refundedBy ? (
                    <EntityLink kind="transaction" id={item.refundedBy} />
                  ) : (
                    "—"
                  ),
                },
                ...(item.note
                  ? [{ key: "note", label: "Note", value: item.note, wide: true }]
                  : []),
              ]}
            />
          </DetailSection>
          <DetailSection title="Linked transactions">
            {related ? (
              <TransactionList items={related.related} emptyTitle="No linked transactions" />
            ) : (
              <EmptyState compact title="Loading…" />
            )}
          </DetailSection>
          <DetailSection title="Reconciliation exceptions">
            {related && related.reconciliation.length > 0 ? (
              <DetailList
                columns={1}
                items={related.reconciliation.map((record) => ({
                  key: record.id,
                  label: record.exceptionType,
                  value: (
                    <>
                      <EntityLink kind="reconciliation" id={record.id} />{" "}
                      <StatusBadge {...RECONCILIATION_STATUS[record.status]} />
                    </>
                  ),
                }))}
              />
            ) : (
              <EmptyState compact title={related ? "No exceptions" : "Loading…"} />
            )}
          </DetailSection>
        </>
      ) : null}
    </DetailDrawer>
  );
}

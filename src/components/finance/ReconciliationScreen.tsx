"use client";

import { Form, Input, Select, type TableColumnsType } from "antd";
import { useEffect, useState } from "react";
import { ActionButtons } from "@/components/ui/ActionButtons";
import { DataTable } from "@/components/ui/DataTable";
import { DetailDrawer, DetailList, DetailSection } from "@/components/ui/DetailDrawer";
import { EntityLink } from "@/components/ui/EntityLink";
import { FilterBar } from "@/components/ui/FilterBar";
import { FormModal } from "@/components/ui/FormModal";
import { Identity } from "@/components/ui/Identity";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowActions, type RowActionItem } from "@/components/ui/RowActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Timeline } from "@/components/ui/Timeline";
import type {
  ReconciliationFilters,
  ReconciliationRecord,
  ResolutionType,
} from "@/features/finance/financeTypes";
import {
  fetchReconciliation,
  fetchReconciliationRecord,
  investigateException,
  reconciliationActions,
  resolveException,
} from "@/features/finance/reconciliationSlice";
import { reconciliationSelectors } from "@/features/moduleSelectors";
import {
  EXCEPTION_TYPES,
  RECONCILIATION_STATUS,
  RESOLUTION_LABELS,
  STORE_LABELS,
} from "@/lib/constants/operationalLabels";
import { toOptions } from "@/lib/constants/statusLabels";
import { formatDateTime } from "@/lib/formatters/date";
import { formatCurrency } from "@/lib/formatters/number";
import { useDemoAction } from "@/lib/hooks/useDemoAction";
import { useDirectoryList } from "@/lib/hooks/useDirectoryList";
import { useOpenParam } from "@/lib/hooks/useOpenParam";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

interface ResolveValues {
  type: ResolutionType;
  note: string;
}

const difference = (record: ReconciliationRecord) =>
  record.internalAmount !== null && record.providerAmount !== null
    ? record.providerAmount - record.internalAmount
    : null;

export function ReconciliationScreen() {
  const dispatch = useAppDispatch();
  const { table, search, filterBar, refetch } = useDirectoryList(
    reconciliationSelectors,
    fetchReconciliation,
    reconciliationActions,
  );
  const [openId, setOpenId] = useOpenParam();
  const [resolving, setResolving] = useState<ReconciliationRecord | null>(null);
  const { run, runWithToast } = useDemoAction();

  const after = () => {
    refetch();
    if (openId) dispatch(fetchReconciliationRecord(openId));
  };

  const investigate = (record: ReconciliationRecord) =>
    runWithToast(dispatch(investigateException(record.id)).unwrap(), {
      success: `${record.id}: investigation started`,
      audit: (updated) => ({
        action: "reconciliation.investigate",
        targetType: "reconciliation",
        targetId: updated.id,
        summary: `Started investigating ${updated.id} (${updated.exceptionType.toLowerCase()})`,
      }),
      after,
    });

  const actionItems = (record: ReconciliationRecord): RowActionItem[] => [
    {
      key: "investigate",
      label: "Start investigation",
      permission: "finance:manage",
      disabled: record.status !== "open",
      disabledReason:
        record.status === "resolved" ? "Already resolved." : "Already under investigation.",
      onSelect: () => investigate(record),
    },
    {
      key: "resolve",
      label: "Resolve",
      permission: "finance:manage",
      disabled: record.status === "resolved",
      disabledReason: "Already resolved.",
      onSelect: () => setResolving(record),
    },
  ];

  const columns: TableColumnsType<ReconciliationRecord> = [
    {
      key: "id",
      title: "Exception",
      render: (_, record) => (
        <Identity>
          <strong>{record.id}</strong>
          <span>{record.exceptionType}</span>
        </Identity>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (_, record) => <StatusBadge {...RECONCILIATION_STATUS[record.status]} />,
    },
    { key: "provider", title: "Provider", render: (_, record) => STORE_LABELS[record.provider] },
    {
      key: "internal",
      title: "Internal record",
      render: (_, record) =>
        record.transactionId ? (
          <Identity>
            <strong>
              <EntityLink kind="transaction" id={record.transactionId} />
            </strong>
            <span>{formatCurrency(record.internalAmount)}</span>
          </Identity>
        ) : (
          "No internal record"
        ),
    },
    {
      key: "providerAmount",
      title: "Provider amount",
      align: "right",
      render: (_, record) => formatCurrency(record.providerAmount),
    },
    {
      key: "detectedAt",
      title: "Detected",
      sorter: true,
      render: (_, record) => formatDateTime(record.detectedAt),
    },
    {
      key: "actions",
      title: <span className="ta-visually-hidden">Actions</span>,
      width: 56,
      render: (_, record) => (
        <RowActions
          ariaLabel={`Actions for ${record.id}`}
          items={[
            { key: "view", label: "View exception", onSelect: () => setOpenId(record.id) },
            ...actionItems(record),
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Finance"
        title="Reconciliation"
        subtitle="Internal ledger records compared with store settlement references. Resolving an exception adds to its history; nothing is overwritten."
      />
      <DataTable<ReconciliationRecord>
        ariaLabel="Reconciliation exceptions"
        columns={columns}
        rowKey="id"
        {...table}
        onRowClick={(record) => setOpenId(record.id)}
        emptyTitle="No exceptions match"
        toolbar={
          <FilterBar<ReconciliationFilters>
            search={{
              ...search,
              ariaLabel: "Search exceptions",
              placeholder: "Search id, reference or transaction",
            }}
            filters={[
              {
                type: "select",
                key: "status",
                label: "Status",
                options: toOptions(RECONCILIATION_STATUS),
              },
              {
                type: "select",
                key: "exceptionType",
                label: "Exception type",
                options: toOptions(EXCEPTION_TYPES),
                width: 220,
              },
              {
                type: "select",
                key: "provider",
                label: "Provider",
                options: toOptions(STORE_LABELS),
              },
            ]}
            {...filterBar}
          />
        }
      />
      <ReconciliationDrawer id={openId} onClose={() => setOpenId(null)} actionItems={actionItems} />
      <FormModal<ResolveValues>
        open={resolving !== null}
        title={resolving ? `Resolve ${resolving.id}` : "Resolve exception"}
        description="The resolution is appended to the exception history. Ledger corrections are recorded as new linked entries, never by editing existing ones."
        submitLabel="Resolve exception"
        onClose={() => setResolving(null)}
        onSubmit={async (values) => {
          if (!resolving) return;
          await run(dispatch(resolveException({ id: resolving.id, ...values })).unwrap(), {
            success: `${resolving.id}: resolved`,
            audit: (updated) => ({
              action: "reconciliation.resolve",
              targetType: "reconciliation",
              targetId: updated.id,
              summary: `Resolved reconciliation exception ${updated.id} (${RESOLUTION_LABELS[values.type].toLowerCase()})`,
              reason: values.note,
            }),
            after,
          });
        }}
      >
        <Form.Item
          name="type"
          label="Resolution"
          rules={[{ required: true, message: "Choose a resolution." }]}
        >
          <Select options={toOptions(RESOLUTION_LABELS)} placeholder="Choose a resolution" />
        </Form.Item>
        <Form.Item
          name="note"
          label="Resolution note"
          rules={[
            { required: true, whitespace: true, min: 10, message: "Enter at least 10 characters." },
          ]}
        >
          <Input.TextArea autoSize={{ minRows: 3, maxRows: 6 }} maxLength={500} showCount />
        </Form.Item>
      </FormModal>
    </>
  );
}

function ReconciliationDrawer({
  id,
  onClose,
  actionItems,
}: {
  id: string | null;
  onClose: () => void;
  actionItems: (record: ReconciliationRecord) => RowActionItem[];
}) {
  const dispatch = useAppDispatch();
  const record = useAppSelector((state) => reconciliationSelectors.selectById(state, id));
  const detail = useAppSelector(reconciliationSelectors.selectDetail);

  useEffect(() => {
    if (id) dispatch(fetchReconciliationRecord(id));
  }, [dispatch, id]);

  const delta = record ? difference(record) : null;

  return (
    <DetailDrawer
      open={Boolean(id)}
      onClose={onClose}
      width={600}
      title={id ?? ""}
      subtitle={record ? `${record.exceptionType} · Demo record` : undefined}
      status={record ? <StatusBadge {...RECONCILIATION_STATUS[record.status]} /> : null}
      loadStatus={record ? "succeeded" : detail.id === id ? detail.status : "loading"}
      error={detail.error}
      onRetry={() => id && dispatch(fetchReconciliationRecord(id))}
      actions={record ? <ActionButtons items={actionItems(record)} /> : null}
    >
      {record ? (
        <>
          <DetailSection title="Comparison">
            <DetailList
              items={[
                {
                  key: "transaction",
                  label: "Internal transaction",
                  value: record.transactionId ? (
                    <EntityLink kind="transaction" id={record.transactionId} />
                  ) : (
                    "No internal record"
                  ),
                },
                {
                  key: "internal",
                  label: "Internal amount",
                  value: formatCurrency(record.internalAmount),
                },
                { key: "reference", label: "Provider reference", value: record.providerReference },
                {
                  key: "providerAmount",
                  label: "Provider amount",
                  value: formatCurrency(record.providerAmount),
                },
                { key: "provider", label: "Provider", value: STORE_LABELS[record.provider] },
                {
                  key: "difference",
                  label: "Difference",
                  value: delta === null ? "—" : formatCurrency(delta),
                },
                { key: "detected", label: "Detected", value: formatDateTime(record.detectedAt) },
              ]}
            />
          </DetailSection>
          {record.resolution ? (
            <DetailSection title="Resolution">
              <DetailList
                items={[
                  {
                    key: "type",
                    label: "Outcome",
                    value: RESOLUTION_LABELS[record.resolution.type],
                  },
                  {
                    key: "by",
                    label: "Resolved by",
                    value: `${record.resolution.by} · ${formatDateTime(record.resolution.at)}`,
                  },
                  { key: "note", label: "Note", value: record.resolution.note, wide: true },
                ]}
              />
            </DetailSection>
          ) : null}
          <DetailSection title="History">
            <Timeline entries={record.history} />
          </DetailSection>
        </>
      ) : null}
    </DetailDrawer>
  );
}

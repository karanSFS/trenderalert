"use client";

import { Button, Tooltip, type TableColumnsType } from "antd";
import { useEffect } from "react";
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
import { useConfirm, type ConfirmSpec } from "@/components/ui/useConfirm";
import { DEMO_AS_OF } from "@/data/mock/seed";
import {
  copyrightActions,
  fetchCopyrightCase,
  fetchCopyrightCases,
  resolveCopyright,
  setCopyrightEvidence,
} from "@/features/copyright/copyrightSlice";
import {
  OPEN_COPYRIGHT_STATUSES,
  type CopyrightCase,
  type CopyrightFilters,
  type CopyrightResolution,
  type EvidenceStatus,
} from "@/features/copyright/copyrightTypes";
import { copyrightSelectors } from "@/features/moduleSelectors";
import {
  COPYRIGHT_STATUS,
  EVIDENCE_STATUS,
  NOTICE_TYPE_LABELS,
  toOptions,
} from "@/lib/constants/statusLabels";
import { formatDate, formatDateTime, formatRelativeDays } from "@/lib/formatters/date";
import { useDemoAction } from "@/lib/hooks/useDemoAction";
import { useDirectoryList } from "@/lib/hooks/useDirectoryList";
import { useOpenParam } from "@/lib/hooks/useOpenParam";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const Deadline = styled.span<{ $urgent: boolean }>`
  font-weight: ${({ $urgent }) => ($urgent ? 700 : 400)};
  color: ${({ $urgent, theme }) => ($urgent ? theme.colors.error : theme.colors.textSecondary)};
`;

const DrawerActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space(2)};
`;

const RESOLUTIONS: Record<
  CopyrightResolution,
  { label: string; consequences: string[]; danger: boolean }
> = {
  remove_content: {
    label: "Remove affected content",
    danger: true,
    consequences: [
      "Removes the content everywhere it appears, including shares.",
      "The member is notified and may file a counter-notice.",
    ],
  },
  reject_notice: {
    label: "Reject notice",
    danger: false,
    consequences: [
      "Closes the case without changing the content.",
      "The sender is told why the notice was rejected.",
    ],
  },
  restore_content: {
    label: "Restore content",
    danger: false,
    consequences: [
      "Restores the content to its original audience.",
      "Closes the counter-notice case.",
    ],
  },
};

const isOpen = (item: CopyrightCase) => OPEN_COPYRIGHT_STATUSES.includes(item.status);

function resolutionBlock(item: CopyrightCase, resolution: CopyrightResolution): string | null {
  if (!isOpen(item)) return "This case is resolved.";
  if (resolution === "remove_content" && item.noticeType !== "takedown")
    return "Only takedown notices can remove content.";
  if (resolution === "restore_content" && item.noticeType !== "counter_notice")
    return "Only counter-notices can restore content.";
  if (resolution !== "reject_notice" && item.evidenceStatus !== "verified")
    return "Verify the evidence first.";
  return null;
}

function isUrgent(item: CopyrightCase) {
  const hours = (Date.parse(item.responseDueAt) - Date.parse(DEMO_AS_OF)) / 3_600_000;
  return isOpen(item) && hours <= 48;
}

function useCopyrightActions(confirm: (spec: ConfirmSpec) => void, after: () => void) {
  const dispatch = useAppDispatch();
  const { run, runWithToast } = useDemoAction();

  const resolve = (item: CopyrightCase, resolution: CopyrightResolution) => {
    const spec = RESOLUTIONS[resolution];
    confirm({
      title: `${spec.label}: ${item.id}`,
      description: `${NOTICE_TYPE_LABELS[item.noticeType]} from ${item.claimant} about ${item.contentId}.`,
      consequences: spec.consequences,
      confirmLabel: spec.label,
      danger: spec.danger,
      requireReason: true,
      onConfirm: (reason) =>
        run(
          dispatch(resolveCopyright({ id: item.id, resolution, reason: reason ?? "" })).unwrap(),
          {
            success: `${item.id}: ${spec.label.toLowerCase()}`,
            audit: (updated) => ({
              action: `copyright.${resolution}`,
              targetType: "copyrightCase",
              targetId: updated.id,
              summary: `${spec.label} (${updated.id})`,
              reason,
            }),
            after,
          },
        ),
    });
  };

  const setEvidence = (item: CopyrightCase, evidence: EvidenceStatus) =>
    runWithToast(dispatch(setCopyrightEvidence({ id: item.id, evidence })).unwrap(), {
      success: `${item.id}: evidence ${EVIDENCE_STATUS[evidence].label.toLowerCase()}`,
      audit: (updated) => ({
        action: `copyright.evidence_${evidence}`,
        targetType: "copyrightCase",
        targetId: updated.id,
        summary: `Marked evidence ${EVIDENCE_STATUS[evidence].label.toLowerCase()} (${updated.id})`,
      }),
      after,
    });

  const actionItems = (item: CopyrightCase): RowActionItem[] => [
    {
      key: "verify",
      label: "Mark evidence verified",
      permission: "copyright:manage",
      disabled: !isOpen(item) || item.evidenceStatus === "verified",
      disabledReason: !isOpen(item) ? "This case is resolved." : "Already verified.",
      onSelect: () => setEvidence(item, "verified"),
    },
    {
      key: "incomplete",
      label: "Mark evidence incomplete",
      permission: "copyright:manage",
      disabled: !isOpen(item) || item.evidenceStatus === "incomplete",
      disabledReason: !isOpen(item) ? "This case is resolved." : "Already incomplete.",
      onSelect: () => setEvidence(item, "incomplete"),
    },
    ...(Object.keys(RESOLUTIONS) as CopyrightResolution[]).map((resolution) => {
      const blocked = resolutionBlock(item, resolution);
      return {
        key: resolution,
        label: RESOLUTIONS[resolution].label,
        permission: "copyright:manage" as const,
        danger: RESOLUTIONS[resolution].danger,
        disabled: blocked !== null,
        disabledReason: blocked ?? undefined,
        onSelect: () => resolve(item, resolution),
      };
    }),
  ];

  return { actionItems };
}

export function CopyrightScreen() {
  const dispatch = useAppDispatch();
  const { table, search, filterBar, refetch } = useDirectoryList(
    copyrightSelectors,
    fetchCopyrightCases,
    copyrightActions,
  );
  const [openId, setOpenId] = useOpenParam();
  const { confirm, dialog } = useConfirm();
  const { actionItems } = useCopyrightActions(confirm, () => {
    refetch();
    if (openId) dispatch(fetchCopyrightCase(openId));
  });

  const columns: TableColumnsType<CopyrightCase> = [
    {
      key: "id",
      title: "Case",
      render: (_, item) => (
        <Identity>
          <strong>{item.id}</strong>
          <span>{NOTICE_TYPE_LABELS[item.noticeType]}</span>
        </Identity>
      ),
    },
    {
      key: "claimant",
      title: "Claimant and work",
      render: (_, item) => (
        <Identity>
          <strong>{item.claimant}</strong>
          <span>{item.workDescription}</span>
        </Identity>
      ),
    },
    {
      key: "content",
      title: "Affected content",
      render: (_, item) => <EntityLink kind="content" id={item.contentId} />,
    },
    {
      key: "status",
      title: "Status",
      render: (_, item) => <StatusBadge {...COPYRIGHT_STATUS[item.status]} />,
    },
    {
      key: "evidence",
      title: "Evidence",
      render: (_, item) => <StatusBadge {...EVIDENCE_STATUS[item.evidenceStatus]} />,
    },
    {
      key: "responseDueAt",
      title: "Response due",
      sorter: true,
      render: (_, item) => (
        <Identity>
          <strong>{formatDate(item.responseDueAt)}</strong>
          <Deadline $urgent={isUrgent(item)}>
            {isOpen(item) ? formatRelativeDays(item.responseDueAt, DEMO_AS_OF) : "Resolved"}
          </Deadline>
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
          items={[
            { key: "view", label: "View case", onSelect: () => setOpenId(item.id) },
            ...actionItems(item),
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Trust & Safety"
        title="Copyright"
        subtitle="Takedown notices and counter-notices with their deadlines and evidence. Claimants are fictional; no legal action is taken."
      />
      <DataTable<CopyrightCase>
        ariaLabel="Copyright cases"
        columns={columns}
        rowKey="id"
        {...table}
        onRowClick={(item) => setOpenId(item.id)}
        emptyTitle="No copyright cases match"
        toolbar={
          <FilterBar<CopyrightFilters>
            search={{
              ...search,
              ariaLabel: "Search copyright cases",
              placeholder: "Search case, claimant or content",
            }}
            filters={[
              {
                type: "select",
                key: "status",
                label: "Status",
                options: toOptions(COPYRIGHT_STATUS),
              },
              {
                type: "select",
                key: "noticeType",
                label: "Notice type",
                options: toOptions(NOTICE_TYPE_LABELS),
              },
              {
                type: "select",
                key: "evidenceStatus",
                label: "Evidence",
                options: toOptions(EVIDENCE_STATUS),
              },
            ]}
            {...filterBar}
          />
        }
      />
      <CopyrightDrawer id={openId} onClose={() => setOpenId(null)} actionItems={actionItems} />
      {dialog}
    </>
  );
}

function CopyrightDrawer({
  id,
  onClose,
  actionItems,
}: {
  id: string | null;
  onClose: () => void;
  actionItems: (item: CopyrightCase) => RowActionItem[];
}) {
  const dispatch = useAppDispatch();
  const item = useAppSelector((state) => copyrightSelectors.selectById(state, id));
  const detail = useAppSelector(copyrightSelectors.selectDetail);

  useEffect(() => {
    if (id) dispatch(fetchCopyrightCase(id));
  }, [dispatch, id]);

  return (
    <DetailDrawer
      open={Boolean(id)}
      onClose={onClose}
      width={600}
      title={id ?? ""}
      subtitle={item ? `${NOTICE_TYPE_LABELS[item.noticeType]} · Demo record` : undefined}
      status={item ? <StatusBadge {...COPYRIGHT_STATUS[item.status]} /> : null}
      loadStatus={item ? "succeeded" : detail.id === id ? detail.status : "loading"}
      error={detail.error}
      onRetry={() => id && dispatch(fetchCopyrightCase(id))}
      actions={
        item ? (
          <Can permission="copyright:manage">
            <DrawerActions>
              {actionItems(item).map((action) => (
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
      {item ? (
        <>
          <DetailSection title="Notice">
            <DetailList
              items={[
                { key: "claimant", label: "Claimant", value: item.claimant },
                { key: "type", label: "Notice type", value: NOTICE_TYPE_LABELS[item.noticeType] },
                { key: "work", label: "Claimed work", value: item.workDescription, wide: true },
                { key: "received", label: "Received", value: formatDateTime(item.receivedAt) },
                {
                  key: "due",
                  label: "Response due",
                  value: (
                    <Deadline $urgent={isUrgent(item)}>
                      {formatDateTime(item.responseDueAt)}
                      {isOpen(item)
                        ? ` (${formatRelativeDays(item.responseDueAt, DEMO_AS_OF)})`
                        : ""}
                    </Deadline>
                  ),
                },
                {
                  key: "evidence",
                  label: "Evidence",
                  value: <StatusBadge {...EVIDENCE_STATUS[item.evidenceStatus]} />,
                },
              ]}
            />
          </DetailSection>
          <DetailSection title="Affected content">
            <DetailList
              items={[
                {
                  key: "content",
                  label: "Content",
                  value: <EntityLink kind="content" id={item.contentId} />,
                },
                {
                  key: "member",
                  label: "Member",
                  value: (
                    <EntityLink kind="user" id={item.accountId}>
                      @{item.username}
                    </EntityLink>
                  ),
                },
              ]}
            />
          </DetailSection>
          <DetailSection title="Resolution history">
            <Timeline entries={item.history} />
          </DetailSection>
        </>
      ) : null}
    </DetailDrawer>
  );
}

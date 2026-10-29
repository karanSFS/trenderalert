"use client";

import { PictureOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { Button, Tag, Tooltip, type TableColumnsType } from "antd";
import { useEffect } from "react";
import styled from "styled-components";
import { Can } from "@/components/auth/Can";
import { DataTable } from "@/components/ui/DataTable";
import { DetailDrawer, DetailList, DetailSection } from "@/components/ui/DetailDrawer";
import { EntityLink } from "@/components/ui/EntityLink";
import { FilterBar } from "@/components/ui/FilterBar";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowActions } from "@/components/ui/RowActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useConfirm } from "@/components/ui/useConfirm";
import { Identity } from "@/components/ui/Identity";
import {
  contentActions,
  fetchContentItem,
  fetchContentList,
} from "@/features/content/contentSlice";
import type { ContentFilters, ContentItem } from "@/features/content/contentTypes";
import { contentSelectors } from "@/features/moduleSelectors";
import {
  AUDIENCE_LABELS,
  CONTENT_STATUS,
  CONTENT_TYPE_LABELS,
  toOptions,
} from "@/lib/constants/statusLabels";
import { formatDate, formatDateTime } from "@/lib/formatters/date";
import { useDirectoryList } from "@/lib/hooks/useDirectoryList";
import { useOpenParam } from "@/lib/hooks/useOpenParam";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useContentActions } from "./useContentActions";

const Caption = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space(3)};
  align-items: flex-start;
  max-width: 420px;

  .anticon {
    margin-top: 3px;
    color: ${({ theme }) => theme.colors.textTertiary};
  }
`;

const DrawerActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space(2)};
`;

export function ContentScreen() {
  const { list, table, search, filterBar, refetch } = useDirectoryList(
    contentSelectors,
    fetchContentList,
    contentActions,
  );
  const dispatch = useAppDispatch();
  const [openId, setOpenId] = useOpenParam();
  const { confirm, dialog } = useConfirm();
  const { actionItems } = useContentActions(confirm, () => {
    refetch();
  });
  const creatorId = list.query.filters.creatorId;

  const columns: TableColumnsType<ContentItem> = [
    {
      key: "caption",
      title: "Content",
      render: (_, item) => (
        <Caption>
          {item.media === "video" ? (
            <PlayCircleOutlined aria-label="Video" />
          ) : (
            <PictureOutlined aria-label="Photo" />
          )}
          <Identity>
            <strong>{item.caption}</strong>
            <span>{item.id}</span>
          </Identity>
        </Caption>
      ),
    },
    { key: "type", title: "Type", render: (_, item) => CONTENT_TYPE_LABELS[item.type] },
    {
      key: "creator",
      title: "Creator",
      render: (_, item) => (
        <EntityLink kind="user" id={item.creatorId}>
          @{item.creatorUsername}
        </EntityLink>
      ),
    },
    { key: "audience", title: "Audience", render: (_, item) => AUDIENCE_LABELS[item.audience] },
    {
      key: "status",
      title: "Moderation",
      render: (_, item) => <StatusBadge {...CONTENT_STATUS[item.moderationStatus]} />,
    },
    {
      key: "reportCount",
      title: "Reports",
      sorter: true,
      align: "right",
      render: (_, item) => item.reportCount,
    },
    {
      key: "publishedAt",
      title: "Published",
      sorter: true,
      render: (_, item) => formatDate(item.publishedAt),
    },
    {
      key: "actions",
      title: <span className="ta-visually-hidden">Actions</span>,
      width: 56,
      render: (_, item) => (
        <RowActions
          ariaLabel={`Actions for ${item.id}`}
          items={actionItems(item, () => setOpenId(item.id))}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Content"
        subtitle="Trends and Profile Posts with their audience and moderation status. All items are fictional demo content."
      />
      <DataTable<ContentItem>
        ariaLabel="Content directory"
        columns={columns}
        rowKey="id"
        {...table}
        onRowClick={(item) => setOpenId(item.id)}
        emptyTitle="No content matches"
        toolbar={
          <FilterBar<ContentFilters>
            search={{
              ...search,
              ariaLabel: "Search content",
              placeholder: "Search caption, creator or id",
            }}
            filters={[
              {
                type: "select",
                key: "type",
                label: "Type",
                options: toOptions(CONTENT_TYPE_LABELS),
              },
              {
                type: "select",
                key: "audience",
                label: "Audience",
                options: toOptions(AUDIENCE_LABELS),
              },
              {
                type: "select",
                key: "moderationStatus",
                label: "Moderation",
                options: toOptions(CONTENT_STATUS),
              },
            ]}
            {...filterBar}
            extra={
              creatorId ? (
                <Tag
                  closable
                  onClose={() => dispatch(contentActions.setFilters({ creatorId: undefined }))}
                >
                  Creator: {creatorId}
                </Tag>
              ) : null
            }
          />
        }
      />
      <ContentDrawer id={openId} onClose={() => setOpenId(null)} actionItems={actionItems} />
      {dialog}
    </>
  );
}

function ContentDrawer({
  id,
  onClose,
  actionItems,
}: {
  id: string | null;
  onClose: () => void;
  actionItems: ReturnType<typeof useContentActions>["actionItems"];
}) {
  const dispatch = useAppDispatch();
  const item = useAppSelector((state) => contentSelectors.selectById(state, id));
  const detail = useAppSelector(contentSelectors.selectDetail);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchContentItem(id));
  }, [dispatch, id]);

  const loadStatus = item ? "succeeded" : detail.id === id ? detail.status : "loading";

  return (
    <DetailDrawer
      open={Boolean(id)}
      onClose={onClose}
      title={id ?? ""}
      subtitle={item ? `${CONTENT_TYPE_LABELS[item.type]} · Demo record` : undefined}
      status={item ? <StatusBadge {...CONTENT_STATUS[item.moderationStatus]} /> : null}
      loadStatus={loadStatus}
      error={detail.error}
      onRetry={() => id && dispatch(fetchContentItem(id))}
      actions={
        item ? (
          <Can permission="content:moderate">
            <DrawerActions>
              {actionItems(item)
                .filter((action) => action.key !== "view")
                .map((action) => (
                  <Tooltip key={action.key} title={action.disabledReason}>
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
          <DetailSection title="Details">
            <DetailList
              items={[
                { key: "caption", label: "Caption", value: item.caption, wide: true },
                {
                  key: "creator",
                  label: "Creator",
                  value: (
                    <EntityLink kind="user" id={item.creatorId}>
                      @{item.creatorUsername}
                    </EntityLink>
                  ),
                },
                { key: "audience", label: "Audience", value: AUDIENCE_LABELS[item.audience] },
                { key: "media", label: "Media", value: item.media === "video" ? "Video" : "Photo" },
                { key: "published", label: "Published", value: formatDateTime(item.publishedAt) },
                { key: "reports", label: "Reports", value: item.reportCount },
              ]}
            />
          </DetailSection>
        </>
      ) : null}
    </DetailDrawer>
  );
}

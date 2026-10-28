"use client";

import { Alert, Button, Table, type TableColumnsType, type TableProps } from "antd";
import type { SorterResult } from "antd/es/table/interface";
import type { Key, ReactNode } from "react";
import styled from "styled-components";
import { useDelayedFlag } from "@/lib/hooks/useDelayedFlag";
import type { PageChange, SortChange } from "@/store/listState";
import type { AsyncStatus, ServiceError, SortOrder } from "@/types/api";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { TableSkeleton } from "./LoadingSkeleton";

export interface DataTablePagination {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
}

interface DataTableProps<T extends object> {
  /** Accessible name for the table, e.g. "User directory". */
  ariaLabel: string;
  columns: TableColumnsType<T>;
  data: T[];
  rowKey: Extract<keyof T, string> | ((record: T) => Key);
  status: AsyncStatus;
  error?: ServiceError | null;
  onRetry?: () => void;
  /** Server-style pagination. Omit to show all rows. */
  pagination?: DataTablePagination;
  /** Current sort, so sortable columns reflect Redux state. Columns sort by their `key`. */
  sort?: SortChange;
  onPageChange?: (change: PageChange) => void;
  onSortChange?: (change: SortChange) => void;
  onRowClick?: (record: T) => void;
  emptyTitle?: string;
  emptyDescription?: ReactNode;
  emptyAction?: ReactNode;
  /** Content shown above the table inside the same surface, e.g. a FilterBar. */
  toolbar?: ReactNode;
  size?: TableProps<T>["size"];
}

const Surface = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.card};
  box-shadow: ${({ theme }) => theme.shadows.card};
  overflow: hidden;
`;

const Toolbar = styled.div`
  padding: ${({ theme }) => theme.space(4)} ${({ theme }) => theme.space(4)} 0;
`;

const Body = styled.div<{ $clickable: boolean }>`
  .ant-table-wrapper .ant-pagination {
    padding: 0 ${({ theme }) => theme.space(4)};
  }

  .ant-table-thead > tr > th {
    font-size: ${({ theme }) => theme.font.sizeSm};
    font-weight: 600;
    text-transform: none;
  }

  ${({ $clickable, theme }) =>
    $clickable &&
    `
    .ant-table-tbody > tr.ant-table-row {
      cursor: pointer;
    }

    .ant-table-tbody > tr.ant-table-row:focus-visible {
      outline: 2px solid ${theme.colors.focusRing};
      outline-offset: -2px;
    }
  `}
`;

const Placeholder = styled.div`
  min-height: 320px;
`;

const InlineAlert = styled(Alert)`
  margin: ${({ theme }) => theme.space(4)} ${({ theme }) => theme.space(4)} 0;
`;

function withControlledSort<T>(
  columns: TableColumnsType<T>,
  sort?: SortChange,
): TableColumnsType<T> {
  if (!sort) return columns;
  return columns.map((column) => {
    if (!("sorter" in column) || !column.sorter || column.key === undefined) return column;
    return {
      ...column,
      sortOrder: column.key === sort.sortField ? (sort.sortOrder ?? null) : null,
    };
  });
}

/**
 * Table for directory screens. First load shows a skeleton, refetches keep existing rows with
 * an overlay, failures show a retry, and empty results show an empty state.
 */
export function DataTable<T extends object>({
  ariaLabel,
  columns,
  data,
  rowKey,
  status,
  error,
  onRetry,
  pagination,
  sort,
  onPageChange,
  onSortChange,
  onRowClick,
  emptyTitle = "No results",
  emptyDescription = "Try a different search or reset the filters.",
  emptyAction,
  toolbar,
  size = "middle",
}: DataTableProps<T>) {
  const initialLoad = (status === "loading" || status === "idle") && data.length === 0;
  const showSkeleton = useDelayedFlag(initialLoad);
  const failedWithoutData = status === "failed" && data.length === 0;

  const handleChange: TableProps<T>["onChange"] = (tablePagination, _filters, sorter, extra) => {
    if (extra.action === "sort" && onSortChange) {
      const single = (Array.isArray(sorter) ? sorter[0] : sorter) as SorterResult<T> | undefined;
      const order = (single?.order ?? undefined) as SortOrder | undefined;
      onSortChange({
        sortField: order && single?.columnKey !== undefined ? String(single.columnKey) : undefined,
        sortOrder: order,
      });
    }
    if (extra.action === "paginate" && onPageChange) {
      onPageChange({
        page: tablePagination.current ?? 1,
        pageSize: tablePagination.pageSize,
      });
    }
  };

  let content: ReactNode;
  if (initialLoad) {
    content = showSkeleton ? (
      <TableSkeleton bare rows={Math.min(pagination?.pageSize ?? 8, 10)} />
    ) : (
      <Placeholder aria-busy="true" />
    );
  } else if (failedWithoutData) {
    content = (
      <ErrorState
        title="This list could not be loaded"
        message={error?.message}
        onRetry={onRetry}
      />
    );
  } else {
    content = (
      <Body $clickable={Boolean(onRowClick)} aria-busy={status === "loading"}>
        {status === "failed" ? (
          <InlineAlert
            type="error"
            showIcon
            title={
              error?.message ?? "The latest update could not be loaded. Showing previous results."
            }
            action={
              onRetry ? (
                <Button size="small" onClick={onRetry}>
                  Try again
                </Button>
              ) : undefined
            }
          />
        ) : null}
        <Table<T>
          aria-label={ariaLabel}
          columns={withControlledSort(columns, sort)}
          dataSource={data}
          rowKey={rowKey}
          size={size}
          loading={status === "loading"}
          onChange={handleChange}
          scroll={{ x: "max-content" }}
          sticky={{ offsetHeader: 64 }}
          showSorterTooltip={false}
          locale={{
            emptyText: (
              <EmptyState
                compact
                title={emptyTitle}
                description={emptyDescription}
                action={emptyAction}
              />
            ),
          }}
          onRow={
            onRowClick
              ? (record) => ({
                  tabIndex: 0,
                  onClick: () => onRowClick(record),
                  onKeyDown: (event) => {
                    if (event.key === "Enter") onRowClick(record);
                  },
                })
              : undefined
          }
          pagination={
            pagination
              ? {
                  current: pagination.page,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  showSizeChanger: true,
                  pageSizeOptions: pagination.pageSizeOptions ?? [10, 20, 50],
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
                }
              : false
          }
        />
      </Body>
    );
  }

  return (
    <Surface>
      {toolbar ? <Toolbar>{toolbar}</Toolbar> : null}
      {content}
    </Surface>
  );
}

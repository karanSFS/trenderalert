"use client";

import { ReloadOutlined } from "@ant-design/icons";
import { Button, DatePicker, Select } from "antd";
import dayjs from "dayjs";
import type { ReactNode } from "react";
import styled from "styled-components";
import { countActiveFilters } from "@/store/listState";
import type { IsoDateString, Option } from "@/types/common";
import { SearchInput } from "./SearchInput";

/** Stored as ISO date strings (UTC days) so the value is serializable in Redux. */
export type DateRangeValue = [IsoDateString, IsoDateString] | null;

type FilterKey<TFilters> = Extract<keyof TFilters, string>;

export type FilterDefinition<TFilters> =
  | {
      type: "select";
      key: FilterKey<TFilters>;
      label: string;
      options: Option[];
      width?: number;
    }
  | {
      type: "multiSelect";
      key: FilterKey<TFilters>;
      label: string;
      options: Option[];
      width?: number;
    }
  | {
      type: "dateRange";
      key: FilterKey<TFilters>;
      label: string;
    };

interface FilterBarProps<TFilters extends object> {
  search?: {
    value: string;
    onSearch: (value: string) => void;
    ariaLabel: string;
    placeholder?: string;
  };
  filters?: FilterDefinition<TFilters>[];
  values: TFilters;
  onFiltersChange: (change: Partial<TFilters>) => void;
  onReset: () => void;
  /** Right-aligned actions such as export or create buttons. */
  extra?: ReactNode;
}

const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.space(3)};
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

const Search = styled.div`
  flex: 1 1 260px;
  max-width: 360px;

  @media (max-width: 575px) {
    max-width: none;
  }
`;

const Control = styled.div<{ $width: number }>`
  flex: 0 1 ${({ $width }) => $width}px;
  min-width: 140px;

  @media (max-width: 575px) {
    flex: 1 1 100%;
  }

  .ant-select,
  .ant-picker {
    width: 100%;
  }
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(2)};
  font-size: ${({ theme }) => theme.font.sizeSm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Extra = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space(2)};
  margin-left: auto;
`;

function toDayjsRange(value: unknown): [dayjs.Dayjs, dayjs.Dayjs] | null {
  if (!Array.isArray(value) || value.length !== 2) return null;
  return [dayjs(value[0]), dayjs(value[1])];
}

/** Search plus declarative filters for directory screens. */
export function FilterBar<TFilters extends object>({
  search,
  filters = [],
  values,
  onFiltersChange,
  onReset,
  extra,
}: FilterBarProps<TFilters>) {
  const activeCount = countActiveFilters(values) + (search?.value ? 1 : 0);
  const change = (key: FilterKey<TFilters>, value: unknown) =>
    onFiltersChange({ [key]: value } as Partial<TFilters>);

  return (
    <Bar role="search">
      {search ? (
        <Search>
          <SearchInput
            value={search.value}
            onSearch={search.onSearch}
            ariaLabel={search.ariaLabel}
            placeholder={search.placeholder}
          />
        </Search>
      ) : null}

      {filters.map((filter) => {
        const current = values[filter.key as keyof TFilters] as unknown;
        if (filter.type === "dateRange") {
          return (
            <Control key={filter.key} $width={260}>
              <DatePicker.RangePicker
                aria-label={filter.label}
                placeholder={[`${filter.label}: start`, "End"]}
                value={toDayjsRange(current)}
                onChange={(range) =>
                  change(
                    filter.key,
                    range && range[0] && range[1]
                      ? [range[0].startOf("day").toISOString(), range[1].endOf("day").toISOString()]
                      : null,
                  )
                }
              />
            </Control>
          );
        }
        const multiple = filter.type === "multiSelect";
        return (
          <Control key={filter.key} $width={filter.width ?? 180}>
            <Select
              aria-label={filter.label}
              placeholder={filter.label}
              allowClear
              mode={multiple ? "multiple" : undefined}
              maxTagCount="responsive"
              options={filter.options}
              value={(current as string | string[] | undefined) ?? (multiple ? [] : undefined)}
              onChange={(next) => change(filter.key, next ?? (multiple ? [] : undefined))}
            />
          </Control>
        );
      })}

      {activeCount > 0 ? (
        <Meta>
          <span aria-live="polite">
            {activeCount} {activeCount === 1 ? "filter" : "filters"} active
          </span>
          <Button size="small" type="link" icon={<ReloadOutlined />} onClick={onReset}>
            Reset filters
          </Button>
        </Meta>
      ) : null}

      {extra ? <Extra>{extra}</Extra> : null}
    </Bar>
  );
}

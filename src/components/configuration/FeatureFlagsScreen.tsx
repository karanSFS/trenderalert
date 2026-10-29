"use client";

import { LockOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Select, Switch, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Can } from "@/components/auth/Can";
import { ErrorState } from "@/components/ui/ErrorState";
import { FormModal } from "@/components/ui/FormModal";
import { Identity } from "@/components/ui/Identity";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowActions } from "@/components/ui/RowActions";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { selectFeatureFlags, selectPlatformMetrics } from "@/features/moduleSelectors";
import {
  fetchFeatureFlags,
  fetchPlatformMetrics,
  saveFeatureFlag,
} from "@/features/platform/platformSlices";
import { ACTIVATION_GATED_FLAGS, type FeatureFlag } from "@/features/platform/platformTypes";
import { formatDateTime } from "@/lib/formatters/date";
import { humanizeCode } from "@/lib/formatters/text";
import { useAdminLabel } from "@/lib/hooks/useAdminLabel";
import { useApiAction } from "@/lib/hooks/useApiAction";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const Banner = styled(Alert)`
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

const Payload = styled.dl`
  display: grid;
  grid-template-columns: auto auto;
  gap: 2px ${({ theme }) => theme.space(3)};
  margin: 0;
  font-size: ${({ theme }) => theme.font.sizeSm};

  dt {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  dd {
    margin: 0;
    font-variant-numeric: tabular-nums;
  }
`;

const PayloadRow = styled.div`
  display: contents;
`;

const Badges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const KEY_PATTERN = /^[A-Z][A-Z0-9_]{2,63}$/;

interface FlagValues {
  key: string;
  enabled: boolean;
  regions: string[];
  payload: string;
  justification: string;
}

const isGated = (key: string) => ACTIVATION_GATED_FLAGS.includes(key);

function parsePayload(text: string): Record<string, unknown> {
  const value = JSON.parse(text || "{}") as unknown;
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("not an object");
  return value as Record<string, unknown>;
}

function PayloadSummary({ payload }: { payload: Record<string, unknown> }) {
  const entries = Object.entries(payload);
  if (entries.length === 0) return <span>—</span>;
  return (
    <Payload>
      {entries.map(([key, value]) => (
        <PayloadRow key={key}>
          <dt>{humanizeCode(key)}</dt>
          <dd>{typeof value === "object" ? JSON.stringify(value) : String(value)}</dd>
        </PayloadRow>
      ))}
    </Payload>
  );
}

export function FeatureFlagsScreen() {
  const dispatch = useAppDispatch();
  const { data, status, error } = useAppSelector(selectFeatureFlags);
  const metrics = useAppSelector(selectPlatformMetrics);
  const adminLabel = useAdminLabel();
  const { run } = useApiAction();
  const [editing, setEditing] = useState<FeatureFlag | "new" | null>(null);
  const current = editing && editing !== "new" ? editing : null;
  const killSwitches = metrics.data?.activeKillSwitches ?? [];

  const reload = () => {
    dispatch(fetchFeatureFlags());
    dispatch(fetchPlatformMetrics());
  };

  useEffect(() => {
    dispatch(fetchFeatureFlags());
    dispatch(fetchPlatformMetrics());
  }, [dispatch]);

  if (!data) {
    if (status === "failed")
      return (
        <ErrorState
          title="Feature flags could not be loaded"
          message={error?.message}
          onRetry={reload}
        />
      );
    return <PageSkeleton />;
  }

  const open = (flag: FeatureFlag | "new") => setEditing(flag);
  const gatedOff = Boolean(current && isGated(current.key) && !current.enabled);

  return (
    <>
      <PageHeader
        eyebrow="Configuration"
        title="Feature flags"
        subtitle="Runtime flags, kill switches and algorithm settings from the TrenderAlert backend. Every change needs a justification and is written to the audit log."
        actions={
          <>
            <Button icon={<ReloadOutlined />} onClick={reload} loading={status === "loading"}>
              Refresh
            </Button>
            <Can permission="configuration:manage">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => open("new")}>
                New flag
              </Button>
            </Can>
          </>
        }
      />
      <Banner
        type="warning"
        showIcon
        icon={<LockOutlined />}
        title="Paid contests stay off"
        description="ENABLE_PAID_CONTESTS cannot be switched on from the portal until legal, payment-provider and operations approvals exist."
      />
      <SectionCard title={`Flags (${data.length})`}>
        <Table<FeatureFlag>
          size="small"
          rowKey="key"
          pagination={false}
          dataSource={data}
          scroll={{ x: 900 }}
          locale={{ emptyText: "No feature flags are defined." }}
          columns={[
            {
              key: "key",
              title: "Flag",
              render: (_, flag) => (
                <Identity>
                  <strong>{humanizeCode(flag.key)}</strong>
                  <span>{flag.key}</span>
                </Identity>
              ),
            },
            {
              key: "state",
              title: "State",
              render: (_, flag) => (
                <Badges>
                  <StatusBadge
                    label={flag.enabled ? "On" : "Off"}
                    tone={flag.enabled ? "success" : "neutral"}
                  />
                  {killSwitches.includes(flag.key) ? (
                    <StatusBadge label="Kill switch active" tone="error" />
                  ) : null}
                  {isGated(flag.key) ? (
                    <StatusBadge label="Activation-gated" tone="warning" />
                  ) : null}
                </Badges>
              ),
            },
            {
              key: "regions",
              title: "Regions",
              render: (_, flag) =>
                flag.regions.length
                  ? flag.regions.map((region) => <Tag key={region}>{region}</Tag>)
                  : "All",
            },
            {
              key: "payload",
              title: "Settings",
              render: (_, flag) => <PayloadSummary payload={flag.payload} />,
            },
            {
              key: "updated",
              title: "Last change",
              render: (_, flag) => (
                <Identity>
                  <strong>{formatDateTime(flag.updatedAt)}</strong>
                  <span>{adminLabel(flag.updatedBy)}</span>
                </Identity>
              ),
            },
            {
              key: "actions",
              title: <span className="ta-visually-hidden">Actions</span>,
              width: 56,
              render: (_, flag) => (
                <RowActions
                  ariaLabel={`Actions for ${flag.key}`}
                  items={[
                    {
                      key: "edit",
                      label: "Edit flag",
                      permission: "configuration:manage",
                      onSelect: () => open(flag),
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </SectionCard>

      <FormModal<FlagValues>
        open={editing !== null}
        width={620}
        title={current ? `Edit ${current.key}` : "New feature flag"}
        description="The backend applies the change immediately. Use the justification to explain why."
        submitLabel="Save flag"
        initialValues={
          current
            ? {
                key: current.key,
                enabled: current.enabled,
                regions: current.regions,
                payload: JSON.stringify(current.payload, null, 2),
              }
            : { enabled: false, regions: [], payload: "{}" }
        }
        onClose={() => setEditing(null)}
        onSubmit={async (values) => {
          const key = values.key.trim();
          await run(
            dispatch(
              saveFeatureFlag({
                key,
                enabled: values.enabled,
                regions: values.regions,
                payload: parsePayload(values.payload),
                justification: values.justification.trim(),
              }),
            ).unwrap(),
            {
              success: `${key} saved`,
              after: () => dispatch(fetchPlatformMetrics()),
            },
          );
        }}
      >
        <Form.Item
          name="key"
          label="Key"
          rules={[
            { required: true, message: "Enter a key." },
            {
              pattern: KEY_PATTERN,
              message: "Use capital letters, digits and underscores, e.g. ENABLE_NEW_FEATURE.",
            },
            {
              validator: (_, value?: string) =>
                current || !data.some((flag) => flag.key === value?.trim())
                  ? Promise.resolve()
                  : Promise.reject(new Error("A flag with this key already exists.")),
            },
          ]}
        >
          <Input disabled={Boolean(current)} placeholder="ENABLE_NEW_FEATURE" />
        </Form.Item>
        <Form.Item
          name="enabled"
          label="Enabled"
          valuePropName="checked"
          extra={
            current && isGated(current.key)
              ? "Activation-gated: this flag cannot be switched on until approvals exist."
              : undefined
          }
          rules={[
            {
              validator: (_, value: boolean) =>
                value && current && isGated(current.key) && !current.enabled
                  ? Promise.reject(
                      new Error("This flag is activation-gated and cannot be enabled."),
                    )
                  : Promise.resolve(),
            },
          ]}
        >
          <Switch disabled={gatedOff} />
        </Form.Item>
        <Form.Item
          name="regions"
          label="Allowed regions"
          extra="Type a region code and press Enter, e.g. US or GLOBAL."
        >
          <Select mode="tags" tokenSeparators={[",", " "]} placeholder="All regions" />
        </Form.Item>
        <Form.Item
          name="payload"
          label="Settings (JSON object)"
          rules={[
            {
              validator: (_, value?: string) => {
                try {
                  parsePayload(value ?? "{}");
                  return Promise.resolve();
                } catch {
                  return Promise.reject(
                    new Error('Enter a valid JSON object, e.g. {"min_age": 18}.'),
                  );
                }
              },
            },
          ]}
        >
          <Input.TextArea autoSize={{ minRows: 4, maxRows: 12 }} spellCheck={false} />
        </Form.Item>
        <Form.Item
          name="justification"
          label="Justification"
          rules={[
            { required: true, whitespace: true, message: "A justification is required." },
            { min: 10, message: "Enter at least 10 characters." },
          ]}
        >
          <Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} maxLength={500} showCount />
        </Form.Item>
      </FormModal>
    </>
  );
}

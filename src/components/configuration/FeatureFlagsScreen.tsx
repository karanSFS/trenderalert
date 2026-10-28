"use client";

import { CheckCircleFilled, CloseCircleFilled, LockOutlined } from "@ant-design/icons";
import { Alert, Form, Input, InputNumber, Switch, Table } from "antd";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { ErrorState } from "@/components/ui/ErrorState";
import { FormModal } from "@/components/ui/FormModal";
import { Identity } from "@/components/ui/Identity";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowActions } from "@/components/ui/RowActions";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { fetchConfiguration, updateFeatureFlag } from "@/features/configuration/configurationSlice";
import type { FeatureFlag } from "@/features/configuration/configurationTypes";
import { selectConfiguration } from "@/features/moduleSelectors";
import { formatDateTime } from "@/lib/formatters/date";
import { useDemoAction } from "@/lib/hooks/useDemoAction";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const Banner = styled(Alert)`
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

const Gates = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 4px;

  li {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: ${({ theme }) => theme.font.sizeSm};
  }
`;

const GateIcon = styled.span<{ $ok: boolean }>`
  color: ${({ $ok, theme }) => ($ok ? theme.colors.success : theme.colors.error)};
`;

interface FlagValues {
  enabled: boolean;
  rollout: number;
  reason: string;
}

const missingGates = (flag: FeatureFlag) => flag.gates.filter((gate) => !gate.satisfied);

function editBlock(flag: FeatureFlag): string | null {
  const missing = missingGates(flag);
  if (flag.activationGated && missing.length > 0)
    return `Activation is blocked until these gates are recorded: ${missing.map((gate) => gate.label).join(", ")}.`;
  return null;
}

export function FeatureFlagsScreen() {
  const dispatch = useAppDispatch();
  const { data, status, error } = useAppSelector(selectConfiguration);
  const { run } = useDemoAction();
  const [editing, setEditing] = useState<FeatureFlag | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    dispatch(fetchConfiguration());
  }, [dispatch]);

  if (!data) {
    if (status === "failed")
      return (
        <ErrorState
          title="Feature flags could not be loaded"
          message={error?.message}
          onRetry={() => dispatch(fetchConfiguration())}
        />
      );
    return <PageSkeleton />;
  }

  const open = (flag: FeatureFlag) => {
    setEnabled(flag.enabled);
    setEditing(flag);
  };
  const editingMissing = editing ? missingGates(editing) : [];

  return (
    <>
      <PageHeader
        eyebrow="Configuration"
        title="Feature flags"
        subtitle="Owner-controlled flags. Gates are recorded by the responsible teams in the backend and are read-only here."
      />
      <Banner
        type="warning"
        showIcon
        icon={<LockOutlined />}
        title="Paid contests stay off"
        description="The paid contests flag cannot be enabled until legal, payment-provider, store-policy, fraud-control, official-rules and operations gates are all recorded."
      />
      <SectionCard title="Flags">
        <Table<FeatureFlag>
          size="small"
          rowKey="key"
          pagination={false}
          dataSource={data.flags}
          scroll={{ x: 860 }}
          columns={[
            {
              key: "name",
              title: "Flag",
              render: (_, flag) => (
                <Identity>
                  <strong>{flag.name}</strong>
                  <span>{flag.description}</span>
                </Identity>
              ),
            },
            {
              key: "state",
              title: "State",
              render: (_, flag) => (
                <StatusBadge
                  label={flag.enabled ? `On · ${flag.rollout}%` : "Off"}
                  tone={flag.enabled ? "success" : "neutral"}
                />
              ),
            },
            { key: "audience", title: "Audience", dataIndex: "audience" },
            {
              key: "gates",
              title: "Gates",
              render: (_, flag) =>
                flag.gates.length > 0 ? (
                  <Gates>
                    {flag.gates.map((gate) => (
                      <li key={gate.id}>
                        <GateIcon $ok={gate.satisfied} aria-hidden="true">
                          {gate.satisfied ? <CheckCircleFilled /> : <CloseCircleFilled />}
                        </GateIcon>
                        {gate.label}: {gate.satisfied ? "recorded" : "outstanding"}
                      </li>
                    ))}
                  </Gates>
                ) : (
                  "—"
                ),
            },
            {
              key: "updated",
              title: "Last change",
              render: (_, flag) => (
                <Identity>
                  <strong>{formatDateTime(flag.updatedAt)}</strong>
                  <span>{flag.updatedBy}</span>
                </Identity>
              ),
            },
            {
              key: "actions",
              title: <span className="ta-visually-hidden">Actions</span>,
              width: 56,
              render: (_, flag) => {
                const blocked = editBlock(flag);
                return (
                  <RowActions
                    ariaLabel={`Actions for ${flag.name}`}
                    items={[
                      {
                        key: "edit",
                        label: "Change state or rollout",
                        permission: "configuration:manage",
                        disabled: blocked !== null,
                        disabledReason: blocked ?? undefined,
                        onSelect: () => open(flag),
                      },
                    ]}
                  />
                );
              },
            },
          ]}
        />
      </SectionCard>

      <FormModal<FlagValues>
        open={editing !== null}
        title={editing ? `Change "${editing.name}"` : "Change flag"}
        description={editing ? `${editing.description} Audience: ${editing.audience}.` : undefined}
        submitLabel="Save flag"
        initialValues={editing ? { enabled: editing.enabled, rollout: editing.rollout } : undefined}
        onClose={() => setEditing(null)}
        onSubmit={async (values) => {
          if (!editing) return;
          const rollout = values.enabled ? values.rollout : 0;
          await run(
            dispatch(
              updateFeatureFlag({
                key: editing.key,
                enabled: values.enabled,
                rollout,
                reason: values.reason,
              }),
            ).unwrap(),
            {
              success: `${editing.name}: ${values.enabled ? `on at ${rollout}%` : "off"}`,
              audit: () => ({
                action: "featureFlag.update",
                targetType: "featureFlag",
                targetId: editing.key,
                summary: `Set "${editing.name}" ${values.enabled ? `on at ${rollout}%` : "off"}`,
                reason: values.reason,
              }),
            },
          );
        }}
      >
        {editingMissing.length > 0 ? (
          <Banner
            type="warning"
            showIcon
            title="Rollout cannot increase"
            description={`Outstanding gates: ${editingMissing.map((gate) => gate.label).join(", ")}. You can reduce or turn off this flag.`}
          />
        ) : null}
        <Form.Item name="enabled" label="Enabled" valuePropName="checked">
          <Switch onChange={setEnabled} />
        </Form.Item>
        <Form.Item
          name="rollout"
          label="Rollout percentage"
          rules={[
            {
              required: true,
              type: "integer",
              min: 0,
              max: 100,
              message: "Enter a whole number from 0 to 100.",
            },
          ]}
        >
          <InputNumber min={0} max={100} precision={0} suffix="%" disabled={!enabled} />
        </Form.Item>
        <Form.Item
          name="reason"
          label="Reason"
          rules={[
            { required: true, whitespace: true, min: 10, message: "Enter at least 10 characters." },
          ]}
        >
          <Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} maxLength={500} showCount />
        </Form.Item>
      </FormModal>
    </>
  );
}

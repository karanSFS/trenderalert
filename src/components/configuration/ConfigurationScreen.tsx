"use client";

import { PlusOutlined } from "@ant-design/icons";
import { Alert, Button, DatePicker, Form, Input, InputNumber, Select, Table, Tabs } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { DetailList } from "@/components/ui/DetailDrawer";
import { ErrorState } from "@/components/ui/ErrorState";
import { FormModal } from "@/components/ui/FormModal";
import { Identity } from "@/components/ui/Identity";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowActions } from "@/components/ui/RowActions";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useConfirm } from "@/components/ui/useConfirm";
import { usePermission } from "@/features/auth/usePermission";
import {
  endAnnouncement,
  fetchConfiguration,
  saveAnnouncement,
  updateSettings,
} from "@/features/configuration/configurationSlice";
import type {
  Announcement,
  AnnouncementAudience,
  ConfigurationData,
  PolicyVersion,
} from "@/features/configuration/configurationTypes";
import { selectConfiguration } from "@/features/moduleSelectors";
import {
  ANNOUNCEMENT_STATUS,
  AUDIENCE_TARGET_LABELS,
  POLICY_KIND_LABELS,
} from "@/lib/constants/operationalLabels";
import { toOptions } from "@/lib/constants/statusLabels";
import { getErrorMessage } from "@/lib/errors";
import { formatDate, formatDateTime } from "@/lib/formatters/date";
import { useDemoAction } from "@/lib/hooks/useDemoAction";
import type { EditableSettings } from "@/services/contracts/operationalServices";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const MAX_TREND_DURATION_DAYS = 30;
const DURATION_OPTIONS = Array.from({ length: MAX_TREND_DURATION_DAYS }, (_, index) => ({
  value: index + 1,
  label: `${index + 1} day${index === 0 ? "" : "s"}`,
}));

const Banner = styled(Alert)`
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

const TabStack = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.space(4)};
`;

const SettingsForm = styled.div`
  max-width: 560px;
`;

const Muted = styled.small`
  color: ${({ theme }) => theme.colors.textTertiary};
`;

export function ConfigurationScreen() {
  const dispatch = useAppDispatch();
  const { data, status, error } = useAppSelector(selectConfiguration);
  const canManage = usePermission("configuration:manage");

  useEffect(() => {
    dispatch(fetchConfiguration());
  }, [dispatch]);

  if (!data) {
    if (status === "failed")
      return (
        <ErrorState
          title="Configuration could not be loaded"
          message={error?.message}
          onRetry={() => dispatch(fetchConfiguration())}
        />
      );
    return <PageSkeleton />;
  }

  return (
    <>
      <PageHeader
        eyebrow="Configuration"
        title="Platform settings"
        subtitle="Approved settings, announcements and policy versions. Changes apply to the demo only."
        actions={<Link href="/admin/configuration/feature-flags">Feature flags</Link>}
      />
      {canManage ? null : (
        <Banner
          type="info"
          showIcon
          title="Read-only"
          description="Your role can view configuration but not change it."
        />
      )}
      <Tabs
        items={[
          {
            key: "settings",
            label: "Settings",
            children: <SettingsTab data={data} canManage={canManage} />,
          },
          {
            key: "announcements",
            label: "Announcements",
            children: <AnnouncementsTab data={data} canManage={canManage} />,
          },
          {
            key: "policies",
            label: "Policy versions",
            children: <PoliciesTab policies={data.policies} />,
          },
        ]}
      />
    </>
  );
}

function SettingsTab({ data, canManage }: { data: ConfigurationData; canManage: boolean }) {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm<EditableSettings>();
  const { run } = useDemoAction();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { settings } = data;

  const submit = async (values: EditableSettings) => {
    setSaving(true);
    setSaveError(null);
    try {
      await run(dispatch(updateSettings(values)).unwrap(), {
        success: "Settings saved",
        audit: () => ({
          action: "configuration.settings",
          targetType: "configuration",
          targetId: "platform-settings",
          summary: "Updated platform settings",
        }),
      });
    } catch (failure) {
      setSaveError(
        getErrorMessage(failure, "The settings could not be saved. Nothing was changed."),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <TabStack>
      <SectionCard title="Editable settings">
        <SettingsForm>
          <Form<EditableSettings>
            form={form}
            layout="vertical"
            disabled={!canManage || saving}
            initialValues={{
              trendDurationsDays: settings.trendDurationsDays,
              maxSavedFolders: settings.maxSavedFolders,
              reportRateLimitPerHour: settings.reportRateLimitPerHour,
              adminSessionTimeoutMinutes: settings.adminSessionTimeoutMinutes,
            }}
            onFinish={submit}
          >
            <Form.Item
              name="trendDurationsDays"
              label="Trend durations offered to creators"
              extra={`Public discovery is limited to ${MAX_TREND_DURATION_DAYS} days.`}
              rules={[
                { required: true, type: "array", min: 1, message: "Keep at least one duration." },
              ]}
            >
              <Select mode="multiple" options={DURATION_OPTIONS} />
            </Form.Item>
            <Form.Item
              name="maxSavedFolders"
              label="Saved folders per member"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} max={100} precision={0} />
            </Form.Item>
            <Form.Item
              name="reportRateLimitPerHour"
              label="Reports per member per hour"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} max={60} precision={0} />
            </Form.Item>
            <Form.Item
              name="adminSessionTimeoutMinutes"
              label="Admin session timeout"
              rules={[{ required: true }]}
            >
              <InputNumber min={5} max={60} precision={0} suffix="minutes" />
            </Form.Item>
            {saveError ? <Banner type="error" showIcon title={saveError} /> : null}
            {canManage ? (
              <Button type="primary" htmlType="submit" loading={saving}>
                Save settings
              </Button>
            ) : null}
          </Form>
        </SettingsForm>
      </SectionCard>
      <SectionCard title="Fixed by policy">
        <DetailList
          items={[
            {
              key: "grace",
              label: "Account deletion grace period",
              value: `${settings.deletionGraceDays} days`,
            },
            {
              key: "warnings",
              label: "Pre-expiration warnings",
              value: `${settings.preExpirationWarnings} per Trend`,
            },
            {
              key: "ageSocial",
              label: "Minimum age (social features)",
              value: settings.minimumAgeSocial,
            },
            {
              key: "agePaid",
              label: "Minimum age (paid contests)",
              value: settings.minimumAgePaidContests,
            },
            {
              key: "price",
              label: "Premium price",
              value: "Configured remotely in the App Store and Google Play",
            },
          ]}
        />
        <Muted>
          These values come from the approved specification and legal requirements. They cannot be
          changed here.
        </Muted>
      </SectionCard>
    </TabStack>
  );
}

interface AnnouncementValues {
  title: string;
  body: string;
  audience: AnnouncementAudience;
  window: [Dayjs, Dayjs];
}

function AnnouncementsTab({ data, canManage }: { data: ConfigurationData; canManage: boolean }) {
  const dispatch = useAppDispatch();
  const { run } = useDemoAction();
  const { confirm, dialog } = useConfirm();
  const [editing, setEditing] = useState<Announcement | "new" | null>(null);
  const current = editing && editing !== "new" ? editing : null;

  const end = (item: Announcement) =>
    confirm({
      title: `End "${item.title}"`,
      consequences: [
        "The announcement stops showing immediately.",
        "It stays in the list as Ended.",
      ],
      confirmLabel: "End announcement",
      danger: true,
      onConfirm: () =>
        run(dispatch(endAnnouncement(item.id)).unwrap(), {
          success: "Announcement ended",
          audit: () => ({
            action: "configuration.announcement.end",
            targetType: "configuration",
            targetId: item.id,
            summary: `Ended announcement "${item.title}"`,
          }),
        }),
    });

  return (
    <SectionCard
      title="Announcements"
      extra={
        canManage ? (
          <Button size="small" icon={<PlusOutlined />} onClick={() => setEditing("new")}>
            New announcement
          </Button>
        ) : null
      }
    >
      <Table<Announcement>
        size="small"
        rowKey="id"
        pagination={false}
        dataSource={data.announcements}
        scroll={{ x: 720 }}
        columns={[
          {
            key: "title",
            title: "Announcement",
            render: (_, item) => (
              <Identity>
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </Identity>
            ),
          },
          {
            key: "audience",
            title: "Audience",
            render: (_, item) => AUDIENCE_TARGET_LABELS[item.audience],
          },
          {
            key: "window",
            title: "Window",
            render: (_, item) => (
              <Identity>
                <strong>{formatDateTime(item.startsAt)}</strong>
                <span>to {formatDateTime(item.endsAt)}</span>
              </Identity>
            ),
          },
          {
            key: "status",
            title: "Status",
            render: (_, item) => <StatusBadge {...ANNOUNCEMENT_STATUS[item.status]} />,
          },
          {
            key: "actions",
            title: <span className="ta-visually-hidden">Actions</span>,
            width: 56,
            render: (_, item) => (
              <RowActions
                ariaLabel={`Actions for ${item.title}`}
                items={[
                  {
                    key: "edit",
                    label: "Edit",
                    permission: "configuration:manage",
                    disabled: item.status === "ended",
                    disabledReason: "Ended announcements cannot be edited.",
                    onSelect: () => setEditing(item),
                  },
                  {
                    key: "end",
                    label: "End now",
                    permission: "configuration:manage",
                    danger: true,
                    disabled: item.status === "ended",
                    disabledReason: "Already ended.",
                    onSelect: () => end(item),
                  },
                ]}
              />
            ),
          },
        ]}
      />
      <FormModal<AnnouncementValues>
        open={editing !== null}
        title={current ? `Edit "${current.title}"` : "New announcement"}
        description="Announcements appear in the app for the selected audience during the window."
        submitLabel={current ? "Save announcement" : "Schedule announcement"}
        width={600}
        initialValues={
          current
            ? {
                title: current.title,
                body: current.body,
                audience: current.audience,
                window: [dayjs(current.startsAt), dayjs(current.endsAt)],
              }
            : { audience: "all_members" }
        }
        onClose={() => setEditing(null)}
        onSubmit={async ({ window, ...values }) => {
          await run(
            dispatch(
              saveAnnouncement({
                ...values,
                id: current?.id,
                startsAt: window[0].toISOString(),
                endsAt: window[1].toISOString(),
              }),
            ).unwrap(),
            {
              success: current ? "Announcement updated" : "Announcement scheduled",
              audit: () => ({
                action: current
                  ? "configuration.announcement.update"
                  : "configuration.announcement.create",
                targetType: "configuration",
                targetId: current?.id ?? "announcement",
                summary: `${current ? "Updated" : "Created"} announcement "${values.title.trim()}"`,
              }),
            },
          );
        }}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, whitespace: true, min: 5, max: 80 }]}
        >
          <Input maxLength={80} showCount />
        </Form.Item>
        <Form.Item
          name="body"
          label="Message"
          rules={[{ required: true, whitespace: true, min: 10, max: 280 }]}
        >
          <Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} maxLength={280} showCount />
        </Form.Item>
        <Form.Item name="audience" label="Audience" rules={[{ required: true }]}>
          <Select options={toOptions(AUDIENCE_TARGET_LABELS)} />
        </Form.Item>
        <Form.Item
          name="window"
          label="Show from and until"
          rules={[
            { required: true, message: "Choose a start and end time." },
            {
              validator: (_, value?: [Dayjs, Dayjs]) =>
                !value || value[1].isAfter(value[0])
                  ? Promise.resolve()
                  : Promise.reject(new Error("End time must be after the start time.")),
            },
          ]}
        >
          <DatePicker.RangePicker showTime={{ format: "HH:mm" }} format="YYYY-MM-DD HH:mm" />
        </Form.Item>
      </FormModal>
      {dialog}
    </SectionCard>
  );
}

function PoliciesTab({ policies }: { policies: PolicyVersion[] }) {
  return (
    <SectionCard title="Policy versions">
      <Banner
        type="info"
        showIcon
        title="Publishing requires legal approval"
        description="Policy text is approved and published outside this portal. Drafts are shown for tracking only."
      />
      <Table<PolicyVersion>
        size="small"
        rowKey="id"
        pagination={false}
        dataSource={policies}
        scroll={{ x: 720 }}
        columns={[
          {
            key: "kind",
            title: "Policy",
            render: (_, policy) => (
              <Identity>
                <strong>{POLICY_KIND_LABELS[policy.kind]}</strong>
                <span>{policy.summary}</span>
              </Identity>
            ),
          },
          { key: "version", title: "Version", dataIndex: "version" },
          {
            key: "status",
            title: "Status",
            render: (_, policy) => (
              <StatusBadge
                label={
                  policy.status === "published"
                    ? "Published"
                    : policy.status === "draft"
                      ? "Draft"
                      : "Superseded"
                }
                tone={
                  policy.status === "published"
                    ? "success"
                    : policy.status === "draft"
                      ? "warning"
                      : "neutral"
                }
              />
            ),
          },
          {
            key: "effective",
            title: "Effective",
            render: (_, policy) => (policy.effectiveAt ? formatDate(policy.effectiveAt) : "—"),
          },
          {
            key: "consent",
            title: "Renewed consent",
            render: (_, policy) => (policy.requiresRenewedConsent ? "Required" : "Not required"),
          },
        ]}
      />
    </SectionCard>
  );
}

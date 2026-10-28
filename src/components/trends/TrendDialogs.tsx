"use client";

import { Alert, Form, Input, Select } from "antd";
import styled from "styled-components";
import { FormModal } from "@/components/ui/FormModal";
import { useEffect } from "react";
import { trendsSelectors } from "@/features/moduleSelectors";
import { correctTrend, fetchTrendContext, mergeTrend } from "@/features/trends/trendsSlice";
import type { TrendRecord } from "@/features/trends/trendsTypes";
import { formatDateTime } from "@/lib/formatters/date";
import { useDemoAction } from "@/lib/hooks/useDemoAction";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { TrendDialog } from "./useTrendActions";

const Note = styled(Alert)`
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

interface TrendDialogsProps {
  dialog: TrendDialog;
  onClose: () => void;
  after: () => void;
}

interface CorrectValues {
  topic: string;
  tags: string[];
  locationLabel: string;
}

interface MergeValues {
  targetId: string;
  reason: string;
}

/** Form dialogs for correcting fields and merging duplicate Trends. */
export function TrendDialogs({ dialog, onClose, after }: TrendDialogsProps) {
  const dispatch = useAppDispatch();
  const { run } = useDemoAction();
  const context = useAppSelector(trendsSelectors.selectContext);
  const trend = dialog?.trend ?? null;
  const merging = dialog?.kind === "merge" ? dialog.trend.id : null;

  useEffect(() => {
    if (merging) dispatch(fetchTrendContext(merging));
  }, [dispatch, merging]);

  const targets = context.id === trend?.id ? (context.data?.mergeTargets ?? []) : [];

  return (
    <>
      <FormModal<CorrectValues>
        open={dialog?.kind === "correct"}
        title={trend ? `Correct fields: ${trend.id}` : "Correct fields"}
        submitLabel="Save corrections"
        initialValues={
          trend
            ? { topic: trend.topic, tags: trend.tags, locationLabel: trend.locationLabel }
            : undefined
        }
        onClose={onClose}
        onSubmit={async (values) => {
          if (!trend) return;
          await run(dispatch(correctTrend({ id: trend.id, correction: values })).unwrap(), {
            success: `${trend.id} corrected`,
            audit: (updated: TrendRecord) => ({
              action: "trend.correct",
              targetType: "trend",
              targetId: updated.id,
              summary: `Corrected fields on ${updated.id}`,
            }),
            after,
          });
        }}
      >
        {trend ? (
          <Note
            type="info"
            showIcon
            title={`Expiration ${formatDateTime(trend.expiresAt)} is fixed at publication`}
            description="Only the topic, tags and location label can be corrected. Expiration, creator and publish time cannot be changed (CNT14-002, TRND-008)."
          />
        ) : null}
        <Form.Item
          name="topic"
          label="Topic"
          rules={[{ required: true, whitespace: true, min: 3, max: 80 }]}
        >
          <Input maxLength={80} showCount />
        </Form.Item>
        <Form.Item
          name="tags"
          label="Tags"
          rules={[{ type: "array", max: 6, message: "Use up to 6 tags." }]}
        >
          <Select mode="tags" tokenSeparators={[","]} placeholder="Add tags" />
        </Form.Item>
        <Form.Item
          name="locationLabel"
          label="Location label"
          extra="Approximate areas only. Never an exact position."
          rules={[{ required: true, whitespace: true, max: 60 }]}
        >
          <Input maxLength={60} />
        </Form.Item>
      </FormModal>

      <FormModal<MergeValues>
        open={dialog?.kind === "merge"}
        title={trend ? `Merge ${trend.id} into another Trend` : "Merge Trend"}
        submitLabel="Merge Trends"
        onClose={onClose}
        onSubmit={async (values) => {
          if (!trend) return;
          await run(
            dispatch(
              mergeTrend({ id: trend.id, targetId: values.targetId, reason: values.reason }),
            ).unwrap(),
            {
              success: `${trend.id} merged into ${values.targetId}`,
              audit: (updated: TrendRecord) => ({
                action: "trend.merge",
                targetType: "trend",
                targetId: updated.id,
                summary: `Merged ${updated.id} into ${values.targetId}`,
                reason: values.reason,
              }),
              after,
            },
          );
        }}
      >
        <Note
          type="warning"
          showIcon
          title="Merging is for duplicate topics"
          description="The source leaves discovery and links to the target's Trend Journey. Original creator credit, publish time and history are kept."
        />
        <Form.Item
          name="targetId"
          label="Target Trend"
          rules={[{ required: true, message: "Choose the Trend to merge into." }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            loading={context.status === "loading"}
            placeholder="Search active Trends"
            options={targets.map((candidate) => ({
              value: candidate.id,
              label: `${candidate.topic} (${candidate.id})`,
            }))}
          />
        </Form.Item>
        <Form.Item
          name="reason"
          label="Reason"
          rules={[
            { required: true, whitespace: true, min: 10, message: "Enter at least 10 characters." },
          ]}
        >
          <Input.TextArea autoSize={{ minRows: 3, maxRows: 5 }} maxLength={500} showCount />
        </Form.Item>
      </FormModal>
    </>
  );
}

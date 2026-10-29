"use client";

import { Form, Input } from "antd";
import styled from "styled-components";
import { FormModal } from "@/components/ui/FormModal";
import { actOnReport } from "@/features/moderation/moderationSlice";
import type { ModerationAction, ModerationReport } from "@/features/moderation/moderationTypes";
import { categoryLabel, MODERATION_ACTIONS } from "@/lib/constants/moderationLabels";
import { useApiAction } from "@/lib/hooks/useApiAction";
import { useAppDispatch } from "@/store/hooks";

const Consequences = styled.ul`
  margin: 0 0 ${({ theme }) => theme.space(4)};
  padding-left: ${({ theme }) => theme.space(5)};
`;

interface ActionValues {
  justification: string;
  notes?: string;
}

interface ModerationActionModalProps {
  report: ModerationReport | null;
  action: ModerationAction | null;
  onClose: () => void;
  onDone: () => void;
}

/** Collects the mandatory justification and optional notes, then calls the backend. */
export function ModerationActionModal({
  report,
  action,
  onClose,
  onDone,
}: ModerationActionModalProps) {
  const dispatch = useAppDispatch();
  const { run } = useApiAction();
  const spec = action ? MODERATION_ACTIONS[action] : null;

  return (
    <FormModal<ActionValues>
      open={Boolean(report && action)}
      title={
        spec && report ? `${spec.label}: ${categoryLabel(report.category)} report` : "Take action"
      }
      description={
        spec ? (
          <>
            <Consequences>
              {spec.consequences.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </Consequences>
            The justification is stored in the backend audit log.
          </>
        ) : undefined
      }
      submitLabel={spec?.label ?? "Confirm"}
      onClose={onClose}
      onSubmit={async ({ justification, notes }) => {
        if (!report || !action || !spec) return;
        await run(
          dispatch(
            actOnReport({
              id: report.id,
              action,
              justification: justification.trim(),
              notes: notes?.trim() || undefined,
            }),
          ).unwrap(),
          { success: `${spec.label}: done`, after: onDone },
        );
      }}
    >
      <Form.Item
        name="justification"
        label="Justification"
        rules={[
          { required: true, whitespace: true, message: "A justification is required." },
          { min: 10, message: "Enter at least 10 characters." },
        ]}
      >
        <Input.TextArea autoSize={{ minRows: 3, maxRows: 6 }} maxLength={500} showCount />
      </Form.Item>
      <Form.Item name="notes" label="Moderator notes (optional)">
        <Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} maxLength={1000} showCount />
      </Form.Item>
    </FormModal>
  );
}

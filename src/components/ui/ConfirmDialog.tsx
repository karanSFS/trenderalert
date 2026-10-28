"use client";

import { Alert, Form, Input, Modal } from "antd";
import { useState, type ReactNode } from "react";
import styled from "styled-components";
import { getErrorMessage } from "@/lib/errors";

export interface ReasonRequirement {
  label?: string;
  placeholder?: string;
  minLength?: number;
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  /** Plain-language list of what will happen. */
  consequences?: string[];
  confirmLabel?: string;
  danger?: boolean;
  /** Enforcement and other consequential actions require a written reason. */
  requireReason?: boolean | ReasonRequirement;
  /** Rejecting keeps the dialog open and shows the error. Resolving closes it. */
  onConfirm: (reason: string | undefined) => Promise<void>;
  onClose: () => void;
}

const Description = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Consequences = styled.ul`
  margin: ${({ theme }) => theme.space(3)} 0 0;
  padding-left: ${({ theme }) => theme.space(5)};
  color: ${({ theme }) => theme.colors.textPrimary};

  li + li {
    margin-top: ${({ theme }) => theme.space(1)};
  }
`;

const ReasonField = styled(Form.Item)`
  margin: ${({ theme }) => theme.space(4)} 0 0;
`;

const ErrorAlert = styled(Alert)`
  margin-top: ${({ theme }) => theme.space(4)};
`;

const DEFAULT_MIN_REASON = 10;

export function ConfirmDialog({
  open,
  title,
  description,
  consequences,
  confirmLabel = "Confirm",
  danger = false,
  requireReason = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reasonConfig: ReasonRequirement | null = requireReason
    ? typeof requireReason === "object"
      ? requireReason
      : {}
    : null;
  const minLength = reasonConfig?.minLength ?? DEFAULT_MIN_REASON;
  const trimmed = reason.trim();
  const reasonInvalid = reasonConfig !== null && trimmed.length < minLength;

  const handleConfirm = async () => {
    setTouched(true);
    if (reasonInvalid) return;
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(reasonConfig ? trimmed : undefined);
      setSubmitting(false);
      onClose();
    } catch (failure) {
      setSubmitting(false);
      setError(getErrorMessage(failure, "The action could not be completed. Nothing was changed."));
    }
  };

  const reset = () => {
    setReason("");
    setTouched(false);
    setSubmitting(false);
    setError(null);
  };

  return (
    <Modal
      open={open}
      title={title}
      okText={confirmLabel}
      okButtonProps={{ danger }}
      confirmLoading={submitting}
      onOk={handleConfirm}
      onCancel={submitting ? undefined : onClose}
      cancelButtonProps={{ disabled: submitting }}
      mask={{ closable: !submitting }}
      keyboard={!submitting}
      afterClose={reset}
      destroyOnHidden
    >
      {description ? <Description>{description}</Description> : null}
      {consequences && consequences.length > 0 ? (
        <Consequences>
          {consequences.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </Consequences>
      ) : null}
      {reasonConfig ? (
        <Form layout="vertical" requiredMark component="div">
          <ReasonField
            label={reasonConfig.label ?? "Reason"}
            required
            validateStatus={touched && reasonInvalid ? "error" : undefined}
            help={
              touched && reasonInvalid
                ? `Enter at least ${minLength} characters.`
                : "Recorded in the demo audit log."
            }
          >
            <Input.TextArea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={reasonConfig.placeholder ?? "Explain why this action is needed"}
              autoSize={{ minRows: 3, maxRows: 6 }}
              maxLength={500}
              showCount
              disabled={submitting}
            />
          </ReasonField>
        </Form>
      ) : null}
      {error ? <ErrorAlert type="error" showIcon title={error} /> : null}
    </Modal>
  );
}

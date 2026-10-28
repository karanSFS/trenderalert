"use client";

import { Alert, Form, Modal } from "antd";
import { useState, type ReactNode } from "react";
import styled from "styled-components";
import { getErrorMessage } from "@/lib/errors";

interface FormModalProps<TValues extends object> {
  open: boolean;
  title: string;
  description?: ReactNode;
  /** Applied each time the modal opens. */
  initialValues?: Partial<TValues>;
  submitLabel?: string;
  /** Receives validated values. Rejecting keeps the modal open and shows the error. */
  onSubmit: (values: TValues) => Promise<void>;
  onClose: () => void;
  /** `Form.Item` fields with their validation rules. */
  children: ReactNode;
  width?: number;
}

const Description = styled.p`
  margin: 0 0 ${({ theme }) => theme.space(4)};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ErrorAlert = styled(Alert)`
  margin-top: ${({ theme }) => theme.space(2)};
`;

export function FormModal<TValues extends object>({
  open,
  title,
  description,
  initialValues,
  submitLabel = "Save",
  onSubmit,
  onClose,
  children,
  width = 520,
}: FormModalProps<TValues>) {
  const [form] = Form.useForm<TValues>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    let values: TValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(values);
      setSubmitting(false);
      onClose();
    } catch (failure) {
      setSubmitting(false);
      setError(getErrorMessage(failure, "The changes could not be saved. Nothing was changed."));
    }
  };

  return (
    <Modal
      open={open}
      title={title}
      width={width}
      okText={submitLabel}
      confirmLoading={submitting}
      onOk={handleSubmit}
      onCancel={submitting ? undefined : onClose}
      cancelButtonProps={{ disabled: submitting }}
      mask={{ closable: !submitting }}
      keyboard={!submitting}
      afterClose={() => setError(null)}
      destroyOnHidden
    >
      {description ? <Description>{description}</Description> : null}
      <Form<TValues>
        form={form}
        layout="vertical"
        initialValues={initialValues}
        disabled={submitting}
        preserve={false}
        onFinish={handleSubmit}
      >
        {children}
        {/* Lets Enter submit from single-line inputs. */}
        <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
      </Form>
      {error ? <ErrorAlert type="error" showIcon title={error} /> : null}
    </Modal>
  );
}

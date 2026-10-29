"use client";

import { LockOutlined, SearchOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input } from "antd";
import styled from "styled-components";
import { Can } from "@/components/auth/Can";
import { DetailList } from "@/components/ui/DetailDrawer";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { selectSupportLookup } from "@/features/moduleSelectors";
import { lookupSupportUser } from "@/features/platform/platformSlices";
import type { SupportLookupRequest } from "@/features/security/securityTypes";
import { formatDateTime } from "@/lib/formatters/date";
import { humanizeCode } from "@/lib/formatters/text";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const Row = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.space(3)};
  grid-template-columns: 1fr;
  align-items: end;

  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr) auto;
  }

  .ant-form-item {
    margin-bottom: 0;
  }
`;

const Result = styled.div`
  margin-top: ${({ theme }) => theme.space(5)};
  padding-top: ${({ theme }) => theme.space(5)};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const Masked = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-geist-mono), monospace;
`;

const Wrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.space(6)};
`;

const ErrorAlert = styled(Alert)`
  margin-top: ${({ theme }) => theme.space(4)};
`;

/** Privacy-masked account lookup (`POST /admin/support/user-lookup`). A ticket reference is required. */
export function SupportLookupPanel() {
  const dispatch = useAppDispatch();
  const { data, status, error } = useAppSelector(selectSupportLookup);
  const [form] = Form.useForm<SupportLookupRequest>();

  return (
    <Can permission="support:manage">
      <Wrapper>
        <SectionCard title="Account lookup">
          <Form<SupportLookupRequest>
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={(values) =>
              dispatch(
                lookupSupportUser({
                  searchQuery: values.searchQuery.trim(),
                  ticketReference: values.ticketReference.trim(),
                }),
              )
            }
          >
            <Row>
              <Form.Item
                name="searchQuery"
                label="User id, verified email or phone"
                rules={[{ required: true, whitespace: true, message: "Enter what to look up." }]}
              >
                <Input prefix={<SearchOutlined aria-hidden="true" />} autoComplete="off" />
              </Form.Item>
              <Form.Item
                name="ticketReference"
                label="Support ticket reference"
                rules={[
                  { required: true, whitespace: true, message: "A ticket reference is required." },
                ]}
              >
                <Input placeholder="e.g. SUP-1024" autoComplete="off" />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={status === "loading"}>
                Look up
              </Button>
            </Row>
          </Form>

          {status === "failed" && error ? (
            <ErrorAlert
              type={error.code === "NOT_FOUND" ? "info" : "error"}
              showIcon
              title={error.code === "NOT_FOUND" ? "No matching account" : error.message}
              description={error.code === "NOT_FOUND" ? error.message : undefined}
            />
          ) : null}

          {status === "succeeded" && data ? (
            <Result aria-live="polite">
              <DetailList
                items={[
                  { key: "id", label: "User id", value: data.userId, wide: true },
                  {
                    key: "email",
                    label: "Email (masked)",
                    value: (
                      <Masked>
                        <LockOutlined aria-hidden="true" />
                        {data.emailMasked}
                      </Masked>
                    ),
                  },
                  {
                    key: "phone",
                    label: "Phone (masked)",
                    value: data.phoneMasked ? (
                      <Masked>
                        <LockOutlined aria-hidden="true" />
                        {data.phoneMasked}
                      </Masked>
                    ) : (
                      "—"
                    ),
                  },
                  {
                    key: "status",
                    label: "Account status",
                    value: (
                      <StatusBadge
                        label={humanizeCode(data.accountStatus)}
                        tone={data.accountStatus === "ACTIVE" ? "success" : "warning"}
                      />
                    ),
                  },
                  {
                    key: "minor",
                    label: "Minor",
                    value: data.isMinor ? <StatusBadge label="Under 18" tone="warning" /> : "No",
                  },
                  {
                    key: "age",
                    label: "Age verification",
                    value: humanizeCode(data.ageVerifyStatus),
                  },
                  { key: "score", label: "Trender score", value: data.trenderScore.toFixed(1) },
                  { key: "sessions", label: "Active sessions", value: data.activeSessions },
                  {
                    key: "created",
                    label: "Account created",
                    value: formatDateTime(data.createdAt),
                  },
                ]}
              />
            </Result>
          ) : null}
        </SectionCard>
      </Wrapper>
    </Can>
  );
}

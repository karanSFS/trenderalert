"use client";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { Alert, Button } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import styled from "styled-components";
import { DetailList } from "@/components/ui/DetailDrawer";
import { PageHeader } from "@/components/ui/PageHeader";
import { RecordState } from "@/components/ui/RecordState";
import { DetailColumn, DetailGrid, SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { usePermission } from "@/features/auth/usePermission";
import { usersSelectors } from "@/features/moduleSelectors";
import { fetchUser } from "@/features/users/usersSlice";
import { accountStatusBadge } from "@/lib/constants/statusLabels";
import { formatDateTime } from "@/lib/formatters/date";
import { humanizeCode, maskPhone } from "@/lib/formatters/text";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { adminRoleLabel, memberName, useContactFormatter } from "./UsersScreen";

const HeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.space(2)};
`;

const Notice = styled(Alert)`
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

export function UserDetailScreen({ id }: { id: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => usersSelectors.selectById(state, id));
  const detail = useAppSelector(usersSelectors.selectDetail);
  const canSeeContact = usePermission("users:manage");
  const canModerate = usePermission("moderation:view");
  const contact = useContactFormatter();

  const load = useCallback(() => {
    dispatch(fetchUser(id));
  }, [dispatch, id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!user || (detail.id === id && detail.status === "failed")) {
    return (
      <RecordState
        status={detail.id === id ? detail.status : "loading"}
        error={detail.error}
        onRetry={load}
        backHref="/admin/users"
        backLabel="Back to users"
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Member"
        title={memberName(user)}
        subtitle={`${user.username ? `@${user.username} · ` : ""}${user.id}`}
        actions={
          <HeaderActions>
            <StatusBadge {...accountStatusBadge(user.accountStatus)} />
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/admin/users")}>
              Users
            </Button>
          </HeaderActions>
        }
      />

      <Notice
        type="info"
        showIcon
        title="Account actions go through moderation"
        description={
          <>
            The backend applies warnings, restrictions, suspensions and bans to the account named in
            a moderation report.{" "}
            {canModerate ? <Link href="/admin/moderation">Open the moderation queue</Link> : null}
          </>
        }
      />

      <DetailGrid>
        <DetailColumn>
          <SectionCard title="Profile">
            <DetailList
              items={[
                { key: "name", label: "Display name", value: user.displayName ?? "—" },
                {
                  key: "username",
                  label: "Username",
                  value: user.username ? `@${user.username}` : "—",
                },
                {
                  key: "email",
                  label: canSeeContact ? "Email" : "Email (masked)",
                  value: user.email ? contact({ ...user, phone: null }) : "—",
                  wide: true,
                },
                {
                  key: "phone",
                  label: canSeeContact ? "Phone" : "Phone (masked)",
                  value: user.phone ? (canSeeContact ? user.phone : maskPhone(user.phone)) : "—",
                },
                { key: "joined", label: "Joined", value: formatDateTime(user.createdAt) },
              ]}
            />
          </SectionCard>
        </DetailColumn>
        <DetailColumn>
          <SectionCard title="Status and safety">
            <DetailList
              items={[
                {
                  key: "status",
                  label: "Account status",
                  value: <StatusBadge {...accountStatusBadge(user.accountStatus)} />,
                },
                {
                  key: "minor",
                  label: "Age group",
                  value: user.isMinor ? (
                    <StatusBadge label="Minor (under 18)" tone="warning" />
                  ) : (
                    "Adult"
                  ),
                },
                {
                  key: "age",
                  label: "Age verification",
                  value: humanizeCode(user.ageVerifyStatus),
                },
                { key: "score", label: "Trender score", value: user.trenderScore.toFixed(1) },
                {
                  key: "admin",
                  label: "Administrator role",
                  value: user.adminRole ? (
                    <StatusBadge
                      label={adminRoleLabel(user.adminRole) ?? user.adminRole}
                      tone="brand"
                    />
                  ) : (
                    "None"
                  ),
                },
                { key: "id", label: "User id", value: user.id, wide: true },
              ]}
            />
          </SectionCard>
        </DetailColumn>
      </DetailGrid>
    </>
  );
}

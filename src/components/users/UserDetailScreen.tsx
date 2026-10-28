"use client";

import { ArrowLeftOutlined, FileImageOutlined } from "@ant-design/icons";
import { Alert, Button, Tooltip } from "antd";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import styled from "styled-components";
import { Can } from "@/components/auth/Can";
import { DetailList } from "@/components/ui/DetailDrawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { EntityLink } from "@/components/ui/EntityLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { RecordState } from "@/components/ui/RecordState";
import { DetailColumn, DetailGrid, SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Timeline } from "@/components/ui/Timeline";
import { useConfirm } from "@/components/ui/useConfirm";
import { makeSelectAuditEventsForTarget } from "@/features/audit/auditSelectors";
import { auditEventsToTimeline } from "@/features/audit/auditTimeline";
import { contentActions } from "@/features/content/contentSlice";
import { usersSelectors } from "@/features/moduleSelectors";
import { fetchUser, fetchUserActivity } from "@/features/users/usersSlice";
import { CASE_STATUS, PLAN_LABELS, USER_STATUS, VERIFICATION } from "@/lib/constants/statusLabels";
import { formatDate, formatDateTime, formatRelativeDays } from "@/lib/formatters/date";
import { formatNumber } from "@/lib/formatters/number";
import { DEMO_AS_OF } from "@/data/mock/seed";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { userActionBlock, useUserActions } from "./useUserActions";

const HeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space(2)};
`;

const CaseRow = styled.li`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space(3)};
  padding: ${({ theme }) => theme.space(3)} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }

  > div:last-child {
    flex: none;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }

  span.ta-case-meta {
    display: block;
    font-size: ${({ theme }) => theme.font.sizeSm};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const CaseList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Counts = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space(3)};

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  strong {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const NoticeAlert = styled(Alert)`
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

export function UserDetailScreen({ id }: { id: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => usersSelectors.selectById(state, id));
  const detail = useAppSelector(usersSelectors.selectDetail);
  const context = useAppSelector(usersSelectors.selectContext);
  const selectSessionEvents = useMemo(() => makeSelectAuditEventsForTarget(), []);
  const sessionEvents = useAppSelector((state) => selectSessionEvents(state, "user", id));
  const { confirm, dialog } = useConfirm();

  const load = useCallback(() => {
    dispatch(fetchUser(id));
    dispatch(fetchUserActivity(id));
  }, [dispatch, id]);

  useEffect(() => {
    load();
  }, [load]);

  const { openConfirm } = useUserActions(confirm, load);
  const activity = context.id === id ? context.data : null;

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

  const auditEntries = auditEventsToTimeline([...sessionEvents, ...(activity?.auditHistory ?? [])]);

  return (
    <>
      <PageHeader
        eyebrow="Demo record"
        title={user.displayName}
        subtitle={`@${user.username} · ${user.id} · Registered ${formatDate(user.registeredAt)}`}
        actions={
          <HeaderActions>
            <StatusBadge {...USER_STATUS[user.status]} />
            <Can permission="users:manage">
              {(["restrict", "suspend", "reinstate"] as const).map((action) => {
                const blocked = userActionBlock(user, action);
                const label =
                  action === "restrict"
                    ? "Restrict"
                    : action === "suspend"
                      ? "Suspend"
                      : "Reinstate";
                return (
                  <Tooltip key={action} title={blocked ?? undefined}>
                    <Button
                      danger={action !== "reinstate"}
                      type={action === "reinstate" ? "primary" : "default"}
                      disabled={blocked !== null}
                      onClick={() => openConfirm(user, action)}
                    >
                      {label}
                    </Button>
                  </Tooltip>
                );
              })}
            </Can>
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/admin/users")}>
              Users
            </Button>
          </HeaderActions>
        }
      />

      {user.deletion ? (
        <NoticeAlert
          type="info"
          showIcon
          title={`Deletion scheduled for ${formatDate(user.deletion.scheduledFor)}`}
          description={`Requested ${formatDate(user.deletion.requestedAt)}. The account was deactivated immediately and will be permanently deleted after the 30-day grace period unless the member cancels (D-10). Administrators cannot change this status here.`}
        />
      ) : null}

      <DetailGrid>
        <DetailColumn>
          <SectionCard title="Profile">
            <DetailList
              items={[
                { key: "email", label: "Email (fictional)", value: user.email, wide: true },
                { key: "location", label: "Approximate location", value: user.approximateLocation },
                {
                  key: "verification",
                  label: "Verification",
                  value: <StatusBadge {...VERIFICATION[user.verification]} />,
                },
                { key: "followers", label: "Followers", value: formatNumber(user.followers) },
                {
                  key: "trends",
                  label: "Trends published",
                  value: formatNumber(user.trendsPublished),
                },
              ]}
            />
          </SectionCard>
          <SectionCard title="Status and safety">
            <DetailList
              items={[
                {
                  key: "status",
                  label: "Account status",
                  value: <StatusBadge {...USER_STATUS[user.status]} />,
                },
                {
                  key: "reports",
                  label: "Reports received",
                  value: formatNumber(user.reportsReceived),
                },
                { key: "strikes", label: "Strikes", value: formatNumber(user.strikes) },
                {
                  key: "last",
                  label: "Last enforcement",
                  wide: true,
                  value: user.lastEnforcement
                    ? `${user.lastEnforcement.action[0].toUpperCase()}${user.lastEnforcement.action.slice(1)} by ${user.lastEnforcement.by} on ${formatDateTime(user.lastEnforcement.at)}: ${user.lastEnforcement.reason}`
                    : "—",
                },
              ]}
            />
          </SectionCard>
          <SectionCard title="Subscription">
            <DetailList
              items={[
                { key: "plan", label: "Plan", value: PLAN_LABELS[user.subscription.plan] },
                {
                  key: "store",
                  label: "Store",
                  value: user.subscription.store
                    ? user.subscription.store === "ios"
                      ? "App Store"
                      : "Google Play"
                    : "—",
                },
                {
                  key: "renews",
                  label: "Renews",
                  value: user.subscription.renewsAt
                    ? `${formatDate(user.subscription.renewsAt)} (${formatRelativeDays(user.subscription.renewsAt, DEMO_AS_OF)})`
                    : "—",
                },
              ]}
            />
          </SectionCard>
        </DetailColumn>

        <DetailColumn>
          <SectionCard title="Content">
            <Counts>
              <p>
                <strong>{activity ? formatNumber(activity.contentCount) : "…"}</strong> items,
                including <strong>{activity ? formatNumber(activity.trendCount) : "…"}</strong>{" "}
                Trends in the demo sample.
              </p>
              <Can permission="content:view">
                <Button
                  icon={<FileImageOutlined />}
                  onClick={() => {
                    dispatch(contentActions.setFilters({ creatorId: user.id }));
                    router.push("/admin/content");
                  }}
                >
                  View content
                </Button>
              </Can>
            </Counts>
          </SectionCard>
          <SectionCard title="Moderation history">
            {activity && activity.cases.length > 0 ? (
              <CaseList>
                {activity.cases.map((item) => (
                  <CaseRow key={item.id}>
                    <div>
                      <EntityLink kind="case" id={item.id} />
                      <span className="ta-case-meta">
                        {item.category} · {item.reportedItemLabel}
                      </span>
                    </div>
                    <div>
                      <StatusBadge {...CASE_STATUS[item.status]} />
                      <span className="ta-case-meta">{formatDate(item.submittedAt)}</span>
                    </div>
                  </CaseRow>
                ))}
              </CaseList>
            ) : (
              <EmptyState compact title={activity ? "No reports about this member" : "Loading…"} />
            )}
          </SectionCard>
          <SectionCard title="Audit history">
            <Timeline entries={auditEntries} emptyText="No recorded administrative actions." />
          </SectionCard>
        </DetailColumn>
      </DetailGrid>
      {dialog}
    </>
  );
}

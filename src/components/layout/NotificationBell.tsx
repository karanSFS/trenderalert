"use client";

import { BellOutlined } from "@ant-design/icons";
import { Badge, Button, Popover, Skeleton } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { SEVERITY_BADGE } from "@/components/dashboard/panels/statusTones";
import { DemoDataTag } from "@/components/ui/DemoDataTag";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  selectNotificationsState,
  selectUnreadNotificationCount,
  selectVisibleNotifications,
} from "@/features/notifications/notificationsSelectors";
import {
  fetchNotifications,
  markNotificationRead,
  markNotificationsRead,
} from "@/features/notifications/notificationsSlice";
import { formatDateTime } from "@/lib/formatters/date";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const Panel = styled.div`
  width: min(360px, calc(100vw - 32px));
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space(2)};
  padding-bottom: ${({ theme }) => theme.space(2)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  strong {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.space(2)};
  }
`;

const List = styled.ul`
  max-height: 380px;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Item = styled.button<{ $unread: boolean }>`
  display: flex;
  gap: ${({ theme }) => theme.space(3)};
  width: 100%;
  padding: ${({ theme }) => theme.space(3)} ${({ theme }) => theme.space(2)};
  text-align: left;
  font: inherit;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ $unread, theme }) => ($unread ? theme.colors.primarySoft : "transparent")};
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceMuted};
  }
`;

const ItemText = styled.span`
  flex: 1;
  min-width: 0;

  strong {
    display: block;
    font-weight: 600;
  }

  span {
    display: block;
    margin-top: 2px;
    font-size: 12px;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const ItemMeta = styled.span`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex: none;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textTertiary};
`;

const SkeletonWrap = styled.div`
  padding: ${({ theme }) => theme.space(3)} 0;
`;

const TriggerButton = styled(Button)`
  && {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

/** Header bell for demo operational alerts, filtered by the current role. */
export function NotificationBell() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { status, error, readIds } = useAppSelector(selectNotificationsState);
  const items = useAppSelector(selectVisibleNotifications);
  const unread = useAppSelector(selectUnreadNotificationCount);

  useEffect(() => {
    if (status === "idle") dispatch(fetchNotifications());
  }, [dispatch, status]);

  const openItem = (id: string, href: string) => {
    dispatch(markNotificationRead(id));
    setOpen(false);
    router.push(href);
  };

  let body;
  if (status === "loading" || status === "idle") {
    body = (
      <SkeletonWrap aria-busy="true">
        <Skeleton active title={false} paragraph={{ rows: 4 }} />
      </SkeletonWrap>
    );
  } else if (status === "failed") {
    body = (
      <ErrorState
        compact
        title="Alerts could not be loaded"
        message={error?.message}
        onRetry={() => dispatch(fetchNotifications())}
      />
    );
  } else if (items.length === 0) {
    body = (
      <EmptyState compact title="No alerts" description="There are no alerts for your role." />
    );
  } else {
    body = (
      <List>
        {items.map((item) => (
          <li key={item.id}>
            <Item
              type="button"
              $unread={!readIds.includes(item.id)}
              onClick={() => openItem(item.id, item.href)}
            >
              <ItemText>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </ItemText>
              <ItemMeta>
                <StatusBadge {...SEVERITY_BADGE[item.severity]} />
                {formatDateTime(item.occurredAt)}
              </ItemMeta>
            </Item>
          </li>
        ))}
      </List>
    );
  }

  const content = (
    <Panel>
      <Head>
        <strong>
          Alerts <DemoDataTag label="Demo alerts" />
        </strong>
        <Button
          type="link"
          size="small"
          disabled={unread === 0}
          onClick={() => dispatch(markNotificationsRead(items.map((item) => item.id)))}
        >
          Mark all as read
        </Button>
      </Head>
      {body}
    </Panel>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
      arrow={false}
    >
      <Badge count={unread} size="small" offset={[-4, 4]}>
        <TriggerButton
          type="text"
          icon={<BellOutlined />}
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
          aria-haspopup="dialog"
          aria-expanded={open}
        />
      </Badge>
    </Popover>
  );
}

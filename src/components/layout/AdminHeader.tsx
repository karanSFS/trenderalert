"use client";

import {
  GlobalOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Tag, type MenuProps } from "antd";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { signOut } from "@/features/auth/authSlice";
import { selectAuth } from "@/features/auth/authSelectors";
import { selectSidebarCollapsed, toggleSidebar } from "@/features/settings/layoutSlice";
import { ADMIN_LOGIN_PATH } from "@/lib/constants/app";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { getInitials } from "@/lib/formatters/text";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { AdminBreadcrumbs } from "./AdminBreadcrumbs";
import { NotificationBell } from "./NotificationBell";

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: var(--ta-z-header);
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(3)};
  height: var(--ta-header-height);
  padding: 0 ${({ theme }) => theme.space(4)};
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  @media ${({ theme }) => theme.breakpoints.lg} {
    padding: 0 ${({ theme }) => theme.space(6)};
  }
`;

const MobileOnly = styled.div`
  display: block;

  @media ${({ theme }) => theme.breakpoints.lg} {
    display: none;
  }
`;

const DesktopOnly = styled.div`
  display: none;

  @media ${({ theme }) => theme.breakpoints.lg} {
    display: block;
  }
`;

const Spacer = styled.div`
  flex: 1;
  min-width: 0;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(2)};
`;

const DemoTag = styled(Tag)`
  && {
    margin: 0;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: ${({ theme }) => theme.colors.onPrimary};
    background: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ProfileButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(2)};
  padding: 4px 8px 4px 4px;
  font: inherit;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  cursor: pointer;
  transition: border-color var(--ta-transition-fast);

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }
`;

const Avatar = styled.span`
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onPrimary};
  background: ${({ theme }) => theme.colors.primary};
`;

const ProfileName = styled.span`
  display: none;
  line-height: 1.2;
  text-align: left;

  small {
    display: block;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 11px;
  }

  @media ${({ theme }) => theme.breakpoints.md} {
    display: block;
  }
`;

const MenuHeading = styled.div`
  padding: 4px 0;
  line-height: 1.35;

  strong {
    display: block;
  }

  span {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 12px;
  }
`;

interface AdminHeaderProps {
  onOpenMobileNav: () => void;
}

export function AdminHeader({ onOpenMobileNav }: AdminHeaderProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { currentAdmin, signOutStatus } = useAppSelector(selectAuth);
  const collapsed = useAppSelector(selectSidebarCollapsed);

  const handleSignOut = async () => {
    await dispatch(signOut());
    router.replace(ADMIN_LOGIN_PATH);
  };

  const menuItems: MenuProps["items"] = currentAdmin
    ? [
        {
          key: "identity",
          disabled: true,
          label: (
            <MenuHeading>
              <strong>{currentAdmin.displayName}</strong>
              <span>{currentAdmin.email}</span>
            </MenuHeading>
          ),
        },
        { type: "divider" },
        {
          key: "role",
          disabled: true,
          label: (
            <MenuHeading>
              <span>Role: {ROLE_LABELS[currentAdmin.role]}</span>
            </MenuHeading>
          ),
        },
        { type: "divider" },
        {
          key: "public-site",
          icon: <GlobalOutlined />,
          label: "View public website",
          onClick: () => router.push("/"),
        },
        { type: "divider" },
        {
          key: "sign-out",
          icon: <LogoutOutlined />,
          label: signOutStatus === "loading" ? "Signing out…" : "Sign out",
          danger: true,
          disabled: signOutStatus === "loading",
          onClick: () => void handleSignOut(),
        },
      ]
    : [];

  return (
    <Header>
      <MobileOnly>
        <Button
          type="text"
          icon={<MenuOutlined />}
          aria-label="Open navigation"
          onClick={onOpenMobileNav}
        />
      </MobileOnly>
      <DesktopOnly>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          onClick={() => dispatch(toggleSidebar())}
        />
      </DesktopOnly>
      <Spacer>
        <AdminBreadcrumbs />
      </Spacer>
      <Actions>
        <DemoTag>DEMO</DemoTag>
        <NotificationBell />
        <ThemeSwitcher />
        {currentAdmin ? (
          <Dropdown
            menu={{ items: menuItems, selectable: false }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <ProfileButton type="button" aria-label="Open profile menu">
              <Avatar aria-hidden="true">{getInitials(currentAdmin.displayName)}</Avatar>
              <ProfileName>
                {currentAdmin.displayName}
                <small>{ROLE_LABELS[currentAdmin.role]}</small>
              </ProfileName>
            </ProfileButton>
          </Dropdown>
        ) : null}
      </Actions>
    </Header>
  );
}

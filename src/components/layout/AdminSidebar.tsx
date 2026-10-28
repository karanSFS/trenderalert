"use client";

import { Menu, type MenuProps } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import styled from "styled-components";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { selectCurrentAdmin } from "@/features/auth/authSelectors";
import { ADMIN_HOME_PATH } from "@/lib/constants/app";
import { getNavigationForRole, type AdminNavGroup } from "@/lib/constants/adminNavigation";
import { ADMIN_ROUTES, matchAdminRoute, type AdminRouteKey } from "@/lib/constants/adminRoutes";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { getInitials } from "@/lib/formatters/text";
import { useAppSelector } from "@/store/hooks";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${({ theme }) => theme.colors.sidebarBackground};
  color: ${({ theme }) => theme.colors.sidebarText};
`;

const LogoArea = styled.div<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $collapsed }) => ($collapsed ? "center" : "flex-start")};
  height: var(--ta-header-height);
  padding: 0 ${({ $collapsed, theme }) => ($collapsed ? 0 : theme.space(6))};
  border-bottom: 1px solid ${({ theme }) => theme.colors.sidebarBorder};
  flex: none;

  a {
    text-decoration: none;
    border-radius: 4px;
  }
`;

const MenuArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.space(3)} 0;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  .ant-menu-dark {
    background: transparent;
  }

  .ant-menu-item-group-title {
    padding-top: ${({ theme }) => theme.space(4)};
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .ant-menu-item-selected {
    font-weight: 600;
    box-shadow: inset 3px 0 0 ${({ theme }) => theme.colors.primary};
  }

  .ant-menu-item a:focus-visible {
    outline: none;
  }

  .ant-menu-item:has(a:focus-visible) {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: -2px;
  }
`;

const ProfileArea = styled.div<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(3)};
  justify-content: ${({ $collapsed }) => ($collapsed ? "center" : "flex-start")};
  padding: ${({ theme }) => theme.space(4)};
  border-top: 1px solid ${({ theme }) => theme.colors.sidebarBorder};
  flex: none;
`;

const Avatar = styled.span`
  display: grid;
  place-items: center;
  flex: none;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onPrimary};
  background: ${({ theme }) => theme.colors.primary};
`;

const ProfileText = styled.div`
  min-width: 0;
  line-height: 1.3;

  strong {
    display: block;
    color: #ffffff;
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.sidebarTextMuted};
  }
`;

function collectNavKeys(groups: AdminNavGroup[]): Set<AdminRouteKey> {
  const keys = new Set<AdminRouteKey>();
  for (const group of groups) {
    for (const item of group.items) {
      keys.add(item.route);
      item.children?.forEach((child) => keys.add(child));
    }
  }
  return keys;
}

/** Detail routes highlight their nearest ancestor that appears in the navigation. */
function resolveSelectedKey(
  pathname: string,
  navKeys: Set<AdminRouteKey>,
): AdminRouteKey | undefined {
  let route = matchAdminRoute(pathname);
  while (route && !navKeys.has(route.key)) {
    route = route.parent ? ADMIN_ROUTES[route.parent] : undefined;
  }
  return route?.key;
}

function buildMenuItems(groups: AdminNavGroup[]): MenuProps["items"] {
  return groups.map((group) => ({
    type: "group" as const,
    key: group.key,
    label: group.label,
    children: group.items.map((item) => {
      const route = ADMIN_ROUTES[item.route];
      if (item.children) {
        return {
          key: `sub:${item.route}`,
          icon: item.icon,
          label: item.label ?? route.label,
          children: item.children.map((childKey) => ({
            key: childKey,
            label: <Link href={ADMIN_ROUTES[childKey].path}>{ADMIN_ROUTES[childKey].label}</Link>,
          })),
        };
      }
      return {
        key: item.route,
        icon: item.icon,
        label: <Link href={route.path}>{route.label}</Link>,
      };
    }),
  }));
}

interface AdminSidebarProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function AdminSidebar({ collapsed = false, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const admin = useAppSelector(selectCurrentAdmin);
  const groups = useMemo(() => (admin ? getNavigationForRole(admin.role) : []), [admin]);
  const items = useMemo(() => buildMenuItems(groups), [groups]);
  const navKeys = useMemo(() => collectNavKeys(groups), [groups]);
  const selectedKey = resolveSelectedKey(pathname, navKeys);

  const parentOfSelected = groups
    .flatMap((group) => group.items)
    .find((item) => selectedKey && item.children?.includes(selectedKey));
  const [openKeys, setOpenKeys] = useState<string[]>(
    parentOfSelected ? [`sub:${parentOfSelected.route}`] : [],
  );

  return (
    <Wrapper>
      <LogoArea $collapsed={collapsed}>
        <Link href={ADMIN_HOME_PATH} onClick={onNavigate} aria-label="TrenderAlert admin home">
          <BrandLogo tone="onDark" compact={collapsed} />
        </Link>
      </LogoArea>
      <MenuArea>
        <nav aria-label="Admin navigation">
          <Menu
            theme="dark"
            mode="inline"
            inlineCollapsed={collapsed}
            items={items}
            selectedKeys={selectedKey ? [selectedKey] : []}
            openKeys={collapsed ? undefined : openKeys}
            onOpenChange={(keys) => setOpenKeys(keys as string[])}
            onClick={onNavigate}
          />
        </nav>
      </MenuArea>
      {admin ? (
        <ProfileArea $collapsed={collapsed}>
          <Avatar aria-hidden="true">{getInitials(admin.displayName)}</Avatar>
          {collapsed ? null : (
            <ProfileText>
              <strong>{admin.displayName}</strong>
              <span>{ROLE_LABELS[admin.role]}</span>
            </ProfileText>
          )}
        </ProfileArea>
      ) : null}
    </Wrapper>
  );
}

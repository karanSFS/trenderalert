"use client";

import { Button, Drawer, Layout } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import styled from "styled-components";
import { DemoModeBanner } from "@/components/ui/DemoModeBanner";
import { AccessDeniedState } from "@/components/ui/ErrorState";
import { selectAuth } from "@/features/auth/authSelectors";
import { sessionEnded } from "@/features/auth/authSlice";
import { selectSidebarCollapsed } from "@/features/settings/layoutSlice";
import { ADMIN_HOME_PATH, ADMIN_LOGIN_PATH } from "@/lib/constants/app";
import { matchAdminRoute } from "@/lib/constants/adminRoutes";
import { roleHasPermission } from "@/lib/constants/roles";
import { SESSION_ENDED_EVENT } from "@/services/api/http";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { AdminHeader } from "./AdminHeader";
import { AdminShellSkeleton } from "./AdminShellSkeleton";
import { AdminSidebar } from "./AdminSidebar";

const Sider = styled(Layout.Sider)`
  &&& {
    display: none;
    position: sticky;
    top: 0;
    height: 100vh;
    z-index: var(--ta-z-sidebar);
    border-right: 1px solid ${({ theme }) => theme.colors.sidebarBorder};

    @media ${({ theme }) => theme.breakpoints.lg} {
      display: block;
    }
  }
`;

const MobileDrawer = styled(Drawer)`
  .ant-drawer-body {
    padding: 0;
  }
`;

const Main = styled(Layout)`
  && {
    min-width: 0;
    min-height: 100vh;
    background: ${({ theme }) => theme.colors.background};
  }
`;

const Content = styled.main`
  width: 100%;
  max-width: var(--ta-content-max-width);
  margin: 0 auto;
  padding: ${({ theme }) => theme.space(5)} ${({ theme }) => theme.space(4)}
    ${({ theme }) => theme.space(12)};

  @media ${({ theme }) => theme.breakpoints.lg} {
    padding: ${({ theme }) => theme.space(8)} ${({ theme }) => theme.space(8)}
      ${({ theme }) => theme.space(16)};
  }

  &:focus {
    outline: none;
  }
`;

/** Route-level UI restriction. The backend must enforce the same rules. */
function RouteAccessGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentAdmin } = useAppSelector(selectAuth);
  const route = matchAdminRoute(pathname);

  if (route && currentAdmin && !roleHasPermission(currentAdmin.role, route.permission)) {
    return (
      <AccessDeniedState
        action={
          <Button type="primary" onClick={() => router.push(ADMIN_HOME_PATH)}>
            Go to dashboard
          </Button>
        }
      />
    );
  }
  return <>{children}</>;
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { currentAdmin, sessionRestored } = useAppSelector(selectAuth);
  const collapsed = useAppSelector(selectSidebarCollapsed);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const handleEnded = () => dispatch(sessionEnded());
    window.addEventListener(SESSION_ENDED_EVENT, handleEnded);
    return () => window.removeEventListener(SESSION_ENDED_EVENT, handleEnded);
  }, [dispatch]);

  useEffect(() => {
    if (sessionRestored && !currentAdmin) {
      router.replace(`${ADMIN_LOGIN_PATH}?next=${encodeURIComponent(pathname)}`);
    }
  }, [sessionRestored, currentAdmin, pathname, router]);

  if (!sessionRestored || !currentAdmin) return <AdminShellSkeleton />;

  return (
    <Layout hasSider>
      <a className="ta-skip-link" href="#main-content">
        Skip to content
      </a>
      <Sider
        width="var(--ta-sidebar-width)"
        collapsedWidth="var(--ta-sidebar-collapsed-width)"
        collapsed={collapsed}
        trigger={null}
        collapsible
      >
        <AdminSidebar collapsed={collapsed} />
      </Sider>
      <MobileDrawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        placement="left"
        size={280}
        closable={false}
        title={null}
        aria-label="Admin navigation"
      >
        <AdminSidebar onNavigate={() => setMobileNavOpen(false)} />
      </MobileDrawer>
      <Main>
        <AdminHeader onOpenMobileNav={() => setMobileNavOpen(true)} />
        <DemoModeBanner />
        <Content id="main-content" tabIndex={-1}>
          <RouteAccessGuard>{children}</RouteAccessGuard>
        </Content>
      </Main>
    </Layout>
  );
}

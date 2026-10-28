"use client";

import { HomeOutlined } from "@ant-design/icons";
import { Breadcrumb } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import { ADMIN_HOME_PATH } from "@/lib/constants/app";
import { buildAdminBreadcrumbs } from "@/lib/constants/adminRoutes";

const Nav = styled.nav`
  min-width: 0;
  overflow: hidden;

  ol {
    flex-wrap: nowrap;
  }

  li {
    white-space: nowrap;
  }
`;

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const entries = buildAdminBreadcrumbs(pathname);
  const isHome = pathname === ADMIN_HOME_PATH;

  const items = [
    ...(isHome
      ? []
      : [
          {
            key: "home",
            title: (
              <Link href={ADMIN_HOME_PATH} aria-label="Dashboard">
                <HomeOutlined />
              </Link>
            ),
          },
        ]),
    ...entries.map((entry, index) => ({
      key: `${entry.label}-${index}`,
      title: entry.href ? (
        <Link href={entry.href}>{entry.label}</Link>
      ) : (
        <span aria-current="page">{entry.label}</span>
      ),
    })),
  ];

  return (
    <Nav aria-label="Breadcrumb">
      <Breadcrumb items={items} />
    </Nav>
  );
}

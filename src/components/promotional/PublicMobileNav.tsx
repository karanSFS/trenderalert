"use client";

import { MenuOutlined } from "@ant-design/icons";
import { Button, Drawer } from "antd";
import Link from "next/link";
import { useState } from "react";
import styled from "styled-components";
import type { PublicNavLink } from "./publicNav";

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space(1)};
  margin: 0;
  padding: 0;
  list-style: none;

  a {
    display: block;
    padding: ${({ theme }) => theme.space(3)};
    border-radius: ${({ theme }) => theme.radii.button};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: ${({ theme }) => theme.font.sizeLg};
    font-weight: 500;
    text-decoration: none;
  }

  a:hover {
    background: ${({ theme }) => theme.colors.surfaceMuted};
  }
`;

export function PublicMobileNav({ links }: { links: PublicNavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="text"
        icon={<MenuOutlined />}
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      />
      <Drawer open={open} onClose={() => setOpen(false)} placement="right" size={300} title="Menu">
        <nav aria-label="Mobile">
          <List>
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </List>
        </nav>
      </Drawer>
    </>
  );
}

"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import styled from "styled-components";
import { usePermission } from "@/features/auth/usePermission";
import type { Permission } from "@/types/auth";
import type { EntityId } from "@/types/common";

export type EntityKind = "user" | "content" | "trend" | "case" | "appeal" | "copyright";

const TARGETS: Record<EntityKind, { permission: Permission; href: (id: EntityId) => string }> = {
  user: { permission: "users:view", href: (id) => `/admin/users/${id}` },
  content: { permission: "content:view", href: (id) => `/admin/content?open=${id}` },
  trend: { permission: "trends:view", href: (id) => `/admin/trends?open=${id}` },
  case: { permission: "moderation:view", href: (id) => `/admin/moderation/${id}` },
  appeal: { permission: "appeals:view", href: (id) => `/admin/appeals?open=${id}` },
  copyright: { permission: "copyright:view", href: (id) => `/admin/copyright?open=${id}` },
};

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.colors.accentText};
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

interface EntityLinkProps {
  kind: EntityKind;
  id: EntityId;
  children?: ReactNode;
}

/** Link to a related record, or plain text when the current role cannot open it. */
export function EntityLink({ kind, id, children }: EntityLinkProps) {
  const target = TARGETS[kind];
  const allowed = usePermission(target.permission);
  const label = children ?? id;
  if (!allowed) return <span>{label}</span>;
  return (
    <StyledLink href={target.href(id)} onClick={(event) => event.stopPropagation()}>
      {label}
    </StyledLink>
  );
}

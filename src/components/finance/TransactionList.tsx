"use client";

import styled from "styled-components";
import { EmptyState } from "@/components/ui/EmptyState";
import { EntityLink } from "@/components/ui/EntityLink";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Transaction } from "@/features/finance/financeTypes";
import { TRANSACTION_STATUS, TRANSACTION_TYPE_LABELS } from "@/lib/constants/operationalLabels";
import { formatDateTime } from "@/lib/formatters/date";
import { formatCurrency } from "@/lib/formatters/number";

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.space(3)};
    padding: ${({ theme }) => theme.space(2)} 0;
  }

  li + li {
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }

  small {
    display: block;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Amount = styled.div`
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
`;

/** Compact ledger list for drawers. Amounts are demo values in minor units. */
export function TransactionList({
  items,
  emptyTitle = "No transactions",
}: {
  items: Transaction[];
  emptyTitle?: string;
}) {
  if (items.length === 0) return <EmptyState compact title={emptyTitle} />;
  return (
    <List>
      {items.map((item) => (
        <li key={item.id}>
          <div>
            <EntityLink kind="transaction" id={item.id} />
            <small>
              {TRANSACTION_TYPE_LABELS[item.type]} · {formatDateTime(item.occurredAt)}
            </small>
          </div>
          <Amount>
            {formatCurrency(item.amount)}
            <div>
              <StatusBadge {...TRANSACTION_STATUS[item.status]} />
            </div>
          </Amount>
        </li>
      ))}
    </List>
  );
}

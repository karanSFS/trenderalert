"use client";

import { Alert, Segmented, Table } from "antd";
import Link from "next/link";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { fetchFinanceOverview } from "@/features/finance/financeOverviewSlice";
import type { FinanceOverview } from "@/features/finance/financeTypes";
import { selectFinanceOverview } from "@/features/moduleSelectors";
import { STORE_LABELS } from "@/lib/constants/operationalLabels";
import { formatCurrency, formatNumber } from "@/lib/formatters/number";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const PERIODS = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
];

const Metrics = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.space(4)};
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

const Panels = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.space(4)};
  grid-template-columns: 1fr;

  @media (min-width: 1100px) {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  }
`;

const Links = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: ${({ theme }) => theme.space(3)};

  a {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.accentText};
  }

  p {
    margin: 2px 0 0;
    font-size: ${({ theme }) => theme.font.sizeSm};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Banner = styled(Alert)`
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

const PayoutNote = styled(Alert)`
  margin-top: ${({ theme }) => theme.space(4)};
`;

type ProviderRow = FinanceOverview["byProvider"][number];

export function FinanceOverviewScreen() {
  const dispatch = useAppDispatch();
  const [period, setPeriod] = useState(30);
  const overview = useAppSelector(selectFinanceOverview);
  const data = overview.data?.periodDays === period ? overview.data : null;
  const loading = !data && overview.status !== "failed";

  useEffect(() => {
    dispatch(fetchFinanceOverview(period));
  }, [dispatch, period]);

  return (
    <>
      <PageHeader
        eyebrow="Finance"
        title="Finance overview"
        subtitle="Totals from the sample demo ledger. Figures are illustrative and do not reflect real revenue."
        actions={
          <Segmented
            aria-label="Period"
            options={PERIODS}
            value={period}
            onChange={(value) => setPeriod(Number(value))}
          />
        }
      />
      <Banner
        type="info"
        showIcon
        title="Simulated finance data"
        description="No payment provider, bank or payout service is connected. Store prices are configured in the App Store and Google Play."
      />
      {overview.status === "failed" ? (
        <ErrorState
          title="Finance overview could not be loaded"
          message={overview.error?.message}
          onRetry={() => dispatch(fetchFinanceOverview(period))}
        />
      ) : (
        <>
          <Metrics>
            <MetricCard
              demo
              loading={loading}
              label="Gross charges"
              value={formatCurrency(data?.grossCents)}
              helper={`Last ${period} days`}
            />
            <MetricCard
              demo
              loading={loading}
              label="Refunds"
              value={formatCurrency(data?.refundsCents)}
              helper="Settled refunds"
              href="/admin/finance/transactions"
            />
            <MetricCard
              demo
              loading={loading}
              label="Chargebacks"
              value={formatCurrency(data?.chargebacksCents)}
              helper="Reported by the stores"
            />
            <MetricCard
              demo
              loading={loading}
              label="Unresolved exceptions"
              value={formatNumber(data?.openExceptions)}
              helper="Open or investigating"
              href="/admin/finance/reconciliation"
            />
            <MetricCard
              demo
              loading={loading}
              label="Pending transactions"
              value={formatNumber(data?.pendingTransactions)}
              helper="Awaiting store confirmation"
            />
          </Metrics>
          <Panels>
            <SectionCard title="Charges by store">
              <Table<ProviderRow>
                size="small"
                rowKey="provider"
                loading={loading}
                pagination={false}
                dataSource={data?.byProvider ?? []}
                columns={[
                  {
                    key: "provider",
                    title: "Store",
                    render: (_, row) => STORE_LABELS[row.provider],
                  },
                  {
                    key: "count",
                    title: "Charges",
                    align: "right",
                    render: (_, row) => formatNumber(row.count),
                  },
                  {
                    key: "gross",
                    title: "Gross",
                    align: "right",
                    render: (_, row) => formatCurrency(row.grossCents),
                  },
                ]}
              />
            </SectionCard>
            <SectionCard title="Finance areas">
              <Links>
                <li>
                  <Link href="/admin/finance/transactions">Transactions</Link>
                  <p>
                    Purchases, renewals, refunds and chargebacks. Refund requests create new linked
                    records.
                  </p>
                </li>
                <li>
                  <Link href="/admin/finance/reconciliation">Reconciliation</Link>
                  <p>Exceptions between the ledger and store settlement files.</p>
                </li>
                <li>
                  <Link href="/admin/subscriptions">Subscriptions</Link>
                  <p>Store, renewal and entitlement status.</p>
                </li>
              </Links>
              {data ? (
                <PayoutNote
                  type="warning"
                  showIcon
                  title="Contest payouts not connected"
                  description={data.contestPayouts.note}
                />
              ) : null}
            </SectionCard>
          </Panels>
        </>
      )}
    </>
  );
}

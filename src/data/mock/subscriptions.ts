import type { Subscription, SubscriptionStatus } from "@/features/subscriptions/subscriptionsTypes";
import type { Transaction } from "@/features/finance/financeTypes";
import { addDays, createRng, DEMO_AS_OF, daysAgo, hoursAgo } from "./seed";
import { USERS } from "./users";

/**
 * Sample subscriptions and their ledger. Plan prices are owner-configured in the stores
 * (D-05); the amounts below are illustrative demo values only.
 */
export const DEMO_PRICE_CENTS = { premium_monthly: 1_299, premium_yearly: 9_999 } as const;
const PERIOD_DAYS = { premium_monthly: 30, premium_yearly: 365 } as const;

const HISTORICAL_STATUSES: SubscriptionStatus[] = [
  "expired",
  "expired",
  "cancelled",
  "refunded",
  "expired",
  "refunded",
  "cancelled",
  "expired",
];

function storeReference(store: "ios" | "android", serial: number) {
  return store === "ios"
    ? `APL-DEMO-${400_000 + serial * 37}`
    : `GPA.DEMO-${7100 + serial * 13}-${serial % 97}`;
}

function generate() {
  const rng = createRng(4401);
  const subscriptions: Subscription[] = [];
  const transactions: Transaction[] = [];
  let txnSerial = 50_000;

  const addTransaction = (
    record: Omit<
      Transaction,
      "id" | "currency" | "refundedBy" | "relatedTransactionId" | "reconciliation" | "note"
    > &
      Partial<Transaction>,
  ) => {
    txnSerial += 1;
    const transaction: Transaction = {
      id: `txn-${txnSerial}`,
      currency: "USD",
      refundedBy: null,
      relatedTransactionId: null,
      reconciliation: record.status === "succeeded" ? "matched" : "unmatched",
      note: null,
      ...record,
    };
    transactions.push(transaction);
    return transaction;
  };

  USERS.forEach((user, index) => {
    const premium = user.subscription.plan !== "free";
    if (!premium && index % 6 !== 2) return;

    const plan = premium
      ? (user.subscription.plan as Subscription["plan"])
      : rng.chance(0.7)
        ? "premium_monthly"
        : "premium_yearly";
    const store = user.subscription.store ?? rng.pick(["ios", "android"] as const);
    const period = PERIOD_DAYS[plan];
    const price = DEMO_PRICE_CENTS[plan];

    let status: SubscriptionStatus;
    if (!premium) status = HISTORICAL_STATUSES[subscriptions.length % HISTORICAL_STATUSES.length];
    else if (user.status === "pending_deletion") status = "cancelled";
    else if (user.status === "suspended") status = "revoked";
    else
      status = rng.weighted<SubscriptionStatus>([
        ["active", 82],
        ["grace_period", 9],
        ["billing_retry", 9],
      ]);

    const periods = plan === "premium_monthly" ? rng.int(1, 5) : rng.int(1, 2);
    const currentPeriodEnd =
      premium && user.subscription.renewsAt
        ? user.subscription.renewsAt
        : premium
          ? addDays(DEMO_AS_OF, rng.int(3, 25))
          : daysAgo(rng.int(10, 120));
    const startedAt = addDays(currentPeriodEnd, -period * periods);
    const id = `sub-${user.id.slice(4)}`;
    const reference = storeReference(store, index);

    const charges: Transaction[] = [];
    for (let periodIndex = 0; periodIndex < periods; periodIndex += 1) {
      const occurredAt = addDays(startedAt, period * periodIndex);
      if (Date.parse(occurredAt) > Date.parse(DEMO_AS_OF)) break;
      charges.push(
        addTransaction({
          type: periodIndex === 0 ? "subscription_purchase" : "renewal",
          amount: price,
          provider: store,
          providerReference: `${reference}-${periodIndex + 1}`,
          status: "succeeded",
          userId: user.id,
          username: user.username,
          subscriptionId: id,
          occurredAt,
        }),
      );
    }

    if (status === "billing_retry") {
      addTransaction({
        type: "renewal",
        amount: price,
        provider: store,
        providerReference: `${reference}-retry`,
        status: "failed",
        userId: user.id,
        username: user.username,
        subscriptionId: id,
        occurredAt: hoursAgo(rng.int(6, 60)),
        note: "Store reported a billing issue; retry in progress.",
      });
    }

    if (status === "refunded" && charges.length > 0) {
      const original = charges[charges.length - 1];
      const refund = addTransaction({
        type: "refund",
        amount: -original.amount,
        provider: store,
        providerReference: `${original.providerReference}-R`,
        status: "succeeded",
        userId: user.id,
        username: user.username,
        subscriptionId: id,
        occurredAt: addDays(original.occurredAt, rng.int(1, 6)),
        relatedTransactionId: original.id,
        note: "Refund issued by the store.",
      });
      original.refundedBy = refund.id;
    }

    const history: Subscription["history"] = [
      {
        id: `${id}-h1`,
        at: startedAt,
        actor: "Store",
        title: "Subscription started",
        detail: `${plan === "premium_monthly" ? "Monthly" : "Yearly"} via ${store === "ios" ? "App Store" : "Google Play"}`,
        tone: "success",
      },
    ];
    if (status === "grace_period" || status === "billing_retry")
      history.push({
        id: `${id}-h2`,
        at: hoursAgo(rng.int(6, 72)),
        actor: "Store",
        title: status === "grace_period" ? "Entered grace period" : "Billing retry started",
        tone: "warning",
      });
    if (status === "cancelled" || status === "expired")
      history.push({
        id: `${id}-h2`,
        at: addDays(currentPeriodEnd, -rng.int(3, 20)),
        actor: "Member",
        title: "Auto-renew turned off",
        tone: "neutral",
      });
    if (status === "refunded")
      history.push({
        id: `${id}-h2`,
        at: addDays(currentPeriodEnd, -period + 3),
        actor: "Store",
        title: "Refunded by the store",
        tone: "warning",
      });
    if (status === "revoked")
      history.push({
        id: `${id}-h2`,
        at: daysAgo(rng.int(2, 20)),
        actor: "Store",
        title: "Entitlement revoked",
        detail: "Store revoked access after an account review.",
        tone: "error",
      });

    subscriptions.push({
      id,
      userId: user.id,
      username: user.username,
      plan,
      store,
      storeReference: reference,
      status,
      autoRenew: status === "active" || status === "grace_period" || status === "billing_retry",
      startedAt,
      currentPeriodEnd,
      entitlement:
        status === "active"
          ? "active"
          : status === "grace_period" || status === "billing_retry"
            ? "grace"
            : "inactive",
      history,
    });
  });

  // A chargeback and two pending store confirmations, for review states.
  const chargebackTarget = transactions.find(
    (item) => item.type === "renewal" && item.status === "succeeded",
  );
  if (chargebackTarget) {
    addTransaction({
      type: "chargeback",
      amount: -chargebackTarget.amount,
      provider: chargebackTarget.provider,
      providerReference: `${chargebackTarget.providerReference}-CB`,
      status: "succeeded",
      userId: chargebackTarget.userId,
      username: chargebackTarget.username,
      subscriptionId: chargebackTarget.subscriptionId,
      occurredAt: hoursAgo(52),
      relatedTransactionId: chargebackTarget.id,
      reconciliation: "unmatched",
      note: "Chargeback reported by the store; awaiting provider evidence.",
    });
  }
  const active = subscriptions.filter((item) => item.status === "active").slice(0, 2);
  active.forEach((subscription, offset) => {
    addTransaction({
      type: "renewal",
      amount: DEMO_PRICE_CENTS[subscription.plan],
      provider: subscription.store,
      providerReference: `${subscription.storeReference}-P`,
      status: "pending",
      userId: subscription.userId,
      username: subscription.username,
      subscriptionId: subscription.id,
      occurredAt: hoursAgo(3 + offset * 5),
      note: "Awaiting store confirmation.",
    });
  });

  transactions.sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
  return { subscriptions, transactions };
}

const generated = generate();

export const SUBSCRIPTIONS: readonly Subscription[] = generated.subscriptions;
export const TRANSACTIONS: readonly Transaction[] = generated.transactions;

import type { Transaction } from "@/features/finance/financeTypes";
import { subscriptionsService } from "@/services";
import { createDirectorySlice } from "@/store/createDirectorySlice";
import type { Subscription, SubscriptionFilters } from "./subscriptionsTypes";

export const subscriptionsModule = createDirectorySlice<
  Subscription,
  SubscriptionFilters,
  Transaction[]
>({
  name: "subscriptions",
  service: subscriptionsService,
  initialFilters: { status: undefined, plan: undefined, store: undefined },
  list: { sortField: "currentPeriodEnd", sortOrder: "ascend" },
  getContext: (id) => subscriptionsService.getTransactions(id),
});

export const subscriptionsActions = subscriptionsModule.actions;
export const {
  fetchList: fetchSubscriptions,
  fetchOne: fetchSubscription,
  fetchContext: fetchSubscriptionTransactions,
} = subscriptionsModule;
export default subscriptionsModule.reducer;

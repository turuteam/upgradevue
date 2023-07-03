export type AdminState = {
  // Promoter Accounts
  promoterAccounts: PromoterAccount[];
  masqueraderPromoterAccounts: PromoterAccount[];
  promoterAccountOwner: PromoterAccount | null;

  // Message tasks
  fanMessageTasks: Message[];
  isFetchingFanMessageTasks: boolean;
  noMoreFanMessageTasks: boolean;
  hasFailedFetchingFanMessageTasks: boolean;

  adminStats: {
    scheduledMessageCount: number;
    sendingMessageCount: number;
    failedMessageCount: number;
  },
  isFetchingAdminStats: boolean;
}

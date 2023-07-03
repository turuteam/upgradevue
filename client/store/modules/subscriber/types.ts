/**
 * State of Subscriber Module
 */
export type SubscriberState = {
  // Subscribers
  subscribers: Subscriber[],
  totalSubscribersCount: number,
  isFetchingSubscribers: boolean,
  isFetchingTotalSubscribersCount: boolean,
  isNoMoreSubscribers: boolean,
  hasFetchSubscribersFailed: boolean,
  // Export Subscribers
  isExportingListSubscribers: boolean,
};

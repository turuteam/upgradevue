/**
 * State of Recipient Module
 */
export type RecipientState = {
    // Recipients
    recipients: Recipient[],
    totalRecipientsCount: number,
    isFetchingRecipients: boolean,
    isFetchingTotalRecipientsCount: boolean,
    isNoMoreRecipients: boolean,
    hasFetchRecipientsFailed: boolean,
    // Export Recipients
    isExportingListRecipients: boolean,
  };

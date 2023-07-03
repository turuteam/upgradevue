export type PaymentState = {
  paymentCustomer: PaymentCustomer | null;
  hasFetchedPaymentCustomer: boolean;
  // Payment Subscriptions
  paymentSubscriptionList: PaymentSubscription[];
  isFetchingPaymentSubscriptions: boolean;
  undoSubscriptionCancellationStatusMap: {
    [key: number]: boolean;
  };
  // Payment Plans
  paymentPlanList: PaymentPlan[];
  isFetchingPaymentPlans: boolean;
  // Current Payment Plan
  currentPaymentPlan: PaymentPlan | null;
  isFetchingCurrentPaymentPlan: boolean;
  // Payment Sources
  paymentSources: PaymentSource[];
  isFetchingPaymentSources: boolean;
  primaryPaymentSourcePuid: string | null;
  // Create Payment Source
  isCreatingPaymentSource: boolean;
  // Delete Payment Source
  isDeletingPaymentSource: boolean;
  // Update Payment Source
  isUpdatingPaymentSource: boolean;
  // Payment Invoices
  paymentInvoices: PaymentInvoice[];
  totalPaymentInvoiceCount: number;
  hasFetchPaymentInvoicesFailed: boolean;
  isFetchingPaymentInvoices: boolean;
  hasNoMorePaymentInvoices: boolean;
}

export interface PrunedPaymentPlan extends PaymentPlan {
  paymentSubscriptions: PaymentSubscription[];
};

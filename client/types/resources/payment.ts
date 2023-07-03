/** Please be aware of that it doesn't need to 100% match data from server */
type PaymentCustomer = {
  providerMtime: string;
  sysCtime: string;
  sysMtime: string;
  sysActivep: boolean;
  paymentSources: PaymentSource[];
  additionalInfo: {
    updatedAt: number;
    deleted: boolean;
    email: string;
    piiCleared: string;
    promotionalCredits: number;
    lastName: string;
    allowDirectDebit: boolean;
    unbilledCharges: number;
    resourceVersion: number;
    primaryPaymentSourceId?: string;
    taxability: string;
    paymentMethod: {
      type: string;
      object: string;
      status: string;
      gateway: string;
      referenceId: string;
      gatewayAccountId: string;
    };
    firstName: string;
    cardStatus: string;
    preferredCurrencyCode: string;
    autoCollection: string;
    excessPayments: number;
    id: string;
    billingAddress: {
      phone: string;
      object: string;
      company: string;
      country: string;
      lastName: string;
      firstName: string;
      validationStatus: string;
    };
    netTermDays: number;
    refundableCredits: number;
    createdAt: number;
    object: string;
  };
  oid: number;
  webhookEvents: any[];
  provider: string;
  puid: string;
  promoterOid: number;
}

/** Please be aware of that it doesn't need to 100% match data from server */
interface PaymentPlanTier {
  price: number;
  object: string;
  endingUnit?: number;
  startingUnit: number;
}

/** Please be aware of that it doesn't need to 100% match data from server */
type PaymentPlan = {
  description: string;
  archived: boolean;
  providerMtime: string;
  sysCtime: string;
  sysMtime: string;
  name: string;
  sysActivep: boolean;
  billingPeriod: string;
  type: string;
  currency: string;
  additionalInfo: {
    description: string;
    updatedAt: number;
    chargeModel: string;
    invoiceName: string;
    resourceVersion: number;
    name: string;
    metaData: {
      type: string;
      childOf: string | null;
      quantity?: {
        max: number;
        min: number;
      };
      featureIds: string[];
      presentation: {
        hidePrice: boolean; // Optional field. If true, will hide price on the card
        priority: number;
        iconName: string;
        contactSales: boolean;
        isMostPopular: boolean;
        purchaseAction: string | null;
        contactSalesPrice: string | null;
        disabledTooltipText: string | null;
        pricingModelDescription: string;
      };
      clientVisible: boolean;
      allowedSubscriptions: string[];
      includedSubscriptions: {
        [key: string]: number;
      };
    };
    addonApplicability: string;
    isShippable: boolean;
    periodUnit: string;
    enabledInPortal: boolean;
    currencyCode: string;
    status: string;
    id: string;
    enabledInHostedPages: boolean;
    giftable: boolean;
    freeQuantity: number;
    taxable: boolean;
    period: number;
    tiers?: PaymentPlanTier[];
    object: string;
    pricingModel: string;
  };
  oid: number;
  webhookEvents: any[];
  clientVisible: boolean;
  provider: string;
  puid: string;
  featureIds: string[];
}

/** Please be aware of that it doesn't need to 100% match data from server */
type PaymentSource = {
  oid: number;
  puid: string;
  provider: string;
  promoterOid: number;
  promoterAccountOid: number;
  additionalInfo: {
    customerId: string;
    updatedAt: number;
    deleted: boolean;
    resourceVersion: number;
    type: string;
    gateway: string;
    card: {
      maskedNumber: string;
      fundingType: string;
      lastName: string;
      expiryYear: number;
      last4: string;
      firstName: string;
      brand: string;
      expiryMonth: number;
      iin: string;
      object: string;
    };
    gatewayAccountId: string;
    referenceId: string;
    status: string;
    id: string;
    createdAt: number;
    object: string;
    issuingCountry: string;
  };
}

/** Please be aware of that it doesn't need to 100% match data from server */
type PaymentSubscription = {
  promoterPaymentSourceOid: number;
  meta: object;
  ppaymentSourceId: string;
  pplanId: string;
  additionalInfo: {
    metaData: {
      includedPlans: string[];
    };
    customerId: string;
    updatedAt: number;
    currentTermEnd: number;
    deleted: boolean;
    nextBillingAt: number;
    dueInvoicesCount: number;
    mrr: number;
    activatedAt: number;
    startedAt: number;
    planFreeQuantity: number;
    resourceVersion: number;
    planId: string;
    billingPeriod: number;
    planAmount: number;
    planUnitPrice: number;
    hasScheduledChanges: boolean;
    currencyCode: string;
    currentTermStart: number;
    autoCollection: string;
    status: string;
    id: string;
    createdAt: number;
    paymentSourceId: string;
    billingPeriodUnit: string;
    object: string;
    planQuantity: number;
  };
  oid: number;
  providerStatus: string;
  quantity: number;
  provider: string;
  puid: string;
  paymentPlan: PaymentPlan;
}

type PaymentInvoice = {
  generatedAt: string;
  paidAt: string;
  providerMtime: string;
  sysCtime: string;
  sysMtime: string;
  sysActivep: boolean;
  paymentSubscriptionOid: number;
  paymentSourceOid?: number | null;
  promoterAccountOid: number;
  currencyCode: string;
  additionalInfo: {
    appliedCredits?: ({
      cnId: string;
      cnDate: number;
      cnStatus: string;
      appliedAt: number;
      appliedAmount: number;
      cnReasonCode: string;
      cnCreateReasonCode?: string | null;
    } | null)[] | null;
    linkedPayments?: ({
      txnId: string;
      txnDate: number;
      appliedAt: number;
      txnAmount: number;
      txnStatus: string;
      appliedAmount: number;
    } | null)[] | null;
    customerId: string;
    amountPaid: number;
    updatedAt: number;
    paidAt: number;
    deleted: boolean;
    date: number;
    amountToCollect: number;
    creditsApplied: number;
    baseCurrencyCode: string;
    issuedCreditNotes?: ({
      cnId: string;
      cnDate: number;
      cnTotal: number;
      cnStatus: string;
      cnReasonCode: string;
    } | null)[] | null;
    subTotal: number;
    firstInvoice: boolean;
    linkedOrders?: (null)[] | null;
    resourceVersion: number;
    dunningAttempts?: (null)[] | null;
    termFinalized: boolean;
    roundOffAmount: number;
    isGifted: boolean;
    recurring: boolean;
    tax: number;
    exchangeRate: number;
    hasAdvanceCharges: boolean;
    currencyCode: string;
    card?: {
      brand: string;
      last4: string;
    } | null;
    total: number;
    status: string;
    writeOffAmount: number;
    id: string;
    dueDate: number;
    billingAddress: {
      line1: string;
      email: string;
      lastName: string;
      phone: string;
      city: string;
      state: string;
      firstName: string;
      validationStatus: string;
      zip: string;
      country: string;
      object: string;
      company: string;
    };
    lineItems?: ({
      description: string;
      customerId: string;
      amount: number;
      entityType: string;
      taxExemptReason: string;
      entityId: string;
      isTaxed: boolean;
      dateTo: number;
      id: string;
      dateFrom: number;
      subscriptionId: string;
      taxAmount: number;
      unitAmount: number;
      quantity: number;
      itemLevelDiscountAmount: number;
      discountAmount: number;
      object: string;
      pricingModel: string;
    })[] | null;
    netTermDays: number;
    subscriptionId: string;
    adjustmentCreditNotes?: (null)[] | null;
    priceType: string;
    amountDue: number;
    amountAdjusted: number;
    object: string;
    newSalesAmount?: number | null;
  };
  oid: number;
  pcustomerId: string;
  totalAmount: number;
  providerStatus: string;
  paymentCustomerOid: number;
  webhookEvents?: (null)[] | null;
  psubscriptionId: string;
  provider: string;
  puid: string;
  dueAt: string;
  promoterOid: number;
}

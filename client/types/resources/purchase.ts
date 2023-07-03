/**
 * Purchase Object
 * This is the purchase data format from server,
 * if you find any field missing, please add it here, cheers.
 */

export type Purchase = {
  totalCost: number; // in cents
  provider: string; // eventbrite | audience-republic | etc etc
  currencyCode: string;
  totalCostBreakdown: {
    tax: number;
    gross: number;
    paymentFee: number;
    ticketAgencyFee: number;
  };
  status: string;
  orderId: string;
  oid: number;
  eventOid: number;
  event: {
    oid: number;
    eventImageUrl: string;
    name: string;
  };
  sourceType: string;
  campaignOid: number;
  campaign: {
    oid: number;
    resources: {
      oid: number;
      url: string;
      assetType: string;
    }[];
    name: string;
    type: string;
  } | null;
  sysCtime: Date;
  orderDate: Date;
  type: string;
  totalTickets: number;
  fanProductOrderOid: number;
}

export interface CommonPuchase extends Purchase {
  lineItems: {
    cost: {
      value: number;
      currency: string;
      displayValue: string;
    }
    fee: {
      value: number;
      currency: string;
      displayValue: string;
    }
    name: string;
    totalTickets: number;
    counted: boolean;
  }[];
}


export interface PatreonPuchase extends Purchase {
  provider: 'patreon';
  lineItems: {
    gross: number;
    loyaltyTierName: string;
    paymentFee: null;
    providerFee: null;
    tax: null;
  }[];
}

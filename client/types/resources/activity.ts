/**
 * Activity Object
 * This is the activity data format from server,
 * if you find any field missing, please add it here, cheers.
 */
type Activity = {
  activityType: 'event-attendance' | 'event-purchase' | 'fan-message' | 'ecommerce-purchase' | 'loyalty-program-action' | 'campaign-registration';
  additionalInfo: {
  };
  sysCtime: Date;
  activityTime: Date;
  oid: number;
  eventOid: number | null;
  fanOid: number | null;
  purchaseOid: number | null;
  campaignOid: number | null;
  fanPromoterAccount?: SimpleFan | null;
};

interface ActivityFanMessage extends Activity {
  activityType: 'fan-message';
  additionalInfo: {
    provider: string;
    messageBody: string;
    status: string;
  };
  taskOid: number;
}

interface ActivityPatreonLoyaltyProgramAction extends Activity {
  activityType: 'loyalty-program-action';
  additionalInfo: {
    actionCost: {
      value: number;
      currency: string;
      displayValue: string;
    } | null;
    actionPaymentStatus: 'paid' | 'declined' | 'deleted' | 'pending' | 'refunded' | 'fraud' | 'other';
    actionType: 'pledge_start' | 'pledge_upgrade' | 'pledge_downgrade' | 'pledge_delete' | 'subscription';
    campaignName: string | null;
    loyaltyTierTitle: string;
    provider: 'patreon'
  };
  fanOid: number;
  activityResourceOid: number;
}

interface ActivityEventAttendance extends Activity {
  activityType: 'event-attendance';
  additionalInfo: {
    eventName: string;
    eventImageUrl: string;
    eventProvider?: string;
  };
  eventOid: number;
}

interface ActivityEventPurchase extends Activity {
  activityType: 'event-purchase';
  additionalInfo: {
    attendees: {
      fanOid: number;
      firstName: string;
      lastName: string;
    }[];
    campaignType: string;
    currencyCode: string;
    eventName: string;
    provider: string;
    quantity: number;
    resources: {
      assetType: string;
      oid: number;
      url: string;
    }[];
    sourceType: string;
    totalCost: number; // in cents
    type: string;
  };
  eventOid: number;
  purchaseOid: number;
}

interface ActivityPurchase extends Activity {
  activityType: 'ecommerce-purchase';
  additionalInfo: {
    attendees: {
      fanOid: number;
      firstName: string;
      lastName: string;
    }[];
    campaignType: string;
    currencyCode: string;
    eventName: string;
    provider: string;
    quantity: number;
    resources: {
      assetType: string;
      oid: number;
      url: string;
    }[];
    sourceType: string;
    totalCost: {
      currency: string;
      displayValue: string;
      value: number;
    }
    type: string;
  };
  eventOid: number;
  purchaseOid: number;
}

interface ActivityCampaignRegistration extends Activity {
  activityType: 'campaign-registration';
  additionalInfo: {
    name: string;
    resources: {
      assetType: string;
      oid: number;
      url: string;
    }[];
    type: string;
    actions: {
      target: string;
      type: string;
      additionalInfo: {};
    }[]
    event?: {
      provider: string;
    };
    settings?: {
      platform?: any;
    };
  };
  campaignOid: number;
}

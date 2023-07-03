import { Campaign } from '@/types/resources/campaign';
import { AREvent } from '@/store/modules/event/types';
import { Customer, FanLoyaltyMembership, LoyaltyProgramTier, LoyaltyProgram } from '@/api/customer-profile/types';

/**
 * Pruned verion of Fan
 * @field name The combination of firstName and lastName
 */
export interface PrunedCustomer extends Customer {
  name: string;
  formattedAge: string,
  formattedLocation: string,
};


/**
 * An Activity object, used within customer profiles and attached to a customer
 * TODO - At some point, we might move this into its own module
 * @field imagePath
 * @field title
 * @field subtitle
 * @field datetime
 * @field text
 * @field path The path in AM2
 * @field link The link from other websites
 * @field icon
 * @field iconColor
 * @field iconBackground
 * @field type
 * @field oid
 */
export type PrunedActivity = {
  imagePath: string | null;
  title: string;
  subtitle: string | null;
  datetime: Date;
  text: string;
  path: string | null;
  link: string | null;
  icon: {
    name: string;
    iconColor: string;
    iconBackground: string;
    width?: string;
    height?: string;
  };
  type: string[];
  additionalInfo: {
    campaignOid?: number;
    eventOid?: number;
    taskOid?: number;
    purchaseOid?: number;
    totalAmount?: number;
    totalQuantity?: number;
  },
  oid: string;
};


/**
 * A Purchase object, used within customer profiles and attached to a customer
 * TODO - At some point, we might move this into its own module
 * @field description - The name of the event or campaign attached to this purchase
 * @field currencyCode - The currency used to make the purchase
 * @field source - The platform from which the purchase was made, as well as any associated metadata
 * @field orderId - The order ID provided by the tickting agency
 * @field fanEventOrderOid - The order oid we assign to the purchase
 * @field status - The purchase status
 * @field purchaseDateTime - When was the purchase made?
 * @field tax - The total tax amount on the purchase
 * @field subTotal - The total amount paid for the tickets, less fees and taxes
 * @field lineItems - Each of the line items in the purchase
 *
 */
export type PrunedPurchase = {
  oid: number;
  description: string;
  currencyCode: string;
  source: {
    platform: string;
    description: string;
    icon: string;
    iconColor: string | null;
  };
  quantity: number;
  orderId: string;
  fanEventOrderOid: number;
  fanProductOrderOid: number;
  status: string;
  purchaseDateTime: Date;
  tax: number;
  fees: number; // All fees
  feesGross: number; // All fees with calculated tax
  inclusiveFees: number; // Total fees including all refunds
  inclusiveFeesGross: number;// Total fees including all refunds with calculated tax
  // subTotal: number; // Total less all refunds
  // inclusiveSubtotal: number; // Total including all refunds
  // grandTotal: number; // Total less all refunds
  // inclusiveGrandTotal: number; // Total including all refunds
  grossTotal: number;
  calculatedGrossTotal: number; // Gross, less all refunds
  eventOid: number;
  campaignOid: number;
  lineItems: {
    ticketType: string;
    singlePrice: number;
    subtotalPrice: number;
    feesAndTaxes: number;
    totalPrice: number;
    image: string | null;
    counted: boolean;
  }[];
};

export type LoyaltyProgramTiersMap = {
  [key: number]: LoyaltyProgramTier;
};

/**
 * State of Fan Module
 * @field customers List of fans
 * @field customer Singular, current fan
 * @field customersCount Total number of fans
 * @field isNoMoreCustomers Used for pagination, it tells you if there is no more fans or not
 * @field isFetchingCustomers Let you know if Vuex is still fetching fans from server
 */
export type CustomerState = {
  // Customer
  customer: PrunedCustomer | null;
  isFetchingCustomer: boolean;
  hasFetchCustomerFailed: boolean;

  // Customer Tags
  fanTags: Tag[];
  isFetchingFanTags: boolean;

  // Customer Activities
  fanActivity: PrunedActivity[];
  noMoreActivity: boolean;
  isFetchingActivity: boolean;
  hasFetchCustomerActivityFailed: boolean;
  lastActivityType: string | null;

  // Customer Purchase
  fanPurchases: PrunedPurchase[];
  noMorePurchases: boolean;
  isFetchingPurchases: boolean;
  hasFetchCustomerPurchasesFailed: boolean;

  // Customer Campaigns
  fanCampaigns: Campaign[];
  actionedCampaignOids: number[];
  isFetchingCampaigns: boolean;
  hasFetchCustomerCampaignsFailed: boolean;

  // Customer Events
  fanEvents: AREvent[];
  actionedEventOids: number[];
  isFetchingEvents: boolean;
  hasFetchCustomerEventsFailed: boolean;

  // Loyalty Memberships
  fanLoyaltyMemberships: FanLoyaltyMembership[];
  isFetchingLoyaltyMemberships: boolean;
  loyaltyProgramTiersMap: LoyaltyProgramTiersMap;


  // Loyalty Programs
  fanLoyaltyPrograms: LoyaltyProgram[];
  isFetchingLoyaltyPrograms: boolean;
};

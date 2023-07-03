/**
 * PromoterIntegration
 * @field meta Differ in different integrations
 * @field integration Differ in different integrations
 */
export interface BasePromoterIntegration {
    sysCtime: Date;
    meta: object;
    sysMtime: object;
    name: string;
    sysActivep: boolean;
    integration: object;
    promoterAccountOid: number;
    accountId: string;
    oid: number;
    status: string;
    promoterAccount: {
      oid: number;
      emailAddress: string;
      firstName: string;
      lastName: string;
      role: string[];
      sysCtime: Date;
      sysActivep: boolean;
    }[];
    app: string;
    oauthToken: {
      scope?: any;
      expiresAt: Date;
      expiresIn: number;
      tokenType: string;
      accessToken: string;
      refreshToken: string;
    };
    provider: string;
    promoterOid: number;
    lastSyncTime: string;
}

export interface EventbriteIntegration extends BasePromoterIntegration {
  provider: 'eventbrite';
  app: 'eventbrite';
}

export interface FacebookMessengerIntegration extends BasePromoterIntegration {
  provider: 'facebook';
  app: 'messenger';
}

export interface FacebookCustomAudiencesIntegration extends BasePromoterIntegration {
  provider: 'facebook';
  app: 'custom-audiences';
}

export interface ShopifyIntegration extends BasePromoterIntegration {
  provider: 'shopify';
  app: 'shopify';
}

export interface ZoomIntegration extends BasePromoterIntegration {
  provider: 'zoom';
  app: 'zoom';
}

export interface PatreonIntegration extends BasePromoterIntegration {
  provider: 'patreon';
  app: 'patreon';
}

export interface EventixIntegration extends BasePromoterIntegration {
  provider: 'eventix';
  app: 'eventix';
}

export interface MemberfulIntegration extends BasePromoterIntegration {
  provider: 'memberful';
  app: 'memberful';
}

export interface UniverseIntegration extends BasePromoterIntegration {
  provider: 'universe';
  app: 'universe';
}

export interface StripeIntegration extends BasePromoterIntegration {
  provider: 'stripe';
  app: 'stripe';
}

export interface TicketekIntegration extends BasePromoterIntegration {
  provider: 'ticketek';
  app: 'ticketek';
}

export interface MoshtixIntegration extends BasePromoterIntegration {
  provider: 'moshtix';
  app: 'moshtix';
}

export interface EventGeniusIntegration extends BasePromoterIntegration {
  provider: 'event-genius';
  app: 'event-genius';
}

export interface DiceIntegration extends BasePromoterIntegration {
  provider: 'dice';
  app: 'dice';
}

export interface HumanitixIntegration extends BasePromoterIntegration {
  provider: 'humanitix';
  app: 'humanitix';
}
export interface TryBookingIntegration extends BasePromoterIntegration {
  provider: 'try-booking';
  app: 'try-booking';
}

export type PromoterIntegration =
  EventbriteIntegration |
  FacebookMessengerIntegration |
  FacebookCustomAudiencesIntegration |
  ShopifyIntegration |
  ZoomIntegration |
  PatreonIntegration |
  DiceIntegration |
  EventixIntegration |
  MemberfulIntegration |
  UniverseIntegration |
  StripeIntegration |
  TicketekIntegration |
  MoshtixIntegration |
  EventGeniusIntegration |
  HumanitixIntegration |
  TryBookingIntegration;


/**
 * Sync Task
 */
export interface SyncTask {
    started: Date;
    sysCtime: Date;
    meta: {
      type: string;
      campaignsFailed: any[];
      campaignsSkipped: any[];
      campaignsCancelled: any[];
      campaignsCompleted: any[];
    };
    sysMtime: Date;
    name: string;
    sysActivep: boolean;
    duration: number;
    statusDetails: {
      lastError?: any;
      lastErrorTime?: any;
      totalCampaigns: number;
      completedCampaignsCount: number;
    };
    promoterAccountOid: number;
    oid: number;
    status: string;
    promoterAccount: {
      oid: number;
      firstName: string;
      lastName: string;
      emailAddress: string;
      promoterOid: number;
    };
    promoterIntegration: object;
    promoterIntegrationOid: number;
    provider: string;
    promoterOid: number;
    scheduledAt: Date;
}

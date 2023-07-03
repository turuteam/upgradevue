
export type Customer = {
  additionalInfo: {
    custom: {
      optusAccountNumber: string;
    };
    integrations: {
      spotify?: {
        scope?: any;
        expiresAt: Date;
        expiresIn: number;
        tokenType: string;
        accessToken: string;
        refreshToken: string;
      };
      facebook: {
        pages: {
          [key: string]: {
            psid: string;
            userRef: string;
            pageId: string;
            sysCtime: Date;
            validated: boolean;
            optInBody: {
              optin: {
                ref: string;
                userRef: string;
              };
              sender: {
                id: string;
              };
              recipient: {
                id: string;
              };
              timestamp: number;
            };
            campaignOid: number;
            promoterOid: number;
          };
        };
        psids: {
          [key: string]: string;
        };
      };
    };
  };
  subscriptions: {
    sms: boolean;
    email: boolean;
  };
  age: number;
  campaigns: number[];
  city: string;
  country: string;
  dob: Date | null;
  emailAddress: string;
  entryTimePerEvent: {
    [key: number]: Date;
  };
  events: number[];
  firstName: string;
  gender: string;
  lastName: string;
  mobileNumber: string;
  oid: number;
  optInForms: number[];
  points: number;
  pointsPerCampaign: {
    [key: number]: string;
  };
  pointsPerEvent: {
    [key: number]: string;
  };
  pointsRange: string;
  postcode: string;
  profileImageUrl: string;
  promoterOid: number;
  purchaseDatePerEvent: {
    [key: number]: string;
  };
  referrals: number
  referralsPerCampaign: {
    [key: number]: number;
  };
  referralsPerEvent: {
    [key: number]: string;
  };
  referralsRange: string;
  registrationTime: Date | null;
  registrationTimePerCampaign: {
    [key: number]: number;
  };
  socialInsights: {
    facebookLikes: string[];
    instagramFollows: string[];
    spotifyArtists: string[];
    spotifyTracks: string[];
  }
  state: string;
  stats: {
    [key: string]: any;  // TODO - Figure this one out
  };
  streetAddress: string;
  sysMtime: string;
  tags: number[];
  ticketSales: number
  ticketSalesPerEvent: {
    [key: number]: number;
  };
  tickets: number;
  ticketsPerEvent: {
    [key: number]: number;
  };
  totalCampaignCount: number;
  totalEventCount: number;
  totalFollowersCount: number;
  totalPoints: number;
  totalReferrals: number;
  totalTicketSales: number;
  totalTickets: number;
}

export interface FanLoyaltyMembership {
  sysCtime: Date;
  meta: {
    id: string;
  };
  sysMtime: Date;
  lifetimeSupportCents: number;
  fanLoyaltyTier: {
    oid: number;
    loyaltyTierOid: number;
  };
  sysActivep: boolean;
  pledgeRelationshipStart: Date;
  fanOid: number;
  oid: number;
  status: string;
  loyaltyProgramOid: number;
  promoterIntegrationOid: number;
  provider: string;
  puid: string;
  promoterOid: number;
}

export interface LoyaltyProgramTier {
  fanLoyaltyMembershipOid: number;
  sysCtime: Date;
  sysMtime: Date;
  sysActivep: boolean;
  oid: number;
  loyaltyTier: {
    oid: number;
    title: string;
    description: string;
    amountCents: number;
    published: boolean;
    requiresShipping: boolean;
  };
  promoterIntegrationOid: number;
  loyaltyTierOid: number;
  provider: string;
  promoterOid: number;
}

export interface LoyaltyProgram {
  description: string;
  isMonthly: boolean;
  meta: {
    planData: any;
    planGroup: any;
  };
  name: string;
  oid: number;
  promoterIntegration: {
    accountId: string;
    app: string;
    integration: {
      subdomain: string;
      encryptedApiKey: string;
      encryptedPromoterIntegrationOid: string;
    };
    meta: any;
    oid: number;
    provider: string;
  };
  promoterIntegrationOid: number;
  promoterOid: number;
  provider: string;
  puid: number;
  sysCtime: Date;
  sysMtime: Date;
  sysActivep: boolean;
}


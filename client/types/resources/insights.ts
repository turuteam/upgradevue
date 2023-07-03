interface InsightsCustomers {
  data: {
    key: number;
    name: string;
    total: number;
    avatar: string;
    emailAddress: string;
    additionalInfo: {
      custom: {
        optusAccountNumber: string;
      };
      integrations: {
        spotify: {
          [key: number]: {
            scope?: any;
            expiresAt: Date;
            expiresIn: number;
            tokenType: string;
            accessToken: string;
            refreshToken: string;
          };
          scope?: any;
          expiresAt: Date;
          expiresIn: number;
          tokenType: string;
          accessToken: string;
          refreshToken: string;
        };
        facebook: {
          pages: {
            [key:number]: {
              psid: string;
              pageId: string;
              userRef?: any;
              sysCtime: Date;
              validated: boolean;
              optInBody: {
                optin: {
                  ref: string;
                  userRef?: string;
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
            [key: number]: string;
          };
        };
      };
      subscriptions: {
        sms: boolean;
        email: boolean;
      };
    };
  }[];
  type: string;
  title: string;
  position: number;
  chartType: string;
}

interface Insights {
  oid: number;
  sysMtime: Date;
  promoterOid: number;
  filterGroupOid: number;
  eventOid?: any;
  campaignOid?: any;
  insights: {
    topReferrers: {
      data?: any;
      type: string;
      title: string;
      position: number;
      chartType: string;
    };
    topArtists: {
      data?: any;
      type: string;
      title: string;
      position: number;
      chartType: string;
    };
    age: {
      data: {
        age: string;
        count: number;
      }[];
      type: string;
      count: number;
      title: string;
      average: number;
      position: number;
      totalAge: number;
      chartType: string;
    };
    city: {
      data: {
        data: string;
        count: number;
      }[];
      type: string;
      title: string;
      position: number;
      chartType: string;
    };
    state: {
      data: {
        data: string;
        count: number;
      }[];
      type: string;
      title: string;
      position: number;
      chartType: string;
    };
    highestValueCustomers: InsightsCustomers;
    mostLoyalCustomers: InsightsCustomers;
    topTracks: {
      data?: any;
      type: string;
      title: string;
      position: number;
      chartType: string;
    };
    gender: {
      data: {
        count: number;
        gender: string;
      }[];
      type: string;
      title: string;
      total: number;
      position: number;
      chartType: string;
    };
    topInterests: {
      data: {
        oid: number;
        href: string;
        name: string;
        puid: string;
        total: number;
        avatar: string;
      }[];
      type: string;
      title: string;
      position: number;
      chartType: string;
    };
    country: {
      data: {
        data: string;
        count: number;
      }[];
      type: string;
      title: string;
      position: number;
      chartType: string;
    };
  };
}


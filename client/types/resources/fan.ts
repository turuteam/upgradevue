/**
 * Fan Object
 * This is the fan data format from server,
 * if you find any field missing, please add it here, cheers.
 */
type SourceFan = {
  totalEventCount: number;
  lastName: string;
  sysMtime: Date;
  totalTicketSales: number;
  firstName: string;
  mobileNumber: string;
  additionalInfo: {
    custom: {
      optusAccountNumber: string;
    };
    integrations: {
      spotify: {
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
    subscriptions: {
      sms: boolean;
      email: boolean;
    };
  };
  oid: number;
  emailAddress: string;
  totalTickets: number;
}

/*
 * Sometimes fan will be added as a JOINed resource on another resource. In these instances, it'll contain only the bare-
 * bones data necessary to render a fan's details.
 */
type SimpleFan = {
  oid: number;
  promoterOid: number;
  firstName: string;
  lastName: string;
  emailAddress: string;
  additionalInfo: any;
}


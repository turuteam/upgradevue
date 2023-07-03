export type MessageListChannel = 'email' | 'sms';

export interface MessageList {
  email: boolean;
  sysCtime: string;
  meta: {
    name?: string;
    campaignOid?: number;
    email?: {
      promoterPropertyOid: number;
    } | null;
    facebookMessenger?: {
      pageId: string;
      imageSrc: string;
      pageName: string;
    } | null;
  };
  filterGroupOid?: number | null;
  filterGroup: {
    oid?: number | null;
    name?: string | null;
  };
  sysMtime: string;
  name: string;
  sysActivep: boolean;
  facebookMessenger: boolean;
  promoterAccountOid: number;
  oid: number;
  promoterAccount: {
    oid: number;
    lastName: string;
    firstName: string;
  };
  userDefined: boolean;
  emailVerified: {
    verified?: boolean | null;
    promoterOid?: number | null;
    messageListOid?: number | null;
  };
  sms: boolean;
  statsSnapshot: {
    facebook: {};
    sms: {
      total: number;
      optedIn: number;
      validMobile: number;
    };
    mobileNumber?: number; // TODO - Remove after release. Kept as a failsafe
    validSms?: number; // TODO - Remove after release. Kept as a failsafe
    email: number;
    total: number;
    smsRegions: {
      [key: string]: number | null;
    };
    facebookMessenger: number;
  };
  promoterOid: number;
}

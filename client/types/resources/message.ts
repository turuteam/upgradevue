type SMSMessagePreview = {
  sender: string;
  body: string;
  totalRecipients: number;
  cost: {
    currency: string;
    recipients: number;
    regionNotFound: number;
    total: number;
  };
  charactersLeft: number;
  optOutMessage: string;
};

type MessageTagMaxWidthMap = {
  [key: string]: number;
};

type MessageStatus = 'draft' | 'archived' | 'in-progress' | 'scheduled' | 'completed' | 'failed' | 'cancelled';

type ClicksSnapshot = {
  targetUrl: string;
  total: number;
  uniqueTotal: number;
};

interface Message {
  started: string;
  sysCtime: string;
  sysMtime: string;
  customerName: string | null;
  name: string;
  sysActivep: boolean;
  duration?: any;
  statusDetails: {
    sent: number;
    costs: {
      currencyCode: string;
      currency: string; // TODO - Remove this one the server is updated
      total: number;
      recipients: number;
      regionNotFound: number;
    };
    failed: number;
    clicked: number;
    unsubscribed: number;
    inProgress: number;
    totalMessages: number;
    opened?: number;
    deferred?: number;
    markedSpam?: number;
    bounced?: number;
    undelivered?: number;
    rejectedRecipients: {
      bounced: number;
    };
    clicksSnapshot?: ClicksSnapshot[];
  };
  promoterAccountOid: number;
  oid: number;
  status: MessageStatus;
  promoterAccount?: {
    oid: number;
    emailAddress: string;
    firstName: string;
    lastName: string;
  };
  promoterIntegration: {
    oid?: any;
    name?: any;
    provider?: any;
    app?: any;
    accountId?: any;
    meta?: any;
    integration?: any;
  };
  promoterIntegrationOid?: any;
  provider: string;
  promoterOid: number;
  scheduledAt: string;
}

/**
 * Message Type for SMS and Facebook messages
 */
interface SimpleMessage extends Message {
  customerName: string | null;
  meta: {
    provider: 'sms' | 'facebook';
    messageBody: string;
    presentation: {
      timeZone: string | null;
    };
    messageListOid: number;
    facebookMessenger: {
      imageSrc: string | null;
      pageName: string | null;
      pageId: string | null;
    };
    initiator?: {
      campaignOid?: number | null;
      eventOid?: number | null;
    };
    tagsResourceOid: number | null;
    fallbackDynamicTags?: {
      [key: string]: string;
    };
    dynamicTagHeaders: string[];
    tagMaxWidthMap: MessageTagMaxWidthMap;
    uiStatus: MessageStatus;
    recipientFilter: {
      logic: ('and' | 'or')[];
      conditions: SegmentConditionSearchPickerCondition[];
    } | null;
  };
}

/**
 * Simple Message type for editing
 */
type ScratchSimpleMessage = {
  oid: number | null;
  customerName: string | null;
  provider: 'sms' | 'facebook' | null;
  meta: {
    messageListOid: number | null;
    initiator?: {
      campaignOid?: number | null;
      eventOid?: number | null;
    };
    facebookMessenger: {
      pageId: string | null;
      pageName: string | null;
    };
    messageBody: string;
    dynamicTagHeaders: string[];
    tagsResourceOid: number | null;
    fallbackDynamicTags?: {
      [key: string]: string;
    };
    tagMaxWidthMap: MessageTagMaxWidthMap;
    presentation: { timeZone: string | null };
    recipientFilter: {
      logic: ('and' | 'or')[];
      conditions: SegmentConditionSearchPickerCondition[];
    } | null;
  };
  scheduledAt: string | null;
};

/**
 * Message Type for Email messages
 */
interface EmailMessage extends Message {
  customerName: string | null;
  meta: {
    disableLinkTracking: boolean;
    messageBody: {
      previewText: string;
      subject: string;
    }; // To be completed
    presentation: {
      template: object | string; // From Unlayer, don't check it, too much
      templateType?: 'unlayer' | 'rich-text' | 'custom' | 'beefree';
      timeZone: string | null;
      hideDefaultEmailFooter?: boolean;
    };
    email: {
      promoterPropertyOid: number;
    };
    initiator?: {
      campaignOid?: number | null;
      eventOid?: number | null;
    };
    provider: 'email';
    messageListOid: number;
    campaignOid: number | null;
    tagsResourceOid: number | null;
    fallbackDynamicTags?: {
      [key: string]: string;
    };
    dynamicTagHeaders: string[];
    templateResourceOid: number;
    uiStatus: MessageStatus;
    recipientFilter: {
      logic: ('and' | 'or')[];
      conditions: SegmentConditionSearchPickerCondition[];
    } | null;
  };
}

/**
 * Email Message type for editing
 */
type ScratchEmailMessage = {
  abEmail: boolean | false;
  abEmailType: string | null;
  oid: number | null;
  customerName: string | null;
  provider: 'email' | null;
  meta: {
    disableLinkTracking: boolean | null;
    email: {
      promoterPropertyOid: number | null;
    };
    initiator?: {
      campaignOid?: number | null;
      eventOid?: number | null;
    };
    messageListOid: number | null;
    messageBody: {
      previewText: string | null;
      subject: string | null;
    };
    dynamicTagHeaders: string[];
    tagsResourceOid: number | null;
    fallbackDynamicTags?: {
      [key: string]: string;
    };
    presentation: {
      template: object | null;
      templateType: 'unlayer' | 'rich-text' | 'custom' | 'beefree';
      timeZone: string | null;
      hideDefaultEmailFooter?: boolean;
    };
    templateResourceOid: number | null;
    recipientFilter: {
      logic: ('and' | 'or')[];
      conditions: SegmentConditionSearchPickerCondition[];
    } | null;
    abTest: {
      variant: string;
      treatment: string;
    }
  };
  scheduledAt: string | null;
  name: string | null;
};

type MessageActionStats = {
  ts: string;
  inProgress: number;
  clicked: number;
  opened: number;
  sent: number;
  deferred: number;
  undelivered: number;
  bounced: number;
  unsubscribed: number;
  markedSpam: number;
  failed: number;
};

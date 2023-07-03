export type ConversionStats = {
  targetOid: number;
  indicators: {
    avgTickets: number;
    revenue: number;
    totalTickets: number;
  };
};

export type ConversionTableData = {
  firstName: string;
  emailAddress: string;
  eventName: string;
  lastName: string;
  gross: {
    currency: string;
    displayValue: string;
    value: number;
  };
  mobileNumber: string;
  name: string;
  orderDate: string;
  totalOrders: number;
};

export type ConversionGraphTimeseriesItem = {
  ts: string;
  sales: number;
  tickets: number;
};

export type ConversionGraphTimeseries = {
  targetOid: number;
  name: string;
  timeZone: string;
  stats: {
    salesPerDay: ConversionGraphTimeseriesItem[];
    salesPerMonth: ConversionGraphTimeseriesItem[];
    salesPerWeek: ConversionGraphTimeseriesItem[];
    salesPerHour: ConversionGraphTimeseriesItem[];
    cumulativeSales: ConversionGraphTimeseriesItem[];
  };
};

/**
 * State of Message Module
 * @field additionalDynamicTags Additional dynamic tags that are defined in external api settings
 * @field defaultEmailDynamicTags Default dynamic tags for email
 * @field smsMessagePreview The preview of scratchSimpleMessage from server
 * @field scratchSimpleMessage Used for create/edit SMS/Messenger messages
 * @field scratchEmailMessage Used for create/edit Email messages
 * @field scratchEmail The html that will be pushed to S3 bucket as the template for the email message
 * @field messages List of messages
 * @field isFetchingMessages Let you know if Vuex is still fetching messages from server
 * @field isNoMoreMessages Used for pagination, it tells you if there is no more messages or not
 * @field csvPreviewContacts We keep first few rows of dynamic tags csv file for previwing purpose
 */
export type MessageState = {
  // Additional Dynamic Tags
  additionalDynamicTags: string[];
  defaultEmailDynamicTags: ['email_address', 'first_name'];
  defaultSmsDynamicTags: ['mobile_number'];
  // Sratch Message
  isSavingMessageAsDraft: boolean;
  isSendingOutMessage: boolean;
  isSendingTestEmail: boolean;
  // Scratch Simple Message
  smsMessagePreview: SMSMessagePreview;
  scratchSimpleMessage: ScratchSimpleMessage;
  fallbackDynamicTagsForScratchSimpleMessage: string[];
  // Scratch Email Message
  scratchEmailMessage: ScratchEmailMessage;
  scratchEmailMessageUnsaved: boolean;
  fallbackDynamicTagsForScratchEmailMessage: string[];
  scratchEmailMessageAbList: { [key: string]: ScratchEmailMessage };
  // Scratch Email Html
  savedEmail: string | null;
  scratchEmail: string | null;
  isUpdatingEmail: boolean;
  isFetchingSavedEmail: boolean;
  // Messages
  messages: Message[];
  isFetchingMessages: boolean;
  hasFetchMessagesFailed: boolean;
  isNoMoreMessages: boolean;
  // Current Message
  currentSelectedMessage: SimpleMessage | EmailMessage | null;
  isFetchingMessage: boolean;
  // Csv Preview Contacts
  csvPreviewContacts: CsvPreviewContact[] | null;
  selectedCsvPreviewContactIndex: number | null;
  displayCsvPreviewContacts: boolean;
  isFetchingSmsCost: boolean;
  smsCostFailedToFetch: boolean;
  // Message stats timeseries
  isFetchingMessageActionStatsTimeseries: boolean;
  messageActionStatsTimeseries: MessageActionStats[];
  // Message delivery stats
  isFetchingMessageDeliveryStats: boolean;
  messageDeliveryStats: {} | null;
  // Conversion
  conversionSelectedEvents: number[];
  conversionStats: ConversionStats[] | [];
  conversionTableData: ConversionTableData[] | [];
  conversionGraphTimeseries: ConversionGraphTimeseries[] | [];
  conversionTableSearch: string;
  conversionTableCount: number;
  isFetchingConversionTableData: boolean;
  isFetchingConversionGraph: boolean;
  isFetchingConversionStats: boolean;
  isCalculationsFinished: boolean;
  calculationsTimeoutId: number | null;
};

export type RecipientFilter = {
  logic: ('and' | 'or')[];
  conditions: SegmentConditionSearchPickerCondition[];
};

export type CsvPreviewContact = {
  [key: string]: string;
};

export type AvailableMessageOptionsMap = {
  duplicate: boolean;
  view: boolean;
  edit: boolean;
  archive: boolean;
  cancel: boolean;
};

/**
 * Changes to be merged into ScratchSimpleMessage
 */
export type ScratchSimpleMessageChanges = {
  meta?: {
    messageListOid?: number | null;
    messageBody?: string | null;
    dynamicTagHeaders?: string[];
    tagsResourceOid?: number | null;
    tagMaxWidthMap?: MessageTagMaxWidthMap;
    presentation?: { timeZone?: string | null };
    facebookMessenger: {
      pageId: string;
    };
    initiator?: {
      campaignOid?: number | null;
      eventOid?: number | null;
    };
    recipientFilter: RecipientFilter | null;
  };
  provider: string | null;
  scheduledAt?: string | null;
};

/**
 * Changes to be merged into ScratchSimpleMessage
 */
export type ScratchEmailMessageChanges = {
  meta: {
    disableLinkTracking: boolean | null;
    messageListOid?: number | null;
    initiator?: {
      campaignOid?: number | null;
      eventOid?: number | null;
    };
    email: {
      promoterPropertyOid: number;
    };
    messageBody?: {
      previewText?: string | null;
      subject?: string | null;
    };
    dynamicTagHeaders?: string[];
    tagsResourceOid?: number | null;
    presentation?: {
      template?: object | null;
      timeZone?: string | null;
    };
    templateResourceOid?: number | null;
    recipientFilter: RecipientFilter | null;
  };
  provider: 'email';
  scheduledAt?: string | null;
};

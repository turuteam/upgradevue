import { MessageList } from '@/api/message-lists/types';
import { PromoterIntegrationTask } from '@/api/promoter-integration-task/types';

type EventResource = {
  oid: number;
  url: string;
  filename: string;
  sysCtime: string;
  assetType: string;
  contentType: string;
  promoterOid: number;
};

export type EventZoomMeeting = {
  createdAt: Date;
  duration: number;
  hostEmail: string;
  hostId: string;
  id: number;
  joinUrl: string;
  startTime: Date;
  startUrl: string;
  status: string;
  timezone: string;
  topic: string;
  type: number;
  uuid: string;
};

export type ConnectZoomProviderInfo = {
  integrationOid: number;
  accountId: number;
};

/**
 * AR Event object
 * Don't name it "Event", coz javascript already has type "Event".
 */
export interface AREvent {
  oid: number;
  description?: any;
  sysCtime: string;
  meta: {
    synch: any;
    meeting?: EventZoomMeeting;
    integrationOid?: number;
    accoundId?: string;
  };
  additionalInfo: {
    purchaseTicketUrl?: string,
  },
  ticketStats: {
    oid: number;
    attendees: number;
    totalTicketSales: number;
    totalTicketsSold: number;
  }[];
  capacity?: number;
  endDate: string;
  name: string;
  campaigns: {
    oid: number;
    name: string;
    type: string;
    endDate: string;
    urlSlug: string;
    sysCtime: string;
    startDate: string;
    sysActivep: boolean;
  }[];
  tourOid: number;
  presentation: {
    website?: any;
    liveStreamUrl?: any;
    settings?: {
      assignTags: string[];
      subscribeToMessageList: {
        listOid: number | null;
        email: boolean;
        sms: boolean;
        facebookMessenger: boolean;
      };
    }
  };
  startDate: string;
  resources: EventResource[];
  location: string;
  provider?: any;
  timeZone: string;
}

export type ScratchEvent = {
  oid: number | null;
  name: string | null;
  description: string | null;
  location: string | null;
  capacity: number | null;
  startDate: string | null;
  endDate: string | null;
  presentation: {
    liveStreamUrl: string | null,
    website: string | null,
    settings?: {}
  },
  provider?: string | null;
  resources: EventResource[],
  timeZone: string | null,
  meta: {
    synch: {},
    meeting?: EventZoomMeeting;
    integrationOid?: number;
    accoundId?: string;
  },
};

/**
 * This object is for patching or creating events.
 * Please be aware of that some fields are allowing "null" value but others are not,
 * that's because they're mandatory fields.
 */
export type EventForServer = {
  name?: string;
  description?: string;
  capacity?: number | null;
  startDate?: string;
  endDate?: string | null;
  location?: string | null;
  timeZone?: string;
  meta?: any;
  provider?: string | null;
  presentation?: {
    liveStreamUrl?: string | null,
    website?: string | null,
  },
  resourceOids?: number[];
}

export type EventListType = {
  location: string;
  name: string;
  oid: number;
  startDate: string;
  sysCtime: string;
  sysMtime: string;
}


export type EventState = {
  // Events
  events: AREvent[],
  totalEventsCount: number,
  hasNoMoreEvents: boolean,
  isFetchingEvents: boolean,

  // Current Event
  currentEvent: AREvent | null,
  isFetchingEvent: boolean,

  // Scratch Event
  scratchEvent: ScratchEvent,
  isUpdatingEvent: boolean,
  isCreatingEvent: boolean,
  connectZoomProviderInfo: ConnectZoomProviderInfo | null;


  // Events Merge
  isMergingEvents: boolean,

  // Event Ticket Stats & Sales
  isFetchingEventTicketStats: boolean,
  eventTicketStats: EventTicketStats | null,
  isFetchingEventTicketSales: boolean,
  eventTicketSales: EventSalesRawData | null,
  isFetchingZoomAttendance: boolean,
  messageListInEvent: MessageList | null,
  scratchAdvancedSettings: ScratchAdvancedSettings,

  rawSalesChartData: EventTicketSalesChartRawData | null,
  rawSalesOverlayData: EventTicketSalesChartRawData[] | null,
  salesChartTimezone: string | null,
  salesChartDataIsLoading: boolean,
  dragListenerAdded: boolean,

  eventAnnotations: CreatedEventAnnotation[],

  compareSalesData: EventTicketSalesChartData,
  initialSalesData: EventTicketSalesChartData,

  compareTimescaleData: EventTimescaleDataContexts,
  initialTimescaleData: EventTimescaleDataContexts,

  // Event list
  eventsList: EventListType[],
  unsavedEventsList: EventListType[],
  isFetchingEventsList: boolean,
  eventsListSearch: string,
  eventsListTotalCount: number,
  eventsListStepLoadCount: number,
  eventsListLoaded: number,
  isLastEventListLoaded: boolean,
  selectedEventsList: EventListType[],
}

export interface EventTicketSalesChartRawData {
  [key: string]: any;
  totalSales: any;
  incrementalSales: any;
}

export type ScratchAdvancedSettings = {}

export interface EventAnnotation {
  eventOid: number,
  promoterOid: number,
  userDefined: boolean,
  type: string,
  body: string,
  timestamp: string,
}

export interface UpdateAnnotationPayload {
  oid: number,
  body: string,
}

export interface CreatedEventAnnotation extends EventAnnotation {
  oid: number,
}

export type EventAnnotationPostResponse = {
  sysCtime: string;
  sysMtime: string;
  type: string;
  eventOid: number;
  oid: number;
  userDefined: boolean;
  timestamp: string;
  body: string;
  promoterOid: number;
}

export function getAnnotationFromAPIResponse({oid, eventOid, promoterOid, userDefined, type, body, timestamp}: EventAnnotationPostResponse): CreatedEventAnnotation {
  return {
    oid,
    eventOid,
    promoterOid,
    userDefined,
    type,
    body,
    timestamp,
  }
}

export interface EventSalesRawData {
  [key: string]: any;
  cumulativeSales: any;
  oid: any;
  sales: any;
  salesPerDay: any;
  salesPerHour: any;
  salesPerMonth: any;
  salesPerWeek: any;
  sysCtime: any;
  sysMtime: any;
}

export interface EventTicketSalesChartData {
  [key: string]: EventSalesContextData;
  sales: EventSalesContextData;
  quantity: EventSalesContextData;
}

export interface EventTimescaleRawData {
  [key: string]: any;
  salesPerDay: any;
  salesPerWeek: any;
  salesPerMonth: any;
}

export type EventTimescaleDataContexts = {
  sales: EventSalesContextData,
  quantity: EventSalesContextData,
}

export interface EventSalesContextData {
  [key: string]: any;
  accumulative: any;
  incremental: any;
}

export interface dashboardBucket {
  day: {[key: string]: any;},
  month: {[key: string]: any;},
  year: {[key: string]: any;},
}

export interface dashboardBuckets {
  all: dashboardBucket,
  ticket: dashboardBucket,
  ecommerce: dashboardBucket,
  loyalty: dashboardBucket
}

export interface dashboardArrayBucket {
  day: {ts: string, value: string}[],
  month: {ts: string, value: string}[],
  year: {ts: string, value: string}[],
}

export interface salesHourlyTimeseries {
  hour: number;
  value: number;
}

export interface PromoterSalesStatsSnapshot {
  oid: number;
  sysMtime: any;
  promoterOid: number;
  date: string;
  ticketSales: number;
  ecommerceSales: number;
  loyaltySales: number;
  ticketSalesTimeSeries: salesHourlyTimeseries[];
  ecommerceSalesTimeSeries: salesHourlyTimeseries[];
  loyaltySalesTimeSeries: salesHourlyTimeseries[];
}

import { Module } from "vuex";
import { RootState } from '@/store/modules/types';
import { MessageList } from '@/api/message-lists/types';
import { clone, mergeObjects } from '@/utils/helpers';
import {
  AREvent,
  ConnectZoomProviderInfo,
  EventAnnotation,
  EventState,
  EventTicketSalesChartData,
  EventTicketSalesChartRawData,
  EventTimescaleDataContexts,
  EventListType,
 } from './types';
import { defaultSalesTimescaleContexts, defaultSalesChartContexts } from './utils'
import { eventActions } from './actions';
import deepmerge from 'deepmerge'
import {
  initScratchEvent,
  getEventbriteUrl,
  patchMessageListInAdvancedSettings,
  patchTagsInAdvancedSettings,
  initScratchAdvancedSettings,
  patchScratchAdvancedSettingsToEvent,
  getZoomUrlFromCurrentEvent,
  generateDefaultEventStartTime,
  checkHasIntegration,
  getEventImageUrl,
  getEventTotalTicketSales,
  getEventTotalTicketSold,
  getEventAttendees,
} from './utils';
import { PromoterIntegrationTask } from '@/api/promoter-integration-task/types';

export const initialEventState = (): EventState => ({
  // Events
  events: [],
  totalEventsCount: 0,
  hasNoMoreEvents: false,
  isFetchingEvents: false,

  // Current Event
  currentEvent: null,
  isFetchingEvent: false,

  // Scratch Event
  scratchEvent: initScratchEvent(),
  isUpdatingEvent: false,
  isCreatingEvent: false,
  connectZoomProviderInfo: null,

  // Events Merge
  isMergingEvents: false,

  // Event Ticket Stats & Sales
  isFetchingEventTicketStats: false,
  eventTicketStats: null,
  isFetchingEventTicketSales: false,
  eventTicketSales: null,
  isFetchingZoomAttendance: false,
  salesChartTimezone: null,
  rawSalesChartData: null,
  rawSalesOverlayData: null,
  messageListInEvent: null,
  scratchAdvancedSettings: initScratchAdvancedSettings(),
  salesChartDataIsLoading: false,
  dragListenerAdded: false,
  eventAnnotations: [],

  compareSalesData: defaultSalesChartContexts(),
  initialSalesData: defaultSalesChartContexts(),
  compareTimescaleData: defaultSalesTimescaleContexts(),
  initialTimescaleData: defaultSalesTimescaleContexts(),

  // eventList (used in CompareEventsDropdown)
  eventsList: [],
  isFetchingEventsList: false,
  eventsListSearch: '',
  eventsListTotalCount: 0,
  eventsListLoaded: 0,
  isLastEventListLoaded: false,
  eventsListStepLoadCount: 25,
  selectedEventsList: [],
  unsavedEventsList: [],
});

export const initAdvancedSettings = {};

const eventModule: Module<EventState, RootState> = {
  namespaced: true,
  actions: eventActions,
  state: initialEventState,
  mutations: {
    SET_DRAG_LISTENER_STATE(state, payload) {
      state.dragListenerAdded = payload
    },
    UPDATE_ANNOTATION(state, annotation) {
      let updatedAnno = state.eventAnnotations.find(item => item.oid === annotation.oid)
      updatedAnno!.body = annotation.body
    },
    DELETE_ANNOTATION(state, oid) {
      state.eventAnnotations = state.eventAnnotations.filter(annotation => annotation.oid !== oid)
    },
    CLEAR_ANNOTATIONS(state) {
      state.eventAnnotations = []
    },
    SET_INITIAL_ANNOTATIONS(state, annotations) {
      state.eventAnnotations = annotations
    },
    ADD_ANNOTATION_TO_EVENT(state, annotation) {
      state.eventAnnotations = [
        ...state.eventAnnotations,
        annotation,
      ]
    },
    SALES_CHART_DATA_IS_LOADING(state, bool) {
      state.salesChartDataIsLoading = bool
    },
    CLEAR_SALES_DATA(state) {
      state.compareSalesData = defaultSalesChartContexts()
    },
    CLEAR_COMPARE_TIMESCALE_DATA(state) {
      state.initialTimescaleData = defaultSalesTimescaleContexts()
      state.compareTimescaleData = defaultSalesTimescaleContexts()
    },
    ADD_TICKET_SALES_SERIES(state, payload: EventTicketSalesChartData) {
      state.compareSalesData = payload
    },
    UPDATE_TIMESCALE_DATA_TIMEZONE(state, payload) {
      state.initialTimescaleData = payload
    },
    ADD_OVERLAY_TIMESCALE_DATA(state, payload) {
      state.compareTimescaleData = payload
    },
    UPDATE_CURRENT_EVENT_CHART_DATA_TIMEZONE(state, payload: EventTicketSalesChartData) {
      state.initialSalesData =  payload
    },

    SET_INITIAL_TIMESCALE_DATA(state, payload: EventTimescaleDataContexts) {
      state.initialTimescaleData = Object.freeze(payload)
    },
    SET_INITIAL_TICKET_SALES_CHART_DATA(state, payload: EventTicketSalesChartData) {
      state.initialSalesData =  Object.freeze(payload)
    },
    SET_RAW_SALES_CHART_DATA(state, payload: EventTicketSalesChartRawData) {
      state.rawSalesChartData = payload
    },
    SET_RAW_SALES_OVERLAY_DATA(state, payload: EventTicketSalesChartRawData[]) {
      state.rawSalesOverlayData = payload
    },
    RESET_EVENTS(state) {
      state.events = [];
      state.isFetchingEvents = false;
      state.hasNoMoreEvents = false;
      state.totalEventsCount = 0;
    },
    SET_EVENTS(state, events: AREvent[]) {
      state.events = clone(events);
    },
    REMOVE_EVENT(state, eventOid:number) {
      // @ts-ignore
      state.events = clone(state.events).filter( item => item.oid !== eventOid)
      state.totalEventsCount--
    },
    CONCAT_EVENTS(state, events: AREvent[]) {
      state.events = clone(state.events.concat(events));
    },
    SET_TOTAL_EVENTS_COUNT(state, count: number) {
      state.totalEventsCount = count;
    },
    SET_IS_FETCHING_EVENTS(state, isFetching: boolean) {
      state.isFetchingEvents = isFetching;
    },
    RESET_EVENT_TICKET_SALES(state) {
      state.eventTicketSales = null;
    },
    RESET_EVENT_TICKET_STATS(state) {
      state.eventTicketStats = null;
    },
    SET_HAS_NO_MORE_EVENTS(state, hasNoMore: boolean) {
      state.hasNoMoreEvents = hasNoMore;
    },
    // Current Event
    RESET_CURRENT_EVENT(state) {
      state.currentEvent = null;
    },
    SET_CURRENT_EVENT(state, event: AREvent) {
      state.currentEvent = clone(event);
    },
    SET_EVENT_SALES_CHART_TIMEZONE(state, timezone: string) {
      state.salesChartTimezone = timezone
    },
    SET_IS_FETCHING_EVENT(state, isFetching: boolean) {
      state.isFetchingEvent = isFetching;
    },
    // Scratch Event
    RESET_SCRATCH_EVENT(state) {
      state.scratchEvent = initScratchEvent();
      state.scratchAdvancedSettings = initScratchAdvancedSettings();
      state.messageListInEvent = null;
    },
    RESET_SCRATCH_ADVANCED_SETTINGS(state) {
      state.scratchAdvancedSettings = initScratchAdvancedSettings();
      state.messageListInEvent = null;
    },
    SET_SCRATCH_EVENT(state, event: AREvent) {
      state.scratchEvent = clone(event);
      state.messageListInEvent = null;
    },
    PATCH_SCRATCH_EVENT(state, changes) {
      state.scratchEvent = mergeObjects(state.scratchEvent, changes);
    },
    INJECT_CONNECT_ZOOM_PROVIDER_INFO_TO_SCRATCH_EVENT(state, { integrationOid, accountId }: ConnectZoomProviderInfo) {
      state.scratchEvent = mergeObjects(state.scratchEvent, {
        provider: 'zoom',
        meta: {
          integrationOid,
          accountId,
        },
      });
    },
    RESET_CONNECT_ZOOM_PROVIDER_INFO(state) {
      state.connectZoomProviderInfo = null;
    },
    SET_CONNECT_ZOOM_PROVIDER_INFO(state, { integrationOid, accountId }) {
      state.connectZoomProviderInfo = {
        integrationOid,
        accountId,
      };
    },
    SET_IS_UPDATING_EVENT(state, isUpdating: boolean) {
      state.isUpdatingEvent = isUpdating;
    },
    SET_IS_CREATING_EVENT(state, isCreating: boolean) {
      state.isCreatingEvent = isCreating;
    },
    // Events Merge
    SET_IS_MERGING_EVENTS(state, isMerging: boolean) {
      state.isMergingEvents = isMerging;
    },
    // Event Ticket Stats & Sales
    SET_IS_FETCHING_EVENT_TICKET_STATS(state, isFetching: boolean) {
      state.isFetchingEventTicketStats = isFetching;
    },
    SET_EVENT_TICKET_STATS(state, eventTicketStats: EventTicketStats) {
      state.eventTicketStats = clone(eventTicketStats);
    },
    SET_IS_FETCHING_EVENT_TICKET_SALES(state, isFetching: boolean) {
      state.isFetchingEventTicketSales = isFetching;
    },

    SET_EVENT_TICKET_SALES(state, eventTicketSales: EventTicketSales) {
      state.eventTicketSales = clone(eventTicketSales);
    },
    SET_IS_FETCHING_ZOOM_ATTENDANCE(state, isFetching: boolean) {
      state.isFetchingZoomAttendance = isFetching;
    },
    SET_MESSAGE_LIST_IN_EVENT(state, messageList: MessageList) {
      state.messageListInEvent = clone(messageList);
    },
    SET_MESSAGE_LIST_IN_ADVANCED_SETTINGS(state, messageList: any) {
      state.scratchAdvancedSettings = patchMessageListInAdvancedSettings(
        state.scratchAdvancedSettings,
        messageList,
      );
    },
    SET_TAGS_IN_ADVANCED_SETTINGS(state, tags: []) {
      state.scratchAdvancedSettings = patchTagsInAdvancedSettings(
        state.scratchAdvancedSettings,
        tags,
      );
    },
    PATCH_SCRATCH_ADVANCED_SETTINGS_TO_EVENT(state) {
      state.scratchEvent = patchScratchAdvancedSettingsToEvent(
        state.scratchEvent,
        state.scratchAdvancedSettings
      )
    },


    // Event list
    SET_EVENTS_LIST_SEARCH(state, query: string) {
      state.eventsListSearch = query;
    },
    SET_EVENTS_LIST_TOTAL_COUNT(state, count: number) {
      state.eventsListTotalCount = count;
    },
    CONCAT_EVENTS_LIST(state, items: EventListType[]) {
      state.eventsList = clone(state.eventsList.concat(items));
    },
    SET_IS_FETCHING_EVENTS_LIST(state, isFetching: boolean) {
      state.isFetchingEventsList = isFetching;
    },
    SET_IS_LAST_EVENT_LIST_LOADED(state, isLastEventLoaded: boolean) {
      state.isLastEventListLoaded = isLastEventLoaded;
    },
    SET_EVENTS_LIST_LOADED(state, eventsLoaded: number) {
      state.eventsListLoaded = eventsLoaded;
    },
    RESET_EVENTS_LIST(state) {
      state.eventsList = [];
      state.isLastEventListLoaded = false;
      state.eventsListTotalCount = 0;
      state.eventsListLoaded = 0;
    },
    SELECT_EVENT_LIST(state, {oid, value}: {oid: number, value: boolean}) {
      if (value) {
        state.selectedEventsList.push(state.eventsList.find(e => e.oid === oid))
      } else {
        state.selectedEventsList = state.selectedEventsList.filter(e => e.oid !== oid)
      }
    },
    SET_SELECTED_EVENTS_LIST(state, events: EventListType[]) {
      state.selectedEventsList = events;
    },
    CLEAR_SELECTED_EVENTS_LIST(state) {
      state.selectedEventsList = []
    },
    RESET_ALL_EVENTS_LIST(state) {
      state.isFetchingEventsList = false
      state.eventsListSearch = ''
      state.eventsListTotalCount = 0
      state.eventsListLoaded = 0
      state.isLastEventListLoaded = false
      state.selectedEventsList = []
      state.eventsList = []
      state.unsavedEventsList = []
    },
    SET_UNSAVED_EVENTS_LIST(state, events: EventListType[]) {
      state.unsavedEventsList = events
    },
    SELECT_UNSAVED_EVENT_LIST(state, {oid, value}: {oid: number, value: boolean}) {
      if (value) {
        state.unsavedEventsList.push(state.eventsList.find(e => e.oid === oid))
      } else {
        state.unsavedEventsList = state.unsavedEventsList.filter(e => e.oid !== oid)
      }
    }
  },
  getters: {
    getTimescaleData(state): EventTicketSalesChartData {
      let data = deepmerge(state.initialTimescaleData, state.compareTimescaleData, {
        arrayMerge: (destination, source) => {
          return [...destination, ...source]
        }
      })
      return data
    },
    currentEventTimezone(state): string {
      return state.currentEvent?.timeZone!
    },
    rawSalesChartData(state): EventTicketSalesChartRawData {
      return state.rawSalesChartData!
    },
    getSalesChartTimezone(state): string {
      return state.salesChartTimezone!
    },
    getEventAnnotations(state): EventAnnotation[] {
      return state.eventAnnotations
    },
    defaultEventStartTime(): string {
      return generateDefaultEventStartTime();
    },
    salesChartDataIsLoading(state): boolean {
      return state.salesChartDataIsLoading
    },
    salesChartData(state, getters): EventTicketSalesChartData {
      let chartData = deepmerge(state.initialSalesData, state.compareSalesData, {
        arrayMerge: (destination, source) => {
          return [ ...destination, ...source ]
        }
      })

      return chartData
    },
    currentEventHasProvider(state): boolean {
      if (!state.currentEvent) {
        return false;
      }
      return !!state.currentEvent.provider;
    },
    scratchEventIsZoomEvent(state): boolean {
      if (!state.scratchEvent) {
        return false;
      }
      return state.scratchEvent.provider === 'zoom';
    },
    scratchEventIsPhysicalEvent(state): boolean {
      if (!state.scratchEvent) {
        return false;
      }
      return !!state.scratchEvent.location;
    },
    zoomUrlFromCurrentEvent(state) {
      if (!state.currentEvent) {
        return null;
      }
      return getZoomUrlFromCurrentEvent(state.currentEvent);
    },
    getEventImageUrl(): (event: AREvent) => string | null {
      return (event: AREvent) => {
        return getEventImageUrl(event);
      };
    },
    scratchEventImageUrl(state): string | null {
      if (!state.scratchEvent) {
        return null;
      }
      return getEventImageUrl(state.scratchEvent);
    },
    getEventTotalTicketSales() {
      return (event: AREvent): number => {
        if (!event) {
          return 0;
        }
        return getEventTotalTicketSales(event);
      };
    },
    getEventTotalTicketSold() {
      return (event: AREvent): number => {
        if (!event) {
          return 0;
        }
        return getEventTotalTicketSold(event);
      };
    },
    getEventAttendees() {
      return (event: AREvent): number => {
        if (!event) {
          return 0;
        }
        return getEventAttendees(event);
      };
    },
    currentEventEventbriteUrl(state): string | null {
      if (!state.currentEvent) {
        return null;
      }
      return getEventbriteUrl(state.currentEvent);
    },
    // Check if the current event has "NO" RSVP Event
    currentEventHasNoRsvpEvent(state): boolean {
      if (!state.currentEvent) { return false; };
      const hasRsvpEvent = !!state.currentEvent.campaigns.find(campaign => campaign.type === 'rsvp');
      return !hasRsvpEvent;
    },
    eventHasIntegration() {
      return (event: AREvent, provider: string): boolean => {
        if (!event) { return false; }
        return checkHasIntegration(event, provider);
      };
    },
    getFilterMap(_, __, rootState: any): any {
      let eventsDateFilterMap = rootState.segment.segmentCriteriaMap?.loyaltyStartDate?.data.predicates.slice(0, 4) || []
      return {
        constraints: [],
        data: {
          predicates: eventsDateFilterMap,
        },
        type: 'date',
      }
    },
    getSelectedEventListIdsObject: (state) => {
      return state.selectedEventsList.reduce((accumulator: any, currentValue: EventListType) => {
        accumulator[currentValue.oid] = true

        return accumulator
      }, {})
    },
  },
};

export default eventModule;

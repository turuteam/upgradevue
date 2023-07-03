import { ActionTree } from 'vuex';
import { RootState } from '@/store/modules/types';
import { sanitizeHtmlChild } from '@/utils/html-element/';
import { AREvent, EventState, ScratchEvent, getAnnotationFromAPIResponse, CreatedEventAnnotation } from './types';
import {
  pruneScratchEventForServer, getSalesChartContexts, getEventNormalCampaignsCount,
  getTimescaleData, getTimescaleRawDataFromSales, defaultSalesChartContexts,
  defaultSalesTimescaleContexts, setInitialSalesChartData, optimiseData, runPromises
} from './utils';
import dayjs from "dayjs";

const defaultSelectString = 'name,description,campaigns,meta,capacity,location,startDate,endDate,timeZone,tourOid,presentation,resources,ticket-stats,paymentInfo,provider'

export const eventActions: ActionTree<EventState, RootState> = {
  async UPDATE_SALES_CHART_TIMEZONE({ dispatch, commit }, { timezone, timescaleActive }): Promise<void> {
    commit('SET_EVENT_SALES_CHART_TIMEZONE', timezone)
    dispatch('UPDATE_CURRENT_EVENT_CHART_DATA_TIMEZONE', timezone)
    dispatch('UPDATE_TIMESCALE_DATA_TIMEZONE', timezone)
    dispatch('UPDATE_OVERLAY_CHART_DATA_TIMEZONE', timezone)
  },

  async UPDATE_OVERLAY_CHART_DATA_TIMEZONE({ state, dispatch, commit }, timezone): Promise<void> {
    let overlayData = state.rawSalesOverlayData!
    if (!overlayData) return

    let compareData = defaultSalesChartContexts()

    let i = overlayData!.length
    while (i--) {
      let chartData = getSalesChartContexts(overlayData[i].data, timezone)

      compareData.sales.accumulative = [...compareData.sales.accumulative, { oid: overlayData[i].data.oid, name: overlayData[i].name, data: chartData.totalSales.sales }]
      compareData.sales.incremental = [...compareData.sales.incremental, { oid: overlayData[i].data.oid, name: overlayData[i].name, data: chartData.incrementalSales.sales }]
      compareData.quantity.accumulative = [...compareData.quantity.accumulative, { oid: overlayData[i].data.oid, name: overlayData[i].name, data: chartData.totalSales.quantity }]
      compareData.quantity.incremental = [...compareData.quantity.incremental, { oid: overlayData[i].data.oid, name: overlayData[i].name, data: chartData.incrementalSales.quantity }]
    }

    dispatch('ADD_TICKET_SALES_SERIES', [compareData])
  },

  async UPDATE_TIMESCALE_DATA_TIMEZONE({ state, commit }, timezone): Promise<void> {
    if (!state.eventTicketSales) {
      return;
    }

    let updatedTimescaleData = await getTimescaleData(getTimescaleRawDataFromSales(state.eventTicketSales!), timezone)

    commit('UPDATE_TIMESCALE_DATA_TIMEZONE', updatedTimescaleData)
  },

  async UPDATE_CURRENT_EVENT_CHART_DATA_TIMEZONE({ state, dispatch, commit }, timezone): Promise<void> {

    // adjust and update default sales chart data
    let oid = state.currentEvent!.oid
    let updatedTimezoneData = getSalesChartContexts(state.rawSalesChartData!, timezone)

    let updatedData = {
      sales: {
        accumulative: [{
          oid: oid,
          name: 'Sales',
          data: updatedTimezoneData.totalSales.sales
        }],
        incremental: [{
          oid: oid,
          name: 'Sales',
          data: updatedTimezoneData.incrementalSales.sales
        }]
      },
      quantity: {
        accumulative: [{
          oid: oid,
          name: 'Sales',
          data: updatedTimezoneData.totalSales.quantity
        }],
        incremental: [{
          oid: oid,
          name: 'Sales',
          data: updatedTimezoneData.incrementalSales.quantity
        }]
      }
    }

    commit('UPDATE_CURRENT_EVENT_CHART_DATA_TIMEZONE', updatedData)
  },

  async UPDATE_ANNOTATION({ state, commit, rootState }, annotation): Promise<void> {

    let { promoterOid } = rootState.auth.account!
    let { oid: eventOid } = state.currentEvent!

    let payload = {
      oid: annotation.oid,
      body: annotation.body,
    }

    try {
      await this.$api.eventAnnotations.update(promoterOid, eventOid, payload)

      commit('UPDATE_ANNOTATION', payload)
    } catch (error) {
      throw error
    }
  },

  async DELETE_ANNOTATION({ state, commit, rootState }, annotationOid): Promise<void> {
    let { promoterOid } = rootState.auth.account!
    let { oid: eventOid } = state.currentEvent!

    try {
      await this.$api.eventAnnotations.delete(promoterOid, eventOid, annotationOid)
      commit('DELETE_ANNOTATION', annotationOid)
    } catch (error) {
      throw error
    }
  },

  CLEAR_ANNOTATIONS({ commit }) {
    commit('CLEAR_ANNOTATIONS')
  },

  async FETCH_ANNOTATIONS({ state, commit, rootState }): Promise<void> {
    let { promoterOid } = rootState.auth.account!
    let { oid } = state.currentEvent!

    try {
      let data = await this.$api.eventAnnotations.get(promoterOid, oid)
      let annotations = []
      let i = data.length
      while (i--) {
        annotations.push(getAnnotationFromAPIResponse(data[i]))
      }

      commit('SET_INITIAL_ANNOTATIONS', annotations)
    } catch (error) {
      throw error
    }
  },

  async CREATE_ANNOTATION({ state, commit, rootState }, annotation): Promise<CreatedEventAnnotation> {
    let { promoterOid } = rootState.auth.account!
    let { oid } = state.currentEvent!

    let annotationPayload = {
      eventOid: oid,
      promoterOid: promoterOid,
      userDefined: true,
      type: 'custom',
      body: annotation.body,
      timestamp: annotation.timestamp,
    }

    try {
      let data = await this.$api.eventAnnotations.create(promoterOid, oid, annotationPayload)
      let anno = getAnnotationFromAPIResponse(data)

      commit('ADD_ANNOTATION_TO_EVENT', anno)

      return anno
    } catch (error) {
      throw error
    }
  },

  async FETCH_COMPARE_EVENT_TICKET_SALES_DATA({ rootState },
    {
      oid = 0,
      name = "",
      eventOid = 0,
      searchString = '',
      top = 50,
      orderBy = { key: 'sysMtime', order: 'desc' },
      filter = null,
      selectKeys = null,
      reload = false,
    }) {
    if (!rootState.auth.account) { return null }
    let { promoterOid } = rootState.auth.account

    try {
      let params: any = {}

      if (filter && filter.conditions.length > 0) {
        params.$audienceFilter = filter;
      }

      const data = await this.$api.event.getTicketSales(promoterOid, oid, params);

      return {
        name: name,
        data: data,
      }

    } catch (error) {
      console.error(error)

      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch event ticket sales',
      })

      return null
    }
  },

  SET_SALES_CHART_DATA_LOADING({ commit }, bool) {
    commit('SALES_CHART_DATA_IS_LOADING', bool)
  },


  async SET_OVERLAY_DATA({ state, dispatch, commit }, payload) {
    let data = payload.data
    let overlayObjects: any = {}
    let promiseObject: any = {}

    let i = data.length
    while (i--) {
      // add oid and name to return object while sending data to be optimised
      overlayObjects[data[i].name] = { oid: data[i].oid, name: data[i].name }
      promiseObject[data[i].name] = optimiseData(data[i].data)
    }

    let chartData = await runPromises(promiseObject)
    Object.entries(chartData).forEach(([key, val]) => {
      // add optimised data to return object, where event oid and name already exist
      overlayObjects[key].data = Object.freeze(val)
    })

    let optimisedData = Object.values(overlayObjects)

    commit('SET_RAW_SALES_OVERLAY_DATA', optimisedData)

    let compareData = defaultSalesChartContexts()
    let compareTimescaleArray = defaultSalesTimescaleContexts()
    let currentSalesChartTimezone = state.salesChartTimezone!

    let overlaySalesQuantityWorker = this.$arWorker.createOverlaySalesQuantityWorker()
    let overlayTimescaleDataWorker = this.$arWorker.createOverlayTimescaleDataWorker()

    // listen for response and process data as normal
    overlaySalesQuantityWorker.addEventListener('message', (event: any) => {
      dispatch('ADD_TICKET_SALES_SERIES', [event.data])
    })

    // listen for response and process data as normal
    overlayTimescaleDataWorker.addEventListener('message', (event: any) => {
      commit('ADD_OVERLAY_TIMESCALE_DATA', event.data)
    })

    // here we call out worker functions, passing in the arguments needed to run
    overlaySalesQuantityWorker.postMessage({ data: optimisedData, timezone: currentSalesChartTimezone, contexts: compareData })
    overlayTimescaleDataWorker.postMessage({ data: data, timezone: currentSalesChartTimezone, contexts: compareTimescaleArray })
  },

  CLEAR_SALES_DATA({ commit }) {
    commit('CLEAR_SALES_DATA')
  },

  CLEAR_COMPARE_TIMESCALE_DATA({ commit }) {
    commit('CLEAR_COMPARE_TIMESCALE_DATA')
  },

  async SET_INITIAL_TIMESCALE_DATA({ state, commit }, data) {
    if (!data) {
      return;
    }

    let currentSalesChartTimezone = state.salesChartTimezone!

    let intialTimescaleData = await getTimescaleData(getTimescaleRawDataFromSales(data), currentSalesChartTimezone)

    commit('SET_INITIAL_TIMESCALE_DATA', intialTimescaleData)
  },

  SET_DRAG_LISTENER_STATE({ commit }, payload) {
    commit('SET_DRAG_LISTENER_STATE', payload)
  },

  async SET_INITIAL_TICKET_SALES_CHART_DATA({ state, commit }, data) {
    let chartData = await optimiseData(data)
    let currentEventTimeZone = state.currentEvent!.timeZone
    let oid = state.currentEvent!.oid

    commit('SET_RAW_SALES_CHART_DATA', data)
    let worker = this.$arWorker.createInitialEventSalesDataWorker()

    worker.addEventListener('message', (event: any) => {
      let initialData = setInitialSalesChartData(oid, event.data)
      commit('SET_INITIAL_TICKET_SALES_CHART_DATA', initialData)
    })

    worker.postMessage({ chartData, currentEventTimeZone })
  },

  ADD_TICKET_SALES_SERIES({ commit }, payload) {
    let i = payload.length
    while (i--) {
      commit('ADD_TICKET_SALES_SERIES', payload[i])
    }
  },

  async FETCH_EVENT_COUNT(
    { state, commit, rootState },
    {
      searchString = '',
      filter = null,
      dateRange = null,
      provider= 'all'
    }
  ) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    commit('SET_TOTAL_EVENTS_COUNT', 0);
    const filters = ['userDefined'];
    if (searchString) {
      filters.push(`name ILIKE "%${searchString}%"`);
    }
    if (filter === 'eventbrite') {
      filters.push('provider=eventbrite');
    }
    filters.push(`promoterOid=${promoterOid}`)
    if (provider && provider !== 'all') {
      filters.push(`provider=${provider}`)
    }
    const filterString = filters.join(' AND ') || null;


    let filterDate;
    if (dateRange) {
      switch (dateRange.condition) {
        case 'is_equal_to':

          // eslint-disable-next-line no-case-declarations
          let startOfDay = dayjs(dateRange.values[0]).utc(true).subtract(12, 'hours').format('YYYY-MM-DDTHH:mm:ss')
          // eslint-disable-next-line no-case-declarations
          let endOfDay = dayjs(dateRange.values[0]).utc(true).endOf('day').format('YYYY-MM-DDTHH:mm:ss')
          filters.push(`startDate > '${startOfDay}' AND startDate < '${endOfDay}'`)

          break
        case 'is_after':
          filterDate = dayjs(dateRange.values[0]).utc(true).subtract(12, 'hours').format('YYYY-MM-DD')
          filters.push(`startDate > '${filterDate}'`)

          break
        case 'is_before':
          filterDate = dayjs(dateRange.values[0]).utc(true).format('YYYY-MM-DD')
          filters.push(`startDate < '${filterDate}'`)

          break
        case 'is_between':
          // eslint-disable-next-line no-case-declarations
          let filterStart = dayjs(dateRange.values[0]).utc(true).format('YYYY-MM-DD')
          // eslint-disable-next-line no-case-declarations
          let filterEnd = dayjs(dateRange.values[1]).utc(true).format('YYYY-MM-DD')
          filters.push(`startDate > '${filterStart}'`)
          filters.push(`startDate < '${filterEnd}'`)

          break
        default:
          console.log('An unrecognised date range condition was received: ', dateRange)
      }
    }

    try {
      const data = await this.$api.event.fetchCount(promoterOid, {filter: filterString});
      const eventsCount: number = !!data ? data.count : 0;
      commit('SET_TOTAL_EVENTS_COUNT', eventsCount)
    } catch(e) {
      console.error("Failed to fetch total events count!")
      console.error(e)
      commit('SET_TOTAL_EVENTS_COUNT', 0)
    }
  },

  async FETCH_MORE_EVENTS(
    { state, commit, rootState },
    {
      orderBy = null,
      top = 12,
      searchString = '',
      filter = null,
      reload = false,
      fetchCount = false,
      dateRange = null,
      provider= 'all'
    }
  ) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    if (reload) {
      commit('RESET_EVENTS');
    }

    const filters = ['userDefined'];
    if (searchString) {
      filters.push(`name ILIKE "%${searchString}%"`);
    }
    if (filter === 'eventbrite') {
      filters.push('provider=eventbrite');
    }
    filters.push(`promoterOid=${promoterOid}`)
    if (provider && provider !== 'all') {
      filters.push(`provider=${provider}`)
    }


    let filterDate;
    if (dateRange) {
      switch (dateRange.condition) {
        case 'is_equal_to':

          // eslint-disable-next-line no-case-declarations
          let startOfDay = dayjs(dateRange.values[0]).utc(true).subtract(12, 'hours').format('YYYY-MM-DDTHH:mm:ss')
          // eslint-disable-next-line no-case-declarations
          let endOfDay = dayjs(dateRange.values[0]).utc(true).endOf('day').format('YYYY-MM-DDTHH:mm:ss')
          filters.push(`startDate > '${startOfDay}' AND startDate < '${endOfDay}'`)

          break
        case 'is_after':
          filterDate = dayjs(dateRange.values[0]).utc(true).subtract(12, 'hours').format('YYYY-MM-DD')
          filters.push(`startDate > '${filterDate}'`)

          break
        case 'is_before':
          filterDate = dayjs(dateRange.values[0]).utc(true).format('YYYY-MM-DD')
          filters.push(`startDate < '${filterDate}'`)

          break
        case 'is_between':
          // eslint-disable-next-line no-case-declarations
          let filterStart = dayjs(dateRange.values[0]).utc(true).format('YYYY-MM-DD')
          // eslint-disable-next-line no-case-declarations
          let filterEnd = dayjs(dateRange.values[1]).utc(true).format('YYYY-MM-DD')
          filters.push(`startDate > '${filterStart}'`)
          filters.push(`startDate < '${filterEnd}'`)

          break
        default:
          console.log('An unrecognised date range condition was received: ', dateRange)
      }
    }

    const filterString = filters.join(' AND ') || null;

    let orderby;
    switch (orderBy) {
      case 'datecreated': orderby = 'sysCtime desc'; break;
      case 'eventstartdateasc': orderby = 'startDate asc'; break;
      case 'eventstartdatedesc': orderby = 'startDate desc'; break;
      case 'alphabetically': orderby = 'name asc'; break;
      default:
        orderby = orderBy || `oid desc`;
    }

    try {
      commit('SET_IS_FETCHING_EVENTS', true);
      const { data } = await this.$axios.get(`/promoter/${promoterOid}/event`, {
        params: {
          $select: 'name,description,campaigns,meta,capacity,location,startDate,endDate,timeZone,tourOid,presentation,resources,ticket-stats,paymentInfo,additionalInfo,provider',
          $top: top,
          $skip: state.events.length,
          $count: fetchCount,
          $filter: filterString,
          $orderby: orderby,
        },
      });
      const events: AREvent[] = fetchCount ? data.rows : data;
      const eventsCount: number = fetchCount ? data.count : null;
      if (reload) {
        commit('SET_EVENTS', events);
      } else {
        commit('CONCAT_EVENTS', events);
      }
      if (events.length === 0) {
        commit('SET_HAS_NO_MORE_EVENTS', true);
      }
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch events',
      });
      return false;
    } finally {
      commit('SET_IS_FETCHING_EVENTS', false);
    }
  },
  async FETCH_CURRENT_EVENT({ rootState, commit }, eventOid: number) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_FETCHING_EVENT', true);
      const event = await this.$api.event.get(promoterOid, eventOid);

      commit('SET_CURRENT_EVENT', event);
      commit('SET_EVENT_SALES_CHART_TIMEZONE', event!.timeZone)

      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: `Failed to fetch event`,
      });
      return false;
    } finally {
      commit('SET_IS_FETCHING_EVENT', false);
    }
  },
  async CREATE_EVENT({ commit, rootState }, scratchEvent: ScratchEvent) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    const eventData = pruneScratchEventForServer(scratchEvent);

    try {
      commit('SET_IS_CREATING_EVENT', true);
      const { data } = await this.$axios.post(`/promoter/${promoterOid}/new-event`, eventData);

      this.$arNotification.push({
        type: 'success',
        message: 'Event created successfully',
      });
      return data;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to create event',
      });
      return null;
    } finally {
      commit('SET_IS_CREATING_EVENT', false);
    }
  },
  async UPDATE_EVENT({ rootState, commit }, scratchEvent: ScratchEvent) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    if (!scratchEvent.oid) { return null; }

    const eventData = pruneScratchEventForServer(scratchEvent);

    try {
      commit('SET_IS_UPDATING_EVENT', true);
      await this.$api.event.patch(promoterOid, scratchEvent.oid, eventData);

      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to update event',
      });
      return false;
    } finally {
      commit('SET_IS_UPDATING_EVENT', false);
    }
  },
  async CONNECT_TO_ZOOM({ rootState }, { eventOid, integrationOid, accountId }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      await this.$api.event.connectToZoom(promoterOid, eventOid, integrationOid, accountId);
    } catch (error) {
      console.error(error);
    }
  },
  async CLONE_EVENT({ rootState }, event: AREvent) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    try {
      const newEvent: AREvent = await this.$api.event.clone(promoterOid, event.oid);

      this.$arNotification.push({
        type: 'success',
        message: `Event "${event.name}" successfully duplicated`,
      });
      return newEvent.oid;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: `Failed to duplicate event "${event.name}"`,
      });
      return null;
    }
  },
  async DELETE_EVENT({ rootState, dispatch }, event: AREvent) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    const eventNormalCampaignsCount = getEventNormalCampaignsCount(event);

    // We have to promot to ask users if they want to delete this event or not
    let agreed = false;
    if (eventNormalCampaignsCount === 0) {
      agreed = await dispatch('SHOW_CONFIRM', {
        messageHtml: `Are you sure you want to delete the event<br /><b>${sanitizeHtmlChild(event.name)}</b>?`,
        hideConfirmButton: false,
      }, { root: true });
    } else {
      let confirmationCopy;
      if (eventNormalCampaignsCount === 1) {
        confirmationCopy = `There is <b>${eventNormalCampaignsCount} campaign</b> associated with this event. You must delete the campaign before you can delete this event.`
      } else {
        confirmationCopy = `There are <b>${eventNormalCampaignsCount} campaigns</b> associated with this event. You must delete these campaigns before you can delete this event.`
      }
      agreed = await dispatch('SHOW_CONFIRM', {
        messageHtml: confirmationCopy,
        hideConfirmButton: true,
      }, { root: true });
    }
    if (!agreed) { return null; }

    try {
      await this.$axios.delete(`/promoter/${promoterOid}/event/${event.oid}`);

      this.$arNotification.push({
        type: 'success',
        message: `Event "${event.name}" deleted`,
      });
      return event.oid;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: `Failed to delete event "${event.name}"`,
      });
      return null;
    }
  },
  async MERGE_EVENTS(
    { rootState, commit },
    { sourceEvent, targetEvent },
  ) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_MERGING_EVENTS', true);
      const { status } = await this.$axios.post(`/promoter/${promoterOid}/event-merge`, {
        sourceEventOid: sourceEvent.oid,
        targetEventOid: targetEvent.oid,
      });
      let message = '';
      if (status === 202) {
        message = 'has started merging process. This may take some time.';
      } else {
        message = 'has now been merged';
      }

      this.$arNotification.push({
        type: 'success',
        message: `${sourceEvent.name} ${message}`,
      });
      return true;
    } catch (error: any) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: error.message || error,
      });
      return false;
    } finally {
      commit('SET_IS_MERGING_EVENTS', false);
    }
  },
  async FETCH_EVENT_TICKET_STATS({ rootState, commit },
    {
      eventOid = 0,
      searchString = '',
      top = 50,
      orderBy = { key: 'sysMtime', order: 'desc' },
      filter = null,
      selectKeys = null,
      reload = false,
    }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_FETCHING_EVENT_TICKET_STATS', true);

      const params: any = {}

      if (filter && filter.conditions.length > 0) {
        params.$audienceFilter = filter;
      }

      const data = await this.$api.event.getTicketStats(promoterOid, eventOid, params);

      commit('SET_EVENT_TICKET_STATS', data);
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch event ticket stats',
      });
      return false;
    } finally {
      commit('SET_IS_FETCHING_EVENT_TICKET_STATS', false);
    }
  },
  async FETCH_EVENT_TICKET_SALES({ state, commit, rootState }, {
    eventOid = null,
    filter = null,
  }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;



    try {
      commit('SET_IS_FETCHING_EVENT_TICKET_SALES', true);
      const params: any = {}


      if (filter && filter.conditions.length > 0) {
        params.$audienceFilter = filter;
      }

      const data = await this.$api.event.getTicketSales(promoterOid, eventOid, params);

      commit('SET_EVENT_TICKET_SALES', data);
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch event ticket sales',
      });
      return false;
    } finally {
      commit('SET_IS_FETCHING_EVENT_TICKET_SALES', false);
    }
  },

  async DELETE_POS_ORDERS({ state, commit, rootState }, event: AREvent) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account

    try {
      await this.$api.event.deleteEventPosOrders(promoterOid, event.oid);
      this.$arNotification.push({
        type: 'success',
        message: 'POS orders cleared',
      });
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to delete POS orders',
      });
      return false;
    }
  },

  // Event List
  async FETCH_EVENTS_LIST(
    { state, rootState, commit },
    { orderBy = null, selectString = defaultSelectString, provider = null}): Promise<void> {

    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    if (!promoterOid) return;

    if (state.isFetchingEventsList || state.isLastEventListLoaded) return;

    commit('SET_IS_FETCHING_EVENTS_LIST', true);

    const skip = state.eventsListLoaded || 0;
    const top = state.eventsListStepLoadCount

    let url = `/promoter/${promoterOid}/event?$select=${selectString}&$top=${top}&$skip=${skip}&$count=true`;

    const filterCriteria = ['userDefined'];

    if (state.eventsListSearch) {
      const searchBy = ['name', 'location'];

      const filterBy = searchBy.map((s) =>
        encodeURIComponent(`${s} ILIKE "%${state.eventsListSearch}%"`)
      );

      filterCriteria.push(`(${filterBy.join(' OR ')})`);
    }

    if (provider && provider !== 'all') {
      filterCriteria.push(`provider=${provider}`)
    }

    if (filterCriteria.length > 0) {
      url += `&$filter=${filterCriteria.join(' AND ')}`;
    }

    switch (orderBy) {
      case 'datecreated': url += '&$orderby=sysCtime desc'; break;
      case 'eventstartdateasc': url += '&$orderby=startDate asc'; break;
      case 'eventstartdatedesc': url += '&$orderby=startDate desc'; break;
      case 'alphabetically': url += '&$orderby=name asc'; break;
      default: url += `&$orderby=oid desc`
    }

    try {
      const {data: { rows, count }} = await this.$axios.get(url);

      commit('CONCAT_EVENTS_LIST', rows);
      if (count) commit('SET_EVENTS_LIST_TOTAL_COUNT', count);

      if (state.eventsListLoaded + state.eventsListStepLoadCount >= state.eventsListTotalCount) {
        commit('SET_IS_LAST_EVENT_LIST_LOADED', true)
      }
      commit('SET_EVENTS_LIST_LOADED', state.eventsListLoaded + state.eventsListStepLoadCount);
    } catch (error) {
      this.$arNotification.push({ type: 'error', message: 'There was an error fetching the events' });
    } finally {
      commit('SET_IS_FETCHING_EVENTS_LIST', false)
    }
  },
};

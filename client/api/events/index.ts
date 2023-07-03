import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { AREvent, EventForServer } from '@/store/modules/event/types';
import { isErrorStatus } from '../utils';
import { CustomApiError } from '../types';

export default (axios: NuxtAxiosInstance) => ({
  /**
   * Get the Event of the event with the given eventOid
   * @param promoterOid
   * @param eventOid
   * @returns
   */
  async get(promoterOid: number, eventOid: number): Promise<AREvent> {
    const { data, status } = await axios.get(`/promoter/${promoterOid}/event/${eventOid}`, {
      params: {
        $select: 'name,description,campaigns,meta,capacity,location,startDate,endDate,timeZone,tourOid,presentation,resources,lastImport,ticket-stats,paymentInfo,provider',
      },
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Get Event error',
        message: `Error getting Event from event with oid of ${eventOid}`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  async search(
    promoterOid: number,
    {
      top = 10,
      skip = 0,
      searchString = null,
      orderby = 'oid desc',
      select = 'name,description,campaigns,meta,capacity,location,startDate,endDate,timeZone,tourOid,presentation,resources,ticket-stats,paymentInfo,provider',
      filter = null
    }: { top: number, skip: number, searchString?: string | null, select?: string, orderby?: string | null, filter?: string | null },
  ): Promise<AREvent[]> {
    const filters = [
      'userDefined',
    ];
    if (searchString) {
      filters.push(`name ILIKE "%${searchString}%"`);
    }
    if (filter) {
      filters.push(filter);
    }
    const { data, status }: { data: AREvent[], status: number } = await axios.get(`/promoter/${promoterOid}/event`, {
      params: {
        $select: select,
        $top: top,
        $skip: skip,
        $orderby: orderby,
        $filter: filters.join(' AND '),
      },
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch All Events error',
        message: `Error fetching all Events`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  async fetchByOids(
    promoterOid: number,
    oids: number[],
    select: string,
  ): Promise<AREvent[]> {
    if (oids.length === 0) {
      return [];
    }
    const { data, status }: { data: AREvent[], status: number } = await axios.get(`/promoter/${promoterOid}/event`, {
      params: {
        $select: select,
        $filter: oids.map(oid => `oid = ${oid}`).join(' OR '),
      },
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch events with oids error',
        message: `Error fetching events with oids`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  async patch(promoterOid: number, eventOid: number, event: EventForServer): Promise<void> {
    const { status } = await axios.patch(`/promoter/${promoterOid}/event/${eventOid}`, event);
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Patch Event error',
        message: `Error patching Event with oid of ${eventOid}`,
        status,
      };
      throw apiError;
    }
  },
  async clone(promoterOid: number, eventOid: number): Promise<AREvent> {
    const { status, data } = await axios.post(`/promoter/${promoterOid}/event/${eventOid}/clone`);
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Clone Event error',
        message: `Error cloning Event with oid of ${eventOid}`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  /**
   * Connect Event with Zoom
   * @param promoterOid
   * @param eventOid
   * @returns
   */
  async connectToZoom(promoterOid: number, eventOid: number, integrationOid: number, accountId: string): Promise<void> {
    const { status } = await axios.patch(`/promoter/${promoterOid}/event/${eventOid}`, {
      provider: 'zoom',
      meta: {
        integrationOid,
        accountId,
      },
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Connect Zoom error',
        message: `Error connecting Zoom to Event with oid of ${eventOid}`,
        status,
      };
      throw apiError;
    }
  },
  async getTicketStats(promoterOid: number, eventOid: number, params: object): Promise<EventTicketStats | null> {
    let { data, status } = await axios.get(
      `/promoter/${promoterOid}/event/${eventOid}/ticket-sales-stats-with-filtering/${eventOid}`, { params }
    )

    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Get Event error',
        message: `Error getting Ticket Stats from event with oid of ${eventOid}`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  async getTicketSales(promoterOid: number, eventOid: number, params: object): Promise<EventTicketStats | null> {
    let { data, status } = await axios.get(
      `/promoter/${promoterOid}/event/${eventOid}/ticket-sales-stats-time-series-with-filtering`, { params }
    )

    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Get Event error',
        message: `Error getting Ticket Stats from event with oid of ${eventOid}`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  async fetchCount(
    promoterOid: number,
    {
      filter = null,
    }: {
      filter?: string | null;
    }): Promise<{ rows: AREvent[], count: number } | null> {

    const { status, data } = await axios.get(`/promoter/${promoterOid}/event`, {
      params: {
        $select: 'oid',
        $top: 0,
        $count: true,
        $filter: filter,
      }
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch Events error',
        message: `Error fetching Events`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  /**
   * Fetch Events
   */
  async fetchAll(
    promoterOid: number,
    {
      top = 20,
      skip = 0,
      orderby = 'sysCtime desc',
      filter = null,
      count = false
    }: {
      top?: number | null;
      skip?: number | null;
      orderby?: string | null;
      filter?: string | null;
      count?: boolean | null;
    }): Promise<{ rows: AREvent[], count: number } | null> {

    if (!top) top = 20;
    if (!skip) skip = 0;

    const { status, data } = await axios.get(`/promoter/${promoterOid}/event`, {
      params: {
        $select: 'name,description,campaigns,meta,capacity,location,startDate,endDate,timeZone,tourOid,presentation,resources,lastImport,ticket-stats,paymentInfo,provider',
        $top: top,
        $skip: skip,
        $count: count,
        $orderby: orderby,
        $filter: filter,
      }
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch Events error',
        message: `Error fetching Events`,
        status,
      };
      throw apiError;
    }
    return data;
  },

  async deleteEventPosOrders(promoterOid: number, eventOid: number): Promise<void> {
    const { status } = await axios.delete(`/promoter/${promoterOid}/event-pos-orders/${eventOid}`)

    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Delete POS Orders error',
        message: `Error deleting POS Orders for ${promoterOid} from event with oid of ${eventOid}`,
        status,
      };
      throw apiError;
    }
  }
});

import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { isErrorStatus } from '../utils';
import { CustomApiError } from '../types';

const MAX_INITIAL_TOP_VALUE = 500;

export default (axios: NuxtAxiosInstance) => ({
  /**
   * Get the Event Ticket Classes of the promoter with the given promoterOid
   * @param promoterOid
   * @returns
   */
  async get(promoterOid: number, { top = MAX_INITIAL_TOP_VALUE, filterString = null }): Promise<TicketClass[]> {
    let url = `/promoter/${promoterOid}/ticket-class?$count=true&top=${top}&$orderby=name%20asc`

    if (!!filterString) {
      url = `${url}&$filter=${encodeURIComponent(`name ILIKE "%${filterString}%"`)}`
    }

    const { data, status } = await axios.get(url);
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Get Ticket Classes error',
        message: `Error getting Ticket Classes from promoter with oid of ${promoterOid}`,
        status,
      };
      throw apiError;
    }
    return data.rows;
  },


  async fetchCount(
    promoterOid: number,
    {
      filter = null
    } : {
      filter?: string | null;
    }): Promise<{rows: [], count: number} | null> {

    const { status, data } = await axios.get(`/promoter/${promoterOid}/ticket-class`, {
      params : {
        $select: 'oid',
        $top: 0,
        $count: true,
        $filter: filter,
      }
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch Ticket Classes error',
        message: `Error fetching Ticket Classes`,
        status,
      };
      throw apiError;
    }
    return data;
  },
});

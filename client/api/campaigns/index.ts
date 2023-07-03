import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { Campaign, CampaignRegistrationStats } from '@/types/resources/campaign';
import { isErrorStatus } from '../utils';
import { CustomApiError } from '../types';

export const defaultSelectFields = [
  'name',
  'type',
  'notifyDate',
  'startDate',
  'endDate',
  'timeZone',
  'urlSlug',
  'eventOid',
  'event',
  'rewards',
  'summaryStatsSnapshot',
  'presentation',
  'resources',
  'registrations',
  'settings',
  'socialActions',
  'defaults',
  'subscriptionLevel',
].join(',');

export default (axios: NuxtAxiosInstance) => ({

  async get(promoterOid: number, campaignOid: number, params: any): Promise<Campaign> {
    const { data, status } = await axios.get(`/promoter/${promoterOid}/campaign/${campaignOid}`, {
      params: {
        $select: params,
      },
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Get Campaign error',
        message: `Error getting Campaign from event with oid of ${campaignOid}`,
        status,
      };
      throw apiError;
    }
    return data;
  },

  /**
   * Fetch Campaigns by Oids
   * @param promoterAccountOids
   * @returns
   */
  async fetchByOids(promoterOid: number, oids: number[]): Promise<Campaign[] | null> {
    if (oids.length === 0) {
      return [];
    }
    const { status, data } = await axios.get(`/promoter/${promoterOid}/campaign`, {
      params: {
        $select: defaultSelectFields,
        $top: 'all',
        $orderby: 'oid desc',
        $filter: `(oid=${oids.join(' OR oid=')}) AND type != "opt-in" AND type != "rsvp"`,
      },
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch Campaigns with oids error',
        message: `Error fetching Campaigns with oids ${oids.join(', ')}`,
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
      select = defaultSelectFields,
    }: { top: number, skip: number, searchString: string | null, select: string, orderby?: string  },
  ): Promise<Campaign[]> {
    let filterString = 'type != "opt-in" AND type != "rsvp"';
    if (searchString) {
      filterString = `${filterString} AND name ILIKE "%${searchString}%"`;
    }
    const { data, status }: { data: Campaign[], status: number } = await axios.get(`/promoter/${promoterOid}/campaign`, {
      params: {
        $select: select,
        $top: top,
        $skip: skip,
        $orderby: orderby,
        $filter: filterString,
      },
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch All Campaigns error',
        message: `Error fetching all Campaigns`,
        status,
      };
      throw apiError;
    }
    return data;
  },


  async fetchCampaignForAutomation(promoterOid: number, oid: number): Promise<any> {
    const { data, status } = await axios.get(`/promoter/${promoterOid}/campaign/${oid}`, {
      params: {
        $select: 'name',
      },
    })
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch Campaign for Automation error',
        message: `Error fetching Campaigns for Automation with promoterOid ${promoterOid},\n
                  and campaign oid ${oid}.`,
        status,
      };
      throw apiError;
    }

    return data
  },

  async fetchCampaignRegistrationStats(promoterOid: number, oid: number): Promise<CampaignRegistrationStats | null> {
    if(isNaN(oid)) {
      console.error('FETCH_CAMPAIGN_REGISTRATIONS called with NaN campaignOid');
      return null;
    }

    const { data } = await axios.get(
      `/promoter/${promoterOid}/campaign-registration-stats-realtime/${oid}`
    );

    return data;
  },

  async fetchCount(
    promoterOid: number,
    {
      filter = null
    } : {
      filter?: string | null;
    }): Promise<{rows: Campaign[], count: number}> {

    const filterString = filter ? `${filter} AND type != "opt-in" AND type != "rsvp"` : `type != "opt-in" AND type != "rsvp"`;

    const { status, data } = await axios.get(`/promoter/${promoterOid}/campaign`, {
      params : {
        $select: 'oid',
        $count: true,
        $top: 0,
        $filter: filterString
      }
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch Campaigns error',
        message: `Error fetching Campaigns`,
        status,
      };
      throw apiError;
    }
    return data;
  },

  /**
   * Fetch Campaigns
   */
  async fetchAll(
    promoterOid: number,
    {
      top = 20,
      skip = 0,
      orderby = 'sysCtime desc',
      filter = null
    } : {
      top?: number | string | null;
      skip?: number | null;
      orderby?: string | null;
      filter?: string | null;
    }): Promise<{rows: Campaign[], count: number}> {

    if (!top) top = 20;
    if (!skip) skip = 0;

    const filterString = filter ? `${filter} AND type != "opt-in" AND type != "rsvp"` : `type != "opt-in" AND type != "rsvp"`;

    const { status, data } = await axios.get(`/promoter/${promoterOid}/campaign`, {
      params : {
        $select: defaultSelectFields,
        $top: top,
        $skip: skip,
        $orderby: orderby,
        $filter: filterString
      }
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch Campaigns error',
        message: `Error fetching Campaigns`,
        status,
      };
      throw apiError;
    }
    return data;
  },

  // POST Campaign Custom Fields

  async setCustomFields(
    campaignOid: number,
    action: string,
    customFieldData: object
  ): Promise<Campaign> {
    const { data, status } = await axios.post(`/campaign/${campaignOid}/custom-field`, {
      customField: customFieldData,
      action,
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Set Campaign Custom Fields error',
        message: `Error doing ${action} for Custom Fields from campaign with oid of ${campaignOid}`,
        status,
      };
      throw apiError;
    }
    return data;
  },
});

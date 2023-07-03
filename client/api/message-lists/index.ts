import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { isErrorStatus } from '../utils';
import { CustomApiError } from '../types';
import { MessageList } from './types';
import { CancelTokenSource } from 'axios';

// Used to cancel Recipient Count requests if a new one is queued up before the previous one has finished.
// Helps us avoid situations in which slower previous requests overwrite the results of newer requests.
let fetchRecipientCountCancelToken: CancelTokenSource | null = null;
let fetchSmsCostCancelToken: CancelTokenSource | null = null;

export default (axios: NuxtAxiosInstance) => ({

  /**
   * Get the count of fans within the audience matching the filter segment
   * @param promoterOid
   * @param messageListOid
   * @param targetingFilter
   * @param channel
   * @returns
   */
  async fetchMessageListRecipientCount(
    promoterOid: number,
    messageListOid: number,
    targetingFilter: any | null,
    channel: 'email' | 'sms' | 'facebookMessenger' | null): Promise<number> {

    if (fetchRecipientCountCancelToken) {
      fetchRecipientCountCancelToken.cancel('Operation cancelled due to new request');
    }
    fetchRecipientCountCancelToken = axios.CancelToken.source();
    const newCancelTokenSource: CancelTokenSource = fetchRecipientCountCancelToken;

    const { data: { count }, status } = await axios.get(`/promoter/${promoterOid}/message-list/${messageListOid}/subscribers`, {
      cancelToken: newCancelTokenSource.token,
      params: {
        $top: 0,
        $skip: 0,
        $audienceFilter: targetingFilter?.conditions?.length > 0 ? targetingFilter : null,
        $channels: channel,
        $unique: channel === 'sms',
        $count: true,
      },
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch Message Recipient Count error',
        message: `Error fetching Message Recipient Count`,
        status,
      };
      throw apiError;
    }

    return count;
  },


  async fetchSmsMessagePreview(
    promoterOid: number,
    messageListOid: number,
    body: string | null,
    targetingFilter: any | null,
  ): Promise<SMSMessagePreview> {
    if (fetchSmsCostCancelToken) {
      fetchSmsCostCancelToken.cancel('Operation cancelled due to new request');
    }
    fetchSmsCostCancelToken = axios.CancelToken.source();
    const newCancelTokenSource: CancelTokenSource = fetchSmsCostCancelToken;

    const { data, status } = await axios.get(`/promoter/${promoterOid}/message-preview/`, {
      cancelToken: newCancelTokenSource.token,
      params: {
        $provider: 'sms',
        $body: body,
        $messageListOid: messageListOid,
        $cost: true,
        $audienceFilter: targetingFilter?.conditions?.length > 0 ? targetingFilter : null,
      },
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch SMS cost error',
        message: `Error fetching SMS cost`,
        status,
      };
      throw apiError;
    }

    return data;
  },


  /**
   * Fetch Auto Generated Campaign Message Lists
   * @param promoterOid
   * @param campaignOid
   * @returns
   */
  async fetchCampaignMessageLists(promoterOid: number, campaignOid: number): Promise<MessageList[]> {
    const { data, status } = await axios.get(`/promoter/${promoterOid}/message-list`, {
      params: {
        $orderby: 'oid desc',
        $filter: `name ILIKE "%_internal_campaign_${campaignOid}%" AND userDefined = false`,
      },
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Get Campaign Message Lists error',
        message: `Error getting Campaign Message Lists for campaign with oid of ${campaignOid}`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  /**
   * Fetch Auto Generated Event Message Lists
   * @param promoterOid
   * @param eventOid
   * @returns
   */
  async fetchEventMessageLists(promoterOid: number, eventOid: number): Promise<MessageList[]> {
    const { data, status } = await axios.get(`/promoter/${promoterOid}/message-list`, {
      params: {
        $orderby: 'oid desc',
        $filter: `name ILIKE "%_internal_event_${eventOid}%" AND userDefined = false`,
      },
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Get Event Message Lists error',
        message: `Error getting Event Message Lists for campaign with oid of ${eventOid}`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  /**
   * Fetch Message Lists
   * @param promoterOid
   * @returns
   */
  async fetchAll(
    promoterOid: number,
    {
      type = null,
      channels = null,
      searchString = null,
      top = 20,
      skip = 0,
      orderby = 'oid desc',
    }: {
      type: 'manual' | 'auto' | null;
      channels: ('email' | 'sms' | 'facebookMessenger')[] | null;
      searchString: string | null;
      top: number | 'all';
      skip: number;
      orderby: string;
    },
  ): Promise<MessageList[]> {
    const filters = ['userDefined = true'];
    if (channels) {
      let channelCond = channels.map(channel => `${channel} = true`).join(' OR ');
      channelCond = `(${channelCond})`;
      filters.push(channelCond);
    }
    if (type === 'auto') {
      filters.push(`filterGroupOid IS NOT NULL`);
    }
    if (type === 'manual') {
      filters.push(`filterGroupOid IS NULL`);
    }
    if (searchString) {
      filters.push(`name ILIKE "%${searchString}%"`);
    }
    const { data, status } = await axios.get(`/promoter/${promoterOid}/message-list`, {
      params: {
        $top: top,
        $skip: skip,
        $orderby: orderby,
        $filter: filters.join(' AND '),
      },
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch Message Lists error',
        message: `Error fetching Message Lists`,
        status,
      };
      throw apiError;
    }
    return data;
  },

  async fetchList(promoterOid: number, listOid: number): Promise<any> {
    if (isNaN(listOid)) {
      const apiError: CustomApiError = {
        name: 'fetchList error',
        message: `Attempting to fetch list with NaN listOid of ${listOid} for promoter ${promoterOid}.`,
        status: 400,
      }
      throw apiError
    }
    const { data, status } = await axios.get(`/promoter/${promoterOid}/message-list/${listOid}`)
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Automation - fetchList error',
        message: `Error fetching list with promoterOid of ${promoterOid}\n
                  and messageList Oid of ${listOid}`,
        status,
      }
      throw apiError
    }
    return data
  },

  async getMessageLists(promoterOid: number): Promise<any> {
    const { data, status } = await axios.get(`/promoter/${promoterOid}/message-list`, {
      params: {
        $top: 'all',
        $orderby: 'sysMtime desc',
        $filter: 'userDefined = true',
      }
    })
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Messaging - getMessageLists error',
        message: `Error fetching message lists with promoterOid of ${promoterOid}`,
        status,
      }
      throw apiError
    }
    return data
  },
  async fetchAuthorizedApiDomain(promoterOid: number, domain: string): Promise<any> {
    if (!promoterOid) {
      const apiError: CustomApiError = {
        name: 'createAuthorizedApiDomain error',
        message: `Attempting to fetch Authorized API Domain with empty or null promoterOid value.`,
        status: 400,
      }
      throw apiError
    }
    if (!domain || domain.length < 1) {
      const apiError: CustomApiError = {
        name: 'createAuthorizedApiDomain error',
        message: `Attempting to fetch Authorized API Domain with empty or null domain value for promoter ${promoterOid}.`,
        status: 400,
      }
      throw apiError
    }

    const { data, status } = await axios.get(`/promoter/${promoterOid}/authorize-external-domain`, {
      params : {
        $url: domain,
      }
    })

    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'createAuthorizedApiDomain - get error',
        message: `Error when fetching an authorized domain of value ${domain} for promoter ${promoterOid}`,
        status,
      }
      throw apiError
    }
    return data;
  },

  async createAuthorizedApiDomain(promoterOid: number, domain: string): Promise<any> {
    if (!promoterOid) {
      const apiError: CustomApiError = {
        name: 'createAuthorizedApiDomain error',
        message: `Attempting to create Authorized API Domain with empty or null promoterOid value.`,
        status: 400,
      }
      throw apiError
    }
    if (!domain || domain.length < 1) {
      const apiError: CustomApiError = {
        name: 'createAuthorizedApiDomain error',
        message: `Attempting to create Authorized API Domain with empty or null domain value for promoter ${promoterOid}.`,
        status: 400,
      }
      throw apiError
    }

    const { data, status } = await axios.post(`/promoter/${promoterOid}/authorize-external-domain`, {domain})
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'createAuthorizedApiDomain - post error',
        message: `Error when adding an authorized domain of value ${domain} for promoter ${promoterOid}`,
        status,
      }
      throw apiError
    }
    return data;
  }
});

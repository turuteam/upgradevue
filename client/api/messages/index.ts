import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { isErrorStatus } from '../utils';
import { CustomApiError } from '../types';
import { ExternalApiSetting } from './types';

export default (axios: NuxtAxiosInstance) => ({
  async get(promoterOid: number, messageOid: number): Promise<Message> {
    const { data, status } = await axios.get(`/promoter/${promoterOid}/task/${messageOid}`, {});
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Get Event error',
        message: `Error getting Event from event with oid of ${messageOid}`,
        status,
      };
      throw apiError;
    }
    return data;
  },

  async fetchSmsMessagePreviewWithoutStats(
    promoterOid: number,
    message: string | null,
  ): Promise<{ message: string, charactersLeft: number, optOutMessage: string }> {
    const { data, status }: { data: SMSMessagePreview, status: number } = await axios.get(`/promoter/${promoterOid}/message-preview/`, {
      params: {
        $provider: 'sms',
        $body: message || '',
        $cost: false,
      },
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch SMS message preview',
        message: `Error fetching SMS message preview`,
        status,
      };
      throw apiError;
    }

    return {
      message: data.body,
      charactersLeft: data.charactersLeft,
      optOutMessage: data.optOutMessage,
    };
  },
  /**
   * Fetch additional dynamic tags that are defined in "external-api-settings"
   * @param promoterOid
   * @returns
   */
  async fetchAdditionalDynamicTags(
    promoterOid: number,
  ): Promise<string[]> {
    const { data } = await axios.get(`/promoter/${promoterOid}/external-api-settings`);
    const externalApiSetting: ExternalApiSetting = data[0];
    if (!!externalApiSetting) {
      return externalApiSetting.defaultDynamicTags;
    } else {
      return [];
    }
  },
  async search(
    promoterOid: number,
    {
      top = 20,
      skip = 0,
      searchString = null,
      orderby = 'oid desc',
      select = null,
      messageStatus = null,
      provider = null,
    }: { top: number, skip: number,
         searchString: string | null,
         select: string | null,
         orderby?: string,
         messageStatus: string | null,
         provider: string | null  },
  ): Promise<Message[]> {
    const uri = `/promoter/${promoterOid}/fan-message-search`;
    const { data, status }: { data: Message[], status: number } = await axios.get(uri, {
      params: {
        $top: top,
        $skip: skip,
        $select: select || null,
        $search: searchString || null,
        $status: messageStatus || null,
        $provider: provider || null,
        orderby: orderby || null,
      }
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch Messages error',
        message: `Error fetching Messages`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  async fetchCount(
    promoterOid: number,
    {
      searchString = null,
      messageStatus = null,
      provider = null,
    }: {
      searchString: string | null,
      select: string | null,
      orderby?: string,
      messageStatus: string | null,
      provider: string | null
    },
  ): Promise<Message[]> {
    const uri = `/promoter/${promoterOid}/fan-message-search`;
    const { data, status }: { data: Message[], status: number } = await axios.get(uri, {
      params: {
        $top: 0,
        $count: true,
        $search: searchString || null,
        $status: messageStatus || null,
        $provider: provider || null,
      }
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch Messages error',
        message: `Error fetching Messages`,
        status,
      };
      throw apiError;
    }
    return data;
  },
});

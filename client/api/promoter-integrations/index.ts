import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { isErrorStatus } from '../utils';
import { CustomApiError } from '../types';
import { PromoterIntegration, SyncTask } from './types';

export default (axios: NuxtAxiosInstance) => ({
  /**
   * Fetch integrations
   */
  async fetchAll(promoterOid: number): Promise<PromoterIntegration[]> {
    const { data, status } = await axios.sg.get(`/promoter/${promoterOid}/integration`);
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch integrations error',
        message: `Error doing fetch integrations`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  /**
   * Fetch integrations by app + provider
   */
  async fetchByAppProvider(promoterOid: number, app: string, provider: string): Promise<PromoterIntegration[]> {
    const { data, status } = await axios.sg.get(`/promoter/${promoterOid}/integration`, {
      params: {
        $filter: `app=${app} and provider=${provider}`,
      },
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch integrations by app + provider error',
        message: `Error doing fetch integrations by app + provider`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  /**
   * Delete integration
   */
  async delete(promoterOid: number, oid: number): Promise<void> {
    const { status } = await axios.sg.delete(`/promoter/${promoterOid}/integration/${oid}`);
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Delete integrations error',
        message: `Error doing delete integration with oid ${oid}`,
        status,
      };
      throw apiError;
    }
  },
  /**
   * Start sync
   */
  async startSync(promoterOid: number, integrationOid: number): Promise<SyncTask | null> {
    const { data, status } = await axios.sg.post(`/promoter/${promoterOid}/integration/${integrationOid}/sync`);
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Start sync error',
        message: `Error doing start sync`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  /**
   * Stop sync
   */
  async stopSync(promoterOid: number, integrationOid: number): Promise<SyncTask | null> {
    const { data, status } = await axios.sg.post(`/promoter/${promoterOid}/integration/${integrationOid}/sync-stop`);
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Stop sync error',
        message: `Error doing stop sync`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  /**
   * Fetch sync task
   */
  async fetchSyncTask(promoterOid: number, integrationOid: number): Promise<SyncTask | null> {
    const { data, status } = await axios.sg.get(`/promoter/${promoterOid}/integration/${integrationOid}/task`, {
      params: {
        $orderby: 'sysMtime desc',
        $top: 1,
        $filter: `promoterIntegrationOid=${integrationOid}`,
      }
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch sync task error',
        message: `Error doing fetch sync task`,
        status,
      };
      throw apiError;
    }
    return data[0] || null;
  },
  /**
   * A manual way of creating Memberful integration
   * @returns SyncTask - Once auth is created, Sync task is kicked off and returned
   */
  async createMemberfulIntegration(siteName: string, apiKey: string): Promise<SyncTask> {
    const { data, status } = await axios.sg.post('/simple-auth', {
      provider: 'memberful',
      siteName,
      apiKey,
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Create Memberful Integration error',
        message: `Error creating Memberful integration`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  /**
   * A manual way of creating Ticketek integration
   * @returns SyncTask - Once auth is created, Sync task is kicked off and returned
   */
  async createTicketekIntegration(
    s3BucketName: string,
    s3BucketRegion: string,
    s3BucketAccessKey: string,
    s3BucketSecretKey: string,
    messageList: string,
    tagFans: boolean,
  ): Promise<SyncTask> {
    const { data, status } = await axios.sg.post('/simple-auth', {
      provider: 'ticketek',
      bucketName: s3BucketName,
      bucketRegion: s3BucketRegion,
      bucketAccessKey: s3BucketAccessKey,
      bucketSecretKey: s3BucketSecretKey,
      messageListOid: messageList,
      tagFans: tagFans,
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Create Ticketek Integration error',
        message: `Error creating Ticketek integration`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  /**
   * A direct way to integration 3rd-party services
   * @returns SyncTask - Once auth is created, Sync task is kicked off and returned
   */
  async simpleAuth(username: string, password: string): Promise<SyncTask> {
    const { data, status } = await axios.sg.post('/simple-auth', {
      username,
      password,
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Simple Auth error',
        message: `Error doing simple auth`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  /**
   * A direct way to integration of Event Genius
   * @returns SyncTask - Once auth is created, Sync task is kicked off and returned
   */
  async eventGeniusSimpleAuth(username: string, password: string): Promise<SyncTask> {
    const { data, status } = await axios.sg.post('/simple-auth', {
      provider: 'event-genius',
      username,
      password,
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Event Genius Simple Auth error',
        message: `Error doing Event Genius simple auth`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  /**
   * A direct way to integration of DICE
   * @returns SyncTask - Once auth is created, Sync task is kicked off and returned
   */
  async diceSimpleAuth(
    token: string,
    messageList: string,
    tagFans: object,
  ): Promise<SyncTask> {

    const params = {
      provider: 'dice',
      token,
      messageListOid: messageList,
    }

    const { data, status } = await axios.sg.post('/simple-auth', !!tagFans ? {
      ...params,
      tagFans: tagFans
    } : params);

    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'DICE Simple Auth error',
        message: `Error doing DICE simple auth`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  /**
   * A direct way to integration of Moshtix
   * @returns SyncTask - Once auth is created, Sync task is kicked off and returned
   */
  async moshtixSimpleAuth(username: string, password: string): Promise<SyncTask> {
    const { data, status } = await axios.sg.post('/simple-auth', {
      provider: 'moshtix',
      username,
      password,
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Moshtix Simple Auth error',
        message: `Error doing Moshtix simple auth`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  /**
   * A direct way to integration of Shopify
   * @returns SyncTask - Once auth is created, Sync task is kicked off and returned
   */
  async shopifySimpleAuth(shopPrefix: string, accessToken: string): Promise<SyncTask> {
    const { data, status } = await axios.sg.post('/simple-auth', {
      provider: 'shopify',
      shopPrefix: shopPrefix,
      accessToken: accessToken
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Shopify Simple Auth error',
        message: `Error doing Shopify simple auth`,
        status,
      };
      throw apiError;
    }
    return data;
  },

  async humanitixSimpleAuth(
    apiKey: string,
    accountName: string
  ): Promise<SyncTask> {

    const params = {
      provider: 'humanitix',
      apiKey,
      accountName
    }

    const { data, status } = await axios.sg.post('/simple-auth', params);

    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Humanitix Simple Auth error',
        message: `Error doing Humanitix simple auth`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  /**
   * A direct way to integration of try booking
   * @returns SyncTask - Once auth is created, Sync task is kicked off and returned
   */
  async tryBookingSimpleAuth(apiKey: string, secret: string): Promise<SyncTask> {
    const { data, status } = await axios.sg.post('/simple-auth', {
      provider: 'try-booking',
      apiKey: apiKey,
      secret: secret
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'TryBooking Simple Auth error',
        message: `Error doing try-booking simple auth`,
        status,
      };
      throw apiError;
    }
    return data;
  },
});

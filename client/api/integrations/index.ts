import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { isErrorStatus } from '../utils';
import { CustomApiError } from '../types';
import { Integration } from './types';

export default (axios: NuxtAxiosInstance) => ({

  /**
   * Fetch integrations
   */
  async fetchAll(): Promise<Integration[]> {
    const { data, status } = await axios.sg.get(`/integration`);
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch integrations error',
        message: `Error doing fetch integrations`,
        status,
      };
      throw apiError;
    }
    return data;
  }

});

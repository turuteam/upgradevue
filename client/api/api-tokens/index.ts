import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { isErrorStatus } from '../utils';
import { CustomApiError } from '../types';
import { ApiToken } from './types';

export default (axios: NuxtAxiosInstance) => ({

  async fetchAll(promoterOid: number): Promise<ApiToken[]> {
    const { data, status } = await axios.sg.get(`/promoter/${promoterOid}/api-token`);
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch api tokens error',
        message: `Error fetching api tokens`,
        status,
      };
      throw apiError;
    }
    return data;
  },

  async issue(promoterOid: number): Promise<ApiToken> {
    const { data, status } = await axios.sg.post(`/promoter/${promoterOid}/api-token`);
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Issue api tokens error',
        message: `Error issuing api tokens`,
        status,
      };
      throw apiError;
    }
    return data;
  },

  async revoke(promoterOid: number, apiTokenOid: number): Promise<Boolean> {
    const { status } = await axios.sg.delete(`/promoter/${promoterOid}/api-token/${apiTokenOid}`);
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Delete api tokens error',
        message: `Error deleting api tokens`,
        status,
      };
      throw apiError;
    }
    return (status === 204);
  }

});
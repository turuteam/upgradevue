import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { isErrorStatus } from '../utils';
import { CustomApiError } from '../types';
import { EmailSenderProperty } from './types';

export default (axios: NuxtAxiosInstance) => ({
  async get(
    promoterOid: number,
    oid: number,
  ): Promise<EmailSenderProperty> {
    const { data, status }: {
      data: EmailSenderProperty, status: number
    } = await axios.get(`promoter/${promoterOid}/property/${oid}`);
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch email sender error',
        message: `Error fetching email sender`,
        status,
      };
      throw apiError;
    }

    return data;
  },
});

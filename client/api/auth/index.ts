import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { clone } from '@/utils/helpers';
import { isErrorStatus } from '../utils';
import { CustomApiError } from '../types';
import { NewUser } from './types';

export default (axios: NuxtAxiosInstance) => ({
  async registerToWaveApp(user: NewUser): Promise<string> {
    const body = clone(user);
    body.waveRegistration = true;
    const { headers, status } = await axios.post('/signup', body);
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Register to Wave error',
        message: `Error registering Wave app.`,
        status,
      };
      throw apiError;
    }
    return headers['success-redirect-uri'];
  },
});

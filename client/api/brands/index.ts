import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { isErrorStatus } from '../utils';
import { CustomApiError } from '../types';
import { Brand, AdditionalInfo, SocialAction } from './types';

export default (axios: NuxtAxiosInstance) => ({
  /**
   * Fetch Brands
   * @param promoterOid
   * @returns
   */
  async fetchAll(promoterOid: number): Promise<Brand[]> {
    const { data, status } = await axios.get(`/promoter/${promoterOid}/social-accounts`, {
      params: {
        $top: 'all',
        $skip: 0,
        $orderby: 'sysMtime desc',
      },
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch Brands error',
        message: `Error fetching brands`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  /**
   * Create Brand
   * @param promoterOid
   * @param name
   * @returns
   */
  async create(promoterOid: number, name: string, actions: SocialAction[], additionalInfo: AdditionalInfo): Promise<Brand> {
    const { data, status } = await axios.post(`/promoter/${promoterOid}/social-accounts`, {
      promoterOid,
      name,
      actions,
      additionalInfo,
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Create Brand error',
        message: `Error creating brand ${name}`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  /**
   * Delete Brand
   * @param promoterOid
   * @param brandOid
   * @returns
   */
  async delete(promoterOid: number, brandOid: number): Promise<void> {
    const { status } = await axios.delete(`/promoter/${promoterOid}/social-accounts/${brandOid}`);
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch Brands error',
        message: `Error fetching brands`,
        status,
      };
      throw apiError;
    }
  },
  /**
   * Patch Brand
   * @param promoterOid
   * @param name
   * @returns
   */
  async patch(
    promoterOid: number,
    brandOid: number,
    changes: {
      actions: SocialAction[],
      additionalInfo: AdditionalInfo,
    },
  ): Promise<Brand> {
    const { data, status } = await axios.patch(`/promoter/${promoterOid}/social-accounts/${brandOid}`, changes);
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Patch Brand error',
        message: `Error patching brand`,
        status,
      };
      throw apiError;
    }
    return data;
  },
});
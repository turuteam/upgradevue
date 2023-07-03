import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { isErrorStatus } from '../utils';
import { CustomApiError } from '../types';
import { Customer, FanLoyaltyMembership, LoyaltyProgramTier, LoyaltyProgram } from './types';

export default (axios: NuxtAxiosInstance) => ({
  /**
   * Fetch Customer
   * @param promoterOid
   * @param fanOid
   * @returns
   */
  async fetch(promoterOid: number, fanOid: number): Promise<Customer> {
    const { data, status } = await axios.get(`/promoter/${promoterOid}/materialized-fan/${fanOid}`, {
      params: {
        $filter: `promoter_oid=${promoterOid}`,
      },
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch Customer Profile error',
        message: `Error fetching Customer Profile with oid of ${fanOid}`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  /**
   * Fetch Loyalty Membership
   * @param promoterOid
   * @param fanOid
   * @returns
   */
  async fetchFanLoyaltyMembership(promoterOid: number, fanOid: number): Promise<FanLoyaltyMembership[]> {
    const { data, status } = await axios.get(`/promoter/${promoterOid}/fan-loyalty-membership`, {
      params: {
        $filter: `fanOid = ${fanOid} AND isCurrentMember`,
      },
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch Loyalty Memberships error',
        message: `Error fetching Loyalty Memberships`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  /**
   * Fetch Integration Loyalty Program Tiers
   * @param promoterOid
   * @param fanOid
   * @returns
   */
  async fetchLoyaltyProgramTiersByOids(promoterOid: number, oids: number[]): Promise<LoyaltyProgramTier[]> {
    if (oids.length === 0) {
      return [];
    }
    const { data, status } = await axios.get(`/promoter/${promoterOid}/promoter-integration-loyalty-program-tier`, {
      params: {
        $filter: oids.map(oid => `oid = ${oid}`).join(' AND '),
      },
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch Integration Loyalty Program Tiers error',
        message: `Error fetching Integration Loyalty Program Tiers`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  /**
   * Fetch promoter integration loyalty programs
   */
  async fetchPromoterIntegrationLoyaltyPrograms(promoterOid: number): Promise<LoyaltyProgram[]> {
    const { data, status } = await axios.sg.get(`/promoter/${promoterOid}/promoter-integration-loyalty-program`);
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch promoter integration loyalty programs error',
        message: `Error doing fetch promoter integration loyalty programs`,
        status,
      };
      throw apiError;
    }
    return data;
  },
});

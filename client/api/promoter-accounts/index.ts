import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { isErrorStatus } from '../utils';
import { CustomApiError } from '../types';

export default (axios: NuxtAxiosInstance) => ({
  /**
   * Qeury promoter accounts
   * @param promoterAccountOids 
   * @returns
   */
  async query(filterString: string): Promise<PromoterAccount[] | null> {
    const { status, data: { rows } } = await axios.get('/promoter/', {
      params: {
        $top: '50',
        $count: true,
        $skip: 0,
        $select: 'name,oid,emailAddress',
        $orderby: 'name asc',
        $filter: filterString ? `sysActivep AND name ILIKE "%${filterString}%" OR sysActivep AND emailAddress ILIKE "%${filterString}%"` : null,
      },
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Query Promoter Accounts error',
        message: `Error querying Promoter Accounts`,
        status,
      };
      throw apiError;
    }
    return rows;
  },
  /**
   * Qeury promoter accounts by oids
   * @param promoterAccountOids 
   * @returns
   */
  async queryByOids(promoterAccountOids: number[]): Promise<PromoterAccount[] | null> {
    if (promoterAccountOids.length === 0) {
      return [];
    }
    const { status, data } = await axios.get('/promoter/', {
      params: {
        $top: 'all',
        $skip: 0,
        $select: 'name,oid,emailAddress',
        $orderby: 'name asc',
        $filter: 'oid=' + promoterAccountOids.join(' OR oid='),
      },
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Query Promoter Accounts by Oids error',
        message: `Error querying Promoter Accounts by oids ${promoterAccountOids.join(', ')}`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  /**
   * Get promoter account
   * @param promoterAccountOids 
   * @returns
   */
  async get(oid: number): Promise<PromoterAccount | null> {
    const { status, data } = await axios.get(`/promoter/${oid}`);
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Get Promoter Account error',
        message: `Error getting Promoter Account with oid of ${oid}`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  /**
   * Update promoter account
   * @param promoterAccountOids 
   * @returns
   */
  async patch(oid: number, accountObj: object): Promise<PromoterAccount | null> {
    const { status, data } = await axios.patch(`/promoter/${oid}`, accountObj);
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Update Promoter Account error',
        message: `Error updating Promoter Account with oid of ${oid}`,
        status,
      };
      throw apiError;
    }
    return data;
  },
});

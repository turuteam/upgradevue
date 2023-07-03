import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { isErrorStatus } from '../utils';
import { CustomApiError } from '../types';

const MAX_INITIAL_TOP_VALUE = 200;

export default (axios: NuxtAxiosInstance) => ({
  /**
   * Get the Tags of the promoter with the given promoterOid
   * @param promoterOid
   * @returns
   */
  async get(promoterOid: number, {top = MAX_INITIAL_TOP_VALUE, filterString = null }:any): Promise<Tag[]> {
    let url = `/promoter/${promoterOid}/tag?$count=true&top=${top}&$orderby=count%20desc`

    if (!!filterString) {
      url = `${url}&$filter=${encodeURIComponent(`name ILIKE "%${filterString}%"`)}`
    }

    const { data, status } = await axios.get(url);
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Get Tags error',
        message: `Error getting Tags from promoter with oid of ${promoterOid}`,
        status,
      };
      throw apiError;
    }
    return data.rows;
  },


  async fetchCount(
    promoterOid: number,
    {
      filter = null
    } : {
      filter?: string | null;
    }): Promise<{rows: [], count: number} | null> {

    const { status, data } = await axios.get(`/promoter/${promoterOid}/tag`, {
      params : {
        $select: 'oid',
        $top: 0,
        $count: true,
        $filter: filter,
      }
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch Tags error',
        message: `Error fetching Tags`,
        status,
      };
      throw apiError;
    }
    return data;
  },

  async fetchTagByOid(promoterOid: number, tagOid: number): Promise<Tag[]> {
    const { data, status } = await axios.get(`/promoter/${promoterOid}/tag?$filter=oid=${tagOid}`)
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Get Tag error',
        message: `Error fetching Tag by Oid, with a promoter with oid of ${promoterOid},\n
                  and tagOid of ${tagOid}.`,
        status,
      }
      throw apiError
    }

    return data
  },

  async create(promoterOid: number, name: string, favourite: boolean, external: boolean): Promise<any> {
    const { data, status } = await axios.post(`/promoter/${promoterOid}/tag`, {
      name,
      'promoter-oid': promoterOid,
      favourite,
      external,
    })

    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Create Tag error',
        message: `Error creating Tag with name of ${name},
                  and promoterOid of ${promoterOid}.`,
        status,
      }
      throw apiError
    }

    return data
  }
});

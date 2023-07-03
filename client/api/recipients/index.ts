import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { isErrorStatus } from '../utils';
import { CustomApiError } from '../types';
import { CancelTokenSource } from 'axios';

let fetchRecipientCountCancelToken: CancelTokenSource | null = null;

export default (axios: NuxtAxiosInstance) => ({

  async fetchMessageRecipientCount(
    promoterOid: number,
    messageTaskOid: number,
    searchString: string | null,
    searchStringTargets: string[],
    statuses: string[]
  ): Promise<number> {

    if (fetchRecipientCountCancelToken) {
      fetchRecipientCountCancelToken.cancel('Operation cancelled due to new request');
    }
    fetchRecipientCountCancelToken = axios.CancelToken.source();
    const newCancelTokenSource: CancelTokenSource = fetchRecipientCountCancelToken;

    let uri = `/promoter/${promoterOid}/fan-message`;
    // Generate filter query
    let filter = '';
    filter += `taskOid=${messageTaskOid}`;
    if (statuses && statuses.length > 1) {
      filter += ` AND (${
        statuses
          .map((item: string) =>`status=${item}`).join(' OR ')
      })`;
    } else if (statuses && statuses.length === 1 && statuses[0] !== undefined && statuses[0] !== null) {
      filter += ` AND status=${statuses[0]}`;
    }
    // Filtering with a search string will come later
    if (searchString) {
      // We also allow users to search "status" by using keyword, so don't forget "status" in "searchStringTargets"
      filter += ` AND (${
        searchStringTargets
          .map((target: string) => `${target} ILIKE "%${searchString}%"`).join(' OR ')
      })`;
    }

    const { data: { count }, status } = await axios.get(uri, {
      cancelToken: newCancelTokenSource.token,
      params: {
        $top: 0,
        $skip: 0,
        $count: true,
        $filter: filter,
      },
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch Message Recipient Count error',
        message: `Error fetching Message Recipient Count`,
        status,
      };
      throw apiError;
    }

    return count;
  }
});

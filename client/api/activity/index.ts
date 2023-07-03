import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { isErrorStatus } from '../utils';
import { CustomApiError } from '../types';

export default (axios: NuxtAxiosInstance) => ({
  async fetchAll(
    promoterOid: number,
    { top = 50,
      skip = 0,
      types = null,
      notTypes = null,
      olderThan = null,
      newerThan = null,
      orderby = "activityTime desc oid desc",
    } : {
      top?: number | null;
      skip?: number | null;
      types?: string[] | null;
      notTypes?: string[] | null;
      olderThan?: string | null;
      newerThan?: string | null;
      orderby?: string | null;
    }): Promise<ActivityFanMessage[] | ActivityPatreonLoyaltyProgramAction[] | ActivityEventAttendance[]
    | ActivityEventPurchase[] | ActivityPurchase[] | ActivityCampaignRegistration[]> {

    let filterString = '';
    let typesFilter = null;


    let interweaveLogic = ` AND promoter_oid = ${promoterOid}`;
    if (olderThan) {
      interweaveLogic = `${interweaveLogic} AND activityTime < "${olderThan}"`
    }
    if (newerThan) {
      interweaveLogic = `${interweaveLogic} AND activityTime > "${newerThan}"`
    }

    if (notTypes && notTypes.length > 0) {
      const joinString = ` AND activityType != `;
      typesFilter = `activityType != ${notTypes.join(joinString)}`;
      filterString = filterString ? `${filterString} AND ${typesFilter}` : typesFilter;
      filterString = `${filterString} ${interweaveLogic}`
    } else if (types && types.length > 0) {
      const joinString = `${interweaveLogic} OR activityType = `;
      typesFilter = `activityType = ${types.join(joinString)}`;
      filterString = filterString ? `${filterString} AND ${typesFilter}` : typesFilter;
      filterString = `${filterString} ${interweaveLogic}`;
    }

    const { status, data } = await axios.get(`/promoter/${promoterOid}/fan-activity`, {
      params : {
        $top: top,
        $skip: skip,
        $orderby: orderby,
        $filter: filterString,
      }
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch Activity error',
        message: `Error fetching Activity`,
        status,
      };
      throw apiError;
    }
    return data;
  }
});

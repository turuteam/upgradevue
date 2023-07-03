import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { isErrorStatus } from '../utils';
import { CustomApiError } from '../types';

import { CancelTokenSource } from 'axios';

// Used to cancel Audience Count requests if a new one is queued up before the previous one has finished.
// Helps us avoid situations in which slower previous requests overwrite the results of newer requests.
let fetchAudienceCountCancelToken: CancelTokenSource | null = null;
let fetchAudienceCancelToken: CancelTokenSource | null = null;

export default (axios: NuxtAxiosInstance) => ({
  /**
   * Get the count of fans within the audience matching the filter segment
   * @param promoterOid
   * @param audienceFilter
   * @returns
   */
  async fetchAudienceCount(promoterOid: number, audienceFilter: Segment | null): Promise<number> {
    if (fetchAudienceCountCancelToken) {
      fetchAudienceCountCancelToken.cancel('Operation cancelled due to new request');
    }
    fetchAudienceCountCancelToken = axios.CancelToken.source();
    const newCancelTokenSource: CancelTokenSource = fetchAudienceCountCancelToken;

    const { data: { count }, status } = await axios.get(`/promoter/${promoterOid}/filter-fan/`, {
      cancelToken: newCancelTokenSource.token,
      params: {
        $select: 'oid',
        $top: 0,
        $skip: 0,
        $audienceFilter: audienceFilter,
        $count: true,
      },
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Fetch Audience Count error',
        message: `Error fetching Audience Count`,
        status,
      };
      throw apiError;
    }

    return count;
  },

  async fetchAudience(
    promoterOid: number,
    top: number,
    orderBy: string,
    skip: number,
    audienceFilterString: string | null,
    selectString: string,
  ): Promise<SourceFan[] | null> {

    fetchAudienceCancelToken = axios.CancelToken.source();
    const newCancelTokenSource: CancelTokenSource = fetchAudienceCancelToken;

    const { data, status } = await axios.get(`/promoter/${promoterOid}/filter-fan/`, {
      cancelToken: newCancelTokenSource.token,
      params: {
        $top: top,
        $skip: skip,
        $orderby: orderBy,
        $audienceFilter: audienceFilterString,
        $select: selectString,
        $count: false, // Never make it true due to performance issue
      },
    })

    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Get Zoom Attendance error',
        message: `Error getting Audience with audienceFilterString of ${audienceFilterString}`,
        status,
      };
      throw apiError;
    }

    return data;
  },


  /**
   * Get the Zoom Attendance of the event with the given eventOid
   * @param promoterOid
   * @param eventOid
   * @param paramObj
   * @returns
   */
  async fetchZoomAttendance(promoterOid: number, eventOid: number, filterStr: string, paramObj: object): Promise<SourceFan[] | null> {
    const { data, status } = await axios.get(`promoter/${promoterOid}/event/${eventOid}/fan?$filter=eventOid=${eventOid}+AND+attendedAt+IS+NOT+NULL${filterStr != '' ? `+AND+(firstName ILIKE "${filterStr}" OR lastName ILIKE "${filterStr}")` : ''}`, {
      params: paramObj
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Get Zoom Attendance error',
        message: `Error getting Zoom Attendance from event with oid of ${eventOid}`,
        status,
      };
      throw apiError;
    }

    return data;
  },
});

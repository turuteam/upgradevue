import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { EventRSVPFormCampaign, ScratchEventRSVPFormCampaign } from '@/types/resources/eventRSVPFormCampaign';
import { isErrorStatus } from '../utils';
import { CustomApiError } from '../types';

export default (axios: NuxtAxiosInstance) => ({
  /**
   * Get the RSVP page of the event with the given eventOid
   * @param promoterOid 
   * @param eventOid 
   * @returns
   */
  async get(promoterOid: number, eventOid: number): Promise<EventRSVPFormCampaign | null> {
    const { data, status } = await axios.get(`/promoter/${promoterOid}/campaign`, {
      params: {
        $select: 'name,endDate,event,registrations,type,urlSlug,presentation,settings,resources,resourceOids',
        $filter: `eventOid = ${eventOid} AND type = "rsvp"`,
      },
    });
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Get RSVP Page error',
        message: `Error getting RSVP Page from event with oid of ${eventOid}`,
        status,
      };
      throw apiError;
    }
    return data[0] || null;
  },
  async create(promoterOid: number, scratchRsvpPage: ScratchEventRSVPFormCampaign): Promise<EventRSVPFormCampaign> {
    const { data, status } = await axios.post(`/promoter/${promoterOid}/campaign`, scratchRsvpPage);
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Create RSVP Page error',
        message: `Error creating RSVP Page`,
        status,
      };
      throw apiError;
    }
    return data;
  },
  async delete(promoterOid: number, rsvpPageOid: number): Promise<void> {
    const { status } = await axios.delete(`/promoter/${promoterOid}/campaign/${rsvpPageOid}`);
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Delete RSVP Page error',
        message: `Error deleting RSVP Page with oid of ${rsvpPageOid}`,
        status,
      };
      throw apiError;
    }
  },
  async put(promoterOid: number, scratchRsvpPage: ScratchEventRSVPFormCampaign) {
    const { status } = await axios.patch(`/promoter/${promoterOid}/campaign/${scratchRsvpPage.oid}`, scratchRsvpPage);
    if (isErrorStatus(status)) {
      const apiError: CustomApiError = {
        name: 'Patching RSVP Page error',
        message: `Error patching RSVP Page with oid of ${scratchRsvpPage.oid}`,
        status,
      };
      throw apiError;
    }
  }
});
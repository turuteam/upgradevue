import { ActionTree } from 'vuex'
import { RootState } from '@/store/modules/types';
import { EventRSVPFormCampaign, ScratchEventRSVPFormCampaign } from '@/types/resources/eventRSVPFormCampaign';
import { EventRSVPFormState } from './types';
import {mergeObjects, sanitizeFilename} from '@/utils/helpers';

export const eventRSVPFormActions: ActionTree<EventRSVPFormState, RootState> = {
  async FETCH_CURRENT_EVENT_RSVP_FORM({ commit, rootState }, eventOid) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('RESET_CURRENT_EVENT_RSVP_FORM');
      commit('SET_IS_FETCHING_EVENT_RSVP_FORM', true);

      const rsvpPage = await this.$api.rsvpPage.get(promoterOid, eventOid);

      if (rsvpPage) {
        commit('SET_CURRENT_EVENT_RSVP_FORM', rsvpPage);
      }
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch eventRSVP form',
      });
    } finally {
      commit('SET_IS_FETCHING_EVENT_RSVP_FORM', false);
    }
  },

  async CREATE_EVENT_RSVP_FORM({ commit, rootState }, scratchRsvpPage: ScratchEventRSVPFormCampaign) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_CREATING_EVENT_RSVP_FORM', true);

      const rsvpPage = await this.$api.rsvpPage.create(promoterOid, { ...scratchRsvpPage, promoterOid });

      this.$arNotification.push({
        type: 'success',
        message: 'Successfully created event RSVP',
      });

      commit('SET_CREATED_EVENT_RSVP_FORM', rsvpPage);
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to create event RSVP',
      });
      return false;
    } finally {
      commit('SET_IS_CREATING_EVENT_RSVP_FORM', false);
    }
  },

  async PATCH_EVENT_RSVP_FORM({ commit, rootState }, scratchRsvpPage: ScratchEventRSVPFormCampaign) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_PATCHING_EVENT_RSVP_FORM', true);

      await this.$api.rsvpPage.put(promoterOid, { ...scratchRsvpPage, promoterOid });

      this.$arNotification.push({
        type: 'success',
        message: 'Successfully updated event RSVP',
      });
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to update event RSVP',
      });
      return false;
    } finally {
      commit('SET_IS_PATCHING_EVENT_RSVP_FORM', false);
    }
  },

  async DELETE_EVENT_RSVP_FORM(
    { state, rootState, commit },
    eventRSVPForm: EventRSVPFormCampaign,
  ) {
    if (state.isDeletingEventRSVPForm) return;
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_DELETING_EVENT_RSVP_FORM', true);
      await this.$api.rsvpPage.delete(promoterOid, eventRSVPForm.oid);
      this.$arNotification.push({ type: 'success', message: `EventRSVP form "${eventRSVPForm.name}" deleted` });

      return true;
    } catch (error) {
      this.$arNotification.push({ type: 'error', message: `Failed to delete eventRSVP form` });
      console.error(error);

      return false;
    } finally {
      commit('SET_IS_DELETING_EVENT_RSVP_FORM', false);
    }
  },
  async CREATE_SCRATCH_EVENT_RSVP_FORM({ commit, state, rootState }) {
    try {
      // Manually reset edit eventRSVP form, so it works even API failed
      commit('RESET_SCRATCH_EVENT_RSVP_FORM');
      commit('SET_IS_CREATING_SCRATCH_EVENT_RSVP_FORM', true);

      const mergedCampaign = mergeObjects(state.scratchEventRSVPForm, {
        type: 'rsvp',
      });

      const res = await this.$axios.get('/campaign-preview', {
        params: {
          campaign: JSON.stringify(mergedCampaign),
        },
      });
      const scratchEventRSVPFormCampaign: ScratchEventRSVPFormCampaign = res.data;
      scratchEventRSVPFormCampaign.urlSlug = '';

      commit('SET_SCRATCH_EVENT_RSVP_FORM', scratchEventRSVPFormCampaign);
    } catch (error) {
      console.error(error);
    } finally {
      commit('SET_IS_CREATING_SCRATCH_EVENT_RSVP_FORM', false);
    }
  },
  async UPLOAD_IMAGE_FOR_SCRATCH_EVENT_RSVP_FORM({ commit, rootState, state }, file) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;

    try {
      const contentType = file.type;
      const res = await this.$axios.post(`/promoter/${promoterOid}/bucket`, {
        eventOid: null,
        campaignOid: state.scratchEventRSVPForm.oid,
        assetType: 'campaign-image',
        contentType,
      });
      const newResource = res.data;
      const newResourceList = state.scratchEventRSVPForm.resources.filter(resource => resource.assetType !== 'campaign-image');

      // Put the asset to the S3 bucket
      const sanitizedFile = new File([file], sanitizeFilename(file.name), { type: file.type});
      await this.$axios.put(newResource.uploadParams.uploadUrl, sanitizedFile, {
        headers: {
          'Content-Type': contentType,
        },
      });

      commit('PUT_SCRATCH_EVENT_RSVP_FORM', {
        resources: newResourceList.concat([newResource]),
      });
    } catch (error) {
      // TODO
      console.error(error);
    }
  },
}

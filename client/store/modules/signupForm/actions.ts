import { ActionTree } from 'vuex'
import { RootState } from '@/store/modules/types';
import { SignupFormCampaign, ScratchSignupFormCampaign } from '@/types/resources/signupFormCampaign';
import { SignupFormState } from './types';
import { followsToAppMap } from '@/utils/campaign';
import { mergeObjects } from '~/utils/helpers';
import { normaliseCampaignData } from '@/utils/normaliseData';
import {convertRegistrationsObjectToArray} from "~/store/modules/signupForm/utils";

export const signupFormActions: ActionTree<SignupFormState, RootState> = {
  async FETCH_SIGNUP_FORMS(
    { state, rootState, commit, dispatch },
    {
      top = 12,
      searchString = '',
      messageListOid = null,
      append = false,
    },
  ) {
    if (state.isFetchingSignupForms) { return; }
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;

    if (!append) {
      commit('RESET_SIGNUP_FORMS');
    }

    if (state.hasFetchSignupFormsFailed) {
      console.error(`FETCH_SIGNUP_FORMS cancelled due to previous failed request.`);
      return;
    }

    const skip = state.signupForms.length;

    let url = `/promoter/${promoterOid}/campaign?$select=name,type,messageListOid,messageList,notifyDate,startDate,endDate,event,timeZone,presentation,urlSlug,socialActions,registrations,summaryStatsSnapshot,settings,resources&$top=${top}&$skip=${skip}&$count=true&$orderby=oid%20desc&$filter=`;

    let filterString = 'type = opt-in ';
    if (searchString) {
      filterString += `AND name ILIKE "%${searchString}%" `;
    }
    if (messageListOid) {
      filterString += `AND messageListOid=${messageListOid}`;
    }
    url += encodeURIComponent(filterString);

    try {
      commit('SET_IS_FETCHING_SIGNUP_FORMS', true);

      const { data: { rows, count }, } = await this.$axios.get(url);

      const statPromises = [];
      for (let idx = 0; idx < rows.length; idx++) {
        statPromises.push(dispatch('FETCH_CAMPAIGN_REGISTRATIONS', rows[idx].oid, { root: true }));
      }

      await Promise.all(statPromises).then((values) => {
        values.forEach( (value, idx) => {
          if (value.follow && value.follow.targets) {
            const m = followsToAppMap(value.follow.targets);
            rows[idx].summaryStats = {
              smsFollows: m["sms"],
              emailFollows: m["email"],
              messengerFollows: m["messenger"],
              allRegistrations: value.allRegistrations,
              uniqueViews: value.uniqueViews,
            }
          } else {
            rows[idx].summaryStats = {
              smsFollows: null,
              emailFollows: null,
              messengerFollows: null,
              allRegistrations: value.allRegistrations,
              uniqueViews: value.uniqueViews,
            }
          }
        });
      });

      commit('SET_SIGNUP_FORMS_COUNT', count);
      if (append) {
        commit('CONCAT_SIGNUP_FORMS', rows);
      } else {
        commit('SET_SIGNUP_FORMS', rows);
      }

      if (rows.length < top) {
        commit('SET_IS_NO_MORE_SIGNUP_FORMS', true);
      }

    } catch (error) {
      // TODO - Set some sort of error state here to prevent further fetching of campaigns
      console.error(error);
      commit('SET_HAS_FETCH_SIGNUP_FORMS_FAILED', true);
    } finally {
      commit('SET_IS_FETCHING_SIGNUP_FORMS', false);
    }
  },
  async FETCH_CURRENT_SIGNUP_FORM({ commit, rootState }, signupFormOid) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('RESET_CURRENT_SIGNUP_FORM', true);
      commit('SET_IS_FETCHING_SIGNUP_FORM', true);
      const { data } = await this.$axios.get(`/promoter/${promoterOid}/campaign/${signupFormOid}`, {
        params: {
          $select: 'name,type,messageListOid,notifyDate,startDate,endDate,timeZone,urlSlug,eventOid,event,rewards,presentation,resources,resourceOids,registrations,settings,socialActions',
        },
      });

      let normalisedData = await normaliseCampaignData(data)
      normalisedData.registrations.fields = Array.isArray(normalisedData.registrations.fields)
        ? normalisedData.registrations.fields
        : convertRegistrationsObjectToArray(normalisedData.registrations.fields, normalisedData.registrations.requiredFields)
      commit('SET_CURRENT_SIGNUP_FORM', normalisedData)
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch signup form',
      });
    } finally {
      commit('SET_IS_FETCHING_SIGNUP_FORM', false);
    }
  },

  async CLONE_SIGNUP_FORM({ rootState }, signupFormOid: number) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      await this.$axios.post(
        `/promoter/${promoterOid}/campaign/${signupFormOid}/clone`
      );

      // Currently the returned data is not complte
      // commit('ADD_TO_SIGNUP_FORMS', data);

      this.$arNotification.push({
        type: 'success',
        message: 'Successfully cloned signup form',
      });
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to clone signup form',
      });
      return false;
    }
  },

  async CREATE_SIGNUP_FORM({ commit, rootState }, OptInForm: ScratchSignupFormCampaign) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_CREATING_SIGNUP_FORM', true);

      const { data } = await this.$axios.post(`promoter/${promoterOid}/opt-in`, OptInForm);

      commit('SET_CREATED_SIGNUP_FORM', data);
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to create signup form',
      });
      return false;
    } finally {
      commit('SET_IS_CREATING_SIGNUP_FORM', false);
    }
  },

  async PATCH_SIGNUP_FORM_SLUG_URL({ commit, rootState }, { signupFormOid, urlSlug }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_PATCHING_SIGNUP_FORM', true);
      const body = {
        urlSlug,
        promoterOid,
      };
      await this.$axios.patch(`/promoter/${promoterOid}/campaign/${signupFormOid}`, body);

      this.$arNotification.push({
        type: 'success',
        message: 'Successfully updated signup form URL',
      });
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to update signup form URL',
      });
      return false;
    } finally {
      commit('SET_IS_PATCHING_SIGNUP_FORM', false);
    }
  },

  async PATCH_SIGNUP_FORM({ commit, rootState }, signupForm) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_PATCHING_SIGNUP_FORM', true);
      const body = {
        ...signupForm,
        promoterOid,
      };
      await this.$axios.patch(`/promoter/${promoterOid}/campaign/${signupForm.oid}`, body);

      this.$arNotification.push({
        type: 'success',
        message: 'Successfully updated signup form',
      });
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to update signup form',
      });
      return false;
    } finally {
      commit('SET_IS_PATCHING_SIGNUP_FORM', false);
    }
  },

  async DELETE_SIGNUP_FORM(
    { state, rootState, commit },
    signupForm: SignupFormCampaign,
  ) {
    if (state.isDeletingSignupForm) return;
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_DELETING_SIGNUP_FORM', true);
      await this.$axios.delete(`/promoter/${promoterOid}/campaign/${signupForm.oid}`);
      this.$arNotification.push({ type: 'success', message: `Signup form "${signupForm.name}" deleted` });
      commit('DELETE_FROM_SIGNUP_FORMS', signupForm.oid);

      return true;
    } catch (error) {
      this.$arNotification.push({ type: 'error', message: `Failed to delete signup form` });
      console.error(error);

      return false;
    } finally {
      commit('SET_IS_DELETING_SIGNUP_FORM', false);
    }
  },
  async FETCH_MOCKUP_MESSAGE_LIST_FOR_SCRATCH_SIGNUP_FORM({ rootState, commit }) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    const { data: { rows } } = await this.$axios.get(`/promoter/${promoterOid}/message-list`, {
      params: {
        $skip: 0,
        $top: 1,
        $count: true,
      },
    });
    const messageList = rows[0];
    commit('SET_DEFAULT_MESSAGE_LIST_IN_SCRATCH_SIGNUP_FORM', messageList);
  },
  async CREATE_SCRATCH_SIGNUP_FORM({ commit, state, rootState }) {
    if (!state.mockupMessageListForScratchSignupForm) { return; }
    try {
      // Manually reset edit signup form, so it works even API failed
      commit('RESET_SCRATCH_SIGNUP_FORM');
      commit('SET_IS_CREATING_SCRATCH_SIGNUP_FORM', true);

      const mergedCampaign = mergeObjects(state.scratchSignupForm, {
        messageListOid: state.mockupMessageListForScratchSignupForm.oid,
        type: 'opt-in',
      });

      const res = await this.$axios.get('/campaign-preview', {
        params: {
          campaign: JSON.stringify(mergedCampaign),
        },
      });
      const scratchSignupFormCampaign: ScratchSignupFormCampaign = res.data;
      scratchSignupFormCampaign.messageListOid = null;
      scratchSignupFormCampaign.urlSlug = '';

      commit('SET_SCRATCH_SIGNUP_FORM', scratchSignupFormCampaign);
    } catch (error) {
      console.error(error);
    } finally {
      commit('SET_IS_CREATING_SCRATCH_SIGNUP_FORM', false);
    }
  }
}

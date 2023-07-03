import { ActionTree } from 'vuex'
import { RootState } from '@/store/modules/types';
import { PrivacyPortalState, ScratchPrivacyPortal } from './types';
import { prunePrivacyPortalValuesForServer } from './utils';

export const privacyPortalActions: ActionTree<PrivacyPortalState, RootState> = {
  async CREATE_PRIVACY_PORTAL({ rootState, commit }, scratchPrivacyPortal: ScratchPrivacyPortal) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;

    const payload = {
      ...scratchPrivacyPortal,
      promoterOid,
    };

    try {
      commit('SET_IS_CREATING_PRIVACY_PORTAL', true);

      const prunedPrivacyPortal = prunePrivacyPortalValuesForServer(payload);
      await this.$axios.post(`promoter/${promoterOid}/privacy-portal`, prunedPrivacyPortal);
      // The "resources" takes some time to get ready, so don't set data here
      // commit('SET_CURRENT_PRIVACY_PORTAL', data);
      this.$arNotification.push({
        type: 'success',
        message: 'Your privacy portal has been published',
      });
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to update privacy portal settings',
      });
      return false;
    } finally {
      commit('SET_IS_CREATING_PRIVACY_PORTAL', false);
    }
  },
  async FETCH_CURRENT_PRIVACY_PORTAL({ rootState, commit, dispatch }) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_FETCHING_CURRENT_PRIVACY_PORTAL', true);

      const { data } = await this.$axios.get(`promoter/${promoterOid}/privacy-portal`);
      if (data.length > 0) {
        commit('SET_CURRENT_PRIVACY_PORTAL', data[0]);
      }
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch privacy portal settings',
      });
      commit('SET_HAS_FETCH_CURRENT_PRIVACY_PORTAL_FAILED', true);
      return false;
    } finally {
      commit('SET_IS_FETCHING_CURRENT_PRIVACY_PORTAL', false);
    }
  },
  async EXPORT_REQUEST_CSV({ rootState, state, commit }) {
    if (!rootState.auth.account) { return; }
    if (!state.currentPrivacyPortal) { return; }
    const { promoterOid } = rootState.auth.account;
    const { oid } = state.currentPrivacyPortal;

    try {
      const { data } = await this.$axios.get(`promoter/${promoterOid}/privacy-portal/${oid}/requests-export`);
      this.$arNotification.push({
        type: 'success',
        message: data,
      });
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to export CSV log',
      });
      return false;
    }
  },
  async PUBLISH_PRIVACY_PORTAL({ rootState, commit }, { oid, published }) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_UPDATING_PRIVACY_PORTAL', true);

      await this.$axios.patch(`promoter/${promoterOid}/privacy-portal/${oid}`, { published });
      commit('PATCH_CURRENT_PRIVACY_PORTAL', {
        published,
      });
      this.$arNotification.push({
        type: 'success',
        message: published ? 'Your privacy portal has been published' : 'Your privacy portal has been unpublished',
      });
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: published ? 'Failed to publish your privacy portal' : 'Failed to unpublish your privacy portal',
      });
      return false;
    } finally {
      commit('SET_IS_UPDATING_PRIVACY_PORTAL', false);
    }
  },
  async UPDATE_PRIVACY_PORTAL({ rootState, commit }, { oid, changes }) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_UPDATING_PRIVACY_PORTAL', true);

      const prunedPrivacyPortal = prunePrivacyPortalValuesForServer(changes);
      await this.$axios.patch(`promoter/${promoterOid}/privacy-portal/${oid}`, prunedPrivacyPortal);
      commit('PATCH_CURRENT_PRIVACY_PORTAL', changes);
      this.$arNotification.push({
        type: 'success',
        message: 'Successfully edited privacy portal settings',
      });
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to update privacy portal settings',
      });
      return false;
    } finally {
      commit('SET_IS_UPDATING_PRIVACY_PORTAL', false);
    }
  },
  // For Test purpose only at the moment
  DELETE_PRIVACY_PORTAL({ rootState }, privacyPortalOid: number) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;

    this.$axios.delete(`promoter/${promoterOid}/privacy-portal/${privacyPortalOid}`);
  },
};
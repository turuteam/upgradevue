import { ActionTree } from 'vuex';
import { RootState } from '@/store/modules/types';
import { MemberfulIntegrationState } from './types';

export const memberfulIntegrationActions: ActionTree<MemberfulIntegrationState, RootState> = {
  async CREATE_MEMBERFUL_INTEGRATION({ commit }, options: { siteName: string, apiKey: string }) {
    try {
      commit('SET_IS_CREATING_INTEGRATION', true);
      const syncTask = await this.$api.promoterIntegrations.createMemberfulIntegration(options.siteName, options.apiKey);
      commit('SET_SYNC_TASK', syncTask);
      commit('SET_SYNC_STATUS', syncTask.status);
      return true;
    } catch (error) {
      // @ts-ignore - We will have a way to handle error types
      if (error.response.status === 409) {
        this.$arNotification.push({
          type: 'error',
          message: `Integration already exists for provider Memberful with site name "${options.siteName}"`,
        });
      } else {
        this.$arNotification.push({
          type: 'error',
          message: 'Failed to connect to Memberful',
        });
      }
      return false;
    } finally{
      commit('SET_IS_CREATING_INTEGRATION', false);
    }
  },
  async FETCH_INTEGRATION({ commit, rootState }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_FETCHING_INTEGRATION', true);
      const integrations = await this.$api.promoterIntegrations.fetchByAppProvider(promoterOid, 'memberful', 'memberful');
      commit('SET_INTEGRATION', integrations);
      return true;
    } catch (err) {
      console.error(err);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch integrations',
      });
      return false;
    } finally {
      commit('SET_IS_FETCHING_INTEGRATION', false);
    }
  },
  async DELETE_INTEGRATION({ rootState, commit }, oid) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    if (!oid) return;
    try {
      await this.$api.promoterIntegrations.delete(promoterOid, oid);
      commit('REMOVE_FROM_INTEGRATION', oid);
      return true;
    } catch(e) {
      console.error(e);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to delete integration',
      });
      return false;
    }
  },
  async FETCH_SYNC_TASK({ commit, rootState }, oid: number) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    commit('SET_IS_FETCHING_SYNC_TASK', true);

    try {
      const syncTask = await this.$api.promoterIntegrations.fetchSyncTask(promoterOid, oid);

      commit('SET_SYNC_TASK', syncTask);
      commit('SET_SYNC_STATUS', syncTask?.status || null);
    } catch (error) {
      throw error;
    } finally {
      commit('SET_IS_FETCHING_SYNC_TASK', false);
    }
  },
  async SYNC_START({ commit, rootState }, { oid }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_SYNC_STATUS', 'in-progress');
      await this.$api.promoterIntegrations.startSync(promoterOid, oid);
    } catch (error: any) {
      const serverReason = error.message ? error.message : error;
      this.$arNotification.push({
        type: 'error',
        message: serverReason,
      });
    }
  },
  async SYNC_STOP({ rootState }, { oid }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      await this.$api.promoterIntegrations.stopSync(promoterOid, oid);
    } catch (error: any) {
      const serverReason = error.message ? error.message : error;
      this.$arNotification.push({
        type: 'error',
        message: serverReason,
      });
    }
  },
}

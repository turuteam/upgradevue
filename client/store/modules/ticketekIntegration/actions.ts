import { ActionTree } from 'vuex';
import { RootState } from '@/store/modules/types';
import { TicketekIntegrationState } from './types';

export const ticketekIntegrationActions: ActionTree<TicketekIntegrationState, RootState> = {
  async CREATE_TICKETEK_INTEGRATION({ commit }, s3Info: {
    s3BucketName: string,
    s3BucketRegion: string,
    s3BucketAccessKey: string,
    s3BucketSecretKey: string,
    messageList: string,
    tagFans: boolean,
  }) {
    try {
      commit('SET_IS_CREATING_INTEGRATION', true);
      const syncTask = await this.$api.promoterIntegrations.createTicketekIntegration(
        s3Info.s3BucketName,
        s3Info.s3BucketRegion,
        s3Info.s3BucketAccessKey,
        s3Info.s3BucketSecretKey,
        s3Info.messageList,
        s3Info.tagFans,
      );
      return true;
    } catch (error: any) {
      if (error.response.status === 409) {
        this.$arNotification.push({
          type: 'error',
          message: `Integration already exists for provider Ticketek with s3 bucket name "${s3Info.s3BucketName}" and region "${s3Info.s3BucketRegion}"`,
        });
      } else if (error.response.status === 400) {
        this.$arNotification.push({
          type: 'error',
          message: `Failed to access S3 bucket with name "${s3Info.s3BucketName}" and region "${s3Info.s3BucketRegion}"`,
        });
      } else {
        this.$arNotification.push({
          type: 'error',
          message: 'Failed to connect to Ticketek',
        });
      }
      return false;
    } finally {
      commit('SET_IS_CREATING_INTEGRATION', false);
    }
  },
    async UPDATE_TICKETEK_INTEGRATION({ commit, rootState }, { oid, meta } ) {
    if (!rootState.auth.account || !meta) { return null; }
    const { promoterOid } = rootState.auth.account;
    try {
      const { data } = await this.$axios.sg.put(`/promoter/${promoterOid}/integration/${oid}`, {meta});
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },
  async FETCH_INTEGRATION({ state, commit, rootState }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_FETCHING_INTEGRATION', true);
      let filterString = encodeURI(`app=ticketek and provider=ticketek`);
      // @ts-ignore
      const { data } = await this.$axios.sg.get(`/promoter/${promoterOid}/integration?$filter=${filterString}`);
      commit('SET_INTEGRATION', data);
      return true;
    } catch (err) {
      console.error(err);
      commit('SET_INTEGRATION', null);
      return false;
    } finally {
      commit('SET_IS_FETCHING_INTEGRATION', false);
    }
  },
  async DELETE_INTEGRATION({ state, commit, rootState }, { oid }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    if (!oid) return;
    try {
      // @ts-ignore
      await this.$axios.sg.delete(`/promoter/${promoterOid}/integration/${oid}`);
      commit('REMOVE_FROM_INTEGRATION', oid);
    } catch(e) {
      console.error(e);
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
  async SYNC_START({ state, commit, rootState }, { oid }) {
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

import { ActionTree } from 'vuex';
import { RootState } from '@/store/modules/types';
import { StripeIntegrationState } from './types';

export const stripeIntegrationActions: ActionTree<StripeIntegrationState, RootState> = {
  async FETCH_INTEGRATION({ state, commit, rootState }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_FETCHING_INTEGRATION', true);
      let filterString = encodeURI(`app=stripe and provider=stripe`);
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
      commit('SET_HAS_FETCHED_INTEGRATION', true);
    }
  },
  async ADD_INTEGRATION({ state, commit, dispatch, rootState }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    dispatch('CONNECT_TO_INTEGRATION', {
      app: 'stripe',
      provider: 'stripe',
    }, { root: true });
  },
  async DELETE_INTEGRATION({ state, commit, rootState }, { oid }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    if (!oid) return;
    try {
      // @ts-ignore
      await this.$axios.sg.delete(`/promoter/${promoterOid}/integration/${oid}`);
    } catch(e) {
      console.error(e);
    }
  },
  async RECONNECT_INTEGRATION({ state, commit, dispatch, rootState }, { oid }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    if (!oid) return;
    if (!state.integration) return;
    const existingIntegration = state.integration.find( item => item.oid === oid);
    if (!existingIntegration) return;
    dispatch('DELETE_INTEGRATION', { oid });
    dispatch('ADD_INTEGRATION');
  },
  async FETCH_TASKS({ state, commit, rootState }, { oid, top, orderby }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    commit('SET_IS_FETCHING_TASKS', true);
    // TODO

    try {
      let url = `/promoter/${promoterOid}/integration/${oid}/task?$top=${top || 10}`;

      url += `&$filter=${encodeURIComponent(`promoterIntegrationOid=${oid} AND name="event-data-synch" AND status != failed`)}`;

      if (orderby) {
        let orderParam = `&$orderby=${encodeURIComponent(orderby)}`;
        url += orderParam;
      }

      // @ts-ignore
      const { data } = await this.$axios.sg.get(url);
      commit('SET_TASKS', data);

      if (data && data.length > 0) {
        commit('SET_LATEST_TASK_STATUS', data[0].status);
      }
    } catch (error) {
      throw error;
    } finally {
      commit('SET_IS_FETCHING_TASKS', false);
    }
  },
  async SYNC_START({ state, commit, rootState }, { oid }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    let url = `/promoter/${promoterOid}/integration/${oid}/sync`;
    commit('SET_IS_FETCHING_TASKS', true);

    try {
      // @ts-ignore
      const res = await this.$axios.sg.post(url);
      // In following with
      let newIntegrationTask;
      if (res.status === 201) {
        newIntegrationTask = res.data;
      }
      commit('ADD_NEW_TASK', newIntegrationTask);
      commit('SET_LATEST_TASK_STATUS', res.data.status);
    } catch (error: any) {
      const serverReason = error.message ? error.message : error;
      this.$arNotification.push({
        type: 'error',
        message: serverReason,
      });
    } finally {
      commit('SET_IS_FETCHING_TASKS', false);
    }
  },
  async SYNC_STOP({ state, commit, rootState }, { oid }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    let url = `/promoter/${promoterOid}/integration/${oid}/sync-stop`;
    commit('SET_IS_FETCHING_TASKS', true);

    try {
      // @ts-ignore
      const res = await this.$axios.sg.post(url);

      if (res.status === 201) {
        commit('ADD_NEW_TASK', res.data);
        commit('SET_LATEST_TASK_STATUS', res.data.status);
      } else {
        throw Error(res.statusText);
      }
    } catch (error: any) {
      const serverReason = error.message ? error.message : error;
      this.$arNotification.push({
        type: 'error',
        message: serverReason,
      });
    } finally {
      commit('SET_IS_FETCHING_TASKS', false);
    }
  },
}

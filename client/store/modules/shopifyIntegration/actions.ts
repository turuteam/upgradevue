import { ActionTree } from 'vuex';
import { RootState } from '@/store/modules/types';
import { ShopifyIntegrationState } from './types';

export const shopifyIntegrationActions: ActionTree<ShopifyIntegrationState, RootState> = {
  async FETCH_INTEGRATION({ state, commit, rootState }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_FETCHING_INTEGRATION', true);
      let filterString = encodeURI(`app=shopify and provider=shopify`);
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
  async ADD_INTEGRATION({ state, commit, dispatch, rootState }, auth: { shopPrefix: string, accessToken: string }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    commit('SET_IS_ADDING_INTEGRATION', true);

    try {
      const syncTask = await this.$api.promoterIntegrations.shopifySimpleAuth(auth.shopPrefix, auth.accessToken);
      commit('SET_SYNC_TASK', syncTask);
      commit('SET_SYNC_STATUS', syncTask.status);
      return true;
    } catch (error: any) {
      const serviceStatus = error?.response?.status;
      const serviceMessage = error?.response?.data?.response;

      // override service messages with something more meaningful to Shopify integrations
      let customMessages: {[key: number]: string} = {
        409: `An integration already exists for the provided Shopify account`,
        // ...
      };

      this.$arNotification.push({
        type: 'error',
        message: customMessages[serviceStatus] || serviceMessage || 'An error occurred connecting to Shopify'
      });
      return false;
    } finally {
      commit('SET_IS_ADDING_INTEGRATION', false);
    }
  },
  // BORG-341 (01-2023): Replacing OAUth2 auth flow with simple access token. Leaving this here in case we need to revert to OAUth2.
  // async ADD_INTEGRATION({ state, commit, dispatch, rootState }, { shopName }) {
  //   if (!rootState.auth.account) { return null; }
  //   const { promoterOid } = rootState.auth.account;
  //   if (!shopName) return;
  //   const additionalInfo = { shopName };
  //   dispatch('CONNECT_TO_INTEGRATION', {
  //     app: 'shopify',
  //     provider: 'shopify',
  //     additionalInfo,
  //   }, { root: true });
  // },
  async DELETE_INTEGRATION({state, commit, rootState}, {oid}) {
    if (!rootState.auth.account) {
      return false;
    }
    const {promoterOid} = rootState.auth.account;
    if (!oid) {
      return false;
    }
    try {
      // @ts-ignore
      await this.$axios.sg.delete(`/promoter/${promoterOid}/integration/${oid}`);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  // BORG-341 (01-2023): Replacing OAUth2 auth flow with simple access token. Leaving this here in case we need to revert to OAUth2.
  // async RECONNECT_INTEGRATION({ state, commit, dispatch, rootState }, { oid }) {
  //   if (!rootState.auth.account) { return null; }
  //   const { promoterOid } = rootState.auth.account;
  //   if (!oid) return;
  //   if (!state.integration) return;
  //   const existingIntegration = state.integration.find( item => item.oid === oid);
  //   if (!existingIntegration) return;
  //   const shopName = existingIntegration.integration.shopName || null;
  //   if (!shopName) return;
  //   dispatch('DELETE_INTEGRATION', { oid });
  //   dispatch('ADD_INTEGRATION', { shopName });
  // },
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

  async SYNC_START({ state, commit, dispatch, rootState }, { oid }) {
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
        commit('SET_LATEST_TASK_STATUS', res.data.status);
      }
      commit('ADD_NEW_TASK', newIntegrationTask);
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

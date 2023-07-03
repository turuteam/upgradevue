import { ActionTree } from 'vuex';
import { RootState } from '@/store/modules/types';
import { FacebookMessengerIntegrationState } from '@/store/modules/facebookMessengerIntegration/types';

export const facebookMessengerIntegrationActions: ActionTree<FacebookMessengerIntegrationState, RootState> = {
  async FETCH_FACEBOOK_PAGES({ state, commit, rootState }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_FETCHING_FACEBOOK_PAGES', true);
      const params = {
        $filter: 'app=messenger AND (authorized OR paymentSubscriptionOid IS NOT NULL)',
        $top: 'all',
      };

      // @ts-ignore
      const { data } = await this.$axios.sg.get(`/promoter/${promoterOid}/integration-subscription`, {
        params,
      });

      commit('SET_FACEBOOK_PAGES', data);

      return data;
    } catch (error) {
      throw error;
    } finally {
      commit('SET_IS_FETCHING_FACEBOOK_PAGES', false);
      commit('SET_HAS_FETCHED_INITIAL_FACEBOOK_PAGES', true);
    }
  },

  async FETCH_INTEGRATION({ state, commit, rootState }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_FETCHING_INTEGRATION', true);
      let filterString = encodeURI(`app=messenger and provider=facebook`);
      // @ts-ignore
      const { data } = await this.$axios.sg.get(`/promoter/${promoterOid}/integration?$filter=${filterString}`);
      commit('SET_INTEGRATION', data[0]);
    } catch (err) {
      console.error(err);
      commit('SET_INTEGRATION', null);
    } finally {
      commit('SET_IS_FETCHING_INTEGRATION', false);
      commit('SET_HAS_FETCHED_INTEGRATION', true);
    }
  }
}

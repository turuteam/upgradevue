import { ActionTree } from 'vuex';
import { RootState } from '@/store/modules/types';
import { FacebookCAIntegrationState } from './types';

export const facebookCAIntegrationActions: ActionTree<FacebookCAIntegrationState, RootState> = {
  async FETCH_INTEGRATION({ state, commit, rootState }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_FETCHING_INTEGRATION', true);
      let filterString = encodeURI(`app=custom-audiences and provider=facebook`);
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

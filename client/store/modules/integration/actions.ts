import { ActionTree } from 'vuex'
import { RootState } from '@/store/modules/types';
import { IntegrationState } from './types';

export const integrationActions: ActionTree<IntegrationState, RootState> = {
  async FETCH_ALL_INTEGRATIONS({ rootState, commit }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    try {
      commit('SET_IS_FETCHING_INTEGRATIONS', true);
      const integrations = await this.$api.integrations.fetchAll();
      const promoterIntegrations = await this.$api.promoterIntegrations.fetchAll(promoterOid);
      commit('SET_INTEGRATIONS', integrations);
      commit('SET_PROMOTER_INTEGRATIONS', promoterIntegrations);

      return true;
    } catch (error) {
      console.error(error);

      return true;
    } finally {
      commit('SET_IS_FETCHING_INTEGRATIONS', false);
    }
  },
};

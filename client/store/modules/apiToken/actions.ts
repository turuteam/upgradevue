import { ActionTree } from 'vuex'
import { RootState } from '@/store/modules/types';
import { ApiTokenState } from './types';
import { ApiToken } from '~/api/api-tokens/types';

export const apiTokenActions: ActionTree<ApiTokenState, RootState> = {

  async FETCH_ALL_API_TOKENS({ rootState, commit }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    try {
      commit('SET_IS_FETCHING_API_TOKENS', true);
      const apiTokens = await this.$api.apiTokens.fetchAll(promoterOid);
      commit('SET_API_TOKENS', apiTokens);

      return true;
    } catch (error) {
      console.error(error);

      return true;
    } finally {
      commit('SET_IS_FETCHING_API_TOKENS', false);
    }
  },

  async ISSUE_API_TOKEN({ rootState, commit }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    try {
      const apiToken = await this.$api.apiTokens.issue(promoterOid);
      if(apiToken.oid) {
        const apiTokens = rootState.apiToken.apiTokens;
        apiTokens.push(apiToken);
        commit('SET_API_TOKENS', apiTokens);
      }
      return true;
    } catch (error) {
      console.error(error);
      return true;
    }
  },

  async REVOKE_API_TOKEN({ rootState, commit }, apiTokenOid: number) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    try {
      commit('SET_IS_FETCHING_API_TOKENS', true);
      const isApiTokenDeleted = await this.$api.apiTokens.revoke(promoterOid, apiTokenOid);
      if(isApiTokenDeleted) {
        const apiTokens = rootState.apiToken.apiTokens.filter((token: ApiToken) => {
          return token.oid !== apiTokenOid;
        });
        commit('SET_API_TOKENS', apiTokens);
      }
      return true;
    } catch (error) {
      console.error(error);

      return true;
    } finally {
      commit('SET_IS_FETCHING_API_TOKENS', false);
    }
  }
};

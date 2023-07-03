import { ActionTree } from 'vuex';
import { RootState } from '@/store/modules/types';
import { InsightState } from './types';

export const insightActions: ActionTree<InsightState, RootState> = {
  async STOP_POLLING_CURRENT_INSIGHTS({ commit, state }) {
    if (state.fetchInsightsPolling) {
      clearInterval(state.fetchInsightsPolling);
      commit('RESET_FETCH_INSIGHTS_POLLING');
      commit('SET_IS_POLLING_CURRENT_INSIGHTS', false);
    }
  },
  async START_POLLING_CURRENT_INSIGHTS({ commit, rootState, state },
    payload: { type: 'campaign' | 'event' | 'segment', oid: number },
  ) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    if (state.fetchInsightsPolling) {
      clearInterval(state.fetchInsightsPolling);
      commit('RESET_FETCH_INSIGHTS_POLLING');
    }

    commit('SET_HAS_FETCH_INSIGHTS_FAILED', false);

    const fetchInsights = async () => {
      if (payload.type === 'campaign') {
        return await this.$axios.get(`/promoter/${promoterOid}/campaign/${payload.oid}/insights`);
      } else if (payload.type === 'event') {
        return await this.$axios.get(`/promoter/${promoterOid}/event/${payload.oid}/insights`);
      } else {
        return await this.$axios.get(`/promoter/${promoterOid}/filter-group/${payload.oid}/insights`, {
          params: {
            $filter: `filterGroupOid=${payload.oid}`,
          },
        });
      }
    };

    let insight = null;
    let isFetchingInsights = false;
    commit('SET_IS_POLLING_CURRENT_INSIGHTS', true);

    /**
     * fetchInsightsPolling
     * 
     * 1. If previous fetching is still running, skip the next one
     * 2. If a new polling is detected, we drop the old one
     */
    const fetchInsightsPolling = setInterval(async () => {
      try {
        if (isFetchingInsights) {
          // Previos fetch is still running
          return;
        }
        isFetchingInsights = true;
        const response = await fetchInsights();
        if (state.fetchInsightsPolling !== fetchInsightsPolling) {
          clearInterval(fetchInsightsPolling);
          return;
        }
        if (response.status !== 202) {
          if (response.data[0]) {
            insight = response.data[0].insights;
          } else {
            insight = response.data.insights;
          }
          clearInterval(fetchInsightsPolling);
          commit('RESET_FETCH_INSIGHTS_POLLING');
          commit('SET_IS_POLLING_CURRENT_INSIGHTS', false);
          commit('SET_CURRENT_INSIGHTS', insight || null);
        }
      } catch (error) {
        console.error(error);
        this.$arNotification.push({
          type: 'error',
          message: 'Failed to load insights',
        });
        clearInterval(fetchInsightsPolling);
        commit('RESET_FETCH_INSIGHTS_POLLING');
        commit('SET_IS_POLLING_CURRENT_INSIGHTS', false);
        commit('SET_HAS_FETCH_INSIGHTS_FAILED', true);
        commit('SET_CURRENT_INSIGHTS', null);
      } finally {
        isFetchingInsights = false;
      }
    }, 2000);

    commit('SET_FETCH_INSIGHTS_POLLING', fetchInsightsPolling);
  }
};

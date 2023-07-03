import { Module } from "vuex";
import { RootState } from '@/store/modules/types';
import { clone } from '@/utils/helpers';
import { insightActions } from './actions';
import { InsightState } from './types';

export const initialInsightStates = (): InsightState => ({
  currentInsights: null,
  isPollingCurrentInsights: false,
  fetchInsightsPolling: null,
  hasFetchInsightsFailed: false,
});

const insightModule: Module<InsightState, RootState> = {
  namespaced: true,
  state: initialInsightStates,
  actions: insightActions,
  mutations: {
    RESET_CURRENT_INSIGHTS(state) {
      state.currentInsights = null;
    },
    SET_CURRENT_INSIGHTS(state, insight: Insights) {
      state.currentInsights = clone(insight);
    },
    SET_IS_POLLING_CURRENT_INSIGHTS(state, isFetching: boolean) {
      state.isPollingCurrentInsights = isFetching;
    },
    RESET_FETCH_INSIGHTS_POLLING(state) {
      state.fetchInsightsPolling = null;
    },
    SET_FETCH_INSIGHTS_POLLING(state, timeout: NodeJS.Timeout) {
      state.fetchInsightsPolling = timeout;
    },
    SET_HAS_FETCH_INSIGHTS_FAILED(state, hasFailed: boolean) {
      state.hasFetchInsightsFailed = hasFailed;
    },
  },
  getters: {
  },
};

export default insightModule;

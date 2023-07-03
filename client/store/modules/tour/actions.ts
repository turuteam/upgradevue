import { ActionTree } from 'vuex'
import { RootState } from '@/store/modules/types';
import { TourState } from './types';

export const tourActions: ActionTree<TourState, RootState> = {
  async FETCH_PROMOTER_TOURS_COUNT(
    { rootState, state, commit },
  ) {
    if (state.isFetchingPromoterToursCount) {
      return;
    }
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;


    try {
      commit('SET_IS_FETCHING_PROMOTER_TOURS_COUNT', true);
      const params = {
        $top: 0,
        $count: true,
        $filter: 'user_defined=true',
      };
      const { data } = await this.$axios.get(`/promoter/${promoterOid}/tour/`, { params });
      const promoterToursCount: number = data.count;
      // Fake fan data if useDummyData is true
      commit('SET_PROMOTER_TOURS_COUNT', promoterToursCount);
    } catch(err) {
      console.error(err);
      commit('SET_PROMOTER_TOURS_COUNT', 0);
    } finally {
      commit('SET_IS_FETCHING_PROMOTER_TOURS_COUNT', false);
    }
  },

  async FETCH_TOUR_CAMPAIGNS({ state, rootState, commit }, oids: number[]) {
    if (state.isFetchingPromoterToursCount) {
      return;
    }
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_FETCHING_TOUR_CAMPAIGNS', true);
      const campaigns = await this.$api.campaign.fetchByOids(promoterOid, oids);
      commit('SET_TOUR_CAMPAIGNS', campaigns);
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch tour campaigns',
      })
    } finally {
      commit('SET_IS_FETCHING_TOUR_CAMPAIGNS', false);
    }
  },
};

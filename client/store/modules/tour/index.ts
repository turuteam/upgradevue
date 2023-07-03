import { Module } from "vuex";
import dayjs from 'dayjs';
import { clone } from '@/utils/helpers';
import { RootState } from '@/store/modules/types';
import { Campaign } from '@/types/resources/campaign';
import { TourState } from './types';
import { tourActions } from './actions';

export const initialTourState = (): TourState => ({
  promoterToursCount: 0,
  isFetchingPromoterToursCount: false,

  // Tour Campaigns
  isFetchingTourCampaigns: false,
  tourCampaigns: [],
});


const tourModule: Module<TourState, RootState> = {
  namespaced: true,
  state: initialTourState,
  actions: tourActions,
  getters: {
    promoterHasTours(state) {
      if (state.isFetchingPromoterToursCount) {
        return false;
      }
      return state.promoterToursCount > 0;
    },
    tourCampaignsOrderedByEventStartDate(state) {
      const clonedTourCampaigns: Campaign[] = clone(state.tourCampaigns);
      clonedTourCampaigns.sort((campaignA, campaignB) => {
        if (!campaignA.event || !campaignB.event) {
          return 0;
        }
        const startDateA = dayjs(campaignA.event.startDate);
        const startDateB = dayjs(campaignB.event.startDate);
        return startDateA.isAfter(startDateB) ? 1 : -1;
      });
      return clonedTourCampaigns;
    },
  },
  mutations: {
    SET_PROMOTER_TOURS_COUNT(state, count: number) {
      state.promoterToursCount = count;
    },
    SET_IS_FETCHING_PROMOTER_TOURS_COUNT(state, isFetching: boolean) {
      state.isFetchingPromoterToursCount = isFetching;
    },
    // Tour Campaigns
    SET_IS_FETCHING_TOUR_CAMPAIGNS(state, isFetching: boolean) {
      state.isFetchingTourCampaigns = isFetching;
    },
    RESET_TOUR_CAMPAIGNS(state, campaigns: Campaign[]) {
      state.tourCampaigns = initialTourState().tourCampaigns;
    },
    SET_TOUR_CAMPAIGNS(state, campaigns: Campaign[]) {
      state.tourCampaigns = clone(campaigns);
    },
  },
};

export default tourModule;

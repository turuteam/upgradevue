import { Module } from "vuex";
import moment from 'moment';
import { RootState } from '@/store/modules/types';
import { Campaign, CampaignRegistrationStats } from '@/types/resources/campaign';
import { clone, mergeObjects } from '@/utils/helpers';
import { CampaignState } from './types';
import { campaignActions } from './actions';
import { initScratchCampaign } from './utils';
import { PromoterIntegrationTask } from '~/api/promoter-integration-task/types';

export const initialCampaignState = (): CampaignState => ({
  // Campaigns
  campaigns: [],
  totalCampaignsCount: 0,
  hasNoMoreCampaigns: false,
  isFetchingCampaigns: false,

  // Current Campaign
  currentCampaign: null,
  isFetchingCampaign: false,
  currentCampaignRegistrationStats: null,
  isFetchingCampaignRegistrationStats: false,

  // Scratch Campaign
  scratchCampaign: initScratchCampaign(),
  isUpdatingCampaign: false,
  isCreatingCampaign: false,
});

const campaignModule: Module<CampaignState, RootState> = {
  namespaced: true,
  actions: campaignActions,
  state: initialCampaignState,
  mutations: {
    // Current Campaign
    RESET_CURRENT_CAMPAIGN(state) {
      state.currentCampaign = null;
      state.currentCampaignRegistrationStats = null;
    },
    SET_CURRENT_CAMPAIGN(state, campaign: Campaign) {
      state.currentCampaign = clone(campaign);
    },
    SET_IS_FETCHING_CAMPAIGN(state, isFetching: boolean) {
      state.isFetchingCampaign = isFetching;
    },
    SET_CURRENT_CAMPAIGN_REGISTRATION_STATS(state, registrationStats: CampaignRegistrationStats) {
      state.currentCampaignRegistrationStats = registrationStats;
    },
    SET_IS_FETCHING_CAMPAIGN_REGISTRATION_STATS(state, isFetching: boolean) {
      state.isFetchingCampaignRegistrationStats = isFetching;
    },
    // Scratch Campaign
    RESET_SCRATCH_CAMPAIGN(state) {
      state.scratchCampaign = initScratchCampaign();
    },
    SET_SCRATCH_CAMPAIGN(state, campaign: Campaign) {
      state.scratchCampaign = clone(campaign);
    },
    SET_IS_UPDATING_CAMPAIGN(state, isUpdating: boolean) {
      state.isUpdatingCampaign = isUpdating;
    },
    SET_IS_CREATING_CAMPAIGN(state, isCreating: boolean) {
      state.isCreatingCampaign = isCreating;
    },
    // Campaigns
    SET_CAMPAIGNS(state, campaigns: Campaign[]) {
      state.campaigns = campaigns;
    },
    CONCAT_CAMPAIGNS(state, campaigns: Campaign[]) {
      state.campaigns = clone(state.campaigns.concat(campaigns));
    },
    RESET_CAMPAIGNS(state) {
      state.campaigns = [];
    },
    SET_IS_FETCHING_CAMPAIGNS(state, isFetching: boolean) {
      state.isFetchingCampaigns = isFetching;
    },
  },
  getters: {
    currentCampaignIsActive(state) {
      if (!state.currentCampaign) {
        return false;
      }
      return moment(state.currentCampaign.endDate).isAfter(new Date());
    },
    currentCampaignFirstFbPageId(state): string | null {
      if (!state.currentCampaign) {
        return null;
      }
      if (!state.currentCampaign.socialActions?.socialAccounts) {
        return null;
      }
      const facebookAccount = state.currentCampaign.socialActions.socialAccounts.find(item => {
        const keys = Object.keys(item);
        if (keys.indexOf('facebook:messenger') > -1) return item;
      });
      if (!facebookAccount) {
        return null;
      }

      const messengerAction = facebookAccount.actions.find(action => action.key === 'facebook:messenger');
      return messengerAction ? messengerAction.value : null;
    },
    campaignsList(state) {
      return state.campaigns
    },
  },
};

export default campaignModule;

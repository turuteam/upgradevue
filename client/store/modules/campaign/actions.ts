import { ActionTree } from 'vuex';
import { RootState } from '@/store/modules/types';
import { CampaignState } from './types';
import { normaliseCampaignData } from '@/utils/normaliseData';
import { defaultSelectFields } from '@/api/campaigns';

export const campaignActions: ActionTree<CampaignState, RootState> = {
  async FETCH_CURRENT_CAMPAIGN({ rootState, commit }, oid: number) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_FETCHING_CAMPAIGN', true);
      const data = await this.$api.campaign.get(
        promoterOid, 
        oid,
        'name,type,messageListOid,notifyDate,startDate,endDate,timeZone,urlSlug,eventOid,event,rewards,presentation,resources,resourceOids,registrations,settings,socialActions,defaults,subscriptionLevel',
      );

      let normalisedData = await normaliseCampaignData(data)
      commit('SET_CURRENT_CAMPAIGN', normalisedData)
      
      return true;
    } catch (error) {
      console.error(error);

      // @ts-ignore
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch campaign',
      });
      return false;
    } finally {
      commit('SET_IS_FETCHING_CAMPAIGN', false);
    }
  },

  async FETCH_CAMPAIGN_REGISTRATION_STATS({ rootState, commit }, oid: number) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    if(isNaN(oid)) {
      console.error('FETCH_CAMPAIGN_REGISTRATIONS called with NaN campaignOid');
      return;
    }

    try {
      commit('SET_IS_FETCHING_CAMPAIGN_REGISTRATION_STATS', true);
      const data = await this.$api.campaign.fetchCampaignRegistrationStats(promoterOid, oid);
      commit('SET_CURRENT_CAMPAIGN_REGISTRATION_STATS', data);
    } catch(error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch campaign registrations',
      });
    } finally {
      commit('SET_IS_FETCHING_CAMPAIGN_REGISTRATION_STATS', false);
    }
  },

  async FETCH_MORE_CAMPAIGNS(
    { state, commit, rootState },
    {
      top = 12,
      skip = 0,
      searchString = '',
      select = defaultSelectFields,
      reload = false,
    }
  ) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_FETCHING_CAMPAIGNS', true);
      const data = await this.$api.campaign.search(promoterOid, {
        top,
        skip,
        searchString,
        select
      });

      if (reload) {
        commit('SET_CAMPAIGNS', data);
      } else {
        commit('CONCAT_CAMPAIGNS', data);
      }
    } catch(error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch campaigns',
      });
    } finally {
      commit('SET_IS_FETCHING_CAMPAIGNS', false);
    }
  },

  async SET_CAMPAIGN_CUSTOM_FIELDS({ rootState, commit }, { oid, action, customFieldData }) {
    if (!rootState.auth.account) { return null; }
    if(isNaN(oid)) {
      console.error('SET_CAMPAIGN_CUSTOM_FIELDS called with NaN campaignOid');
      return;
    }

    try {
      const data = await this.$api.campaign.setCustomFields(oid, action, customFieldData);
      return data
    } catch(error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to set campaign custom fields',
      });
    }
  },
};

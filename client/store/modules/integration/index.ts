import { Module } from "vuex";
import { RootState } from '@/store/modules/types';
import { clone } from '@/utils/helpers/';
import { IntegrationState } from './types';
import { integrationActions } from './actions';
import { Integration } from '@/api/integrations/types';
import { PromoterIntegration } from '@/api/promoter-integrations/types';
import { findPromoterIntegrations, integrationKey } from './utils';

export const initialIntegrationState = (): IntegrationState => ({
  integrations: [],
  promoterIntegrations: [],
  isFetchingIntegrations: false,
});

const integrationModule: Module<IntegrationState, RootState> = {
  namespaced: true,
  state: initialIntegrationState,
  actions: integrationActions,
  mutations: {
    SET_INTEGRATIONS(state, integrations: Integration[]) {
      state.integrations = clone(integrations);
    },
    SET_PROMOTER_INTEGRATIONS(state, promoterIntegrations: PromoterIntegration[]) {
      state.promoterIntegrations = clone(promoterIntegrations);
    },
    RESET_INTEGRATIONS(state) {
      state.integrations = initialIntegrationState().integrations;
      state.promoterIntegrations = initialIntegrationState().promoterIntegrations;
    },
    SET_IS_FETCHING_INTEGRATIONS(state, isFetching: boolean) {
      state.isFetchingIntegrations = isFetching;
    },
  },
  getters: {

    // returns all promoter integrations that match the provider and app
    findPromoterIntegrations: (state) => (provider: string, app: string) => {
      return findPromoterIntegrations(state.promoterIntegrations, provider, app);
    },

    // returns the first promoter integration that matches the provider and app or null
    firstPromoterIntegration: (state) => (provider: string, app: string) => {
      return findPromoterIntegrations(state.promoterIntegrations, provider, app)[0] || null;
    },

    // checks if the promoter integrations list has an integration of the given provider and app
    hasPromoterIntegration: (state) => (provider: string, app: string) => {
      return findPromoterIntegrations(state.promoterIntegrations, provider, app).length > 0;
    },

    findIntegrationByKey: (state) => (key: string): Integration => {
      return state.integrations.find(integration => integrationKey(integration) === key);
    }
  },
};

export default integrationModule;

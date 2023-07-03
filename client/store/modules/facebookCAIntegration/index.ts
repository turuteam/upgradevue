import { FacebookCAIntegrationState } from './types';
import { Module } from 'vuex';
import { RootState } from '@/store/modules/types';
import { facebookCAIntegrationActions } from './actions';

export const initialFacebookCAIntegrationState = (): FacebookCAIntegrationState => ({
  integration: null,
  isFetchingIntegration: false,
  hasFetchedIntegration: false,
});

const facebookCAIntegrationModule: Module<FacebookCAIntegrationState, RootState> = {
  namespaced: true,
  state: initialFacebookCAIntegrationState,
  actions: facebookCAIntegrationActions,
  mutations: {
    RESET_INTEGRATION(state) {
      state.integration = null;
      state.isFetchingIntegration = false;
      state.hasFetchedIntegration = false;
    },
    SET_INTEGRATION(state, integration: any) {
      state.integration = integration;
    },
    SET_IS_FETCHING_INTEGRATION(state, isFetching: boolean) {
      state.isFetchingIntegration = isFetching;
    },
    SET_HAS_FETCHED_INTEGRATION(state, hasFetched: boolean) {
      state.hasFetchedIntegration = hasFetched;
    }
  },
  getters: {
    integrationDisconnected(state) {
      if (state.isFetchingIntegration) return false;
      if (!state.hasFetchedIntegration) return false;
      if (!!state.integration) return false;
      return true;
    }
  },
}

export default facebookCAIntegrationModule;

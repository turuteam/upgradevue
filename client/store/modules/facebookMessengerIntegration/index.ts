import { Module } from "vuex";
import { RootState } from '@/store/modules/types';
import { FacebookMessengerIntegrationState } from './types';
import { facebookMessengerIntegrationActions } from './actions';
import { clone } from '@/utils/helpers';

export const initialFacebookMessengerIntegrationState = (): FacebookMessengerIntegrationState => ({
  isFetchingFacebookPages: false,
  hasFetchedInitialFacebookPages: false,
  facebookPages: [],
  integration: null,
  isFetchingIntegration: false,
  hasFetchedIntegration: false,
});

const facebookMessengerIntegrationModule: Module<FacebookMessengerIntegrationState, RootState> = {
  namespaced: true,
  state: initialFacebookMessengerIntegrationState,
  actions: facebookMessengerIntegrationActions,
  mutations: {
    RESET_FACEBOOK_PAGES(state) {
      state.isFetchingFacebookPages = false;
      state.hasFetchedInitialFacebookPages = false;
      state.facebookPages = [];
    },
    SET_IS_FETCHING_FACEBOOK_PAGES(state, isFetching: boolean) {
      state.isFetchingFacebookPages = isFetching
    },
    SET_HAS_FETCHED_INITIAL_FACEBOOK_PAGES(state, hasFetched: boolean) {
      state.hasFetchedInitialFacebookPages = hasFetched
    },
    SET_FACEBOOK_PAGES(state, pages: FacebookPage[]) {
      state.facebookPages = clone(pages);
    },

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
};

export default facebookMessengerIntegrationModule;

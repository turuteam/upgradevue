import { Module } from "vuex";
import { RootState } from '@/store/modules/types';
import { clone } from '@/utils/helpers/';
import { ApiTokenState } from './types';
import { apiTokenActions } from './actions';
import { ApiToken } from '~/api/api-tokens/types';

export const initialApiTokenState = (): ApiTokenState => ({
  apiTokens: [],
  isFetchingApiTokens: false,
  isTokenBeingDeleted: false
});

const apiTokenModule: Module<ApiTokenState, RootState> = {
  namespaced: true,
  state: initialApiTokenState,
  actions: apiTokenActions,
  mutations: {
    SET_API_TOKENS(state, apiTokens: ApiToken[]) {
      state.apiTokens = clone(apiTokens);
    },
    RESET_API_TOKENS(state) {
      state.apiTokens = initialApiTokenState().apiTokens;
    },
    SET_IS_FETCHING_API_TOKENS(state, isFetching: boolean) {
      state.isFetchingApiTokens = isFetching;
    }
  }
};

export default apiTokenModule;
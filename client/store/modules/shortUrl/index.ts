import { Module } from "vuex";
import { RootState } from '@/store/modules/types';
import { clone } from '@/utils/helpers/';
import { ShortUrlsState } from './types';
import { shortUrlsActions } from './actions';

export const initialShortUrlsState = (): ShortUrlsState => ({
  shortUrls: [],
  isFetchingShortUrls: false,
});

const shortUrlsModule: Module<ShortUrlsState, RootState> = {
  namespaced: true,
  state: initialShortUrlsState,
  actions: shortUrlsActions,
  mutations: {
    SET_SHORT_URLS(state, urls) {
      state.shortUrls = clone(urls);
    },
    SET_IS_FETCHING_SHORT_URLS(state, isFetching: boolean) {
      state.isFetchingShortUrls = isFetching;
    },
  },
  getters: {},
}

export default shortUrlsModule;
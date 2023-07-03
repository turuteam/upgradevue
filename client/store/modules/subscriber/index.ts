import { Module } from "vuex";
import { RootState } from '@/store/modules/types';
import { clone, mergeObjects } from '@/utils/helpers/';
import { SubscriberState } from './types';
import { subscriberActions } from './actions';

export const initialSubscriberState = (): SubscriberState => ({
  // Subscribers
  subscribers: [],
  totalSubscribersCount: 0,
  isFetchingSubscribers: false,
  isFetchingTotalSubscribersCount: false,
  isNoMoreSubscribers: false,
  hasFetchSubscribersFailed: false,
  // Export Subscribers
  isExportingListSubscribers: false,
});

const subscriberModule: Module<SubscriberState, RootState> = {
  namespaced: true,
  state: initialSubscriberState,
  actions: subscriberActions,
  mutations: {
    // Subscribers
    RESET_SUBSCRIBERS(state) {
      state.subscribers = [];
      state.totalSubscribersCount = 0;
      state.isNoMoreSubscribers = false;
      state.hasFetchSubscribersFailed = false;
    },
    SET_SUBSCRIBERS(state, subscribers: Subscriber[]) {
      state.subscribers = clone(subscribers);
    },
    CONCAT_SUBSCRIBERS(state, subscribers: Subscriber[]) {
      state.subscribers = clone(state.subscribers.concat(subscribers));
    },
    SET_TOTAL_SUBSCRIBERS_COUNT(state, count: number) {
      state.totalSubscribersCount = count;
    },
    SET_IS_FETCHING_SUBSCRIBERS(state, isFetching: boolean) {
      state.isFetchingSubscribers = isFetching;
    },
    SET_IS_NO_MORE_SUBSCRIBERS(state, isNoMore: boolean) {
      state.isNoMoreSubscribers = isNoMore;
    },
    SET_HAS_FETCH_SUBSCRIBERS_FAILED(state, hasFailed: boolean) {
      state.hasFetchSubscribersFailed = hasFailed;
    },
    // Export Subscribers
    SET_IS_EXPORTING_LIST_SUBSCRIBERS(state, isExporting: boolean) {
      state.isExportingListSubscribers = isExporting;
    },
    SET_IS_FETCHING_TOTAL_SUBSCRIBERS_COUNT(state, isFetching: boolean) {
      state.isFetchingTotalSubscribersCount = isFetching;
    },
  },
  getters: {},
};

export default subscriberModule;

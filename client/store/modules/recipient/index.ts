import { Module } from "vuex";
import { RootState } from '@/store/modules/types';
import { clone, mergeObjects } from '@/utils/helpers/';
import { RecipientState } from './types';
import { recipientActions } from './actions';

export const initialRecipientState = (): RecipientState => ({
  // Recipients
  recipients: [],
  totalRecipientsCount: 0,
  isFetchingRecipients: false,
  isFetchingTotalRecipientsCount: false,
  isNoMoreRecipients: false,
  hasFetchRecipientsFailed: false,
  // Export Recipients
  isExportingListRecipients: false,
});

const recipientModule: Module<RecipientState, RootState> = {
  namespaced: true,
  state: initialRecipientState,
  actions: recipientActions,
  mutations: {
    RESET_RECIPIENTS(state) {
      let initState = initialRecipientState()
      state.recipients = initState.recipients;
      state.totalRecipientsCount = initState.totalRecipientsCount;
      state.isNoMoreRecipients = initState.isNoMoreRecipients;
      state.hasFetchRecipientsFailed = initState.hasFetchRecipientsFailed;
    },
    SET_RECIPIENTS(state, recipients: Recipient[]) {
      state.recipients = clone(recipients);
    },
    CONCAT_RECIPIENTS(state, recipients: Recipient[]) {
      state.recipients = clone(state.recipients.concat(recipients));
    },
    SET_TOTAL_RECIPIENTS_COUNT(state, count: number) {
      state.totalRecipientsCount = count;
    },
    SET_IS_FETCHING_RECIPIENTS(state, isFetching: boolean) {
      state.isFetchingRecipients = isFetching;
    },
    SET_IS_FETCHING_TOTAL_RECIPIENTS_COUNT(state, isFetching: boolean) {
      state.isFetchingTotalRecipientsCount = isFetching;
    },
    SET_IS_NO_MORE_RECIPIENTS(state, isNoMore: boolean) {
      state.isNoMoreRecipients = isNoMore;
    },
    SET_HAS_FETCH_RECIPIENTS_FAILED(state, hasFailed: boolean) {
      state.hasFetchRecipientsFailed = hasFailed;
    },
    // Export Subscribers
    SET_IS_EXPORTING_LIST_RECIPIENTS(state, isExporting: boolean) {
      state.isExportingListRecipients = isExporting;
    },
  },
  getters: {},
};

export default recipientModule;

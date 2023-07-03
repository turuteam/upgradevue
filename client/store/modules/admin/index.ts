import { Module } from "vuex";
import { RootState } from '@/store/modules/types';
import { AdminState } from '@/store/modules/admin/types';
import { adminActions} from '@/store/modules/admin/actions';
import { clone } from '@/utils/helpers';

export const initialAdminState = (): AdminState => ({
  // PromoterAccounts
  promoterAccounts: [],
  masqueraderPromoterAccounts: [],
  promoterAccountOwner: null,

  // Message tasks
  fanMessageTasks: [],
  isFetchingFanMessageTasks: false,
  noMoreFanMessageTasks: false,
  hasFailedFetchingFanMessageTasks: false,

  adminStats: {
    scheduledMessageCount: 0,
    sendingMessageCount: 0,
    failedMessageCount: 0,
  },
  isFetchingAdminStats: false,

});

const adminModule: Module<AdminState, RootState> = {
  namespaced: true,
  state: initialAdminState,
  actions: adminActions,
  mutations: {
    // Promtoer Accounts
    SET_PROMOTER_ACCOUNTS(state, promoterAccounts: PromoterAccount[]) {
      state.promoterAccounts = clone(promoterAccounts);
    },
    RESET_MASQUERADER_PROMOTER_ACCOUNTS(state) {
      state.masqueraderPromoterAccounts = [];
    },
    SET_MASQUERADER_PROMOTER_ACCOUNTS(state, promoterAccounts: PromoterAccount[]) {
      state.masqueraderPromoterAccounts = clone(promoterAccounts);
    },
    ADD_TO_MASQUERADER_PROMOTER_ACCOUNTS(state, promoterAccount: PromoterAccount) {
      state.masqueraderPromoterAccounts = clone(state.masqueraderPromoterAccounts.concat([promoterAccount]));
    },
    REMOVE_FROM_MASQUERADER_PROMOTER_ACCOUNTS(state, oid: number) {
      state.masqueraderPromoterAccounts =
        clone(state.masqueraderPromoterAccounts.filter(account => account.oid !== oid));
    },
    RESET_PROMOTER_ACCOUNT_OWNER(state) {
      state.promoterAccountOwner = null;
    },
    SET_PROMOTER_ACCOUNT_OWNER(state, promoterAccount: PromoterAccount) {
      state.promoterAccountOwner = clone(promoterAccount);
    },

    // Message Tasks
    RESET_ADMIN(state) {
      state = initialAdminState();
    },
    RESET_ADMIN_FAN_MESSAGES(state) {
      state.fanMessageTasks = [];
      state.adminStats = {
        scheduledMessageCount: 0,
        sendingMessageCount: 0,
        failedMessageCount: 0,
      };
      state.isFetchingFanMessageTasks = false;
      state.noMoreFanMessageTasks = false;
      state.hasFailedFetchingFanMessageTasks = false;
    },
    SET_IS_FETCHING_ADMIN_FAN_MESSAGE_TASKS(state, isFetching: boolean) {
      state.isFetchingFanMessageTasks = isFetching;
    },
    SET_NO_MORE_ADMIN_FAN_MESSAGE_TASKS(state, noMore: boolean) {
      state.noMoreFanMessageTasks = noMore;
    },
    SET_HAS_FAILED_FETCHING_ADMIN_FAN_MESSAGE_TASKS(state, isFetching: boolean) {
      state.hasFailedFetchingFanMessageTasks = isFetching;
    },
    REMOVE_MESSAGE_FROM_ADMIN_FAN_MESSAGE_TASKS(state, messageOid: number) {
      state.fanMessageTasks = clone(state.fanMessageTasks.filter((msg:Message) => msg.oid !== messageOid));
    },
    SET_ADMIN_FAN_MESSAGE_TASKS(state, tasks: Message[]) {
      state.fanMessageTasks = tasks;
    },
    CONCAT_ADMIN_FAN_MESSAGE_TASKS(state, tasks: Message[]) {
      state.fanMessageTasks = clone(state.fanMessageTasks.concat(tasks))
    },


    SET_TOTAL_ADMIN_STATS(state, stats: {
      scheduledMessageCount: number;
      sendingMessageCount: number;
      failedMessageCount: number;
    }) {
      state.adminStats = stats;
    },
    SET_IS_FETCHING_ADMIN_STATS(state, isFetching: boolean) {
      state.isFetchingAdminStats = isFetching;
    },

  },
}

export default adminModule;

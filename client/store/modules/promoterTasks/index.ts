import { Module } from "vuex";
import { RootState } from '@/store/modules/types';
import { clone } from '@/utils/helpers';
import { promoterTasksActions } from './actions';
import { PromoterTasksState } from './types';
import { PromoterIntegrationTask } from '@/api/promoter-integration-task/types';
import { formatTask, pendingTaskOfTypeAndResourceAndOid, pendingTasksOfResourceAndOid } from './utils';

export const initialPromoterTasksState = (): PromoterTasksState => ({
  pendingTasks: [],
  completedTasks: [],
  isFetchingTasks: false,
  interval: null,
  isFirstLoadCompletedTasksFinished: false,
});

const promoterTasksModule: Module<PromoterTasksState, RootState> = {
  namespaced: true,
  state: initialPromoterTasksState,
  actions: promoterTasksActions,
  mutations: {
    RESET(state) {
      if (state.interval) clearInterval(state.interval);
      state.interval = null;
      state.pendingTasks = [];
      state.isFetchingTasks = false;
    },
    SET_PENDING_TASKS(state, tasks: PromoterIntegrationTask[]) {
      state.pendingTasks = clone(tasks);
    },
    CONCAT_PENDING_TASKS(state, tasks:PromoterIntegrationTask[]) {
      state.pendingTasks = clone(state.pendingTasks.concat(tasks));
    },
    SET_INTERVAL(state, options:{callbackFunction: Function, timeout: number}) {
      if (state.interval) clearInterval(state.interval);
      state.interval = setInterval(() => options.callbackFunction(), options.timeout);
    },
    CLEAR_INTERVAL(state) {
      if (state.interval) clearInterval(state.interval);
      state.interval = null;
    },
    SET_IS_FETCHING_TASKS(state, isFetching: boolean) {
      state.isFetchingTasks = isFetching;
    },

    SET_COMPLETED_TASKS(state, tasks: PromoterIntegrationTask[]) {
      state.completedTasks = clone(tasks);
    },
    SET_FIRST_LOAD_COMPLETED_TASKS(state, value: boolean) {
      state.isFirstLoadCompletedTasksFinished = value;
    }
  },
  getters: {
    // -----------------
    // Generic/Audience Page
    hasPendingTasks(state) {
      return state.pendingTasks.length > 0;
    },
    pendingImportTasks(state) {
      return state.pendingTasks.length > 0 &&
        state.pendingTasks.filter( item => item.name?.includes('background'));
    },
    pendingMassEditTasks(state) {
      return state.pendingTasks.length > 0 &&
        state.pendingTasks.filter( item => item.name === 'mass-edit-fan-attributes');
    },
    pendingExportTasks(state) {
      return state.pendingTasks.length > 0 &&
        state.pendingTasks.filter( item => item.name === 'audience-filter-fan-export-csv');
    },
    pendingTagTasks(state) {
      return state.pendingTasks.length > 0 &&
        state.pendingTasks.filter( item => item.name === 'mass-edit-tags');
    },
    pendingMessageListMassEditsTasks(state) {
      return state.pendingTasks.length > 0 &&
        state.pendingTasks.filter( item => item.name === 'mass-edit-message-list');
    },
    pendingFanDeleteTasks(state) {
      return state.pendingTasks.length > 0 &&
        state.pendingTasks.filter( item => item.name === 'mass-delete-fans');
    },

    // -----------------
    // Event
    pendingTasksForEvent(state) {
      return (eventOid: number) => {
        return pendingTasksOfResourceAndOid(state.pendingTasks, 'eventOid', eventOid);
      };
    },
    pendingImportTasksForEvent(state) {
      return (eventOid: number) => {
        return pendingTaskOfTypeAndResourceAndOid(state.pendingTasks, 'background-fan-import-csv', 'eventOid', eventOid);
      };
    },
    pendingExportTasksForEvent(state) {
      return (eventOid: number) => {
        return pendingTaskOfTypeAndResourceAndOid(state.pendingTasks, 'audience-filter-fan-export-csv', 'eventOid', eventOid);
      };
    },
    pendingDeletePosOrderTasksForEvent(state) {
      return (eventOid: number) => {
        return pendingTaskOfTypeAndResourceAndOid(state.pendingTasks, 'delete-event-pos-orders', 'eventOid', eventOid);
      };
    },
    pendingDeleteEventTicketSalesTasksForEvent(state) {
      return (eventOid: number) => {
        return pendingTaskOfTypeAndResourceAndOid(state.pendingTasks, 'delete-event-ticket-sales', 'eventOid', eventOid);
      };
    },

    // -----------------
    // Campaign
    pendingTasksForCampaign(state) {
      return (campaignOid: number) => {
        return pendingTasksOfResourceAndOid(state.pendingTasks, 'campaignOid', campaignOid);
      };
    },
    pendingExportTasksForCampaign(state) {
      return (campaignOid: number) => {
        return pendingTaskOfTypeAndResourceAndOid(state.pendingTasks, 'audience-filter-fan-export-csv', 'campaignOid', campaignOid);
      };
    },

    // -----------------
    // Message List
    pendingMessageListExportTasks(state) {
      return state.pendingTasks.length > 0 &&
        state.pendingTasks.filter( item => item.name === 'message-list-oid-fan-export-csv');
    },
    pendingTasksForList(state) {
      return (messageListOid: number) => {
        return pendingTasksOfResourceAndOid(state.pendingTasks, 'messageListOid', messageListOid);
      };
    },
    pendingExportTasksForMessageList(state) {
      return (messageListOid: number) => {
        return pendingTaskOfTypeAndResourceAndOid(state.pendingTasks, 'message-list-oid-fan-export-csv', 'messageListOid', messageListOid);
      };
    },
    pendingMassEditTasksForMessageList(state) {
      return (messageListOid: number) => {
        return pendingTaskOfTypeAndResourceAndOid(state.pendingTasks, 'mass-edit-message-list', 'messageListOid', messageListOid);
      };
    },
    pendingCsvImportTasksForMessageList(state) {
      return (messageListOid: number) => {
        return pendingTaskOfTypeAndResourceAndOid(state.pendingTasks, 'background-fan-import-csv', 'messageListOid', messageListOid);
      };
    },

    // -----------------
    // Other
    formattedTasks(state) {
      return state.pendingTasks.filter(task => !!task).map(task => formatTask(task)).filter(task => task !== null);
    },

    formattedCompletedTasks(state) {
      return state.completedTasks.filter(task => !!task).map(task => formatTask(task)).filter(task => task !== null);
    },
  },
}

export default promoterTasksModule;

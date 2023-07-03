import { TicketekIntegrationState } from './types';
import { Module } from 'vuex';
import { RootState } from '@/store/modules/types';
import { ticketekIntegrationActions } from './actions';
import { clone } from '@/utils/helpers';

export const initialTicketekIntegrationState = (): TicketekIntegrationState => ({
  integration: null,
  isFetchingIntegration: false,
  isCreatingIntegration: false,
  isAddingIntegration: false,
  isDeletingIntegration: false,
  isFetchingSyncTask: false,
  syncTask: null,
  syncStatus: null,
});

const ticketekIntegrationModule: Module<TicketekIntegrationState, RootState> = {
  namespaced: true,
  state: initialTicketekIntegrationState,
  actions: ticketekIntegrationActions,
  mutations: {
    RESET_INTEGRATION(state) {
      state.integration = null;
      state.isFetchingIntegration = false;
      state.isAddingIntegration = false;
      state.isDeletingIntegration = false;
    },
    SET_INTEGRATION(state, integration: any) { // TODO - Fix type
      state.integration = integration;
    },
    REMOVE_FROM_INTEGRATION(state, oid: number) {
      if (!state.integration) {
        return;
      }
      state.integration = clone(state.integration.filter(item => item.oid !== oid));
    },
    SET_IS_FETCHING_INTEGRATION(state, isFetching: boolean) {
      state.isFetchingIntegration = isFetching;
    },
    SET_IS_CREATING_INTEGRATION(state, isCreating: boolean) {
      state.isCreatingIntegration = isCreating;
    },
    SET_IS_ADDING_INTEGRATION(state, isAdding: boolean) {
      state.isAddingIntegration = isAdding;
    },
    SET_IS_DELETING_INTEGRATION(state, isDeleting: boolean) {
      state.isDeletingIntegration = isDeleting;
    },
    SET_IS_FETCHING_SYNC_TASK(state, isFetching: boolean) {
      state.isFetchingSyncTask = isFetching;
    },
    SET_SYNC_TASK(state, task: any) { // TODO - Fix type
      state.syncTask = task;
    },
    SET_SYNC_STATUS(state, status: any) { // TODO - Fix type
      state.syncStatus = status;
    },
  },
  getters: {
    integrationDisconnected(state) {
      if (state.isFetchingIntegration) return false;
      if (!state.integration) return true;
      if (state.integration.length > 0) return false;
      return true;
    },
  },
}

export default ticketekIntegrationModule;

import { MemberfulIntegrationState } from './types';
import { Module } from 'vuex';
import { RootState } from '@/store/modules/types';
import { memberfulIntegrationActions } from './actions';
import { clone } from '@/utils/helpers';
import { MemberfulIntegration } from '@/api/promoter-integrations/types';

export const initialMemberfulIntegrationState = (): MemberfulIntegrationState => ({
  integration: null,
  isFetchingIntegration: false,
  isCreatingIntegration: false,
  isDeletingIntegration: false,
  isReconnectingIntegration: false,
  isFetchingSyncTask: false,
  syncTask: null,
  syncStatus: null,
});

const memberfulIntegrationModule: Module<MemberfulIntegrationState, RootState> = {
  namespaced: true,
  state: initialMemberfulIntegrationState,
  actions: memberfulIntegrationActions,
  mutations: {
    RESET_INTEGRATION(state) {
      state.integration = null;
      state.isFetchingIntegration = false;
      state.isDeletingIntegration = false;
      state.isReconnectingIntegration = false;
      state.isFetchingSyncTask = false;
      state.syncTask = null;
      state.syncStatus = null;
    },
    SET_INTEGRATION(state, integration: MemberfulIntegration[]) {
      state.integration = clone(integration);
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
    SET_IS_DELETING_INTEGRATION(state, isDeleting: boolean) {
      state.isDeletingIntegration = isDeleting;
    },
    SET_IS_RECONNECTING_INTEGRATION(state, isReconnecting: boolean) {
      state.isReconnectingIntegration = isReconnecting;
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

export default memberfulIntegrationModule;

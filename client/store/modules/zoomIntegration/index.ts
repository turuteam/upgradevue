import { ZoomIntegrationState } from './types';
import { Module } from 'vuex';
import { RootState } from '@/store/modules/types';
import { zoomIntegrationActions } from './actions';
import { clone } from '@/utils/helpers';

export const initialZoomIntegrationState = (): ZoomIntegrationState => ({
  integration: null,
  isFetchingIntegration: false,
  hasFetchedIntegration: false,
  isAddingIntegration: false,
  isDeletingIntegration: false,
  isReconnectingIntegration: false,
  isFetchingTasks: false,
  tasks: null,
  latestTaskStatus: null,
});

const zoomIntegrationModule: Module<ZoomIntegrationState, RootState> = {
  namespaced: true,
  state: initialZoomIntegrationState,
  actions: zoomIntegrationActions,
  mutations: {
    RESET_INTEGRATION(state) {
      state.integration = null;
      state.isFetchingIntegration = false;
      state.hasFetchedIntegration = false;
      state.isAddingIntegration = false;
      state.isDeletingIntegration = false;
      state.isReconnectingIntegration = false;
      state.isFetchingTasks = false;
      state.tasks = null;
      state.latestTaskStatus = null;
    },
    SET_INTEGRATION(state, integration: any) { // TODO - Fix type
      state.integration = integration;
    },
    SET_IS_FETCHING_INTEGRATION(state, isFetching: boolean) {
      state.isFetchingIntegration = isFetching;
    },
    SET_HAS_FETCHED_INTEGRATION(state, hasFetched: boolean) {
      state.hasFetchedIntegration = hasFetched;
    },
    SET_IS_ADDING_INTEGRATION(state, isAdding: boolean) {
      state.isAddingIntegration = isAdding;
    },
    SET_IS_DELETING_INTEGRATION(state, isDeleting: boolean) {
      state.isDeletingIntegration = isDeleting;
    },
    SET_IS_RECONNECTING_INTEGRATION(state, isReconnecting: boolean) {
      state.isReconnectingIntegration = isReconnecting;
    },
    SET_IS_FETCHING_TASKS(state, isFetching: boolean) {
      state.isFetchingTasks = isFetching;
    },
    ADD_NEW_TASK(state, task: any) { // TODO - Fix type
      state.tasks = clone(state.tasks).unshift(clone(task));
    },
    SET_TASKS(state, tasks: any[]) { // TODO - Fix type
      state.tasks = tasks;
    },
    SET_LATEST_TASK_STATUS(state, status: any) { // TODO - Fix type
      state.latestTaskStatus = status;
    },
  },
  getters: {
    integrationDisconnected(state) {
      if (state.isFetchingIntegration) return false;
      if (!state.hasFetchedIntegration) return false;
      if (!state.integration) return true;
      if (state.integration.length > 0) return false;
      return true;
    },
  },
}

export default zoomIntegrationModule;

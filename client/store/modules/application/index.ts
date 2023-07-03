import { Module } from "vuex";
import { ApplicationState } from './types';
import { RootState } from '@/store/modules/types';
import { clone } from '~/utils/helpers';

export const initialApplicationState = (): ApplicationState => ({
  applicationTime: 0,
  history: {page: "", prev: null}
});

const applicationModule: Module<ApplicationState, RootState> = {
  namespaced: true,
  state: initialApplicationState,
  mutations: {
    SET_APPLICATION_TIME(state, newApplicationTime: number) {
      state.applicationTime = newApplicationTime;
    },
    // Replaces history with a new ApplicationHistory object, placing the old object into 'prev'
    HISTORY_ADD(state, page: string) {
      const cloneHistory = clone(state.history);
      state.history = {
        page,
        prev: cloneHistory
      };
    },
    // We can call reset to clear up memory if the current page does not require a history of items (eg Audience page).
    // Can pass in maybePage to define the current route.
    HISTORY_RESET(state, maybePage:string | undefined) {
      state.history = {page: maybePage || "", prev: null}
    },
    // Replaces history with the value of history.prev, or the default ApplicationHistory object
    HISTORY_POP_LAST(state) {
      const cloneHistory = clone(state.history);
      state.history = cloneHistory?.prev ? cloneHistory.prev : {page: "", prev: null};
    }
  },
  getters: {
    // Fetch the previous page path stored in application history, falling back to fallbackPath
    historicalPreviousPagePath(state) {
      return (fallbackPath: string) => {
        return state.history.prev?.page || fallbackPath;
      }
    },
    // Fetch the current page path stored in application history, falling back to fallbackPath. Some pages do not get added
    // to history (eg edit/create pages), so we want to fetch the canonically 'current' page when navigating back.
    historicalCurrentPagePath(state) {
      return (fallbackPath: string) => {
        return state.history.page || fallbackPath;
      }
    }
  }
};

export default applicationModule;

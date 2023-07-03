import { ActionTree } from 'vuex';
import { RootState } from '@/store/modules/types';
import { PromoterTasksState } from './types';
import dayjs from 'dayjs';

export const promoterTasksActions: ActionTree<PromoterTasksState, RootState> = {
  async START_POLLING_PENDING_TASKS({ state, rootState, commit, dispatch }, {
    reload = true,
    types = [],
    setIntervalIfTasksFound = true,
  }) {
    if (!rootState.auth.account) { return null; }
    if (state.isFetchingTasks) { return null; }
    const { promoterOid, emailAddress } = rootState.auth.account;

    let promoterTasks = null;

    // Set some defaults here. We can add these to the interface later if it makes sense to.
    const notTaskStatus = ["completed", "failed", "cancelled", "scheduled", "draft", "archived"];
    const intervalTime = 30000;

    const startedAfter = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

    if (types && types.length > 0) {
      promoterTasks = await this.$api.promoterIntegrationTask.fetchTasksOfTypes(
        promoterOid,
        {
          notTaskStatus,
          types,
          startedAfter
        });
    } else {
      promoterTasks = await this.$api.promoterIntegrationTask.fetchAll(
        promoterOid,
        {
          notTaskStatus,
          startedAfter
        }
      )
    }
    dispatch('GET_COMPLETED_TASKS', {})

    if (reload) {
      commit('SET_PENDING_TASKS', promoterTasks);
    } else {
      commit('CONCAT_PENDING_TASKS', promoterTasks);
    }

    if (promoterTasks.length > 0 && setIntervalIfTasksFound) {
      commit('SET_INTERVAL', {
        callbackFunction: () => {
          dispatch('START_POLLING_PENDING_TASKS', {
            reload,
            types,
            setIntervalIfTasksFound: false,
          })
          dispatch('GET_COMPLETED_TASKS', {})
        },
        timeout: intervalTime
      })
    }
    if (promoterTasks.length === 0) {
      commit('CLEAR_INTERVAL');
    }
  },


  async GET_COMPLETED_TASKS({ state, rootState, commit }) {
    if (!rootState.auth.account) { return null; }
    if (state.isFetchingTasks) { return null; }
    const { promoterOid } = rootState.auth.account;

    let completedTasks = null;

    const taskStatus = ['completed'];

    const startedAfter = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

    completedTasks = await this.$api.promoterIntegrationTask.fetchAll(
      promoterOid,
      {
        taskStatus,
        startedAfter,
        top: 5,
      });

    commit('SET_COMPLETED_TASKS', completedTasks);
  },


}

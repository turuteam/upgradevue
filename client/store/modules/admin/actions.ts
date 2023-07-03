import { ActionTree } from 'vuex'
import { RootState } from '@/store/modules/types';
import { AdminState } from './types';

export const adminActions: ActionTree<AdminState, RootState> = {
  async FETCH_PROMOTER_ACCOUNTS(
    { rootState, rootGetters, commit },
    {
      filterString,
    },
  ) {
    if (!rootState.auth.account) return;
    if (!rootGetters['auth/isAdminAccount']) return;

    try {
      const promoterAccounts = await this.$api.promoterAccounts.query(filterString);

      commit('SET_PROMOTER_ACCOUNTS', promoterAccounts);
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch promoters',
      });
    }
  },
  async FETCH_PROMOTER_ACCOUNT_OWNDER(
    { rootState, rootGetters, commit },
    oid: number,
  ) {
    if (!rootState.auth.account) return;
    if (!rootGetters['auth/isAdminAccount']) return;

    try {
      const promoterAccount = await this.$api.promoterAccounts.get(oid);

      commit('SET_PROMOTER_ACCOUNT_OWNER', promoterAccount);
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch account promoter owner',
      });
    }
  },
  async UPDATE_PROMOTER_ACCOUNT_OWNER(
    { rootState, rootGetters, commit },
    { oid, accountObj }
  ) {
    if (!rootState.auth.account) return;
    if (!rootGetters['auth/isAdminAccount']) return;

    try {
      const promoterAccount = await this.$api.promoterAccounts.patch(oid, accountObj);

      commit('SET_PROMOTER_ACCOUNT_OWNER', promoterAccount);
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch account promoter owner',
      });
    }
  },
  async FETCH_MASQUERADER_PROMOTER_ACCOUNTS(
    { rootState, rootGetters, commit },
    oids: number[],
  ) {
    if (!rootState.auth.account) return;
    if (!rootGetters['auth/isAdminAccount']) return;

    try {
      const masqueraderPromoterAccounts = await this.$api.promoterAccounts.queryByOids(oids);

      commit('SET_MASQUERADER_PROMOTER_ACCOUNTS', masqueraderPromoterAccounts);
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch masquerader promoter accounts',
      });
    }
  },
  async FETCH_ADMIN_MESSAGE_TASKS(
    { state, rootState, commit, rootGetters },
    { searchQuery = '', append = false, top = 50, types = ['completed', 'in-progress', 'failed', 'scheduled'], orderby = 'oid desc' },
  ) {
    if (state.isFetchingFanMessageTasks) return;
    if (!rootState.auth.account) return;
    if (!rootGetters['auth/isAdminAccount']) return;

    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_FETCHING_ADMIN_FAN_MESSAGE_TASKS', true);

      const uri = `/promoter/${promoterOid}/task`;
      const skip = state.fanMessageTasks && append ? state.fanMessageTasks.length : 0;

      let filterString = `name = fan-message`;
      if (types.length > 0) {
        filterString += ` AND (status =`
        filterString += types.join(` OR status = `);
        filterString += `)`;
      }

      if (searchQuery && searchQuery.length > 0) {
        if (isNaN(searchQuery)) {
          filterString += ` AND (promoterAccount[emailAddress] ILIKE "%${searchQuery}%" OR promoterAccount[firstName] ILIKE "%${searchQuery}%" OR promoterAccount[lastName] ILIKE "%${searchQuery}%")`
        } else {
          const searchQueryInt = parseInt(searchQuery);
          filterString += ` AND (promoterOid = ${searchQueryInt} OR oid = ${searchQueryInt} OR promoterAccount[emailAddress] ILIKE "%${searchQuery}%" OR promoterAccount[firstName] ILIKE "%${searchQuery}%" OR promoterAccount[lastName] ILIKE "%${searchQuery}%")`;
        }
      }

      const { data } = await this.$axios.get(uri, {
        params: {
          $top: top,
          $count: true,
          $skip: skip,
          $orderby: orderby,
          $filter: filterString,
          $select: 'promoterAccount,promoterOid,oid,statusDetails,status,meta,started,scheduledAt,provider'
        }
      });

      if (data.rows.length > 0) {
        if (append) {
          commit('CONCAT_ADMIN_FAN_MESSAGE_TASKS', data.rows);
        } else {
          commit('SET_ADMIN_FAN_MESSAGE_TASKS', data.rows);
        }
      } else {
        commit('SET_NO_MORE_ADMIN_FAN_MESSAGE_TASKS', true);
      }



    } catch (error) {
      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch message tasks' });
      commit('SET_HAS_FAILED_FETCHING_ADMIN_FAN_MESSAGE_TASKS', true);
    } finally {
      commit('SET_IS_FETCHING_ADMIN_FAN_MESSAGE_TASKS', false);
    }
  },

  async FETCH_ADMIN_STATS(
    { state, rootState, commit, rootGetters },
  ) {
    if (state.isFetchingFanMessageTasks) return;
    if (!rootState.auth.account) return;
    if (!rootGetters['auth/isAdminAccount']) return;
    const { promoterOid } = rootState.auth.account;

    const stats = {
      scheduledMessageCount: 0,
      sendingMessageCount: 0,
      failedMessageCount: 0,
    };

    const typeGroups = [
      {
        types: ['scheduled'],
        stat: 'scheduledMessageCount',
      },
      {
        types: ['in-progress'],
        stat: 'sendingMessageCount',
      },
      {
        types: ['failed'],
        stat: 'failedMessageCount',
      },
    ];

    commit('SET_IS_FETCHING_ADMIN_STATS', true);

    const actions = typeGroups.map(typeGroup => {
      const uri = `/promoter/${promoterOid}/task`;
      let filterString = `name = fan-message`;

      if (typeGroup.types.length > 0) {
        filterString += ` AND (status =`
        filterString += typeGroup.types.join(` OR status = `);
        filterString += `)`;
      }

      return this.$axios.get(uri, {
        params: {
          $top: 0,
          $count: true,
          $filter: filterString,
        }
      });
    });

    await Promise.all(actions).then(responses => {
      responses.forEach((response, index) => {
        if (!response.data) return;
        if (index === 0) {
          stats.scheduledMessageCount = response.data.count;
        } else if (index === 1) {
          stats.sendingMessageCount = response.data.count;
        } else if (index === 2) {
          stats.failedMessageCount = response.data.count;
        }
      });
    });

    commit('SET_TOTAL_ADMIN_STATS', stats);
    commit('SET_IS_FETCHING_ADMIN_STATS', false);
  },


  async RETRY_ADMIN_MESSAGE_TASK(
    { state, rootState, commit, rootGetters },
    { taskOid },
  ) {
    if (!taskOid || isNaN(taskOid)) return;
    if (state.isFetchingFanMessageTasks) return;
    if (!rootState.auth.account) return;
    if (!rootGetters['auth/isAdminAccount']) return;

    const { promoterOid } = rootState.auth.account;

    this.$arNotification.push({ type: 'error', message: `TODO - Add a RETRY method. Oid: ${taskOid}` });

  },

  async CANCEL_ADMIN_MESSAGE_TASK(
    { state, rootState, commit, rootGetters },
    { taskOid },
  ) {
    if (!taskOid || isNaN(taskOid)) return;
    if (state.isFetchingFanMessageTasks) return;
    if (!rootState.auth.account) return;
    if (!rootGetters['auth/isAdminAccount']) return;

    const { promoterOid } = rootState.auth.account;
    const uri = `/promoter/${promoterOid}/task/${taskOid}`;

    try {
      await this.$axios.patch(uri, {
        status: 'cancelled',
      });
      this.$arNotification.push({
        type: 'success',
        message: `Successfully cancelled message`,
      });
      commit('REMOVE_MESSAGE_FROM_ADMIN_FAN_MESSAGE_TASKS', taskOid);
    } catch (error: any) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: `Failed to cancel message: ${error.message}`,
      });
    }
  },

  async ARCHIVE_ADMIN_MESSAGE_TASK(
    { state, rootState, commit, rootGetters },
    { taskOid },
  ) {
    if (!taskOid || isNaN(taskOid)) return;
    if (state.isFetchingFanMessageTasks) return;
    if (!rootState.auth.account) return;
    if (!rootGetters['auth/isAdminAccount']) return;

    const { promoterOid } = rootState.auth.account;
    const uri = `/promoter/${promoterOid}/task/${taskOid}`;

    try {
      await this.$axios.patch(uri, {
        status: 'archived',
      });

      this.$arNotification.push({
        type: 'success',
        message: `Successfully archived message`,
      });
      commit('REMOVE_MESSAGE_FROM_ADMIN_FAN_MESSAGE_TASKS', taskOid);
    } catch (error: any) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: `Failed to archive message: ${error.message}`,
      });
    }
  },

  async FORCE_REFRESH_PROMOTER_SALES_STATS(
    { state, rootState, commit, rootGetters },
    { targetPromoterOid },
  ) {
    if (!targetPromoterOid || isNaN(targetPromoterOid)) return;
    if (state.isFetchingFanMessageTasks) return;
    if (!rootState.auth.account) return;
    if (!rootGetters['auth/isAdminAccount']) return;

    const { promoterOid } = rootState.auth.account;
    const uri = `/promoter/${promoterOid}/sales-stats-refresh-all?promoterOid=${targetPromoterOid}`;

    try {
      await this.$axios.post(uri);
      this.$arNotification.push({
        type: 'success',
        message: `Started refresh of sales stats snapshots for promoter ${targetPromoterOid}`,
      });
    } catch (error) {
      this.$arNotification.push({
        type: 'error',
        message: `Failed to refresh sales stats snapshots for promoter ${targetPromoterOid}`,
      });

    }
  },
  async FETCH_MESSAGE_LIST(
    { state, rootState, commit, rootGetters },
    { promoterOid },
  ) {
    if (!promoterOid || isNaN(promoterOid)) return;
    if (state.isFetchingFanMessageTasks) return;
    if (!rootState.auth.account) return;
    if (!rootGetters['auth/isAdminAccount']) return;


    const { data, status } = await this.$axios.get(`/promoter/${promoterOid}/message-list`, {
      params: {
         $top: 'all',
         $select: 'name,promoterOid',
         $filter: `promoter_oid=${promoterOid}`,
      }
    });
    return data;
   
  },
  async FETCH_CAMPAIGN_LIST(
    { state, rootState, commit, rootGetters },
    { promoterOid },
  ) {
    if (!promoterOid || isNaN(promoterOid)) return;
    if (state.isFetchingFanMessageTasks) return;
    if (!rootState.auth.account) return;
    if (!rootGetters['auth/isAdminAccount']) return;


    const { data, status } = await this.$axios.get(`/promoter/${promoterOid}/campaign`, {
      params: {
         $top: 'all',
         $select: 'name,promoterOid',
         $filter: `promoter_oid=${promoterOid}`
      }
    });
    return data;
   
  },
  async FETCH_EVENT_LIST(
    { state, rootState, commit, rootGetters },
    { promoterOid },
  ) {
    if (!promoterOid || isNaN(promoterOid)) return;
    if (state.isFetchingFanMessageTasks) return;
    if (!rootState.auth.account) return;
    if (!rootGetters['auth/isAdminAccount']) return;

    const { data, status } = await this.$axios.get(`/promoter/${promoterOid}/event`, {
      params: {
         $top: 'all',
         $select: 'name,promoterOid',
         $filter: `promoter_oid=${promoterOid}`
      }
    });
    return data;
   
  },
  async FETCH_TAG_LIST(
    { state, rootState, commit, rootGetters },
    { promoterOid },
  ) {
    if (!promoterOid || isNaN(promoterOid)) return;
    if (state.isFetchingFanMessageTasks) return;
    if (!rootState.auth.account) return;
    if (!rootGetters['auth/isAdminAccount']) return;

    const { data, status } = await this.$axios.get(`/promoter/${promoterOid}/tag`, {
      params: {
         $top: 'all',
         $select: 'name,promoterOid',
         $filter: `promoter_oid=${promoterOid}`
      }
    });
    return data;
   
  },
  async FETCH_TASK_LIST(
    { state, rootState, commit, rootGetters },
    { promoterOid },
  ) {
    if (!promoterOid || isNaN(promoterOid)) return;
    if (state.isFetchingFanMessageTasks) return;
    if (!rootState.auth.account) return;
    if (!rootGetters['auth/isAdminAccount']) return;

    const { data, status } = await this.$axios.get(`/promoter/${promoterOid}/task`, {
      params: {
         $top: 'all',
         $select: 'name,promoterOid',
         $filter: `promoter_oid=${promoterOid}`
      }
    });
    return data;
   
  },
  async FORCE_REFRESH_STATS(
    { state, rootState, commit, rootGetters },
    { targetPromoterOid, refreshType, statOid },
  ) {
    if (!targetPromoterOid || isNaN(targetPromoterOid)) return;
    if (state.isFetchingFanMessageTasks) return;
    if (!rootState.auth.account) return;
    if (!rootGetters['auth/isAdminAccount']) return;

    const { promoterOid } = rootState.auth.account;
    let typeUrl = '';
    switch(refreshType.key){
      case 'messageList': {
        typeUrl = 'message-list'
        break;
      }
      case 'campaginStats': {
        typeUrl = 'campaign'
        break;
      }
      case 'eventTicketStats': {
        typeUrl = 'event'
        break;
      }
      case 'tagCountUpdate': {
        typeUrl = 'tag'
        break;
      }
      case 'taskStats': {
        typeUrl = 'task'
        break;
      }
    }

    const uri = `/promoter/${promoterOid}/${typeUrl}/${statOid}/stat-refresh/?promoterOid=${targetPromoterOid}`;

    try {
      await this.$axios.post(uri);
      this.$arNotification.push({
        type: 'success',
        message: `Started refresh of ${refreshType.name} for promoter ${targetPromoterOid}`,
      });
    } catch (error) {
      this.$arNotification.push({
        type: 'error',
        message: `Failed to refresh ${refreshType.name} for promoter ${targetPromoterOid}`,
      });

    }
  },
}

import { ActionTree } from 'vuex'
import { RootState } from '@/store/modules/types';
import { SubscriberState } from './types';

export const subscriberActions: ActionTree<SubscriberState, RootState> = {
  async FETCH_MORE_SUBSCRIBERS(
    { rootState, state, commit, dispatch },
    {
      messageListOid,
      orderBy = { key: 'fanOid', order: 'desc' },
      select = '',
      reload = false,
      filter = null,
    }) {
      if (!rootState.auth.account) { return null; }
      const { promoterOid } = rootState.auth.account;
      if (state.isFetchingSubscribers) { return; }

      if (reload) {
        commit('RESET_SUBSCRIBERS');

        const statsSnapshotCount = rootState.messageList?.currentMessageList?.statsSnapshot?.total;
        const isDynamicList = rootState.messageList?.currentMessageList?.filterGroupOid;
        if (!!filter || !statsSnapshotCount || !!isDynamicList) {
          dispatch('FETCH_MESSAGE_TOTAL_SUBSCRIBERS_COUNT', { messageListOid, filter });
        } else {
          commit('SET_TOTAL_SUBSCRIBERS_COUNT', statsSnapshotCount);
        }
      }

      try {
        commit('SET_IS_FETCHING_SUBSCRIBERS', true);
        const params = {
          $top: 50,
          $skip: state.subscribers.length,
          $orderby: `${orderBy.key} ${orderBy.order}`,
          $select: select,
          $audienceFilter: filter,
        };
        const { data } = await this.$axios.get(`/promoter/${promoterOid}/message-list/${messageListOid}/subscribers`, {
          params,
        });

        if (reload) {
          commit('SET_SUBSCRIBERS', data);
        } else {
          commit('CONCAT_SUBSCRIBERS', data);
        }

        if (data.length === 0) {
          commit('SET_IS_NO_MORE_SUBSCRIBERS', true);
        }
        return true;
      } catch (error) {
        console.error(error);
        this.$arNotification.push({ type: 'error', message: 'Failed to fetch more contacts' });
        commit('SET_HAS_FETCH_SUBSCRIBERS_FAILED', true);
        return false;
      } finally {
        commit('SET_IS_FETCHING_SUBSCRIBERS', false);
      }
  },

  async FETCH_MESSAGE_TOTAL_SUBSCRIBERS_COUNT({ rootState, state, commit }, {
    messageListOid,
    filter = null,
  }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_FETCHING_TOTAL_SUBSCRIBERS_COUNT', true);
      const count = await this.$api.messageLists.fetchMessageListRecipientCount(promoterOid, messageListOid, filter, null);
      commit('SET_TOTAL_SUBSCRIBERS_COUNT', count);
      commit('SET_IS_FETCHING_TOTAL_SUBSCRIBERS_COUNT', false);
    } catch(error) {
      if (this.$axios.isCancel(error)) {
        console.error(error);
      } else {
        console.error(error);
        this.$arNotification.push({ type: 'error', message: 'Failed to fetch subscriber count' });
        commit('SET_IS_FETCHING_TOTAL_SUBSCRIBERS_COUNT', false);
      }
    }

  },

  async EXPORT_LIST_SUBSCRIBERS_CSV({ rootState, state, commit }, {
    messageListOid,
    orderBy = { key: 'fanOid', order: 'desc' },
    select = 'emailAddress,mobileNumber,firstName,lastName,country,state,city,postcode,dob,optedIntoEmail,optedIntoSms,fanOid',
    channels = null,
    csvHeaderCase = 'camel',
    filter = null,
  }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    if (state.isExportingListSubscribers) { return; }

    if (!messageListOid || messageListOid == 0) {
      this.$arNotification.push({ type: 'error', message: 'You must select email recipients before you can import dynamic tags.'});
      return;
    }

    try {
      commit('SET_IS_EXPORTING_LIST_SUBSCRIBERS', true);
      const uri = `/promoter/${promoterOid}/message-list/${messageListOid}/subscribers`;

      const { data } = await this.$axios.get(uri, {
        headers: {
          Accept: 'text/csv',
        },
        params: {
          $select: select,
          $channels: channels,
          $top: 'all',
          $skip: 0,
          $orderby: `${orderBy.key} ${orderBy.order}`,
          $audienceFilter: filter,
          $csvHeaderCase: csvHeaderCase,
        },
      });

      this.$arNotification.push({ type: 'success', message: data });
    } catch (error) {
      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to download CSV' });
    } finally {
      commit('SET_IS_EXPORTING_LIST_SUBSCRIBERS', false);
    }
  },
};

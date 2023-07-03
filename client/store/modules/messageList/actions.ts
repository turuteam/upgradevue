import { ActionTree } from 'vuex'
import { capitalizeFirstLetter, filterObjectToQueryString } from '@/utils/helpers';
import { RootState } from '@/store/modules/types';
import { MessageList } from '@/api/message-lists/types';
import { MessageListState } from './types';
import { getFilteredRecipientListCount, getMergedFilters } from './utils';

import { clone } from '@/utils/helpers/';

export const messageListActions: ActionTree<MessageListState, RootState> = {

  async FETCH_MORE_MESSAGE_LISTS({ state, rootState, commit },{
    top = 12,
    orderBy = { key: 'oid', order: 'desc' },
    type = 'all',
    filterString = '',
    channels = [],
    select = null,
    reload = false,
    userDefined = true,
  }) {
    let fetchCount = false;
    // Can set fetchCount to true if we ever need to return the total count of lists.
    // For now defaults to false

    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    if (state.isFetchingMessageLists) {
      return;
    }

    try {
      commit('SET_IS_FETCHING_MESSAGE_LISTS', true);
      let uri = `/promoter/${promoterOid}/message-list`;

      const filterObject: any = {
        expressions: [],
        logicalOperators: [],
      };
      if (channels.length === 0 && (userDefined === false || userDefined === true)) {
        filterObject.expressions.push({
          key: 'userDefined',
          operator: userDefined ? '=' : '!=',
          value: true,
        });
        filterObject.logicalOperators.push('AND');
      }
      if (filterString) {
        filterObject.expressions.push({
          key: 'name',
          operator: 'ILIKE',
          value: `%${filterString}%`,
        });
        filterObject.logicalOperators.push('AND');
      }
      if (type === 'auto' || type === 'manual') {
        filterObject.expressions.push({
          key: 'filterGroupOid',
          operator: type === 'auto' ? 'IS NOT' : 'IS',
          value: 'NULL',
        });
        filterObject.logicalOperators.push('AND');
      }
      if (userDefined === true || userDefined === false) {
        filterObject.expressions.push({
          key: 'userDefined',
          operator: '=',
          value: userDefined,
        });
        filterObject.logicalOperators.push('AND');
      }

      if (channels.length > 0) {
        const subFilterObject: any = {
          expressions: [],
          logicalOperators: [],
        };
        channels.forEach((channel: any) => {
          subFilterObject.expressions.push({
            key: channel,
            operator: '=',
            value: true,
          });
          subFilterObject.logicalOperators.push('OR');
        });
        subFilterObject.logicalOperators.splice(-1, 1);

        filterObject.expressions.push(subFilterObject);
        filterObject.logicalOperators.push('AND');
      }

      filterObject.logicalOperators.splice(-1, 1);


      const params = {
        $top: top,
        $skip: reload ? 0 : state.messageLists.length,
        $orderby: `${orderBy.key} ${orderBy.order}`,
        $select: select ? select : null,
        $filter: filterObjectToQueryString(filterObject),
      };

      if (fetchCount) {
        // @ts-ignore
        params.$count = true;
      }

      const { data } = await this.$axios.get(uri, {
        params: params,
      });
      let rows = [];

      if (fetchCount) {
        rows = data.rows;
        commit('SET_TOTAL_MESSAGE_LIST_COUNT', data.count);
      } else {
        rows = data;
      }

      if (reload) {
        commit('SET_MESSAGE_LISTS', rows);
      } else {
        commit('CONCAT_MESSAGE_LISTS', rows);
      }

      if (rows.length < top) {
        commit('SET_HAS_NO_MORE_MESSAGE_LISTS', true);
      }
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch lists' });
      commit('SET_HAS_FETCH_MESSAGE_LISTS_FAILED', true);
      return false;
    } finally {
      commit('SET_IS_FETCHING_MESSAGE_LISTS', false);
    }
  },
  async FETCH_CURRENT_MESSAGE_LIST(
    { rootState, commit },
    {oid, allowDeleted = false}
  ) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    if (isNaN(oid)) {
      this.$arNotification.push({
        type: 'warning',
        message: `Cannot fetch message list with ID ${oid}`,
      });
      return null;
    }

    try {
      commit('SET_IS_FETCHING_MESSAGE_LIST', true);
      const { data } = await this.$axios.get(`/promoter/${promoterOid}/message-list/${oid}`, {
        params: {
          $filter: allowDeleted ? `oid=${oid} AND (sysActivep=false OR sysActivep)` : null,
        }
      });

      commit('SET_CURRENT_MESSAGE_LIST', data);

      if (data.filterGroupOid && data.filterGroup && !data.filterGroup.name) {
        this.$arNotification.push({
          type: 'warning',
          message: 'The segment associated with this list is no longer available',
        });
      }

      return true;
    } catch (error) {
      commit('RESET_CURRENT_MESSAGE_LIST');
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch list',
      });
      return false;
    } finally {
      commit('SET_IS_FETCHING_MESSAGE_LIST', false);
    }
  },
  async CREATE_MESSAGE_LIST(
    { commit, rootState },
    { name, sms, email, facebookMessenger, meta, filterGroupOid,}
  ) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid, oid } = rootState.auth.account;

    const defaultData = {
      promoterOid,
      promoterAccountOid: oid,
      userDefined: true,
      sysActivep: true,
    };

    const messageListData = {
      name,
      sms,
      email,
      facebookMessenger,
      meta,
      filterGroupOid: filterGroupOid || null,
      ...defaultData,
    };

    try {
      commit('SET_IS_CREATING_MESSAGE_LIST', true);
      const { data } = await this.$axios.post(`/promoter/${promoterOid}/message-list`, messageListData);

      this.$arNotification.push({
        type: 'success',
        message: 'Successfully created list',
      });
      // if (email) {
      //   this.$arNotification.push({
      //     type: 'success',
      //     message: `We may send you a verification email at ${meta.email.emailAddress} if you haven't verified that address before. Please check your inbox.`,
      //     timeout: 15000,
      //   });
      // }
      this.$router.push({
        path: `/message-center/lists/${data.oid}/contacts`,
      });
      return true;
    } catch (error: any) {
      console.error(error);
      if (error.response) {
        if (error.response.status === 409) {
          this.$arNotification.push({
            type: 'error',
            message: 'Could not create new list. Please ensure that you have chosen a unique name and filter'
          });
        } else {
          this.$arNotification.push({ type: 'error', message: 'Failed to save list' });
        }
      }
      return false;
    } finally {
      commit('SET_IS_CREATING_MESSAGE_LIST', false);
    }
  },
  async UPDATE_MESSAGE_LIST({ rootState, commit, state }, { oid, changes }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_UPDATING_MESSAGE_LIST', true);
      await this.$axios.patch(`/promoter/${promoterOid}/message-list/${oid}`, changes);

      commit('PATCH_IN_MESSAGE_LISTS', { oid, changes })
      if (state.currentMessageList && state.currentMessageList.oid === oid) {
        commit('PATCH_CURRENT_MESSAGE_LIST', changes);
      }

      this.$arNotification.push({
        type: 'success',
        message: 'Successfully updated list',
      });
      return true;
    } catch (error: any) {
      console.error(error);
      if (error.response && error.response.status === 409) {
        this.$arNotification.push({
          type: 'error',
          message: 'The name you have entered is already used in another list',
        });
      } else {
        this.$arNotification.push({
          type: 'error',
          message: 'Failed to update list',
        });
      }
      return false;
    } finally {
      commit('SET_IS_UPDATING_MESSAGE_LIST', false);
    }
  },
  async DELETE_MESSAGE_LIST({ rootState, commit, state }, messagingListOid) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_DELETING_MESSAGE_LIST', true);
      await this.$axios.delete(`/promoter/${promoterOid}/message-list/${messagingListOid}`);

      commit('REMOVE_FROM_MESSAGE_LISTS', messagingListOid);
      if (state.currentMessageList && state.currentMessageList.oid === messagingListOid) {
        commit('RESET_CURRENT_MESSAGE_LIST');
      }

      this.$arNotification.push({ type: 'success', message: 'List has been deleted' });
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to delete list' });
      return false;
    } finally {
      commit('SET_IS_DELETING_MESSAGE_LIST', false);
    }
  },
  async VALIDATE_NEW_MESSAGE_LIST({ rootState, commit }, { name, filterGroupOid }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    const filterObject: any = {
      expressions: [],
      logicalOperators: [],
    };
    filterObject.expressions.push({
      key: 'name',
      operator: '=',
      value: name,
    });
    if (filterGroupOid) {
      filterObject.expressions.push({
        key: 'filterGroupOid',
        value: filterGroupOid,
        operator: '='
      });
      filterObject.logicalOperators.push('OR');
    }

    try {
      commit('SET_IS_VALIDATING_NEW_MESSAGE_LIST', true);
      const { data } = await this.$axios.get(`/promoter/${promoterOid}/message-list`, {
        params: {
          $top: 2,
          $skip: 0,
          $count: true,
          $filter: filterObjectToQueryString(filterObject),
        },
      });
      const messageLists: MessageList[] = data.rows;

      const duplicatedName = name ? !!messageLists.filter(item => {
        return item.name === name;
      })[0] : false;
      const duplicatedFilterGroupOid = filterGroupOid ? !!messageLists.filter(item => {
        return item.filterGroupOid === filterGroupOid;
      })[0] : false;

      commit('SET_NEW_MESSAGE_LIST_VALIDATE_RESULT', {
        duplicatedName,
        duplicatedFilterGroupOid,
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      commit('SET_IS_VALIDATING_NEW_MESSAGE_LIST', false);
    }
  },


  // -------------------------------
  // Operations within message lists

  // Remove a fan from a message list
  async DELETE_FAN_MESSAGE_LIST_SUBSCRIPTION(
    { rootState, commit },
    {
      fanListOid = null,
    }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    if(!fanListOid) return false;

    let uri = `promoter/${promoterOid}/fan-message-list-subscription/${fanListOid}`;

    try {
      return await this.$axios.delete(uri);
    } catch (error) {
      console.error(error);
      throw error;
    }
  },


  async UPDATE_FAN_MESSAGE_LIST_SUBSCRIPTIONS(
    { rootState, commit },
    {
      fanListOid = null,
      add = [],
      remove = [],
    }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    if(!fanListOid) return false;
    if(add.length === 0 && remove.length === 0) return false;

    const jsonBody: {[k: string]: any} = {};
    add.forEach( (item:string) => {
      jsonBody[item] = true;
    });
    remove.forEach( (item:string) => {
      jsonBody[item] = false;
    });

    let uri = `promoter/${promoterOid}/fan-message-list-subscription/${fanListOid}`;

    try {
      return await this.$axios.patch(uri, jsonBody);
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Fetches the current message list's subscriber count with advanced targeting applied to it
  // If the total number if incalculable for any reason, set to NULL.
  // Apologies for all of the ts-ignores - if there's a better solution please let me know...
  async FETCH_FILTERED_RECIPIENT_LIST_COUNT({ rootState, rootGetters, getters, state, dispatch, commit },{ channel = null, campaignOid = null, facebookPageId = null, skipStatsSnapshot = false}) {
    if (!rootState.auth.account) return null
    if (!state.currentMessageList || !state.currentMessageList.oid) return null

    const { promoterOid } = rootState.auth.account
    const { type, condition, values } = state.advancedMessageListTargeting
    const messageListOid = state.currentMessageList.oid

    const prunedScratchSegment = clone(rootGetters['segment/prunedScratchSegment'])
    const currentFilterExpr = clone(getters.getCurrentFilterExpression)

    /* A.D. 20-MAY-2020
     * ------
     * Have to merge the filters coming from the sidebar (via prunedScratchSegment) and the quick filters
     * (coming from getCurrentFilterExpression()) into one filter.
     */
    let targetingFilter = getMergedFilters(prunedScratchSegment, currentFilterExpr)

    // If targeting is set to 'All' or if it is incomplete, then set the recipient count to the value within
    // current message list. Also set accuracy to 'accurate', as this will be an exact count.
    if (!skipStatsSnapshot && (type === 'all' || !type || !condition || !values || values.length === 0) && !targetingFilter) {
      commit('SET_FILTERED_RECIPIENT_LIST_COUNT_ACCURACY', 'accurate')

      if (!channel || !state.currentMessageList.statsSnapshot || !state.currentMessageList.statsSnapshot.total) {
        commit('SET_FILTERED_RECIPIENT_LIST_COUNT', null)
        console.error("Unknown recipient count - this is probably a bug")
        return // Unknown number - we cant accurately predict total recipients without a channel or without stats
      }

      const deDupedName = `valid${capitalizeFirstLetter(channel)}`

      let totalNumber = getFilteredRecipientListCount(deDupedName, channel, campaignOid, facebookPageId, state.currentMessageList)
      commit('SET_FILTERED_RECIPIENT_LIST_COUNT', totalNumber)

      return
    }


    /* M.S. 16-SEPT-2021
     * ------
     * Due to limitations with query speed on larger lists, we're going to fetch ESTIMATES of recipient count for emails
     * when the statsSnapshot indicates that list size is > 20,000 recipients. When this threshold is met, we're going to query
     * the filter-fan endpoint. Otherwise, if we have 20k or fewer recipients, we're going to query the message-list subscribers
     * endpoint.
     */

    if (channel === 'email' && !state.currentMessageList.filterGroupOid && state.currentMessageList.statsSnapshot.total > 50000) {

      dispatch('SET_EMAIL_RECIPIENT_COUNT_ESTIMATE', { promoterOid, filter: targetingFilter })

    } else {
      commit('SET_FILTERED_RECIPIENT_LIST_COUNT_ACCURACY', 'accurate')

      // If channel is SMS, then we need to fetch the count from the message-preview endpoint
      // Otherwise, we need to use the subscribers endpoint
      if (channel === 'sms') {

        dispatch('SET_SMS_RECIPIENT_COUNT_ACCURATE', {promoterOid, filter: targetingFilter})

      } else {

        try {
          commit('SET_IS_FETCHING_FILTERED_RECIPIENT_LIST_COUNT', true);
          const count = await this.$api.messageLists.fetchMessageListRecipientCount(promoterOid, messageListOid, targetingFilter, channel);
          commit('SET_FILTERED_RECIPIENT_LIST_COUNT', count);
          commit('SET_IS_FETCHING_FILTERED_RECIPIENT_LIST_COUNT', false);

        } catch (error) {
          if (this.$axios.isCancel(error)) {
            console.error(error);
          } else {
            console.error(error);
            this.$arNotification.push({ type: 'error', message: 'Failed to fetch audience count' });
            commit('SET_IS_FETCHING_FILTERED_RECIPIENT_LIST_COUNT', false);
          }
        }
      }
    }
  },

  async SET_EMAIL_RECIPIENT_COUNT_ESTIMATE({ state, commit }, { promoterOid, filter }) {
    commit('SET_FILTERED_RECIPIENT_LIST_COUNT_ACCURACY', 'estimate')
    commit('SET_IS_FETCHING_FILTERED_RECIPIENT_LIST_COUNT', true)

    // Modify the targetingFilter to also filter on subscription to the current message list and opt in to email
    if (!!filter.conditions.length) {
      filter.logic.push("and")
    }

    filter.logic.push("(", "and", ")")
    filter.conditions.push({
      data: {
        condition: 'true_to_any',
        values: [state.currentMessageList.oid],
      },
      name: 'listSubscriptions',
      type: 'condition-search-picker'
    },{
      data: "email",
      name: 'subscribedTo',
      type: 'select'
    })

    try {
      const count = await this.$api.audience.fetchAudienceCount(promoterOid, filter)
      commit('SET_FILTERED_RECIPIENT_LIST_COUNT', count)
      commit('SET_IS_FETCHING_FILTERED_RECIPIENT_LIST_COUNT', false)
    } catch (error) {
      if (this.$axios.isCancel(error)) {
        console.error(error)
      } else {
        console.error(error)
        this.$arNotification.push({ type: 'error', message: 'Failed to fetch audience count' })
        commit('SET_IS_FETCHING_FILTERED_RECIPIENT_LIST_COUNT', false)
      }
    }
  },

  async SET_SMS_RECIPIENT_COUNT_ACCURATE({ commit, rootState }, {promoterOid, filter}) {
    // @ts-ignore
    let messageListOid = rootState.message.scratchSimpleMessage?.meta?.messageListOid || rootState.message?.currentSelectedMessage?.scratchSimpleMessage?.meta?.messageListOid
    // @ts-ignore
    let messageBody = rootState.message.scratchSimpleMessage?.meta?.messageBody || rootState.message?.currentSelectedMessage?.meta?.messageBody || ''

    try {
      commit('SET_IS_FETCHING_FILTERED_RECIPIENT_LIST_COUNT', true)
      commit('message/SET_IS_FETCHING_SMS_COST', true, {root: true})
      commit('message/SET_SMS_COST_FAILED_TO_FETCH', false, {root: true})

      // @ts-ignore
      const data = await this.$api.messageLists.fetchSmsMessagePreview(promoterOid, messageListOid, messageBody, filter)

      commit('SET_FILTERED_RECIPIENT_LIST_COUNT', data.cost.recipients)
      commit('message/PUT_SMS_MESSAGE_PREVIEW', data, { root: true }) // Lets update the SMS Preview since we have it already...
      commit('SET_IS_FETCHING_FILTERED_RECIPIENT_LIST_COUNT', false)
      commit('message/SET_IS_FETCHING_SMS_COST', false, {root: true})

    } catch (error: any) {
      if (this.$axios.isCancel(error)) {
        console.error(error)
      } else {
        console.error(error)
        this.$arNotification.push({ type: 'error', message: 'Failed to fetch audience count' })
        commit('message/SET_IS_FETCHING_SMS_COST', false, {root: true})
        commit('message/SET_SMS_COST_FAILED_TO_FETCH', true, {root: true})
        commit('SET_IS_FETCHING_FILTERED_RECIPIENT_LIST_COUNT', false)
      }
    }
  },

  async FETCH_SUBSCRIPTION_PREFERENCE({ commit }, promoterOid) {
    try {
      const { data } = await this.$axios.get(`/promoter/${promoterOid}/property`, {
        params: {
          $filter: 'type=promoter-subscription-preferences',
        }
      });

      if (data.length) {
        commit('SET_PROMOTER_PROPERTY', data[0]);
      }

      return true;
    } catch (error) {
      console.error(error);

      return true;
    }
  },

  async UPDATE_SUBSCRIPTION_PREFERENCE({ commit, state }, {promoterOid, enabled}) {
    const formatBool = (val: string) => val.toString().toUpperCase();
    const isSubscriptionPreferenceResource = !!state.promoterProperty?.oid;

    try {
      if (isSubscriptionPreferenceResource) {
        const subscriptionPreferenceOid = state.promoterProperty.oid;
        const url = `/promoter/${promoterOid}/property/${subscriptionPreferenceOid}`

        // Patch resource
        const { data } = await this.$axios.patch(url, { property: formatBool(enabled) });

        commit('SET_PROMOTER_PROPERTY', {
          oid: subscriptionPreferenceOid,
          property: formatBool(enabled)
        });
      } else {
        const url = `/promoter/${promoterOid}/property`

        // Create new resource
        const { data } = await this.$axios.post(url, {
          property: formatBool(enabled),
          type: 'promoter-subscription-preferences',
          promoterOid
        });

        commit('SET_PROMOTER_PROPERTY', data);
      }
      return true;
    } catch (error) {
      console.error(error);

      return true;
    }
  },

  async FETCH_MESSAGE_LISTS({ commit, rootState }) {
    const promoterOid = rootState.auth.account?.promoterOid!
    let messageLists
    try {
      messageLists = await this.$api.messageLists.getMessageLists(promoterOid)
      commit('SET_MESSAGE_LISTS', messageLists)
    } catch (error) {
      console.error(error)
    }
  },
  async FETCH_MESSAGE_LISTS_AND_ATTENDEES({ commit, rootState }: any, {eventId, campaignId}) {
    const promoterOid = rootState.auth.account?.promoterOid!
    let finalMessageLists: any = [];
    try {
      if (eventId){ 
        let eventLists = await this.$api.messageLists.fetchEventMessageLists(promoterOid, eventId);
        eventLists.forEach(item => {
          finalMessageLists.push(item);
        });
      }
      if (campaignId){ 
        let campaignLists = await this.$api.messageLists.fetchCampaignMessageLists(promoterOid, campaignId);
        campaignLists.forEach(item => {
          finalMessageLists.push(item);
        });
      }
      let messageLists : [] = await this.$api.messageLists.getMessageLists(promoterOid);
      messageLists.forEach(item => {
        finalMessageLists.push(item);
      });
      commit('SET_MESSAGE_LISTS', finalMessageLists)
    } catch (error) {
      console.error(error)
    }
  }
};

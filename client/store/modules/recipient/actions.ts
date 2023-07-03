import { ActionTree } from 'vuex'
import { RootState } from '@/store/modules/types';
import { RecipientState } from './types';
import moment from 'moment';
import { magicDownload } from '@/utils/html-element/';
import { makeSafeOrderbyParams } from '~/utils/api/makeSafeOrderbyParams';

function generateFilterString(status: [any], combineStatusOp: string) {
  if (status.length > 1) {
    const frmCombineStatusOp = combineStatusOp.trim().toUpperCase()

    return `(${
      status
        .map((item: string) => {
          if (item.startsWith('not-')) {
            return `status != ${item.replace(/^not-/gi, '')}`
          }
          return `status=${item}`
        })
        .join(` ${frmCombineStatusOp} `)
    })`;
  } else if (status.length === 1 && status[0] !== undefined && status[0] !== null) {
    // Added support for negative filter using `!=`
    if (status[0].startsWith('not-')) {
      return `status != ${status[0].replace(/^not-/gi, '')}`;
    } else {
      return `status=${status[0]}`;
    }
  }
}

export const recipientActions: ActionTree<RecipientState, RootState> = {
  async FETCH_MESSAGE_RECIPIENTS({ rootState, state, commit, dispatch }, {
    messageTaskOid,
    top = 50,
    selectKeys,
    orderBy = { key: 'sysMtime', order: 'desc' },
    responseType = 'application/json',
    searchString = null,
    searchStringTargets = ['status', 'fan[firstName]', 'fan[lastName]', 'fan[emailAddress]'],
    status = [],
    reload = false,
    combineStatusOp = 'OR', // combine status using a logical operator AND/OR
    recipientsFilter = null,
    isSms = false,
  }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    if (state.isFetchingRecipients) { return; }

    if (reload) {
      commit('RESET_RECIPIENTS');
      let sentCount = 0;
      const statusDetails = rootState.message?.currentSelectedMessage?.statusDetails;

      if (rootState.message.currentSelectedMessage &&
        !!statusDetails
      ) {
        const { totalMessages, sent, opened, clicked, unsubscribed, bounced, failed, deferred, undelivered } = statusDetails;

        if (rootState.message.currentSelectedMessage?.provider === 'email') {
          const totalOpened = (opened || 0) + (clicked || 0) + (unsubscribed || 0);

          if (status.length === 0 || status[0] === null) {
            sentCount = totalMessages || 0;
          } else if (status.length > 1 && status[0] === 'opened') {
            sentCount = totalOpened;
          } else if (status.length > 1 && status[0] === 'not-opened') {
            sentCount = (totalMessages || 0) - totalOpened;
          } else if (status.length > 0 && status[0] === 'clicked') {
            sentCount = (clicked || 0);
          } else if (status.length > 0 && status[0] === 'not-clicked') {
            sentCount = (totalMessages || 0) - (clicked || 0);
          } else if (status.length > 0 && status[0] === 'bounced') {
            sentCount = bounced || 0;
          } else if (status.length > 0 && status[0] === 'unsubscribed') {
            sentCount = unsubscribed || 0;
          } else if (status.length > 1 && status[0] === 'failed') {
            sentCount = (failed || 0) + (deferred || 0);
          }
        } else {
          const totalClicked = (clicked || 0) + (unsubscribed || 0);

          if (status.length === 0 || status[0] === null) {
            sentCount = totalMessages || 0;
          } else if (status.length > 0 && status[0] === 'clicked') {
            sentCount = totalClicked;
          } else if (status.length > 0 && status[0] === 'not-clicked') {
            sentCount = (totalMessages || 0) - totalClicked;
          } else if (status.length > 0 && status[0] === 'unsubscribed') {
            sentCount = unsubscribed || 0;
          } else if (status.length > 1 && status[0] === 'failed') {
            sentCount = (failed || 0) + (undelivered || 0);
          }
        }
      }

      // For now, remove the message recipient count fetch. The UI doesn't really use it anywhere, so let's axe
      // it until such a time as we need it. Use SET_TOTAL_RECIPIENTS_COUNT to fetch it
      commit('SET_TOTAL_RECIPIENTS_COUNT', sentCount);
    }

    try {
      commit('SET_IS_FETCHING_RECIPIENTS', true)

      let uri, params;

      if (recipientsFilter) {
        // Filtered messages uses now a different API with different parameters
        uri = `/promoter/${promoterOid}/filter-fan-message`;

        params = {
          $top: top,
          $skip: reload ? 0 : state.recipients.length,
          $select: selectKeys ? selectKeys.join(',') : null,
          $taskOid: messageTaskOid,
          // recipientsFilter is an array like ["clicked" "https://www.audiencerepublic.com/"]
          $clickedUrl: recipientsFilter[1],
          ...(searchString && {$search: searchString}),
          ...(isSms && {$sms: true}),
        }
      } else {
        const route = isSms ? 'sms-fan-message' : 'fan-message';
        uri = `/promoter/${promoterOid}/${route}`;

        // Generate filter query
        let filter = `taskOid=${messageTaskOid}`;

        if (status) {
          const filterString = generateFilterString(status, combineStatusOp)

          if (filterString) {
            filter += ` AND ${filterString}`
          }
        }

        // Filtering with a search string will come later
        if (searchString) {
          // We also allow users to search "status" by using keyword, so don't forget "status" in "searchStringTargets"
          filter += ` AND (${
            searchStringTargets
              .map((target: string) => `${target} ILIKE "%${searchString}%"`).join(' OR ')
          })`;
        }

        params = {
          $top: top,
          $skip: reload ? 0 : state.recipients.length,
          $orderby: makeSafeOrderbyParams(orderBy),
          $select: selectKeys ? selectKeys.join(',') : null,
          // filter could be an empty string, in case avoid includeing it
          ...(filter && {$filter: filter}),
        }
      }

      const { data } = await this.$axios.get(uri,
        {
          params,
          headers: {
            Accept: responseType
          }
        })

      if (data.length === 0) {
        commit('SET_IS_NO_MORE_RECIPIENTS', true)
      }

      // If the count of messages being returned is less than the page size, 
      // then we should count the number of fan-messages in the store 
      // and use that value to populate the total recipients.
      if (data.length > 0 && data.length < top && state.recipients.length === 0) {
        commit('SET_TOTAL_RECIPIENTS_COUNT', data.length);
      }

      if (reload) {
        commit('SET_RECIPIENTS', data);
      } else {
        commit('CONCAT_RECIPIENTS', data);
      }

      return
    } catch (error) {
      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch recipients' });
      commit('SET_HAS_FETCH_RECIPIENTS_FAILED', true);
      // throw error;
      return false;
    } finally {
      commit('SET_IS_FETCHING_RECIPIENTS', false);
    }
  },


  async FETCH_TOTAL_RECIPIENTS_COUNT({ rootState, state, commit }, {
    messageTaskOid,
    searchString = null,
    searchStringTargets = ['status', 'fan[firstName]', 'fan[lastName]', 'fan[emailAddress]'],
    status = [],
  }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      commit('SET_IS_FETCHING_TOTAL_RECIPIENTS_COUNT', true);
      const count = await this.$api.recipients.fetchMessageRecipientCount(
        promoterOid,
        messageTaskOid,
        searchString,
        searchStringTargets,
        status);
      commit('SET_TOTAL_RECIPIENTS_COUNT', count);
      commit('SET_IS_FETCHING_TOTAL_RECIPIENTS_COUNT', false);
    } catch(error) {
      if (this.$axios.isCancel(error)) {
        console.error(error);
      } else {
        console.error(error);
        this.$arNotification.push({ type: 'error', message: 'Failed to fetch recipient count' });
        commit('SET_IS_FETCHING_TOTAL_RECIPIENTS_COUNT', false);
      }
    }
  },

  async EXPORT_MESSAGE_RECIPIENTS_CSV({ rootState }, {
    selectKeys,
    taskOid,
    orderBy,
    responseType = 'application/json',
    searchString = null,
    searchStringTargets = ['firstName', 'lastName', 'emailAddress', 'lastStatus'],
    status = [],
    combineStatusOp = 'OR', // combine status using a logical operator AND/OR
    recipientsFilter = null,
  }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      let filter = '';

      if (status) {
        const filterString = generateFilterString(status, combineStatusOp)

        if (filterString) {
          filter = filterString
        }
      }

      const params = {
        $top: 'all',
        $select: selectKeys.join(','),
        $orderby: `${orderBy.key} ${orderBy.order}`,
        $messageTaskOid: taskOid,
        // filter could be an empty string, in case avoid includeing it
        ...(filter && {$filter: filter}),

        ...(recipientsFilter && {[`$${recipientsFilter[0]}`]: recipientsFilter[1]}),
      }

      let uri = `/promoter/${promoterOid}/filter-fan-export`;

      const res = await this.$axios.get(
        uri,
        {
          params,
          headers: { Accept: responseType },
        },
      );
      // If we get list of fanOids, don't bother with filter then.
      // if (fanOids && fanOids.length > 0) {
      //   const query = fanOids.reduce((str, oid, index) => {
      //     str += `oid=${oid}`;
      //     if (index + 1 !== fanOids.length) {
      //       str += ` OR `;
      //     }

      //     return str;
      //   }, '');

      //   uri += `&$filter=${query}`;
      // }

      if (res.status === 200) {
        const fileName = `recipients-${moment().format('DD/MM/YYYY')}.csv`;
        magicDownload(res.data, fileName);
      } else {
        this.$arNotification.push({
          type: 'warning',
          message: res.data,
          timeout: 5000,
        });
      }
    } catch (err) {
      console.error(err);
      this.$arNotification.push({ type: 'error', message: 'Failed to export message recipients' });
    }
  },
};

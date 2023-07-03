import { ActionTree } from 'vuex';
import { RootState } from '@/store/modules/types';
import { OrdersState, Orders } from './types';
import { pruneSourceOrders } from './utils';
import { makeSafeOrderbyParams } from '~/utils/api/makeSafeOrderbyParams';

export const ordersActions: ActionTree<OrdersState, RootState> = {
  async FETCH_MORE_ORDERS(
    { state, rootState, commit, dispatch },
    {
      searchString = '',
      top = 50,
      orderBy = { key: 'sysMtime', order: 'desc' },
      filter = { conditions: [], logic: [] },
      selectKeys = null,
      reload = false,
      eventOid,
      dropdownFilter
    },
  ) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    if (reload) {
      commit('RESET_ORDERS');
    }

    // Stop trying to fetch if a fail has previously occurred - can be reset with a call to RESET_ORDERS
    if (state.hasFetchOrdersFailed) {
      console.error("FETCH_MORE_ORDERS request cancelled due to failed prior request.");
      return;
    }

    const filterStr = `(fanAccount[firstName] ILIKE "${searchString}" OR fanAccount[lastName] ILIKE "${searchString}" OR fanAccount[emailAddress] ILIKE "${searchString}")`

    try {
      commit('SET_IS_FETCHING_ORDERS', true);

      if (eventOid) {

        let filterCriteria = `eventOid=${eventOid}`

        if (searchString) {
          filterCriteria = `${filterCriteria} AND ${filterStr}`;
        }
        if (dropdownFilter != "all") {
          filterCriteria = `${filterCriteria} AND status=${dropdownFilter}`
        }

        const res = await this.$axios.get(`/promoter/${promoterOid}/event/${eventOid}/order?$filter=${filterCriteria}`, {
          params: {
            $top: top,
            $skip: state.orders.length,
            $orderby: makeSafeOrderbyParams(orderBy),
            $select: selectKeys ? selectKeys.join(',') : null,
            $count: false, // Never make it true due to performance issue
          },
        });

        // Manually add "name" to Fan Object
        const orders: Orders = pruneSourceOrders(res.data);

        if (reload) {
          commit('SET_ORDERS', orders);
        } else {
          commit('CONCAT_ORDERS', orders);
        }

        if (orders.length < top) {
          commit('SET_IS_NO_MORE_ORDERS', true);
        }
      }
    } catch (error) {
      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch orders' });
      commit('SET_HAS_FETCH_ORDERS_FAILED', true);
    } finally {
      commit('SET_IS_FETCHING_ORDERS', false);
    }
  },
};

import { ActionTree } from 'vuex'
import { RootState } from '@/store/modules/types';
import { PaymentState } from './types';
import { filterValidPaymentSources } from './utils';

export const paymentActions: ActionTree<PaymentState, RootState> = {
  async FETCH_PAYMENT_CUSTOMER({ rootState, commit }) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    try {
      const { data } = await this.$axios.get(`/promoter/${promoterOid}/payment-customer`, {
        params: { $filter: 'provider=chargebee' },
      });
      const paymentCustomer = data[0];
      if (paymentCustomer) {
        commit('SET_PAYMENT_CUSTOMER', paymentCustomer);
        commit('SET_PAYMENT_SOURCES', filterValidPaymentSources(paymentCustomer.paymentSources));
        commit('SET_PRIMARY_PAYMENT_SOURCE_PUID', paymentCustomer.additionalInfo.primaryPaymentSourceId);
      }
    } catch (error) {
      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch payment customer' });
    }
    commit('SET_PAYMENT_CUSTOMER_IS_FETCHED', true);
  },
  async FETCH_PAYMENT_SUBSCRIPTIONS({ state, commit, rootState }) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    try {
      commit('SET_IS_FETCHING_PAYMENT_SUBSCRIPTIONS', true);
      const response: any = await this.$axios.get(`/promoter/${promoterOid}/payment-subscription-plan`);
      const newData = response.data.map((m: any) => ({
        ...m.paymentSubscription,
        paymentPlan: m.paymentPlan,
      }));
      commit('SET_PAYMENT_SUBSCRIPTIONS', newData);
    } catch (error) {
      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch subscriptions' });
    } finally {
      commit('SET_IS_FETCHING_PAYMENT_SUBSCRIPTIONS', false);
    }
  },
  async CANCEL_PAYMENT_SUBSCRIPTIONS({ rootState }, {
    oids,
    reason,
  }: { oids: number[], reason: string }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    let successCount = 0;
    const cancelPaymentSubscription = async (oid: number) => {
      try {
        await this.$axios.delete(`/promoter/${promoterOid}/provider-payment-subscription/${oid}`, {
          headers : {
            'Reason': reason || '',
          },
        });
        successCount += 1;
      } catch (error) {
        console.error(error);
      }
    }
    const cancelPaymentSubscriptionPromises = oids.map((oid) => {
      return cancelPaymentSubscription(oid);
    });
    await Promise.all(cancelPaymentSubscriptionPromises);

    if (successCount === oids.length) {
      this.$arNotification.push({
        type: 'success',
        message: `Successfully cancelled subscription${successCount > 1 ? 's' : ''}`,
      });
    } else if (successCount > 0) {
      this.$arNotification.push({
        type: 'warning',
        message: 'Your cancellation was partially complete',
      });
    } else {
      this.$arNotification.push({
        type: 'error',
        message: `Failed to cancel subscription${oids.length > 1 ? 's' : ''}`,
      });
    }

    return successCount > 0;
  },
  async UNDO_PAYMENT_SUBSCRIPTION_CANCELLATIONS({ rootState, commit }, oids: number[]) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    let successCount = 0;
    const undoCancellationRequest = async (oid: number) => {
      try {
        commit('PUT_UNDO_SUBSCRIPTION_CANCELLATION_STATUS_MAP', {
          oid,
          isUndoing: true,
        });
        await this.$axios.patch(`/promoter/${promoterOid}/provider-payment-subscription/${oid}`, {
          status: 'active',
        });
        successCount += 1;
      } catch (error) {
        console.error(error);
        this.$arNotification.push({
          type: 'error',
          message: 'Failed to undo scheduled plan cancellation',
        });
      } finally {
        commit('PUT_UNDO_SUBSCRIPTION_CANCELLATION_STATUS_MAP', {
          oid,
          isUndoing: false,
        });
      }
    };
    const undoCancellationPromises = oids.map((oid) => {
      return undoCancellationRequest(oid);
    });
    await Promise.all(undoCancellationPromises);

    if (successCount === oids.length) {
      this.$arNotification.push({
        type: 'success',
        message: `Successfully undid scheduled plan cancellation${successCount > 1 ? 's' : ''}`,
      });
    } else if (successCount > 0) {
      this.$arNotification.push({
        type: 'warning',
        message: `Partially undid scheduled plan cancellation${successCount > 1 ? 's' : ''}`,
      });
    } else {
      this.$arNotification.push({
        type: 'error',
        message: `Failed to undo scheduled plan cancellation${oids.length > 1 ? 's' : ''}`,
      });
    }

    return successCount > 0;
  },
  async FETCH_PAYMENT_PLANS({ commit }, {}) {
    try {
      commit('SET_IS_FETCHING_PAYMENT_PLANS', true);
      const { data } = await this.$axios.get(`/payment-plan`, {
        params: { $filter: 'clientVisible=true AND archived=false AND provider=chargebee AND currency=USD' },
      });

      commit('SET_PAYMENT_PLANS', data);
    } catch (error) {
      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch plans' });
    } finally {
      commit('SET_IS_FETCHING_PAYMENT_PLANS', false);
    }
  },
  async FETCH_CURRENT_PAYMENT_PLAN({ commit }, paymentPlanOid) {
    try {
      commit('RESET_CURRENT_PAYMENT_PLAN');
      commit('SET_IS_FETCHING_CURRENT_PAYMENT_PLAN', true);
      const { data } = await this.$axios.get(`/payment-plan/${paymentPlanOid}`);
  
      commit('SET_CURRENT_PAYMENT_PLAN', data);
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch payment plan',
      });
      return false;
    } finally {
      commit('SET_IS_FETCHING_CURRENT_PAYMENT_PLAN', false);
    }
  },
  async CREATE_PAYMENT_SOURCE({ rootState, commit }, source) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    try {
      commit('SET_IS_CREATING_PAYMENT_SOURCE', true);
      const { data } = await this.$axios.post(`/promoter/${promoterOid}/provider-payment-source`, source);
  
      commit('ADD_TO_PAYMENT_SOURCES', data);
      this.$arNotification.push({
        type: 'success',
        message: 'Successfully added payment method',
      });
      return data;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to add payment method',
      });
      return null;
    } finally {
      commit('SET_IS_CREATING_PAYMENT_SOURCE', false);
    }
  },
  async CHANGE_PRIMARY_PAYMENT_SOURCE({ rootState, dispatch, commit }, paymentSource: PaymentSource) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    try {
      await this.$axios.post(`/promoter/${promoterOid}/payment-source/${paymentSource.oid}/primary`);
      dispatch('auth/VERIFY_TOKEN', null, { root: true });
      commit('SET_PRIMARY_PAYMENT_SOURCE_PUID', paymentSource.puid);
      this.$arNotification.push({ type: 'success', message: 'Successfully changed default payment method' });
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to change default payment method' });
      return false;
    }
  },
  async DELETE_PAYMENT_SOURCE({ rootState, commit }, paymentSourceOid) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    try {
      commit('SET_IS_DELETING_PAYMENT_SOURCE', true);
      await this.$axios.delete(`/promoter/${promoterOid}/provider-payment-source/${paymentSourceOid}`);
      commit('REMOVE_FROM_PAYMENT_SOURCES', paymentSourceOid);
      this.$arNotification.push({
        type: 'success',
        message: 'Successfully deleted payment method',
      });
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to delete payment method',
      });
      return false;
    } finally {
      commit('SET_IS_DELETING_PAYMENT_SOURCE', false);
    }
  },
  async FETCH_PAYMENT_SOURCES({ rootState, commit }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
  
    try {
      commit('SET_IS_FETCHING_PAYMENT_SOURCES', true);
      const { data } = await this.$axios.get(`/promoter/${promoterOid}/payment-source`, {
        params: {
          $filter: 'provider=chargebee',
        },
      });

      commit('SET_PAYMENT_SOURCES', filterValidPaymentSources(data));
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch payment methods',
      });
      return false;
    } finally {
      commit('SET_IS_FETCHING_PAYMENT_SOURCES', false);
    }
  },
  async FETCH_MORE_PAYMENT_INVOICES({ rootState, commit, state }, {
    top = 20,
    orderBy = { key: 'generatedAt', order: 'desc' },
    reload = false,
  }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    if (reload) {
      commit('RESET_PAYMENT_INVOICES');
    }
  
    try {
      commit('SET_IS_FETCHING_PAYMENT_INVOICES', true);
      const { data: { rows, count } } = await this.$axios.get(`/promoter/${promoterOid}/payment-invoice`, {
        params: {
          $count: true,
          $top: top,
          $skip: state.paymentInvoices.length,
          $orderby: orderBy ? `${orderBy.key} ${orderBy.order}` : null,
        },
      });

      if (reload) {
        commit('SET_PAYMENT_INVOICES', rows);
      } else {
        commit('CONCAT_PAYMENT_INVOICES', rows);
      }
      commit('SET_TOTAL_PAYMENT_INVOICE_COUNT', count);

      if (rows.length === 0) {
        commit('SET_HAS_NO_MORE_PAYMENT_INVOICES', true);
      }
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch payment invoices',
      });
      commit('SET_HAS_FETCH_PAYMENT_INVOICES_FAILED', true);
      return false;
    } finally {
      commit('SET_IS_FETCHING_PAYMENT_INVOICES', false);
    }
  },
  async DOWNLOAD_PAYMENT_INVOICE_PDF({ rootState }, paymentInvoiceOid) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
  
    try {
      const { data } = await this.$axios.post(`/promoter/${promoterOid}/payment-invoice/${paymentInvoiceOid}/pdf-url`);
  
      window.open(data['download-url']);
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to download payment invoice pdf',
      });
    }
  },
  async UPDATE_PAYMENT_SOURCE_BILLING_DETAILS({ rootState, commit }, {
    oid,
    changes,
  }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    try {
      commit('SET_IS_UPDATING_PAYMENT_SOURCE', true);
      await this.$axios.post(`/promoter/${promoterOid}/payment-source/${oid}/billing-details`, changes);

      commit('PATCH_IN_PAYMENT_SOURCES', {
        oid,
        changes: {
          additionalInfo: {
            card: changes,
          },
        },
      });
      this.$arNotification.push({
        type: 'success',
        message: 'Successfully updated billing details',
      });
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to update billing details',
      });
      return false;
    } finally {
      commit('SET_IS_UPDATING_PAYMENT_SOURCE', false);
    }
  }
};
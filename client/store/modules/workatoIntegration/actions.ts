import { ActionTree } from 'vuex';
import { RootState } from '@/store/modules/types';
import { WorkatoIntegrationState } from './types';
import { isErrorStatus } from "~/api/utils";
import { CustomApiError } from "~/api/types";
import { Integration } from "~/api/integrations/types";
import { PromoterIntegration } from "~/api/promoter-integrations/types";

export const workatoIntegrationActions: ActionTree<WorkatoIntegrationState, RootState> = {

  async FETCH_INTEGRATION({ rootState, commit }, { provider }) {
    try {
      commit('SET_IS_WAITING', true);
      const { data, status } = await this.$axios.sg.get(`/integration`);
      const integration = data.find((integration: Integration) => integration.provider === provider);
      commit('SET_INTEGRATION', integration);
      return true;
    } catch (error) {
      commit('SET_INTEGRATION', null);
      console.error(error);
      return false;
    } finally {
      commit('SET_IS_WAITING', false);
    }
  },

  async CREATE_PROVIDER_ACCOUNT({ commit, dispatch }, { integration, account }) {
    try {
      commit('SET_IS_WAITING', true);
      const { data, status } = await this.$axios.sg.post('/provider/' + integration.oid + '/accounts', account);
      commit('ADD_PROVIDER_ACCOUNT', data);
      return {
        success: true
      };
    } catch (error: any) {
      dispatch('HANDLE_PROVIDER_ERROR', { error, integration });
      return {
        success: false,
        message: error.response.data.message,
        httpStatusCode: error.response.status
      };
    } finally {
      commit('SET_IS_WAITING', false);
    }
  },

  async UPDATE_PROVIDER_ACCOUNT({ commit, dispatch }, { integration, account }) {
    try {
      commit('SET_IS_WAITING', true);
      const { data, status } = await this.$axios.sg.put('/provider/' + integration.oid + '/account/' + account.oid, account);
      return true;
    } catch (error: any) {
      dispatch('HANDLE_PROVIDER_ERROR', { error, integration });
      return false;
    } finally {
      commit('SET_IS_WAITING', false);
    }
  },

  async DELETE_PROVIDER_ACCOUNT({ commit, dispatch }, { integration, oid }) {
    try {
      commit('SET_IS_WAITING', true);
      const { data, status } = await this.$axios.sg.delete('/provider/' + integration.oid + '/account/' + oid);
      commit('REMOVE_PROVIDER_ACCOUNT', oid);
      return true;
    } catch (error: any) {
      dispatch('HANDLE_PROVIDER_ERROR', { error, integration });
      return false;
    } finally {
      commit('SET_IS_WAITING', false);
    }
  },

  async FETCH_PROVIDER_ACCOUNT({ commit, dispatch }, { integration, oid }) {
    try {
      commit('SET_IS_WAITING', true);
      const { data, status } = await this.$axios.sg.get('/provider/' + integration.oid + '/account/' + oid);
      return true;
    } catch (error: any) {
      commit('SET_PROVIDER_ACCOUNTS', []);
      dispatch('HANDLE_PROVIDER_ERROR', { error, integration });
      return false;
    } finally {
      commit('SET_IS_WAITING', false);
    }
  },

  async LIST_PROVIDER_ACCOUNTS({ commit, dispatch }, { integration }) {
    try {
      commit('SET_IS_WAITING', true);
      const { data, status } = await this.$axios.sg.get('/provider/' + integration.oid + '/accounts');
      commit('SET_PROVIDER_ACCOUNTS', data);
      return true;
    } catch (error: any) {
      commit('SET_PROVIDER_ACCOUNTS', []);
      dispatch('HANDLE_PROVIDER_ERROR', { error, integration });
      return false;
    } finally {
      commit('SET_IS_WAITING', false);
    }
  },

  async RESET_PROVIDER_ACCOUNT({ commit, dispatch }, { integration, oid }) {
    try {
      commit('SET_IS_WAITING', true);
      const { data, status } = await this.$axios.sg.post('/provider/' + integration.oid + '/account/' + oid + '/reset');
      return true;
    } catch (error: any) {
      dispatch('HANDLE_PROVIDER_ERROR', { error, integration });
      return false;
    } finally {
      commit('SET_IS_WAITING', false);
    }
  },

  // eslint-disable-next-line node/handle-callback-err
  HANDLE_PROVIDER_ERROR({}, { error, integration }) {
    // error contains useful information that we may be able to make use of
    // console.error(error?.response?.data);
    this.$arNotification.push({ type: 'error', message: 'An error occurred connecting to ' + integration.name });
  }
}

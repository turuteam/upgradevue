import { WorkatoIntegrationState, WorkatoProviderAccount } from './types';
import { Module } from 'vuex';
import { RootState } from '@/store/modules/types';
import { workatoIntegrationActions } from './actions';
import { clone } from '@/utils/helpers';
import { Integration } from "~/api/integrations/types";

export const initialWorkatoIntegrationState = (): WorkatoIntegrationState => ({
  integration: null,
  providerAccounts: [],
  isWaiting: false
});

const workatoIntegrationModule: Module<WorkatoIntegrationState, RootState> = {
  namespaced: true,
  state: initialWorkatoIntegrationState,
  actions: workatoIntegrationActions,
  mutations: {
    SET_IS_WAITING(state, isWaiting: boolean) {
      state.isWaiting = isWaiting;
    },

    SET_INTEGRATION(state, integration: Integration) {
      state.integration = clone(integration);
    },

    SET_PROVIDER_ACCOUNTS(state, providerAccounts: WorkatoProviderAccount[]) {
      state.providerAccounts = clone(providerAccounts);
    },

    ADD_PROVIDER_ACCOUNT(state, providerAccount: WorkatoProviderAccount) {
      state.providerAccounts = clone(state.providerAccounts.concat([ providerAccount ]));
    },

    REMOVE_PROVIDER_ACCOUNT(state, providerAccountOid: number) {
      state.providerAccounts = clone(state.providerAccounts.filter((account: WorkatoProviderAccount) => account.oid !== providerAccountOid));
    },

    RESET(state) {
      state.integration = null;
      state.providerAccounts = [];
      state.isWaiting = false;
    }

  },
  getters: {

  },

}

export default workatoIntegrationModule;

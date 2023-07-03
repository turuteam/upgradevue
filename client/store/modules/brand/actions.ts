import { ActionTree } from 'vuex'
import { RootState } from '@/store/modules/types';
import { BrandState } from './types';
import { SocialAction, AdditionalInfo } from '@/api/brands/types';

export const socialAccountActions: ActionTree<BrandState, RootState> = {
  async FETCH_ALL_BRANDS({ commit, rootState }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      const brands = await this.$api.brand.fetchAll(promoterOid);
      commit('SET_BRANDS', brands);
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to fetch brands',
      })
    }
  },
  async CREATE_BRAND({ commit, rootState }, options: { name: string, actions: SocialAction[], additionalInfo: AdditionalInfo }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      const brand = await this.$api.brand.create(promoterOid, options.name, options.actions, options.additionalInfo);
      commit('ADD_TO_BRANDS', brand);
      this.$arNotification.push({ type: 'success', message: `Successfully created new brand "${options.name}" with actions and privacy policy` });
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: `Failed to create new brand ${name}`,
      });
      return false;
    }
  },
  async PATCH_BRAND({ commit, rootState }, options: { oid: number, name: string, changes: { actions: SocialAction[], additionalInfo: AdditionalInfo }}) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      await this.$api.brand.patch(promoterOid, options.oid, options.changes);
      commit('PATCH_IN_BRANDS', {
        oid: options.oid,
        changes: options.changes,
      });
      this.$arNotification.push({ type: 'success', message: `Successfully saved actions and privacy policy to brand: ${options.name}` });
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to delete brand',
      });
      return false;
    }
  },
  async DELETE_BRAND({ commit, rootState }, options: { oid: number, name: string }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    try {
      await this.$api.brand.delete(promoterOid, options.oid);
      commit('REMOVE_FROM_BRANDS', options.oid);
      this.$arNotification.push({ type: 'success', message: `Successfully deleted brand: ${options.name}` });
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({
        type: 'error',
        message: 'Failed to delete brand',
      });
      return false;
    }
  },
}

import { Module } from "vuex";
import { RootState } from '@/store/modules/types';
import { BrandState } from './types';
import { socialAccountActions } from './actions';
import { Brand, SocialAction, AdditionalInfo } from '@/api/brands/types';
import { clone, mergeObjects } from '@/utils/helpers';

export const initialBrandState = (): BrandState => ({
  brands: [],
});

const socialAccountModule: Module<BrandState, RootState> = {
  namespaced: true,
  state: initialBrandState(),
  actions: socialAccountActions,
  getters: {
  },
  mutations: {
    SET_BRANDS(state, brands: Brand[]) {
      state.brands = clone(brands);
    },
    REMOVE_FROM_BRANDS(state, brandOid: number) {
      state.brands = clone(state.brands.filter(brand => brand.oid !== brandOid));
    },
    ADD_TO_BRANDS(state, brand: Brand) {
      state.brands = clone([brand].concat(state.brands));
    },
    PATCH_IN_BRANDS(state, options: { oid: number, changes: { actions: SocialAction[], additionalInfo: AdditionalInfo }}) {
      state.brands = clone(state.brands).map((brand: Brand) => {
        if (brand.oid !== options.oid) {
          return brand;
        }
        return mergeObjects(brand, options.changes);
      });
    },
  }
};

export default socialAccountModule;

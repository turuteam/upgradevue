import { Module } from "vuex";
import { RootState } from '@/store/modules/types';
import { clone, mergeObjects } from '@/utils/helpers';
import { PrivacyPortalState, ScratchPrivacyPortal } from './types';
import { privacyPortalActions } from './actions';
import { generateScratchPrivacyPortal } from './utils';

export const initialPrivacyPortalState = (): PrivacyPortalState => ({
  // Current Privacy Portal
  currentPrivacyPortal: null,
  isFetchingCurrentPrivacyPortal: false,
  hasFetchCurrentPrivacyPortalFailed: false,
  // Scratch Privacy Portal
  scratchPrivacyPortal: generateScratchPrivacyPortal({ emailAddress: null }),
  isUpdatingPrivacyPortal: false,
  // Create Privacy Portal
  isCreatingPrivacyPortal: false,
});

const privacyPortalModule: Module<PrivacyPortalState, RootState> = {
  namespaced: true,
  state: initialPrivacyPortalState,
  actions: privacyPortalActions,
  getters: {
    privacyPortalUrl(state): string | null {
      if (!state.currentPrivacyPortal) {
        return null;
      }
      return `https://${state.currentPrivacyPortal.subdomain}.${process.env.arPrivacyPortalDomain}`;
    },
    getPrivacyPortalImageUrl() {
      return function (privacyPortal: PrivacyPortal | ScratchPrivacyPortal): string | null {
        if (!privacyPortal.resources) {
          return null;
        }
        return privacyPortal.resources.find((resource: any) => resource.assetType === 'privacy-portal-image')?.url;
      };
    },
  },
  mutations: {
    // Current Privacy Portal
    RESET_CURRENT_PRIVACY_PORTAL(state) {
      const {
        currentPrivacyPortal,
        isFetchingCurrentPrivacyPortal,
        hasFetchCurrentPrivacyPortalFailed,
      } = initialPrivacyPortalState();
      state.currentPrivacyPortal = currentPrivacyPortal;
      state.isFetchingCurrentPrivacyPortal = isFetchingCurrentPrivacyPortal;
      state.hasFetchCurrentPrivacyPortalFailed = hasFetchCurrentPrivacyPortalFailed;
    },
    SET_CURRENT_PRIVACY_PORTAL(state, privacyPortal: PrivacyPortal) {
      state.currentPrivacyPortal = clone(privacyPortal);
    },
    PATCH_CURRENT_PRIVACY_PORTAL(state, changes) {
      state.currentPrivacyPortal = mergeObjects(state.currentPrivacyPortal, changes);
    },
    SET_IS_FETCHING_CURRENT_PRIVACY_PORTAL(state, isFetching: boolean) {
      state.isFetchingCurrentPrivacyPortal = isFetching;
    },
    SET_HAS_FETCH_CURRENT_PRIVACY_PORTAL_FAILED(state, hasFailed: boolean) {
      state.hasFetchCurrentPrivacyPortalFailed = hasFailed;
    },
    // Scratch Privacy Policy
    SET_SCRATCH_PRIVACY_POLICY(state, privacyPortal: PrivacyPortal) {
      state.scratchPrivacyPortal = clone(privacyPortal);
    },
    PATCH_SCRATCH_PRIVACY_POLICY(state, changes) {
      state.scratchPrivacyPortal = mergeObjects(state.scratchPrivacyPortal, changes);
    },
    RESET_SCRATCH_PRIVACY_POLICY(state, { emailAddress }: { emailAddress: string }) {
      state.scratchPrivacyPortal =
      generateScratchPrivacyPortal({ emailAddress });
    },
    SET_IS_UPDATING_PRIVACY_PORTAL(state, isUpdating: boolean) {
      state.isUpdatingPrivacyPortal = isUpdating;
    },
    // Create Privacy Portal
    SET_IS_CREATING_PRIVACY_PORTAL(state, isCreating: boolean) {
      state.isCreatingPrivacyPortal = isCreating;
    },
  },
};

export default privacyPortalModule;

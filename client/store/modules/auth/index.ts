import { Module } from "vuex";
import { RootState } from '@/store/modules/types';
import { clone } from '@/utils/helpers';
import { authActions } from './actions';
import {
  checkFeatureEnabled,
  checkIsAdminAccount,
  generateCountdown,
} from './utils';
import { AuthState } from './types';

export const initialAuthState = (): AuthState => ({
  account: null,
  xAuthToken: null,
  isDoingLogin: false,
  nextLoginRetryTime: null,
  isDoingSignup: false,
  isChangingPassword: false,
  isSendingResetPasswordEmail: false,
  nextSendResetPasswordEmailRetryTime: null,
  isResettingPassword: false,
  isVerifyingEmailAddress: false,
  storedEmailAddress: null,
  useSampling: false,
  emailEditorSetting: null,
});

const accountModule: Module<AuthState, RootState> = {
  namespaced: true,
  state: initialAuthState,
  actions: authActions,
  mutations: {
    SET_PROMOTER_ACCOUNT(state, payload: PromoterAccount) {
      state.account = clone(payload);
    },
    SET_X_AUTH_TOKEN(state, xAuthToken: string) {
      state.xAuthToken = xAuthToken;
    },
    // Login
    SET_IS_DOING_LOGIN(state, isDoingLogin: boolean) {
      state.isDoingLogin = isDoingLogin;
    },
    SET_NEXT_LOGIN_RETRY_TIME(state, newLoginRetryTime: number) {
      state.nextLoginRetryTime = newLoginRetryTime;
    },
    // Signup
    SET_IS_DOING_SIGNUP(state, isDoingSignup: boolean) {
      state.isDoingSignup = isDoingSignup;
    },
    // Change Password
    SET_IS_CHANING_PASSWORD(state, isChangingPassword: boolean) {
      state.isChangingPassword = isChangingPassword;
    },
    // Send Reset Password Email
    SET_IS_SENDING_RESET_PASSWORD_EMAIL(state, isSendingResetPasswordEmail: boolean) {
      state.isSendingResetPasswordEmail = isSendingResetPasswordEmail;
    },
    SET_NEXT_SEND_RESET_PASSWORD_EMAIL_RETRY_TIME(state, nextSendResetPasswordEmailRetryTime: number) {
      state.nextSendResetPasswordEmailRetryTime = nextSendResetPasswordEmailRetryTime;
    },
    // Reset Password
    SET_IS_RESETTING_PASSWORD(state, isResettingPassword: boolean) {
      state.isResettingPassword = isResettingPassword;
    },
    // Verify Email Address
    SET_IS_VERIFYING_EMAIL_ADDRESS(state, isVerifyingEmailAddress: boolean) {
      state.isVerifyingEmailAddress = isVerifyingEmailAddress;
    },
    // We use storedEmailAddress to temporarily store an email string when we want it to persist between pages of the app
    SET_STORED_EMAIL_ADDRESS(state, emailAddress: string) {
      state.storedEmailAddress = emailAddress;
    },
    // Sample insights to reduce the number of rows we need to generate the result 
    SET_SAMPLING(state, shouldSample: boolean) {
      state.useSampling = shouldSample; 
    },
    SET_EMAIL_EDITOR_SETTING(state, editor: string) {
      state.emailEditorSetting = editor;
    },
  },
  getters: {
    nextLoginRetryCountdown(state, getters, rootState): number {
      if (!state.nextLoginRetryTime) { return 0; }
      return generateCountdown(state.nextLoginRetryTime , rootState.application.applicationTime);
    },
    nextSendResetPasswordEmailRetryCountdown(state, getters, rootState): number {
      if (!state.nextSendResetPasswordEmailRetryTime) { return 0; }
      return generateCountdown(state.nextSendResetPasswordEmailRetryTime , rootState.application.applicationTime);
    },
    isAdminAccount(state) {
      if (!state.xAuthToken) { return false; }
      return checkIsAdminAccount(state.xAuthToken);
    },
    isFeatureEnabled(state) {
      return (featureKeys: string[]) => {
        if (!state.account || !state.account.features) { return false; }
        return checkFeatureEnabled(featureKeys, state.account.features);
      };
    },
    promoterAccountOid(state): number | null {
      return state.account?.oid || null;
    },
    userPromoterOid(state): number | null {
      if (!state.account) { return null; }
      return state.account.promoterOid === null || state.account.promoterOid === undefined ? null : state.account.promoterOid;
    },
  },
};

export default accountModule;

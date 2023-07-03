import { Module } from "vuex";
import { RootState } from '@/store/modules/types';
import { SignupFormCampaign, ScratchSignupFormCampaign } from '@/types/resources/signupFormCampaign';
import { MessageList } from '@/api/message-lists/types';
import { SignupFormState } from './types';
import { signupFormActions } from './actions';
import {
  initializeScratchSignupForm,
  patchMessageListInScratchSignupForm,
  patchOptinActionInScratchSignup,
  fillScratchSignupForm,
} from './utils';
import { clone, mergeObjects } from '~/utils/helpers';

export const initialSignupFormState = (): SignupFormState => ({
  // Signup Forms
  signupForms: [],
  signupFormsCount: 0,
  isFetchingSignupForms: false,
  hasFetchSignupFormsFailed: false,
  isNoMoreSignupForms: false,
  // Current Signup Form
  currentSignupForm: null,
  isFetchingSignupForm: false,
  isDeletingSignupForm: false,
  // Create Signup Form
  createdSignupForm: null,
  isCreatingSignupForm: false,
  // Create Scratch Signup Form
  isCreatingScratchSignupForm: false,
  // Patch Signup Form:
  isPatchingSignupForm: false,
  // Scratch Signup Form
  scratchSignupForm: initializeScratchSignupForm(),
  mockupMessageListForScratchSignupForm: null,
  messageListInScratchSignupForm: null,
});

const signupFormModule: Module<SignupFormState, RootState> = {
  namespaced: true,
  state: initialSignupFormState,
  actions: signupFormActions,
  getters: {
    channelValueInScratchSignupForm(state) {
      return (channel: 'sms' | 'email' | 'facebook:messenger'): string | false => {
        if (!state.scratchSignupForm.socialActions?.socialAccounts) {
          return false;
        }
        const channelAction = state.scratchSignupForm.socialActions.socialAccounts[0].actions.find(action => action.key === channel);
        return channelAction?.value || false;
      };
    },
    prunedScratchSignupFormForPreview(state) {
      let newSignupForm = clone(state.scratchSignupForm);
      newSignupForm.resourceOids = newSignupForm.resources.map((item: any) => item.oid);
      delete newSignupForm.eventOid;
      delete newSignupForm.event;
      delete newSignupForm.rewards;

      if (!newSignupForm.messageListOid && state.mockupMessageListForScratchSignupForm) {
        newSignupForm.messageListOid = state.mockupMessageListForScratchSignupForm.oid;
      }

      return newSignupForm;
    },
    prunedScratchSignupFormForServer(state) {
      const newSignupForm = clone(state.scratchSignupForm);
      newSignupForm.resourceOids = newSignupForm.resources.map((item: any) => item.oid);

      delete newSignupForm.resources;
      delete newSignupForm.availableActions;
      delete newSignupForm.resources;
      delete newSignupForm.event;
      delete newSignupForm.type;
      delete newSignupForm.endDate;
      delete newSignupForm.startDate;
      delete newSignupForm.promoterOid;

      return newSignupForm;
    },
  },
  mutations: {
    // Signup Forms
    RESET_SIGNUP_FORMS(state) {
      state.signupForms = [];
      state.signupFormsCount = 0;
      state.isNoMoreSignupForms = false;
      state.hasFetchSignupFormsFailed = false;
    },
    SET_SIGNUP_FORMS(state, signupForms: SignupFormCampaign[]) {
      state.signupForms = clone(signupForms);
    },
    CONCAT_SIGNUP_FORMS(state, signupForms: SignupFormCampaign[]) {
      state.signupForms = clone(state.signupForms.concat(signupForms));
    },
    ADD_TO_SIGNUP_FORMS(state, signupForm: SignupFormCampaign) {
      state.signupForms = [
        signupForm,
        ...clone(state.signupForms),
      ];
    },
    DELETE_FROM_SIGNUP_FORMS(state, signupFormOid: number) {
      state.signupForms = clone(state.signupForms.filter(item => item.oid !== signupFormOid));
    },
    SET_SIGNUP_FORMS_COUNT(state, count: number) {
      state.signupFormsCount = count;
    },
    SET_HAS_FETCH_SIGNUP_FORMS_FAILED(state, hasFailed: boolean) {
      state.hasFetchSignupFormsFailed = hasFailed;
    },
    SET_IS_NO_MORE_SIGNUP_FORMS(state, isNoMore: boolean) {
      state.isNoMoreSignupForms = isNoMore;
    },
    SET_IS_FETCHING_SIGNUP_FORMS(state, isFetching: boolean) {
      state.isFetchingSignupForms = isFetching;
    },
    // Signup Form
    RESET_CURRENT_SIGNUP_FORM(state) {
      state.currentSignupForm = null;
    },
    SET_CURRENT_SIGNUP_FORM(state, signupForm: SignupFormCampaign) {
      state.currentSignupForm = clone(signupForm);
    },
    SET_IS_FETCHING_SIGNUP_FORM(state, isFetching: boolean) {
      state.isFetchingSignupForm = isFetching;
    },
    SET_IS_DELETING_SIGNUP_FORM(state, isDeleting: boolean) {
      state.isDeletingSignupForm = isDeleting;
    },
    // Create Signup Form
    SET_CREATED_SIGNUP_FORM(state, signupForm: SignupFormCampaign) {
      state.createdSignupForm = clone(signupForm);
    },
    PUT_SLUR_URL_IN_CREATED_SIGNUP_FORM(state, urlSlug: string) {
      const newCreatedSignupForm: SignupFormCampaign = clone(state.createdSignupForm);
      newCreatedSignupForm.urlSlug = urlSlug;
      state.createdSignupForm = newCreatedSignupForm;
    },
    RESET_CREATED_SIGNUP_FORM(state) {
      state.createdSignupForm = null;
    },
    SET_IS_CREATING_SIGNUP_FORM(state, isCreating: boolean) {
      state.isCreatingSignupForm = isCreating;
    },
    // Create Scratch Signup Form
    SET_IS_CREATING_SCRATCH_SIGNUP_FORM(state, isCreating: boolean) {
      state.isCreatingScratchSignupForm = isCreating;
    },
    // Patching Signup Form
    SET_IS_PATCHING_SIGNUP_FORM(state, isPatching: boolean) {
      state.isPatchingSignupForm = isPatching;
    },
    // Edit Signup Form
    RESET_SCRATCH_SIGNUP_FORM(state) {
      state.scratchSignupForm = initializeScratchSignupForm();
      state.messageListInScratchSignupForm = null;
    },
    SET_SCRATCH_SIGNUP_FORM(state, scratchSignupForm: ScratchSignupFormCampaign) {
      state.scratchSignupForm = fillScratchSignupForm(scratchSignupForm);
      state.messageListInScratchSignupForm = null;
    },
    PUT_OPT_IN_ACTION_IN_SCRATCH_SIGNUP_FORM(
      state,
      payload: { optinType: 'sms' | 'email' | 'facebook:messenger', value: any },
    ) {
      const newScratchSignupForm = patchOptinActionInScratchSignup(
        state.scratchSignupForm,
        payload.optinType,
        payload.value,
      );
      if (!newScratchSignupForm) {
        return;
      }
      state.scratchSignupForm = newScratchSignupForm;
    },
    SET_DEFAULT_MESSAGE_LIST_IN_SCRATCH_SIGNUP_FORM(state, messageList: MessageList) {
      state.mockupMessageListForScratchSignupForm = clone(messageList);
    },
    SET_MESSAGE_LIST_IN_SCRATCH_SIGNUP_FORM(state, messageList: MessageList) {
      const newScratchSignupForm = patchMessageListInScratchSignupForm(
        state.scratchSignupForm,
        messageList,
      );
      if (!newScratchSignupForm) { return; }
      state.scratchSignupForm = newScratchSignupForm;
      state.messageListInScratchSignupForm = clone(messageList);
    },
    PUT_SCRATCH_SIGNUP_FORM(state, scratchSignupFormChanges) {
      const newScratchSignupForm = mergeObjects(state.scratchSignupForm, scratchSignupFormChanges);
      state.scratchSignupForm = newScratchSignupForm;
    },
  }
};

export default signupFormModule;

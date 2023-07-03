import { Module } from "vuex";
import { RootState } from '@/store/modules/types';
import { clone, mergeObjects } from '@/utils/helpers/';
import { MessageSenderState } from './types';
import { messageSenderActions } from './actions';
import { createScratchEmailSender } from './utils';
import { EmailSenderProperty } from '@/api/message-senders/types';

export const initialMessageSenderState = (): MessageSenderState => ({
  isFetchingMessageSenders: false,
  isPatchingMessageSenders: false,
  isCreatingMessageSender: false,
  isDeletingMessageSender: false,
  isResendingEmailVerification: false,
  messageSenders: [],
  currentMessageSender: null,
  scratchEmailSender: createScratchEmailSender(),
});


const messageSenderModule: Module<MessageSenderState, RootState> = {
  namespaced: true,
  state: initialMessageSenderState,
  actions: messageSenderActions,
  mutations: {
    SET_IS_FETCHING_MESSAGE_SENDERS(state, isFetching: boolean) {
      state.isFetchingMessageSenders = isFetching;
    },
    SET_IS_PATCHING_MESSAGE_SENDERS(state, isPatching: boolean) {
      state.isPatchingMessageSenders = isPatching;
    },
    SET_IS_CREATING_MESSAGE_SENDER(state, isCreating: boolean) {
      state.isCreatingMessageSender = isCreating;
    },
    SET_IS_RESENDING_EMAIL_VERIFICATION(state, isResending: boolean) {
      state.isResendingEmailVerification = isResending;
    },
    SET_IS_DELETING_MESSAGE_SENDER(state, isDeleting: boolean) {
      state.isDeletingMessageSender = isDeleting;
    },
    SET_MESSAGE_SENDERS(state, messageSenders: EmailSenderProperty[]) {
      state.messageSenders = clone(messageSenders);
    },
    ADD_TO_MESSAGE_SENDERS(state, messageSender: EmailSenderProperty) {
      state.messageSenders = clone([messageSender].concat(state.messageSenders));
    },
    PATCH_IN_MESSAGE_SENDERS(state, { oid, changes }) {
      state.messageSenders = clone(state.messageSenders.map(messageSender => {
        if (oid === messageSender.oid) {
          return mergeObjects(messageSender, changes);
        } else {
          return messageSender;
        }
      }));
    },
    REMOVE_FROM_MESSAGE_SENDERS(state, oid: number) {
      state.messageSenders = clone(state.messageSenders.filter( item => item.oid !== oid));
    },
    RESET_MESSAGE_SENDERS(state) {
      state.messageSenders = [];
    },
    // Current Message Sender
    SET_CURRENT_MESSAGE_SENDER(state, sender: EmailSenderProperty) {
      state.currentMessageSender = sender;
    },
    PATCH_CURRENT_MESSAGE_SENDER(state, changes) {
      state.currentMessageSender = mergeObjects(state.currentMessageSender, changes);
    },
    RESET_CURRENT_MESSAGE_SENDER(state) {
      state.currentMessageSender = null;
    },
    // Scratch Email Sender
    SET_SCRATCH_EMAIL_SENDER(state, emailSender: EmailSenderProperty) {
      state.scratchEmailSender = {
        oid: emailSender.oid,
        property: emailSender.property,
        additionalInfo: {
          senderName: emailSender.additionalInfo.senderName,
          businessAddress: emailSender.additionalInfo.businessAddress,
        },
      };
    },
    RESET_SCRATCH_EMAIL_SENDER(state) {
      state.scratchEmailSender = createScratchEmailSender();
    },
    PATCH_SCRATCH_EMAIL_SENDER(state, changes) {
      state.scratchEmailSender = mergeObjects(state.scratchEmailSender, changes);
    },
  },
  getters: {
    currentMessageSenderNotVerified(state) {
      if (!state.currentMessageSender) { return false; }
      return !state.currentMessageSender.verified;
    },
    isScratchEmailSenderComplete(state) {
      if (
        state.scratchEmailSender.property &&
        state.scratchEmailSender.additionalInfo &&
        state.scratchEmailSender.additionalInfo.senderName &&
        state.scratchEmailSender.additionalInfo.businessAddress
      ) {
        return true;
      }

      return false;
    },
  },
};

export default messageSenderModule;

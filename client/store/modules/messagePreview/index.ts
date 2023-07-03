import { Module } from "vuex";
import { RootState } from "@/store/modules/types";
import { clone } from '@/utils/helpers';
import { messagePreviewActions } from './actions';
import { MessagePreviewState } from "./types";
import {
    injectInformationToUnlayerHtml,
    injectInformationToRichTextHtml,
    injectInformationToBeefreeHtml,
  } from '@/utils/email';

export const initialMessagePreviewState = (): MessagePreviewState => ({
  message: {
    presentation: {
      hideDefaultEmailFooter: false,
      templateType: null,
      template: {},
    },
    messageBody: {
      previewText: ''
    },
    senderName: null,
    businessAddress: null,
  },
  hash: null,
  emailHtml: null,
  error: null,
});

const messagePreviewModule: Module<MessagePreviewState, RootState> = {
  namespaced: true,
  state: initialMessagePreviewState,
  actions: messagePreviewActions,
  mutations: {
    RESET_STATE(state) {
      state = initialMessagePreviewState()
    },
    SET_MESSAGE_PREVIEW(state, message) {
      state.message = clone(message);
    },
    SET_RESOURCE_HASH(state, data) {
      state.hash = data;
    },
    SET_EMAIL_HTML(state, html) {
      state.emailHtml = clone(html);
    },
    SET_PREVIEW_ERROR(state, error) {
      state.error = error;
    },
  },
  getters: {
    injectInfoToPreviewEmail(state) {
      return () => {
        if (state.message.presentation.templateType !== 'beefree' && !state.emailHtml) { return; }
        const hideDefaultEmailFooter = !!state.message.presentation.hideDefaultEmailFooter;
        const previewText = state.message.messageBody.previewText;
        const senderName = state.message.senderName;
        const businessAddress = state.message.businessAddress;

        switch (state.message.presentation.templateType) {
          case 'unlayer':
            return injectInformationToUnlayerHtml(
              state.emailHtml,
              previewText,
              hideDefaultEmailFooter ? null : senderName,
              hideDefaultEmailFooter ? null : businessAddress,
              !hideDefaultEmailFooter,
            );
          case 'beefree':
            return injectInformationToBeefreeHtml(
              previewText,
              hideDefaultEmailFooter ? null : senderName,
              hideDefaultEmailFooter ? null : businessAddress,
              !hideDefaultEmailFooter,
            );
          case 'rich-text':
            return injectInformationToRichTextHtml(
              state.emailHtml,
              previewText,
              hideDefaultEmailFooter ? null : senderName,
              hideDefaultEmailFooter ? null : businessAddress,
              !hideDefaultEmailFooter,
            );
          default:
            return null;
        }
      };
    },
  },
};

export default messagePreviewModule;

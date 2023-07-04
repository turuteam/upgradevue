import { Module } from "vuex";
import { RootState } from '@/store/modules/types';
import { clone, mergeObjects, convertToCamelCase } from '@/utils/helpers';
import { EmailSenderProperty } from '@/api/message-senders/types';
import {
  MessageState,
  ScratchSimpleMessageChanges,
  ScratchEmailMessageChanges,
  CsvPreviewContact,
  ConversionTableData,
  ConversionGraphTimeseries,
} from './types';
import { RecipientFilter } from '@/store/modules/message/types';
import {
  injectInformationToUnlayerHtml,
  injectInformationToRichTextHtml,
  injectInformationToBeefreeHtml,
  getPreviewAndFooterHtml,
} from '@/utils/email';
import { messageActions } from './actions';
import {
  getMessageUiStatus,
  getAvailableMessageOptionsMap,
  getInitialSmsPreview,
  getInitialScratchSimpleMessage,
  getInitialScratchEmailMessage,
  countSmsPreviewSegments,
  calculateScheduleMessageCountdown,
  generateScheduledMessageCountdownCopy,
  generateScheduledMessageCountdownTime,
  getDyanmicTagsFromContent,
  getMessageCurrency,
  getNoneExistingDyanmicTags,
  generateNonExistingDynamicTagsErrorMessage,
  generatePreviewCountacts,
  countSmsBodyLength,
  keepKeysInObject,
  hasEmptyKeysInObject,
} from './utils';
import { mergeDynamicTags } from '@/utils/message';

export const initialMessageState = (): MessageState => ({
  // Additional Dynamic Tags
  additionalDynamicTags: [],
  defaultEmailDynamicTags: ['email_address', 'first_name'],
  defaultSmsDynamicTags: ['mobile_number'],
  // Sratch Message
  isSavingMessageAsDraft: false,
  isSendingOutMessage: false,
  isSendingTestEmail: false,
  // Scratch Simple Message
  smsMessagePreview: getInitialSmsPreview(),
  scratchSimpleMessage: getInitialScratchSimpleMessage(),
  fallbackDynamicTagsForScratchEmailMessage: [],
  // Scratch Email Message
  scratchEmailMessage: getInitialScratchEmailMessage(),
  scratchEmailMessageUnsaved: false,
  fallbackDynamicTagsForScratchSimpleMessage: [],
  scratchEmailMessageAbList: {},
  // Scratch Email Html
  savedEmail: null,
  scratchEmail: null,
  isUpdatingEmail: false,
  isFetchingSavedEmail: false,
  // Messages
  messages: [],
  isFetchingMessages: false,
  isNoMoreMessages: false,
  hasFetchMessagesFailed: false,
  // Current Message
  currentSelectedMessage: null,
  isFetchingMessage: false,
  // Csv Preview Contacts
  csvPreviewContacts: null,
  selectedCsvPreviewContactIndex: null,
  displayCsvPreviewContacts: false,
  isFetchingSmsCost: false,
  smsCostFailedToFetch: false,
  // Message states timeseries
  isFetchingMessageActionStatsTimeseries: false,
  messageActionStatsTimeseries: [],
  // Message delivery stats
  isFetchingMessageDeliveryStats: false,
  messageDeliveryStats: null,
  // Conversions
  conversionSelectedEvents: [],
  conversionStats: [],
  conversionTableData: [],
  conversionGraphTimeseries: [],
  isFetchingConversionTableData: false,
  isFetchingConversionGraph: false,
  isFetchingConversionStats: false,
  conversionTableSearch: '',
  conversionTableCount: 0,
  isCalculationsFinished: true,
  calculationsTimeoutId: null,
});


const messageModule: Module<MessageState, RootState> = {
  namespaced: true,
  state: initialMessageState,
  actions: messageActions,
  mutations: {
    // Default Dynamic Tags
    RESET_ADDITIONAL_DYNAMIC_TAGS(state) {
      state.additionalDynamicTags = initialMessageState().additionalDynamicTags;
    },
    SET_ADDITIONAL_DYNAMIC_TAGS(state, dynamicTags: string[]) {
      state.additionalDynamicTags = clone(dynamicTags);
    },
    // Scratch Message
    SET_IS_SAVING_MESSAGE_AS_DRAFT(state, isSaving: boolean) {
      state.isSavingMessageAsDraft = isSaving;
    },
    SET_IS_SENDING_OUT_MESSAGE(state, isSending: boolean) {
      state.isSendingOutMessage = isSending;
    },
    SET_IS_SENDING_TEST_EMAIL(state, isSending: boolean) {
      state.isSendingTestEmail = isSending;
    },
    // Scratch Email Message
    RESET_SCRATCH_EMAIL_MESSAGE(state) {
      state.scratchEmailMessage = getInitialScratchEmailMessage();
    },
    SET_SCRATCH_EMAIL_MESSAGE(state, scratchEmailMessage: ScratchEmailMessage) {
      const newScratchEmailMessage: ScratchEmailMessage = clone(scratchEmailMessage);
      // For backward-compatible, if templateType is not given, default to 'unlayer'
      if (!newScratchEmailMessage.meta.presentation.templateType) {
        newScratchEmailMessage.meta.presentation.templateType = 'unlayer';
      }
      state.scratchEmailMessage = newScratchEmailMessage;
    },
    PATCH_SCRATCH_EMAIL_MESSAGE(state, changes: ScratchEmailMessageChanges) {
      state.scratchEmailMessage = mergeObjects(state.scratchEmailMessage, changes);
    },
    PATCH_AB_EMAIL_MESSAGE(state, meta) {
      const a = clone(state.scratchEmailMessageAbList["A"]);
      a.meta.messageBody.subject = meta.subjectA;
      a.meta.messageBody.previewText = meta.previewA;
      const b = clone(state.scratchEmailMessageAbList["B"]);
      b.meta.messageBody.subject = meta.subjectB;
      b.meta.messageBody.previewText = meta.previewB;
      const x = {A:  a, B: b };
      state.scratchEmailMessageAbList = x;
    },
    CREATE_AB_EMAIL_MESSAGE(state, data = null) { 
      if (data && data.meta.length > 1){
        const xa :ScratchEmailMessage = clone(data);
        xa.meta = data.meta[0];
        const xb :ScratchEmailMessage = clone(data);
        xb.meta = data.meta[1];
        const x = {A:  xa, B: xb };
        state.scratchEmailMessageAbList = x;
      } else {
        const orignalMessage :ScratchEmailMessage = clone(state.scratchEmailMessage);
        const x = {A:  orignalMessage, B: orignalMessage};
        state.scratchEmailMessageAbList = x;
      }
    },
    UPDATE_AB_EMAIL_STATE(state, type){
      const updatedData = clone(state.scratchEmailMessage);
      state.scratchEmailMessageAbList[type] = updatedData;
    },
    REMOVE_AB_EMAIL_MESSAGE(state){
      const orignalMessage = clone(state.scratchEmailMessageAbList["A"]);
      state.scratchEmailMessage = orignalMessage;
    },
    SWITCH_AB_EMAIL_STATE(state, type) {
      if (type.type === 'A'){
        state.scratchEmailMessageAbList["B"] = type.data;
      } else {
        state.scratchEmailMessageAbList["A"] = type.data;
      }
      const newScratchEmailMessage: ScratchEmailMessage = clone(state.scratchEmailMessageAbList[type.type]);
      const orignalMessage :ScratchEmailMessage = clone(state.scratchEmailMessage);
      orignalMessage.meta.presentation =  newScratchEmailMessage.meta.presentation
      orignalMessage.meta.messageBody =  newScratchEmailMessage.meta.messageBody
      state.scratchEmailMessage = orignalMessage;
    },
    SET_SCRATCH_EMAIL_MESSAGE_UNSAVED(state, unsaved: boolean) {
      state.scratchEmailMessageUnsaved = unsaved;
    },
    // Scratch Email Html
    RESET_SCRATCH_EMAIL_TEMPLATE(state) {
      state.scratchEmail = initialMessageState().scratchEmail;
    },
    SET_SCRATCH_EMAIL_TEMPLATE(state, html: string) {
      state.scratchEmail = html;
    },
    SET_IS_UPDATING_EMAIL(state, isUploading: boolean) {
      state.isUpdatingEmail = isUploading;
    },
    SET_IS_FETCHING_SAVED_EMAIL(state, isFetching: boolean){
      state.isFetchingSavedEmail = isFetching;
    },
    SET_SAVED_EMAIL(state, template: string) {
      state.savedEmail = template;
    },
    // Scratch Simple Message
    RESET_SMS_MESSAGE_PREVIEW(state) {
      state.smsMessagePreview = getInitialSmsPreview();
    },
    PUT_SMS_MESSAGE_PREVIEW(state, smsMessagePreview: SMSMessagePreview) {
      state.smsMessagePreview = mergeObjects(state.smsMessagePreview, smsMessagePreview);
    },
    RESET_SCRATCH_SIMPLE_MESSAGE(state) {
      state.scratchSimpleMessage = getInitialScratchSimpleMessage();
    },
    SET_SCRATCH_SIMPLE_MESSAGE(state, scratchSimpleMessage: ScratchSimpleMessage) {
      const newScratchSimpleMessage: ScratchSimpleMessage = clone(scratchSimpleMessage);
      // They both have to exist, otherwise set both to null
      if (!newScratchSimpleMessage.meta.presentation.timeZone || !newScratchSimpleMessage.scheduledAt) {
        newScratchSimpleMessage.meta.presentation.timeZone = null;
        newScratchSimpleMessage.scheduledAt = null;
      }
      state.scratchSimpleMessage = clone(newScratchSimpleMessage);
    },
    SET_FALLBACK_DYNAMIC_TAGS_FOR_SCRATCH_EMAIL_MESSAGE(state, fallbackDynamicTags: string[]) {
      state.fallbackDynamicTagsForScratchEmailMessage = fallbackDynamicTags;
    },
    SET_FALLBACK_DYNAMIC_TAGS_FOR_SCRATCH_SIMPLE_MESSAGE(state, fallbackDynamicTags: string[]) {
      state.fallbackDynamicTagsForScratchSimpleMessage = fallbackDynamicTags;
    },
    TIDY_UP_FALLBACK_DYNAMIC_TAGS_IN_EMAIL_MESSAGE(state, fallbackDynamicTags: string[]) {
      const newScratchEmailMessage: ScratchEmailMessage = clone(state.scratchEmailMessage);
      const fallbackDynamicTagsInCamelCase = fallbackDynamicTags.map(k => convertToCamelCase(k));
      newScratchEmailMessage.meta.fallbackDynamicTags =
        keepKeysInObject(
          newScratchEmailMessage.meta.fallbackDynamicTags || {},
          fallbackDynamicTagsInCamelCase);
      state.scratchEmailMessage = newScratchEmailMessage;
    },
    TIDY_UP_FALLBACK_DYNAMIC_TAGS_IN_SIMPLE_MESSAGE(state, fallbackDynamicTags: string[]) {
      const newScratchSimpleMessage: ScratchSimpleMessage = clone(state.scratchSimpleMessage);
      const fallbackDynamicTagsInCamelCase = fallbackDynamicTags.map(k => convertToCamelCase(k));
      newScratchSimpleMessage.meta.fallbackDynamicTags =
        keepKeysInObject(
          newScratchSimpleMessage.meta.fallbackDynamicTags || {},
          fallbackDynamicTagsInCamelCase);
      state.scratchSimpleMessage = newScratchSimpleMessage;
    },
    REMOVE_DYNAMIC_TAGS_IN_SCRATCH_EMAIL_MESSAGE(state) {
      const newScratchEmailMessage: ScratchEmailMessage = clone(state.scratchEmailMessage);

      newScratchEmailMessage.meta.dynamicTagHeaders = [];
      newScratchEmailMessage.meta.tagsResourceOid = null;

      state.scratchEmailMessage = newScratchEmailMessage;
    },
    REMOVE_DYNAMIC_TAGS_IN_SCRATCH_SIMPLE_MESSAGE(state) {
      const newScratchSimpleMessage: ScratchSimpleMessage = clone(state.scratchSimpleMessage);

      newScratchSimpleMessage.meta.dynamicTagHeaders = [];
      newScratchSimpleMessage.meta.tagMaxWidthMap = {};
      newScratchSimpleMessage.meta.tagsResourceOid = null;

      state.scratchSimpleMessage = newScratchSimpleMessage;
    },
    PUT_FILTERING_IN_SCRATCH_EMAIL_MESSAGE(state, targetingValues: RecipientFilter | null) {
      const newScratchEmailMessage: ScratchEmailMessage = clone(state.scratchEmailMessage);
      newScratchEmailMessage.meta.recipientFilter = clone(targetingValues);
      state.scratchEmailMessage = newScratchEmailMessage;
    },
    PUT_FILTERING_IN_SCRATCH_SIMPLE_MESSAGE(state, targetingValues: RecipientFilter | null) {
      const newScratchSimpleMessage: ScratchSimpleMessage = clone(state.scratchSimpleMessage);
      newScratchSimpleMessage.meta.recipientFilter = clone(targetingValues);
      state.scratchSimpleMessage = newScratchSimpleMessage;
    },
    PUT_SCRATCH_SIMPLE_MESSAGE(state, scratchSimpleMessageChanges: ScratchSimpleMessageChanges) {
      const newScratchSimpleMessage = mergeObjects(state.scratchSimpleMessage, scratchSimpleMessageChanges);
      // Override tagMaxWidthMap, instead of merging
      if (scratchSimpleMessageChanges.meta && scratchSimpleMessageChanges.meta.tagMaxWidthMap) {
        newScratchSimpleMessage.meta.tagMaxWidthMap = scratchSimpleMessageChanges.meta.tagMaxWidthMap;
      }
      state.scratchSimpleMessage = newScratchSimpleMessage;
    },
    // Messages
    RESET_MESSAGES(state) {
      state.isNoMoreMessages = false;
      state.hasFetchMessagesFailed = false;
      state.messages = [];
    },
    CONCAT_MESSAGES(state, messages) {
      state.messages = clone(state.messages.concat(messages));
    },
    REMOVE_MESSAGE_FROM_MESSAGES(state, messageOid: number) {
      state.messages = clone(state.messages.filter(msg => msg.oid !== messageOid));
    },
    SET_IS_FETCHING_MESSAGES(state, isFetching) {
      state.isFetchingMessages = isFetching;
    },
    SET_HAS_FETCH_MESSAGES_FAILED(state, hasFailed) {
      state.hasFetchMessagesFailed = hasFailed;
    },
    SET_IS_NO_MORE_MESSAGES(state, isNoMoreMessages) {
      state.isNoMoreMessages = isNoMoreMessages;
    },
    // Current message
    SET_CURRENT_SELECTED_MESSAGE(state, message: SimpleMessage | EmailMessage) {
      state.currentSelectedMessage = clone(message);
    },
    RESET_CURRENT_SELECTED_MESSAGE(state) {
      state.currentSelectedMessage = null;
    },
    SET_IS_FETCHING_MESSAGE(state, isFetchingMessage) {
      state.isFetchingMessage = isFetchingMessage;
    },
    // Csv Preview Contacts
    RESET_CSV_PREVIEW_CONTACTS(state) {
      const { csvPreviewContacts, selectedCsvPreviewContactIndex, displayCsvPreviewContacts } = initialMessageState();
      state.csvPreviewContacts = csvPreviewContacts;
      state.selectedCsvPreviewContactIndex = selectedCsvPreviewContactIndex;
      state.displayCsvPreviewContacts = displayCsvPreviewContacts;
    },
    SET_CSV_PREVIEW_CONTACTS(state, { headers, rows }) {
      state.csvPreviewContacts = generatePreviewCountacts(headers, rows);
      state.selectedCsvPreviewContactIndex = 0;
    },
    SET_SELECTED_CSV_PREVIEW_CONTACTS_INDEX(state, index: number) {
      state.selectedCsvPreviewContactIndex = index;
    },
    TOGGLE_DISPLAY_CSV_PREVIEW_CONTACTS(state) {
      state.displayCsvPreviewContacts = !state.displayCsvPreviewContacts;
    },
    SET_IS_FETCHING_SMS_COST(state, isFetching: boolean) {
      state.isFetchingSmsCost = isFetching;
    },
    SET_SMS_COST_FAILED_TO_FETCH(state, hasFailed: boolean) {
      state.smsCostFailedToFetch = hasFailed;
    },
    SET_MESSAGE_ACTION_STATS_TIMESERIES(state, timeseries) {
      const ts = clone(timeseries);
      ['daily', 'weekly'].forEach((key) =>{
        ts[key] = ts[key].reverse();
      });

      state.messageActionStatsTimeseries = ts;
    },
    SET_IS_FETCHING_MESSAGE_ACTION_STATS_TIMESERIES(state, isFetching: boolean) {
      state.isFetchingMessageActionStatsTimeseries = isFetching;
    },
    SET_MESSAGE_DELIVERY_STATS(state, stats) {
      state.messageDeliveryStats = stats;
    },
    SET_IS_FETCHING_MESSAGE_DELIVERY_STATS(state, isFetching: boolean) {
      state.isFetchingMessageDeliveryStats = isFetching;
    },

    // Conversions
    SET_CONVERSIONS_STATS(state, stats) {
      state.conversionStats = stats;
    },

    SET_CONVERSIONS_SELECTED_EVENTS(state, selectedEvents: string[]) {
      state.conversionSelectedEvents = selectedEvents.map(oid => Number(oid));
    },

    SET_CONVERSIONS_TABLE_DATA(state, tableData: ConversionTableData[]) {
      state.conversionTableData = tableData;
    },

    SET_IS_FETCHING_CONVERSIONS_STATS(state, isFetching: boolean) {
      state.isFetchingConversionStats = isFetching;
    },

    SET_IS_FETCHING_CONVERSIONS_TABLE_DATA(state, isFetching: boolean) {
      state.isFetchingConversionTableData = isFetching;
    },

    SET_IS_FETCHING_CONVERSIONS_GRAPH(state, isFetching: boolean) {
      state.isFetchingConversionGraph = isFetching;
    },

    SET_CONVERSIONS_GRAPH_TIMESERIES(state, graphData: ConversionGraphTimeseries[]) {
      state.conversionGraphTimeseries = graphData;
    },

    SET_CONVERSION_TABLE_SEARCH(state, search: string) {
      state.conversionTableSearch = search
    },

    SET_CONVERSION_TABLE_COUNT(state, count: number) {
      state.conversionTableCount = count
    },

    SET_IS_CALCULATIONS_FINISHED(state, isFinished: boolean) {
      state.isCalculationsFinished = isFinished;
    },
    SET_CALCULATIONS_TIMEOUT_ID(state, value: number | null) {
      state.calculationsTimeoutId = value;
    },
  },
  getters: {
    hasAdditionalDynamicTags(state) {
      return state.additionalDynamicTags.length !== 0;
    },
    availableDynamicTagsAll(_, getters) {
      let allTags = getters.availableDynamicTagsInEmailMessage;
      return allTags.filter((item:any, pos:any) => allTags.indexOf(item) === pos);
    },
    availableDynamicTagsInSimpleMessage(state) {
      const availableDynamicTags = mergeDynamicTags(state.defaultSmsDynamicTags, state.scratchSimpleMessage.meta.dynamicTagHeaders);
      return availableDynamicTags;
    },
    availableDynamicTagsInEmailMessage(state) {
      const availableDynamicTags = mergeDynamicTags(state.defaultEmailDynamicTags, state.additionalDynamicTags, state.scratchEmailMessage.meta.dynamicTagHeaders);
      return availableDynamicTags;
    },
    isFallbackDynamicTagsCompleteInSimpleMessage(state) {
      return !hasEmptyKeysInObject(state.scratchSimpleMessage.meta.fallbackDynamicTags || {});
    },
    isFallbackDynamicTagsCompleteInEmailMessage(state) {
      return !hasEmptyKeysInObject(state.scratchEmailMessage.meta.fallbackDynamicTags || {});
    },
    hasNonExistingTagsInSimpleMessage(state) {
      const availableDynamicTags = mergeDynamicTags(state.defaultSmsDynamicTags, state.scratchSimpleMessage.meta.dynamicTagHeaders);
      const nonExistingDynamiTags = getNoneExistingDyanmicTags(
        state.scratchSimpleMessage.meta.messageBody,
        availableDynamicTags,
      );
      return nonExistingDynamiTags.length > 0;
    },
    hasNonExistingTagsInEmailMessage(state) {
      const availableDynamicTags = mergeDynamicTags(state.defaultEmailDynamicTags, state.additionalDynamicTags, state.scratchEmailMessage.meta.dynamicTagHeaders);
      const nonExistingDynamiTags = getNoneExistingDyanmicTags(
        state.scratchEmail || '',
        availableDynamicTags,
      );
      return nonExistingDynamiTags.length > 0;
    },
    nonExistingTagsInSimpleMessageErrorCopy(state): string | null {
      const availableDynamicTags = mergeDynamicTags(state.defaultSmsDynamicTags, state.scratchSimpleMessage.meta.dynamicTagHeaders);
      const nonExistingDynamiTags = getNoneExistingDyanmicTags(
        state.scratchSimpleMessage.meta.messageBody,
        availableDynamicTags,
      );
      return generateNonExistingDynamicTagsErrorMessage(nonExistingDynamiTags, 'message');
    },
    nonExistingDynamicTagsInEmailMessageCopy(state): string | null {
      const availableDynamicTags = mergeDynamicTags(state.defaultEmailDynamicTags, state.additionalDynamicTags, state.scratchEmailMessage.meta.dynamicTagHeaders);
      const nonExistingDynamiTags = getNoneExistingDyanmicTags(
        state.scratchEmail || '',
        availableDynamicTags,
      );
      return generateNonExistingDynamicTagsErrorMessage(nonExistingDynamiTags, 'email');
    },
    getBeefreePreviewAndFooterHtmlForInjection(state) {
      return (messageSender: EmailSenderProperty | null) => {
        if (!state.scratchEmailMessage) { return; }
        const hideDefaultEmailFooter = !!state.scratchEmailMessage.meta.presentation.hideDefaultEmailFooter;
        const previewText = state.scratchEmailMessage.meta.messageBody.previewText;
        const senderName = messageSender?.additionalInfo.senderName || null;
        const businessAddress = messageSender?.additionalInfo.businessAddress || null;
        // Ensure that the above strings are sanitized before inserting them (sanitization currently
        // occurs within below functions)

        return getPreviewAndFooterHtml(
          previewText,
          hideDefaultEmailFooter ? null : senderName,
          hideDefaultEmailFooter ? null :businessAddress,
          !hideDefaultEmailFooter,
        );
      };
    },
    injectInfoToScratchEmail(state) {
      return (messageSender: EmailSenderProperty | null) => {
        if (!state.scratchEmail || !state.scratchEmailMessage) { return; }
        const hideDefaultEmailFooter = !!state.scratchEmailMessage.meta.presentation.hideDefaultEmailFooter;
        const previewText = state.scratchEmailMessage.meta.messageBody.previewText;
        const senderName = messageSender?.additionalInfo.senderName || null;
        const businessAddress = messageSender?.additionalInfo.businessAddress || null;
        // Ensure that the above strings are sanitized before inserting them (sanitization currently
        // occurs within below functions)
        switch (state.scratchEmailMessage.meta.presentation.templateType) {
          case 'unlayer':
            return injectInformationToUnlayerHtml(
              state.scratchEmail,
              previewText,
              hideDefaultEmailFooter ? null : senderName,
              hideDefaultEmailFooter ? null :businessAddress,
              !hideDefaultEmailFooter,
            );
          case 'beefree':
            return injectInformationToBeefreeHtml(
              previewText,
              hideDefaultEmailFooter ? null : senderName,
              hideDefaultEmailFooter ? null :businessAddress,
              !hideDefaultEmailFooter,
            );
          case 'rich-text':
            return injectInformationToRichTextHtml(
              state.scratchEmail,
              previewText,
              hideDefaultEmailFooter ? null : senderName,
              hideDefaultEmailFooter ? null :businessAddress,
              !hideDefaultEmailFooter,
            );
          default:
            return null;
        }
      };
    },
    scratchEmailMessageCannotBeTested(state): boolean {
      if (!state.scratchEmailMessage) {
        return false;
      }
      return !state.scratchEmailMessage.meta.messageBody.subject ||
        !state.scratchEmailMessage.meta.email ||
        !state.scratchEmailMessage.meta.email.promoterPropertyOid;
    },
    scratchEmailMessageCampaignOid(state): number | null {
      return state.scratchEmailMessage.meta.initiator?.campaignOid || null;
    },
    scratchEmailMessageEventOid(state): number | null {
      return state.scratchEmailMessage.meta.initiator?.eventOid || null;
    },
    scratchSimpleMessageCampaignOid(state): number | null {
      return state.scratchSimpleMessage.meta.initiator?.campaignOid || null;
    },
    scratchSimpleMessageEventOid(state): number | null {
      return state.scratchSimpleMessage.meta.initiator?.eventOid || null;
    },
    getSmsMessagePreviewSegmentsCount(state) {
      return (scratchSimpleMessage: ScratchSimpleMessage) =>
        countSmsPreviewSegments(
          scratchSimpleMessage.meta.tagMaxWidthMap,
          scratchSimpleMessage.meta.messageBody + state.smsMessagePreview.optOutMessage,
        );
    },
    smsMessagePreviewSegmentsCount(state) {
      return countSmsPreviewSegments(
        state.scratchSimpleMessage.meta.tagMaxWidthMap,
        state.smsMessagePreview.body,
      );
    },
    smsMessagePreviewLength(state) {
      return countSmsBodyLength(
        state.scratchSimpleMessage.meta.tagMaxWidthMap,
        state.smsMessagePreview.body,
      );
    },
    getMessageUiStatus() {
      return (message: SimpleMessage | EmailMessage) => getMessageUiStatus(message);
    },
    getAvailableMessageOptionsMap() {
      return (message: SimpleMessage | EmailMessage) => getAvailableMessageOptionsMap(message);
    },
    currentSelectedMessageCurrency(state) {
      if (!state.currentSelectedMessage) return null;
      return getMessageCurrency(state.currentSelectedMessage);
    },
    currentSelectedMessageUiStatus(state) {
      if (!state.currentSelectedMessage) return null;
      return getMessageUiStatus(state.currentSelectedMessage);
    },
    currentSelectedMessageEditable(state, getters, rootState): boolean {
      if (!state.currentSelectedMessage) return false;
      const uiStatus = getMessageUiStatus(state.currentSelectedMessage);
      if (uiStatus === 'draft') return true;
      if (uiStatus === 'scheduled') {
        // Available until 5 minutes before scheduled time
        const countdown = calculateScheduleMessageCountdown(state.currentSelectedMessage, rootState.application.applicationTime);
        return countdown > 300;
      }
      return false;
    },
    currentSelectedMessageScheduleCountdownCopy(state, getters, rootState): string | null {
      if (!state.currentSelectedMessage) return null;
      const uiStatus = getMessageUiStatus(state.currentSelectedMessage);
      if( uiStatus !== 'scheduled') return null;
      const countdown = calculateScheduleMessageCountdown(state.currentSelectedMessage, rootState.application.applicationTime);
      return generateScheduledMessageCountdownCopy(countdown);
    },
    currentScheduledMessageCountdownTime(state, getters, rootState): string | null {
      if (!state.currentSelectedMessage) return null;
      const uiStatus = getMessageUiStatus(state.currentSelectedMessage);
      if( uiStatus !== 'scheduled') return null;
      const countdown = calculateScheduleMessageCountdown(state.currentSelectedMessage, rootState.application.applicationTime);
      return generateScheduledMessageCountdownTime(countdown);
    },
    selectedCsvPreviewContact(state): CsvPreviewContact | null {
      if (!state.csvPreviewContacts
        || state.selectedCsvPreviewContactIndex === null
        || !state.displayCsvPreviewContacts) return null;
      const selectedContact = state.csvPreviewContacts[state.selectedCsvPreviewContactIndex];
      return selectedContact || null;
    },
    getCurrentFilterExpression(state):RecipientFilter | null {
      // Returns the most appropriate filter expression. If we have a current message get it from there,
      // otherwise get it from a scratch message.
      if (!state) return null;

      if (!!state.currentSelectedMessage &&
        !!state.currentSelectedMessage.meta.recipientFilter &&
        (!state.scratchEmailMessage.meta.recipientFilter && !state.scratchEmailMessage.oid) &&
        (!state.scratchSimpleMessage.meta.recipientFilter && !state.scratchSimpleMessage.oid)
      ) {
        return clone(state.currentSelectedMessage.meta.recipientFilter);
      }

      if (state.scratchEmailMessage?.meta?.recipientFilter?.conditions?.length > 0) {
        return clone(state.scratchEmailMessage.meta.recipientFilter);
      }
      if (state.scratchSimpleMessage?.meta?.recipientFilter?.conditions?.length > 0) {
        return clone(state.scratchSimpleMessage.meta.recipientFilter);
      }

      return null;
    }
  },
};

export default messageModule;

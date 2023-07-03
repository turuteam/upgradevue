import { Module } from "vuex";
import { RootState } from '@/store/modules/types';
import { clone, mergeObjects } from '@/utils/helpers/';
import { MessageList } from '@/api/message-lists/types';
import { MessageListState } from './types';
import { messageListActions } from './actions';
import {
  convertTargetingToFilterExpression, generateSignupFormEmbed,
  getInitialAdvancedMessageListTargeting
} from '@/store/modules/messageList/utils';
import { RecipientFilter } from '@/store/modules/message/types';
import { PromoterIntegrationTask } from '~/api/promoter-integration-task/types';

export const initialMessageListState = (): MessageListState => ({
  // Message Lists
  messageLists: [],
  totalMessageListCount: 0,
  hasNoMoreMessageLists: false,
  isFetchingMessageLists: false,
  hasFetchMessageListsFailed: false,
  // Current Messge List
  currentMessageList: null,
  isFetchingMessageList: false,
  // Create Message List
  isCreatingMessageList: false,
  // Update Message List
  isUpdatingMessageList: false,
  // Delete Message List
  isDeletingMessageList: false,
  // Validate New Message List
  newMessageListValidateResult: {
    duplicatedName: false,
    duplicatedFilterGroupOid: false,
  },
  isValidatingNewMessageList: false,
  advancedMessageListTargeting: getInitialAdvancedMessageListTargeting(), // Values which will be used in UI
  isFetchingFilteredRecipientListCount: false,
  filteredRecipientListCount: null,
  filteredRecipientListCountAccuracy: null,
  // Message list subscription preference
  promoterProperty: {
    oid: undefined,
    property: "TRUE",
  },
});

const messageListModule: Module<MessageListState, RootState> = {
  namespaced: true,
  state: initialMessageListState,
  actions: messageListActions,
  mutations: {
    // Message Lists
    RESET_MESSAGE_LISTS(state) {
      state.messageLists = [];
      state.hasNoMoreMessageLists = false;
      state.isFetchingMessageLists = false;
      state.hasFetchMessageListsFailed = false;
    },
    SET_MESSAGE_LISTS(state, messageLists: MessageList[]) {
      state.messageLists = clone(messageLists);
    },
    CONCAT_MESSAGE_LISTS(state, messageLists: MessageList[]) {
      state.messageLists = clone(state.messageLists.concat(messageLists));
    },
    REMOVE_FROM_MESSAGE_LISTS(state, messageListOid: number) {
      state.messageLists = clone(state.messageLists.filter(list => {
        return list.oid !== messageListOid;
      }));
    },
    PATCH_IN_MESSAGE_LISTS(state, { oid, changes }) {
      let clonedMessageLists: MessageList[] = clone(state.messageLists);
      clonedMessageLists = clonedMessageLists.map(messageList => {
        return messageList.oid === oid ? mergeObjects(messageList, changes) : messageList;
      });

      state.messageLists = clonedMessageLists;
    },
    SET_TOTAL_MESSAGE_LIST_COUNT(state, totalMessageListCount: number) {
      state.totalMessageListCount = totalMessageListCount;
    },
    SET_HAS_NO_MORE_MESSAGE_LISTS(state, hasNoMoreMessageLists: boolean) {
      state.hasNoMoreMessageLists = hasNoMoreMessageLists;
    },
    SET_IS_FETCHING_MESSAGE_LISTS(state, isFetching: boolean) {
      state.isFetchingMessageLists = isFetching;
    },
    SET_HAS_FETCH_MESSAGE_LISTS_FAILED(state, hasFailed: boolean) {
      state.hasFetchMessageListsFailed = hasFailed;
    },
    // Current Messge List
    SET_CURRENT_MESSAGE_LIST(state, messageList: MessageList) {
      state.currentMessageList = clone(messageList);
    },
    RESET_CURRENT_MESSAGE_LIST(state) {
      state.currentMessageList = null;
    },
    PATCH_CURRENT_MESSAGE_LIST(state, changes) {
      state.currentMessageList = mergeObjects(state.currentMessageList, changes);
    },
    SET_IS_FETCHING_MESSAGE_LIST(state, isFetching: boolean) {
      state.isFetchingMessageList = isFetching;
    },
    // Create Message List
    SET_IS_CREATING_MESSAGE_LIST(state, isCreating: boolean) {
      state.isCreatingMessageList = isCreating;
    },
    // Update Message List
    SET_IS_UPDATING_MESSAGE_LIST(state, isUpdating: boolean) {
      state.isUpdatingMessageList = isUpdating;
    },
    // Delete Message List
    SET_IS_DELETING_MESSAGE_LIST(state, isDeleting: boolean) {
      state.isDeletingMessageList = isDeleting;
    },
    // Validate New Message List
    RESET_NEW_MESSAGE_LIST_VALIDATE_RESULT(state) {
      state.newMessageListValidateResult = {
        duplicatedName: false,
        duplicatedFilterGroupOid: false,
      };
    },
    SET_NEW_MESSAGE_LIST_VALIDATE_RESULT(state, { duplicatedName, duplicatedFilterGroupOid }) {
      state.newMessageListValidateResult = {
        duplicatedName,
        duplicatedFilterGroupOid,
      };
    },
    SET_IS_VALIDATING_NEW_MESSAGE_LIST(state, isValidating: boolean) {
      state.isValidatingNewMessageList = isValidating;
    },
    SET_ADVANCED_MESSAGE_LIST_TARGETING(state, { type, condition, subCondition, values }) {
      state.advancedMessageListTargeting = {
        type: type || 'all',
        condition: condition || null,
        subCondition: subCondition || null,
        values: clone(values) || [],
      }
    },
    RESET_ADVANCED_MESSAGE_LIST_TARGETING(state) {
      state.advancedMessageListTargeting = getInitialAdvancedMessageListTargeting();
      state.filteredRecipientListCountAccuracy = null;
    },
    SET_IS_FETCHING_FILTERED_RECIPIENT_LIST_COUNT(state, isFetching: boolean) {
      state.isFetchingFilteredRecipientListCount = isFetching;
    },
    SET_FILTERED_RECIPIENT_LIST_COUNT(state, count: number) {
      state.filteredRecipientListCount = count;
    },
    SET_FILTERED_RECIPIENT_LIST_COUNT_ACCURACY(state, accuracy: string) {
      state.filteredRecipientListCountAccuracy = accuracy;
    },
    SET_PROMOTER_PROPERTY(state, data) {
      state.promoterProperty = clone(data);
    }
  },
  getters: {
    currentMessageListHasNoEmailContacts(state) {
      if (!state.currentMessageList) {
        return false;
      }
      // If we're checking an internal message list, then we need to check 'total' rather than 'email', because we dont use regular opt-in rules
      if (state.currentMessageList.name.indexOf('_internal_campaign_') === 0) {
        return state.currentMessageList.statsSnapshot.total > 0 ? false : true;
      }
      if (state.currentMessageList.filterGroupOid) { // It's hard to check real-time stats of auto list
        return false;
      }
      if (!state.currentMessageList.statsSnapshot) {
        return false;
      }
      return state.currentMessageList.statsSnapshot.email > 0 ? false : true;
    },
    currentMessageListIsForAllCampaignRegistrants(state) {
      return state.currentMessageList?.meta?.campaignOid && state.currentMessageList?.meta?.name === 'All registrants';
    },
    currentMessageListIsForCampaignTier(state) {
      return state.currentMessageList?.meta?.campaignOid && state.currentMessageList?.meta?.name !== 'All registrants';
    },
    currentMessageListCanBeSchedued(state) {
      // When the message list is from campaign, and is not for "All registrants",
      // it's not allowed to be scheduled.
      if (state.currentMessageList?.meta?.campaignOid && state.currentMessageList?.meta?.name !== 'All registrants') {
        return false;
      } else {
        return true;
      }
    },

    getCurrentFilterExpression(state): RecipientFilter | null {
      // Converts the current targeting rules into a filter expression, for use in requests and when saving data to a
      // task's meta
      const currentTargetingType = state.advancedMessageListTargeting.type || 'all';
      const currentTargetingCondition = state.advancedMessageListTargeting.condition || null;
      const currentTargetingSubCondition = state.advancedMessageListTargeting.subCondition || null;
      const currentTargetingValues = state.advancedMessageListTargeting.values || [];

      return convertTargetingToFilterExpression(currentTargetingType, currentTargetingCondition, currentTargetingSubCondition, currentTargetingValues);
    },
    currentAdvancedTargetingIsValid(state): boolean {
      const { type, condition, values } = state.advancedMessageListTargeting;
      if (type === 'all' || !type || !condition || !values || values.length === 0) {
        return false;
      }
      return true;
    },
    userDefinedMessageLists(state) {
      return state.messageLists
    },
    isSubscriptionPreferenceEnabled(state) {
      return state.promoterProperty?.property === "TRUE";
    },
  },
};

export default messageListModule;

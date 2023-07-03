import { MessageList } from '@/api/message-lists/types';
import { PromoterIntegrationTask } from '@/api/promoter-integration-task/types';

export type AdvancedMessageListTargeting = {
  type: string;
  condition: string | null;
  subCondition: string | null;
  values: string[];
};

/**
 * State of Message List Module
 */
export type MessageListState = {
  // Message Lists
  messageLists: MessageList[],
  totalMessageListCount: number,
  hasNoMoreMessageLists: boolean,
  isFetchingMessageLists: boolean,
  hasFetchMessageListsFailed: boolean;
  // Current Messge List
  currentMessageList: MessageList | null,
  isFetchingMessageList: boolean,
  // Create Message List
  isCreatingMessageList: boolean,
  // Update Message List
  isUpdatingMessageList: boolean,
  // Delete Message List
  isDeletingMessageList: boolean,
  // Validate New Message List
  newMessageListValidateResult: {
    duplicatedName: boolean,
    duplicatedFilterGroupOid: boolean,
  },
  isValidatingNewMessageList: boolean,
  advancedMessageListTargeting: AdvancedMessageListTargeting;
  // recipientFilter: RecipientFilter | null;
  isFetchingFilteredRecipientListCount: boolean;
  filteredRecipientListCount: number | null;
  filteredRecipientListCountAccuracy: string | null;
  promoterProperty: {
    oid: number,
    property: string,
  } | null;
};

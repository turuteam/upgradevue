import { SignupFormCampaign, ScratchSignupFormCampaign } from '@/types/resources/signupFormCampaign';
import { MessageList } from '@/api/message-lists/types';

/**
 * State of Signup Form Module
 * @field mockupMessageListForScratchSignupForm We have this because messageListOid is necessary for initializing scratch signup form
 */
export type SignupFormState = {
  // Signup Forms
  signupForms: SignupFormCampaign[],
  signupFormsCount: number,
  isFetchingSignupForms: boolean,
  hasFetchSignupFormsFailed: boolean,
  isNoMoreSignupForms: boolean,
  // Current Signup Form
  currentSignupForm: SignupFormCampaign | null,
  isFetchingSignupForm: boolean,
  isDeletingSignupForm: boolean,
  // Create Signup Form
  createdSignupForm: SignupFormCampaign | null,
  isCreatingSignupForm: boolean,
  // Create Scratch Signup Form
  isCreatingScratchSignupForm: boolean,
  // Patch Signup Form:
  isPatchingSignupForm: boolean,
  // Scratch Signup Form
  scratchSignupForm: ScratchSignupFormCampaign,
  mockupMessageListForScratchSignupForm: MessageList | null,
  messageListInScratchSignupForm: MessageList | null,
};

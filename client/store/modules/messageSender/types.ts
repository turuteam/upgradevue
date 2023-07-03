import { EmailSenderProperty } from '@/api/message-senders/types';

export type MessageSenderState = {
  isFetchingMessageSenders: boolean;
  isPatchingMessageSenders: boolean;
  isCreatingMessageSender: boolean;
  isDeletingMessageSender: boolean;
  isResendingEmailVerification: boolean;
  messageSenders: EmailSenderProperty[];
  currentMessageSender: EmailSenderProperty | null;
  scratchEmailSender: ScratchEmailSender;
};

export type ScratchEmailSender = {
  property: string;
  oid?: number;
  additionalInfo: {
    businessAddress: string;
    senderName: string;
  },
};

import { ScratchEmailSender } from './types'

export const createScratchEmailSender = (): ScratchEmailSender => {
  return {
    property: '',
    additionalInfo: {
      senderName: '',
      businessAddress: '',
    },
  };
};

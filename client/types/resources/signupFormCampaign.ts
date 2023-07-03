import {
  GenericCampaign,
  GenericScratchCampaign,
} from './genericCampaign';


export interface SignupFormCampaign extends GenericCampaign {
  type: 'opt-in';
  messageListOid: number;
}

export interface ScratchSignupFormCampaign extends GenericScratchCampaign {
  type: 'opt-in';
}

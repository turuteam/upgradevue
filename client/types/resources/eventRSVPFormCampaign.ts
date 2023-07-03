import {
  GenericCampaign,
  GenericScratchCampaign,
} from './genericCampaign';

export interface EventRSVPFormCampaign extends GenericCampaign {
  type: 'rsvp';
  eventOid: number;
}

export interface ScratchEventRSVPFormCampaign extends GenericScratchCampaign {
  type: 'rsvp';
}

import { EventRSVPFormCampaign, ScratchEventRSVPFormCampaign } from '@/types/resources/eventRSVPFormCampaign';

/**
 * State of EventRSVP Form Module
 * @field mockupMessageListForScratchEventRSVPForm We have this because messageListOid is necessary for initializing scratch eventRSVP form
 */
export type EventRSVPFormState = {
    // Current EventRSVP Form
    currentEventRSVPForm: EventRSVPFormCampaign | null,
    isFetchingEventRSVPForm: boolean,
    isDeletingEventRSVPForm: boolean,
    // Create EventRSVP Form
    createdEventRSVPForm: EventRSVPFormCampaign | null,
    isCreatingEventRSVPForm: boolean,
    // Create Scratch EventRSVP Form
    isCreatingScratchEventRSVPForm: boolean,
    // Patch EventRSVP Form:
    isPatchingEventRSVPForm: boolean,
    // Scratch EventRSVP Form
    scratchEventRSVPForm: ScratchEventRSVPFormCampaign,
  };
  
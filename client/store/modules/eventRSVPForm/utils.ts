import { clone } from '@/utils/helpers';
import { ScratchEventRSVPFormCampaign } from '@/types/resources/eventRSVPFormCampaign';

export const initializeScratchEventRSVPForm = function (): ScratchEventRSVPFormCampaign {
  return { // It's 100% same as the real campaign object returned from backend, we have some attributes that just to make front-end's life easier
    name: 'Register for event',
    urlSlug: '',
    eventOid: null,
    type: 'rsvp',
    defaults: {},
    presentation: {
      successMessage: null,
      description: null,
      color: '#7344c0',
      headHtml: null,
      bodyHtml: null,
      metaTitle: null,
      metaDescription: null,
      noPoints: true,
      flow: ["register"],
      meta: null,
    },
    settings: {
      reminders: [
        {
          enabled: true,
          text: null,
          value: 5,
          unit: 'minutes',
        },
        {
          enabled: true,
          text: null,
          value: 24,
          unit: 'hours',
        }
      ],
    },
    startDate: null,
    endDate: null,
    promoterOid: null,
    registrations: {
      fields: [
        {
          name: 'Email address',
          key: 'emailAddress',
          optional: false,
          predefined: true,
          enabled: true,
          order: 0,
        },
        {
          name: 'First name',
          key: 'firstName',
          optional: false,
          predefined: true,
          enabled: true,
          order: 1,
        },
        {
          name: 'Last name',
          key: 'lastName',
          optional: false,
          predefined: true,
          enabled: true,
          order: 2,
        },
        {
          name: 'Mobile number',
          key: 'mobileNumber',
          optional: false,
          predefined: true,
          enabled: false,
          order: -1,
        },
        {
          name: 'Date of birth',
          key: 'dob',
          optional: false,
          predefined: true,
          enabled: false,
          order: -1,
        },
        {
          name: 'Gender',
          key: 'gender',
          optional: false,
          predefined: true,
          enabled: false,
          order: -1,
        },
        {
          name: 'Country',
          key: 'country',
          optional: false,
          predefined: true,
          enabled: false,
          order: -1,
        },
        {
          name: 'Zip/Post code',
          key: 'postcode',
          optional: false,
          predefined: true,
          enabled: false,
          order: -1,
        },
        {
          name: 'City',
          key: 'city',
          optional: false,
          predefined: true,
          enabled: false,
          order: -1,
        },
        {
          name: 'State',
          key: 'state',
          optional: false,
          predefined: true,
          enabled: false,
          order: -1,
        },
        {
          name: 'Street address',
          key: 'streetAddress',
          optional: false,
          predefined: true,
          enabled: false,
          order: -1,
        },
      ],
      providers: {
        email: true,
        spotify: false,
        facebook: false,
      },
    },
    resources: [],
  }
};

/**
 * This is the place that we can implement missing fileds or adjusting old fields
 * for RSVP Event.
 * @param eventRSVP
 */
export const correctScratchEventRSVPForm = function (eventRSVPForm: ScratchEventRSVPFormCampaign) {
  const scratchEventRSVPForm: ScratchEventRSVPFormCampaign = clone(eventRSVPForm);
  // Event RSVP always has no points
  scratchEventRSVPForm.presentation.noPoints = true;
  // Event RSVP always has email provider as true
  scratchEventRSVPForm.registrations.providers = {
    email: true,
    spotify: false,
  };
  return scratchEventRSVPForm;
}

export const patchAdvancedSettingsInEventRSVP = function (
  scratchEventRSVPForm: ScratchEventRSVPFormCampaign,
  advancedSettings: any,
) {
  const newScratchEventRSVPForm: ScratchEventRSVPFormCampaign = clone(scratchEventRSVPForm);

  if (advancedSettings && advancedSettings != {} && Object.keys(advancedSettings).length > 0) {
    newScratchEventRSVPForm.settings = {
      ...newScratchEventRSVPForm.settings,
      ...advancedSettings
    };
  }

  return newScratchEventRSVPForm;
}

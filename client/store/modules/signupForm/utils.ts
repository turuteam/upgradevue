import { clone, generateHash } from '@/utils/helpers';
import { SignupFormCampaign, ScratchSignupFormCampaign } from '@/types/resources/signupFormCampaign';
import {RegistrationFields, NewField, RegistrationRequiredFields} from '@/types/resources/genericCampaign'
import { MessageList } from '@/api/message-lists/types';

export const initializeScratchSignupForm = function (): ScratchSignupFormCampaign {
  return { // It's 100% same as the real campaign object returned from backend, we have some attributes that just to make front-end's life easier
    name: 'Subscribe for updates',
    promoterOid: null,
    startDate: null,
    endDate: null,
    urlSlug: '',
    messageListOid: null,
    type: 'opt-in',
    defaults: {},
    presentation: {
      noImageBackground: false,
      successMessage: null,
      description: null,
      externalVideoUrl: null,
      externalVideoMediaType: null,
      color: '#7344c0',
      headHtml: null,
      bodyHtml: null,
      metaTitle: null,
      metaDescription: null,
      meta: null,
    },
    settings: {
      customCta: null,
      privacyPolicy: {
        companyName: null,
        url: null,
      },
      defaultLanguage: null,
      subscriptionPreferenceSettings: {
        enabled: false,
        disclaimer: null,
      },
    },
    resourceOids: [],
    resources: [],
    registrations: {
      customFields: [],
      providers: {
        email: true,
        spotify: false,
        facebook: false
      },
      fields: [{
          name: 'Email address',
          key: 'emailAddress',
          isMandatory: true, // Email is always required
          enabled: true,
          mandatoryTooltip: 'Email address is required',
          predefined: true,
        },
        {
          name: 'First name',
          key: 'firstName',
          enabled: true,
          predefined: true,
        },
        {
          name: 'Last name',
          key: 'lastName',
          enabled: true,
          predefined: true,
        },
        {
          name: 'Mobile number',
          key: 'mobileNumber',
          enabled: true,
          mandatoryTooltip: 'Mobile number is required to subscribe to SMS messages',
          predefined: true,
        },
        {
          name: 'Date of birth',
          key: 'dob',
          enabled: false,
          predefined: true,
        },
        {
          name: 'Gender',
          key: 'gender',
          enabled: false,
          predefined: true,
        },
        {
          name: 'Zip/post code',
          key: 'postcode',
          enabled: false,
          predefined: true,
        },
        {
          name: 'City',
          key: 'city',
          enabled: false,
          predefined: true,
        },
        {
          name: 'State',
          key: 'state',
          enabled: false,
          predefined: true,
        },
        {
          name: 'Country',
          key: 'country',
          enabled: false,
          predefined: true,
        }],
      requiredFields: {
        emailAddress: true,
        firstName: true,
        lastName: true,
        mobileNumber: true,
        messenger: false,
        dob: false,
        postcode: false,
        city: false,
        state: false,
        country: false,
      },
    },
    socialActions: {
      shares: {
        twitter: false,
        facebook: false,
        linkedin: false
      },
      invites: {
        sms: false,
        copy: false,
        email: false,
        whatsapp: false,
        instagram: false,
        messenger: false
      },
      connects: {
        spotify: false,
        twitter: false
      },
      socialAccounts: [
        {
          key: generateHash(),
          actions: [],
        },
      ],
    },
  }
};

/**
 * Help you fill some possibly missing fields in ScratchSignupFormCampaign,
 * so you don't need to worry too much about them.
 * @param signupForm
 */
export const fillScratchSignupForm = function (signupForm: ScratchSignupFormCampaign) {
  const scratchSignupForm: ScratchSignupFormCampaign = clone(signupForm);
  if (!scratchSignupForm.settings.subscriptionPreferenceSettings) {
    scratchSignupForm.settings.subscriptionPreferenceSettings = {
      enabled: false,
      disclaimer: null,
    }
  }
  if (!scratchSignupForm.settings.privacyPolicy) {
    scratchSignupForm.settings.privacyPolicy = {
      companyName: null,
      url: null,
    }
  }
  if (scratchSignupForm.socialActions?.socialAccounts?.[0] && !scratchSignupForm.socialActions.socialAccounts[0].key) {
    scratchSignupForm.socialActions.socialAccounts[0].key = generateHash();
  }
  return scratchSignupForm;
}

export const patchOptinActionInScratchSignup = function (
  scratchSignupForm: ScratchSignupFormCampaign,
  optinType: 'sms' | 'email' | 'facebook:messenger',
  value: any,
): ScratchSignupFormCampaign | null {
  const newScratchSignupForm: ScratchSignupFormCampaign = clone(scratchSignupForm);
  if (!newScratchSignupForm?.socialActions?.socialAccounts || !newScratchSignupForm.registrations.requiredFields) {
    return null;
  }
  if (value) {
    newScratchSignupForm.socialActions.socialAccounts[0].actions.push({
      key: optinType,
      value,
      points: 10,
      label: null,
      disclaimer: null,
    });
  } else {
    // Delete social action if not value
    newScratchSignupForm.socialActions.socialAccounts[0].actions =
      newScratchSignupForm.socialActions.socialAccounts[0].actions.filter(action => action.key !== optinType);
  }
  // Has to make mobileNumber mandatory if SMS is enabled
  if (optinType === 'sms' && value === 'enable') {
    const foundedIndex = newScratchSignupForm.registrations.fields.findIndex(el => el.key === 'mobileNumber')
    if (foundedIndex !== -1) {
      newScratchSignupForm.registrations.fields[foundedIndex].isMandatory = true;
    }
  }
  if (optinType === 'facebook:messenger') {
    // @ts-ignore TODO - just remove this
    newScratchSignupForm.registrations.fields.messenger = value ? value : null;
  }
  return newScratchSignupForm;
};

export const patchMessageListInScratchSignupForm = function (
  scratchSignupForm: ScratchSignupFormCampaign,
  messageList: MessageList,
) {
  const newScratchSignupForm: ScratchSignupFormCampaign = clone(scratchSignupForm);
  if (!newScratchSignupForm.socialActions?.socialAccounts?.[0]) {
    return;
  }
  newScratchSignupForm.messageListOid = messageList.oid;

  // You can optin fans to SMS & Email without any requisite
  // Email - Skip
  const emailEnabled = messageList.email;
  if (!emailEnabled) {
    newScratchSignupForm.socialActions.socialAccounts[0].actions =
      newScratchSignupForm.socialActions.socialAccounts[0].actions.filter(action => action.key !== 'email');
  }
  // SMS - Skip
  const smsEnabled = messageList.sms;
  if (!smsEnabled) {
    newScratchSignupForm.socialActions.socialAccounts[0].actions =
      newScratchSignupForm.socialActions.socialAccounts[0].actions.filter(action => action.key !== 'sms');
  }

  // Facebook Messenger
  const fbPageId = messageList.facebookMessenger && messageList.meta.facebookMessenger && messageList.meta.facebookMessenger.pageId;
  if (fbPageId) {
    /**
     * Backward compatible
     * If you did enable messenger before by using "registrations -> fields -> messenger",
     * we enable 'facebook:messenger' action for you
     */
    // @ts-ignore TODO - just remove this
    if (newScratchSignupForm.registrations.fields.messenger) {
      const messengerAction = newScratchSignupForm.socialActions.socialAccounts[0].actions.find(action => action.key = 'facebook:messenger');
      if (messengerAction) {
        messengerAction.value = fbPageId;
      } else {
        newScratchSignupForm.socialActions.socialAccounts[0].actions.push({
          key: 'facebook:messenger',
          value: fbPageId,
          points: 10,
          label: null,
          disclaimer: null,
        });
      }
    }
  } else {
    // Disable Messenger anyway if there's no fbPageId
    newScratchSignupForm.socialActions.socialAccounts[0].actions =
      newScratchSignupForm.socialActions.socialAccounts[0].actions.filter(action => action.key !== 'facebook:messenger');
    // @ts-ignore TODO - just remove this
    newScratchSignupForm.registrations.fields.messenger = false;
  }
  return newScratchSignupForm;
};


export const convertRegistrationsObjectToArray = function(registrationFieldsObject:RegistrationFields, requiredFields:RegistrationRequiredFields):NewField[] {
  const keys = Object.keys(registrationFieldsObject).filter( key => key !== 'messenger'); // Remove messenger if its present
  const newFields:NewField[] = [];
  keys.forEach( key => {
    let name;
    let order;
    switch(key) {
      case "emailAddress":
        name = "Email address";
        order = 1;
        break;
      case "firstName":
        name = "First name";
        order = 2;
        break;
      case "lastName":
        name = "Last name";
        order = 3;
        break;
      case "mobileNumber":
        name = "Mobile number";
        order = 4;
        break;
      case "dob":
        name = "Date of birth";
        order = 5;
        break;
      case "gender":
        name = "Gender";
        order = 6;
        break;
      case "country":
        name = "Country";
        order = 7;
        break;
      case "postcode":
        name = "Postcode";
        order = 8;
        break;
      case "city":
        name = "City";
        order = 9;
        break;
      case "state":
        name = "State";
        order = 10;
        break;
      case "streetAddress":
        name = "Street Address";
        order = 11;
        break;
    }
    const newField = {
      name,
      key,
      order,
      predefined: true,
      // @ts-ignore
      optional: !(key in requiredFields) || (!requiredFields[key] && (key in registrationFieldsObject) && !!registrationFieldsObject[key]),
      // @ts-ignore
      enabled: (key in registrationFieldsObject) && !!registrationFieldsObject[key],
      isMandatory: key === 'emailAddress',
    }
    newFields.push(newField)
  });
  newFields.sort((a, b) => {
    return a.enabled ? -1 : 1;
  });
  newFields.sort((a, b) => {
    return a.order - b.order;
  });
  return newFields;
}

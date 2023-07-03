import { clone } from '@/utils/helpers/';

const DEFAULT_POINTS = 5
const SMS_EMAIL_POINTS = 10

export async function normaliseCampaignData(data) {
  let normalisedDataToClean = clone(data)
  const campaignType = data.type;

  let presentation = data.presentation
  let settings = data.settings
  let socialActions = data.socialActions
  let meta = {}

  let normalisedRegister = getNormalisedRegisterData(presentation, settings)
  let normalisedSocialActions = getNormalisedSocialActionsData(presentation, socialActions, campaignType)

  let existingMeta = {
    invite: {
      copy: null
    }
  }

  // if old property of pageOptions exists, set new meta property to it
  if (!!normalisedDataToClean.presentation?.pageOptions && !!Object.keys(normalisedDataToClean.presentation?.pageOptions).length) {
    existingMeta = {
      ...normalisedDataToClean.presentation.pageOptions
    }
  }

  // if new property of presentation.meta exists, it is more recent, so reassign new meta property to this instead
  if (!!normalisedDataToClean.presentation?.meta && !!Object.keys(normalisedDataToClean.presentation?.meta).length) {
    existingMeta = {
      ...existingMeta,
      ...normalisedDataToClean.presentation.meta
    }
  }

  meta = {
    ...existingMeta,
    register: normalisedRegister,
  }

  normalisedDataToClean = {
    ...normalisedDataToClean,
    presentation: {
      ...normalisedDataToClean.presentation,
      meta,
    },
    socialActions: normalisedSocialActions,
  }

  // when we know that data is updating
  // and all working correctly, the below
  // function is where we will delete/remove
  // reference to old properties.
  // For now we are not removing old properties
  // incase we need to debug/troubleshoot/rollback.
  let normalisedData = cleanOldDataProperties(normalisedDataToClean)

  return normalisedData
}

function cleanOldDataProperties(data) {
  let newDataObj = clone(data)
  // delete newDataObj.presentation.headHtml
  // delete newDataObj.presentation.bodyHtml

  return newDataObj
}

function getActionsFromSocialAccount(newAccount, campaignType) {
  let actions = []

  if (!newAccount) {
    return actions
  }

  const newAccountKeys = Object.keys(newAccount)

  if (!!newAccountKeys && newAccountKeys.length > 0) {
    newAccountKeys.forEach((accountKey) => {
      if (
        accountKey != "name" && accountKey != "key" && // Action Identifiers
        accountKey != "additionalInfo" && // Contains Privacy Policy
        accountKey != "save" && // Saving a brand is now manual, so we no longer support this
        accountKey != "facebook:messenger" && accountKey != "snapchat" // Actions no longer supported
      ) {
        let value = newAccount[accountKey]
        let points = DEFAULT_POINTS

        if (accountKey === 'sms' || accountKey === 'email') {
          // If value is actually set to disable, we should skip adding this action.
          if (value === 'disable') {
            return;
          }

          if (value === 'enable' && campaignType !== 'opt-in') {
            value = 'enable'
          }
          points = SMS_EMAIL_POINTS
        }

        actions.push({
          key: accountKey,
          value,
          label: null,
          disclaimer: null,
          points,
        })

        // TO DO: Delete the key on second stage
        // delete newAccount[accountKey]
      }
    })
  }

  return actions
}

function getNormalisedSocialAccounts(newAccount, campaignType) {
  // Actions haven't been defined yet
  if (!newAccount.actions) {
    newAccount.actions = getActionsFromSocialAccount(newAccount, campaignType)
  }

  return newAccount
}

function getNormalisedSocialActionsData(presentation, social, campaignType) {
  let normalisedSocialActions = clone(social)
  let normalisedSocialAccounts

  if (!!normalisedSocialActions && normalisedSocialActions.socialAccounts?.length > 0) {
    normalisedSocialAccounts = normalisedSocialActions.socialAccounts.map((account) => {
      return getNormalisedSocialAccounts(clone(account), campaignType);
    })
  }

  normalisedSocialActions = {
    ...normalisedSocialActions,
    socialAccounts: normalisedSocialAccounts
  }

  normalisedSocialActions = {
    ...normalisedSocialActions,
    meta: {
      title: !!(!!presentation?.metaTitle && (!normalisedSocialActions?.meta || !('title' in normalisedSocialActions?.meta))) ? presentation.metaTitle : normalisedSocialActions?.meta?.title || "",
      description: !!(!!presentation?.metaDescription && (!normalisedSocialActions?.meta || !('description' in normalisedSocialActions?.meta))) ? presentation.metaDescription : normalisedSocialActions?.meta?.description || "",
    }
  }

  return normalisedSocialActions
}

function getNormalisedRegisterData(presentation, settings) {
  let normalisedRegister = !!presentation?.meta?.register ? presentation.meta.register : {}

  // The logic for the below reads

  // if the property exists in the old location
  // but it either doesn't exist within the new location (presentation.meta.register.<newLocation>.<newProperty>)
  // OR presentation.meta.register.<newLocation> doesn't exist at all
  // --> this is the first time the normalisation has run,
  // set the values to the data that exists in the old location
  // OTHERWISE
  // --> the property exists, hence the normalisation has been run previously
  // set the values to the data that exists in the new normalisation location

  normalisedRegister = {
    customHtml: {
      headHtml: !!(!!presentation?.headHtml && (!(normalisedRegister?.customHtml) || !('headHtml' in normalisedRegister?.customHtml))) ? presentation.headHtml : normalisedRegister?.customHtml?.headHtml,
      bodyHtml: !!(!!presentation?.bodyHtml && (!(normalisedRegister?.customHtml) || !('bodyHtml' in normalisedRegister?.customHtml))) ? presentation.bodyHtml : normalisedRegister?.customHtml?.bodyHtml,
    },
    customCta: !!(!!settings?.customCta && (!normalisedRegister || !('customCta' in normalisedRegister))) ? settings.customCta : normalisedRegister?.customCta,
    customLive: {
      headerText: !!(!!presentation?.liveCustomHeader && (!normalisedRegister?.customLive || !('headerText' in normalisedRegister?.customLive))) ? presentation.liveCustomHeader : normalisedRegister?.customLive?.headerText,
      bodyText: !!(!!presentation?.liveCustomDescription && (!normalisedRegister?.customLive || !('bodyText' in normalisedRegister?.customLive))) ? presentation.liveCustomDescription : normalisedRegister?.customLive?.bodyText,
    },
    media: {
      noImageBackground: !!(!!('noImageBackground' in presentation) && (!normalisedRegister?.media || !('noImageBackground' in normalisedRegister?.media))) ? presentation.noImageBackground : !!normalisedRegister?.media?.noImageBackground,
      externalVideoMediaType: !!(!!presentation?.externalVideoMediaType && (!normalisedRegister?.media || !('externalVideoMediaType' in normalisedRegister?.media))) ? presentation.externalVideoMediaType : normalisedRegister?.media?.externalVideoMediaType,
      externalVideoUrl: !!(!!presentation?.externalVideoUrl && (!normalisedRegister?.media || !('externalVideoUrl' in normalisedRegister?.media))) ? presentation.externalVideoUrl : normalisedRegister?.media?.externalVideoUrl,
    },
    noPoints: !!(!!('noPoints' in presentation) && (!normalisedRegister || !('noPoints' in normalisedRegister))) ? presentation.noPoints : !!normalisedRegister?.noPoints,
    privacyPolicy: {
      companyName: !!(!!settings?.privacyPolicy?.companyName && (!(normalisedRegister?.privacyPolicy) || !('companyName' in normalisedRegister?.privacyPolicy))) ? settings.privacyPolicy.companyName : normalisedRegister?.privacyPolicy?.companyName,
      url: !!(!!settings?.privacyPolicy?.url && (!(normalisedRegister?.privacyPolicy) || !('url' in normalisedRegister?.privacyPolicy))) ? settings.privacyPolicy.url : normalisedRegister?.privacyPolicy?.url,
    },
    tcpaSettings: {
      companyName: !!(!!settings?.tcpaSettings?.companyName && (!normalisedRegister?.tcpaSettings || !('companyName' in normalisedRegister?.tcpaSettings))) ? settings.tcpaSettings.companyName : normalisedRegister?.tcpaSettings?.companyName,
      enabled: !!(!!(settings?.tcpaSettings && 'enabled' in settings?.tcpaSettings) && (!normalisedRegister?.tcpaSettings || !('enabled' in normalisedRegister?.tcpaSettings))) ? settings.tcpaSettings.enabled : !!normalisedRegister?.tcpaSettings?.enabled,
    },
    customSuccessPage: {
      buttonEnabled: !!(!!('customSuccessButtonEnabled' in presentation) && (!normalisedRegister?.customSuccessPage || !('buttonEnabled' in normalisedRegister?.customSuccessPage))) ? presentation.customSuccessButtonEnabled : !!normalisedRegister?.customSuccessPage?.buttonEnabled,
      message: getCustomSuccessMessage(presentation, normalisedRegister),
      buttonText: !!(!!presentation?.customSuccessButtonText && (!normalisedRegister?.customSuccessPage || !('buttonText' in normalisedRegister?.customSuccessPage))) ? presentation.customSuccessButtonText : normalisedRegister?.customSuccessPage?.buttonText,
      buttonUrl: !!(!!presentation?.customSuccessButtonUrl && (!normalisedRegister?.customSuccessPage || !('buttonUrl' in normalisedRegister?.customSuccessPage))) ? presentation.customSuccessButtonUrl : normalisedRegister?.customSuccessPage?.buttonUrl,
    },
    subscriptionPreferenceSettings: {
      enabled: !!(!!(settings?.subscriptionPreferenceSettings && (!normalisedRegister?.subscriptionPreferenceSettings || 'enabled' in settings?.subscriptionPreferenceSettings)) && (!normalisedRegister?.subscriptionPreferenceSettings || !('enabled' in normalisedRegister?.subscriptionPreferenceSettings))) ? settings.subscriptionPreferenceSettings.enabled : !!normalisedRegister?.subscriptionPreferenceSettings?.enabled,
      disclaimer: !!(!!settings?.subscriptionPreferenceSettings?.disclaimer && (!(normalisedRegister?.subscriptionPreferenceSettings) || !('disclaimer' in normalisedRegister?.subscriptionPreferenceSettings))) ? settings.subscriptionPreferenceSettings.disclaimer : normalisedRegister?.subscriptionPreferenceSettings?.disclaimer,
    }
  }

  return normalisedRegister
}

function getCustomSuccessMessage(presentation, normalisedRegister) {
  let message
  if (!!presentation?.customSuccessMessage && (!normalisedRegister?.customSuccessPage || !('message' in normalisedRegister?.customSuccessPage))) {
    message = presentation.customSuccessMessage
  } else if (!!presentation?.successMessage && (!normalisedRegister?.customSuccessPage || !('message' in normalisedRegister?.customSuccessPage))) {
    message = presentation.successMessage
  } else {
    message = normalisedRegister?.customSuccessPage?.message
  }

  return message
}

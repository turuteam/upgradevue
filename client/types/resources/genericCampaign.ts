type CampaignReminder = {
  enabled: boolean;
  text: string | null;
  value: number;
  unit: 'minutes' | 'hours' | 'days' | 'weeks';
};

type SocialAcccountActionKey =
  | 'email'
  | 'facebook:event'
  | 'facebook:messenger'
  | 'spotify:artist'
  | 'spotify:track'
  | 'spotify:playlist'
  | 'youtube'
  | 'facebook'
  | 'twitter'
  | 'sms'
  | 'instagram';

type SocialAcccount = {
  key?: string | null;
  save?: boolean | null;
  name?: string | null;
  additionalInfo?: {
    privacyPolicy?: {
      companyName: string | null,
      url: string | null,
    },
  },
  actions: {
    key: SocialAcccountActionKey;
    value: string;
    points: number;
    label: string | null;
    disclaimer: string | null;
  }[];
};

interface Defaults {
  points?: {
    follow: number;
    share: number;
    connect: number;
    register: number;
    referral: number;
  };
  copy?: {
    share: string;
    emailBody: string;
  };
}

type ZoomPlatform = {
  type: 'zoom';
  integrationOid?: number | null; // Look for meeting details from Event if it has "integrationOid"
  accountId?: number | null;
  url: string | null;
  id: string | null;
  password: string | null;
}
type ClubhousePlatform = {
  type: 'clubhouse';
  url: string | null;
}
type YoutubePlatform = {
  type: 'youtube';
  url: string | null;
}
type VimeoPlatform = {
  type: 'vimeo';
  url: string | null;
}
type OtherPlatform = {
  type: 'other';
  url: string | null;
}

export type NewField = {
  name: string;
  key: string;
  optional?: boolean;
  predefined?: boolean;
  enabled?: boolean;
  order?: number;
  isMandatory?: boolean;
  mandatoryTooltip?: string;
};

type NewRegistrationsFields = {
  emailAddress: NewField;
  firstName: NewField;
  lastName: NewField;
  mobileNumber: NewField;
  dob: NewField;
  gender: NewField;
  country: NewField;
  postcode: NewField;
  city: NewField;
  state: NewField;
  streetAddress: NewField;
};

type Resource = {
  oid: number;
  url: string;
  filename: string;
  sysCtime: string;
  assetType: string;
  contentType: string;
  promoterOid: number;
};

type InviteAction = {
  key: string;
  enabled: boolean;
  order: number;
}

type SocialActions = {
  shares?: {
    twitter: boolean | ShareAction;
    facebook: boolean | ShareAction;
    linkedin: boolean | ShareAction;
  };
  invites?: {
    sms: boolean | InviteAction;
    copy: boolean | InviteAction;
    email: boolean | InviteAction;
    whatsapp: boolean | InviteAction;
    instagram: boolean | InviteAction;
    messenger: boolean | InviteAction;
  };
  connects?: {
    spotify: boolean;
    twitter: boolean;
  };
  socialAccounts?: SocialAcccount[] | null;
};

type ShareAction = {
  enabled: boolean;
  order: number;
}

type RegistrationEmail = {
  dob: boolean;
  city: boolean;
  state: boolean;
  country: boolean;
  postcode: boolean;
  lastName: boolean;
  firstName: boolean;
  emailAddress: boolean;
};

export type RegistrationFields = {
  lastName: boolean;
  city: boolean;
  postcode: boolean;
  state: boolean;
  firstName: boolean;
  mobileNumber: boolean;
  dob: boolean;
  streetAddress?: boolean;
  emailAddress: boolean;
  country: boolean;
  gender?: boolean;
  optusAccountNumber?: boolean;
  messenger?: boolean;
};

export type RegistrationRequiredFields = {
  lastName: boolean;
  city: boolean;
  postcode: boolean;
  state: boolean;
  firstName: boolean;
  mobileNumber: boolean;
  dob: boolean;
  streetAddress?: boolean;
  emailAddress: boolean;
  country: boolean;
  gender?: boolean;
  optusAccountNumber?: boolean;
  messenger?: boolean;
}

type EventInCampaign = {
  oid: number;
  name: string;
  endDate: string;
  location: string;
  timeZone: string;
  startDate: string;
  description?: null;
  presentation: {
    website?: null;
    settings?: {} | null;
    liveStreamUrl?: null;
  };
};

type SettingsEmail = {
  dailyAnalyticsEmail: boolean;
  fanConfirmationEmail: boolean;
  fanReferralRegisteredEmail: boolean;
  fan24hrsToCampaignEndEmail: boolean;
  fanConfirmationSendTimeOffset: number;
};

type SettingsPlatform = ZoomPlatform | ClubhousePlatform | YoutubePlatform | VimeoPlatform | OtherPlatform;

type SettingsPayment = {
  currencyCode: string;
  pricingModel: {
    type?: string | null;
    minAmount?: number | null;
    products?: {
      key: string;
      name: string;
      amount: number;
      description: string;
      maxQuantity: number;
    }[] | null;
  };
  required?: boolean | null;
}

type SettingsTcpaSettings = {
  enabled: boolean;
  companyName?: string | null;
};

type SettingsPrivacyPolicy = {
  url?: string | null;
  companyName?: string | null;
};

type SettingsSubscriptionPreferenceSettings = {
  enabled: boolean;
  disclaimer: string | null,
};

type SettingsPixels = {
  facebookPixel?: {
    enabled: boolean;
    id: string | null;
  };
  googleTagManager?: {
    enabled: boolean;
    id: string | null;
  };
  googleAnalytics?: {
    enabled: boolean;
    id: string | null;
  };
};

/**
 * A generic schema and can be applied to all types of campaigns,
 * this will help us have better picture of how our campaigns work.
 */
export interface GenericCampaign {
  sysCtime: string;
  endDate: string;
  name: string;
  defaults: Defaults;
  notifyDate?: string | null;
  socialActions?: SocialActions;
  type: string;
  eventOid: number | null;
  messageListOid: number | null;
  urlSlug: string;
  event?: EventInCampaign;
  oid: number;
  summaryStatsSnapshot: {
    oid: number;
    uniqueViews: number;
    allRegistrations: number;
  };
  settings: {
    reminders?: CampaignReminder[];
    platform?: SettingsPlatform | null;
    email?: SettingsEmail;
    payment?: SettingsPayment;
    customCta?: string | null;
    tcpaSettings?: SettingsTcpaSettings;
    clientVersion?: number;
    gatedSessions?: boolean;
    privacyPolicy?: SettingsPrivacyPolicy;
    defaultLanguage?: string;
    subscriptionPreferenceSettings?: SettingsSubscriptionPreferenceSettings;
    selectedTags?: string[];
    pixels?: SettingsPixels;
  };
  presentation: {
    externalVideoUrl?: string | null;
    externalVideoMediaType?: string | null;
    successMessage?: string | null;
    description?: string | null;
    bodyHtml?: string | null;
    color: string;
    customSuccessMessage?: string | null;
    customSuccessButtonEnabled?: boolean | null;
    liveCustomHeader?: string | null;
    flow?: string[] | null;
    customSuccessButtonText?: string | null;
    noPoints?: boolean | null;
    metaDescription: string;
    headHtml?: string | null;
    metaTitle: string;
    liveCustomDescription?: string | null;
    noImageBackground?: boolean | null;
    customSuccessButtonUrl?: string | null;
    timeZone?: string;
    meta: any;
  };
  startDate: string;
  registrations: {
    email?: RegistrationEmail;
    fields: RegistrationFields | NewRegistrationsFields | NewField[];
    customFields?: CustomField[],
    requiredFields?: RegistrationRequiredFields,
    facebook?: boolean;
    providers?: {
      email: boolean;
      spotify: boolean;
      facebook?: boolean;
    };
  };
  resources: Resource[];
  resourceOids?: number[];
  subscriptionLevel?: string | null;
}

/**
 * A generic schema and can be applied to all types Campaign custom fields.
 */
export interface CustomField {
  name: string,
  type: {
    key: 'dropdown-single' | 'dropdown-multi',
  },
  options: CustomFieldOption[],
}

export interface CustomFieldOption {
  name: string,
  tag?: string,
}

/**
 * A generic schema and can be applied to all types of "scratch" campaigns,
 * this will help us have better picture of how our scratch campaigns work.
 */
export interface GenericScratchCampaign {
  name: string | null;
  promoterOid: number | null;
  sysCtime?: string;
  endDate: string | null;
  defaults?: Defaults;
  notifyDate?: string | null;
  socialActions?: SocialActions;
  type: string;
  eventOid?: number | null;
  messageListOid?: number | null;
  urlSlug: string | null;
  event?: EventInCampaign;
  oid?: number | null;
  summaryStatsSnapshot?: {
    oid: number;
    uniqueViews: number;
    allRegistrations: number;
  };
  settings: {
    reminders?: CampaignReminder[];
    platform?: SettingsPlatform | null;
    email?: SettingsEmail;
    payment?: SettingsPayment;
    customCta?: string | null;
    tcpaSettings?: SettingsTcpaSettings;
    clientVersion?: number;
    gatedSessions?: boolean;
    privacyPolicy?: SettingsPrivacyPolicy;
    defaultLanguage?: string | null;
    subscriptionPreferenceSettings?: SettingsSubscriptionPreferenceSettings;
    selectedTags?: string[];
    pixels?: SettingsPixels;
  };
  presentation: {
    externalVideoUrl?: string | null;
    externalVideoMediaType?: string | null;
    successMessage?: string | null;
    description?: string | null;
    bodyHtml?: string | null;
    color: string | null;
    customSuccessMessage?: string | null;
    customSuccessButtonEnabled?: boolean | null;
    liveCustomHeader?: string | null;
    flow?: string[] | null;
    customSuccessButtonText?: string | null;
    noPoints?: boolean | null;
    metaDescription: string | null;
    headHtml?: string | null;
    metaTitle: string | null;
    liveCustomDescription?: string | null;
    noImageBackground?: boolean | null;
    customSuccessButtonUrl?: string | null;
    timeZone?: string | null;
    meta: any;
  };
  startDate: string | null;
  registrations: {
    customFields?: any;
    email?: RegistrationEmail;
    fields: NewField[];
    requiredFields?: RegistrationRequiredFields,
    facebook?: boolean;
    providers: {
      email: boolean;
      spotify: boolean;
      facebook?: boolean;
    };
  };
  resources: Resource[];
  resourceOids?: number[];
  subscriptionLevel?: string | null;
}

type SocialAcccountActionKey =
  | 'email'
  | 'facebook:event'
  | 'spotify:artist'
  | 'spotify:track'
  | 'spotify:playlist'
  | 'spotify:album'
  | 'spotify:podcast'
  | 'spotify:episode'
  | 'youtube'
  | 'facebook'
  | 'twitter'
  | 'sms'
  | 'instagram'
  | 'twitch'
  | 'tiktok'
  | 'linkedin'
  | 'custom';

export type SocialAction = {
  key: SocialAcccountActionKey;
  label: string | null;
  value: string | number;
  points: number;
  disclaimer: string | null;
};

export type AdditionalInfo = {
  privacyPolicy?: {
    url: string;
    companyName: string;
  };
};

export type Brand = {
  sysCtime: Date;
  sysMtime: Date;
  name: string;
  sysActivep: boolean;
  actions: SocialAction[];
  additionalInfo: AdditionalInfo;
  oid: number;
  accounts: {
    instagram: string;
    sms: string;
    additionalInfo: {
      privacyPolicy: {
        url: string;
        companyName: string;
      };
    };
    email: string;
    twitter: string;
  };
  promoterOid: number;
};

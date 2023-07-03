interface AdvancedSettings {
  assignTags: string[];
  subscribeToMessageList: {
    listOid: number | null;
    email: boolean;
    sms: boolean;
    facebookMessenger: boolean;
  };
  rsvp: {
    ctaButtonName: string | null;
    language: string | null;
    privacyPolicy?: {
      url: string;
      companyName: string;
      enabled: boolean;
    };
  };
  pixels: {
    facebookPixel: {
      enabled: boolean;
      id: string | null;
    },
    googleTagManager: {
      enabled: boolean;
      id: string | null;
    },
    googleAnalytics: {
      enabled: boolean;
      id: string | null;
    },
    custom: {
      enabled: boolean;
      text: string | null;
    }
  };
}

interface ScratchAdvancedSettings {
  assignTags: string[];
  subscribeToMessageList: {
    listOid: number | null;
    email: boolean;
    sms: boolean;
    facebook: boolean;
  };
  rsvp: {
    ctaButtonName: string | null;
    language: string | null;
    privacyPolicy?: {
      url: string;
      companyName: string;
      enabled: boolean;
    };
  };
  pixels: {
    facebook: {
      enabled: boolean;
      id: string | null;
    },
    facebookPixel: {
      enabled: boolean;
      id: string | null;
    },
    googleAnalytics: {
      enabled: boolean;
      id: string | null;
    },
    custom: {
      enabled: boolean;
      id: string | null;
    }
  };
}
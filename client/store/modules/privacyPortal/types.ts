export type ScratchPrivacyPortal = {
  oid?: number;
  companyName: string | null;
  subdomain: string | null;
  published: boolean;
  resources: any[] | null;
  meta: {
    requestsCompletedBy: {
      promoter: boolean;
      fan: boolean;
    };
    presentation: {
      color: string | null;
    };
    privacyPolicy: string | null;
    notifications: {
      emailAddress: string | null;
      requestsCompletedBy: {
        promoter: boolean;
        fan: boolean;
      };
    },
    promoterCompletedRequestOptions: {
      enabled: boolean;
      title: string;
      type: 'delete-data' | 'update-data' | 'export-data' | 'update-subscription' | 'other',
    }[];
  }
};

export type PrivacyPortalState = {
  // Current Privacy Portal
  currentPrivacyPortal: PrivacyPortal | null;
  isFetchingCurrentPrivacyPortal: boolean;
  hasFetchCurrentPrivacyPortalFailed: boolean;
  // Scratch Privacy Portal
  scratchPrivacyPortal: ScratchPrivacyPortal;
  isUpdatingPrivacyPortal: boolean;
  // Create Privacy Portal
  isCreatingPrivacyPortal: boolean;
};
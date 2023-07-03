type PrivacyPortal = {
  oid: number;
  promoterOid: number;
  companyName: string;
  subdomain: string;
  published: boolean;
  resources: object[];
  meta: {
    requestsCompletedBy: {
      promoter: boolean;
      fan: boolean;
    };
    presentation: {
      color: string;
    };
    privacyPolicy: string;
    notifications: {
      emailAddress: string;
      requestsCompletedBy: {
        promoter: boolean;
        fan: boolean;
      };
    },
    promoterCompletedRequestOptions: {
      enabled: boolean;
      title: string;
    }[];
  };
  sysActivep: boolean;
  sysCtime: string;
  sysMtime: string;
};

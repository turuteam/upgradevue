type PromoterAccountFeatures = {
  [key: string]: {
    id: string;
    enabled: boolean;
    components: {
      [key: string]: {
        id: string;
        enabled: boolean;
        oid: number;
        editor?: string;
      };
    };
  };
};

type PromoterAccount = {
  lastName: string;
  firstName: string;
  mobileNumber?: string;
  oid: number | null;
  emailAddress: string;
  promoterOid: number;
  features?: PromoterAccountFeatures;
  promoterDisabled?: boolean;
}

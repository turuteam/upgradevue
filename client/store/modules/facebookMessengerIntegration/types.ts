export type FacebookMessengerIntegrationState = {
  isFetchingFacebookPages: boolean;
  hasFetchedInitialFacebookPages: boolean;
  facebookPages: FacebookPage[];
  integration: any;
  isFetchingIntegration: boolean;
  hasFetchedIntegration: boolean;
};

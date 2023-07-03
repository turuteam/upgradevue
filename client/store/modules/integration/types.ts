import { Integration } from '@/api/integrations/types';
import { PromoterIntegration } from '@/api/promoter-integrations/types';

export type IntegrationState = {
  integrations: Integration[],
  promoterIntegrations: PromoterIntegration[],
  isFetchingIntegrations: boolean;
};

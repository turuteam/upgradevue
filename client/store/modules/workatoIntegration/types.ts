import { BasePromoterIntegration, SyncTask } from '@/api/promoter-integrations/types';
import { Integration } from "~/api/integrations/types";

export interface WorkatoProviderAccount extends BasePromoterIntegration {
  accountName: string;
  folderName: string;
  folderId: string;
}

export type WorkatoIntegrationState = {
  integration: Integration | null;
  providerAccounts: WorkatoProviderAccount[] | null;
  isWaiting: boolean;
}

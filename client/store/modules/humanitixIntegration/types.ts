import { HumanitixIntegration, SyncTask } from '@/api/promoter-integrations/types';

export type HumanitixIntegrationState = {
  integration: HumanitixIntegration[] | null;
  isFetchingIntegration: boolean;
  isCreatingIntegration: boolean;
  isDeletingIntegration: boolean;
  isReconnectingIntegration: boolean;
  isFetchingSyncTask: boolean;
  syncTask: SyncTask | null;
  syncStatus: string | null;
}

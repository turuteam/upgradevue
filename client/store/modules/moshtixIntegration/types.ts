import { MoshtixIntegration, SyncTask } from '@/api/promoter-integrations/types';

export type MoshtixIntegrationState = {
  integration: MoshtixIntegration[] | null;
  isFetchingIntegration: boolean;
  isCreatingIntegration: boolean;
  isDeletingIntegration: boolean;
  isReconnectingIntegration: boolean;
  isFetchingSyncTask: boolean;
  syncTask: SyncTask | null;
  syncStatus: string | null;
}

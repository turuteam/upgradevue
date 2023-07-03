import { PatreonIntegration, SyncTask } from '@/api/promoter-integrations/types';

export type PatreonIntegrationState = {
    integration: PatreonIntegration[] | null;
    isFetchingIntegration: boolean;
    isDeletingIntegration: boolean;
    isReconnectingIntegration: boolean;
    isFetchingSyncTask: boolean;
    syncTask: SyncTask | null;
    syncStatus: string | null;
  }

import { MemberfulIntegration, SyncTask } from '@/api/promoter-integrations/types';

export type MemberfulIntegrationState = {
    integration: MemberfulIntegration[] | null;
    isFetchingIntegration: boolean;
    isCreatingIntegration: boolean;
    isDeletingIntegration: boolean;
    isReconnectingIntegration: boolean;
    isFetchingSyncTask: boolean;
    syncTask: SyncTask | null;
    syncStatus: string | null;
  }

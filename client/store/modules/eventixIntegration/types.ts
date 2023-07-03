import { EventbriteIntegration, SyncTask } from '@/api/promoter-integrations/types';

export type EventixIntegrationState = {
  integration: EventbriteIntegration[] | null;
  isFetchingIntegration: boolean;
  isCreatingIntegration: boolean;
  isDeletingIntegration: boolean;
  isReconnectingIntegration: boolean;
  isFetchingSyncTask: boolean;
  syncTask: SyncTask | null;
  syncStatus: string | null;
}

import { EventGeniusIntegration, SyncTask } from '@/api/promoter-integrations/types';

export type EventGeniusIntegrationState = {
  integration: EventGeniusIntegration[] | null;
  isFetchingIntegration: boolean;
  isCreatingIntegration: boolean;
  isDeletingIntegration: boolean;
  isReconnectingIntegration: boolean;
  isFetchingSyncTask: boolean;
  syncTask: SyncTask | null;
  syncStatus: string | null;
}

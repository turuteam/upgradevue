import { DiceIntegration, SyncTask } from '@/api/promoter-integrations/types';

export type DiceIntegrationState = {
  integration: DiceIntegration[] | null;
  isFetchingIntegration: boolean;
  isCreatingIntegration: boolean;
  isDeletingIntegration: boolean;
  isReconnectingIntegration: boolean;
  isFetchingSyncTask: boolean;
  syncTask: SyncTask | null;
  syncStatus: string | null;
}

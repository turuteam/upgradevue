import { TryBookingIntegration, SyncTask } from '@/api/promoter-integrations/types';

export type TryBookingIntegrationState = {
  integration: TryBookingIntegration[] | null;
  isFetchingIntegration: boolean;
  isCreatingIntegration: boolean;
  isDeletingIntegration: boolean;
  isReconnectingIntegration: boolean;
  isFetchingSyncTask: boolean;
  syncTask: SyncTask | null;
  syncStatus: string | null;
}

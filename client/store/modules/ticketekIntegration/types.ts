import { SyncTask } from '@/api/promoter-integrations/types';

export type TicketekIntegrationState = {
  integration: any[] | null; // TODO - Update type
  isCreatingIntegration: boolean;
  isFetchingIntegration: boolean;
  isAddingIntegration: boolean;
  isDeletingIntegration: boolean;
  isFetchingSyncTask: boolean,
  syncTask: SyncTask | null;
  syncStatus: string | null;
}

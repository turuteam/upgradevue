export type ZoomIntegrationState = {
    integration: any[] | null; // TODO - Update type
    isFetchingIntegration: boolean;
    hasFetchedIntegration: boolean;
    isAddingIntegration: boolean;
    isDeletingIntegration: boolean;
    isReconnectingIntegration: boolean;
    isFetchingTasks: boolean;
    tasks: any[] | null; // TODO - Update type
    latestTaskStatus: any | null;
  }
  
import { PromoterIntegrationTask } from '@/api/promoter-integration-task/types';

export type FormattedPromoterTask = {
  name: string;
  subtitle: string;
  type: string;
  icon: string;
  clickthrough: string;
  startTime: string;
  status: string;
}

export type PromoterTasksState = {
  pendingTasks: PromoterIntegrationTask[];
  completedTasks: PromoterIntegrationTask[];
  isFetchingTasks: boolean;
  interval: ReturnType<typeof setInterval> | null;
  isFirstLoadCompletedTasksFinished: boolean;
}

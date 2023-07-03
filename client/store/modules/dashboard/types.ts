import { PrunedActivity } from '@/store/modules/customer/types';
import { Campaign } from '@/types/resources/campaign';
import { AREvent } from '@/store/modules/event/types';
import { PromoterIntegrationTask } from '~/api/promoter-integration-task/types';

export type chartData = {
  daily: {
    cats: {category: string, dateString: string}[],
    vals: number[],
  },
  monthly: {
    cats: {category: string, dateString: string}[],
    vals: number[],
  },
  yearly: {
    cats: {category: string, dateString: string}[],
    vals: number[],
  }
} | {};

export type DashboardState = {
  fanActivity: PrunedActivity[];
  isFetchingActivity: boolean;
  noOlderActivity: boolean;
  newActivityAvailable: boolean;
  checkingForNewActivity: boolean;
  hasErrorFetchingActivity: boolean;

  campaigns: Campaign[];
  isFetchingCampaigns: boolean;

  events: AREvent[];
  isFetchingEvents: boolean;

  salesStats: {};
  isFetchingSalesStats: boolean;

  salesChartData: chartData;
  salesChartDataTicket: chartData;
  salesChartDataLoyalty: chartData;
  salesChartDataEcommerce: chartData;
  chartTimezone: string | null;

  promoterTasks: PromoterIntegrationTask[];
}

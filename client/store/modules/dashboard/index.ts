import { Module } from "vuex";
import { RootState } from '@/store/modules/types';

import { clone } from '@/utils/helpers';
import { dashboardActions } from './actions';
import { DashboardState } from '@/store/modules/dashboard/types';
import { PrunedActivity } from '@/store/modules/customer/types';
import { Campaign } from '@/types/resources/campaign';
import { AREvent } from '@/store/modules/event/types';

import dayjs from 'dayjs';
import { PromoterIntegrationTask } from '~/api/promoter-integration-task/types';

export const initialDashboardState = (): DashboardState => ({
  fanActivity: [],
  isFetchingActivity: false,
  noOlderActivity: false,
  newActivityAvailable: false,
  checkingForNewActivity: false,
  hasErrorFetchingActivity: false,
  campaigns: [],
  isFetchingCampaigns: false,
  events: [],
  isFetchingEvents: false,
  salesStats: {},
  isFetchingSalesStats: false,
  salesChartData: {},
  salesChartDataTicket: {},
  salesChartDataEcommerce: {},
  salesChartDataLoyalty: {},
  chartTimezone: null,
  promoterTasks: []
});

const dashboardModule: Module<DashboardState, RootState> = {
  namespaced: true,
  state: initialDashboardState,
  actions: dashboardActions,
  mutations: {
    RESET_DASHBOARD(state) {
      state.fanActivity = [];
      state.isFetchingActivity = false;
      state.noOlderActivity = false;
      state.newActivityAvailable = false;
      state.checkingForNewActivity = false;
      state.hasErrorFetchingActivity = false;
      state.campaigns = [];
      state.isFetchingCampaigns = false;
      state.events = [];
      state.isFetchingEvents = false;
      state.salesStats = {};                // Sales stats as received by the server
      state.isFetchingSalesStats = false;
      state.salesChartData = {};            // Parsed sales data which has been put into day/month/year buckets
      state.salesChartDataTicket = {};
      state.salesChartDataEcommerce = {};
      state.salesChartDataLoyalty = {};
      state.chartTimezone = null;
      state.promoterTasks = [];
    },
    SET_IS_FETCHING_ACTIVITY(state, isFetching: boolean) {
      state.isFetchingActivity = isFetching;
    },
    SET_NO_OLDER_ACTIVITY(state, noOlder: boolean) {
      state.noOlderActivity = noOlder;
    },
    SET_NEW_ACTIVITY_AVAILABLE(state, activityAvailable: boolean) {
      state.newActivityAvailable = activityAvailable;
    },
    SET_CHECKING_FOR_NEW_ACTIVITY(state, checkingForNewActivity: boolean) {
      state.checkingForNewActivity = checkingForNewActivity;
    },
    SET_HAS_ERROR_FETCHING_ACTIVITY(state, hasError: boolean) {
      state.hasErrorFetchingActivity = hasError;
    },
    CONCAT_ACTIVITY(state, items: PrunedActivity[]) {
      // Also sort the activity, because the new activities could be prepended or appended to existing activities.
      // We also prune out duplicates, which can sometimes occur if we're sorting by the relatively limited ActivityTime
      state.fanActivity = clone(state.fanActivity.concat(items))
        .sort((a:PrunedActivity, b:PrunedActivity) => dayjs(b.datetime).valueOf() - dayjs(a.datetime).valueOf())
        .filter(function(item:PrunedActivity, pos:number, ary:PrunedActivity[]) {
          return pos === ary.findIndex((t) => (
            t.oid === item.oid
          ));
        });
    },
    RESET_ACTIVITY(state) {
      state.fanActivity = [];
      state.noOlderActivity = false;
      state.hasErrorFetchingActivity = false;
    },

    SET_IS_FETCHING_CAMPAIGNS(state, isFetching: boolean) {
      state.isFetchingCampaigns = isFetching;
    },
    CONCAT_CAMPAIGNS(state, items: Campaign[]) {
      state.campaigns = clone(state.campaigns.concat(items));
    },

    SET_IS_FETCHING_EVENTS(state, isFetching: boolean) {
      state.isFetchingEvents = isFetching;
    },
    CONCAT_EVENTS(state, items: AREvent[]) {
      state.events = clone(state.events.concat(items));
    },

    SET_IS_FETCHING_SALES_STATS(state, isFetching: boolean) {
      state.isFetchingSalesStats = isFetching;
    },
    SET_SALES_STATS(state, salesStats: any) {
      state.salesStats = salesStats;
    },

    SET_SALES_CHART_DATA(state, chartData: any) {
      state.salesChartData = clone(chartData);
    },
    SET_SALES_CHART_DATA_TICKET(state, chartData: any) {
      state.salesChartDataTicket = clone(chartData);
    },
    SET_SALES_CHART_DATA_LOYALTY(state, chartData: any) {
      state.salesChartDataLoyalty = clone(chartData);
    },
    SET_SALES_CHART_DATA_ECOMMERCE(state, chartData: any) {
      state.salesChartDataEcommerce = clone(chartData);
    },
    SET_SALES_CHART_TIMEZONE(state, tz: string | null) {
      state.chartTimezone = tz;
    },

    SET_PROMOTER_TASKS(state, tasks: PromoterIntegrationTask[]) {
      state.promoterTasks = clone(tasks);
    },
    CONCAT_PROMOTER_TASKS(state, tasks: PromoterIntegrationTask[]) {
      state.promoterTasks = state.promoterTasks.concat(clone(tasks));
    },
  },
  getters: {
  }
}

export default dashboardModule;

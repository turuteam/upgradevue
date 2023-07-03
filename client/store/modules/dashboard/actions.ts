import { ActionTree } from 'vuex'
import { RootState } from '@/store/modules/types';
import { DashboardState } from '@/store/modules/dashboard/types';
import dayjs from 'dayjs';
import { formatActivity } from '~/store/modules/customer/utils';

import {
  sortTsData,
  sortDataIntoBuckets, formatTimeseriesDataIntoChartData
} from './utils';
import { formatTask } from '~/store/modules/promoterTasks/utils';
import { PromoterIntegrationTask } from '~/api/promoter-integration-task/types';

export const dashboardActions: ActionTree<DashboardState, RootState> = {
  async FETCH_ACTIVITY(
    { state, rootState, commit },
    { activityType = null, top = 60, skip = 0, newerThan = false, olderThan = false, reload = false }
  ) {
    if (state.isFetchingActivity) return;
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    if (!promoterOid) return;

    const types = [];

    switch(activityType) {
      case "purchases":
        types.push('event-purchase', 'ecommerce-purchase', 'loyalty-program-action');
        break;
      case "campaigns":
        types.push('campaign-registration');
        break;
      case "events":
        types.push('event-purchase', 'event-attendance');
        break;
      default:
        types.push('campaign-registration', 'event-purchase', 'event-attendance', 'ecommerce-purchase', 'loyalty-program-action');
        break;
    }

    let formattedOlderThan = null;

    if (!olderThan && !newerThan) {
      formattedOlderThan = dayjs().utc().format('YYYY-MM-DD HH:mm:ss');
    } else if (!!olderThan) {
      formattedOlderThan = dayjs(olderThan).utc().format('YYYY-MM-DD HH:mm:ss');
    }
    const formattedNewerThan = !!newerThan ? dayjs(newerThan).utc().format('YYYY-MM-DD HH:mm:ss') : null;

    try {
      commit('SET_IS_FETCHING_ACTIVITY', true);
      if (reload) {
        commit('SET_NEW_ACTIVITY_AVAILABLE', false);
        commit('RESET_ACTIVITY');
      }
      // Add a skip by the number of existing items with the current date within current activity list. As we're sorting
      // secondarily by oid, this should help avoid double-ups.
      const countOfSameDateActivity = state.fanActivity.filter(item => item.datetime === olderThan || item.datetime === newerThan ).length;
      const modifiedSkip = (skip || 0) + countOfSameDateActivity;

      const activity = await this.$api.activity.fetchAll(promoterOid, {
        top,
        skip: modifiedSkip,
        types,
        olderThan: formattedOlderThan,
        newerThan: formattedNewerThan,
      });
      const formattedActivity = activity ? formatActivity(activity) : [];
      if (formattedActivity.length < top && !!olderThan) {
        commit('SET_NO_OLDER_ACTIVITY', true);
      }
      if (formattedActivity.length > 0) {
        commit('CONCAT_ACTIVITY', formattedActivity);
      }
    } catch (error) {
      console.error(error);
      commit('SET_HAS_ERROR_FETCHING_ACTIVITY', true);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch activity' })
    } finally {
      commit('SET_IS_FETCHING_ACTIVITY', false);
    }
  },

  // Do a test where top is 1, checking for newerThan
  async CHECK_FOR_NEWER_ACTIVITY(
    { state, rootState, commit },
    { activityType = null, newerThan = false }
  ) {
    if (state.isFetchingActivity) return;
    if (state.checkingForNewActivity) return;
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    if (!promoterOid) return;

    const types = [];
    switch(activityType) {
      case "purchases":
        types.push('event-purchase', 'ecommerce-purchase', 'loyalty-program-action');
        break;
      case "campaigns":
        types.push('campaign-registration');
        break;
      case "events":
        types.push('event-purchase', 'event-attendance');
        break;
      default:
        types.push('campaign-registration', 'event-purchase', 'event-attendance', 'ecommerce-purchase', 'loyalty-program-action');
        break;
    }
    const formattedNewerThan = !!newerThan ? dayjs(newerThan).format('YYYY-MM-DD HH:mm:ss') : null;

    try {
      commit('SET_CHECKING_FOR_NEW_ACTIVITY', true);
      const activity = await this.$api.activity.fetchAll(promoterOid, {
        types,
        top: 1,
        newerThan: formattedNewerThan,
      });
      if (activity && activity.length > 0) {
        commit('SET_NEW_ACTIVITY_AVAILABLE', true);
      } else {
        commit('SET_NEW_ACTIVITY_AVAILABLE', false);
      }
    } catch (error) {
      console.error(error);
      commit('SET_HAS_ERROR_FETCHING_ACTIVITY', true);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch activity' });
    } finally {
      commit('SET_CHECKING_FOR_NEW_ACTIVITY', false);
    }
  },

  async FETCH_CAMPAIGNS(
    { state, rootState, commit }
  ) {
    if (state.isFetchingCampaigns) return;
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    if (!promoterOid) return;

    try {
      commit('SET_IS_FETCHING_CAMPAIGNS', true);
      const filterString = `endDate > "NOW()"`;
      const campaigns = await this.$api.campaign.fetchAll(promoterOid, {
        top: 'all',
        skip: 0,
        filter: filterString,
        orderby: 'endDate asc'
      });
      if (campaigns) commit('CONCAT_CAMPAIGNS', campaigns);
    } catch (error) {
      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch campaigns' })
    } finally {
      commit('SET_IS_FETCHING_CAMPAIGNS', false);
    }
  },

  async FETCH_EVENTS(
    { state, rootState, commit }
  ) {
    if (state.isFetchingEvents) return;
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    if (!promoterOid) return;

    try {
      commit('SET_IS_FETCHING_EVENTS', true);
      const filterString = `startDate > "NOW()"`;
      const events = await this.$api.event.fetchAll(promoterOid, {
        top: 10,
        skip: 0,
        filter: filterString,
        orderby: 'startDate asc',
        count: true,
      });
      if (events) commit('CONCAT_EVENTS', events.rows);
    } catch (error) {
      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch events' })
    } finally {
      commit('SET_IS_FETCHING_EVENTS', false);
    }
  },

  async FETCH_SALES_STATS(
    { state, rootState, commit },
    { timePeriod = null, startDate, endDate }
  ) {
    if (state.isFetchingSalesStats) return;
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    if (!promoterOid) return;
    let startDateLocal = null;
    let endDateLocal = null;

    switch(timePeriod) {
      case "days-seven":
        startDateLocal = `${dayjs().subtract(7, 'day').format('YYYY-MM-DD')} 00:00:00`;
        endDateLocal = `${dayjs().format('YYYY-MM-DD')} 23:59:59`;
        break;
      case "days-fourteen":
        startDateLocal = `${dayjs().subtract(14, 'day').format('YYYY-MM-DD')} 00:00:00`;
        endDateLocal = `${dayjs().format('YYYY-MM-DD')} 23:59:59`;
        break;
      case "days-thirty":
        startDateLocal = `${dayjs().subtract(30, 'day').format('YYYY-MM-DD')} 00:00:00`;
        endDateLocal = `${dayjs().format('YYYY-MM-DD')} 23:59:59`;
        break;
      case "months-six":
        startDateLocal = `${dayjs().subtract(6, 'month').startOf('month').format('YYYY-MM-DD')} 00:00:00`;
        endDateLocal = `${dayjs().format('YYYY-MM-DD')} 23:59:59`;
        break;
      case "months-twelve":
        startDateLocal = `${dayjs().subtract(12, 'month').startOf('month').format('YYYY-MM-DD')} 00:00:00`;
        endDateLocal = `${dayjs().format('YYYY-MM-DD')} 23:59:59`;
        break;
      case "this-year":
        startDateLocal = `${dayjs().startOf('year').format('YYYY-MM-DD')} 00:00:00`;
        endDateLocal = `${dayjs().format('YYYY-MM-DD')} 23:59:59`;
        break;
      case "all-time":
        startDateLocal = `1980-01-01 00:00:00`; // Setting an arbitrarily early date
        endDateLocal = `${dayjs().format('YYYY-MM-DD')} 23:59:59`;
        break;
      case "custom":
        startDateLocal = `${dayjs(startDate).format('YYYY-MM-DD')} 00:00:00`;
        endDateLocal = `${dayjs(endDate).format('YYYY-MM-DD')} 23:59:59`;
        break;
      default:
        startDateLocal = `${dayjs().subtract(30, 'day').format('YYYY-MM-DD')} 00:00:00`;
        endDateLocal = `${dayjs().format('YYYY-MM-DD')} 23:59:59`;
    }

    const startDateUtc = `${dayjs(startDateLocal).utc().format('YYYY-MM-DD')} 00:00:00`;
    const endDateUtc = `${dayjs(endDateLocal).utc().format('YYYY-MM-DD')} 23:59:59`;

    try {
      commit('SET_IS_FETCHING_SALES_STATS', true);
      let filterString = `date = "${startDateUtc}" OR (date > "${startDateUtc}" AND date < "${endDateUtc}")`;
      const url = `/promoter/${promoterOid}/sales-stats?$filter=${encodeURIComponent(filterString)}`;

      const { data } = await this.$axios.get(url, {
        params: {
          $top: 'all'
        }
      });
      if (data) commit('SET_SALES_STATS', data);

      const chartTimezone = state.chartTimezone || 'UTC';

      const sortedData = sortDataIntoBuckets(data, chartTimezone, startDateLocal, endDateLocal);

      if (!sortedData.all.day || sortedData.all.day.length < 1) {
        commit('SET_SALES_CHART_DATA', {});
        commit('SET_SALES_CHART_DATA_TICKET', {});
        commit('SET_SALES_CHART_DATA_LOYALTY', {});
        commit('SET_SALES_CHART_DATA_ECOMMERCE', {});
        return;
      }

      const formattedChartDataAll = await formatTimeseriesDataIntoChartData(sortedData.all);
      const formattedChartDataTicket = await formatTimeseriesDataIntoChartData(sortedData.ticket);
      const formattedChartDataLoyalty = await formatTimeseriesDataIntoChartData(sortedData.loyalty);
      const formattedChartDataEcommerce = await formatTimeseriesDataIntoChartData(sortedData.ecommerce);

      commit('SET_SALES_CHART_DATA', formattedChartDataAll);
      commit('SET_SALES_CHART_DATA_TICKET', formattedChartDataTicket);
      commit('SET_SALES_CHART_DATA_LOYALTY', formattedChartDataLoyalty);
      commit('SET_SALES_CHART_DATA_ECOMMERCE', formattedChartDataEcommerce);

    } catch (error) {
      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch event ticket stats' })
    } finally {
      commit('SET_IS_FETCHING_SALES_STATS', false);
    }
  },

  async REFRESH_SALES_STATS(
    { state, rootState, commit }
  ) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    if (!promoterOid) return;
    const url = `/promoter/${promoterOid}/sales-stats-refresh`;
    const { headers, status, data } = await this.$axios.post(url);
  },

  async UPDATE_CHART_TIMEZONE(
    { state, rootState, commit }
  ) {
    const tz = Intl && Intl.DateTimeFormat() ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';
    commit('SET_SALES_CHART_TIMEZONE', tz)
  },


  async CHECK_RECENT_TASKS({ state, rootState, commit, dispatch }, {
    top = 15,
    skip = 0,
    reload = true,
  }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    const taskStatus = ["completed", "failed", "cancelled", "pending", "in-progress"];
    let promoterTasks = await this.$api.promoterIntegrationTask.fetchAll(
      promoterOid,
      {
        taskStatus,
        top,
        skip
      }
    );
    if (reload) {
      commit('SET_PROMOTER_TASKS', promoterTasks.map((item:PromoterIntegrationTask) => formatTask(item)));
    } else {
      commit('CONCAT_PROMOTER_TASKS', promoterTasks.map((item:PromoterIntegrationTask) => formatTask(item)));
    }
  }
}

import { ActionTree } from 'vuex';
import moment from 'moment';
import { RootState } from '@/store/modules/types';
import { mergeSearchStringToFanFilters, fanFilterWithExtraConditions } from '@/utils/filter/';
import { magicDownload } from '@/utils/html-element/';
import { MessageList, MessageListChannel } from '@/api/message-lists/types';
import { AudienceState, Audience, AudienceOptInStats } from './types';
import { pruneSourceAudience } from './utils';

export const audienceActions: ActionTree<AudienceState, RootState> = {
  async FETCH_MORE_AUDIENCE(
    { state, rootState, commit, dispatch },
    {
      searchString = '',
      top = 50,
      orderBy = { key: 'sysMtime', order: 'desc' },
      filter = { conditions: [], logic: [] },
      selectKeys = null,
      reload = false,
      skipCount = false, // when true, will skip fetching the count on reload
    },
  ) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    if (reload) {
      commit('RESET_AUDIENCE', { skipResetAudienceCount: skipCount });
    }

    // Stop trying to fetch if a fail has previously occurred - can be reset with a call to RESET_AUDIENCE
    if (state.hasFetchAudienceFailed) {
      console.error("FETCH_MORE_AUDIENCE request cancelled due to failed prior request.");
      return;
    }

    const filterStr = JSON.stringify(mergeSearchStringToFanFilters(filter, searchString));

    try {
      commit('SET_IS_FETCHING_AUDIENCE', true);

      if (!skipCount && reload) dispatch('FETCH_AUDIENCE_COUNT', { searchString, filter });

      const data = await this.$api.audience.fetchAudience(
        promoterOid,
        top,
        `${orderBy.key} ${orderBy.order}, oid ${orderBy.order}`,
        state.audience.length,
        filterStr,
        selectKeys ? selectKeys.join(',') : null
      );

      // Manually add "name" to Fan Object
      const audience: Audience = pruneSourceAudience(data);

      if (reload) {
        commit('SET_AUDIENCE', audience);
        commit('RENEW_AUDIENCE_SELECTION');
      } else {
        commit('CONCAT_AUDIENCE', audience);

        if (state.audienceSelection.useScratchSegment) {
          commit('SELECT_ALL_AUDIENCE');
        }
      }

      if (audience.length < top) {
        commit('SET_IS_NO_MORE_AUDIENCE', true);
      }

    } catch (error) {
      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch audience' });
      commit('SET_HAS_FETCH_AUDIENCE_FAILED', true);
    } finally {
      commit('SET_IS_FETCHING_AUDIENCE', false);
    }
  },
  // We have to do this call in parallel with FETCH_MORE_AUDIENCE, because it takes
  // a very long time to calculate the "count", so we have to separate it from that action.
  async FETCH_AUDIENCE_COUNT(
    { rootState, state, commit },
    {
      searchString = '',
      filter = { conditions: [], logic: [] },
    },
  ) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;

    commit('SET_IS_FETCHING_AUDIENCE_COUNT', true);

    try {
      const count = await this.$api.audience.fetchAudienceCount(promoterOid, mergeSearchStringToFanFilters(filter, searchString));

      commit('SET_AUDIENCE_COUNT', count);
      if (!searchString && filter.conditions.length === 0) {
        // If no search conditions given, the "audienceCount" will also be equal to "promoterAudienceCount"
        commit('SET_PROMOTER_AUDIENCE_COUNT', count);
      }
      commit('SET_IS_FETCHING_AUDIENCE_COUNT', false);

    } catch (error) {
      if (this.$axios.isCancel(error)) {
        console.error(error);
      } else {
        console.error(error);
        this.$arNotification.push({ type: 'error', message: 'Failed to fetch audience count' });
        commit('SET_IS_FETCHING_AUDIENCE_COUNT', false);
      }
    }
  },

  async FETCH_PROMOTER_AUDIENCE_COUNT(
    { state, rootState, commit },
  ) {
    if (state.isFetchingPromoterAudienceCount) {
      return;
    }
    if (state.promoterAudienceCount !== null) {
      // We already fetched it before
      return;
    }
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;


    try {
      commit('SET_IS_FETCHING_PROMOTER_AUDIENCE_COUNT', true);
      const params = {
        $top: 0,
        $count: true,
      };
      const { data } = await this.$axios.get(`/promoter/${promoterOid}/filter-fan/`, {params});
      const totalAudienceCount: number = data.count;
      // Fake fan data if useDummyData is true
      commit('SET_PROMOTER_AUDIENCE_COUNT', totalAudienceCount);
    } catch(err) {
      console.error(err);
      commit('SET_PROMOTER_AUDIENCE_COUNT', 0);
    } finally {
      commit('SET_IS_FETCHING_PROMOTER_AUDIENCE_COUNT', false);
    }
  },

  async DELETE_AUDIENCE({ rootState }, { fanOids, filter, searchString, fansCount }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    const filterDecorated = mergeSearchStringToFanFilters(filter, searchString);

    try {
      const body: any = {};
      if (fanOids) {
        body.fanOids = fanOids;
      } else {
        body.filter = filterDecorated;
      }

      await this.$axios.post(`/promoter/${promoterOid}/mass-delete-fan`, body);
      this.$arNotification.push({ type: 'success', message: `Successfully deleted ${fansCount} contacts. Deleting may take some time.` });
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({ type: 'error', message: `Failed to delete ${fansCount} contacts` });
      return false;
    }
  },
  async IMPORT_AUDIENCE_CSV({ rootState, dispatch, commit }, payload) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    const { csvHeaders } = payload;

    try {
      commit('SET_IS_IMPORTING_AUDIENCE_CSV', true);

      const res = await this.$axios.post(`/promoter/${promoterOid}/audience-import`, payload);
      let message = '';

      // big file, therefore rows
      // will be imported asyncronously
      if (res.status === 202) {
        this.$arNotification.push({
          type: 'success',
          message: `Import has started. Your contacts will be added soon`,
        });
      } else {
        const { data } = res;
        message = `CSV successfully imported`;
        if (data.importedRowCount === 0) {
          this.$arNotification.push({
            type: 'error',
            message: `Your CSV import was not successful, and none of the data was imported`,
          });
        } else if (data.importedRowCount !== data.totalRowCount) {
          const failedRows = [csvHeaders, ...data.failedRows];

          const answer = await this.$arNotification.push({
            type: 'warning',
            message: 'Your import was partially complete.',
            link: 'Click here for more info',
          });

          if (answer) {
            dispatch('OPEN_FAILED_IMPORT_MODAL', failedRows);
          }
        } else {
          this.$arNotification.push({
            type: 'success',
            message: `CSV successfully imported`,
          });
        }
      }
    } catch (error: any) {
      console.error(error);
      const serverReason = error.response && error.response.message ? error.response.message.details : error;
      this.$arNotification.push({
        type: 'error',
        message: serverReason,
      });
    } finally {
      commit('SET_IS_IMPORTING_AUDIENCE_CSV', false);
    }
  },
  async EXPORT_AUDIENCE_CSV({ rootState, commit }, {
    searchString = '',
    selectKeys,
    filter,
    fans,
    orderBy,
  }: { [key: string]: any, fans: Audience }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    try {
      commit('SET_IS_EXPORTING_AUDIENCE_CSV', true);
      const filterStr = JSON.stringify(mergeSearchStringToFanFilters(filter, searchString));

      // If we get list of fanOids, don't bother with filter then.
      let fanOidsFilter: string | null = null;
      if (fans && fans.length > 0) {
        fanOidsFilter = fans.map(fan => {
          return `oid=${fan.oid}`;
        }).join(' OR ');
      }

      const { status, data } = await this.$axios.get(`/promoter/${promoterOid}/filter-fan-export/`, {
        params: {
          $top: 'all',
          $select: selectKeys.join(','),
          $orderby: `${orderBy.key} ${orderBy.order}`,
          $audienceFilter: filterStr,
          $filter: fanOidsFilter,
        },
      });

      if (status === 200) {
        const fileName = `attendees-${moment().format('DD/MM/YYYY')}.csv`;
        magicDownload(data, fileName);
      } else {
        this.$arNotification.push({
          type: 'success',
          message: data,
          timeout: 5000
        });
      }
    } catch (err) {
      console.error(err);
      this.$arNotification.push({ type: 'error', message: 'Failed to export CSV' });
    } finally {
      commit('SET_IS_EXPORTING_AUDIENCE_CSV', false);
    }
  },
  async FETCH_AUDIENCE_OPT_IN_STATISTICS({ rootState, commit },
    {
      messageList,
      filter = { conditions: [], logic: [] },
      searchString,
    }: { messageList: MessageList, filter: any, searchString: string },
  ) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    const optInStas: AudienceOptInStats = {
      email: { optIns: 0, totalAvailable: 0 },
      sms: { optIns: 0, totalAvailable: 0 }
    };

    const fetchOptInsStats = async (audienceFilterStr: string, channel: MessageListChannel, field: 'optIns' | 'totalAvailable' | 'both') => {
      const { data: { count } } = await this.$axios.get(`/promoter/${promoterOid}/filter-fan/`, {
        params: {
          $count: 'true',
          $top: '0',
          $audienceFilter: audienceFilterStr,
        },
      });
      if (field === 'both') {
        optInStas[channel].optIns = count;
        optInStas[channel].totalAvailable = count;
      } else {
        optInStas[channel][field] = count;
      }
    }

    const generateAudienceFilterStr = (extraFilterConditions: any) => {
      const filterWithSeachString = searchString ? mergeSearchStringToFanFilters(filter, searchString) : filter;
      return JSON.stringify(
        fanFilterWithExtraConditions(
          filterWithSeachString,
          extraFilterConditions,
          Array(extraFilterConditions.length - 1).fill('and')
        ),
      );
    }

    const fetchStatsPromises = [];
    let audienceFilterStr;
    if (messageList.email) {
      // All available emails
      audienceFilterStr = generateAudienceFilterStr([
        { name: 'emailAddress', type: 'text', data: { condition: 'is_known' } },
      ]);
      fetchStatsPromises.push(
        fetchOptInsStats(audienceFilterStr, 'email', 'totalAvailable'),
      );
      // All opted emails
      audienceFilterStr = generateAudienceFilterStr([
        { name: 'emailAddress', type: 'text', data: { condition: 'is_known' } },
        { name: 'subscribedTo', type: 'select', data: 'email' },
      ]);
      fetchStatsPromises.push(
        fetchOptInsStats(audienceFilterStr, 'email', 'optIns'),
      );
    }
    if (messageList.sms) {
      // All available SMS
      audienceFilterStr = generateAudienceFilterStr([
        { name: 'mobileNumber', type: 'text', data: { condition: 'is_known' } },
      ]);
      fetchStatsPromises.push(
        fetchOptInsStats(audienceFilterStr, 'sms', 'totalAvailable'),
      );
      // All opted SMS
      audienceFilterStr = generateAudienceFilterStr([
        { name: 'mobileNumber', type: 'text', data: { condition: 'is_known' } },
        { name: 'subscribedTo', type: 'select', data: 'sms' },
      ]);
      fetchStatsPromises.push(
        fetchOptInsStats(audienceFilterStr, 'sms', 'optIns'),
      );
    }

    try {
      commit('SET_IS_FETCHING_AUDIENCE_OPT_INS_STATS', true);
      await Promise.all(fetchStatsPromises);
      commit('SET_AUDIENCE_OPT_INS_STATS', optInStas);
    } catch (err) {
      console.error(err);
    } finally {
      commit('SET_IS_FETCHING_AUDIENCE_OPT_INS_STATS', false);
    }
  },
  async FETCH_ZOOM_ATTENDANCE(
    { state, rootState, commit, dispatch },
    {
      eventOid = 0,
      searchString = '',
      top = 100,
      orderBy = { key: 'sysMtime', order: 'desc' },
      filter = { conditions: [], logic: [] },
      selectKeys = null,
      reload = false,
    },
  ) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;

    if (reload) {
      commit('RESET_AUDIENCE');
    }

    // Stop trying to fetch if a fail has previously occurred - can be reset with a call to RESET_AUDIENCE
    if (state.hasFetchAudienceFailed) {
      console.error("FETCH_MORE_AUDIENCE request cancelled due to failed prior request.");
      return;
    }

    try {
      commit('SET_IS_FETCHING_AUDIENCE', true);

      let paramObj = {
        $top: top,
        $skip: state.audience.length,
        $orderby: `${orderBy.key} ${orderBy.order}`,
      }

      const res = await this.$api.audience.fetchZoomAttendance(promoterOid, eventOid, searchString || '', paramObj)

      if (!res) { return; }

      const audience: Audience = pruneSourceAudience(res);

      if (reload) {
        commit('SET_AUDIENCE', audience);
        commit('RENEW_AUDIENCE_SELECTION');
        dispatch('FETCH_AUDIENCE_COUNT', { searchString, filter });
      } else {
        commit('CONCAT_AUDIENCE', audience);

        if (state.audienceSelection.useScratchSegment) {
          commit('SELECT_ALL_AUDIENCE');
        }
      }

      if (audience.length < top) {
        commit('SET_IS_NO_MORE_AUDIENCE', true);
      }
    } catch (error) {
      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch audience' });
      commit('SET_HAS_FETCH_AUDIENCE_FAILED', true);
    } finally {
      commit('SET_IS_FETCHING_AUDIENCE', false);
    }
  },
};

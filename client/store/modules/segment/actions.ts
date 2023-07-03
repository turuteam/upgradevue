import { ActionTree } from 'vuex'
import { RootState } from '@/store/modules/types';
import { filterObjectToQueryString } from '@/utils/helpers';
import { SegmentState } from './types';
import { mergeObjects } from '@/utils/helpers/';
import { clone } from '@/utils/helpers/';

export const segmentActions: ActionTree<SegmentState, RootState> = {
  async CREATE_SEGMENT({ commit, rootState }, {
    name,
    filter,
    favourite = false,
    userDefined = true,
    version = 2,
  } = {}) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    const url = `promoter/${promoterOid}/filter-group`;
    const body = {
      name,
      filter,
      favourite,
      version,
      userDefined,
      promoterOid: promoterOid,
    };
    // Do not notify promoters anything change for scratch or internal filter
    let notVisibleToClient = false;
    if (name === '_scratch_' || name === '_internal_') {
      notVisibleToClient = true;
    }

    try {
      if (!notVisibleToClient) {
        commit('SET_IS_CREATING_SEGMENT', true);
      }

      const { data } = await this.$axios.post(url, body);
      if (name === '_internal_') {
        commit('SET_INTERNAL_SEGMENT', data);
      } else if (name === '_scratch_') {
        commit('SET_SCRATCH_SEGMENT', data);
      } else {
        commit('ADD_TO_SAVED_SEGMENT_LIST', data);
        commit('SET_SCRATCH_SEGMENT_BY_SAVED_SEGMENT', data.oid);
      }

      if (!notVisibleToClient) {
        this.$arNotification.push({ type: 'success', message: 'Successfully created segment' });
      }
    } catch (e: any) {
      console.error(e);

      if (e.response && e.response.status === 409) {
        this.$arNotification.push({ type: 'error', message: 'Did not duplicate segment, must have unique name' });
        console.error("Caught exception in CREATE_SEGMENT (409)", e)
        return;
      }
      this.$arNotification.push({ type: 'error', message: 'Failed to create segment' });
      console.error("Caught exception in CREATE_SEGMENT", e)
    } finally {
      commit('SET_IS_CREATING_SEGMENT', false);
    }
  },
  async DELETE_SEGMENT({ commit, dispatch, rootState, state }, filter) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    try {
      commit('SET_IS_DELETING_SEGMENT', true);

      const { data } = await this.$axios.get(`/promoter/${promoterOid}/message-list`, {
        params: {
          $skip: 0,
          $top: 1,
          $filter: `filterGroupOid=${filter.oid}`,
        },
      });
      const relatedDynamicMessageList = data[0];
      let agreed = false;

      if (relatedDynamicMessageList) {
        const lists: any[] = [{
          image: null,
          name: relatedDynamicMessageList.name,
          subscribers: relatedDynamicMessageList.statsSnapshot ? relatedDynamicMessageList.statsSnapshot.total : 0,
        }];
        // If so, then show a cancellation modal with a list of lists which will be deleted
        agreed = await dispatch('OPEN_CANCELLATION_MODAL', {
          title: `Are you sure you want to delete this segment?`,
          messageHtmlBefore: `<p style="color:#8492a6; font-size:16px;">${filter.name}</p><br/>Deleting this segment will remove subscribers for the following lists:`, // TODO - Use $arStyle
          featureList: lists,
          showCancellationReasonTextarea: false,
          confirmButtonProps: {
            text: `Delete Segment`,
          },
          cancelType: `link`,
          cancelButtonProps: {
            text: `Don't delete`,
            style: {
              width: 'auto',
            },
          },
        }, { root: true });
      } else {
        // Otherwise, show a regular old cancellation modal
        agreed = await dispatch('OPEN_CANCELLATION_MODAL', {
          title: `Are you sure you want to delete this segment?`,
          messageHtmlBefore: `<p style="color:#8492a6; font-size:16px;">${filter.name}</p>`, // TODO - Use $arStyle
          showCancellationReasonTextarea: false,
          confirmButtonProps: {
            text: `Delete Segment`,
          },
          cancelType: `link`,
          cancelButtonProps: {
            text: `Don't delete`,
            style: {
              width: 'auto',
            },
          },
        }, { root: true });
      }

      if (!agreed) {
        commit('SET_IS_DELETING_SEGMENT', false);
        return;
      }

      await this.$axios.delete(`/promoter/${promoterOid}/filter-group/${filter.oid}`);

      commit('DELETE_FROM_SAVED_SEGMENT_LIST', filter.oid);

      if (
        state.scratchSegmentInfo.source === 'saved-audience-filter' &&
        filter.oid === state.scratchSegmentInfo.sourceOid
      ) {
        commit('RESET_SCRATCH_SEGMENT');
      }

      this.$arNotification.push({ type: 'success', message: 'Successfully deleted segment' });
      return true;
    } catch (error) {
      console.error(error);

      this.$arNotification.push({ type: 'error', message: 'Failed to delete segment' });
      return false;
    } finally {
      commit('SET_IS_DELETING_SEGMENT', false);
    }
  },
  async FETCH_SEGMENT_CRITERIA({ commit, rootState }) {
    if (rootState.segment.segmentCriteriaGroups.length !== 0) return;

    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    const url = `promoter/${promoterOid}/filter-criteria`;
    try {
      const { data } = await this.$axios.get(url);
      commit('SET_SEGMENT_CRITERIA', data);
    } catch (error) {
      console.error(error);
      console.error("Caught exception in FETCH_SEGMENT_CRITERIA", error)
    }
  },
  async FETCH_SEGMENTS(
    { commit, dispatch, rootState },
    {
      select = 'oid,name,meta,filter,userDefined,favourite',
      top = 'all',
      orderby = 'oid desc',
      filterString = null,
      filters = {
        expressions: [
          {
            key: 'userDefined',
            operator: '=',
            value: true,
          }, {
            key: 'version',
            operator: '=',
            value: 2,
          },
        ],
        logicalOperators: ['AND'],
      },
    } = {}) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    const url = `promoter/${promoterOid}/filter-group`;
    try {
      const { data } = await this.$axios.get(url, {
        params: {
          $top: top,
          $filter: filterString ? filterString : filterObjectToQueryString(filters),
          $select: select,
          $orderby: `favourite desc,${orderby}`,
        },
      });
      const savedFilters = data.filter((filter: Segment) => {
        return filter.name !== '_internal_' && filter.name !== '_scratch_';
      });
      const internalFilter = data.filter((filter: Segment) => filter.name === '_internal_')[0];
      const scratchFilter = data.filter((filter: Segment) => filter.name === '_scratch_')[0];
      commit('SET_SAVED_SEGMENT_LIST', savedFilters);
      if (internalFilter) {
        commit('SET_INTERNAL_SEGMENT', internalFilter);
      }
      if (scratchFilter) {
        commit('SET_SCRATCH_SEGMENT', scratchFilter);
      }

      // If internal filter not exists, make one
      if (!internalFilter) {
        await dispatch('CREATE_SEGMENT', {
          name: '_internal_',
          filter: { conditions: [], logic: [] },
        });
      }

      // If internal filter not exists, make one
      if (!scratchFilter) {
        await dispatch('CREATE_SEGMENT', {
          name: '_scratch_',
          filter: { conditions: [], logic: [] },
        });
      }
    } catch (error) {
      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch segments' });
      console.error("Caught exception in FETCH_SEGMENTS", error)
    }
  },
  async UPDATE_SAVED_SEGMENT({ commit, rootState, state }, { oid, editFilter }) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;

    if (state.scratchSegmentInfo.source === 'message-segment') {
      return;
    }

    const url = `promoter/${promoterOid}/filter-group/${oid}`;
    try {
      commit('SET_IS_PATCHING_SEGMENT', true);
      await this.$axios.patch(url, editFilter);
      commit('PATCH_SEGMENT_IN_SAVED_SEGMENT_LIST', { oid, editFilter });

      // If source of scratch filter is also the filter you're gonna patch
      if (
        state.scratchSegmentInfo.source === 'saved-audience-filter' &&
        oid === state.scratchSegmentInfo.sourceOid
      ) {
        if (!!editFilter.filter) {
          // If filter field exists, set entire scratch filter by the filter you just patched
          commit('SET_SCRATCH_SEGMENT_BY_SAVED_SEGMENT', oid);
        } else {
          // If it doesn't include filter field, just patch fields that were updated
          commit('PATCH_SCRATCH_SEGMENT', editFilter);
        }
      }

      return true;
    } catch (error: any) {
      console.error(error);

      if (error.response && error.response.status === 409) {
        this.$arNotification.push({ type: 'error', message: 'Did not duplicate segment, must have unique name' });
      } else {
        this.$arNotification.push({ type: 'error', message: 'Failed to update segment' });
      }
      console.error("Caught exception in UPDATE_SAVED_SEGMENT", error)
      return false;
    } finally {
      commit('SET_IS_PATCHING_SEGMENT', false);
    }
  },
  async UPDATE_SCRATCH_SEGMENT({ commit, rootState, state, getters, rootGetters }) {
    if (!rootState.auth.account) { return; }
    if (!state.scratchSegment) { return; }
    const { promoterOid } = rootState.auth.account;

    if (
      state.scratchSegmentInfo.source === 'message-segment'
    ) {
      const prunedScratchSegmentFilter = clone(getters.prunedScratchSegment.filter)
      let targetingFilter = clone(rootGetters['messageList/getCurrentFilterExpression']);

      if (!targetingFilter) {
        targetingFilter = prunedScratchSegmentFilter
      } else {
        if (!targetingFilter.conditions) {
          targetingFilter.conditions = []
        }
        if (!targetingFilter.logic) {
          targetingFilter.logic = []
        }

        if (!!prunedScratchSegmentFilter.conditions && prunedScratchSegmentFilter.conditions.length > 0) {
          targetingFilter.conditions = prunedScratchSegmentFilter.conditions.concat(targetingFilter.conditions)

          if (prunedScratchSegmentFilter.logic.length > 0) {
            targetingFilter.logic = (['(']).concat(prunedScratchSegmentFilter.logic).concat([')']).concat(['and']).concat(targetingFilter.logic)
          } else {
            targetingFilter.logic = ['and'].concat(targetingFilter.logic)
          }
        }
      }

      const routeParts = rootState.route.path.split('/');
      const mainPage = routeParts[1];

      if (!!targetingFilter && mainPage == "message-center" && (routeParts.length >= 3)) {
        const messageType = routeParts[3]

        if (messageType === "email") {
          commit('message/PUT_FILTERING_IN_SCRATCH_EMAIL_MESSAGE', targetingFilter, { root: true });
        } else {
          commit('message/PUT_FILTERING_IN_SCRATCH_SIMPLE_MESSAGE', targetingFilter, { root: true });
        }
      }
    } else {
      const url = `promoter/${promoterOid}/filter-group/${state.scratchSegment.oid}`;
      const body = {
        filter: getters.prunedScratchSegment.filter,
      };

      try {
        await this.$axios.patch(url, body);
      } catch (error) {
        console.error(error);
        console.error("Caught exception in UPDATE_SCRATCH_SEGMENT", error)
      }
    }
  },
};

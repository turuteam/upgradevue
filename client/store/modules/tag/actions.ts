import { ActionTree } from 'vuex'
import { RootState } from '@/store/modules/types';
import { clone } from '@/utils/helpers/';
import { TagState, EditTag } from './types';

export const tagActions: ActionTree<TagState, RootState> = {
  async FETCH_MORE_TAGS(
    { rootState, state, commit },
    { top = 550, searchString = '', reload = false, cancelToken = null }
  ) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    if (reload) {
      commit('RESET_TAGS');
    }
    if (state.hasFetchTagsFailed) {
      console.error(`FETCH_MORE_TAGS request cancelled due to previous request failure.`);
      return;
    }
    try {
      commit('SET_IS_FETCHING_TAGS', true);
      const res = await this.$axios.get(`/promoter/${promoterOid}/tag`, {
        cancelToken: cancelToken,
        params: {
          $count: true,
          $select: 'oid,name,count,favourite,external',
          $orderby: 'favourite desc, external desc',
          $top: top,
          $skip: state.tags.length,
          $filter: searchString ? `name ILIKE "%${searchString}%"` : null,
        },
      });

      if (reload) {
        commit('SET_TAGS', res.data.rows);
      } else {
        commit('CONCAT_TAGS', res.data.rows);
      }
      commit('SET_TAGS_COUNT', res.data.count);
      if (res.data.rows.length === 0) {
        commit('SET_IS_NO_MORE_TAGS', true);
      }
      return res.data
    } catch (error) {
      if (this.$axios.isCancel(error)) {
        console.log('Request canceled', error);
      } else {
        console.error(error);
        this.$arNotification.push({ type: 'error', message: 'Failed to fetch tags' });
        commit('SET_HAS_FETCH_TAGS_FAILED', true);
      }
    } finally {
      commit('SET_IS_FETCHING_TAGS', false);
    }
  },
  async PATCH_TAG(
    { rootState, commit },
    { oid, editTag }: { oid: number, editTag: EditTag },
  ) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    const newEditTag: EditTag = clone(editTag);
    // We only save tag name in lower case, be careful
    if (newEditTag.name) {
      newEditTag.name = newEditTag.name.toLowerCase();
    }
    try {
      commit('SET_IS_PATCHING_TAG', true);
      await this.$axios.patch(
        `/promoter/${promoterOid}/tag/${oid}`,
        newEditTag,
      );
      commit('PATCH_TAG_IN_TAGS', { oid, editTag: newEditTag });

      this.$arNotification.push({ type: 'success', message: 'Successfully updated tag' });
      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to update tags' });
      return false;
    } finally {
      commit('SET_IS_PATCHING_TAG', false);
    }
  },
  async DELETE_TAG({ rootState, commit }, oid: number) {
    if (!rootState.auth.account) { return; }
    const { promoterOid } = rootState.auth.account;
    try {
      commit('SET_IS_DELETING_TAG', true);
      await this.$axios.delete(`/promoter/${promoterOid}/tag/${oid}`);

      // If the tag was selected in Segment Module
      if (
        rootState.segment.scratchSegmentInfo.source === 'tag'
        && rootState.segment.scratchSegmentInfo.sourceOid === oid
      ) {
        commit('RESET_SCRATCH_SEGMENT');
      }

      commit('REMOVE_TAG_FROM_TAGS', oid);

      return true;
    } catch (error) {
      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to patch tags' });
      return false;
    } finally {
      commit('SET_IS_DELETING_TAG', false);
    }
  },
  async ADD_TAG({ dispatch, commit, rootState }, {name, favourite = false, external = false}) {
    if (!rootState.auth.account) return
    const { promoterOid } = rootState.auth.account

    try {
      let resp = await this.$api.tags.create(promoterOid, name, favourite, external)
      return resp

    } catch (error: any) {
      console.error(error)
      this.$arNotification.push({ type: 'error', message: 'Failed to create tag' })
      return null
    }
  }
};

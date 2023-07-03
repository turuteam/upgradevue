import { ActionTree } from 'vuex'
import { RootState } from '@/store/modules/types';
import { ShortUrlsState } from './types';

export const shortUrlsActions: ActionTree<ShortUrlsState, RootState> = {
  async FETCH_SHORT_URLS({ rootState, state, commit }, {
    taskOid,
    selectKeys = ['oid','taskOid','promoterOid','targetUrl','sysCtime', 'meta'],
  }) {
    if (!rootState.auth.account) { return null; }
    const { promoterOid } = rootState.auth.account;
    if (state.isFetchingShortUrls) { return; }

    try {
      commit('SET_IS_FETCHING_SHORT_URLS', true);
      let uri = `/promoter/${promoterOid}/short-url`;
      let filter = `taskOid=${taskOid}`;
  
      const params = {
        $select: selectKeys ? selectKeys.join(',') : null,
        $filter: filter,
      }
  
      let { data } = await this.$axios.get(uri, { params });

      commit('SET_SHORT_URLS', data)
    } catch (error) {
      console.error(error);
      this.$arNotification.push({ type: 'error', message: 'Failed to fetch short urls' });
      // throw error;
      return false;
    }
    commit('SET_IS_FETCHING_SHORT_URLS', false);
  }
};
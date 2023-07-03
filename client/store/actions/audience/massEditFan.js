import { mergeSearchStringToFanFilters } from '@/utils/filter/';

/**
 * MASS_EDIT_FAN
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 */
export async function MASS_EDIT_FAN({ state }, { fanOids, filter, searchString, editData, messageList = null, tags = null }) {
    if (!state.auth.account) { return null; }
    const { promoterOid } = state.auth.account;

    const filterDecorated = mergeSearchStringToFanFilters(filter, searchString);

    try {
      const body = {
        messageList,
        tags,
        attributes: editData,
      };
      if (fanOids) {
        body.fanOids = fanOids;
      } else {
        body.filter = filterDecorated;
      }
      await this.$axios.post(`/promoter/${promoterOid}/mass-edit-fan`, body);
    } catch (error) {
      throw error;
    }
  }

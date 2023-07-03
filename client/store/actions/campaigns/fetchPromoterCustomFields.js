/**
 * FETCH_PROMOTER_CUSTOM_FIELDS
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 */

 export async function FETCH_PROMOTER_CUSTOM_FIELDS({ commit, state }) {
    if (!state.auth.account) { return null; }
    const { promoterOid } = state.auth.account;
  
    try {
      const { data } = await this.$axios.get(
          `/promoter/${promoterOid}/custom-field/`
      );
  
      return data;
    } catch (error) {
      throw error;
    }
  }
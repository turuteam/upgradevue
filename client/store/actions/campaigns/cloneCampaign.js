/**
 * CLONE_CAMPAIGN
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @param { number } campaignOid - the event we want to duplicate
 */

export async function CLONE_CAMPAIGN({ commit, state }, campaignOid) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;
  try {
    const { data } = await this.$axios.post(
      `/promoter/${promoterOid}/campaign/${campaignOid}/clone`
    );

    return data;

  } catch (error) {
    // TODO: Notify client
  }
}

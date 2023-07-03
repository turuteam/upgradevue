/**
 * DELETE_CAMPAIGN
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @param { number } campaignOid
 */

export async function DELETE_CAMPAIGN({ state }, campaignOid) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  try {
    await this.$axios.delete(`/promoter/${promoterOid}/campaign/${campaignOid}`);

  } catch (error) {
    // TODO: Notify client
  }
}

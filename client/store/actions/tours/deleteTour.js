/**
 * DELETE_TOUR
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @param { number } tourOid
 */

export async function DELETE_TOUR({ state }, tourOid) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  try {
    await this.$axios.delete(`/promoter/${promoterOid}/tour/${tourOid}`);

  } catch (error) {
    // TODO: Notify client
  }
}

/**
 * DELETE_EVENT
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @param { number } eventOid
 */

export async function DELETE_TICKET_SALES({ state }, eventOid) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  await this.$axios.delete(`/promoter/${promoterOid}/event-ticket-sales/${eventOid}`);
}

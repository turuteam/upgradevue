/**
 * DELETE_INTEGRATION
 *
 * Delete an existing integration
 * @param { number } promoterOid
 * @param { number } integrationOid
 */
export async function DELETE_INTEGRATION({ state }, oid) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  try {
    await this.$axios.sg.delete(`/promoter/${promoterOid}/integration/${oid}`);
    return;
  } catch (e) {
    throw e;
  }
}

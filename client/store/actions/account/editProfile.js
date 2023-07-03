/**
 * EDIT_PROFILE
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @param { object } payload
 */
export async function EDIT_PROFILE(
  { state },
  data,
) {
  if (!state.auth.account) { return null; }
  const { promoterOid, oid } = state.auth.account;
  try {
    const url = `/promoter/${promoterOid}/account/${oid}`;
    // await this.$axios.patch(url, data);
  } catch (error) {
    throw error;
  }
}

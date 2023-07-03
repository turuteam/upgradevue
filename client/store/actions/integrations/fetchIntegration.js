/**
 * FETCH_INTEGRATION
 * Fetch the existing promoter's integration
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @todo Handle @throws
 */
export async function FETCH_INTEGRATION({ state }, oid) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  try {
    const { data } = await this.$axios.sg.get(`/promoter/${promoterOid}/integration/${oid}`);

    return data;
  } catch (error) {
    throw error;
  }
}
  
/**
 * FETCH_PROMOTER_ACCOUNT
 *
 * @param { object } context - Store context (state, getters, commit, dispatch)
 */
export async function FETCH_PROMOTER_ACCOUNT(
  { state, commit },
  oid
) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  let url = `/promoter/${promoterOid}/account/${oid}`;
  try {
    const { data } = await this.$axios.get(url);

    return data;

  } catch (error) {
    console.error(error);
  }
}

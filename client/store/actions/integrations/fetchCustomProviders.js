/**
 * FETCH_INTEGRATIONS
 * Fetch the existing promoter's integrations
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @todo Handle @throws
 */
export async function FETCH_CUSTOM_PROVIDERS({ state }) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  try {
    let url = `/promoter/${promoterOid}/custom-provider`;
    const { data } = await this.$axios.get(url);

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * FETCH_INTEGRATION_EVENTS
 * Fetch the existing promoter's integrations
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @todo Handle @throws
 */
export async function FETCH_INTEGRATION_EVENTS({ state }, {
  integrationOid,
  connected
}) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  try {
    let url = `/promoter/${promoterOid}/integration/${integrationOid}/events?$connected=${connected}`;

    const { data } = await this.$axios.sg.get(url);

    return data;

  } catch (error) {
    throw error;
  }
}

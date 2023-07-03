/**
 * FETCH_INTEGRATION
 * Fetch the existing promoter's integration
 *
 * @param { object } context - Store context (state, rootstate, getters, commit, dispatch)
 * @todo Handle @throws
 */
export async function FETCH_INTEGRATION_BY_APP_PROVIDER({ state }, {
  provider,
  app
}) {
  if (!state.auth.account) { return null; }
  const { promoterOid } = state.auth.account;

  try {
    let filterString = encodeURI(`app=${app} and provider=${provider}`)
    const { data } = await this.$axios.sg.get(`/promoter/${promoterOid}/integration?$filter=${filterString}`);

    // By constraints on DB table PromoterIntegration, there will only be one result
    return data[0];
  } catch (error) {
    throw error;
  }
}
